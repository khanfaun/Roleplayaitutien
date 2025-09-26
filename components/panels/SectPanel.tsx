import React, { useState, useMemo } from 'react';
import type { GameState, InitialSect } from '../../types';
import { ShieldCheckIcon } from '../Icons';
import Panel from '../Panel';
import { getSectDisplayName } from '../setup/elements/shared';
import { SectDashboard } from './sect/SectDashboard';

export const SectPanelContent: React.FC<{
    gameState: GameState;
    isLoading: boolean;
    handleLeaveSect: () => void;
    handlePlayerAction: (action: string, type: 'suggestion' | 'input') => void;
}> = ({ gameState, isLoading, handleLeaveSect, handlePlayerAction }) => {
    const { player, worldData, discoveredEntityIds } = gameState;
    const { initialSects } = worldData;

    const currentSectDetails = useMemo(() => {
        return player.sect ? initialSects.find(s => s.name === player.sect) : null;
    }, [player.sect, initialSects]);
    
    const visibleSects = useMemo(() => {
        const visibleIds = new Set(discoveredEntityIds.sects);
        if (currentSectDetails) {
            visibleIds.add(currentSectDetails.id);
        }
        return initialSects.filter(sect => visibleIds.has(sect.id));
    }, [initialSects, discoveredEntityIds.sects, currentSectDetails]);

    const KnownSectsList = ({ className }: { className?: string }) => (
        <div className={`p-4 ${className}`}>
            <h4 className="font-bold text-yellow-300">Các thế lực lớn đã biết:</h4>
            <div className="mt-3 space-y-3 max-h-48 overflow-y-auto styled-scrollbar pr-2">
                {visibleSects.length > 0 ? visibleSects.map(sect => (
                    <div key={sect.id} className="p-2 bg-slate-800/30 rounded-md">
                        <p><strong>{getSectDisplayName(sect, initialSects)}</strong> <span className={`text-xs ${sect.alignment === 'Chính Đạo' ? 'text-green-400' : sect.alignment === 'Ma Đạo' ? 'text-red-400' : 'text-gray-400'}`}>({sect.alignment})</span></p>
                        <p className="text-xs italic text-slate-400">{sect.description}</p>
                    </div>
                )) : <p className="text-sm text-slate-400 italic">Chưa phát hiện thế lực nào.</p>}
            </div>
        </div>
    );

    // If player is in a sect, show the dashboard AND the list of sects
    if (currentSectDetails) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0">
                    <SectDashboard 
                        gameState={gameState} 
                        currentSect={currentSectDetails}
                        isLoading={isLoading}
                        handleLeaveSect={handleLeaveSect}
                        handlePlayerAction={handlePlayerAction}
                    />
                </div>
                <div className="flex-shrink-0">
                    <KnownSectsList className="border-t border-slate-700/50" />
                </div>
            </div>
        );
    }

    // Otherwise, show the list of known sects for Tán tu
    return (
        <div className="p-4 space-y-4 text-sm styled-scrollbar overflow-y-auto h-full">
            <p className="text-center font-semibold">Đạo hữu hiện là Tán tu, tự do tự tại.</p>
            <p className="text-center text-xs text-slate-400">Gia nhập môn phái sẽ mở ra nhiều cơ duyên mới. Hãy tìm kiếm kỳ ngộ trong lúc du ngoạn giang hồ.</p>
            <div className="pt-2 border-t border-slate-700 space-y-3">
                <h4 className="font-bold text-yellow-300">Các thế lực lớn đã biết:</h4>
                {visibleSects.length > 0 ? visibleSects.map(sect => (
                    <div key={sect.id} className="p-2 bg-slate-800/30 rounded-md">
                        <p><strong>{getSectDisplayName(sect, initialSects)}</strong> <span className={`text-xs ${sect.alignment === 'Chính Đạo' ? 'text-green-400' : sect.alignment === 'Ma Đạo' ? 'text-red-400' : 'text-gray-400'}`}>({sect.alignment})</span></p>
                        <p className="text-xs italic text-slate-400">{sect.description}</p>
                    </div>
                )) : <p className="text-sm text-slate-400 italic">Chưa phát hiện thế lực nào.</p>}
            </div>
        </div>
    );
};

export const SectPanel: React.FC<{
    gameState: GameState;
    isLoading: boolean;
    handleLeaveSect: () => void;
    handlePlayerAction: (action: string, type: 'suggestion' | 'input') => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}> = ({ gameState, isLoading, handleLeaveSect, handlePlayerAction, isCollapsed, onToggleCollapse }) => {
    
    if (isCollapsed) {
        return (
            <div 
                onClick={onToggleCollapse}
                className="relative flex-shrink-0 w-20 h-20 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 flex items-center justify-center cursor-pointer group hover:border-yellow-400/80 transition-all duration-300 ease-in-out"
                title="Môn Phái"
                aria-label="Mở rộng bảng Môn Phái"
            >
                <ShieldCheckIcon className="w-10 h-10 text-yellow-300 group-hover:text-yellow-100 transition-colors" />
            </div>
        );
    }

    return (
        <Panel title="Môn Phái" icon={<ShieldCheckIcon />} className="w-full md:w-[500px]" contentNoOverflow isCollapsed={isCollapsed} onToggle={onToggleCollapse}>
            <SectPanelContent 
                gameState={gameState} 
                isLoading={isLoading}
                handleLeaveSect={handleLeaveSect}
                handlePlayerAction={handlePlayerAction}
            />
        </Panel>
    );
};