import React, { useState, useMemo } from 'react';
import type { GameState, InitialSect, SectRank, SectRankPermission } from '../../../types';
import * as Icons from '../../Icons';
import { SectMainHall } from './SectMainHall';
import { SectTaskHall } from './SectTaskHall';
import { SectContributionHall } from './SectContributionHall';
import { SectTechniquePavilion } from './SectTechniquePavilion';
import { SectFacilities } from './SectFacilities';
import { SectMembers } from './SectMembers';


interface SectDashboardProps {
    gameState: GameState;
    currentSect: InitialSect;
    isLoading: boolean;
    handleLeaveSect: () => void;
    handlePlayerAction: (action: string, type: 'suggestion' | 'input') => void;
}

type SectTab = 'main' | 'tasks' | 'contribute' | 'techniques' | 'facilities' | 'members';

export const SectDashboard: React.FC<SectDashboardProps> = ({ gameState, currentSect, isLoading, handleLeaveSect, handlePlayerAction }) => {
    const [activeTab, setActiveTab] = useState<SectTab>('main');

    const playerRank = useMemo((): SectRank | null => {
        if (!gameState.player.sectRank || !currentSect.ranks) return null;
        return currentSect.ranks.find(r => r.name === gameState.player.sectRank) || null;
    }, [gameState.player.sectRank, currentSect.ranks]);

    const playerPermissions = useMemo((): Set<SectRankPermission> => {
        return new Set(playerRank?.permissions || []);
    }, [playerRank]);
    // FIX: Add missing type annotation for icon to resolve JSX error
    const tabs: { id: SectTab, name: string, icon: React.ReactElement }[] = [
        { id: 'main', name: 'Chính Điện', icon: <Icons.BuildingLibraryIcon className="w-4 h-4" /> },
        { id: 'tasks', name: 'Nhiệm Vụ', icon: <Icons.ScrollIcon className="w-4 h-4" /> },
        { id: 'contribute', name: 'Cống Hiến', icon: <Icons.BriefcaseIcon className="w-4 h-4" /> },
        { id: 'techniques', name: 'Tàng Kinh Các', icon: <Icons.BookOpenIcon className="w-4 h-4" /> },
        { id: 'facilities', name: 'Công Trình', icon: <Icons.HomeIcon className="w-4 h-4" /> },
        { id: 'members', name: 'Thành Viên', icon: <Icons.UsersIcon className="w-4 h-4" /> },
    ];

    return (
        <div className="flex flex-col h-full text-sm">
            <div className="w-full border-b border-slate-700/50 p-2 flex flex-row gap-1 overflow-x-auto styled-scrollbar">
                {tabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 text-left p-2 rounded text-xs font-semibold transition-colors flex-shrink-0 ${activeTab === tab.id ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}
                    >
                        {tab.icon} {tab.name}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto styled-scrollbar">
                {activeTab === 'main' && <SectMainHall gameState={gameState} currentSect={currentSect} playerRank={playerRank} handleLeaveSect={handleLeaveSect} />}
                {activeTab === 'tasks' && <SectTaskHall gameState={gameState} handlePlayerAction={handlePlayerAction} isLoading={isLoading} playerRank={playerRank} />}
                {activeTab === 'contribute' && <SectContributionHall gameState={gameState} handlePlayerAction={handlePlayerAction} isLoading={isLoading} />}
                {activeTab === 'techniques' && <SectTechniquePavilion playerPermissions={playerPermissions} />}
                {activeTab === 'facilities' && <SectFacilities currentSect={currentSect} playerPermissions={playerPermissions} handlePlayerAction={handlePlayerAction} isLoading={isLoading} />}
                {activeTab === 'members' && <SectMembers gameState={gameState} currentSect={currentSect} />}
            </div>
        </div>
    );
};