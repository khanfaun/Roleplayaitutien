

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
    const [activeTab, setActiveTab] = useState('nhiemVu');
    const unlockedFeatures = gameState.heThong.unlockedFeatures || [];

    const activeQuests = gameState.heThong.quests.filter(q => q.status === 'Đang tiến hành');

    const QuestList = () => (
        <div className="flex-grow p-2 sm:p-4 space-y-3 text-sm styled-scrollbar overflow-y-auto min-h-0">
            {activeQuests.length === 0 ? (
                <p className="text-sm text-slate-400 italic p-4">Không có nhiệm vụ Hệ Thống nào.</p>
            ) : (
                activeQuests.map(q => (
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
                ))
            )}
        </div>
    );

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
        <div className="p-4 text-center text-slate-400 italic">
            <p>Chức năng [{featureName}] chưa được mở khóa.</p>
            <p className="text-xs mt-2">Hãy hoàn thành các nhiệm vụ của Hệ Thống để khám phá thêm.</p>
        </div>
    );


    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="p-3 border-b border-slate-700/50">
                <p className="text-sm font-semibold">Điểm Hệ Thống: <span className="font-bold text-cyan-300">{gameState.player.heThongPoints}</span></p>
            </div>
            
            <div className="flex-shrink-0 flex border-b-2 border-slate-700/50">
                <button onClick={() => setActiveTab('nhiemVu')} className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'nhiemVu' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>
                    <ScrollIcon className="w-5 h-5"/> Nhiệm Vụ
                </button>
                <button 
                    onClick={() => setActiveTab('thienMenhBan')} 
                    className={`flex-1 p-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'thienMenhBan' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}
                >
                    <SparklesIcon className="w-5 h-5"/> Thiên Mệnh Bàn
                </button>
            </div>

            <div className="flex-1 min-h-0">
                {activeTab === 'nhiemVu' && <QuestList />}
                {activeTab === 'thienMenhBan' && (
                    unlockedFeatures.includes('thienMenhBan')
                        ? <ThienMenhBanFeature />
                        : <LockedFeature featureName="Thiên Mệnh Bàn" />
                )}
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
