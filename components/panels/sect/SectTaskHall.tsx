import React from 'react';
import type { GameState, Quest, SectRank } from '../../../types';
import * as Icons from '../../Icons';

interface SectTaskHallProps {
    gameState: GameState;
    handlePlayerAction: (action: string, type: 'suggestion' | 'input') => void;
    isLoading: boolean;
    playerRank: SectRank | null;
}

export const SectTaskHall: React.FC<SectTaskHallProps> = ({ gameState, handlePlayerAction, isLoading, playerRank }) => {
    const canRequestTasks = !!playerRank;

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-base font-bold text-yellow-300 mb-2">Nhiệm Vụ Đường</h3>
            <p className="text-xs text-slate-400 mb-4">
                Hoàn thành nhiệm vụ để nhận điểm cống hiến và các phần thưởng giá trị khác. Đạo hữu có thể xin nhận nhiệm vụ mới tại đây. Các nhiệm vụ đã nhận sẽ được hiển thị trong bảng Nhiệm Vụ chính.
            </p>
            <div className="mb-4">
                <button 
                    onClick={() => handlePlayerAction(`Xin nhận nhiệm vụ từ ${gameState.player.sect}`, 'suggestion')}
                    disabled={isLoading || !canRequestTasks}
                    className="w-full text-center p-2 bg-blue-800/70 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-slate-600/50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                    {canRequestTasks ? 'Xin nhận nhiệm vụ' : 'Chưa có chức vụ'}
                </button>
            </div>
            <div className="flex-1 flex items-center justify-center bg-slate-900/30 rounded-lg">
                <p className="text-center text-slate-400 italic p-4">Các nhiệm vụ đang hoạt động của đạo hữu được liệt kê trong bảng Nhiệm Vụ chính.</p>
            </div>
        </div>
    );
};