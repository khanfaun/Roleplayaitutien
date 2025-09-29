

import * as geminiService from '../../services/geminiService';
import type { GameState, LogEntry, ActionOutcome, CombatTurnOutcome } from '../../types';
// FIX: Import types directly from 'react' to resolve 'React' namespace errors.
import type { Dispatch, SetStateAction } from 'react';

// --- Dependencies for this module ---
type GameStateDeps = {
    gameState: GameState;
};

type Setters = {
    setGameState: Dispatch<SetStateAction<GameState>>;
    setIsRolling?: Dispatch<SetStateAction<boolean>>;
    setDiceFace?: Dispatch<SetStateAction<number>>;
    setPlayerInput?: Dispatch<SetStateAction<string>>;
};

type Callbacks = {
    addLogEntry: (entry: LogEntry) => void;
    processActionOutcome: (outcome: ActionOutcome) => void;
    processCombatTurnOutcome?: (outcome: CombatTurnOutcome) => void;
};


// --- Logic Implementations ---

export const handleDiceRollLogic = async (
    deps: GameStateDeps,
    setters: Setters & Callbacks
) => {
    const { gameState } = deps;
    const { setIsRolling, setGameState, setDiceFace, addLogEntry, processActionOutcome } = setters;

    if (gameState.diceRolls <= 0 || gameState.isLoading || !setIsRolling || !setDiceFace) return;

    // FIX: Replaced non-existent `isThienMenhBanActive` with a check on `heThong.unlockedFeatures`.
    if (!gameState.heThong.unlockedFeatures.includes('thienMenhBan')) {
        addLogEntry({ type: 'system', content: 'Thiên Mệnh Bàn chưa được kích hoạt, không thể gieo vận mệnh.' });
        return;
    }

    setIsRolling(true);
    setGameState(prev => ({ ...prev, isLoading: true, currentEvent: null, diceRolls: prev.diceRolls - 1 }));

    const roll = Math.floor(Math.random() * 6) + 1;
    
    // Animate the dice
    const rollAnimationDuration = 1000;
    const startTime = Date.now();
    const interval = setInterval(() => {
        if (Date.now() - startTime > rollAnimationDuration) {
            clearInterval(interval);
            setIsRolling(false);
            setDiceFace(roll);
        } else {
            setDiceFace(Math.floor(Math.random() * 6) + 1);
        }
    }, 50);

    // Process the outcome after animation
    setTimeout(async () => {
        const newPosition = (gameState.player.position + roll) % 36; // BOARD_SIZE is 36
        const targetSquare = gameState.board[newPosition];

        addLogEntry({ type: 'dice_roll', content: `${gameState.player.name} đã gieo được [${roll}] điểm, vận mệnh đưa đẩy đến ô [${targetSquare.description}].`});

        setGameState(prev => ({ ...prev, player: { ...prev.player, position: newPosition } }));

        try {
            if(newPosition === 0 && gameState.turnCounter > 0) {
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

export const handlePlayerActionLogic = async (
    action: string,
    source: 'suggestion' | 'input',
    deps: GameStateDeps,
    setters: Setters & Callbacks
) => {
    const { gameState } = deps;
    const { setGameState, addLogEntry, setPlayerInput, processCombatTurnOutcome, processActionOutcome } = setters;
    
    if (gameState.isLoading || !processCombatTurnOutcome || !setPlayerInput) return;

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
};

export const triggerManualBreakthroughLogic = async (
    deps: GameStateDeps,
    setters: Setters & Pick<Callbacks, 'addLogEntry'>
) => {
    const { gameState } = deps;
    const { setGameState, addLogEntry } = setters;
    
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
};