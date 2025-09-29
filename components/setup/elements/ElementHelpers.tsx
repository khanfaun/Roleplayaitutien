import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { InitialItem, InitialCongPhap, InitialNpc, InitialSect, ItemEffectDefinition, EquipmentType, TechniqueType, NguHanhType } from '../../../types';
import * as Icons from '../../Icons';
import { SmartTooltip } from '../../SmartTooltip';
import { ALL_ITEM_EFFECT_DEFINITIONS } from '../../../data/effects';
import { getImageUrl } from '../../GamePanels';

// SHARED HELPERS & CONSTANTS
export const rankMap: Record<number, string> = {
    1: 'Phàm Phẩm',
    2: 'Hạ Phẩm',
    3: 'Trung Phẩm',
    4: 'Thượng Phẩm',
    5: 'Cực Phẩm',
    6: 'Chí Tôn'
};

export const getRankColor = (rank?: number) => {
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

export const NGU_HANH_DISPLAY: Record<NguHanhType, { icon: string; name: string; colors: string }> = {
    kim: { icon: '⚙️', name: 'Kim', colors: 'bg-gray-400 text-black' },
    moc: { icon: '🌳', name: 'Mộc', colors: 'bg-green-500 text-white' },
    thuy: { icon: '💧', name: 'Thủy', colors: 'bg-blue-500 text-white' },
    hoa: { icon: '🔥', name: 'Hỏa', colors: 'bg-red-500 text-white' },
    tho: { icon: '⛰️', name: 'Thổ', colors: 'bg-yellow-600 text-black' }
};


// HELPER COMPONENTS
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
        .filter((effect: ItemEffectDefinition) => category ? effect.category === category : false)
        .filter((effect: ItemEffectDefinition) => {
            if (itemType === 'trangBi' && itemSubType) {
                return effect.allowedEquipmentTypes?.includes(itemSubType as EquipmentType) ?? false;
            }
            if (itemType === 'congPhap' && itemSubType) {
                return effect.allowedTechniqueTypes?.includes(itemSubType as TechniqueType) ?? false;
            }
            return true;
        })
        .filter((effect: ItemEffectDefinition) => !(selectedIds || []).includes(effect.id));

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

type CollapsibleItem = InitialItem | InitialCongPhap | InitialNpc | InitialSect;

export const CollapsibleElement: React.FC<{ item: CollapsibleItem; typeLabel: string; onEdit: () => void; onDelete: () => void; onOpenImageModal: () => void; children: React.ReactNode; nameColorClass?: string }> = ({ item, typeLabel, children, onEdit, onDelete, onOpenImageModal, nameColorClass }) => {
    const rank = 'rank' in item ? item.rank : undefined;
    const hasImage = 'imageId' in item || 'itemType' in item || 'techniqueType' in item;

    return (
        <details className="bg-slate-800/50 rounded-md border border-slate-700/50 overflow-hidden">
            <summary className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-700/30">
                <div className="flex-grow flex items-center gap-3">
                    {hasImage && (
                        <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden relative group">
                            {(() => {
                                const imageUrl = 'imageId' in item ? getImageUrl(item.imageId) : null;
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
                    )}
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center flex-wrap gap-2">
                             <span className={`font-semibold ${nameColorClass || getRankColor(rank)}`}>{item.name}</span>
                             <span className="text-xs text-slate-400">({typeLabel})</span>
                             {'nguHanhAttribute' in item && item.nguHanhAttribute && NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType] && (
                                <span className={`px-2 py-0.5 text-xs font-bold rounded inline-flex items-center gap-1 self-start ${NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].colors}`}>
                                    <span>{NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].icon}</span>
                                    <span>{NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].name}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
                </div>
            </summary>
            <div className="p-3 border-t border-slate-700/50 bg-slate-900/30 text-xs space-y-2">
                {children}
                {'effectIds' in item && item.effectIds && item.effectIds.length > 0 && (
                    <div>
                        <strong className="text-slate-400">Hiệu ứng:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {item.effectIds.map(id => <EffectSelector key={id} selectedIds={[id]} onChange={() => {}} itemType="display" />)}
                        </div>
                    </div>
                )}
            </div>
        </details>
    );
};

export const EditableElementList: React.FC<{ title: string; icon: React.ReactNode; items: any[]; onAdd: () => void; renderItem: (item: any) => React.ReactNode; }> = ({ title, icon, items, onAdd, renderItem }) => (
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

export const EditableElement: React.FC<{ item: any; icon: React.ReactNode; onEdit: () => void; onDelete: () => void; onAddChild?: () => void; addChildLabel?: string; children?: React.ReactNode; }> = ({ item, icon, onEdit, onDelete, onAddChild, addChildLabel, children }) => {
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