import React from 'react';
import type { GameState, Quest, SectRank } from '../../../types';
import * as Icons from '../../Icons';

interface SectTaskHallProps {
    gameState: GameState;
    handlePlayerAction: (action: string, type: 'suggestion' | 'input') => void;
    isLoading: boolean;
    playerRank: SectRank | null;
}

const renderQuest = (q: Quest) => (
    <div key={q.id} className="p-3 bg-slate-900/50 rounded-md border border-slate-700/50">
        <p className="font-bold text-green-300">{q.title}</p>
        <p className="italic text-slate-300 text-xs mt-1">{q.description}</p>
        <div className="text-xs text-slate-400 mt-2">
            <p>Thời hạn: {q.timeLimit != null ? `Còn ${q.timeLimit} lượt` : 'Vĩnh viễn'}</p>
            {(q.progress !== undefined && q.target !== undefined) && <p>Tiến độ: {q.progress || 0}/{q.target}</p>}
        </div>
        {q.rewards && (
            <div className="text-xs text-cyan-300 mt-2 pt-2 border-t border-slate-700/50">
                <strong>Thưởng:</strong> {q.rewards.description}
            </div>
        )}
    </div>
);

export const SectTaskHall: React.FC<SectTaskHallProps> = ({ gameState, handlePlayerAction, isLoading, playerRank }) => {
    const sectQuests = gameState.quests.filter(q => q.type === 'Môn phái' && q.status === 'Đang tiến hành');
    const canRequestTasks = playerRank?.permissions.includes('assign_tasks');

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-base font-bold text-yellow-300 mb-2">Nhiệm Vụ Đường</h3>
            <p className="text-xs text-slate-400 mb-4">
                Hoàn thành nhiệm vụ để nhận điểm cống hiến và các phần thưởng giá trị khác.
            </p>
            <div className="mb-4">
                <button 
                    onClick={() => handlePlayerAction(`Xin nhận nhiệm vụ từ ${gameState.player.sect}`, 'suggestion')}
                    disabled={isLoading || !canRequestTasks}
                    className="w-full text-center p-2 bg-blue-800/70 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-slate-600/50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                    {canRequestTasks ? 'Xin nhận nhiệm vụ' : 'Chức vụ không đủ'}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-4 space-y-3">
                {sectQuests.length > 0 ? sectQuests.map(renderQuest) : (
                    <p className="text-center text-slate-400 italic">Hiện không có nhiệm vụ nào.</p>
                )}
            </div>
        </div>
    );
};
