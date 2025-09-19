import { useState, useEffect, useCallback, useMemo } from 'react';
import type { GameState, Player, Item, ActionOutcome, CombatState, WorldPhase, Recipe, Quest, BoardSquare, DongPhuBuilding, Sect, Rule, JournalEntry, LogEntry, HeThongQuest, ScenarioData, NguHanhType, PlayerAttributes, StatChange, BreakthroughReport, ScenarioStage, StatusEffect, MajorRealm, MinorRealm, CultivationTier, RealmQuality, InitialItem, InitialCongPhap, CombatTurnOutcome, InitialSect } from '../types';
import { INITIAL_PLAYER_STATS, BOARD_SIZE, PLAYER_NAME, INITIAL_RECIPES, INITIAL_DONG_PHU_STATE, INITIAL_AI_RULES, INITIAL_THIEN_DAO_RULES, FULL_CONTEXT_REFRESH_CYCLE, CULTIVATION_SYSTEM, INITIAL_CORE_MEMORY_RULES } from '../constants';
import { STATUS_EFFECT_DEFINITIONS, DESTINY_DEFINITIONS, ALL_ITEM_EFFECT_DEFINITIONS } from '../data/effects';
import { THIEN_THU_VAT_PHAM_TIEU_HAO, THIEN_THU_TRANG_BI, THIEN_THU_PHAP_BAO, THIEN_THU_CONG_PHAP } from '../data/thienThu';
import * as geminiService from '../services/geminiService';
import { initializeGameLogic, continueGameLogic } from './gameLogic/gameFlow';
import { handleApiKeySubmitLogic, clearApiKeyLogic, checkStoredApiKeyLogic } from './gameLogic/apiKeyHandler';
import { handleDiceRollLogic, handlePlayerActionLogic, triggerManualBreakthroughLogic } from './gameLogic/gameController';
import { processActionOutcomeReducer, processCombatTurnOutcomeReducer } from './gameLogic/actionProcessors';
import { findRealmDetails, calculateStatChanges, updatePlayerStatsForCultivation } from './gameLogic/cultivation';
import { DEV_MODE_SKIP_API_KEY } from '../devConfig';


const API_KEY_STORAGE_KEY = 'gemini_api_key';
const INITIAL_HETHONG_STATE = { quests: [] };
const INITIAL_GAME_STATE: GameState = {
    player: INITIAL_PLAYER_STATS,
    inventory: [],
    quests: [],
    board: [],
    currentEvent: null,
    gameLog: [{ type: 'system', content: "Chào mừng đến với Phi Thăng Bí Sử!"}],
    mapLevel: 1,
    isLoading: false,
    isDead: false,
    tribulationEvent: null,
    combatState: null,
    worldPhase: null,
    recipes: INITIAL_RECIPES,
    diceRolls: 0,
    turnCounter: 0,
    dongPhu: INITIAL_DONG_PHU_STATE,
    thienDaoRules: INITIAL_THIEN_DAO_RULES,
    aiRules: INITIAL_AI_RULES,
    coreMemoryRules: INITIAL_CORE_MEMORY_RULES,
    journal: [],
    shortTermMemory: [],
    turnInCycle: 0,
    heThong: INITIAL_HETHONG_STATE,
    isAtBottleneck: false,
    breakthroughReport: null,
    scenarioSummary: '',
    scenarioStages: [],
    isThienMenhBanActive: false,
    cultivationSystem: JSON.parse(JSON.stringify(CULTIVATION_SYSTEM)),
    thienThu: {
        vatPhamTieuHao: JSON.parse(JSON.stringify(THIEN_THU_VAT_PHAM_TIEU_HAO)),
        trangBi: JSON.parse(JSON.stringify(THIEN_THU_TRANG_BI)),
        phapBao: JSON.parse(JSON.stringify(THIEN_THU_PHAP_BAO)),
        congPhap: JSON.parse(JSON.stringify(THIEN_THU_CONG_PHAP)),
        tienThienKhiVan: Object.values(JSON.parse(JSON.stringify(DESTINY_DEFINITIONS))),
        hieuUng: Object.values(JSON.parse(JSON.stringify(ALL_ITEM_EFFECT_DEFINITIONS))),
        trangThai: Object.values(JSON.parse(JSON.stringify(STATUS_EFFECT_DEFINITIONS))),
    },
    worldData: {
        worldLocations: [],
        initialSects: [],
        initialNpcs: [],
    },
    inGameNpcs: [],
    // FIX: Add missing 'discoveredEntityIds' property to satisfy the GameState type.
    discoveredEntityIds: {
        locations: [],
        sects: [],
        npcs: [],
    },
    currentMapViewId: null,
};

const LOCAL_STORAGE_KEY = 'tienLomMenhMongSave';
const CUSTOM_THIENTHU_KEY = 'customThienThuItems';

const applyCustomThienThu = (state: GameState): GameState => {
    try {
        const customThienThuJSON = localStorage.getItem(CUSTOM_THIENTHU_KEY);
        if (customThienThuJSON) {
            const customData = JSON.parse(customThienThuJSON);
            const newThienThu = { ...state.thienThu };
            let updated = false;
            if (customData.vatPhamTieuHao) { newThienThu.vatPhamTieuHao = customData.vatPhamTieuHao; updated = true; }
            if (customData.trangBi) { newThienThu.trangBi = customData.trangBi; updated = true; }
            if (customData.phapBao) { newThienThu.phapBao = customData.phapBao; updated = true; }
            if (customData.congPhap) { newThienThu.congPhap = customData.congPhap; updated = true; }
            if(updated) {
                 console.log("Đã áp dụng dữ liệu Thiên Thư tùy chỉnh.");
                 return { ...state, thienThu: newThienThu };
            }
        }
    } catch (e) {
        console.error("Lỗi khi áp dụng dữ liệu Thiên Thư tùy chỉnh:", e);
    }
    return state;
};

export const useGameLogic = () => {
    // --- STATE MANAGEMENT ---
    const [gameState, setGameState] = useState<GameState>(() => applyCustomThienThu(JSON.parse(JSON.stringify(INITIAL_GAME_STATE))));
    const [isApiReady, setIsApiReady] = useState(DEV_MODE_SKIP_API_KEY);
    const [apiValidationError, setApiValidationError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasLocalSave, setHasLocalSave] = useState(false);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [isRolling, setIsRolling] = useState(false);
    const [diceFace, setDiceFace] = useState(1);
    const [playerInput, setPlayerInput] = useState('');
    const [apiValidationSuccess, setApiValidationSuccess] = useState(false);
    const [isApiKeyLoading, setIsApiKeyLoading] = useState(!DEV_MODE_SKIP_API_KEY);

    // --- MEMOIZED SELECTORS ---
    const playerBaseStats = useMemo(() => {
        const baseAttributes = { ...INITIAL_PLAYER_STATS.attributes };
        const basePrimary = { 
            maxHp: INITIAL_PLAYER_STATS.maxHp, 
            maxExp: INITIAL_PLAYER_STATS.maxExp,
            maxSpiritPower: INITIAL_PLAYER_STATS.maxSpiritPower, 
            maxStamina: INITIAL_PLAYER_STATS.maxStamina, 
            maxMentalState: INITIAL_PLAYER_STATS.maxMentalState,
        };

        gameState.player.selectedDestinyIds.forEach(id => {
            const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
            if (destiny?.effects?.attributeChange) {
                for (const [key, value] of Object.entries(destiny.effects.attributeChange)) {
                    if (value !== undefined) baseAttributes[key as keyof PlayerAttributes] += value;
                }
            }
            if(destiny?.effects?.primaryStatChange) {
                for (const [key, value] of Object.entries(destiny.effects.primaryStatChange)) {
                     if (value !== undefined && key in basePrimary) {
                        (basePrimary as any)[key] += value;
                     }
                }
            }
        });
        
        return { main: basePrimary, sub: baseAttributes };
    }, [gameState.player.selectedDestinyIds]);

    const inventoryCounts = useMemo(() => {
        return gameState.inventory.reduce((acc, item) => {
            acc[item.name] = (acc[item.name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [gameState.inventory]);

    const groupedConsumableItems = useMemo(() => {
        const consumableMap = new Map<string, { item: Item; quantity: number }>();
        gameState.inventory
            .filter(i => i.category === 'Vật phẩm' || i.category === 'Linh dược' || i.category === 'Khoáng thạch' || i.category === 'Vật phẩm Hệ thống')
            .forEach(item => {
                const existing = consumableMap.get(item.name);
                if (existing) {
                    existing.quantity++;
                } else {
                    consumableMap.set(item.name, { item: { ...item }, quantity: 1 });
                }
            });
        return Array.from(consumableMap.values());
    }, [gameState.inventory]);

    const equipmentItems = useMemo(() => {
        return gameState.inventory.filter(i => i.category === 'Trang bị' || i.category === 'Pháp bảo');
    }, [gameState.inventory]);

    const techniqueItems = useMemo(() => {
        return gameState.inventory.filter(i => i.category === 'Công pháp');
    }, [gameState.inventory]);

    // --- CORE CALLBACKS ---
    const addLogEntry = useCallback((entry: LogEntry) => {
        setGameState(prev => ({
            ...prev,
            gameLog: [...prev.gameLog, entry].slice(-100) // Keep last 100 entries
        }));
    }, []);

    const saveGameStateToLocal = useCallback(() => {
        if (!autoSaveEnabled) return;
        try {
            const stateToSave = { ...gameState, breakthroughReport: null };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
            setHasLocalSave(true);
        } catch (error) {
            console.error("Failed to save game state to local storage", error);
        }
    }, [gameState, autoSaveEnabled]);

    // --- EFFECTS ---
    useEffect(() => {
        const savedGame = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedGame) setHasLocalSave(true);
    }, []);

    useEffect(() => {
        if (isInitialized) saveGameStateToLocal();
    }, [gameState, isInitialized, saveGameStateToLocal]);
    
    // --- API & SESSION MANAGEMENT ---
    const goHome = useCallback(() => {
        setIsInitialized(false);
        setGameState(applyCustomThienThu(JSON.parse(JSON.stringify(INITIAL_GAME_STATE))));
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setHasLocalSave(false);
    }, []);

    useEffect(() => {
        if (!DEV_MODE_SKIP_API_KEY) {
            checkStoredApiKeyLogic({ setIsApiReady, setIsApiKeyLoading });
        }
    }, []);

    const handleApiKeySubmit = useCallback(async (key: string) => {
        await handleApiKeySubmitLogic(key, { setApiValidationError, setIsApiKeyLoading, setApiValidationSuccess, setIsApiReady });
    }, []);

    const clearApiKey = useCallback(() => {
        clearApiKeyLogic({ goHome, setIsApiReady });
    }, [goHome]);

    const initializeGame = useCallback(async ({ setupData, isRestart }: { setupData?: ScenarioData, isRestart?: boolean }) => {
        await initializeGameLogic(
            { setupData, isRestart },
            { setGameState, goHome, addLogEntry, updatePlayerStatsForCultivation, applyCustomThienThu, setIsInitialized }
        );
    }, [goHome, addLogEntry]);

    const continueGame = useCallback(() => {
        continueGameLogic({ setGameState, applyCustomThienThu, setIsInitialized });
    }, []);
    
    // --- ACTION PROCESSING ---
    const processActionOutcome = useCallback((outcome: ActionOutcome) => {
        setGameState(prev => processActionOutcomeReducer(prev, outcome, { addLogEntry, findRealmDetails, updatePlayerStatsForCultivation, calculateStatChanges }));
    }, [addLogEntry]);
    
    const processCombatTurnOutcome = useCallback((outcome: CombatTurnOutcome) => {
        setGameState(prev => processCombatTurnOutcomeReducer(prev, outcome, { addLogEntry }));
    }, [addLogEntry]);
    
    // --- GAME CONTROLLERS ---
    const handleDiceRoll = useCallback(async () => {
        await handleDiceRollLogic(
            { gameState },
            { setIsRolling, setGameState, setDiceFace, addLogEntry, processActionOutcome }
        );
    }, [gameState, addLogEntry, processActionOutcome]);
    
    const handlePlayerAction = useCallback(async (action: string, source: 'suggestion' | 'input') => {
        await handlePlayerActionLogic(
            action,
            source,
            { gameState },
            { setGameState, addLogEntry, setPlayerInput, processCombatTurnOutcome, processActionOutcome }
        );
    }, [gameState, addLogEntry, processCombatTurnOutcome, processActionOutcome]);

    const triggerManualBreakthrough = useCallback(async () => {
        await triggerManualBreakthroughLogic(
            { gameState },
            { setGameState, addLogEntry }
        );
    }, [gameState, addLogEntry]);

    // --- UI HANDLERS (Simple wrappers) ---
    const handleSaveGame = useCallback(() => {
        const stateToSave = { ...gameState, breakthroughReport: null };
        const jsonString = JSON.stringify(stateToSave, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `TienLoMenhMong_Save_${Date.now()}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [gameState]);

    const handleLoadGame = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const loadedState: Partial<GameState> = JSON.parse(text);
                    let finalState: GameState = { ...INITIAL_GAME_STATE, ...loadedState, player: { ...INITIAL_GAME_STATE.player, ...(loadedState.player || {}) }, dongPhu: { ...INITIAL_GAME_STATE.dongPhu, ...(loadedState.dongPhu || {}) }, heThong: { ...INITIAL_GAME_STATE.heThong, ...(loadedState.heThong || {}) }, thienThu: { ...INITIAL_GAME_STATE.thienThu, ...(loadedState.thienThu || {}) }, worldData: { ...INITIAL_GAME_STATE.worldData, ...(loadedState.worldData || {}) } };
                    finalState = applyCustomThienThu(finalState);
                    setGameState(finalState);
                    setIsInitialized(true);
                }
            } catch (error) {
                addLogEntry({type: 'system', content: `Lỗi tải file game: ${error instanceof Error ? error.message : String(error)}`});
            }
        };
        reader.readAsText(file);
    }, [addLogEntry]);

    const handleUpgradeBuilding = useCallback((building: DongPhuBuilding) => handlePlayerAction(`Nâng cấp ${building.name} lên cấp ${building.level + 1}`, 'suggestion'), [handlePlayerAction]);
    const handleCraftItem = useCallback((recipe: Recipe) => handlePlayerAction(`Luyện chế ${recipe.name}`, 'suggestion'), [handlePlayerAction]);
    const handleEquipItem = useCallback((item: Item) => {
        const isEquipped = gameState.player.equippedTechniqueId === item.id || gameState.player.equippedTreasureId === item.id;
        handlePlayerAction(isEquipped ? `Gỡ bỏ ${item.name}` : `Trang bị ${item.name}`, 'suggestion');
    }, [gameState.player, handlePlayerAction]);
    const handleUseItem = useCallback((item: Item, quantity: number) => handlePlayerAction(`Sử dụng ${quantity} ${item.name}`, 'suggestion'), [handlePlayerAction]);
    const handleLeaveSect = useCallback(() => {
        if (window.confirm('Bạn có chắc muốn rời khỏi môn phái? Hành động này không thể hoàn tác và có thể gây ra hậu quả.')) {
            handlePlayerAction('Chủ động rời khỏi môn phái', 'suggestion');
        }
    }, [handlePlayerAction]);

    const clearBreakthroughReport = useCallback(() => setGameState(prev => ({ ...prev, breakthroughReport: null })), []);
    const handlePlayerNameChange = useCallback((newName: string) => setGameState(prev => ({...prev, player: {...prev.player, name: newName}})), []);
    const handleRulesChange = useCallback((type: 'thienDao' | 'ai' | 'coreMemory', newRules: Rule[]) => {
        if (type === 'thienDao') setGameState(prev => ({...prev, thienDaoRules: newRules}));
        else if (type === 'ai') setGameState(prev => ({...prev, aiRules: newRules}));
        else setGameState(prev => ({...prev, coreMemoryRules: newRules}));
    }, []);
    const handleJournalEntriesChange = useCallback((newJournal: JournalEntry[]) => setGameState(prev => ({...prev, journal: newJournal})), []);
    const handleScenarioUpdate = useCallback((updates: { summary?: string, stages?: ScenarioStage[] }) => {
        setGameState(prev => ({ ...prev, scenarioSummary: updates.summary ?? prev.scenarioSummary, scenarioStages: updates.stages ?? prev.scenarioStages }));
    }, []);
    const handleItemImageChange = useCallback((itemId: string, imageId: string) => {
        setGameState(prev => ({ ...prev, inventory: prev.inventory.map(item => item.id === itemId ? { ...item, imageId: imageId } : item) }));
    }, []);
    const handleThienThuItemImageChange = useCallback((itemType: 'vatPhamTieuHao' | 'trangBi' | 'phapBao' | 'congPhap', itemId: string, imageId: string) => {
        setGameState(prev => {
            const newThienThu = JSON.parse(JSON.stringify(prev.thienThu));
            const items = newThienThu[itemType] as (InitialItem | InitialCongPhap)[];
            const itemDefinition = items.find(i => i.id === itemId);
            if (!itemDefinition) return prev;
            itemDefinition.imageId = imageId;
            const newInventory = prev.inventory.map(invItem => invItem.id.startsWith(itemId + '_') ? { ...invItem, imageId: imageId } : invItem);
            return { ...prev, thienThu: newThienThu, inventory: newInventory };
        });
    }, []);
    const setCurrentMapViewId = useCallback((id: string | null) => setGameState(prev => ({ ...prev, currentMapViewId: id })), []);


    return {
        gameState,
        isApiReady,
        apiValidationError,
        isApiKeyLoading,
        apiValidationSuccess,
        handleApiKeySubmit,
        clearApiKey,
        isInitialized,
        hasLocalSave,
        autoSaveEnabled,
        setAutoSave: setAutoSaveEnabled,
        isRolling,
        diceFace,
        playerInput,
        setPlayerInput,
        playerBaseStats,
        initializeGame,
        continueGame,
        handleDiceRoll,
        handlePlayerAction,
        handleSaveGame,
        handleLoadGame,
        handleUpgradeBuilding,
        handleCraftItem,
        handleEquipItem,
        handleUseItem,
        handleLeaveSect,
        inventoryCounts,
        groupedConsumableItems,
        equipmentItems,
        techniqueItems,
        triggerManualBreakthrough,
        clearBreakthroughReport,
        handlePlayerNameChange,
        handleRulesChange,
        handleJournalEntriesChange,
        handleScenarioUpdate,
        handleItemImageChange,
        handleThienThuItemImageChange,
        setCurrentMapViewId,
        goHome
    };
};