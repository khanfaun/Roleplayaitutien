

import { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: Removed `Sect` from import as it's deprecated and `InitialSect` is already imported.
import type { GameState, Player, Item, ActionOutcome, CombatState, WorldPhase, Recipe, Quest, BoardSquare, DongPhuBuilding, Rule, JournalEntry, LogEntry, HeThongQuest, ScenarioData, NguHanhType, PlayerAttributes, StatChange, BreakthroughReport, ScenarioStage, StatusEffect, MajorRealm, MinorRealm, CultivationTier, RealmQuality, InitialItem, InitialCongPhap, CombatTurnOutcome, InitialSect } from '../types';
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
import { DEMO_GAME_STATE } from '../data/demo';


const API_KEY_STORAGE_KEY = 'gemini_api_key';
const INITIAL_HETHONG_STATE = { quests: [], unlockedFeatures: [] };
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
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasLocalSave, setHasLocalSave] = useState(false);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [isRolling, setIsRolling] = useState(false);
    const [diceFace, setDiceFace] = useState(1);
    const [playerInput, setPlayerInput] = useState('');
    const [isApiKeyLoading, setIsApiKeyLoading] = useState(!DEV_MODE_SKIP_API_KEY);
    const [isRequestingApiKey, setIsRequestingApiKey] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

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
        if (!autoSaveEnabled || isDemoMode) return;
        try {
            const stateToSave = { ...gameState, breakthroughReport: null };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
            setHasLocalSave(true);
        } catch (error) {
            console.error("Failed to save game state to local storage", error);
        }
    }, [gameState, autoSaveEnabled, isDemoMode]);

    // --- EFFECTS ---
    useEffect(() => {
        if (!isDemoMode) {
            const savedGame = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedGame) setHasLocalSave(true);
        }
    }, [isDemoMode]);

    useEffect(() => {
        if (isInitialized) saveGameStateToLocal();
    }, [gameState, isInitialized, saveGameStateToLocal]);
    
    // --- API & SESSION MANAGEMENT ---
    const goHome = useCallback(() => {
        // Save game state before exiting to home, unless in demo mode
        if (!isDemoMode && isInitialized) {
            try {
                const stateToSave = { ...gameState, breakthroughReport: null };
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
                setHasLocalSave(true);
                addLogEntry({ type: 'system', content: 'Tiến trình đã được lưu.' });
            } catch (error) {
                console.error("Failed to save game state on exit to home:", error);
                addLogEntry({ type: 'system', content: 'Lỗi: Không thể lưu tiến trình.' });
            }
        }

        setIsInitialized(false);
        setIsDemoMode(false);
        setIsRequestingApiKey(false);
        setGameState(applyCustomThienThu(JSON.parse(JSON.stringify(INITIAL_GAME_STATE))));
        // No longer removing the local storage item.
    }, [isDemoMode, isInitialized, gameState, addLogEntry]);


    useEffect(() => {
        if (!DEV_MODE_SKIP_API_KEY && !isDemoMode) {
            checkStoredApiKeyLogic({ setIsApiReady, setIsApiKeyLoading });
        }
    }, [isDemoMode]);

    const handleApiKeySubmit = useCallback((key: string) => {
        setIsRequestingApiKey(false);
        handleApiKeySubmitLogic(key, { setIsApiReady });
        addLogEntry({ type: 'system', content: 'Đã cập nhật API Key. Vui lòng thử lại hành động trước đó.' });
    }, [addLogEntry]);

    const clearApiKey = useCallback(() => {
        clearApiKeyLogic({ goHome, setIsApiReady });
    }, [goHome]);

    const handleApiError = useCallback((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("API Key") || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("permission denied")) {
            clearApiKeyLogic({ setIsApiReady });
            setIsRequestingApiKey(true);
        }
        setGameState(prev => ({ ...prev, isLoading: false }));
        // The original caller will handle logging the error.
        throw error;
    }, [setIsApiReady]);


    const initializeGame = useCallback(async ({ setupData, isRestart }: { setupData?: ScenarioData, isRestart?: boolean }) => {
        setGameState(prev => ({ ...prev, isLoading: true }));
        try {
            await initializeGameLogic(
                { setupData, isRestart },
                { setGameState, goHome, addLogEntry, updatePlayerStatsForCultivation, applyCustomThienThu, setIsInitialized }
            );
        } catch (error) {
            handleApiError(error);
            addLogEntry({ type: 'system', content: `Lỗi khởi tạo game: ${error instanceof Error ? error.message : String(error)}` });
        } finally {
            setGameState(prev => ({ ...prev, isLoading: false }));
        }
    }, [goHome, addLogEntry, handleApiError]);

    const startDemoMode = useCallback(() => {
        setIsDemoMode(true);
        setIsApiReady(true); // Bypass key screen
        setGameState(prev => ({...prev, ...DEMO_GAME_STATE}));
        setIsInitialized(true);
        addLogEntry({ type: 'system', content: 'Chào mừng đến với bản chơi thử!' });
    }, [addLogEntry]);

    const continueGame = useCallback(() => {
        continueGameLogic({ setGameState, applyCustomThienThu, setIsInitialized });
    }, []);
    
    // --- ACTION PROCESSING ---
    const processActionOutcome = useCallback((outcome: ActionOutcome) => {
        setGameState(prev => processActionOutcomeReducer(prev, outcome, { findRealmDetails, updatePlayerStatsForCultivation, calculateStatChanges }));
    }, []);
    
    const processCombatTurnOutcome = useCallback((outcome: CombatTurnOutcome) => {
        setGameState(prev => processCombatTurnOutcomeReducer(prev, outcome, { addLogEntry }));
    }, [addLogEntry]);
    
    // --- GAME CONTROLLERS ---
    const handleDiceRoll = useCallback(async () => {
        if (isDemoMode) {
            addLogEntry({ type: 'dice_roll', content: 'Bạn gieo được 6 điểm. Vận mệnh đưa đẩy đến ô Kỳ Ngộ.' });
            addLogEntry({ type: 'ai_story', content: 'Trong bản chơi thử, mọi con đường đều dẫn đến kỳ ngộ! Bạn nhận được một viên Linh Thạch Hạ Phẩm.' });
            setGameState(prev => ({
                ...prev,
                inventory: [...prev.inventory, { id: 'demo_item_1', name: 'Linh Thạch Hạ Phẩm', description: 'Đá chứa linh khí', category: 'Vật phẩm' }],
                currentEvent: DEMO_GAME_STATE.currentEvent
            }));
            return;
        }
        try {
            await handleDiceRollLogic(
                { gameState },
                { setIsRolling, setGameState, setDiceFace, addLogEntry, processActionOutcome }
            );
        } catch(error) {
            handleApiError(error);
            addLogEntry({ type: 'system', content: `Lỗi gieo vận mệnh: ${error instanceof Error ? error.message : String(error)}` });
        }
    }, [gameState, addLogEntry, processActionOutcome, isDemoMode, handleApiError]);
    
    const handlePlayerAction = useCallback(async (action: string, source: 'suggestion' | 'input') => {
        if (isDemoMode) {
            addLogEntry({ type: 'player_choice', content: action });
            addLogEntry({ type: 'system', content: 'Đây là bản chơi thử. Các lựa chọn sẽ dẫn đến cùng một kết quả tiếp theo.' });
            setGameState(prev => ({ ...prev, currentEvent: DEMO_GAME_STATE.currentEvent, gameLog: [...prev.gameLog, DEMO_GAME_STATE.gameLog[1]] }));
            return;
        }
        try {
            await handlePlayerActionLogic(
                action,
                source,
                { gameState },
                { setGameState, addLogEntry, setPlayerInput, processCombatTurnOutcome, processActionOutcome }
            );
        } catch (error) {
            handleApiError(error);
            addLogEntry({ type: 'system', content: `Lỗi thực hiện hành động: ${error instanceof Error ? error.message : String(error)}` });
        }
    }, [gameState, addLogEntry, processCombatTurnOutcome, processActionOutcome, isDemoMode, handleApiError]);

    const triggerManualBreakthrough = useCallback(async () => {
        try {
            await triggerManualBreakthroughLogic(
                { gameState },
                { setGameState, addLogEntry }
            );
        } catch (error) {
            handleApiError(error);
            addLogEntry({ type: 'system', content: `Lỗi đột phá: ${error instanceof Error ? error.message : String(error)}` });
        }
    }, [gameState, addLogEntry, handleApiError]);

    // --- UI HANDLERS (Simple wrappers) ---
    const handleSaveGame = useCallback(() => {
        if (isDemoMode) {
            alert("Không thể lưu trong chế độ chơi thử.");
            return;
        }
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
    }, [gameState, isDemoMode]);

    const handleLoadGame = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const loadedState: Partial<GameState> = JSON.parse(text);
                    
                    // Sanitize scenario stages to ensure `completed` property exists.
                    if (loadedState.scenarioStages) {
                        loadedState.scenarioStages = loadedState.scenarioStages.map(s => ({
                            ...s,
                            completed: s.completed || false
                        }));
                    }

                    let finalState: GameState = { ...INITIAL_GAME_STATE, ...loadedState, player: { ...INITIAL_GAME_STATE.player, ...(loadedState.player || {}) }, dongPhu: { ...INITIAL_GAME_STATE.dongPhu, ...(loadedState.dongPhu || {}) }, heThong: { ...INITIAL_GAME_STATE.heThong, ...(loadedState.heThong || {}) }, thienThu: { ...INITIAL_GAME_STATE.thienThu, ...(loadedState.thienThu || {}) }, worldData: { ...INITIAL_GAME_STATE.worldData, ...(loadedState.worldData || {}) } };
                    finalState = applyCustomThienThu(finalState);
                    setGameState(finalState);
                    setIsDemoMode(false); // Loading a real game exits demo mode
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
    const handlePlayerImageChange = useCallback((imageId: string) => {
        setGameState(prev => ({ ...prev, player: { ...prev.player, imageId: imageId } }));
    }, []);
    const handleRulesChange = useCallback((type: 'thienDao' | 'ai' | 'coreMemory', newRules: Rule[]) => {
        if (type === 'thienDao') setGameState(prev => ({...prev, thienDaoRules: newRules}));
        else if (type === 'ai') setGameState(prev => ({...prev, aiRules: newRules}));
        else setGameState(prev => ({...prev, coreMemoryRules: newRules}));
    }, []);
    const handleJournalEntriesChange = useCallback((newJournal: JournalEntry[]) => setGameState(prev => ({...prev, journal: newJournal})), []);
    const handleScenarioUpdate = useCallback((updates: { summary?: string, stages?: ScenarioStage[] }) => {
        setGameState(prev => ({ ...prev, scenarioSummary: updates.summary ?? prev.scenarioSummary, scenarioStages: updates.stages ? updates.stages.map(s => ({...s, completed: s.completed || false})) : prev.scenarioStages }));
    }, []);
    const handleScenarioStageChange = useCallback((stageId: string, completed: boolean) => {
        setGameState(prev => ({
            ...prev,
            scenarioStages: prev.scenarioStages.map(s => s.id === stageId ? { ...s, completed } : s)
        }));
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
        isApiKeyLoading,
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
        handlePlayerImageChange,
        handleRulesChange,
        handleJournalEntriesChange,
        handleScenarioUpdate,
        handleScenarioStageChange,
        handleItemImageChange,
        handleThienThuItemImageChange,
        setCurrentMapViewId,
        goHome,
        isRequestingApiKey,
        isDemoMode,
        startDemoMode
    };
};