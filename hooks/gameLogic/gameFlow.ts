

import * as geminiService from '../../services/geminiService';
import type { GameState, ScenarioData, Player, Item, InitialItem, InitialCongPhap, NguHanhType, CultivationTier, NpcCharacter, WorldLocation, InitialSect } from '../../types';
import { PLAYER_NAME, INITIAL_PLAYER_STATS } from '../../constants';
import { calculateNpcStats } from '../../utils/npcCalculations';
// FIX: Import types directly from 'react' to resolve 'React' namespace errors.
import type { Dispatch, SetStateAction } from 'react';

// --- Dependencies for this module ---
type Setters = {
    setGameState: Dispatch<SetStateAction<GameState>>;
    setIsInitialized: Dispatch<SetStateAction<boolean>>;
};

type Callbacks = {
    goHome: () => void;
    addLogEntry: (entry: any) => void;
    updatePlayerStatsForCultivation: (playerState: Player, system: CultivationTier[], newStageId: string, newQualityId: string | null) => Player;
    applyCustomThienThu: (state: GameState) => GameState;
};

const buildLocationPath = (locationId: string | null, allLocations: WorldLocation[]): WorldLocation[] => {
    if (!locationId) return [];
    const path: WorldLocation[] = [];
    let current = allLocations.find(l => l.id === locationId);
    while (current) {
        path.unshift(current);
        current = allLocations.find(l => l.id === current.parentId);
    }
    return path;
};

// --- Logic Implementations ---

export const initializeGameLogic = async (
    { setupData, isRestart }: { setupData?: ScenarioData, isRestart?: boolean },
    deps: Setters & Callbacks
) => {
    const { setGameState, goHome, addLogEntry, updatePlayerStatsForCultivation, applyCustomThienThu, setIsInitialized } = deps;
    
    setGameState(prev => ({ ...prev, isLoading: true }));
    try {
        if (isRestart) {
            goHome();
            return;
        }
        if (!setupData) throw new Error("Không có dữ liệu kịch bản để bắt đầu.");

        const scenario = await geminiService.generateScenario(setupData);
        const selectedSect = setupData.playerSectId ? setupData.initialSects.find(s => s.id === setupData.playerSectId) : null;

        let initialPlayer: Player = {
            ...INITIAL_PLAYER_STATS,
            name: setupData.playerName || PLAYER_NAME,
            age: setupData.playerAge || 16,
            linhCan: `${setupData.linhCanQuality} linh căn`,
            nguHanh: (Object.keys(setupData.nguHanh) as NguHanhType[]).filter(key => setupData.nguHanh[key] > 0).map(key => `${key.charAt(0).toUpperCase() + key.slice(1)} (${setupData.nguHanh[key] * 20}%)`).join(', ') || 'Không có',
            difficulty: setupData.difficulty,
            selectedDestinyIds: setupData.selectedDestinyIds,
            heThongStatus: setupData.enableHeThong ? 'inactive' : 'disabled',
            sect: selectedSect ? selectedSect.name : null,
            sectRank: selectedSect ? setupData.playerSectRank : null,
            currentLocationId: setupData.startingLocationId || '',
        };
        
        const findFirstMinorRealmId = (system: CultivationTier[]): string | undefined => {
            const phamNhanTier = system.find(t => t.id === 'pham_nhan_tier_0');
            if (phamNhanTier) return phamNhanTier.realms[0]?.minorRealms[0]?.id;
            const sortedTiers = [...system].sort((a,b) => a.rank - b.rank);
            for (const tier of sortedTiers) {
                const sortedRealms = [...tier.realms].sort((a,b) => a.rank - b.rank);
                for (const major of sortedRealms) {
                    const firstVisibleMinor = [...major.minorRealms].sort((a,b) => a.rank - b.rank).find(m => !m.isHidden);
                    if (firstVisibleMinor) return firstVisibleMinor.id;
                }
            }
            return undefined;
        };

        const defaultFirstStageId = findFirstMinorRealmId(setupData.cultivationSystem);
        const startingStageId = setupData.startingCultivationStageId || defaultFirstStageId;

        if (startingStageId) {
            initialPlayer = updatePlayerStatsForCultivation(initialPlayer, setupData.cultivationSystem, startingStageId, null);
        } else {
            initialPlayer.cultivationStage = "Phàm Nhân";
            initialPlayer.cultivationStageId = 'pham_nhan_realm_0_minor_0';
        }
        initialPlayer.exp = 0;

        const initialInventory: Item[] = [];
        const allInitialItems: (InitialItem | InitialCongPhap)[] = [...setupData.initialItems, ...setupData.initialTrangBi, ...setupData.initialPhapBao, ...setupData.initialCongPhap];
        
        for (const initItem of allInitialItems) {
            for(let i = 0; i < ('quantity' in initItem ? initItem.quantity : 1); i++) {
                const item: Item = { id: `${initItem.id}_${i}`, name: initItem.name, description: initItem.description, category: 'techniqueType' in initItem ? 'Công pháp' : initItem.itemType === 'Tiêu hao' || initItem.itemType === 'Khác' ? 'Vật phẩm' : initItem.itemType, attributes: initItem.attributes, effectIds: initItem.effectIds, rank: initItem.rank, expPerTurn: initItem.expPerTurn, nguHanhAttribute: initItem.nguHanhAttribute, imageId: initItem.imageId };
                if ('equipmentType' in initItem) item.equipmentType = initItem.equipmentType;
                initialInventory.push(item);
            }
        }

        const inGameNpcs: NpcCharacter[] = [];
        if (setupData.initialNpcs) {
            for (const npc of setupData.initialNpcs) {
                const npcCharacter = calculateNpcStats(npc, setupData.cultivationSystem, setupData.difficulty);
                npcCharacter.currentLocationId = npc.initialLocationId || '';
                if(npc.sectId) {
                    const sect = setupData.initialSects.find(s => s.id === npc.sectId);
                    if (sect) npcCharacter.sect = sect.name;
                }
                inGameNpcs.push(npcCharacter);
            }
        }
        
        const initialDiscoveredIds = {
            locations: [setupData.startingLocationId || ''].filter(Boolean),
            sects: [setupData.playerSectId || ''].filter(Boolean),
            npcs: setupData.initialNpcs.map(npc => npc.id)
        };
        if (setupData.startingLocationId) {
            const path = buildLocationPath(setupData.startingLocationId, setupData.worldLocations);
            path.forEach(loc => initialDiscoveredIds.locations.push(loc.id));
        }
        initialDiscoveredIds.locations = [...new Set(initialDiscoveredIds.locations)];

        setGameState(prev => {
            const initialState = applyCustomThienThu(JSON.parse(JSON.stringify({ ...prev })));
            const initialJournalEntry = { id: `j_${Date.now()}`, turn: 0, text: scenario.journalEntry };
            return {
                ...initialState,
                player: initialPlayer,
                inventory: initialInventory,
                board: scenario.board,
                quests: [{...scenario.initialQuest, id: `q_${Date.now()}`, status: 'Đang tiến hành'}],
                currentEvent: scenario.initialEvent,
                worldPhase: {...scenario.worldPhase, turnsRemaining: 100 },
                gameLog: [ { type: 'system', content: "Chào mừng đến với Phi Thăng Bí Sử!" }, { type: 'ai_story', content: scenario.story } ],
                journal: [initialJournalEntry],
                shortTermMemory: [initialJournalEntry],
                thienDaoRules: setupData.thienDaoRules,
                coreMemoryRules: setupData.coreMemoryRules,
                scenarioSummary: setupData.scenarioSummary,
                scenarioStages: setupData.scenarioStages,
                cultivationSystem: setupData.cultivationSystem,
                worldData: { worldLocations: setupData.worldLocations, initialSects: setupData.initialSects, initialNpcs: setupData.initialNpcs },
                inGameNpcs,
                discoveredEntityIds: initialDiscoveredIds,
                currentMapViewId: null,
            };
        });
        setIsInitialized(true);
    } catch (error) {
        console.error("Failed to initialize game:", error);
        addLogEntry({type: 'system', content: `Lỗi khởi tạo game: ${error instanceof Error ? error.message : String(error)}`});
        goHome();
    } finally {
        setGameState(prev => ({ ...prev, isLoading: false }));
    }
};

export const continueGameLogic = (deps: Setters & Pick<Callbacks, 'applyCustomThienThu'>) => {
    const { setGameState, applyCustomThienThu, setIsInitialized } = deps;
    const LOCAL_STORAGE_KEY = 'tienLomMenhMongSave';
    const savedGame = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedGame) {
        try {
            const loadedState: Partial<GameState> = JSON.parse(savedGame);
            setGameState(prev => {
                let finalState: GameState = { ...prev, ...loadedState, player: { ...prev.player, ...(loadedState.player || {}) }, dongPhu: { ...prev.dongPhu, ...(loadedState.dongPhu || {}) }, heThong: { ...prev.heThong, ...(loadedState.heThong || {}) }, thienThu: { ...prev.thienThu, ...(loadedState.thienThu || {}) }, worldData: { ...prev.worldData, ...(loadedState.worldData || {}) } };
                return applyCustomThienThu(finalState);
            });
            setIsInitialized(true);
        } catch (error) {
            console.error("Failed to load game from local storage", error);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }
};