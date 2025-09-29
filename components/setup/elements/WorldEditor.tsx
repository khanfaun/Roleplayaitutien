import React, { useState } from 'react';
import type { WorldLocation, InitialSect } from '../../../types';
import * as Icons from '../../Icons';
import { getImageUrl } from '../../GamePanels';

const LOCATION_TYPE_COLORS: Record<string, string> = {
    'Quần Cư': 'bg-sky-600 text-white',
    'Tự Nhiên': 'bg-emerald-600 text-white',
    'Tài Nguyên': 'bg-yellow-600 text-black',
    'Đặc Biệt': 'bg-purple-600 text-white',
    'Di Tích Cổ': 'bg-amber-700 text-white',
    'Bí Cảnh': 'bg-cyan-500 text-white',
};

const LocationLabel: React.FC<{ text: string, colors: string }> = ({ text, colors }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${colors}`}>{text}</span>
);

const getSectDisplayName = (sect: InitialSect, allSects: InitialSect[]): string => {
    if (sect.parentSectId) {
        const parentSect = allSects.find(s => s.id === sect.parentSectId);
        if (parentSect) {
            return `${parentSect.name} (${sect.name})`;
        }
    }
    return sect.name;
};


const LocationNode: React.FC<{
    location: WorldLocation;
    allLocations: WorldLocation[];
    startingLocationId: string | null;
    isLast: boolean;
    onSetStartPoint: (id: string) => void;
    onEdit: (location: WorldLocation) => void;
    onDelete: (id: string) => void;
    onAddChild: (parent: WorldLocation) => void;
    onOpenImageModal: (location: WorldLocation) => void;
    allSects: InitialSect[];
    onEditSect: (sect: InitialSect) => void;
    onDeleteSect: (id: string) => void;
    onAddSect: (location: WorldLocation) => void;
}> = ({
    location, allLocations, startingLocationId, isLast,
    onSetStartPoint, onEdit, onDelete, onAddChild, onOpenImageModal,
    allSects, onEditSect, onDeleteSect, onAddSect
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const children = allLocations.filter(l => l.parentId === location.id);
    const isStartPoint = startingLocationId === location.id;
    const imageUrl = getImageUrl(location.imageId);
    const sectsAtThisLocation = allSects.filter(s => s.locationId === location.id);

    const controllingSectNames = (location.controllingSectIds || [])
        .map(id => allSects.find(s => s.id === id))
        .filter((s): s is InitialSect => !!s)
        .map(s => getSectDisplayName(s, allSects));

    const sovereigntyLabel = location.sovereigntyType === 'dependent' ? 'Kiểm soát' : 'Đại diện';
    const controlText = controllingSectNames.length > 0 ? `${sovereigntyLabel}: ${controllingSectNames.join(', ')}` : null;

    return (
        <div className="relative">
            {/* Tree lines */}
            <div className={`absolute top-0 left-3 w-px bg-slate-600 ${isLast ? 'h-7' : 'h-full'}`}></div>
            <div className="absolute top-7 left-3 w-4 h-px bg-slate-600"></div>
            
            <div className="pl-8 relative">
                <div className={`flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 ${isStartPoint ? 'border-yellow-400' : 'border-slate-700/50'}`}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-shrink-0 p-1"
                    >
                        {isExpanded ? <Icons.ChevronDownIcon className="w-4 h-4" /> : <Icons.ChevronRightIcon className="w-4 h-4" />}
                    </button>
                    <div className="w-12 h-12 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden flex items-center justify-center relative group">
                        {imageUrl ? <img src={imageUrl} alt={location.name} className="w-full h-full object-cover" /> : <Icons.MapIcon className="w-6 h-6 text-slate-500"/>}
                        <button onClick={(e) => { e.preventDefault(); onOpenImageModal(location); }} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Đổi hình ảnh">
                            <Icons.PencilIcon className="w-5 h-5 text-white"/>
                        </button>
                    </div>
                    <div className="flex-grow">
                        <span className="font-semibold">{location.name} <span className="text-xs text-slate-400">(Cấp {location.level})</span></span>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                            {controlText && <LocationLabel text={controlText} colors="bg-slate-600 text-white" />}
                            {location.type && LOCATION_TYPE_COLORS[location.type] && <LocationLabel text={location.type} colors={LOCATION_TYPE_COLORS[location.type]} />}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => onSetStartPoint(location.id)} title="Đặt làm điểm bắt đầu" className="p-1 hover:bg-slate-700 rounded-full">
                            <Icons.FlagIcon className={`w-4 h-4 ${isStartPoint ? 'text-yellow-400' : 'text-slate-400'}`} />
                        </button>
                        {location.level < 10 && <button title="Thêm địa điểm con" onClick={() => onAddChild(location)} className="p-1 text-green-400 hover:bg-slate-700 rounded-full"><Icons.PlusCircleIcon className="w-4 h-4"/></button>}
                        <button title="Chỉnh sửa" onClick={() => onEdit(location)} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
                        <button title="Xóa" onClick={() => onDelete(location.id)} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-1 pl-4">
                        <div className="p-2 bg-slate-900/20 rounded-md space-y-2">
                             <div className="text-xs text-slate-300 space-y-1">
                                <p><strong className="text-slate-400">Mô tả:</strong> {location.description}</p>
                                {location.realmRequirement && location.realmRequirement !== 'Không yêu cầu' && <p><strong className="text-slate-400">Yêu cầu cảnh giới:</strong> {location.realmRequirement}</p>}
                            </div>

                             {/* Sects Section */}
                            <div className="pt-2 border-t border-slate-700/50">
                                <div className="flex justify-between items-center mb-1">
                                    <h5 className="text-xs font-bold text-slate-400">Thế lực tại đây</h5>
                                    <button onClick={() => onAddSect(location)} className="flex items-center gap-1 text-xs bg-green-800/50 hover:bg-green-700/50 text-white font-semibold px-2 py-0.5 rounded-md transition-colors">
                                        <Icons.PlusCircleIcon className="w-3 h-3"/> Thêm
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {sectsAtThisLocation.length > 0 ? sectsAtThisLocation.map(sect => (
                                        <div key={sect.id} className="p-1.5 bg-slate-700/30 rounded text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className={sect.alignment === 'Chính Đạo' ? 'text-green-300' : sect.alignment === 'Ma Đạo' ? 'text-red-300' : 'text-slate-300'}>
                                                    {getSectDisplayName(sect, allSects)}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button title="Chỉnh sửa" onClick={() => onEditSect(sect)} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-3 h-3"/></button>
                                                    <button title="Xóa" onClick={() => onDeleteSect(sect.id)} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><Icons.TrashIcon className="w-3 h-3"/></button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <p className="text-xs text-slate-500 italic">Chưa có thế lực nào.</p>}
                                </div>
                            </div>
                            
                            {/* Children Section */}
                            {children.length > 0 && (
                                <div className="pt-2 border-t border-slate-700/50">
                                     <h5 className="text-xs font-bold text-slate-400 mb-1">Địa điểm con</h5>
                                     <div className="space-y-1">
                                        {children.map((child, index) => (
                                            <LocationNode
                                                key={child.id} location={child} allLocations={allLocations}
                                                startingLocationId={startingLocationId} onSetStartPoint={onSetStartPoint}
                                                onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild}
                                                onOpenImageModal={onOpenImageModal} allSects={allSects}
                                                onAddSect={onAddSect} onEditSect={onEditSect} onDeleteSect={onDeleteSect}
                                                isLast={index === children.length - 1}
                                            />
                                        ))}
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export const WorldEditor: React.FC<{
    worldLocations: WorldLocation[],
    setWorldLocations: (updater: (prev: WorldLocation[]) => WorldLocation[]) => void,
    startingLocationId: string | null,
    setStartingLocationId: (updater: (prev: string | null) => string | null) => void,
    setModalState: (state: any) => void,
    setAssignmentModalState: (state: any) => void,
    initialSects: InitialSect[],
    setInitialSects: (updater: (prev: InitialSect[]) => InitialSect[]) => void,
}> = ({
    worldLocations, setWorldLocations,
    startingLocationId, setStartingLocationId,
    setModalState,
    setAssignmentModalState,
    initialSects,
    setInitialSects
}) => {
    const rootLocations = worldLocations.filter(l => l.parentId === null);

    const handleSetStartPoint = (id: string) => {
        setStartingLocationId(prev => (prev === id ? null : id));
    };

    const handleAdd = (parent: WorldLocation | null) => {
        const parentId = parent ? parent.id : null;
        const level = parent ? parent.level + 1 : 1;
        setModalState({
            type: 'worldLocation',
            data: { parentId, level },
        });
    };

    const handleEdit = (location: WorldLocation) => {
        setModalState({ type: 'worldLocation', data: location });
    };

    const handleDelete = (id: string) => {
        const idsToDelete = new Set<string>([id]);
        const queue = [id];
        while (queue.length > 0) {
            const currentId = queue.shift();
            if (!currentId) continue;
            const children = worldLocations.filter(l => l.parentId === currentId);
            for (const child of children) {
                idsToDelete.add(child.id);
                queue.push(child.id);
            }
        }
        setWorldLocations(prev => prev.filter(l => !idsToDelete.has(l.id)));
        setInitialSects(prev => prev.filter(s => !idsToDelete.has(s.locationId || '')));
    };
    
     const handleOpenImageModal = (location: WorldLocation) => {
        setAssignmentModalState({
            isOpen: true,
            item: location,
            onAssign: (imageId: string) => setWorldLocations(prev => prev.map(l => l.id === location.id ? { ...l, imageId } : l))
        });
    };
    
    const handleDeleteSect = (id: string) => {
        setInitialSects(prev => prev.filter(s => s.id !== id && s.parentSectId !== id));
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-yellow-300 flex items-center gap-3">
                    <Icons.MapIcon className="w-6 h-6"/>
                    Cấu Trúc Thế Giới
                </h3>
                <button onClick={() => handleAdd(null)} className="flex items-center gap-2 text-sm bg-green-600/80 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded-md transition-colors">
                    <Icons.PlusCircleIcon className="w-5 h-5"/> Thêm Địa Điểm (Cấp 1)
                </button>
            </div>
             <div className="flex-1 space-y-1 overflow-y-auto styled-scrollbar pr-2 -mr-2">
                {rootLocations.length > 0 ? rootLocations.map((loc, index) => (
                    <LocationNode
                        key={loc.id}
                        location={loc}
                        allLocations={worldLocations}
                        startingLocationId={startingLocationId}
                        onSetStartPoint={handleSetStartPoint}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddChild={handleAdd}
                        onOpenImageModal={handleOpenImageModal}
                        allSects={initialSects}
                        onAddSect={(location) => setModalState({ type: 'sect', data: { locationId: location.id, level: 1 } })}
                        onEditSect={(sect) => setModalState({ type: 'sect', data: sect })}
                        onDeleteSect={handleDeleteSect}
                        isLast={index === rootLocations.length - 1}
                    />
                )) : (
                    <p className="text-sm text-slate-400 italic text-center py-8">Chưa có địa điểm nào. Hãy bắt đầu bằng cách thêm một Đại Vực.</p>
                )}
            </div>
        </div>
    );
};