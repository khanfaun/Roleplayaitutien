import type { GameState, ActionOutcome, CombatTurnOutcome, LogEntry, Player, Quest, HeThongQuest, BreakthroughReport, StatusEffect, ScenarioStage } from '../../types';
import { FULL_CONTEXT_REFRESH_CYCLE } from '../../constants';
import { STATUS_EFFECT_DEFINITIONS } from '../../data/effects';
import { findRealmDetails, updatePlayerStatsForCultivation, calculateStatChanges } from './cultivation';

type ReducerDeps = {
    findRealmDetails: typeof findRealmDetails;
    updatePlayerStatsForCultivation: typeof updatePlayerStatsForCultivation;
    calculateStatChanges: typeof calculateStatChanges;
}

export const processActionOutcomeReducer = (prev: GameState, outcome: ActionOutcome, deps: ReducerDeps): GameState => {
    let logEntries: LogEntry[] = [];
    let newPlayer = { ...prev.player };
    let newInventory = [...prev.inventory];
    let newQuests = [...prev.quests];
    let newHeThongState = { ...prev.heThong };
    let newCurrentEvent = outcome.nextEvent || null;
    let newCombatState = null;
    let newTribulationEvent = prev.tribulationEvent;
    let isDead = prev.isDead;
    let newBreakthroughReport: BreakthroughReport | null = null;
    let newInGameNpcs = [...prev.inGameNpcs];
    let newDiscoveredIds = { ...prev.discoveredEntityIds };
    let newScenarioStages = [...prev.scenarioStages];

    if (outcome.newlyDiscoveredIds) {
        newDiscoveredIds.locations = [...new Set([...newDiscoveredIds.locations, ...(outcome.newlyDiscoveredIds.locations || [])])];
        newDiscoveredIds.sects = [...new Set([...newDiscoveredIds.sects, ...(outcome.newlyDiscoveredIds.sects || [])])];
        newDiscoveredIds.npcs = [...new Set([...newDiscoveredIds.npcs, ...(outcome.newlyDiscoveredIds.npcs || [])])];
    }

    // Update stats
    newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + outcome.hpChange);
    newPlayer.spiritPower = Math.min(newPlayer.maxSpiritPower, newPlayer.spiritPower + outcome.spiritPowerChange);
    newPlayer.stamina = Math.min(newPlayer.maxStamina, newPlayer.stamina + outcome.staminaChange);
    newPlayer.mentalState = Math.min(newPlayer.maxMentalState, newPlayer.mentalState + outcome.mentalStateChange);

    if (newPlayer.hp <= 0) {
        isDead = true;
        logEntries.push({ type: 'system', content: "Sinh lực cạn kiệt, đạo đồ đã tận..." });
    }

    newPlayer.exp += outcome.expChange;
    const isAtBottleneck = newPlayer.exp >= newPlayer.maxExp;
    
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
    
    if (outcome.newItem) {
        newInventory.push(outcome.newItem);
        logEntries.push({ type: 'system', content: `Nhận được [${outcome.newItem.name}].` });
    }
    
    if (outcome.reputationChange) {
        outcome.reputationChange.forEach(change => {
            newPlayer.reputation[change.faction] = (newPlayer.reputation[change.faction] || 0) + change.change;
        });
    }
    
    if (outcome.attributeChanges) {
        for (const [key, value] of Object.entries(outcome.attributeChanges)) {
            if (value !== undefined) newPlayer.attributes[key as keyof typeof newPlayer.attributes] += value;
        }
    }

    if (outcome.joinSect) {
        newPlayer.sect = outcome.joinSect;
        const joinedSect = prev.worldData.initialSects.find(s => s.name === outcome.joinSect);
        if (joinedSect) {
            newDiscoveredIds.sects = [...new Set([...newDiscoveredIds.sects, joinedSect.id])];
        }
        logEntries.push({ type: 'system', content: `Gia nhập [${outcome.joinSect}] thành công!` });
    }
    
    if (outcome.newQuest) {
        const newQuest: Quest = { ...outcome.newQuest, id: `q_${Date.now()}`, status: 'Đang tiến hành' };
        newQuests.push(newQuest);
        logEntries.push({ type: 'system', content: `Nhận nhiệm vụ mới: [${newQuest.title}].` });
    }

    if (outcome.questUpdates) {
        outcome.questUpdates.forEach(update => {
            const questIndex = newQuests.findIndex(q => q.id === update.questId);
            if (questIndex !== -1) {
                if(update.newStatus) {
                    newQuests[questIndex].status = update.newStatus;
                    const questTitle = newQuests[questIndex].title;
                    if (update.newStatus === 'Hoàn thành') logEntries.push({ type: 'system', content: `Nhiệm vụ [${questTitle}] đã hoàn thành!` });
                    else if (update.newStatus === 'Thất bại') logEntries.push({ type: 'system', content: `Nhiệm vụ [${questTitle}] đã thất bại!` });
                }
                if(update.progressChange) newQuests[questIndex].progress = (newQuests[questIndex].progress || 0) + update.progressChange!;
            }
        });
    }

    if (outcome.awakenHeThong && newPlayer.heThongStatus === 'inactive') {
        newPlayer.heThongStatus = 'active';
        logEntries.push({ type: 'he_thong', content: `[Hệ Thống] đã thức tỉnh và liên kết với linh hồn của ngươi.`});
    }

    if (outcome.heThongPointsChange) newPlayer.heThongPoints += outcome.heThongPointsChange;

    if (outcome.newHeThongQuest) {
        const newQuest: HeThongQuest = { ...outcome.newHeThongQuest, id: `htq_${Date.now()}`, status: 'Đang tiến hành', hiddenObjective: outcome.newHeThongQuest.hiddenObjective ? { ...outcome.newHeThongQuest.hiddenObjective, completed: false } : undefined };
        newHeThongState.quests = [...newHeThongState.quests, newQuest];
        logEntries.push({ type: 'he_thong', content: `Nhận nhiệm vụ mới: [${newQuest.title}].` });
    }

    if (outcome.heThongQuestUpdates) {
        outcome.heThongQuestUpdates.forEach(update => {
            const questIndex = newHeThongState.quests.findIndex(q => q.id === update.questId);
            if (questIndex !== -1) {
                if (update.newStatus) newHeThongState.quests[questIndex].status = update.newStatus;
                if (update.hiddenObjectiveCompleted && newHeThongState.quests[questIndex].hiddenObjective) newHeThongState.quests[questIndex].hiddenObjective!.completed = true;
                if (update.unlockSystemFeature) {
                    const feature = update.unlockSystemFeature;
                    if (!newHeThongState.unlockedFeatures.includes(feature)) {
                        newHeThongState.unlockedFeatures = [...newHeThongState.unlockedFeatures, feature];
                        let featureName = feature;
                        if (feature === 'thienMenhBan') featureName = 'Thiên Mệnh Bàn';
                        logEntries.push({ type: 'he_thong', content: `Đã mở khóa chức năng mới: [${featureName}]!` });
                    }
                }
            }
        });
    }

    if (outcome.scenarioStageUpdates) {
        outcome.scenarioStageUpdates.forEach(update => {
            const stageIndex = newScenarioStages.findIndex(s => s.id === update.stageId);
            if (stageIndex > -1) {
                newScenarioStages[stageIndex].completed = update.completed;
                if(update.completed) {
                    logEntries.push({ type: 'system', content: `Đã hoàn thành giai đoạn cốt truyện: [${newScenarioStages[stageIndex].text.substring(0, 30)}...]` });
                }
            }
        });
    }

    let currentStatusEffects = [...newPlayer.statusEffects];
    if (outcome.removeStatusEffectIds) {
        outcome.removeStatusEffectIds.forEach(idToRemove => {
            const removedEffect = currentStatusEffects.find(e => e.id === idToRemove);
            if (removedEffect) logEntries.push({ type: 'status_effect', content: `Trạng thái [${(removedEffect as StatusEffect).name}] đã kết thúc.` });
        });
        currentStatusEffects = currentStatusEffects.filter(e => !outcome.removeStatusEffectIds?.includes(e.id));
    }
    if (outcome.newStatusEffects) {
        outcome.newStatusEffects.forEach(newEffect => {
            const definition = STATUS_EFFECT_DEFINITIONS[newEffect.id];
            if (definition) {
                const existingIndex = currentStatusEffects.findIndex(e => e.id === newEffect.id);
                const fullEffect: StatusEffect = { ...definition, duration: newEffect.duration };
                if (existingIndex > -1) currentStatusEffects[existingIndex] = fullEffect;
                else currentStatusEffects.push(fullEffect);
                logEntries.push({ type: 'status_effect', content: `Nhận được trạng thái: [${definition.name}].` });
            }
        });
    }
    newPlayer.statusEffects = currentStatusEffects;

    if (outcome.tribulationOutcome) {
        newTribulationEvent = null;
        if (outcome.tribulationOutcome.success && outcome.tribulationOutcome.nextStageId) {
            const oldPlayer = { ...newPlayer };
            const nextStageId = outcome.tribulationOutcome.nextStageId;
            const achievedQualityId = outcome.tribulationOutcome.achievedQualityId || null;
            
            const updatedPlayer = deps.updatePlayerStatsForCultivation(newPlayer, prev.cultivationSystem, nextStageId, achievedQualityId);
            const details = deps.findRealmDetails(prev.cultivationSystem, nextStageId);

            newBreakthroughReport = {
                oldStage: oldPlayer.cultivationStage,
                newStage: updatedPlayer.cultivationStage,
                achievedQuality: details?.major.qualities?.find(q => q.id === achievedQualityId)?.name || null,
                statChanges: deps.calculateStatChanges(oldPlayer, updatedPlayer)
            };
            
            newPlayer = updatedPlayer;
        } else {
            logEntries.push({ type: 'system', content: "Đột phá thất bại! Cảnh giới bị tổn thương." });
        }
    }
    
    if (outcome.combatTrigger) {
        newCombatState = { enemyName: outcome.combatTrigger.enemyName, enemyHp: outcome.combatTrigger.enemyHp, enemyMaxHp: outcome.combatTrigger.enemyHp, enemyDescription: outcome.combatTrigger.enemyDescription, combatLog: [] };
        newCurrentEvent = { description: `Đối mặt với ${outcome.combatTrigger.enemyName}!`, options: ["Tấn công bằng công pháp (Mạnh, tốn Linh Lực)", "Tấn công bằng pháp bảo (Nhanh, hiệu quả tùy pháp bảo)", "Phòng thủ (Giảm sát thương nhận vào)", "Bỏ chạy (Tỷ lệ thành công tùy đối thủ)"] };
    }
    
    if (outcome.newLocationId) {
        newPlayer.currentLocationId = outcome.newLocationId;
        const newLocation = prev.worldData.worldLocations.find(l => l.id === outcome.newLocationId);
        if (newLocation) {
            logEntries.push({ type: 'system', content: `Đã di chuyển đến [${newLocation.name}].` });
            
            // Discover the new location and all its parents
            const toDiscover = [newLocation.id];
            let current = newLocation;
            while (current && current.parentId) {
                toDiscover.push(current.parentId);
                current = prev.worldData.worldLocations.find(l => l.id === current.parentId);
            }
            newDiscoveredIds.locations = [...new Set([...newDiscoveredIds.locations, ...toDiscover])];
        }
    }

    const turnIncrement = (prev.combatState && !newCombatState) ? 0 : 1;
    const newTurnCounter = prev.turnCounter + turnIncrement;
    
    logEntries.push({ type: 'ai_story' as const, content: outcome.outcomeDescription });
    const newGameLog = [...prev.gameLog, ...logEntries];

    let newJournal = prev.journal;
    let newShortTermMemory = prev.shortTermMemory;
    if (outcome.journalEntry) {
        const newJournalEntry = { id: `j_${Date.now()}`, turn: newTurnCounter, text: outcome.journalEntry };
        newJournal = [...prev.journal, newJournalEntry];
        newShortTermMemory = [...prev.shortTermMemory, newJournalEntry].slice(-FULL_CONTEXT_REFRESH_CYCLE);
    }

    return { ...prev, player: newPlayer, inventory: newInventory, quests: newQuests, currentEvent: newCurrentEvent, combatState: newCombatState, isDead: isDead, turnCounter: newTurnCounter, diceRolls: prev.diceRolls + (outcome.diceRollsChange || 0) + (newTurnCounter % 20 === 0 && turnIncrement > 0 ? 1 : 0), turnInCycle: (prev.turnInCycle + turnIncrement) % FULL_CONTEXT_REFRESH_CYCLE, heThong: newHeThongState, isAtBottleneck: isAtBottleneck, tribulationEvent: newTribulationEvent, breakthroughReport: newBreakthroughReport, gameLog: newGameLog.slice(-100), journal: newJournal, shortTermMemory: newShortTermMemory, inGameNpcs: newInGameNpcs, discoveredEntityIds: newDiscoveredIds, scenarioStages: newScenarioStages };
};

export const processCombatTurnOutcomeReducer = (prev: GameState, outcome: CombatTurnOutcome, deps: { addLogEntry: (entry: LogEntry) => void }): GameState => {
    const { addLogEntry } = deps;
    if (!prev.combatState) return prev;

    let newPlayer = { ...prev.player };
    let newCombatState = { ...prev.combatState };
    let newInventory = [...prev.inventory];
    let isCombatOver = false;

    newPlayer.hp = Math.max(0, Math.min(newPlayer.maxHp, newPlayer.hp + outcome.playerHpChange));
    newPlayer.stamina = Math.max(0, Math.min(newPlayer.maxStamina, newPlayer.stamina + outcome.playerStaminaChange));
    newPlayer.mentalState = Math.max(0, Math.min(newPlayer.maxMentalState, newPlayer.mentalState + outcome.playerMentalStateChange));
    newCombatState.enemyHp = Math.max(0, newCombatState.enemyHp + outcome.enemyHpChange);

    newCombatState.combatLog = [outcome.turnDescription, ...newCombatState.combatLog].slice(0, 10);

    if (outcome.isFleeSuccessful) {
        isCombatOver = true;
        addLogEntry({ type: 'system', content: `${newPlayer.name} đã bỏ chạy thành công!` });
    } else if (newCombatState.enemyHp <= 0) {
        isCombatOver = true;
        addLogEntry({ type: 'system', content: `${newPlayer.name} đã đánh bại ${newCombatState.enemyName}!` });
        if (outcome.loot) {
            addLogEntry({ type: 'system', content: outcome.loot.lootDescription });
            newPlayer.exp += outcome.loot.expChange;
            if (outcome.loot.newItem) newInventory.push(outcome.loot.newItem);
        }
    } else if (newPlayer.hp <= 0) {
        addLogEntry({ type: 'system', content: "Sinh lực cạn kiệt, đạo đồ đã tận..." });
        return { ...prev, player: newPlayer, isDead: true, combatState: null };
    }

    if (isCombatOver) {
        const turnIncrement = 1;
        const newTurnCounter = prev.turnCounter + turnIncrement;
        return { ...prev, player: newPlayer, inventory: newInventory, combatState: null, currentEvent: null, turnCounter: newTurnCounter, diceRolls: prev.diceRolls + (newTurnCounter % 20 === 0 && turnIncrement > 0 ? 1 : 0), turnInCycle: (prev.turnInCycle + turnIncrement) % FULL_CONTEXT_REFRESH_CYCLE };
    }

    return { ...prev, player: newPlayer, combatState: newCombatState };
};