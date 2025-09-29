// FIX: Imported `useState` from React to resolve 'Cannot find name' error.
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { GameState } from '../../types';
import { useGameLogic } from '../../hooks/useGameLogic';
import { CpuChipIcon, ScrollIcon, SparklesIcon } from '../Icons';
import Panel from '../Panel';
import GameBoard from '../GameBoard';

export const HeThongPanelContent: React.FC<{
    game: ReturnType<typeof useGameLogic>;
}> = ({ game }) => {
    const { gameState } = game;
    const unlockedFeatures = gameState.heThong.unlockedFeatures || [];

    const ThienMenhBanFeature = () => (
        <div className="flex-1 min-h-0 flex flex-col">
            <GameBoard
                board={gameState.board}
                playerPosition={gameState.player.position}
                worldPhase={gameState.worldPhase}
                isCollapsed={false} // Always expanded within the panel
                onToggleCollapse={() => {}} // No-op
                diceRolls={gameState.diceRolls}
                handleDiceRoll={game.handleDiceRoll}
                isLoading={gameState.isLoading}
                isRolling={game.isRolling}
                diceFace={game.diceFace}
                isInTribulation={!!gameState.tribulationEvent}
            />
        </div>
    );

    const LockedFeature = ({ featureName }: { featureName: string }) => (
        <div className="p-4 text-center text-slate-400 italic flex-1 flex flex-col justify-center items-center">
            <p className="text-lg">Chức năng [{featureName}] chưa được mở khóa.</p>
            <p className="text-sm mt-2">Hãy hoàn thành các nhiệm vụ của Hệ Thống để khám phá thêm.</p>
        </div>
    );


    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="p-3 border-b border-slate-700/50 flex justify-between items-center">
                <p className="text-sm font-semibold">Điểm Hệ Thống: <span className="font-bold text-cyan-300">{gameState.player.heThongPoints}</span></p>
                <p className="text-xs text-slate-400 italic">Nhiệm vụ Hệ Thống sẽ tự động xuất hiện.</p>
            </div>
            
            <div className="flex-1 min-h-0 flex flex-col">
                {unlockedFeatures.includes('thienMenhBan')
                    ? <ThienMenhBanFeature />
                    : <LockedFeature featureName="Thiên Mệnh Bàn" />
                }
            </div>
        </div>
    );
};

interface HeThongPanelProps {
    game: ReturnType<typeof useGameLogic>;
    isOpen?: boolean;
    onClose?: () => void;
    // Props for mobile layout compatibility
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}


export const HeThongPanel: React.FC<HeThongPanelProps> = ({ game, isOpen, onClose, isCollapsed, onToggleCollapse }) => {
    
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (isMobile) {
        return <HeThongPanelContent game={game} />;
    }

    if (!isOpen) {
        return null;
    }
    
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="w-full max-w-3xl h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <Panel 
                    title="Hệ Thống" 
                    icon={<CpuChipIcon />} 
                    className="w-full h-full flex flex-col" 
                    contentNoOverflow 
                    isCollapsed={false} 
                    onToggle={onClose!}
                >
                     <HeThongPanelContent game={game} />
                </Panel>
            </div>
        </div>,
        document.body
    );
};