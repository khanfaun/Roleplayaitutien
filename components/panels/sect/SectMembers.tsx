import React from 'react';
import type { GameState, InitialSect, NpcCharacter } from '../../../types';
import * as Icons from '../../Icons';
import { getImageUrl } from '../InventoryPanel';

interface SectMembersProps {
    gameState: GameState;
    currentSect: InitialSect;
}

export const SectMembers: React.FC<SectMembersProps> = ({ gameState, currentSect }) => {
    const { inGameNpcs, discoveredEntityIds, player } = gameState;

    const sectMembers = inGameNpcs.filter(npc => 
        npc.sect === currentSect.name && discoveredEntityIds.npcs.includes(npc.id)
    );
    
    // Add player to the list for display
    const playerAsMember = {
        id: 'player',
        name: player.name,
        sectRank: player.sectRank,
        imageId: undefined, // Player doesn't have an image in this context
    };

    const allMembers = [...sectMembers, playerAsMember];

    const membersByRank = currentSect.ranks
        .sort((a, b) => b.contributionRequired - a.contributionRequired)
        .map(rank => ({
            ...rank,
            members: allMembers.filter(m => m.sectRank === rank.name)
        }))
        .filter(rankGroup => rankGroup.members.length > 0);

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-base font-bold text-yellow-300 mb-2">Danh Sách Thành Viên</h3>
            <p className="text-xs text-slate-400 mb-4">
                Danh sách các đạo hữu trong môn phái.
            </p>
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-4 space-y-4">
                {membersByRank.map(rankGroup => (
                    <div key={rankGroup.name}>
                        <h4 className="font-semibold text-cyan-300 border-b border-slate-700 pb-1 mb-2">{rankGroup.name}</h4>
                        <div className="space-y-2">
                            {rankGroup.members.map(member => (
                                <div key={member.id} className="p-2 bg-slate-900/50 rounded-md flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0 flex items-center justify-center">
                                        {member.imageId ? (
                                            <img src={getImageUrl(member.imageId)} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Icons.UserIcon className="w-6 h-6 text-slate-500" />
                                        )}
                                    </div>
                                    <p className={`font-semibold ${member.id === 'player' ? 'text-yellow-300' : ''}`}>{member.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
