import React, { useState, useRef, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import type { ScenarioStage, InitialItem, InitialCongPhap, InitialNpc, InitialSect, InitialLocation, PlayerAttributes, CultivationTier, MajorRealm, MinorRealm, RealmQuality, ItemEffectDefinition, EquipmentType, TechniqueType, NguHanhType, InitialProvince, InitialWorldRegion } from '../../types';
import * as Icons from '../Icons';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, PlusCircleIcon, ChevronDownIcon, ChevronUpIcon } from '../Icons';
import { PLAYER_ATTRIBUTE_NAMES } from '../../constants';
import { SmartTooltip } from '../SmartTooltip';
import { ALL_ITEM_EFFECT_DEFINITIONS } from '../../data/effects';
import { ImageAssignmentModal } from '../GamePanels';

// =================================================================
// 1. SHARED HELPERS & CONSTANTS (GỘP TỪ CÁC FILE)
// =================================================================

const rankMap: Record<number, string> = {
    1: 'Phàm Phẩm',
    2: 'Hạ Phẩm',
    3: 'Trung Phẩm',
    4: 'Thượng Phẩm',
    5: 'Cực Phẩm',
    6: 'Chí Tôn'
};

const getRankColor = (rank?: number) => {
    switch (rank) {
        case 1: return 'text-slate-300';
        case 2: return 'text-green-400';
        case 3: return 'text-blue-400';
        case 4: return 'text-purple-400';
        case 5: return 'text-orange-400';
        case 6: return 'text-red-500';
        default: return 'text-white';
    }
};

const getImageUrl = (imageId: string | undefined) => {
    if (!imageId) return null;
    if (imageId.startsWith('http')) return imageId;
    return `/assets/thienthu/${imageId}`;
};

const NGU_HANH_DISPLAY: Record<NguHanhType, { icon: string; name: string; colors: string }> = {
    kim: { icon: '⚙️', name: 'Kim', colors: 'bg-gray-400 text-black' },
    moc: { icon: '🌳', name: 'Mộc', colors: 'bg-green-500 text-white' },
    thuy: { icon: '💧', name: 'Thủy', colors: 'bg-blue-500 text-white' },
    hoa: { icon: '🔥', name: 'Hỏa', colors: 'bg-red-500 text-white' },
    tho: { icon: '⛰️', name: 'Thổ', colors: 'bg-yellow-600 text-black' }
};

export const PHAM_NHAN_TIER: CultivationTier = {
  id: 'pham_nhan_tier_0',
  name: 'Cấp Bậc Phàm Nhân',
  rank: 0,
  realms: [{
    id: 'pham_nhan_realm_0',
    rank: 0,
    name: 'Phàm Nhân',
    baseLifespan: 80,
    description: 'Cảnh giới khởi đầu của vạn vật, chưa bước chân vào con đường tu tiên.',
    minorRealms: [
      {
        id: 'pham_nhan_realm_0_minor_0',
        rank: 0,
        name: '', // Empty name for clean display
        description: 'Chưa bước chân vào con đường tu tiên.',
        isHidden: false,
      }
    ],
    hasQualities: false,
    qualities: [],
  }]
};

// =================================================================
// 1.5. MISSING COMPONENT DEFINITIONS
// =================================================================

const CollapsibleElement: React.FC<{ item: any; typeLabel: string; onEdit: () => void; onDelete: () => void; onOpenImageModal: () => void; children: React.ReactNode; nameColorClass?: string }> = ({ item, typeLabel, children, onEdit, onDelete, onOpenImageModal, nameColorClass }) => (
    <details className="bg-slate-800/50 rounded-md border border-slate-700/50 overflow-hidden">
        <summary className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-700/30">
            <div className="flex-grow flex items-center gap-3">
                <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden relative group">
                    {(() => {
                        const imageUrl = getImageUrl(item.imageId);
                        return imageUrl ? (
                            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                               <Icons.QuestionMarkCircleIcon className="w-8 h-8"/>
                            </div>
                        );
                    })()}
                     <button
                        onClick={(e) => { e.stopPropagation(); onOpenImageModal(); }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Đổi hình ảnh"
                     >
                        <Icons.PencilIcon className="w-6 h-6 text-white"/>
                    </button>
                </div>
                <div>
                    <span className={`font-semibold ${nameColorClass || getRankColor(item.rank)}`}>{item.name}</span>
                    <span className="text-xs text-slate-400 ml-2">({typeLabel})</span>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
            </div>
        </summary>
        <div className="p-3 border-t border-slate-700/50 bg-slate-900/30 text-xs space-y-2">
            {children}
            {(item as (InitialItem | InitialCongPhap)).effectIds && (item as (InitialItem | InitialCongPhap)).effectIds!.length > 0 && (
                <div>
                    <strong className="text-slate-400">Hiệu ứng:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {(item as (InitialItem | InitialCongPhap)).effectIds!.map(id => <EffectSelector key={id} selectedIds={[id]} onChange={() => {}} itemType="display" />)}
                    </div>
                </div>
            )}
        </div>
    </details>
);

const EditableElementList: React.FC<{ title: string; icon: React.ReactNode; items: any[]; onAdd: () => void; renderItem: (item: any) => React.ReactNode; }> = ({ title, icon, items, onAdd, renderItem }) => (
    <div className="h-full flex flex-col">
        <div className="flex-shrink-0 flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-yellow-300 flex items-center gap-3">
                {icon}
                {title}
            </h3>
            <button onClick={onAdd} className="flex items-center gap-2 text-sm bg-green-600/80 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded-md transition-colors">
                <Icons.PlusCircleIcon className="w-5 h-5"/> Thêm
            </button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto styled-scrollbar pr-2 -mr-2">
            {items.length > 0 ? items.map(item => renderItem(item)) : <p className="text-sm text-slate-400 italic text-center py-8">Chưa có yếu tố nào. Hãy thêm mới!</p>}
        </div>
    </div>
);

const EditableElement: React.FC<{ item: any; icon: React.ReactNode; onEdit: () => void; onDelete: () => void; onAddChild?: () => void; addChildLabel?: string; children?: React.ReactNode; }> = ({ item, icon, onEdit, onDelete, onAddChild, addChildLabel, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    {children ? (isExpanded ? <Icons.ChevronUpIcon className="w-5 h-5 text-slate-400"/> : <Icons.ChevronDownIcon className="w-5 h-5 text-slate-400"/>) : <div className="w-5"/>}
                    {icon}
                    <span className="font-semibold">{item.name}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button title="Chỉnh sửa" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
                    <button title="Xóa" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
            {isExpanded && children && (
                <div className="pl-8 pr-2 pb-2">
                    {children}
                    {onAddChild && <button onClick={onAddChild} className="w-full text-xs p-1 mt-1 bg-green-800/50 hover:bg-green-700/50 rounded-md transition-colors">{addChildLabel}</button>}
                </div>
            )}
        </div>
    );
};

const LocationItem: React.FC<{ location: InitialLocation; isStartPoint: boolean; onSetStartPoint: () => void; onEdit: () => void; onDelete: () => void; onOpenImageModal: () => void; }> = ({ location, isStartPoint, onSetStartPoint, onEdit, onDelete, onOpenImageModal }) => (
    <div className={`p-1.5 bg-slate-600/30 rounded flex items-center justify-between border ${isStartPoint ? 'border-yellow-400' : 'border-transparent'}`}>
         <div className="flex items-center gap-2">
            <button onClick={onSetStartPoint} title="Đặt làm điểm bắt đầu" className="p-1 hover:bg-slate-700 rounded-full">
                <Icons.FlagIcon className={`w-4 h-4 ${isStartPoint ? 'text-yellow-400' : 'text-slate-400'}`} />
            </button>
            <span>{location.name}</span>
        </div>
        <div className="flex items-center gap-1">
            <button title="Gán ảnh" onClick={onOpenImageModal} className="p-1 text-purple-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
            <button title="Chỉnh sửa" onClick={onEdit} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
            <button title="Xóa" onClick={onDelete} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
        </div>
    </div>
);

const CultivationModal: React.FC<{ modalState: any, onClose: () => void, onSave: (state: any) => void }> = ({ modalState, onClose, onSave }) => {
    const [data, setData] = useState(modalState.data || {});
    
    useEffect(() => {
        setData(modalState.data || { id: `new_${modalState.type}_${Date.now()}`});
    }, [modalState]);

    const handleChange = (field: string, value: any) => {
        setData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ type: modalState.type, data, parentIds: modalState.parentIds });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">Edit {modalState.type}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm">Name</label>
                        <input type="text" value={data.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-700 p-2 rounded" />
                    </div>
                    <div>
                        <label className="text-sm">Rank</label>
                        <input type="number" value={data.rank || 0} onChange={e => handleChange('rank', parseInt(e.target.value, 10) || 0)} className="w-full bg-slate-700 p-2 rounded" />
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-600 p-2 rounded">Cancel</button>
                        <button type="submit" className="flex-1 bg-yellow-500 text-black p-2 rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// =================================================================
// 2. HOOKS (GỘP TỪ useElementModals.ts)
// =================================================================
const useElementModals = ({
    setInitialItems,
    setInitialTrangBi,
    setInitialPhapBao,
    setInitialCongPhap,
    setInitialNpcs,
    setInitialSects,
    setInitialLocations,
    setInitialProvinces,
    setInitialWorldRegions,
}: {
    setInitialItems: Dispatch<SetStateAction<InitialItem[]>>;
    setInitialTrangBi: Dispatch<SetStateAction<InitialItem[]>>;
    setInitialPhapBao: Dispatch<SetStateAction<InitialItem[]>>;
    setInitialCongPhap: Dispatch<SetStateAction<InitialCongPhap[]>>;
    setInitialNpcs: Dispatch<SetStateAction<InitialNpc[]>>;
    setInitialSects: Dispatch<SetStateAction<InitialSect[]>>;
    setInitialLocations: Dispatch<SetStateAction<InitialLocation[]>>;
    setInitialProvinces: Dispatch<SetStateAction<InitialProvince[]>>;
    setInitialWorldRegions: Dispatch<SetStateAction<InitialWorldRegion[]>>;
}) => {
    const [modalState, setModalState] = useState<{ type: string, data: any | null, parentIds?: any } | null>(null);
    const [choiceModalState, setChoiceModalState] = useState<{ type: string } | null>(null);
    const [thienThuModalType, setThienThuModalType] = useState<string | null>(null);
    const [assignmentModalState, setAssignmentModalState] = useState<{ isOpen: boolean; item: any | null; onAssign: (imageId: string) => void; }>({ isOpen: false, item: null, onAssign: () => {} });

    const handleSave = (data: any) => {
        const isNew = !modalState?.data;
        const finalItem = {
            ...data,
            id: isNew ? `init_${modalState?.type}_${Date.now()}` : (modalState?.data.id || `init_${modalState?.type}_${Date.now()}`),
        };

        const updateList = (setter: Dispatch<SetStateAction<any[]>>) => {
            setter(prevList => {
                const index = prevList.findIndex(i => i.id === finalItem.id);
                if (index > -1) {
                    const newList = [...prevList];
                    newList[index] = finalItem;
                    return newList;
                }
                return [...prevList, finalItem];
            });
        };

        switch (modalState?.type) {
            case 'item': updateList(setInitialItems); break;
            case 'trangBi': updateList(setInitialTrangBi); break;
            case 'phapBao': updateList(setInitialPhapBao); break;
            case 'congPhap': updateList(setInitialCongPhap); break;
            case 'npc': updateList(setInitialNpcs); break;
            case 'sect': updateList(setInitialSects); break;
            case 'location': updateList(setInitialLocations); break;
            case 'province': updateList(setInitialProvinces); break;
            case 'worldRegion': updateList(setInitialWorldRegions); break;
        }
        setModalState(null);
    };

    const handleAddFromThienThu = (item: InitialItem | InitialCongPhap) => {
        const newItem = { ...item, id: `init_${thienThuModalType}_${Date.now()}` };
        switch(thienThuModalType) {
            case 'item': setInitialItems(prev => [...prev, newItem as InitialItem]); break;
            case 'trangBi': setInitialTrangBi(prev => [...prev, newItem as InitialItem]); break;
            case 'phapBao': setInitialPhapBao(prev => [...prev, newItem as InitialItem]); break;
            case 'congPhap': setInitialCongPhap(prev => [...prev, newItem as InitialCongPhap]); break;
        }
        setThienThuModalType(null);
    };

    return {
        modalState,
        setModalState,
        choiceModalState,
        setChoiceModalState,
        thienThuModalType,
        setThienThuModalType,
        assignmentModalState,
        setAssignmentModalState,
        handleSave,
        handleAddFromThienThu,
    };
};


// =================================================================
// 3. HELPER COMPONENTS (GỘP TỪ CÁC FILE)
// =================================================================

const EffectLabel: React.FC<{ effectId: string }> = ({ effectId }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const labelRef = useRef<HTMLDivElement>(null);
    const effect = ALL_ITEM_EFFECT_DEFINITIONS[effectId as keyof typeof ALL_ITEM_EFFECT_DEFINITIONS];

    if (!effect) {
        console.log(`Debug: Effect with id "${effectId}" not found in ALL_ITEM_EFFECT_DEFINITIONS.`);
        return <span className="text-xs italic text-red-400">Lỗi hiệu ứng: {effectId}</span>;
    }
    
    const rankColors: Record<number, string> = {
        1: 'bg-slate-600/80 border-slate-400', 
        2: 'bg-green-700/80 border-green-500', 
        3: 'bg-sky-700/80 border-sky-500', 
        4: 'bg-purple-700/80 border-purple-500', 
        5: 'bg-orange-600/80 border-orange-400', 
        6: 'bg-red-700/80 border-red-500',
    };
    
    const colorClass = rankColors[effect.rank] || 'bg-gray-700/80 border-gray-500';

    return (
        <>
            <div
                ref={labelRef}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(p => !p)}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-transform hover:scale-105 ${colorClass} text-white`}
            >
                <span className="text-xs font-semibold whitespace-nowrap">{effect.name}</span>
            </div>
            <SmartTooltip 
                target={labelRef.current} 
                show={showTooltip}
                className="w-64 p-3 text-left text-sm bg-slate-900 border border-yellow-500/50 rounded-lg shadow-xl z-50"
            >
                <p className="font-bold text-yellow-300">{effect.name}</p>
                <p className="text-xs text-slate-300 mt-1">{effect.description}</p>
            </SmartTooltip>
        </>
    );
};

export const EffectSelector: React.FC<{ selectedIds: string[], onChange: (ids: string[]) => void, itemType: string, itemSubType?: string, onOpen?: () => void }> = ({ selectedIds, onChange, itemType, itemSubType, onOpen }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [hoveredEffect, setHoveredEffect] = useState<ItemEffectDefinition | null>(null);
    const [hoveredTarget, setHoveredTarget] = useState<HTMLElement | null>(null);

    const rankTagStyles: Record<number, { container: string, closeButton: string }> = {
        1: { container: 'bg-slate-600 text-white', closeButton: 'text-slate-200 hover:text-white' },
        2: { container: 'bg-green-700 text-white', closeButton: 'text-green-200 hover:text-white' },
        3: { container: 'bg-sky-700 text-white', closeButton: 'text-sky-200 hover:text-white' },
        4: { container: 'bg-purple-700 text-white', closeButton: 'text-purple-200 hover:text-white' },
        5: { container: 'bg-orange-600 text-white', closeButton: 'text-orange-200 hover:text-white' },
        6: { container: 'bg-red-700 text-white', closeButton: 'text-red-200 hover:text-white' },
    };
    const defaultTagStyle = { container: 'bg-gray-700 text-white', closeButton: 'text-gray-200 hover:text-white' };

    const rankButtonStyles: Record<number, string> = {
        1: 'bg-slate-600/80 border-slate-400 hover:bg-slate-500/80',
        2: 'bg-green-700/80 border-green-500 hover:bg-green-600/80',
        3: 'bg-sky-700/80 border-sky-500 hover:bg-sky-600/80',
        4: 'bg-purple-700/80 border-purple-500 hover:bg-purple-600/80',
        5: 'bg-orange-600/80 border-orange-400 hover:bg-orange-500/80',
        6: 'bg-red-700/80 border-red-500 hover:bg-red-600/80',
    };
    const defaultButtonStyle = 'bg-gray-700/80 border-gray-500 hover:bg-gray-600/80';

    const getEffectCategory = (type: string): ItemEffectDefinition['category'] | null => {
        switch (type) {
            case 'item': return 'consumable';
            case 'trangBi': return 'equipment';
            case 'phapBao': return 'treasure';
            case 'congPhap': return 'technique';
            default: return null;
        }
    };
    const category = getEffectCategory(itemType);

    const availableEffects = Object.values(ALL_ITEM_EFFECT_DEFINITIONS)
        .filter(effect => category ? effect.category === category : false)
        .filter(effect => {
            if (itemType === 'trangBi' && itemSubType) {
                return effect.allowedEquipmentTypes?.includes(itemSubType as EquipmentType) ?? false;
            }
            if (itemType === 'congPhap' && itemSubType) {
                return effect.allowedTechniqueTypes?.includes(itemSubType as TechniqueType) ?? false;
            }
            return true;
        })
        .filter(effect => !(selectedIds || []).includes(effect.id));

    const handleSelect = (effectId: string) => {
        onChange([...(selectedIds || []), effectId]);
        setIsOpen(false);
    };

    const handleRemove = (effectId: string) => {
        onChange((selectedIds || []).filter(id => id !== effectId));
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const selectedEffects = (selectedIds || []).map(id => ALL_ITEM_EFFECT_DEFINITIONS[id as keyof typeof ALL_ITEM_EFFECT_DEFINITIONS]).filter(Boolean);
    
    if (itemType === 'display' && selectedEffects.length > 0) {
        const effect = selectedEffects[0];
        const style = rankTagStyles[effect.rank] || defaultTagStyle;

        return (
            <div 
                ref={wrapperRef}
                className={`flex items-center gap-1 ${style.container} text-xs font-semibold px-2 py-1 rounded cursor-pointer`}
                onMouseEnter={(e) => {
                    setHoveredEffect(effect);
                    setHoveredTarget(e.currentTarget);
                }}
                onMouseLeave={() => {
                    setHoveredEffect(null);
                    setHoveredTarget(null);
                }}
                 onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
            >
                <span>{effect.name}</span>
                 {hoveredEffect && (
                    <SmartTooltip
                        target={hoveredTarget}
                        show={!!hoveredTarget}
                        className="w-64 p-3 text-left text-sm bg-slate-900 border border-yellow-500/50 rounded-lg shadow-xl z-50"
                    >
                        <p className="font-bold text-yellow-300">{hoveredEffect.name}</p>
                        <p className="text-xs text-slate-300 mt-1">{hoveredEffect.description}</p>
                    </SmartTooltip>
                )}
            </div>
        );
    }

    return (
        <div>
            <label className="block text-sm font-medium text-yellow-300 mb-1">Hiệu ứng đặc biệt</label>
            <div ref={wrapperRef} className="relative">
                <div className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white flex flex-wrap gap-2 min-h-[42px] cursor-pointer" onClick={() => {
                    const nextState = !isOpen;
                    setIsOpen(nextState);
                    if (nextState && onOpen) {
                        onOpen();
                    }
                }}>
                    {selectedEffects.length === 0 && <span className="text-gray-400">Chọn hiệu ứng...</span>}
                    {selectedEffects.map(effect => {
                        const style = rankTagStyles[effect.rank] || defaultTagStyle;
                        return (
                            <div 
                                key={effect.id} 
                                className={`flex items-center gap-1 ${style.container} text-xs font-semibold px-2 py-1 rounded`}
                                onMouseEnter={(e) => {
                                    setHoveredEffect(effect);
                                    setHoveredTarget(e.currentTarget);
                                }}
                                onMouseLeave={() => {
                                    setHoveredEffect(null);
                                    setHoveredTarget(null);
                                }}
                            >
                                <span>{effect.name}</span>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(effect.id); }} className={style.closeButton}>
                                    <Icons.XIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        );
                    })}
                </div>
                {isOpen && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-slate-700 border border-slate-600 rounded-lg shadow-lg p-2 max-h-60 overflow-y-auto styled-scrollbar">
                        {(selectedIds || []).length >= 3 ? (
                            <div className="px-3 py-2 text-red-400 italic">Đã đạt giới hạn tối đa 3 hiệu ứng.</div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {availableEffects.length > 0 ? availableEffects.map(effect => {
                                    const colorClass = rankButtonStyles[effect.rank] || defaultButtonStyle;

                                    return (
                                        <button
                                            key={effect.id}
                                            type="button"
                                            onClick={() => handleSelect(effect.id)}
                                            onMouseEnter={(e) => {
                                                setHoveredEffect(effect);
                                                setHoveredTarget(e.currentTarget);
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredEffect(null);
                                                setHoveredTarget(null);
                                            }}
                                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-transform hover:scale-105 ${colorClass} text-white border`}
                                        >
                                            <span className="text-xs font-semibold whitespace-nowrap">{effect.name}</span>
                                        </button>
                                    );
                                }) : (
                                    <div className="px-3 py-2 text-slate-400 italic">Không còn hiệu ứng nào để chọn.</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {hoveredEffect && (
                    <SmartTooltip
                        target={hoveredTarget}
                        show={!!hoveredTarget}
                        className="w-64 p-3 text-left text-sm bg-slate-900 border border-yellow-500/50 rounded-lg shadow-xl z-50"
                    >
                        <p className="font-bold text-yellow-300">{hoveredEffect.name}</p>
                        <p className="text-xs text-slate-300 mt-1">{hoveredEffect.description}</p>
                    </SmartTooltip>
                )}
            </div>
        </div>
    );
};

export const ElementModal = ({ modalState, onClose, onSave, allSects = [], allLocations = [], allProvinces = [], allWorldRegions = [] }: { 
    modalState: { type: string, data: any | null, parentIds?: any }, 
    onClose: () => void, 
    onSave: (data: any) => void,
    allSects?: InitialSect[],
    allLocations?: InitialLocation[],
    allProvinces?: InitialProvince[],
    allWorldRegions?: InitialWorldRegion[],
}) => {
    const [formData, setFormData] = useState<any>({});
    const modalScrollRef = useRef<HTMLDivElement>(null);
    const [assignmentModalState, setAssignmentModalState] = useState<{ isOpen: boolean; item: any | null; onAssign: (imageId: string) => void; }>({ isOpen: false, item: null, onAssign: () => {} });
    
    useEffect(() => {
        const defaults: Partial<InitialItem & InitialCongPhap> = {
            attributes: {},
            attributeDuration: 'vĩnh viễn',
            usageLimit: 'không giới hạn',
            expPerTurn: 0,
            enableRecovery: false,
            recoveryHp: 0,
            recoverySpiritPower: 0,
            recoveryStamina: 0,
            recoveryMentalState: 0,
            enableRecoveryOverTime: false,
            recoveryDuration: 1,
            quantity: 1,
            nguHanhAttribute: '',
            rank: 1,
        };
        const initialData = modalState.data 
            ? { ...defaults, ...modalState.data, attributes: { ...defaults.attributes, ...(modalState.data.attributes || {}) } }
            : { ...defaults, ...(modalState.parentIds || {}) };
            
        initialData.enableAttributes = !!(modalState.data?.attributes && Object.keys(modalState.data.attributes).length > 0);
        initialData.enableRecovery = !!modalState.data?.enableRecovery;

        setFormData(initialData);
    }, [modalState.data, modalState.parentIds]);

    const handleAttributeChange = (attr: keyof PlayerAttributes, value: string) => {
        const numValue = parseInt(value, 10);
        setFormData((prev: any) => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [attr]: isNaN(numValue) ? 0 : numValue
            }
        }));
    };
    
    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleEffectIdsChange = (ids: string[]) => {
        setFormData((prev: any) => ({ ...prev, effectIds: ids }));
    };
    
    const handleEffectSelectorOpen = () => {
        setTimeout(() => {
            modalScrollRef.current?.scrollTo({
                top: modalScrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = { ...formData };

        if (!finalData.enableAttributes) {
            delete finalData.attributes;
            delete finalData.attributeDuration;
            delete finalData.usageLimit;
            delete finalData.expPerTurn;
        }
        if (!finalData.enableRecovery) {
            delete finalData.recoveryHp;
            delete finalData.recoverySpiritPower;
            delete finalData.recoveryStamina;
            delete finalData.recoveryMentalState;
            delete finalData.enableRecoveryOverTime;
            delete finalData.recoveryDuration;
        }
        onSave(finalData);
    };
    
    const renderField = (id: string, label: string, type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox', options?: any, placeholder?: string) => (
        <div key={id}>
            {type !== 'checkbox' && <label htmlFor={id} className="block text-sm font-medium text-yellow-300 mb-1">{label}</label>}
            {type === 'text' && <input id={id} type="text" value={formData[id] || ''} onChange={e => handleChange(id, e.target.value)} placeholder={placeholder || ''} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500" />}
            {type === 'textarea' && <textarea id={id} value={formData[id] || ''} onChange={e => handleChange(id, e.target.value)} rows={3} placeholder={placeholder || ''} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 styled-scrollbar" />}
            {type === 'number' && <input id={id} type="number" value={formData[id] ?? (id === 'quantity' ? 1 : 0)} onChange={e => handleChange(id, parseInt(e.target.value, 10) || 0)} placeholder={placeholder || ''} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500" />}
            {type === 'checkbox' && (
                <div className="flex items-center gap-2">
                    <input id={id} type="checkbox" checked={formData[id] || false} onChange={e => handleChange(id, e.target.checked)} className="h-5 w-5 rounded border-gray-500 bg-slate-700 text-yellow-500" />
                    <label htmlFor={id} className="text-sm font-medium text-slate-200">{label}</label>
                </div>
            )}
            {type === 'select' && <select
                id={id}
                value={formData[id] || ''}
                onChange={e => handleChange(id, id === 'rank' ? (parseInt(e.target.value, 10) || undefined) : e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
                <option value="">-- Chọn --</option>
                {id === 'rank' ? (
                    Object.entries(rankMap).map(([rankValue, rankLabel]) => (
                        <option key={rankValue} value={rankValue}>{rankLabel}</option>
                    ))
                ) : (
                    options.map((opt: string | {value: string, label: string}) => typeof opt === 'string' ? <option key={opt} value={opt}>{opt}</option> : <option key={opt.value} value={opt.value}>{opt.label}</option>)
                )}
            </select>}
        </div>
    );

    const renderAttributeFields = () => (
        <details className="bg-slate-900/50 p-3 rounded-lg border border-slate-700" open={!!formData.enableAttributes}>
            <summary className="font-semibold text-yellow-300 cursor-pointer flex items-center gap-2" onClick={(e) => { e.preventDefault(); handleChange('enableAttributes', !formData.enableAttributes); }}>
                <input
                    type="checkbox"
                    checked={!!formData.enableAttributes}
                    onChange={e => handleChange('enableAttributes', e.target.checked)}
                    onClick={e => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-500 bg-slate-700 text-yellow-500 flex-shrink-0"
                />
                <span>Thuộc tính cộng thêm</span>
            </summary>
             {formData.enableAttributes && (
                <div className="mt-2 pt-3 border-t border-slate-700 space-y-4">
                    {modalState.type === 'item' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderField('attributeDuration', 'Số lượt tác dụng', 'select', ['vĩnh viễn', '1', '3', '5', '10', '20', '50', '100'])}
                            {renderField('usageLimit', 'Giới hạn sử dụng', 'select', ['không giới hạn', '1', '5', '10', '100', '300'])}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(PLAYER_ATTRIBUTE_NAMES).map(key => {
                            const attrKey = key as keyof PlayerAttributes;
                            return (
                                <div key={attrKey}>
                                    <label htmlFor={attrKey} className="block text-xs font-medium text-slate-300 mb-1">{PLAYER_ATTRIBUTE_NAMES[attrKey]}</label>
                                    <input
                                        id={attrKey}
                                        type="number"
                                        value={formData.attributes?.[attrKey] || 0}
                                        onChange={e => handleAttributeChange(attrKey, e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                    />
                                </div>
                            )
                        })}
                        <div>
                            <label htmlFor="expPerTurn" className="block text-xs font-medium text-slate-300 mb-1">Kinh nghiệm cộng thêm mỗi lượt</label>
                            <input
                                id="expPerTurn"
                                type="number"
                                value={formData.expPerTurn ?? 0}
                                onChange={e => handleChange('expPerTurn', parseInt(e.target.value, 10) || 0)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            />
                            <p className="text-xs text-slate-400 mt-1">Mỗi lượt sẽ được cộng thêm 1 lượng kinh nghiệm khi dùng món đồ đó.</p>
                        </div>
                    </div>
                </div>
             )}
        </details>
    );
    
    const renderItemForm = () => {
        const recoverySummaryParts = [];
        if (formData.recoveryHp > 0) recoverySummaryParts.push(`sinh lực +${formData.recoveryHp}`);
        if (formData.recoverySpiritPower > 0) recoverySummaryParts.push(`linh lực +${formData.recoverySpiritPower}`);
        if (formData.recoveryStamina > 0) recoverySummaryParts.push(`thể lực +${formData.recoveryStamina}`);
        if (formData.recoveryMentalState > 0) recoverySummaryParts.push(`tâm cảnh +${formData.recoveryMentalState}`);

        let recoveryOverTimeLabel = 'Có tác dụng theo lượt?';
        if (formData.enableRecoveryOverTime && recoverySummaryParts.length > 0) {
            recoveryOverTimeLabel = `Mỗi lượt hồi phục ${recoverySummaryParts.join(', ')}`;
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                    {renderField('name', 'Tên vật phẩm', 'text', undefined, 'Ví dụ: Hồi Linh Đan')}
                    {renderField('description', 'Mô tả', 'textarea', undefined, 'Đan dược cấp thấp giúp hồi phục một lượng nhỏ linh lực.')}
                    <div className="grid grid-cols-2 gap-4">
                        {renderField('quantity', 'Số lượng', 'number')}
                        {renderField('rank', 'Phẩm chất', 'select', Object.keys(rankMap))}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        {renderField('itemType', 'Loại vật phẩm', 'select', ['Tiêu hao', 'Nhiệm vụ', 'Khác'])}
                        {formData.itemType === 'Tiêu hao' && renderField('consumableType', 'Phân loại tiêu hao', 'select', ['Đan dược', 'Thảo dược', 'Vật liệu', 'Khoáng thạch', 'Khác'])}
                    </div>
                    {formData.itemType === 'Tiêu hao' && formData.consumableType && formData.consumableType !== 'Đan dược' && renderField('isCraftable', 'Có thể luyện chế?', 'checkbox')}
                    <div>
                        <label htmlFor="nguHanhAttribute" className="block text-sm font-medium text-yellow-300 mb-1">Thuộc tính Ngũ Hành</label>
                        <select id="nguHanhAttribute" value={formData.nguHanhAttribute || ''} onChange={e => handleChange('nguHanhAttribute', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500">
                            <option value="">-- Chọn --</option>
                            <option value="kim">⚙️ Kim</option>
                            <option value="moc">🌳 Mộc</option>
                            <option value="thuy">💧 Thủy</option>
                            <option value="hoa">🔥 Hỏa</option>
                            <option value="tho">⛰️ Thổ</option>
                        </select>
                    </div>
                    {formData.consumableType === 'Đan dược' && <EffectSelector selectedIds={formData.effectIds || []} onChange={handleEffectIdsChange} itemType="item" onOpen={handleEffectSelectorOpen}/>}
                </div>
                {/* Right Column */}
                <div className="space-y-4">
                    {renderAttributeFields()}
                    <details className="bg-slate-900/50 p-3 rounded-lg border border-slate-700" open={!!formData.enableRecovery}>
                        <summary className="font-semibold text-yellow-300 cursor-pointer flex items-center gap-2" onClick={(e) => { e.preventDefault(); handleChange('enableRecovery', !formData.enableRecovery); }}>
                            <input
                                type="checkbox"
                                checked={!!formData.enableRecovery}
                                onChange={e => handleChange('enableRecovery', e.target.checked)}
                                onClick={e => e.stopPropagation()}
                                className="h-4 w-4 rounded border-gray-500 bg-slate-700 text-yellow-500 flex-shrink-0"
                            />
                            <span>Hồi phục</span>
                        </summary>
                        {formData.enableRecovery && (
                            <div className="mt-2 pt-3 border-t border-slate-700 space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {renderField('recoveryHp', 'Sinh lực', 'number')}
                                    {renderField('recoverySpiritPower', 'Linh lực', 'number')}
                                    {renderField('recoveryStamina', 'Thể lực', 'number')}
                                    {renderField('recoveryMentalState', 'Tâm cảnh', 'number')}
                                </div>
                                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                                     <input id="enableRecoveryOverTime" type="checkbox" checked={formData['enableRecoveryOverTime'] || false} onChange={e => handleChange('enableRecoveryOverTime', e.target.checked)} className="h-5 w-5 rounded border-gray-500 bg-slate-700 text-yellow-500" />
                                    <label htmlFor="enableRecoveryOverTime" className="text-sm font-medium text-slate-200">{recoveryOverTimeLabel}</label>
                                </div>
                                {formData.enableRecoveryOverTime && (
                                    renderField('recoveryDuration', 'Số lượt tác dụng', 'select', ['2', '3', '4', '5', '10', '20'])
                                )}
                            </div>
                        )}
                    </details>
                </div>
            </div>
        );
    };

     const renderEquipmentForm = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
                {renderField('name', 'Tên', 'text', undefined, 'Ví dụ: Hắc Thiết Trọng Kiếm')}
                {modalState.type !== 'phapBao' && renderField('equipmentType', 'Phân loại trang bị', 'select', ['Vũ khí', 'Áo choàng', 'Giáp', 'Mũ', 'Găng tay', 'Giày', 'Phụ kiện', 'Trang sức'])}
                {renderField('description', 'Mô tả', 'textarea', undefined, 'Một thanh kiếm nặng làm từ hắc thiết, uy lực kinh người.')}
                <div className="grid grid-cols-2 gap-4">
                    {renderField('quantity', 'Số lượng', 'number')}
                    {renderField('rank', 'Phẩm chất', 'select')}
                </div>
                 <div>
                    <label htmlFor="nguHanhAttribute" className="block text-sm font-medium text-yellow-300 mb-1">Thuộc tính Ngũ Hành</label>
                    <select id="nguHanhAttribute" value={formData.nguHanhAttribute || ''} onChange={e => handleChange('nguHanhAttribute', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500">
                        <option value="">-- Chọn --</option>
                        <option value="kim">⚙️ Kim</option>
                        <option value="moc">🌳 Mộc</option>
                        <option value="thuy">💧 Thủy</option>
                        <option value="hoa">🔥 Hỏa</option>
                        <option value="tho">⛰️ Thổ</option>
                    </select>
                </div>
                <EffectSelector selectedIds={formData.effectIds || []} onChange={handleEffectIdsChange} itemType={modalState.type as any} itemSubType={formData.equipmentType} onOpen={handleEffectSelectorOpen} />
            </div>
            {/* Right Column */}
            <div className="space-y-4">
                 {renderAttributeFields()}
            </div>
        </div>
    );
    
    const renderCongPhapForm = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
                {renderField('name', 'Tên công pháp', 'text', undefined, 'Ví dụ: Thanh Nguyên Kiếm Quyết')}
                <div className="grid grid-cols-2 gap-4">
                    {renderField('techniqueType', 'Phân loại công pháp', 'select', ['Chiến đấu', 'Phòng thủ', 'Tu luyện', 'Tâm pháp', 'Thân pháp'])}
                    {renderField('rank', 'Phẩm chất', 'select')}
                </div>
                <div>
                    <label htmlFor="nguHanhAttribute" className="block text-sm font-medium text-yellow-300 mb-1">Thuộc tính Ngũ Hành</label>
                    <select id="nguHanhAttribute" value={formData.nguHanhAttribute || ''} onChange={e => handleChange('nguHanhAttribute', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500">
                        <option value="">-- Chọn --</option>
                        <option value="kim">⚙️ Kim</option>
                        <option value="moc">🌳 Mộc</option>
                        <option value="thuy">💧 Thủy</option>
                        <option value="hoa">🔥 Hỏa</option>
                        <option value="tho">⛰️ Thổ</option>
                    </select>
                </div>
                {renderField('description', 'Mô tả', 'textarea', undefined, 'Công pháp nhập môn của Thanh Vân Môn, chú trọng sự vững chắc.')}
                <EffectSelector selectedIds={formData.effectIds || []} onChange={handleEffectIdsChange} itemType="congPhap" itemSubType={formData.techniqueType} onOpen={handleEffectSelectorOpen} />
            </div>
            {/* Right Column */}
            <div className="space-y-4">
                {renderAttributeFields()}
            </div>
        </div>
    );

    const renderNpcForm = () => (
        <div className="space-y-4">
            {renderField('name', 'Tên NPC', 'text')}
            {renderField('description', 'Mô tả', 'textarea')}
            {renderField('relationship', 'Quan hệ', 'text', undefined, 'Ví dụ: Sư phụ, Bằng hữu...')}
            {renderField('sectId', 'Môn phái', 'select', allSects.map(s => ({ value: s.id, label: s.name })))}
            {formData.sectId && renderField('sectRank', 'Chức vụ', 'select', ['Lão tổ', 'Thái thượng trưởng lão', 'Tông chủ', 'Trưởng lão', 'Đường chủ', 'Hộ Pháp', 'Chấp sự', 'Thủ tịch đệ tử', 'Đệ tử thân truyền', 'Đệ tử nội môn', 'Đệ tử ký danh', 'Đệ tử ngoại môn'])}
        </div>
    );

    const renderSectForm = () => (
        <div className="space-y-4">
            {renderField('name', 'Tên Môn Phái/Thế Lực', 'text')}
            {renderField('alignment', 'Phe phái', 'select', ['Chính Đạo', 'Ma Đạo', 'Trung Lập'])}
            {renderField('description', 'Mô tả', 'textarea')}
            {renderField('locationId', 'Địa điểm', 'select', allLocations.map(l => ({ value: l.id, label: l.name })))}
        </div>
    );

    const renderLocationForm = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-4">
                {renderField('name', 'Tên Khu Vực', 'text')}
                {renderField('provinceId', 'Thuộc Châu Lục', 'select', allProvinces.map(p => ({ value: p.id, label: p.name })))}
                {renderField('description', 'Mô tả', 'textarea')}
                {renderField('type', 'Loại hình', 'select', ['Quần Cư', 'Tự Nhiên', 'Tài Nguyên', 'Nguy Hiểm', 'Đặc Biệt', 'Di Tích Cổ', 'Bí Cảnh'])}
                {renderField('safetyLevel', 'Mức độ an toàn', 'select', ['An Toàn Khu', 'Trung Lập', 'Nguy Hiểm', 'Tử Địa'])}
            </div>
            <div className="space-y-4">
                {renderField('sovereignty', 'Chủ quyền', 'text', undefined, 'Tên môn phái, gia tộc, hoặc Vô chủ')}
                {renderField('resources', 'Tài nguyên đặc trưng', 'textarea', undefined, 'Linh Tâm Thảo, Hắc Thiết Khoáng...')}
                {renderField('realmRequirement', 'Yêu cầu cảnh giới', 'text', undefined, 'Ví dụ: Trúc Cơ Kỳ trở lên')}
            </div>
        </div>
    );
    
    const renderWorldRegionForm = () => (
        <div className="space-y-4">
            {renderField('name', 'Tên Đại Vực', 'text')}
            {renderField('description', 'Mô tả', 'textarea')}
        </div>
    );

    const renderProvinceForm = () => (
        <div className="space-y-4">
            {renderField('name', 'Tên Châu Lục', 'text')}
            {renderField('worldRegionId', 'Thuộc Đại Vực', 'select', allWorldRegions.map(wr => ({ value: wr.id, label: wr.name })))}
            {renderField('description', 'Mô tả', 'textarea')}
        </div>
    );
    
    let formContent;
    let title = 'Yếu Tố Mới';
    switch (modalState.type) {
        case 'item': formContent = renderItemForm(); title = 'Vật phẩm'; break;
        case 'trangBi': formContent = renderEquipmentForm(); title = 'Trang bị'; break;
        case 'phapBao': formContent = renderEquipmentForm(); title = 'Pháp bảo'; break;
        case 'congPhap': formContent = renderCongPhapForm(); title = 'Công pháp'; break;
        case 'npc': formContent = renderNpcForm(); title = 'NPC'; break;
        case 'sect': formContent = renderSectForm(); title = 'Môn Phái'; break;
        case 'location': formContent = renderLocationForm(); title = 'Khu Vực'; break;
        case 'province': formContent = renderProvinceForm(); title = 'Châu Lục'; break;
        case 'worldRegion': formContent = renderWorldRegionForm(); title = 'Đại Vực'; break;
        default: return null;
    }
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800/95 backdrop-blur-sm border border-yellow-500 rounded-lg p-6 shadow-xl w-full max-w-5xl" onClick={e => e.stopPropagation()}>
                <ImageAssignmentModal
                    isOpen={assignmentModalState.isOpen}
                    onClose={() => setAssignmentModalState({ ...assignmentModalState, isOpen: false })}
                    item={assignmentModalState.item}
                    onAssign={(imageId) => {
                        assignmentModalState.onAssign(imageId);
                        setAssignmentModalState({ ...assignmentModalState, isOpen: false });
                    }}
                />
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-yellow-300 mb-2">{modalState.data ? 'Chỉnh sửa' : 'Thêm'} {title}</h2>
                    {!['sect', 'province', 'worldRegion'].includes(modalState.type) && (
                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden relative group">
                                {(() => {
                                    const imageUrl = getImageUrl(formData.imageId);
                                    return imageUrl ? (
                                        <img src={imageUrl} alt={formData.name || 'Preview'} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                                           <Icons.QuestionMarkCircleIcon className="w-10 h-10"/>
                                        </div>
                                    );
                                })()}
                                {formData.imageId && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleChange('imageId', undefined); }}
                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        title="Gỡ ảnh"
                                    >
                                        <Icons.XIcon className="w-4 h-4"/>
                                    </button>
                                )}
                            </div>
                            <div className="flex-grow">
                                <label className="block text-sm font-medium text-yellow-300 mb-1">Ảnh đại diện</label>
                                <p className="text-xs text-slate-400 mb-2">Chọn một ảnh đại diện cho yếu tố này.</p>
                                <button
                                    type="button"
                                    onClick={() => setAssignmentModalState({
                                        isOpen: true,
                                        item: formData,
                                        onAssign: (imgId) => handleChange('imageId', imgId)
                                    })}
                                    className="text-sm bg-blue-600/80 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors"
                                >
                                    Chọn ảnh...
                                </button>
                            </div>
                        </div>
                    )}
                    <div ref={modalScrollRef} className="max-h-[60vh] overflow-y-auto styled-scrollbar pr-4 space-y-4">
                        {formContent}
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded transition-colors">Hủy</button>
                        <button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded transition-colors">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddElementChoiceModal = ({ onClose, onSelectNew, onSelectExisting }: { onClose: () => void, onSelectNew: () => void, onSelectExisting: () => void }) => {
    const [choice, setChoice] = useState('existing');

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800/95 backdrop-blur-sm border border-yellow-500 rounded-lg p-6 shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-yellow-300 mb-4">Chọn cách thêm</h2>
                <div className="space-y-4">
                    <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${choice === 'existing' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'}`}>
                        <input type="radio" name="add-choice" value="existing" checked={choice === 'existing'} onChange={() => setChoice('existing')} className="h-5 w-5 mr-4 text-yellow-500 bg-slate-600 border-slate-500 focus:ring-yellow-500 focus:ring-offset-slate-800" />
                        <div>
                            <p className="font-semibold">Thêm từ Thiên Thư</p>
                            <p className="text-sm text-slate-400">Chọn một vật phẩm đã được định nghĩa sẵn trong kho tàng Thiên Thư.</p>
                        </div>
                    </label>
                    <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${choice === 'new' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'}`}>
                        <input type="radio" name="add-choice" value="new" checked={choice === 'new'} onChange={() => setChoice('new')} className="h-5 w-5 mr-4 text-yellow-500 bg-slate-600 border-slate-500 focus:ring-yellow-500 focus:ring-offset-slate-800" />
                        <div>
                            <p className="font-semibold">Tạo mới</p>
                            <p className="text-sm text-slate-400">Tự do sáng tạo một vật phẩm, công pháp hoàn toàn mới.</p>
                        </div>
                    </label>
                </div>
                <div className="mt-6 flex gap-4">
                    <button type="button" onClick={onClose} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded transition-colors">Hủy</button>
                    <button type="button" onClick={() => choice === 'new' ? onSelectNew() : onSelectExisting()} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded transition-colors">Tiếp tục</button>
                </div>
            </div>
        </div>
    );
};

const ThienThuSelectorModal = ({ type, onClose, onSelect, customThienThu }: { 
    type: string, 
    onClose: () => void, 
    onSelect: (item: InitialItem | InitialCongPhap) => void,
    customThienThu: {
        vatPhamTieuHao: InitialItem[];
        trangBi: InitialItem[];
        phapBao: InitialItem[];
        congPhap: InitialCongPhap[];
    }
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [vatPhamFilter, setVatPhamFilter] = useState('Tất cả');
    const [nguHanhFilter, setNguHanhFilter] = useState('Tất cả');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | 'none' }>({ key: 'rank', direction: 'none' });

    const handleSort = () => {
        setSortConfig(current => {
            if (current.direction === 'none') return { ...current, direction: 'asc' };
            if (current.direction === 'asc') return { ...current, direction: 'desc' };
            return { ...current, direction: 'none' };
        });
    };
    const sortIcon = sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '↕';

    const sourceList = React.useMemo(() => {
        switch(type) {
            case 'item':
                return customThienThu.vatPhamTieuHao;
            case 'trangBi':
                return customThienThu.trangBi;
            case 'phapBao':
                return customThienThu.phapBao;
            case 'congPhap':
                return customThienThu.congPhap;
            default:
                return [];
        }
    }, [type, customThienThu]);

    const filteredAndSortedItems = React.useMemo(() => {
        let items = sourceList.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (vatPhamFilter !== 'Tất cả') {
            switch(type) {
                case 'item':
                    items = items.filter(i => 'consumableType' in i && (i as InitialItem).consumableType === vatPhamFilter);
                    break;
                case 'trangBi':
                    items = items.filter(i => 'equipmentType' in i && (i as InitialItem).equipmentType === vatPhamFilter);
                    break;
                case 'phapBao':
                    // Pháp bảo uses itemType for filtering
                    items = items.filter(i => 'itemType' in i && (i as InitialItem).itemType === 'Pháp bảo');
                    break;
            }
        }
        
        if (nguHanhFilter !== 'Tất cả') {
            items = items.filter(i => 'nguHanhAttribute' in i && i.nguHanhAttribute === nguHanhFilter.toLowerCase());
        }

        items.sort((a, b) => {
            const isLockedA = (a.rank || 0) >= 3;
            const isLockedB = (b.rank || 0) >= 3;

            if (isLockedA && !isLockedB) return 1; // Locked items go to the bottom
            if (!isLockedA && isLockedB) return -1; // Unlocked items go to the top

            if (sortConfig.direction !== 'none') {
                const rankA = a.rank || 0;
                const rankB = b.rank || 0;
                if (rankA < rankB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (rankA > rankB) return sortConfig.direction === 'asc' ? 1 : -1;
            }

            return 0;
        });

        return items;
    }, [searchTerm, sourceList, vatPhamFilter, nguHanhFilter, sortConfig, type]);

    const vatPhamFilterOptions = React.useMemo(() => {
        const vatPhamSubtypes = ['Đan dược', 'Vật liệu', 'Khoáng thạch', 'Thảo dược', 'Khác'];
        const equipmentSubtypes: EquipmentType[] = ['Vũ khí', 'Áo choàng', 'Giáp', 'Mũ', 'Găng tay', 'Giày', 'Phụ kiện', 'Trang sức'];
        switch (type) {
            case 'item':
                return ['Tất cả', ...vatPhamSubtypes];
            case 'trangBi':
                return ['Tất cả', ...equipmentSubtypes];
            case 'phapBao':
                return ['Tất cả', 'Pháp bảo'];
            default:
                return [];
        }
    }, [type]);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800/95 backdrop-blur-sm border border-yellow-500 rounded-lg p-6 shadow-xl w-full max-w-4xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-yellow-300 mb-4 flex-shrink-0">Thêm từ Thiên Thư</h2>
                <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:col-span-2 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                    />
                    {type !== 'congPhap' && (
                        <div>
                            <select value={vatPhamFilter} onChange={e => setVatPhamFilter(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                                {vatPhamFilterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    )}
                     <div>
                        <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                            <option>Tất cả</option>
                            <option>Kim</option>
                            <option>Mộc</option>
                            <option>Thủy</option>
                            <option>Hỏa</option>
                            <option>Thổ</option>
                        </select>
                    </div>
                     <button onClick={handleSort} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white hover:bg-slate-600">
                        Sắp xếp Phẩm chất {sortIcon}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto styled-scrollbar space-y-2 pr-2">
                    {filteredAndSortedItems.map(item => (
                         <div 
                            key={item.id} 
                            className={`p-2 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center justify-between transition-opacity hover:bg-slate-800/50`}
                        >
                            <div className="flex items-center gap-3 flex-grow">
                                <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden">
                                    {(() => {
                                        const imageUrl = getImageUrl(item.imageId);
                                        return imageUrl ? (
                                            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                <Icons.QuestionMarkCircleIcon className="w-8 h-8"/>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="flex-grow">
                                    <p className={`font-semibold ${getRankColor(item.rank)}`}>{item.name}</p>
                                    <p className="text-xs text-slate-400 italic mt-1">{item.description}</p>
                                </div>
                            </div>
                            <button onClick={() => onSelect(item)} className="p-2 text-green-400 hover:bg-slate-700 rounded-full flex-shrink-0">
                                <Icons.PlusCircleIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex-shrink-0">
                    <button type="button" onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded transition-colors">Đóng</button>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// 4. EDITOR COMPONENTS (GỘP TỪ CÁC FILE)
// =================================================================

const CultivationEditor: React.FC<{
    system: CultivationTier[],
    setSystem: React.Dispatch<React.SetStateAction<CultivationTier[]>>,
    onOpenSimulator: (selection: { tierId: string, majorId?: string, minorId?: string }) => void,
}> = ({ system, setSystem, onOpenSimulator }) => {
    const [modalState, setModalState] = useState<{ type: 'tier' | 'major' | 'minor', data: any | null, parentIds?: { tierId?: string, majorId?: string } } | null>(null);
    const [expandedTierId, setExpandedTierId] = useState<string | null>(system[0]?.id || null);
    const [expandedMajorRealmIds, setExpandedMajorRealmIds] = useState<Record<string, string | null>>({});

    const handleSave = ({ type, data, parentIds }: { type: string, data: any, parentIds?: any }) => {
        setSystem(prev => {
            const newSystem = JSON.parse(JSON.stringify(prev));
            if (type === 'tier') {
                const index = newSystem.findIndex((t: CultivationTier) => t.id === data.id);
                if (index > -1) newSystem[index] = data; else newSystem.push(data);
            } else if (type === 'major' && parentIds?.tierId) {
                const tier = newSystem.find((t: CultivationTier) => t.id === parentIds.tierId);
                if (tier) {
                    const index = tier.realms.findIndex((m: MajorRealm) => m.id === data.id);
                    if (index > -1) tier.realms[index] = data; else tier.realms.push(data);
                }
            } else if (type === 'minor' && parentIds?.tierId && parentIds?.majorId) {
                const tier = newSystem.find((t: CultivationTier) => t.id === parentIds.tierId);
                const major = tier?.realms.find((m: MajorRealm) => m.id === parentIds.majorId);
                if (major) {
                    const index = major.minorRealms.findIndex((sm: MinorRealm) => sm.id === data.id);
                    if (index > -1) major.minorRealms[index] = data; else major.minorRealms.push(data);
                }
            }
            return newSystem;
        });
        setModalState(null);
    };

    const handleDelete = (type: 'tier' | 'major' | 'minor', ids: { tierId: string, majorId?: string, minorId?: string }) => {
        if (ids.tierId === 'pham_nhan_tier_0') return;

        setSystem(prev => {
            if (type === 'tier') {
                return prev.filter(t => t.id !== ids.tierId);
            }
            if (type === 'major' && ids.majorId) {
                return prev.map(t => t.id === ids.tierId ? { ...t, realms: t.realms.filter(m => m.id !== ids.majorId) } : t);
            }
            if (type === 'minor' && ids.majorId && ids.minorId) {
                return prev.map(t => t.id === ids.tierId ? { ...t, realms: t.realms.map(m => m.id === ids.majorId ? { ...m, minorRealms: m.minorRealms.filter(sm => sm.id !== ids.minorId) } : m) } : t);
            }
            return prev;
        });
    };

    const handleToggleMajorRealm = (tierId: string, majorRealmId: string) => {
        setExpandedMajorRealmIds(prev => ({
            ...prev,
            [tierId]: prev[tierId] === majorRealmId ? null : majorRealmId
        }));
    };

    return (
        <div className="h-full flex flex-col">
            {modalState && (
                <CultivationModal modalState={modalState} onClose={() => setModalState(null)} onSave={handleSave} />
            )}
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-yellow-300 flex items-center gap-3">
                    <Icons.CpuChipIcon className="w-6 h-6"/>
                    Hệ Thống Cảnh Giới
                </h3>
                <button onClick={() => setModalState({ type: 'tier', data: null })} className="flex items-center gap-2 text-sm bg-green-600/80 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded-md transition-colors">
                    <Icons.PlusCircleIcon className="w-5 h-5"/> Thêm Cấp Bậc
                </button>
            </div>
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-2 space-y-2">
                {system.map(tier => {
                    const isLocked = tier.id === 'pham_nhan_tier_0';
                    return (
                        <div key={tier.id} className={`bg-slate-800/50 rounded-lg border border-slate-700 ${isLocked ? 'opacity-70' : ''}`}>
                            <div className="p-2 flex items-center justify-between">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => !isLocked && setExpandedTierId(prev => prev === tier.id ? null : tier.id)}>
                                    {isLocked 
                                        ? <Icons.LockClosedIcon className="w-5 h-5 text-slate-400"/>
                                        : (expandedTierId === tier.id ? <Icons.ChevronUpIcon className="w-5 h-5 text-slate-400"/> : <Icons.ChevronDownIcon className="w-5 h-5 text-slate-400"/>)
                                    }
                                    <span className="font-bold text-lg text-yellow-200">{tier.name}</span>
                                </div>
                                {!isLocked && (
                                    <div className="flex items-center gap-1">
                                        <button title="Chỉnh sửa" onClick={(e) => { e.stopPropagation(); setModalState({ type: 'tier', data: tier }); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
                                        <button title="Xóa" onClick={(e) => { e.stopPropagation(); handleDelete('tier', { tierId: tier.id }); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                )}
                            </div>
                            {(expandedTierId === tier.id || isLocked) && (
                                <div className="pl-6 pr-2 pb-2 space-y-1">
                                    {tier.realms.map(majorRealm => {
                                        const isMajorLocked = majorRealm.id === 'pham_nhan_realm_0';
                                        return (
                                            <div key={majorRealm.id} className="bg-slate-700/40 rounded-md border border-slate-600">
                                                <div className="p-2 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => !isMajorLocked && handleToggleMajorRealm(tier.id, majorRealm.id)}>
                                                        {isMajorLocked 
                                                            ? <Icons.LockClosedIcon className="w-4 h-4 text-slate-400"/>
                                                            : (expandedMajorRealmIds[tier.id] === majorRealm.id ? <Icons.ChevronUpIcon className="w-4 h-4 text-slate-400"/> : <Icons.ChevronDownIcon className="w-4 h-4 text-slate-400"/>)
                                                        }
                                                        <span className="font-semibold text-cyan-300">{majorRealm.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button title="Diễn Thiên Kính" onClick={(e) => { e.stopPropagation(); onOpenSimulator({ tierId: tier.id, majorId: majorRealm.id }); }} className="p-1 text-green-400 hover:bg-slate-700 rounded-full"><Icons.ScaleIcon className="w-4 h-4"/></button>
                                                        {!isMajorLocked && (
                                                            <>
                                                                <button title="Chỉnh sửa" onClick={(e) => { e.stopPropagation(); setModalState({ type: 'major', data: majorRealm, parentIds: { tierId: tier.id } }); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
                                                                <button title="Xóa" onClick={(e) => { e.stopPropagation(); handleDelete('major', { tierId: tier.id, majorId: majorRealm.id }); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {expandedMajorRealmIds[tier.id] === majorRealm.id && !isMajorLocked && (
                                                    <div className="pl-6 pr-2 pb-2 space-y-1 text-sm">
                                                        {majorRealm.hasQualities && majorRealm.qualities && majorRealm.qualities.length > 0 && (
                                                            <div className="space-y-1 my-2">
                                                                <h5 className="text-xs font-bold text-slate-400">Phẩm chất có thể đạt được:</h5>
                                                                {majorRealm.qualities.map(quality => (
                                                                    <div key={quality.id} className="p-1.5 bg-yellow-900/30 border-l-2 border-yellow-500 rounded-r-md flex items-center justify-between">
                                                                        <span className="font-semibold text-yellow-300">{quality.name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {majorRealm.minorRealms.map(minorRealm => (
                                                            <div key={minorRealm.id} className="p-1.5 bg-slate-600/30 rounded flex items-center justify-between">
                                                                <span>{minorRealm.name} {minorRealm.isHidden && <span className="text-xs text-purple-400">(Ẩn)</span>}</span>
                                                                <div className="flex items-center gap-1">
                                                                    <button title="Diễn Thiên Kính" onClick={(e) => { e.stopPropagation(); onOpenSimulator({ tierId: tier.id, majorId: majorRealm.id, minorId: minorRealm.id }); }} className="p-1 text-green-400 hover:bg-slate-700 rounded-full"><Icons.ScaleIcon className="w-4 h-4"/></button>
                                                                    <button title="Chỉnh sửa" onClick={(e) => { e.stopPropagation(); setModalState({ type: 'minor', data: minorRealm, parentIds: { tierId: tier.id, majorId: majorRealm.id } }); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
                                                                    <button title="Xóa" onClick={(e) => { e.stopPropagation(); handleDelete('minor', { tierId: tier.id, majorId: majorRealm.id, minorId: minorRealm.id }); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => setModalState({ type: 'minor', data: null, parentIds: { tierId: tier.id, majorId: majorRealm.id } })} className="w-full text-xs p-1 mt-1 bg-green-800/50 hover:bg-green-700/50 rounded-md transition-colors">Thêm Tiểu Cảnh Giới</button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {!isLocked && <button onClick={() => setModalState({ type: 'major', data: null, parentIds: { tierId: tier.id } })} className="w-full text-sm p-2 mt-2 bg-blue-800/50 hover:bg-blue-700/50 rounded-md transition-colors">Thêm Đại Cảnh Giới</button>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const WorldElementsEditor: React.FC<any> = ({
    initialNpcs, setInitialNpcs,
    initialSects, setInitialSects,
    initialLocations, setInitialLocations,
    initialProvinces, setInitialProvinces,
    initialWorldRegions, setInitialWorldRegions,
    startingLocationId, setStartingLocationId,
    setModalState,
    setAssignmentModalState
}) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-yellow-300 flex items-center gap-3"><Icons.MapIcon className="w-6 h-6"/> Cấu Trúc Thế Giới</h3>
                <button onClick={() => setModalState({ type: 'worldRegion', data: null })} className="flex items-center gap-2 text-sm bg-green-600/80 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded-md transition-colors"><Icons.PlusCircleIcon className="w-5 h-5"/> Thêm Đại Vực</button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto styled-scrollbar pr-2 -mr-2">
                {initialWorldRegions.length > 0 ? initialWorldRegions.map((region: InitialWorldRegion) => (
                    <EditableElement
                        key={region.id}
                        item={region}
                        icon={<Icons.SparklesIcon className="w-6 h-6 text-yellow-300"/>}
                        onEdit={() => setModalState({ type: 'worldRegion', data: region })}
                        onDelete={() => setInitialWorldRegions((p: InitialWorldRegion[]) => p.filter(i => i.id !== region.id))}
                        onAddChild={() => setModalState({ type: 'province', data: null, parentIds: { worldRegionId: region.id } })}
                        addChildLabel="Thêm Châu Lục"
                    >
                        <div className="space-y-2">
                            {initialProvinces.filter(p => p.worldRegionId === region.id).map((province: InitialProvince) => (
                                <EditableElement
                                    key={province.id}
                                    item={province}
                                    icon={<Icons.MapIcon className="w-5 h-5 text-cyan-300"/>}
                                    onEdit={() => setModalState({ type: 'province', data: province, parentIds: { worldRegionId: region.id } })}
                                    onDelete={() => setInitialProvinces((p: InitialProvince[]) => p.filter(i => i.id !== province.id))}
                                    onAddChild={() => setModalState({ type: 'location', data: null, parentIds: { provinceId: province.id } })}
                                    addChildLabel="Thêm Khu Vực"
                                >
                                    <div className="space-y-1">
                                        {initialLocations.filter(l => l.provinceId === province.id).map((location: InitialLocation) => (
                                            <LocationItem
                                                key={location.id}
                                                location={location}
                                                isStartPoint={startingLocationId === location.id}
                                                onSetStartPoint={() => setStartingLocationId((prev: string | null) => prev === location.id ? null : location.id)}
                                                onEdit={() => setModalState({ type: 'location', data: location, parentIds: { provinceId: province.id } })}
                                                onDelete={() => setInitialLocations((p: InitialLocation[]) => p.filter(i => i.id !== location.id))}
                                                onOpenImageModal={() => setAssignmentModalState({
                                                    isOpen: true,
                                                    item: location,
                                                    onAssign: (imageId: string) => setInitialLocations((p: InitialLocation[]) => p.map(i => i.id === location.id ? { ...i, imageId } : i))
                                                })}
                                            />
                                        ))}
                                    </div>
                                </EditableElement>
                            ))}
                        </div>
                    </EditableElement>
                )) : <p className="text-sm text-slate-400 italic text-center py-8">Hãy bắt đầu bằng việc thêm một Đại Vực.</p>}
            </div>
        </div>
    );
};


const ItemsEditor: React.FC<any> = ({ initialItems, onAdd, onEdit, onDelete, onOpenImageModal }) => (
    <EditableElementList title="Vật Phẩm Tiêu Hao" icon={<Icons.SparklesIcon className="w-6 h-6"/>} items={initialItems} onAdd={onAdd} renderItem={(item: InitialItem) => <CollapsibleElement item={item} typeLabel={item.consumableType || 'Tiêu hao'} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} onOpenImageModal={() => onOpenImageModal(item)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{item.attributes && Object.keys(item.attributes).length > 0 && (<p><strong className="text-slate-400">Thuộc tính:</strong> {Object.entries(item.attributes).map(([key, value]) => `${PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: +${value}`).join(', ')}</p>)}</CollapsibleElement>} />
);

const EquipmentEditor: React.FC<any> = ({ initialTrangBi, onAdd, onEdit, onDelete, onOpenImageModal }) => (
    <EditableElementList title="Trang Bị" icon={<Icons.ShieldCheckIcon className="w-6 h-6"/>} items={initialTrangBi} onAdd={onAdd} renderItem={(item: InitialItem) => <CollapsibleElement item={item} typeLabel={item.equipmentType || 'Trang bị'} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} onOpenImageModal={() => onOpenImageModal(item)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{item.attributes && Object.keys(item.attributes).length > 0 && (<p><strong className="text-slate-400">Thuộc tính:</strong> {Object.entries(item.attributes).map(([key, value]) => `${PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: +${value}`).join(', ')}</p>)}</CollapsibleElement>} />
);

const TreasuresEditor: React.FC<any> = ({ initialPhapBao, onAdd, onEdit, onDelete, onOpenImageModal }) => (
     <EditableElementList title="Pháp Bảo" icon={<Icons.HammerIcon className="w-6 h-6"/>} items={initialPhapBao} onAdd={onAdd} renderItem={(item: InitialItem) => <CollapsibleElement item={item} typeLabel={'Pháp bảo'} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} onOpenImageModal={() => onOpenImageModal(item)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{item.attributes && Object.keys(item.attributes).length > 0 && (<p><strong className="text-slate-400">Thuộc tính:</strong> {Object.entries(item.attributes).map(([key, value]) => `${PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: +${value}`).join(', ')}</p>)}</CollapsibleElement>} />
);

const TechniquesEditor: React.FC<any> = ({ initialCongPhap, onAdd, onEdit, onDelete, onOpenImageModal }) => (
    <EditableElementList title="Công Pháp" icon={<Icons.BookOpenIcon className="w-6 h-6"/>} items={initialCongPhap} onAdd={onAdd} renderItem={(item: InitialCongPhap) => <CollapsibleElement item={item} typeLabel={item.techniqueType} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} onOpenImageModal={() => onOpenImageModal(item)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{item.attributes && Object.keys(item.attributes).length > 0 && (<p><strong className="text-slate-400">Thuộc tính:</strong> {Object.entries(item.attributes).map(([key, value]) => `${PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: +${value}`).join(', ')}</p>)}</CollapsibleElement>} />
);

// =================================================================
// 5. CONTENT ROUTER (GỘP TỪ ElementContent.tsx)
// =================================================================

interface ElementsTabProps {
    initialItems: InitialItem[];
    setInitialItems: Dispatch<SetStateAction<InitialItem[]>>;
    initialTrangBi: InitialItem[];
    setInitialTrangBi: Dispatch<SetStateAction<InitialItem[]>>;
    initialPhapBao: InitialItem[];
    setInitialPhapBao: Dispatch<SetStateAction<InitialItem[]>>;
    initialCongPhap: InitialCongPhap[];
    setInitialCongPhap: Dispatch<SetStateAction<InitialCongPhap[]>>;
    initialNpcs: InitialNpc[];
    setInitialNpcs: Dispatch<SetStateAction<InitialNpc[]>>;
    initialSects: InitialSect[];
    setInitialSects: Dispatch<SetStateAction<InitialSect[]>>;
    initialLocations: InitialLocation[];
    setInitialLocations: Dispatch<SetStateAction<InitialLocation[]>>;
    initialProvinces: InitialProvince[];
    setInitialProvinces: Dispatch<SetStateAction<InitialProvince[]>>;
    initialWorldRegions: InitialWorldRegion[];
    setInitialWorldRegions: Dispatch<SetStateAction<InitialWorldRegion[]>>;
    startingLocationId: string | null;
    setStartingLocationId: Dispatch<SetStateAction<string | null>>;
    cultivationSystem: CultivationTier[];
    setCultivationSystem: Dispatch<SetStateAction<CultivationTier[]>>;
    onOpenSimulator: (selection: { tierId: string; majorId?: string; minorId?: string; }) => void;
    customThienThu: any;
    setCustomThienThu: Dispatch<SetStateAction<any>>;
}


interface ElementContentProps extends ElementsTabProps {
    activeTab: string;
    setModalState: React.Dispatch<React.SetStateAction<any>>;
    setChoiceModalState: React.Dispatch<React.SetStateAction<any>>;
    setAssignmentModalState: React.Dispatch<React.SetStateAction<any>>;
}


const ElementContent: React.FC<ElementContentProps> = ({
    activeTab,
    setModalState,
    setChoiceModalState,
    setAssignmentModalState,
    initialItems, setInitialItems,
    initialTrangBi, setInitialTrangBi,
    initialPhapBao, setInitialPhapBao,
    initialCongPhap, setInitialCongPhap,
    initialNpcs, setInitialNpcs,
    initialSects, setInitialSects,
    initialLocations, setInitialLocations,
    initialProvinces, setInitialProvinces,
    initialWorldRegions, setInitialWorldRegions,
    startingLocationId, setStartingLocationId,
    cultivationSystem, setCultivationSystem,
    onOpenSimulator
}) => {
    if (activeTab === 'item') {
        return <ItemsEditor
            initialItems={initialItems}
            onAdd={() => setChoiceModalState({ type: 'item' })}
            onEdit={(item: any) => setModalState({ type: 'item', data: item })}
            onDelete={(id: string) => setInitialItems((p: any) => p.filter((i: any) => i.id !== id))}
            onOpenImageModal={(item: any) => setAssignmentModalState({ isOpen: true, item: item, onAssign: (imageId: string) => setInitialItems((p: any) => p.map((i: any) => i.id === item.id ? { ...i, imageId } : i)) })}
        />
    }
    if (activeTab === 'trangBi') {
        return <EquipmentEditor
            initialTrangBi={initialTrangBi}
            onAdd={() => setChoiceModalState({ type: 'trangBi' })}
            onEdit={(item: any) => setModalState({ type: 'trangBi', data: item })}
            onDelete={(id: string) => setInitialTrangBi((p: any) => p.filter((i: any) => i.id !== id))}
            onOpenImageModal={(item: any) => setAssignmentModalState({ isOpen: true, item: item, onAssign: (imageId: string) => setInitialTrangBi((p: any) => p.map((i: any) => i.id === item.id ? { ...i, imageId } : i)) })}
        />
    }
    if (activeTab === 'phapBao') {
        return <TreasuresEditor
            initialPhapBao={initialPhapBao}
            onAdd={() => setChoiceModalState({ type: 'phapBao' })}
            onEdit={(item: any) => setModalState({ type: 'phapBao', data: item })}
            onDelete={(id: string) => setInitialPhapBao((p: any) => p.filter((i: any) => i.id !== id))}
            onOpenImageModal={(item: any) => setAssignmentModalState({ isOpen: true, item: item, onAssign: (imageId: string) => setInitialPhapBao((p: any) => p.map((i: any) => i.id === item.id ? { ...i, imageId } : i)) })}
        />
    }
    if (activeTab === 'congPhap') {
        return <TechniquesEditor
            initialCongPhap={initialCongPhap}
            onAdd={() => setChoiceModalState({ type: 'congPhap' })}
            onEdit={(item: any) => setModalState({ type: 'congPhap', data: item })}
            onDelete={(id: string) => setInitialCongPhap((p: any) => p.filter((i: any) => i.id !== id))}
            onOpenImageModal={(item: any) => setAssignmentModalState({ isOpen: true, item: item, onAssign: (imageId: string) => setInitialCongPhap((p: any) => p.map((i: any) => i.id === item.id ? { ...i, imageId } : i)) })}
        />
    }
    if (['npc', 'sect', 'location'].includes(activeTab)) {
        return <WorldElementsEditor
            initialNpcs={initialNpcs} setInitialNpcs={setInitialNpcs}
            initialSects={initialSects} setInitialSects={setInitialSects}
            initialLocations={initialLocations} setInitialLocations={setInitialLocations}
            initialProvinces={initialProvinces} setInitialProvinces={setInitialProvinces}
            initialWorldRegions={initialWorldRegions} setInitialWorldRegions={setInitialWorldRegions}
            startingLocationId={startingLocationId} setStartingLocationId={setStartingLocationId}
            setModalState={setModalState}
            setAssignmentModalState={setAssignmentModalState}
        />
    }
    if (activeTab === 'cultivation') {
        return <CultivationEditor system={cultivationSystem} setSystem={setCultivationSystem} onOpenSimulator={onOpenSimulator}/>
    }

    return null;
}

// =================================================================
// 6. MAIN EXPORT
// =================================================================

export const ElementsTab: React.FC<ElementsTabProps> = (props) => {
    const [activeTab, setActiveTab] = useState('item');
    
    const {
        modalState, setModalState,
        choiceModalState, setChoiceModalState,
        thienThuModalType, setThienThuModalType,
        assignmentModalState, setAssignmentModalState,
        handleSave, handleAddFromThienThu
    } = useElementModals({
        setInitialItems: props.setInitialItems,
        setInitialTrangBi: props.setInitialTrangBi,
        setInitialPhapBao: props.setInitialPhapBao,
        setInitialCongPhap: props.setInitialCongPhap,
        setInitialNpcs: props.setInitialNpcs,
        setInitialSects: props.setInitialSects,
        setInitialLocations: props.setInitialLocations,
        setInitialProvinces: props.setInitialProvinces,
        setInitialWorldRegions: props.setInitialWorldRegions,
    });


    const tabs = [
        { id: 'item', label: 'Vật Phẩm', icon: <Icons.SparklesIcon className="w-5 h-5"/> },
        { id: 'trangBi', label: 'Trang Bị', icon: <Icons.ShieldCheckIcon className="w-5 h-5"/> },
        { id: 'phapBao', label: 'Pháp Bảo', icon: <Icons.HammerIcon className="w-5 h-5"/> },
        { id: 'congPhap', label: 'Công Pháp', icon: <Icons.BookOpenIcon className="w-5 h-5"/> },
        { id: 'npc', label: 'NPC', icon: <Icons.UserPlusIcon className="w-5 h-5"/> },
        { id: 'sect', label: 'Môn Phái', icon: <Icons.BuildingLibraryIcon className="w-5 h-5"/> },
        { id: 'location', label: 'Thế Giới', icon: <Icons.MapIcon className="w-5 h-5"/> },
        { id: 'cultivation', label: 'Hệ Thống Cảnh Giới', icon: <Icons.CpuChipIcon className="w-5 h-5"/> },
    ];
    
    return (
        <div className="flex flex-col md:flex-row gap-4 h-full">
            {modalState && <ElementModal modalState={modalState} onClose={() => setModalState(null)} onSave={handleSave} allSects={props.initialSects} allLocations={props.initialLocations} allProvinces={props.initialProvinces} allWorldRegions={props.initialWorldRegions}/>}
            {choiceModalState && <AddElementChoiceModal
                onClose={() => setChoiceModalState(null)}
                onSelectNew={() => {
                    setModalState({ type: choiceModalState.type, data: null });
                    setChoiceModalState(null);
                }}
                onSelectExisting={() => {
                    setThienThuModalType(choiceModalState.type);
                    setChoiceModalState(null);
                }}
            />}
            {thienThuModalType && <ThienThuSelectorModal type={thienThuModalType} onClose={() => setThienThuModalType(null)} onSelect={handleAddFromThienThu} customThienThu={props.customThienThu}/>}
            <ImageAssignmentModal
                isOpen={assignmentModalState.isOpen}
                onClose={() => setAssignmentModalState({ ...assignmentModalState, isOpen: false })}
                item={assignmentModalState.item}
                onAssign={(imageId) => {
                    if (assignmentModalState.onAssign) {
                        assignmentModalState.onAssign(imageId);
                    }
                    setAssignmentModalState({ ...assignmentModalState, isOpen: false });
                }}
            />

            <div className="w-full md:w-1/4 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-700/50 pb-2 md:pb-0 md:pr-4">
                <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible styled-scrollbar pb-2 md:pb-0">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 text-left p-3 rounded text-sm font-semibold transition-colors disabled:text-slate-500 disabled:cursor-not-allowed flex-shrink-0 md:w-full ${activeTab === tab.id ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ElementContent {...props} activeTab={activeTab} setModalState={setModalState} setChoiceModalState={setChoiceModalState} setAssignmentModalState={setAssignmentModalState} />
            </div>
        </div>
    )
};