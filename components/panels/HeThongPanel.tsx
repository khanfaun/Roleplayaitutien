import React from 'react';
import type { GameState, Player } from '../../types';
import { CpuChipIcon } from '../Icons';
import Panel from '../Panel';

export const HeThongPanelContent: React.FC<{
    gameState: GameState;
    isLoading: boolean;
    handlePlayerAction: (action: string) => void;
}> = ({ gameState, isLoading, handlePlayerAction }) => {
    const activeQuests = gameState.heThong.quests.filter(q => q.status === 'Đang tiến hành');

    if (activeQuests.length === 0) {
        return <p className="text-sm text-slate-400 italic p-4">Không có nhiệm vụ Hệ Thống nào.</p>;
    }

    return (
        <div className="flex-grow p-2 sm:p-4 space-y-3 text-sm styled-scrollbar overflow-y-auto min-h-0">
            {activeQuests.map(q => (
                <div key={q.id} className="p-3 bg-cyan-900/40 rounded-md border border-cyan-700/50">
                    <p className="font-bold text-cyan-300">{q.title} <span className="text-xs font-normal">({q.type})</span></p>
                    <p className="italic text-slate-300 text-xs mt-1">{q.description}</p>
                    {q.hiddenObjective && !q.hiddenObjective.completed && (
                        <p className="text-xs mt-2 text-purple-300 bg-purple-900/30 p-1 rounded-sm">Mục tiêu ẩn: ???</p>
                    )}
                     {q.hiddenObjective && q.hiddenObjective.completed && (
                        <p className="text-xs mt-2 text-green-300 bg-green-900/30 p-1 rounded-sm">Đã hoàn thành mục tiêu ẩn!</p>
                    )}
                    <div className="text-xs text-slate-400 mt-2">
                        <p>Thời hạn: {q.timeLimit != null ? `Còn ${q.timeLimit} lượt` : 'Vĩnh viễn'}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const HeThongPanel: React.FC<{
    gameState: GameState;
    isLoading: boolean;
    handlePlayerAction: (action: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}> = ({ gameState, isLoading, handlePlayerAction, isCollapsed, onToggleCollapse }) => {
    if (gameState.player.heThongStatus !== 'active') {
        return null;
    }

    if (isCollapsed) {
        return (
            <div 
                onClick={onToggleCollapse}
                className="relative flex-shrink-0 w-20 h-20 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 flex items-center justify-center cursor-pointer group hover:border-cyan-400/80 transition-all duration-300 ease-in-out"
                title="Hệ Thống"
                aria-label="Mở rộng bảng Hệ Thống"
            >
                <CpuChipIcon className="w-10 h-10 text-cyan-300 group-hover:text-cyan-100 transition-colors" />
            </div>
        );
    }
    
    return (
        <Panel title="Hệ Thống" icon={<CpuChipIcon />} className="w-full md:w-[500px]" contentNoOverflow isCollapsed={isCollapsed} onToggle={onToggleCollapse}>
             <div className="flex flex-col h-full min-h-0">
                 <div className="p-3 border-b border-slate-700/50">
                    <p className="text-sm font-semibold">Điểm Hệ Thống: <span className="font-bold text-cyan-300">{gameState.player.heThongPoints}</span></p>
                 </div>
                 <HeThongPanelContent gameState={gameState} isLoading={isLoading} handlePlayerAction={handlePlayerAction} />
             </div>
        </Panel>
    );
};
