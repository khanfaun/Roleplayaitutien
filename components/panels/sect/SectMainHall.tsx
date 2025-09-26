import React from 'react';
import type { GameState, InitialSect, SectRank } from '../../../types';
import * as Icons from '../../Icons';
import { getSectDisplayName } from '../../setup/elements/shared';


interface SectMainHallProps {
    gameState: GameState;
    currentSect: InitialSect;
    playerRank: SectRank | null;
    handleLeaveSect: () => void;
}

export const SectMainHall: React.FC<SectMainHallProps> = ({ gameState, currentSect, playerRank, handleLeaveSect }) => {
    const { player } = gameState;

    const getNextRank = (): SectRank | null => {
        if (!playerRank || !currentSect.ranks) return null;
        
        const sortedRanks = [...currentSect.ranks].sort((a, b) => a.contributionRequired - b.contributionRequired);
        const currentRankIndex = sortedRanks.findIndex(r => r.name === playerRank.name);

        if (currentRankIndex > -1 && currentRankIndex < sortedRanks.length - 1) {
            return sortedRanks[currentRankIndex + 1];
        }
        return null;
    };

    const nextRank = getNextRank();

    return (
        <div className="p-4 space-y-4">
            <div>
                <h3 className="text-lg font-bold text-yellow-300">{getSectDisplayName(currentSect, gameState.worldData.initialSects)}</h3>
                <p className="text-xs italic text-slate-400">{currentSect.description}</p>
            </div>
            
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-300">Chức Vụ:</span>
                    <span className="font-bold text-cyan-300">{player.sectRank}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-300">Điểm Cống Hiến:</span>
                    <span className="font-bold text-cyan-300">{player.sectContribution}</span>
                </div>
                {nextRank && (
                     <div className="pt-2 border-t border-slate-700/50">
                        <p className="text-xs text-slate-400 text-center">
                            Cần <span className="font-bold text-yellow-300">{nextRank.contributionRequired - player.sectContribution}</span> điểm cống hiến nữa để thăng cấp lên <span className="font-bold text-cyan-300">{nextRank.name}</span>.
                        </p>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-1 overflow-hidden">
                            <div 
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                style={{ width: `${Math.min(100, (player.sectContribution / nextRank.contributionRequired) * 100)}%`}}
                            ></div>
                        </div>
                     </div>
                )}
            </div>

            <div>
                <h4 className="font-semibold text-slate-200 mb-2">Thông Báo Môn Phái</h4>
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 text-xs text-slate-300 italic h-24 overflow-y-auto styled-scrollbar">
                    <p>- Gần đây yêu thú trong Hắc Phong Sơn Mạch hoạt động khác thường, các đệ tử ra ngoài cần phải cẩn thận.</p>
                    <p>- Trưởng lão Luyện Đan Đường đang cần gấp một lượng lớn Linh Tâm Thảo, ai quyên góp sẽ có trọng thưởng.</p>
                </div>
            </div>

            <button 
                onClick={handleLeaveSect} 
                disabled={gameState.isLoading}
                className="w-full text-center text-sm mt-4 p-2 bg-red-800/70 hover:bg-red-700 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                Rời Môn Phái
            </button>
        </div>
    );
};
