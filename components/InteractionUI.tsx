import React from 'react';
import type { GameState, LogEntry, EventOption, EventOptionObject } from '../types';

interface InteractionUIProps {
    gameState: GameState;
    isLoading: boolean;
    isRolling: boolean;
    playerInput: string;
    setPlayerInput: (value: string) => void;
    handlePlayerAction: (action: string, source: 'suggestion' | 'input') => void;
    isAtBottleneck?: boolean;
    triggerManualBreakthrough?: () => void;
    isDemoMode?: boolean;
}

const getOptionText = (option: EventOption): string => {
    if (typeof option === 'string') {
        return option;
    }
    // This path should ideally not be taken with the new Gemini response format,
    // but this makes the UI more robust against unexpected data structures.
    if (option && typeof option === 'object' && 'text' in option) {
        return (option as EventOptionObject).text;
    }
    console.warn("Unexpected option format received in UI:", option);
    return "Lỗi tùy chọn"; // Return a user-friendly error string.
};


export const InteractionUI: React.FC<InteractionUIProps> = ({ gameState, isLoading, isRolling, playerInput, setPlayerInput, handlePlayerAction, isAtBottleneck, triggerManualBreakthrough, isDemoMode = false }) => {
    
    const handleSuggestionClick = (suggestion: string) => {
        handlePlayerAction(suggestion, 'suggestion');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !playerInput.trim() || isDemoMode) return;
        handlePlayerAction(playerInput, 'input');
    };
    
    const isInputDisabled = isLoading || isRolling || isDemoMode;
    
    let suggestions: EventOption[] = [];
    let combatContent: React.ReactNode = null;

    if (gameState.combatState) {
        suggestions = ["Tấn công bằng công pháp (Mạnh, tốn Linh Lực)", "Tấn công bằng pháp bảo (Nhanh, hiệu quả tùy pháp bảo)", "Phòng thủ (Giảm sát thương nhận vào)", "Bỏ chạy (Tỷ lệ thành công tùy đối thủ)"];
        combatContent = (
            <div className="w-full">
                <div className="text-center">
                    <p className="font-bold text-red-400 text-lg">{gameState.combatState.enemyName}</p>
                    <p>{gameState.combatState.enemyHp} / {gameState.combatState.enemyMaxHp} HP</p>
                    <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 to-red-700`} style={{ width: `${Math.max(0, (gameState.combatState.enemyHp / gameState.combatState.enemyMaxHp) * 100)}%` }}></div>
                    </div>
                    <p className="text-xs italic text-gray-400 mt-2">{gameState.combatState.enemyDescription}</p>
                </div>
                 {gameState.combatState.combatLog.length > 0 &&
                    <div className="text-xs text-gray-400 italic border-l-2 border-slate-600 pl-2 mt-2 max-h-24 overflow-y-auto styled-scrollbar">
                    {gameState.combatState.combatLog.map((log, i) => <p key={i} className="first:text-gray-200 first:not-italic">{log}</p>)}
                    </div>
                }
            </div>
        );
    } else if (gameState.tribulationEvent) {
        suggestions = gameState.tribulationEvent.options;
    } else if (gameState.currentEvent) {
        suggestions = gameState.currentEvent.options;
    }
    
    const allEventsForDisplay: (LogEntry | string)[] = [...gameState.gameLog];
    
    if (combatContent && !isLoading && !isRolling) {
        allEventsForDisplay.push('COMBAT_PLACEHOLDER');
    }

    if (isLoading && !isRolling) {
        allEventsForDisplay.push('LOADING_PLACEHOLDER');
    }
    if (isRolling) {
        allEventsForDisplay.push('ROLLING_PLACEHOLDER');
    }
    

    return (
        <div className="flex-grow flex flex-col p-4 min-h-0">
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 mb-4 flex flex-col-reverse">
                {[...allEventsForDisplay].reverse().map((msg, index) => {
                    let key = `log-${index}`;
                    let bubbleContent: React.ReactNode;
                    let bubbleWrapperClass = "w-full flex";

                    if (typeof msg === 'string') {
                        if (msg === 'COMBAT_PLACEHOLDER') {
                            return <div key={key} className="p-3 rounded-lg bg-red-900/30 border border-red-500/50 text-sm text-slate-200 w-full mt-3">{combatContent}</div>;
                        } else if (msg === 'LOADING_PLACEHOLDER') {
                            bubbleContent = (
                                <div className="text-center w-full">
                                    <p className="text-lg font-semibold animate-pulse text-yellow-300">Thiên cơ đang biến đổi...</p>
                                    <p>Xin đạo hữu kiên nhẫn chờ đợi.</p>
                                </div>
                            );
                             return <div key={key} className="p-3 rounded-lg bg-slate-800/60 text-center w-full mt-3">{bubbleContent}</div>;
                        } else if (msg === 'ROLLING_PLACEHOLDER') {
                             bubbleContent = (
                                <div className="text-center w-full">
                                    <p className="text-lg font-semibold animate-pulse text-yellow-300">Vận mệnh đang xoay chuyển!</p>
                                </div>
                            );
                            return <div key={key} className="p-3 rounded-lg bg-slate-800/60 text-center w-full mt-3">{bubbleContent}</div>;
                        }
                    } else {
                        const log = msg as LogEntry;
                        key = `log-${index}-${log.type}`;
                        let bubbleClass = "p-3 rounded-lg text-sm max-w-[90%]";

                        switch (log.type) {
                            case 'player_choice':
                                bubbleWrapperClass += " justify-end";
                                bubbleClass += " bg-blue-800/60 text-slate-200";
                                bubbleContent = <p><strong className="text-yellow-300 font-semibold">Ngươi chọn:</strong> {log.content}</p>;
                                break;
                            case 'player_input':
                                bubbleWrapperClass += " justify-end";
                                bubbleClass += " bg-blue-800/60 text-slate-200";
                                bubbleContent = <p><strong className="text-yellow-300 font-semibold">Ngươi làm:</strong> {log.content}</p>;
                                break;
                            case 'ai_story':
                                bubbleWrapperClass += " justify-start";
                                bubbleClass += " bg-slate-700/50";
                                bubbleContent = <p className="text-slate-200" dangerouslySetInnerHTML={{ __html: log.content }}/>;
                                break;
                            case 'dice_roll':
                                bubbleWrapperClass += " justify-start";
                                bubbleClass += " bg-yellow-900/40 border border-yellow-700/50 text-yellow-200";
                                bubbleContent = <p className="italic" dangerouslySetInnerHTML={{ __html: log.content.replace(/\[(.*?)\]/g, '<strong class="text-yellow-300 font-semibold not-italic">$1</strong>') }} />;
                                break;
                            case 'he_thong':
                                bubbleWrapperClass += " justify-start";
                                bubbleClass += " bg-cyan-900/50 border border-cyan-700/50 text-cyan-200";
                                bubbleContent = <p>
                                    <strong className="text-cyan-300 font-semibold">[Hệ Thống]: </strong>
                                    <span dangerouslySetInnerHTML={{ __html: log.content.replace(/\[(.*?)\]/g, '<strong class="text-cyan-300 font-semibold">$1</strong>') }} />
                                </p>;
                                break;
                            case 'event':
                                bubbleWrapperClass += " justify-start";
                                bubbleClass += " bg-cyan-900/30 border border-cyan-500/50 text-slate-200";
                                bubbleContent = <p dangerouslySetInnerHTML={{ __html: log.content }}/>;
                                break;
                             case 'tribulation':
                                bubbleWrapperClass += " justify-start";
                                bubbleClass += " bg-red-900/50 border border-red-600/50 text-slate-200";
                                bubbleContent = <p>
                                    <strong className="text-red-400 font-bold">Thiên kiếp: </strong>
                                    {log.content}
                                </p>;
                                break;
                            case 'status_effect':
                                bubbleWrapperClass += " justify-start";
                                bubbleClass += " bg-purple-900/40 border border-purple-700/50 text-purple-200";
                                bubbleContent = <p className="italic" dangerouslySetInnerHTML={{ __html: log.content.replace(/\[(.*?)\]/g, '<strong class="text-purple-300 font-semibold not-italic">$1</strong>') }} />;
                                break;
                            case 'system':
                            default:
                                bubbleWrapperClass += " justify-start";
                                bubbleClass += " bg-slate-800/60 text-slate-300";
                                bubbleContent = <p>
                                    <strong className="text-yellow-300 font-semibold">Hệ thống: </strong>
                                    <span dangerouslySetInnerHTML={{ __html: log.content.replace(/\[(.*?)\]/g, '<strong class="text-yellow-300 font-semibold">$1</strong>') }} />
                                </p>;
                                break;
                        }

                        return (
                            <div key={key} className={`${bubbleWrapperClass} mt-3`}>
                                <div className={bubbleClass}>
                                    {bubbleContent}
                                </div>
                            </div>
                        )
                    }
                    return null;
                })}
            </div>

            {suggestions.length > 0 && !isLoading && !isRolling && (
                 <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-lg bg-slate-850/30 border border-slate-800/20">
                    {suggestions.map((option, index) => {
                        const optionText = getOptionText(option);
                        const key = `suggestion-${index}`;
                
                        if (!optionText) {
                            console.warn('Received an empty or invalid option:', option);
                            return null;
                        }
                
                        return (
                            <button
                                key={key}
                                onClick={() => handleSuggestionClick(optionText)}
                                className="text-xs text-center bg-slate-700/80 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors text-yellow-300"
                                aria-label={`Gợi ý: ${optionText}`}
                            >
                                {optionText}
                            </button>
                        );
                    })}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="mt-auto flex gap-2 pt-4 border-t border-slate-700/50 items-center">
                <div className="text-sm text-slate-400 whitespace-nowrap pr-2 flex-shrink-0">
                    <span>Lượt: </span>
                    <span className="font-bold text-yellow-300">{gameState.turnCounter}</span>
                </div>
                <input
                    type="text"
                    value={playerInput}
                    onChange={e => setPlayerInput(e.target.value)}
                    placeholder={isDemoMode ? "Chế độ chơi thử, không thể nhập." : (isInputDisabled ? "Đang chờ..." : "Nhập hành động của ngươi...")}
                    disabled={isInputDisabled}
                    className="flex-grow bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition disabled:bg-slate-800/50 disabled:cursor-not-allowed"
                    aria-label="Player action input"
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        type="submit"
                        disabled={isInputDisabled || !playerInput.trim()}
                        className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-4 py-2 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                        aria-label="Gửi hành động"
                    >
                        Gửi
                    </button>
                    {isAtBottleneck && triggerManualBreakthrough && (
                        <button
                            type="button"
                            onClick={() => triggerManualBreakthrough()}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-bold text-slate-900 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-md hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-50 animate-pulse whitespace-nowrap"
                        >
                            ĐỘT PHÁ
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};