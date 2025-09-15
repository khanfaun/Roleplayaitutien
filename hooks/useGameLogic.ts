
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { GameState, Player, Item, ActionOutcome, CombatState, WorldPhase, Recipe, Quest, BoardSquare, DongPhuBuilding, Sect, Rule, JournalEntry, LogEntry, HeThongQuest, ScenarioData, NguHanhType, PlayerAttributes, StatChange, BreakthroughReport, ScenarioStage, StatusEffect, MajorRealm, MinorRealm, CultivationTier, RealmQuality, InitialItem, InitialCongPhap, CombatTurnOutcome } from '../types';
import { INITIAL_PLAYER_STATS, BOARD_SIZE, PLAYER_NAME, WORLD_PHASE_NAMES, INITIAL_RECIPES, INITIAL_DONG_PHU_STATE, INITIAL_AI_RULES, INITIAL_THIEN_DAO_RULES, FULL_CONTEXT_REFRESH_CYCLE, CULTIVATION_SYSTEM, PLAYER_ATTRIBUTE_NAMES, INITIAL_CORE_MEMORY_RULES } from '../constants';
import { STATUS_EFFECT_DEFINITIONS, DESTINY_DEFINITIONS, ALL_ITEM_EFFECT_DEFINITIONS } from '../data/effects';
import { THIEN_THU_VAT_PHAM_TIEU_HAO, THIEN_THU_TRANG_BI, THIEN_THU_PHAP_BAO, THIEN_THU_CONG_PHAP } from '../data/thienThu';
import * as geminiService from '../services/geminiService';
import { getFinalBuff } from '../utils/buffMultipliers';

const API_KEY_STORAGE_KEY = 'gemini_api_key';
const INITIAL_HETHONG_STATE = { quests: [] };
const INITIAL_GAME_STATE: GameState = {
    player: INITIAL_PLAYER_STATS,
    inventory: [],
    quests: [],
    board: [],
    currentEvent: null,
    gameLog: [{ type: 'system', content: "Chào mừng đến với Tiên Lộ Mênh Mông!"}],
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
        locations: [],
        provinces: [],
        worldRegions: [],
    },
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
    const [gameState, setGameState] = useState<GameState>(() => applyCustomThienThu(JSON.parse(JSON.stringify(INITIAL_GAME_STATE))));
    const [isApiReady, setIsApiReady] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasLocalSave, setHasLocalSave] = useState(false);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [isRolling, setIsRolling] = useState(false);
    const [diceFace, setDiceFace] = useState(1);
    const [playerInput, setPlayerInput] = useState('');

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

    const saveGameStateToLocal = useCallback(() => {
        if (!autoSaveEnabled) return;
        try {
            const stateToSave = { ...gameState, breakthroughReport: null }; // Don't save transient breakthrough report
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
            setHasLocalSave(true);
        } catch (error) {
            console.error("Failed to save game state to local storage", error);
        }
    }, [gameState, autoSaveEnabled]);

    useEffect(() => {
        const savedGame = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedGame) {
            setHasLocalSave(true);
        }
    }, []);

    useEffect(() => {
        if (isInitialized) {
            saveGameStateToLocal();
        }
    }, [gameState, isInitialized, saveGameStateToLocal]);

    const addLogEntry = useCallback((entry: LogEntry) => {
        setGameState(prev => ({
            ...prev,
            gameLog: [...prev.gameLog, entry].slice(-100) // Keep last 100 entries
        }));
    }, []);
    
    const findRealmDetails = useCallback((system: CultivationTier[], stageId: string): { tier: CultivationTier, major: MajorRealm, minor: MinorRealm } | null => {
        for (const tier of system) {
            for (const major of tier.realms) {
                const minor = major.minorRealms.find(m => m.id === stageId);
                if (minor) {
                    return { tier, major, minor };
                }
            }
        }
        return null;
    }, []);

    const calculateStatChanges = (oldPlayer: Player, newPlayer: Player): Record<string, StatChange> => {
        const changes: Record<string, StatChange> = {};
        const allStatNames: Record<string, string> = { ...PLAYER_ATTRIBUTE_NAMES, maxHp: 'Sinh lực tối đa', maxSpiritPower: 'Linh lực tối đa', maxMentalState: 'Tâm cảnh tối đa', maxStamina: 'Thể lực tối đa', lifespan: 'Tuổi thọ' };

        // Check primary stats
        for (const key of ['maxHp', 'maxSpiritPower', 'maxStamina', 'maxMentalState', 'lifespan']) {
            const statKey = key as keyof Player;
            if (oldPlayer[statKey] !== newPlayer[statKey]) {
                changes[allStatNames[key]] = { before: oldPlayer[statKey] as number, after: newPlayer[statKey] as number };
            }
        }

        // Check attributes
        for (const key of Object.keys(PLAYER_ATTRIBUTE_NAMES)) {
            const attrKey = key as keyof PlayerAttributes;
            if (oldPlayer.attributes[attrKey] !== newPlayer.attributes[attrKey]) {
                changes[PLAYER_ATTRIBUTE_NAMES[attrKey]] = { before: oldPlayer.attributes[attrKey], after: newPlayer.attributes[attrKey] };
            }
        }
        return changes;
    };
    
    // The main function to update player stats based on their cultivation stage.
    const updatePlayerStatsForCultivation = useCallback((playerState: Player, system: CultivationTier[], newStageId: string, newQualityId: string | null): Player => {
        const details = findRealmDetails(system, newStageId);
        if (!details) return playerState;

        const { tier, major, minor } = details;
        const newPlayer = { ...playerState };

        // Special case for Phàm Nhân
        if (major.id === 'pham_nhan_realm_0') {
            const baseAttrs = { ...INITIAL_PLAYER_STATS.attributes };
            // Apply destiny bonuses to base attributes
            playerState.selectedDestinyIds.forEach(id => {
                const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
                if (destiny?.effects?.attributeChange) {
                    for (const [key, value] of Object.entries(destiny.effects.attributeChange)) {
                        if (value !== undefined) baseAttrs[key as keyof PlayerAttributes] += value;
                    }
                }
            });
            newPlayer.attributes = baseAttrs;
            
            newPlayer.cultivationStageId = newStageId;
            newPlayer.cultivationStage = major.name.trim();
            newPlayer.cultivationQualityId = null;
            newPlayer.cultivationQuality = null;

            newPlayer.maxHp = INITIAL_PLAYER_STATS.maxHp;
            newPlayer.maxStamina = INITIAL_PLAYER_STATS.maxStamina;
            newPlayer.maxMentalState = INITIAL_PLAYER_STATS.maxMentalState;
            newPlayer.lifespan = major.baseLifespan;

            newPlayer.maxSpiritPower = 0;
            newPlayer.spiritPower = 0;
            newPlayer.maxExp = 10;

            newPlayer.hp = newPlayer.maxHp;
            newPlayer.stamina = newPlayer.maxStamina;
            newPlayer.mentalState = newPlayer.maxMentalState;

            newPlayer.exp = 0;
            newPlayer.level = 1;

            // Apply primary stat bonuses from destiny
            playerState.selectedDestinyIds.forEach(id => {
                const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
                if(destiny?.effects?.primaryStatChange) {
                    for (const [key, value] of Object.entries(destiny.effects.primaryStatChange)) {
                         if (value !== undefined) {
                             const statKey = key as keyof Player;
                             (newPlayer[statKey] as number) += value;
                             if (key === 'maxHp') newPlayer.hp = newPlayer.maxHp;
                             if (key === 'maxStamina') newPlayer.stamina = newPlayer.maxStamina;
                             if (key === 'maxMentalState') newPlayer.mentalState = newPlayer.maxMentalState;
                         }
                    }
                }
            });
            
            return newPlayer;
        }

        const newQuality = newQualityId ? major.qualities?.find(q => q.id === newQualityId) : null;
        const qualityRank = newQuality?.rank || 1;
        const qualityLifespanBonus = newQuality?.lifespanBonus || 0;
        const difficulty = playerState.difficulty;

        // --- BASE STATS CALCULATION ---
        const baseAttributes = { ...INITIAL_PLAYER_STATS.attributes };
        const basePrimary = { 
            maxHp: INITIAL_PLAYER_STATS.maxHp, 
            maxSpiritPower: INITIAL_PLAYER_STATS.maxSpiritPower, 
            maxStamina: INITIAL_PLAYER_STATS.maxStamina, 
            maxMentalState: INITIAL_PLAYER_STATS.maxMentalState,
            maxExp: INITIAL_PLAYER_STATS.maxExp
        };

        // Apply destiny bonuses to the base stats
        playerState.selectedDestinyIds.forEach(id => {
            const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
            if (destiny?.effects?.attributeChange) {
                for (const [key, value] of Object.entries(destiny.effects.attributeChange)) {
                    if (value !== undefined) baseAttributes[key as keyof PlayerAttributes] += value;
                }
            }
            if(destiny?.effects?.primaryStatChange) {
                for (const [key, value] of Object.entries(destiny.effects.primaryStatChange)) {
                     if (value !== undefined) {
                         if (key in basePrimary) {
                            basePrimary[key as keyof typeof basePrimary] += value;
                         }
                     }
                }
            }
        });

        // --- APPLY CULTIVATION BUFFS ---
        const newAttributes: PlayerAttributes = { ...baseAttributes };
        for (const key of Object.keys(newAttributes)) {
            const attrKey = key as keyof PlayerAttributes;
            const multiplier = getFinalBuff(difficulty, 'sub', attrKey, tier.rank, major.rank, minor.rank, qualityRank);
            newAttributes[attrKey] = Math.floor(baseAttributes[attrKey] * multiplier);
        }
        
        newPlayer.attributes = newAttributes;
        newPlayer.maxHp = Math.floor(basePrimary.maxHp * getFinalBuff(difficulty, 'main', 'maxHp', tier.rank, major.rank, minor.rank, qualityRank));
        newPlayer.maxSpiritPower = Math.floor(basePrimary.maxSpiritPower * getFinalBuff(difficulty, 'main', 'maxSpiritPower', tier.rank, major.rank, minor.rank, qualityRank));
        newPlayer.maxStamina = Math.floor(basePrimary.maxStamina * getFinalBuff(difficulty, 'main', 'maxStamina', tier.rank, major.rank, minor.rank, qualityRank));
        newPlayer.maxMentalState = Math.floor(basePrimary.maxMentalState * getFinalBuff(difficulty, 'main', 'maxMentalState', tier.rank, major.rank, minor.rank, qualityRank));
        newPlayer.maxExp = Math.floor(basePrimary.maxExp * getFinalBuff(difficulty, 'main', 'maxExp', tier.rank, major.rank, minor.rank, qualityRank));

        newPlayer.lifespan = major.baseLifespan + qualityLifespanBonus;
        
        playerState.selectedDestinyIds.forEach(id => {
            const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
            if (destiny?.effects?.primaryStatChange?.lifespan) {
                newPlayer.lifespan += destiny.effects.primaryStatChange.lifespan;
            }
        });

        newPlayer.cultivationStageId = newStageId;
        newPlayer.cultivationQualityId = newQualityId;
        newPlayer.cultivationStage = `${major.name} ${minor.name}`.trim();
        newPlayer.cultivationQuality = newQuality ? newQuality.name : null;

        newPlayer.level += 1;
        newPlayer.exp = 0;
        
        // Full heal on breakthrough
        newPlayer.hp = newPlayer.maxHp;
        newPlayer.spiritPower = newPlayer.maxSpiritPower;
        newPlayer.stamina = newPlayer.maxStamina;
        newPlayer.mentalState = newPlayer.maxMentalState;
        
        return newPlayer;
    }, [findRealmDetails]);


    const handleDiceRoll = async () => {
        if (gameState.diceRolls <= 0 || gameState.isLoading) return;

        setIsRolling(true);
        setGameState(prev => ({ ...prev, isLoading: true, currentEvent: null }));

        const roll = Math.floor(Math.random() * 6) + 1;
        
        let interval: ReturnType<typeof setInterval>;
        const rollAnimationDuration = 1000;
        const startTime = Date.now();
        interval = setInterval(() => {
            if (Date.now() - startTime > rollAnimationDuration) {
                clearInterval(interval);
                setIsRolling(false);
                setDiceFace(roll);
            } else {
                setDiceFace(Math.floor(Math.random() * 6) + 1);
            }
        }, 50);

        setTimeout(async () => {
            const newPosition = (gameState.player.position + roll) % BOARD_SIZE;
            const targetSquare = gameState.board[newPosition];

            addLogEntry({ type: 'dice_roll', content: `${gameState.player.name} đã gieo được [${roll}] điểm, vận mệnh đưa đẩy đến ô [${targetSquare.description}].`});

            setGameState(prev => ({ ...prev, player: { ...prev.player, position: newPosition } }));

            try {
                if(newPosition === 0 && gameState.turnCounter > 0) { // Completed a lap
                    const outcome = await geminiService.generateLapCompletionOutcome(gameState.player);
                    processActionOutcome(outcome);
                } else {
                    const event = await geminiService.generateEventForSquare(gameState.player, targetSquare, gameState.quests, gameState.worldPhase, gameState.worldData);
                    setGameState(prev => ({ ...prev, currentEvent: event }));
                }
            } catch (error) {
                addLogEntry({ type: 'system', content: `Lỗi: ${error instanceof Error ? error.message : String(error)}` });
            } finally {
                setGameState(prev => ({ ...prev, isLoading: false }));
            }
        }, rollAnimationDuration);
    };

    const processActionOutcome = useCallback((outcome: ActionOutcome) => {
        setGameState(prev => {
            let newPlayer = { ...prev.player };
            let newInventory = [...prev.inventory];
            let newQuests = [...prev.quests];
            let newHeThongQuests = [...prev.heThong.quests];
            let newCurrentEvent = outcome.nextEvent || null;
            let newCombatState = null;
            let newTribulationEvent = prev.tribulationEvent;
            let isDead = prev.isDead;
            let newBreakthroughReport: BreakthroughReport | null = null;
            let newIsThienMenhBanActive = prev.isThienMenhBanActive;

            // Update stats
            newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + outcome.hpChange);
            newPlayer.spiritPower = Math.min(newPlayer.maxSpiritPower, newPlayer.spiritPower + outcome.spiritPowerChange);
            newPlayer.stamina = Math.min(newPlayer.maxStamina, newPlayer.stamina + outcome.staminaChange);
            newPlayer.mentalState = Math.min(newPlayer.maxMentalState, newPlayer.mentalState + outcome.mentalStateChange);

            if (newPlayer.hp <= 0) {
                isDead = true;
                addLogEntry({ type: 'system', content: "Sinh lực cạn kiệt, đạo đồ đã tận..." });
            }

            // Update EXP and check for bottleneck
            newPlayer.exp += outcome.expChange;
            const isAtBottleneck = newPlayer.exp >= newPlayer.maxExp;
            
            // Time advancement
            let daysToAdvance = outcome.daysToAdvance || 0;
            if (daysToAdvance > 0) {
                let totalDays = (newPlayer.year -1) * 12 * 30 + (newPlayer.month - 1) * 30 + newPlayer.day + daysToAdvance;
                newPlayer.year = Math.floor(totalDays / (12*30)) + 1;
                newPlayer.month = Math.floor((totalDays % (12*30)) / 30) + 1;
                newPlayer.day = (totalDays % 30);
                if(newPlayer.day === 0) newPlayer.day = 30;

                const yearsPassed = Math.floor(daysToAdvance / 360);
                if(yearsPassed > 0) newPlayer.age += yearsPassed;
            }
            
            // Item
            if (outcome.newItem) {
                newInventory.push(outcome.newItem);
                addLogEntry({ type: 'system', content: `Nhận được [${outcome.newItem.name}].` });
            }
            
            // Reputation
            if (outcome.reputationChange) {
                outcome.reputationChange.forEach(change => {
                    newPlayer.reputation[change.faction] = (newPlayer.reputation[change.faction] || 0) + change.change;
                });
            }
            
            // Attributes
            if (outcome.attributeChanges) {
                for (const [key, value] of Object.entries(outcome.attributeChanges)) {
                    if (value !== undefined) {
                        newPlayer.attributes[key as keyof PlayerAttributes] += value;
                    }
                }
            }

            // Join Sect
            if (outcome.joinSect) {
                newPlayer.sect = outcome.joinSect;
                addLogEntry({ type: 'system', content: `Gia nhập [${outcome.joinSect}] thành công!` });
            }
            
            // Quests
            if (outcome.newQuest) {
                const newQuest: Quest = {
                    ...outcome.newQuest,
                    id: `q_${Date.now()}`,
                    status: 'Đang tiến hành',
                };
                newQuests.push(newQuest);
                addLogEntry({ type: 'system', content: `Nhận nhiệm vụ mới: [${newQuest.title}].` });
            }

            if (outcome.questUpdates) {
                outcome.questUpdates.forEach(update => {
                    const questIndex = newQuests.findIndex(q => q.id === update.questId);
                    if (questIndex !== -1) {
                        if(update.newStatus) {
                            newQuests[questIndex].status = update.newStatus;
                            const questTitle = newQuests[questIndex].title;
                            if (update.newStatus === 'Hoàn thành') {
                                addLogEntry({ type: 'system', content: `Nhiệm vụ [${questTitle}] đã hoàn thành!` });
                            } else if (update.newStatus === 'Thất bại') {
                                addLogEntry({ type: 'system', content: `Nhiệm vụ [${questTitle}] đã thất bại!` });
                            }
                        }
                        if(update.progressChange) {
                           newQuests[questIndex].progress = (newQuests[questIndex].progress || 0) + update.progressChange!;
                        }
                    }
                });
            }

            // He Thong
            if (outcome.awakenHeThong && newPlayer.heThongStatus === 'inactive') {
                newPlayer.heThongStatus = 'active';
                addLogEntry({ type: 'he_thong', content: `[Hệ Thống] đã thức tỉnh và liên kết với linh hồn của ngươi.`});
            }

            if (outcome.heThongPointsChange) {
                newPlayer.heThongPoints += outcome.heThongPointsChange;
            }

            if (outcome.newHeThongQuest) {
                const newQuest: HeThongQuest = {
                    ...outcome.newHeThongQuest,
                    id: `htq_${Date.now()}`,
                    status: 'Đang tiến hành',
                    hiddenObjective: outcome.newHeThongQuest.hiddenObjective ? {
                        ...outcome.newHeThongQuest.hiddenObjective,
                        completed: false,
                    } : undefined,
                };
                newHeThongQuests.push(newQuest);
                addLogEntry({ type: 'he_thong', content: `Nhận nhiệm vụ mới: [${newQuest.title}].` });
            }

            if (outcome.heThongQuestUpdates) {
                outcome.heThongQuestUpdates.forEach(update => {
                    const questIndex = newHeThongQuests.findIndex(q => q.id === update.questId);
                    if (questIndex !== -1) {
                        if (update.newStatus) newHeThongQuests[questIndex].status = update.newStatus;
                        if (update.hiddenObjectiveCompleted && newHeThongQuests[questIndex].hiddenObjective) {
                            newHeThongQuests[questIndex].hiddenObjective!.completed = true;
                        }
                    }
                });
            }

            // Status Effects
            let currentStatusEffects = [...newPlayer.statusEffects];
            if (outcome.removeStatusEffectIds) {
                outcome.removeStatusEffectIds.forEach(idToRemove => {
                    const removedEffect = currentStatusEffects.find(e => e.id === idToRemove);
                    if (removedEffect) {
                        addLogEntry({ type: 'status_effect', content: `Trạng thái [${removedEffect.name}] đã kết thúc.` });
                    }
                });
                currentStatusEffects = currentStatusEffects.filter(e => !outcome.removeStatusEffectIds?.includes(e.id));
            }
            if (outcome.newStatusEffects) {
                outcome.newStatusEffects.forEach(newEffect => {
                    const definition = STATUS_EFFECT_DEFINITIONS[newEffect.id];
                    if (definition) {
                        const existingIndex = currentStatusEffects.findIndex(e => e.id === newEffect.id);
                        const fullEffect: StatusEffect = { ...definition, duration: newEffect.duration };
                        if (existingIndex > -1) {
                            currentStatusEffects[existingIndex] = fullEffect;
                        } else {
                            currentStatusEffects.push(fullEffect);
                        }
                        addLogEntry({ type: 'status_effect', content: `Nhận được trạng thái: [${definition.name}].` });
                    }
                });
            }
            newPlayer.statusEffects = currentStatusEffects;

            // Tribulation & Breakthrough
            if (outcome.tribulationOutcome) {
                newTribulationEvent = null; // Tribulation event ends after one action
                if (outcome.tribulationOutcome.success && outcome.tribulationOutcome.nextStageId) {
                    const oldPlayer = { ...newPlayer };
                    const nextStageId = outcome.tribulationOutcome.nextStageId;
                    const achievedQualityId = outcome.tribulationOutcome.achievedQualityId || null;
                    
                    const updatedPlayer = updatePlayerStatsForCultivation(newPlayer, prev.cultivationSystem, nextStageId, achievedQualityId);
                    const details = findRealmDetails(prev.cultivationSystem, nextStageId);

                    newBreakthroughReport = {
                        oldStage: oldPlayer.cultivationStage,
                        newStage: updatedPlayer.cultivationStage,
                        achievedQuality: details?.major.qualities?.find(q => q.id === achievedQualityId)?.name || null,
                        statChanges: calculateStatChanges(oldPlayer, updatedPlayer)
                    };
                    
                    newPlayer = updatedPlayer;
                } else {
                    addLogEntry({ type: 'system', content: "Đột phá thất bại! Cảnh giới bị tổn thương." });
                }
            }
            
            // Combat
            if (outcome.combatTrigger) {
                newCombatState = {
                    enemyName: outcome.combatTrigger.enemyName,
                    enemyHp: outcome.combatTrigger.enemyHp,
                    enemyMaxHp: outcome.combatTrigger.enemyHp,
                    enemyDescription: outcome.combatTrigger.enemyDescription,
                    combatLog: []
                };
                newCurrentEvent = {
                    description: `Đối mặt với ${outcome.combatTrigger.enemyName}!`,
                    options: ["Tấn công bằng công pháp (Mạnh, tốn Linh Lực)", "Tấn công bằng pháp bảo (Nhanh, hiệu quả tùy pháp bảo)", "Phòng thủ (Giảm sát thương nhận vào)", "Bỏ chạy (Tỷ lệ thành công tùy đối thủ)"]
                };
            }
            
            // Thien Menh Ban Activation
            if (outcome.activateThienMenhBan && !prev.isThienMenhBanActive) {
                newIsThienMenhBanActive = true;
                addLogEntry({type: 'event', content: "Một cảm giác kỳ diệu nảy sinh trong tâm trí, dường như có thể nhìn thấy được dòng chảy của vận mệnh. [Thiên Mệnh Bàn] đã được kích hoạt!"});
            }
            
            // World Structure
            if (outcome.newLocationId) {
                newPlayer.currentLocationId = outcome.newLocationId;
                const newLocation = prev.worldData.locations.find(l => l.id === outcome.newLocationId);
                if (newLocation) {
                    addLogEntry({ type: 'system', content: `Đã di chuyển đến [${newLocation.name}].` });
                }
            }

            const turnIncrement = (prev.combatState && !newCombatState) ? 0 : 1;
            const newTurnCounter = prev.turnCounter + turnIncrement;
            
            // Update story log, journal, and short term memory
            const newLogEntry = { type: 'ai_story' as const, content: outcome.outcomeDescription };
            const newGameLog = [...prev.gameLog, newLogEntry];

            let newJournal = prev.journal;
            let newShortTermMemory = prev.shortTermMemory;
            if (outcome.journalEntry) {
                const newJournalEntry = { id: `j_${Date.now()}`, turn: newTurnCounter, text: outcome.journalEntry };
                newJournal = [...prev.journal, newJournalEntry];
                newShortTermMemory = [...prev.shortTermMemory, newJournalEntry].slice(-FULL_CONTEXT_REFRESH_CYCLE);
            }

            return {
                ...prev,
                player: newPlayer,
                inventory: newInventory,
                quests: newQuests,
                currentEvent: newCurrentEvent,
                combatState: newCombatState,
                isDead: isDead,
                turnCounter: newTurnCounter,
                diceRolls: prev.diceRolls + (outcome.diceRollsChange || 0) + (newTurnCounter % 20 === 0 && turnIncrement > 0 ? 1 : 0),
                turnInCycle: (prev.turnInCycle + turnIncrement) % FULL_CONTEXT_REFRESH_CYCLE,
                heThong: { ...prev.heThong, quests: newHeThongQuests },
                isAtBottleneck: isAtBottleneck,
                tribulationEvent: newTribulationEvent,
                breakthroughReport: newBreakthroughReport,
                isThienMenhBanActive: newIsThienMenhBanActive,
                gameLog: newGameLog.slice(-100),
                journal: newJournal,
                shortTermMemory: newShortTermMemory,
            };
        });
    }, [updatePlayerStatsForCultivation, findRealmDetails, addLogEntry]);
    
    const processCombatTurnOutcome = useCallback((outcome: CombatTurnOutcome) => {
        setGameState(prev => {
            if (!prev.combatState) return prev;

            let newPlayer = { ...prev.player };
            let newCombatState = { ...prev.combatState };
            let newInventory = [...prev.inventory];
            let isCombatOver = false;

            // Update stats
            newPlayer.hp = Math.max(0, Math.min(newPlayer.maxHp, newPlayer.hp + outcome.playerHpChange));
            newPlayer.stamina = Math.max(0, Math.min(newPlayer.maxStamina, newPlayer.stamina + outcome.playerStaminaChange));
            newPlayer.mentalState = Math.max(0, Math.min(newPlayer.maxMentalState, newPlayer.mentalState + outcome.playerMentalStateChange));
            newCombatState.enemyHp = Math.max(0, newCombatState.enemyHp + outcome.enemyHpChange);

            // Add to combat log
            newCombatState.combatLog = [outcome.turnDescription, ...newCombatState.combatLog].slice(0, 10);

            // Check for combat end conditions
            if (outcome.isFleeSuccessful) {
                isCombatOver = true;
                addLogEntry({ type: 'system', content: `${newPlayer.name} đã bỏ chạy thành công!` });
            } else if (newCombatState.enemyHp <= 0) {
                isCombatOver = true;
                addLogEntry({ type: 'system', content: `${newPlayer.name} đã đánh bại ${newCombatState.enemyName}!` });
                if (outcome.loot) {
                    addLogEntry({ type: 'system', content: outcome.loot.lootDescription });
                    newPlayer.exp += outcome.loot.expChange;
                    if (outcome.loot.newItem) {
                        newInventory.push(outcome.loot.newItem);
                    }
                }
            } else if (newPlayer.hp <= 0) {
                addLogEntry({ type: 'system', content: "Sinh lực cạn kiệt, đạo đồ đã tận..." });
                return { ...prev, player: newPlayer, isDead: true, combatState: null };
            }

            if (isCombatOver) {
                const turnIncrement = 1;
                const newTurnCounter = prev.turnCounter + turnIncrement;
                return {
                    ...prev,
                    player: newPlayer,
                    inventory: newInventory,
                    combatState: null,
                    currentEvent: null, // Let the game generate default actions
                    turnCounter: newTurnCounter,
                    diceRolls: prev.diceRolls + (newTurnCounter % 20 === 0 && turnIncrement > 0 ? 1 : 0),
                    turnInCycle: (prev.turnInCycle + turnIncrement) % FULL_CONTEXT_REFRESH_CYCLE,
                };
            }

            return {
                ...prev,
                player: newPlayer,
                combatState: newCombatState,
            };
        });
    }, [addLogEntry]);

    const handlePlayerAction = useCallback(async (action: string, source: 'suggestion' | 'input') => {
        if (gameState.isLoading) return;

        setGameState(prev => ({ ...prev, isLoading: true }));
        addLogEntry({ type: source === 'suggestion' ? 'player_choice' : 'player_input', content: action });
        if (source === 'input') {
            setPlayerInput('');
        }

        try {
            if (gameState.combatState) {
                const combatOutcome = await geminiService.processCombatTurn(gameState.player, gameState.combatState, gameState.worldPhase, action);
                processCombatTurnOutcome(combatOutcome);
            } else {
                const isFullContext = gameState.turnInCycle === 0;
                const outcome = await geminiService.processPlayerAction(gameState, action, isFullContext);
                processActionOutcome(outcome);
            }
        } catch (error) {
            addLogEntry({ type: 'system', content: `Lỗi: ${error instanceof Error ? error.message : String(error)}` });
        } finally {
            setGameState(prev => ({...prev, isLoading: false}));
        }
    }, [gameState, processActionOutcome, processCombatTurnOutcome, addLogEntry]);

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

    const goHome = useCallback(() => {
        setIsInitialized(false);
        setGameState(applyCustomThienThu(JSON.parse(JSON.stringify(INITIAL_GAME_STATE))));
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setHasLocalSave(false);
    }, []);
    
    const initializeGame = useCallback(async ({ setupData, isRestart }: { setupData?: ScenarioData, isRestart?: boolean }) => {
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
                nguHanh: (Object.keys(setupData.nguHanh) as NguHanhType[])
                    .filter(key => setupData.nguHanh[key] > 0)
                    .map(key => `${key.charAt(0).toUpperCase() + key.slice(1)} (${setupData.nguHanh[key] * 20}%)`).join(', ') || 'Không có',
                difficulty: setupData.difficulty,
                selectedDestinyIds: setupData.selectedDestinyIds,
                heThongStatus: setupData.enableHeThong ? 'inactive' : 'disabled',
                sect: selectedSect ? selectedSect.name : null,
                sectRank: selectedSect ? setupData.playerSectRank : null,
                currentLocationId: setupData.startingLocationId || '',
            };
            
            const findFirstMinorRealmId = (system: CultivationTier[]): string | undefined => {
                const phamNhanTier = system.find(t => t.id === 'pham_nhan_tier_0');
                if (phamNhanTier) {
                    return phamNhanTier.realms[0]?.minorRealms[0]?.id;
                }
                
                const sortedTiers = [...system].sort((a,b) => a.rank - b.rank);
                for (const tier of sortedTiers) {
                    const sortedRealms = [...tier.realms].sort((a,b) => a.rank - b.rank);
                    for (const major of sortedRealms) {
                        const firstVisibleMinor = [...major.minorRealms].sort((a,b) => a.rank - b.rank).find(m => !m.isHidden);
                        if (firstVisibleMinor) {
                            return firstVisibleMinor.id;
                        }
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
            initialPlayer.exp = 0; // Reset exp after stat calculation

            const initialInventory: Item[] = [];
            const allInitialItems: (InitialItem | InitialCongPhap)[] = [...setupData.initialItems, ...setupData.initialTrangBi, ...setupData.initialPhapBao, ...setupData.initialCongPhap];
            
            for (const initItem of allInitialItems) {
                for(let i = 0; i < ('quantity' in initItem ? initItem.quantity : 1); i++) {
                    const item: Item = {
                        id: `${initItem.id}_${i}`,
                        name: initItem.name,
                        description: initItem.description,
                        category: 'techniqueType' in initItem ? 'Công pháp' : initItem.itemType === 'Tiêu hao' || initItem.itemType === 'Khác' ? 'Vật phẩm' : initItem.itemType,
                        attributes: initItem.attributes,
                        effectIds: initItem.effectIds,
                        rank: initItem.rank,
                        expPerTurn: initItem.expPerTurn,
                        nguHanhAttribute: initItem.nguHanhAttribute,
                        imageId: initItem.imageId,
                    };
                    if ('equipmentType' in initItem) item.equipmentType = initItem.equipmentType;
                    initialInventory.push(item);
                }
            }
            
            const initialState = applyCustomThienThu(JSON.parse(JSON.stringify(INITIAL_GAME_STATE)));
            const initialJournalEntry = { id: `j_${Date.now()}`, turn: 0, text: scenario.journalEntry };

            setGameState({
                ...initialState,
                player: initialPlayer,
                inventory: initialInventory,
                board: scenario.board,
                quests: [{...scenario.initialQuest, id: `q_${Date.now()}`, status: 'Đang tiến hành'}],
                currentEvent: scenario.initialEvent,
                worldPhase: {...scenario.worldPhase, turnsRemaining: 100 },
                gameLog: [
                    { type: 'system', content: "Chào mừng đến với Tiên Lộ Mênh Mông!" },
                    { type: 'ai_story', content: scenario.story }
                ],
                journal: [initialJournalEntry],
                shortTermMemory: [initialJournalEntry],
                thienDaoRules: setupData.thienDaoRules,
                coreMemoryRules: setupData.coreMemoryRules,
                scenarioSummary: setupData.scenarioSummary,
                scenarioStages: setupData.scenarioStages,
                cultivationSystem: setupData.cultivationSystem,
                worldData: {
                    locations: setupData.initialLocations,
                    provinces: setupData.initialProvinces,
                    worldRegions: setupData.initialWorldRegions,
                },
            });
            setIsInitialized(true);
        } catch (error) {
            console.error("Failed to initialize game:", error);
            addLogEntry({type: 'system', content: `Lỗi khởi tạo game: ${error instanceof Error ? error.message : String(error)}`});
            goHome();
        } finally {
            setGameState(prev => ({ ...prev, isLoading: false }));
        }
    }, [updatePlayerStatsForCultivation, goHome, addLogEntry]);

    const continueGame = useCallback(() => {
        const savedGame = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedGame) {
            try {
                const loadedState: Partial<GameState> = JSON.parse(savedGame);
                
                // Merge loaded state with initial state to ensure backward compatibility
                let finalState: GameState = {
                    ...INITIAL_GAME_STATE,
                    ...loadedState,
                    // Deep merge for nested objects that might have new properties
                    player: { ...INITIAL_GAME_STATE.player, ...(loadedState.player || {}) },
                    dongPhu: { ...INITIAL_GAME_STATE.dongPhu, ...(loadedState.dongPhu || {}) },
                    heThong: { ...INITIAL_GAME_STATE.heThong, ...(loadedState.heThong || {}) },
                    thienThu: { ...INITIAL_GAME_STATE.thienThu, ...(loadedState.thienThu || {}) },
                    worldData: { ...INITIAL_GAME_STATE.worldData, ...(loadedState.worldData || {}) },
                };
                
                finalState = applyCustomThienThu(finalState);
                setGameState(finalState);
                setIsInitialized(true);
            } catch (error) {
                console.error("Failed to load game from local storage", error);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                setHasLocalSave(false);
            }
        }
    }, []);

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

                    // Merge loaded state with initial state for backward compatibility
                    let finalState: GameState = {
                        ...INITIAL_GAME_STATE,
                        ...loadedState,
                        // Deep merge for nested objects that might have new properties
                        player: { ...INITIAL_GAME_STATE.player, ...(loadedState.player || {}) },
                        dongPhu: { ...INITIAL_GAME_STATE.dongPhu, ...(loadedState.dongPhu || {}) },
                        heThong: { ...INITIAL_GAME_STATE.heThong, ...(loadedState.heThong || {}) },
                        thienThu: { ...INITIAL_GAME_STATE.thienThu, ...(loadedState.thienThu || {}) },
                        worldData: { ...INITIAL_GAME_STATE.worldData, ...(loadedState.worldData || {}) },
                    };
                    
                    finalState = applyCustomThienThu(finalState);
                    setGameState(finalState);
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error("Failed to load game from file", error);
                addLogEntry({type: 'system', content: `Lỗi tải file game: ${error instanceof Error ? error.message : String(error)}`});
            }
        };
        reader.readAsText(file);
    }, [addLogEntry]);

    const handleUpgradeBuilding = useCallback((building: DongPhuBuilding) => {
        handlePlayerAction(`Nâng cấp ${building.name} lên cấp ${building.level + 1}`, 'suggestion');
    }, [handlePlayerAction]);

    const handleCraftItem = useCallback((recipe: Recipe) => {
        handlePlayerAction(`Luyện chế ${recipe.name}`, 'suggestion');
    }, [handlePlayerAction]);

    const handleEquipItem = useCallback((item: Item) => {
        const isEquipped = gameState.player.equippedTechniqueId === item.id || gameState.player.equippedTreasureId === item.id;
        handlePlayerAction(isEquipped ? `Gỡ bỏ ${item.name}` : `Trang bị ${item.name}`, 'suggestion');
    }, [gameState.player, handlePlayerAction]);

    const handleUseItem = useCallback((item: Item, quantity: number) => {
        handlePlayerAction(`Sử dụng ${quantity} ${item.name}`, 'suggestion');
    }, [handlePlayerAction]);

    const handleLeaveSect = useCallback(() => {
        if (window.confirm('Bạn có chắc muốn rời khỏi môn phái? Hành động này không thể hoàn tác và có thể gây ra hậu quả.')) {
            handlePlayerAction('Chủ động rời khỏi môn phái', 'suggestion');
        }
    }, [handlePlayerAction]);

    const triggerManualBreakthrough = useCallback(async () => {
        if (!gameState.isAtBottleneck || gameState.isLoading) return;
        setGameState(prev => ({ ...prev, isLoading: true }));
        addLogEntry({type: 'system', content: `${gameState.player.name} bắt đầu quá trình đột phá!`});
        try {
            const allRealms = gameState.cultivationSystem.flatMap(tier => tier.realms).sort((a,b) => a.rank - b.rank);
            const currentMajorRealm = allRealms.find(r => r.minorRealms.some(m => m.id === gameState.player.cultivationStageId));
            if (!currentMajorRealm) throw new Error("Không tìm thấy Đại Cảnh Giới hiện tại.");
            
            const visibleMinors = currentMajorRealm.minorRealms.filter(m => !m.isHidden);
            const currentMinorIndex = visibleMinors.findIndex(m => m.id === gameState.player.cultivationStageId);
            
            let nextStageName = "Cảnh Giới Vô Định";
            if (currentMinorIndex > -1 && currentMinorIndex < visibleMinors.length - 1) {
                const nextMinorRealm = visibleMinors[currentMinorIndex + 1];
                nextStageName = `${currentMajorRealm.name} ${nextMinorRealm.name}`;
            } else {
                const currentMajorIndex = allRealms.findIndex(r => r.id === currentMajorRealm.id);
                if (currentMajorIndex > -1 && currentMajorIndex < allRealms.length - 1) {
                    const nextMajorRealm = allRealms[currentMajorIndex + 1];
                    const firstMinorOfNext = nextMajorRealm.minorRealms.find(m => !m.isHidden);
                    if (firstMinorOfNext) {
                        nextStageName = `${nextMajorRealm.name} ${firstMinorOfNext.name}`;
                    } else {
                         throw new Error(`Đại Cảnh Giới ${nextMajorRealm.name} không có Tiểu Cảnh Giới hợp lệ.`);
                    }
                } else {
                     throw new Error("Đã đạt đến cảnh giới cao nhất.");
                }
            }

            const tribulation = await geminiService.generateTribulationEvent(gameState.player, nextStageName);
            setGameState(prev => ({ ...prev, tribulationEvent: tribulation }));
            addLogEntry({ type: 'tribulation', content: tribulation.description });
        } catch(error) {
            addLogEntry({ type: 'system', content: `Lỗi khi bắt đầu đột phá: ${error instanceof Error ? error.message : String(error)}` });
        } finally {
            setGameState(prev => ({ ...prev, isLoading: false }));
        }
    }, [gameState, addLogEntry]);

    const clearBreakthroughReport = useCallback(() => {
        setGameState(prev => ({ ...prev, breakthroughReport: null }));
    }, []);

    const handlePlayerNameChange = useCallback((newName: string) => {
        setGameState(prev => ({...prev, player: {...prev.player, name: newName}}));
    }, []);

    const handleRulesChange = useCallback((type: 'thienDao' | 'ai' | 'coreMemory', newRules: Rule[]) => {
        if (type === 'thienDao') {
            setGameState(prev => ({...prev, thienDaoRules: newRules}));
        } else if (type === 'ai') {
            setGameState(prev => ({...prev, aiRules: newRules}));
        } else {
            setGameState(prev => ({...prev, coreMemoryRules: newRules}));
        }
    }, []);

    const handleJournalEntriesChange = useCallback((newJournal: JournalEntry[]) => {
        setGameState(prev => ({...prev, journal: newJournal}));
    }, []);
    
    const handleScenarioUpdate = useCallback((updates: { summary?: string, stages?: ScenarioStage[] }) => {
        setGameState(prev => ({
            ...prev,
            scenarioSummary: updates.summary ?? prev.scenarioSummary,
            scenarioStages: updates.stages ?? prev.scenarioStages,
        }));
    }, []);
    
    const handleItemImageChange = useCallback((itemId: string, imageId: string) => {
        setGameState(prev => {
            const newInventory = prev.inventory.map(item => 
                item.id === itemId ? { ...item, imageId: imageId } : item
            );
            return { ...prev, inventory: newInventory };
        });
    }, []);

    const handleThienThuItemImageChange = useCallback((itemType: 'vatPhamTieuHao' | 'trangBi' | 'phapBao' | 'congPhap', itemId: string, imageId: string) => {
        setGameState(prev => {
            const newThienThu = JSON.parse(JSON.stringify(prev.thienThu)); // Deep copy
            const items = newThienThu[itemType] as (InitialItem | InitialCongPhap)[];
            const itemDefinition = items.find(i => i.id === itemId);
    
            if (!itemDefinition) return prev; // Item not found
    
            itemDefinition.imageId = imageId;
    
            const newInventory = prev.inventory.map(invItem => {
                if (invItem.id.startsWith(itemId + '_')) {
                    return { ...invItem, imageId: imageId };
                }
                return invItem;
            });
    
            return { ...prev, thienThu: newThienThu, inventory: newInventory };
        });
    }, []);

    // --- API Key Logic ---
    useEffect(() => {
        const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedKey) {
            try {
                geminiService.initializeGemini(storedKey);
                setIsApiReady(true);
            } catch (e) {
                console.error("Failed to initialize with stored API key:", e);
                localStorage.removeItem(API_KEY_STORAGE_KEY);
            }
        }
    }, []);

    const handleApiKeySubmit = useCallback(async (key: string) => {
        if (!key.trim()) {
            alert("API Key không được để trống.");
            return;
        }
        setGameState(prev => ({ ...prev, isLoading: true }));
        try {
            geminiService.initializeGemini(key);
            // A validation call could be added here, but for now we optimistically set it.
            // The first real API call will serve as validation.
            localStorage.setItem(API_KEY_STORAGE_KEY, key);
            setIsApiReady(true);
        } catch (error) {
            alert(`Lỗi khởi tạo API: ${error instanceof Error ? error.message : String(error)}`);
            localStorage.removeItem(API_KEY_STORAGE_KEY);
            setIsApiReady(false);
        } finally {
            setGameState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const clearApiKey = useCallback(() => {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        geminiService.clearGemini();
        setIsApiReady(false);
        goHome(); // Go back to intro screen which will now show API prompt
    }, [goHome]);


    return {
        gameState,
        isApiReady,
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
        goHome
    };
};
