import React from 'react';
import type { InitialNpc, InitialSect, WorldLocation, CultivationTier } from '../../../types';
import * as Icons from '../../Icons';
import { EditableElementList, CollapsibleElement } from './ElementHelpers';
import { getSectDisplayName } from './shared';
import { findRealmDetails } from '../../../utils/npcCalculations';
import { getImageUrl } from '../../GamePanels';

export const NpcEditor: React.FC<{
    initialNpcs: InitialNpc[],
    setInitialNpcs: (updater: (prev: InitialNpc[]) => InitialNpc[]) => void,
    setModalState: (state: any) => void,
    setAssignmentModalState: (state: any) => void,
    allSects: InitialSect[],
    cultivationSystem: CultivationTier[],
}> = ({ initialNpcs, setInitialNpcs, setModalState, setAssignmentModalState, allSects, cultivationSystem }) => (
    <EditableElementList
        title="NPC"
        icon={<Icons.UserPlusIcon className="w-6 h-6"/>}
        items={initialNpcs}
        onAdd={() => setModalState({ type: 'npc', data: null })}
        renderItem={(item: InitialNpc) => {
            const sect = allSects.find((s: InitialSect) => s.id === item.sectId);
            const stageInfo = findRealmDetails(cultivationSystem, item.startingCultivationStageId);
            const stageName = stageInfo ? `${stageInfo.major.name} ${stageInfo.minor.name}`.trim() : 'Phàm Nhân';
            
            return (
                <CollapsibleElement
                    item={item}
                    typeLabel="NPC"
                    onEdit={() => setModalState({ type: 'npc', data: item })}
                    onDelete={() => setInitialNpcs((p: InitialNpc[]) => p.filter(i => i.id !== item.id))}
                    onOpenImageModal={() => setAssignmentModalState({
                        isOpen: true,
                        item: item,
                        onAssign: (imageId: string) => setInitialNpcs((p: InitialNpc[]) => p.map(i => i.id === item.id ? { ...i, imageId } : i))
                    })}
                >
                    <div className='flex items-center gap-4 mb-2'>
                        <p><strong className="text-slate-400">Cảnh giới:</strong> {stageName}</p>
                        {item.age && <p><strong className="text-slate-400">Tuổi:</strong> {item.age}</p>}
                    </div>
                    <p><strong className="text-slate-400">Tiểu sử:</strong> {item.description}</p>
                    {item.relationship && <p><strong className="text-slate-400">Quan hệ:</strong> {item.relationship}</p>}
                    {sect && <p><strong className="text-slate-400">Môn phái:</strong> {getSectDisplayName(sect, allSects)}</p>}
                    {item.sectRank && <p><strong className="text-slate-400">Chức vụ:</strong> {item.sectRank}</p>}
                    {item.personality && <p><strong className="text-slate-400">Tính cách:</strong> {item.personality}</p>}
                    {item.personalHistory && <p><strong className="text-slate-400">Lý lịch:</strong> {item.personalHistory}</p>}
                    {item.goals && <p><strong className="text-slate-400">Mục tiêu:</strong> {item.goals}</p>}
                </CollapsibleElement>
            )
        }}
    />
);