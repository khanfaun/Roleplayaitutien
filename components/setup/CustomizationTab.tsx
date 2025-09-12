import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { DestinyDefinition, StatusEffect, ItemEffectDefinition, PlayerAttributes, InitialItem, InitialCongPhap, InitialItemType, ConsumableType, EquipmentType, TechniqueType, NguHanhType, ThienThuImageManifest } from '../../types';
import * as Icons from '../Icons';
import { PlusCircleIcon, PencilIcon, TrashIcon, XIcon, CheckIcon } from '../Icons';
import { PLAYER_ATTRIBUTE_NAMES, ALL_STAT_NAMES } from '../../constants';
import { THIEN_THU_VAT_PHAM_TIEU_HAO, THIEN_THU_TRANG_BI, THIEN_THU_PHAP_BAO, THIEN_THU_CONG_PHAP } from '../../data/thienThu';
import { SmartTooltip } from '../SmartTooltip';
import { EffectSelector, ElementModal } from './ElementsTab';
import { ImageAssignmentModal } from '../GamePanels';
import * as geminiService from '../../services/geminiService';
import { STATUS_EFFECT_DEFINITIONS, ALL_ITEM_EFFECT_DEFINITIONS } from '../../data/effects';


const getImageUrl = (imageId: string | undefined) => {
    if (!imageId) return null;
    if (imageId.startsWith('http')) return imageId;
    return `/assets/thienthu/${imageId}`;
};

const rankMap: Record<number, string> = { 1: 'Phàm Phẩm', 2: 'Hạ Phẩm', 3: 'Trung Phẩm', 4: 'Thượng Phẩm', 5: 'Cực Phẩm', 6: 'Chí Tôn' };

const EffectStatusModal = ({ modalState, onClose, onSave }: {
    modalState: { type: 'hieuUng' | 'trangThai', data: any | null };
    onClose: () => void;
    onSave: (data: any) => void;
}) => {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        const defaults = {
            id: modalState.data?.id || `${modalState.type}_${Date.now()}`,
            name: '',
            description: '',
        };
        
        let typeDefaults = {};
        if (modalState.type === 'hieuUng') {
            typeDefaults = { rank: 1, category: 'consumable' };
        } else if (modalState.type === 'trangThai') {
            typeDefaults = { type: 'neutral', duration: -1, effects: {} };
        }

        const initialData = { ...defaults, ...typeDefaults, ...(modalState.data || {}) };

        if (modalState.type === 'trangThai') {
            initialData.enableAttributeChangePercent = !!modalState.data?.effects?.attributeChangePercent;
            initialData.enablePrimaryStatChangePercent = !!modalState.data?.effects?.primaryStatChangePercent;
        }
        
        setFormData(initialData);
    }, [modalState]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleNestedNumberChange = (group: string, field: string, value: string, isPercent: boolean = false) => {
        const numValue = parseInt(value, 10);
        const finalValue = isNaN(numValue) ? 0 : numValue;
    
        const groupKey = isPercent ? `${group}Percent` : group;
    
        setFormData((prev: any) => {
            const newEffects = { ...(prev.effects || {}) };
            newEffects[groupKey] = { ...(newEffects[groupKey] || {}), [field]: finalValue };
    
            return { ...prev, effects: newEffects };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = { ...formData };
    
        if (modalState.type === 'trangThai') {
            if (finalData.effects) {
                if (!finalData.enableAttributeChangePercent || Object.values(finalData.effects.attributeChangePercent || {}).every(v => v === 0)) {
                    delete finalData.effects.attributeChangePercent;
                }
                if (!finalData.enablePrimaryStatChangePercent || Object.values(finalData.effects.primaryStatChangePercent || {}).every(v => v === 0)) {
                    delete finalData.effects.primaryStatChangePercent;
                }
    
                if (Object.keys(finalData.effects).length === 0) {
                    delete finalData.effects;
                }
            }
        }
        
        delete finalData.enableAttributeChangePercent;
        delete finalData.enablePrimaryStatChangePercent;

        onSave(finalData);
    };

    const renderField = (id: string, label: string, type: 'text' | 'textarea' | 'number' | 'select', options?: any) => (
        <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-yellow-300 mb-1">{label}</label>
            {type === 'text' && <input id={id} type="text" value={formData[id] || ''} onChange={e => handleChange(id, e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />}
            {type === 'textarea' && <textarea id={id} value={formData[id] || ''} onChange={e => handleChange(id, e.target.value)} rows={3} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white styled-scrollbar" />}
            {type === 'number' && <input id={id} type="number" value={formData[id] ?? 0} onChange={e => handleChange(id, parseInt(e.target.value, 10) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />}
            {type === 'select' && <select id={id} value={formData[id] || ''} onChange={e => handleChange(id, id === 'rank' ? (parseInt(e.target.value, 10) || 1) : e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                {options.map((opt: string | {value: any, label: string}) => typeof opt === 'string' ? <option key={opt} value={opt}>{opt}</option> : <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>}
        </div>
    );

    const renderAttributeFields = (isPercent: boolean) => {
        const groupKey = isPercent ? 'attributeChangePercent' : 'attributeChange';
        const enableKey = isPercent ? 'enableAttributeChangePercent' : 'enableAttributeChange';
        const title = isPercent ? 'Thuộc tính cộng thêm (%)' : 'Thuộc tính cộng thêm (Giá trị cố định)';
        
        return (
            <details className="bg-slate-900/50 p-3 rounded-lg border border-slate-700" open={!!formData[enableKey]}>
                <summary className="font-semibold text-yellow-300 cursor-pointer flex items-center gap-2" onClick={(e) => { e.preventDefault(); handleChange(enableKey, !formData[enableKey]); }}>
                    <input
                        type="checkbox"
                        checked={!!formData[enableKey]}
                        onChange={e => handleChange(enableKey, e.target.checked)}
                        onClick={e => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-500 bg-slate-700 text-yellow-500 flex-shrink-0"
                    />
                    <span>{title}</span>
                </summary>
                {formData[enableKey] && (
                    <div className="mt-2 pt-3 border-t border-slate-700 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(PLAYER_ATTRIBUTE_NAMES).map(key => {
                                const attrKey = key as keyof PlayerAttributes;
                                return (
                                    <div key={attrKey}>
                                        <label htmlFor={`${groupKey}-${attrKey}`} className="block text-xs font-medium text-slate-300 mb-1">{PLAYER_ATTRIBUTE_NAMES[attrKey]}</label>
                                        <div className="flex items-center">
                                            <input
                                                id={`${groupKey}-${attrKey}`}
                                                type="number"
                                                value={formData.effects?.[groupKey]?.[attrKey] || 0}
                                                onChange={e => handleNestedNumberChange('attributeChange', attrKey, e.target.value, isPercent)}
                                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                            />
                                            {isPercent && <span className="ml-2 text-slate-400">%</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </details>
        );
    };
    
    const renderPrimaryStatFields = (isPercent: boolean) => {
        const groupKey = isPercent ? 'primaryStatChangePercent' : 'primaryStatChange';
        const enableKey = isPercent ? 'enablePrimaryStatChangePercent' : 'enablePrimaryStatChange';
        const title = isPercent ? 'Hồi phục / Suy giảm (%)' : 'Hồi phục / Suy giảm (Giá trị cố định)';
        const primaryStats = isPercent 
            ? { maxHp: 'Sinh lực tối đa', maxSpiritPower: 'Linh lực tối đa', maxStamina: 'Thể lực tối đa', maxMentalState: 'Tâm cảnh tối đa' }
            : { maxHp: 'Sinh lực tối đa', maxSpiritPower: 'Linh lực tối đa', maxStamina: 'Thể lực tối đa', maxMentalState: 'Tâm cảnh tối đa', lifespan: 'Tuổi thọ' };
    
        return (
            <details className="bg-slate-900/50 p-3 rounded-lg border border-slate-700" open={!!formData[enableKey]}>
                <summary className="font-semibold text-yellow-300 cursor-pointer flex items-center gap-2" onClick={(e) => { e.preventDefault(); handleChange(enableKey, !formData[enableKey]); }}>
                    <input
                        type="checkbox"
                        checked={!!formData[enableKey]}
                        onChange={e => handleChange(enableKey, e.target.checked)}
                        onClick={e => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-500 bg-slate-700 text-yellow-500 flex-shrink-0"
                    />
                    <span>{title}</span>
                </summary>
                {formData[enableKey] && (
                    <div className="mt-2 pt-3 border-t border-slate-700 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(primaryStats).map(([key, label]) => (
                                 <div key={key}>
                                    <label htmlFor={`${groupKey}-${key}`} className="block text-xs font-medium text-slate-300 mb-1">{label}</label>
                                    <div className="flex items-center">
                                        <input
                                            id={`${groupKey}-${key}`}
                                            type="number"
                                            value={formData.effects?.[groupKey]?.[key] || 0}
                                            onChange={e => handleNestedNumberChange('primaryStatChange', key, e.target.value, isPercent)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                        />
                                        {isPercent && <span className="ml-2 text-slate-400">%</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </details>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-800/95 backdrop-blur-sm border border-yellow-500 rounded-lg p-6 shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-yellow-300 mb-2">{modalState.data ? 'Chỉnh sửa' : 'Thêm'} {modalState.type === 'hieuUng' ? 'Hiệu Ứng' : 'Trạng Thái'}</h2>
                    <div className="max-h-[70vh] overflow-y-auto styled-scrollbar pr-4 space-y-4">
                        {renderField('name', 'Tên', 'text')}
                        {renderField('description', 'Mô tả', 'textarea')}
                        {modalState.type === 'hieuUng' && renderField('rank', 'Phẩm chất', 'select', Object.entries(rankMap).map(([value, label]) => ({value, label})))}
                        {modalState.type === 'hieuUng' && renderField('category', 'Loại hình', 'select', [
                            { value: 'consumable', label: 'Tiêu hao' },
                            { value: 'equipment', label: 'Trang bị' },
                            { value: 'treasure', label: 'Pháp bảo' },
                            { value: 'technique', label: 'Công pháp' },
                        ])}
                        {modalState.type === 'trangThai' && renderField('type', 'Loại', 'select', [
                             { value: 'buff', label: 'Tăng Ích' },
                             { value: 'debuff', label: 'Suy Giảm' },
                             { value: 'neutral', label: 'Trung lập' },
                        ])}
                        {modalState.type === 'trangThai' && renderField('duration', 'Thời gian (lượt, -1 là vĩnh viễn)', 'number')}
                        {modalState.type === 'trangThai' && renderField('expPerTurn', 'Kinh nghiệm cộng thêm mỗi lượt (+/-)', 'number')}
                        {modalState.type === 'trangThai' && (
                            <>
                                {renderPrimaryStatFields(true)}
                                {renderAttributeFields(true)}
                            </>
                        )}
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


// A generic component to display and manage a list of definitions
const DefinitionList: React.FC<{
    items: any[];
    onEdit?: (item: any) => void;
    onDelete?: (id: string) => void;
    onAdd?: () => void;
    renderItem: (item: any) => React.ReactNode;
    sortConfig?: { direction: 'asc' | 'desc' | 'none' };
    onSort?: () => void;
    onSave?: () => void;
    onLoad?: () => void;
    selectedItemIds?: Set<string>;
    onBulkAssign?: () => void;
    onBulkDelete?: () => void;
    onSelectAll?: (allIds: string[]) => void;
    isLoading?: boolean;
    hasImageAssignment?: boolean;
    sortLabel?: string;
}> = ({ items, onEdit, onDelete, onAdd, renderItem, sortConfig, onSort, onSave, onLoad, selectedItemIds, onBulkAssign, onBulkDelete, onSelectAll, isLoading, hasImageAssignment = true, sortLabel = 'Phẩm chất' }) => {
    const sortIcon = sortConfig?.direction === 'asc' ? '↑' : sortConfig?.direction === 'desc' ? '↓' : '↕';
    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                 <div className="flex items-center gap-2">
                    {onAdd && <button onClick={onAdd} className="flex items-center gap-1 text-sm bg-green-600/80 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded-md transition-colors">
                        <PlusCircleIcon className="w-5 h-5"/> Thêm mới
                    </button>}
                    {onLoad && <button onClick={onLoad} className="flex items-center gap-1 text-sm bg-cyan-600/80 hover:bg-cyan-700 text-white font-semibold px-3 py-1 rounded-md transition-colors">
                        Tải
                    </button>}
                    {onSave && <button onClick={onSave} className="flex items-center gap-1 text-sm bg-blue-600/80 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-md transition-colors">
                        Lưu
                    </button>}
                </div>
                 <div className="flex items-center gap-2">
                     {onSelectAll && selectedItemIds && <button onClick={() => onSelectAll(items.map(i => i.id))} className="flex items-center gap-1 text-sm font-semibold text-yellow-300 hover:underline">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedItemIds.size > 0 ? 'bg-yellow-400 border-yellow-300' : 'border-slate-500'}`}>
                           {selectedItemIds.size > 0 && <CheckIcon className="w-3 h-3 text-slate-800"/>}
                        </div>
                        <span>{selectedItemIds.size === items.length && items.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'} ({selectedItemIds.size})</span>
                    </button>}
                    {onBulkDelete && selectedItemIds && selectedItemIds.size > 0 && (
                         <button onClick={onBulkDelete} className="flex items-center gap-1 text-sm bg-red-600/80 hover:bg-red-700 text-white font-semibold px-2 py-1 rounded-md transition-colors">
                            <TrashIcon className="w-4 h-4"/> Xóa ({selectedItemIds.size})
                        </button>
                    )}
                     {hasImageAssignment && onBulkAssign && <button onClick={onBulkAssign} disabled={!selectedItemIds || selectedItemIds.size === 0 || isLoading} className="flex items-center justify-center gap-1 text-sm bg-purple-600/80 hover:bg-purple-700 text-white font-semibold px-3 py-1 rounded-md transition-colors disabled:opacity-50">
                        <Icons.SparklesIcon className="w-5 h-5"/> AI Gắn ảnh
                    </button>}
                    {onSort && sortConfig && <button onClick={onSort} className="flex items-center gap-1 text-sm bg-slate-600/80 hover:bg-slate-700 text-white font-semibold px-3 py-1 rounded-md transition-colors">
                        Sắp xếp {sortLabel} <span className="font-bold">{sortIcon}</span>
                    </button>}
                </div>
            </div>
            <div className="space-y-2">
                {items.map((item: any) => (
                    <div key={item.id}>
                        {renderItem(item)}
                    </div>
                ))}
            </div>
        </div>
    );
};


// Helper to render attributes in a readable format
const renderAttributes = (attributes: Partial<PlayerAttributes> | undefined) => {
    if (!attributes || Object.keys(attributes).length === 0) return null;
    return (
        <div>
            <strong className="text-slate-400">Thuộc tính:</strong>
            <ul className="list-disc list-inside pl-2">
                {Object.entries(attributes).map(([key, value]) => (
                    <li key={key}>{PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: <span className="text-green-300">+{value as number}</span></li>
                ))}
            </ul>
        </div>
    );
};

const getRankColor = (rank?: number) => {
    switch (rank) {
        case 1: return 'text-slate-300'; case 2: return 'text-green-400';
        case 3: return 'text-blue-400';  case 4: return 'text-purple-400';
        case 5: return 'text-orange-400';case 6: return 'text-red-500';
        default: return 'text-white';
    }
};

const getStatusTypeColor = (type: StatusEffect['type']) => {
    switch (type) {
        case 'buff': return 'text-green-400';
        case 'debuff': return 'text-red-400';
        case 'neutral': return 'text-slate-300';
        default: return 'text-white';
    }
};

const NGU_HANH_DISPLAY: Record<NguHanhType, { icon: string; name: string; colors: string }> = {
    kim: { icon: '⚙️', name: 'Kim', colors: 'bg-gray-400 text-black' },
    moc: { icon: '🌳', name: 'Mộc', colors: 'bg-green-500 text-white' },
    thuy: { icon: '💧', name: 'Thủy', colors: 'bg-blue-500 text-white' },
    hoa: { icon: '🔥', name: 'Hỏa', colors: 'bg-red-500 text-white' },
    tho: { icon: '⛰️', name: 'Thổ', colors: 'bg-yellow-600 text-black' }
};

const EditableThienThuElement: React.FC<{
    item: any;
    typeLabel: string;
    children: React.ReactNode;
    onEdit: () => void;
    onDelete: () => void;
    nameColorClass?: string;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onOpenImageModal: () => void;
    onUnassignImage: () => void;
}> = ({ item, typeLabel, children, onEdit, onDelete, nameColorClass, isSelected, onToggleSelect, onOpenImageModal, onUnassignImage }) => (
    <details className="bg-slate-800/50 rounded-md border border-slate-700/50 overflow-hidden">
        <summary className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-700/30">
            <div className="flex-grow flex items-center gap-3">
                 <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    onClick={e => e.stopPropagation()}
                    className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500 flex-shrink-0"
                />
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
                    {item.imageId && (
                        <button onClick={(e) => { e.stopPropagation(); onUnassignImage(); }} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Gỡ ảnh">
                             <Icons.XIcon className="w-3 h-3"/>
                        </button>
                    )}
                     <button
                        onClick={(e) => { e.stopPropagation(); onOpenImageModal(); }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Đổi hình ảnh"
                     >
                        <Icons.PencilIcon className="w-6 h-6 text-white"/>
                    </button>
                </div>
                <div className="flex flex-col">
                    <div>
                        <span className={`font-semibold ${nameColorClass || getRankColor(item.rank)}`}>{item.name}</span>
                        <span className="text-xs text-slate-400 ml-2">({typeLabel})</span>
                    </div>
                     {item.nguHanhAttribute && NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType] && (
                        <span className={`mt-1 px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 self-start ${NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].colors}`}>
                            <span>{NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].icon}</span>
                            <span>{NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].name}</span>
                        </span>
                    )}
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

interface CustomizationTabProps {
    destinyDefs: Record<string, DestinyDefinition>;
    setDestinyDefs: React.Dispatch<React.SetStateAction<Record<string, DestinyDefinition>>>;
    statusEffectDefs: Record<string, StatusEffect>;
    setStatusEffectDefs: React.Dispatch<React.SetStateAction<Record<string, StatusEffect>>>;
    itemEffectDefs: Record<string, ItemEffectDefinition>;
    setItemEffectDefs: React.Dispatch<React.SetStateAction<Record<string, ItemEffectDefinition>>>;
    customThienThu: any;
    setCustomThienThu: React.Dispatch<React.SetStateAction<any>>;
}

export const CustomizationTab: React.FC<CustomizationTabProps> = (props) => {
    const { customThienThu, setCustomThienThu } = props;

    type ThienThuTab = 'vatPham' | 'trangBi' | 'phapBao' | 'congPhap' | 'hieuUng' | 'trangThai';
    const [activeTab, setActiveTab] = useState<ThienThuTab>('vatPham');
    const [modalState, setModalState] = useState<{type: string, data: any | null} | null>(null);
    const [effectStatusModalState, setEffectStatusModalState] = useState<{type: 'hieuUng' | 'trangThai', data: any | null} | null>(null);
    const [itemSortOrder, setItemSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
    const [trangThaiSortOrder, setTrangThaiSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // Item state is derived from props
    const { vatPhamTieuHao: vatPham, trangBi, phapBao, congPhap, hieuUng, trangThai } = customThienThu;
    
    // Create setter functions that update the parent state
    const setVatPham = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, vatPhamTieuHao: typeof updater === 'function' ? updater(prev.vatPhamTieuHao) : updater }));
    const setTrangBi = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, trangBi: typeof updater === 'function' ? updater(prev.trangBi) : updater }));
    const setPhapBao = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, phapBao: typeof updater === 'function' ? updater(prev.phapBao) : updater }));
    const setCongPhap = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, congPhap: typeof updater === 'function' ? updater(prev.congPhap) : updater }));
    const setHieuUng = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, hieuUng: typeof updater === 'function' ? updater(prev.hieuUng) : updater }));
    const setTrangThai = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, trangThai: typeof updater === 'function' ? updater(prev.trangThai) : updater }));

    // Filter states
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [itemSearchTerm, setItemSearchTerm] = useState('');
    const [vatPhamFilter, setVatPhamFilter] = useState('Tất cả');
    const [trangBiFilter, setTrangBiFilter] = useState('Tất cả');
    const [congPhapFilter, setCongPhapFilter] = useState('Tất cả');
    const [nguHanhFilter, setNguHanhFilter] = useState('Tất cả');
    const [hieuUngFilter, setHieuUngFilter] = useState('Tất cả');
    const [trangThaiFilter, setTrangThaiFilter] = useState('Tất cả');


    // State for image assignment
    const [assignmentModalState, setAssignmentModalState] = useState<{ isOpen: boolean; item: any | null; itemType: ThienThuTab | null; }>({ isOpen: false, item: null, itemType: null });
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    
    const toggleItemSelection = (itemId: string) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleItemSort = () => {
        setItemSortOrder(current => {
            if (current === 'none') return 'asc';
            if (current === 'asc') return 'desc';
            return 'none';
        });
    };
    
    const handleTrangThaiSort = () => {
        setTrangThaiSortOrder(current => {
            if (current === 'none') return 'asc';
            if (current === 'asc') return 'desc';
            return 'none';
        });
    };

    const handleSave = useCallback(() => {
        const dataToSave = { vatPhamTieuHao: vatPham, trangBi, phapBao, congPhap, hieuUng, trangThai };
        const jsonString = JSON.stringify(dataToSave, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ThienThu_Items_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [vatPham, trangBi, phapBao, congPhap, hieuUng, trangThai]);

    const handleLoad = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);

                // Validation function
                const isValid = (d: any) => d && Array.isArray(d) && d.every(item => typeof item === 'object' && item !== null && 'id' in item && 'name' in item);

                let loadedSomething = false;
                if (isValid(data.vatPhamTieuHao)) { setVatPham(data.vatPhamTieuHao); loadedSomething = true; }
                if (isValid(data.trangBi)) { setTrangBi(data.trangBi); loadedSomething = true; }
                if (isValid(data.phapBao)) { setPhapBao(data.phapBao); loadedSomething = true; }
                if (isValid(data.congPhap)) { setCongPhap(data.congPhap); loadedSomething = true; }
                if (isValid(data.hieuUng)) { setHieuUng(data.hieuUng); loadedSomething = true; }
                if (isValid(data.trangThai)) { setTrangThai(data.trangThai); loadedSomething = true; }
                
                if (loadedSomething) {
                    alert("Tải dữ liệu Thiên Thư thành công!");
                } else {
                    alert("Định dạng tệp không đúng hoặc không chứa dữ liệu hợp lệ.");
                }
            } catch (err) {
                 console.error("Lỗi khi tải dữ liệu:", err);
                alert("Lỗi: Không thể đọc tệp hoặc định dạng tệp không đúng.");
            }
        };
        reader.readAsText(file);
        if (event.target) event.target.value = '';
    }, [setVatPham, setTrangBi, setPhapBao, setCongPhap, setHieuUng, setTrangThai]);

    const handleSaveItem = (data: any) => {
        const isNew = !modalState?.data;
        const finalItem = {
            ...data,
            id: isNew ? `thienthu_${modalState?.type}_${Date.now()}` : (modalState?.data?.id || `thienthu_${modalState?.type}_${Date.now()}`),
        };

        const updateList = (setter: (updater: (prev: any[]) => any[]) => void) => {
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
            case 'item': updateList(setVatPham); break;
            case 'trangBi': updateList(setTrangBi); break;
            case 'phapBao': updateList(setPhapBao); break;
            case 'congPhap': updateList(setCongPhap); break;
        }
        setModalState(null);
    };
    
    const handleSaveEffectStatus = (data: any) => {
        const isNew = !effectStatusModalState?.data?.id;
        const finalItem = {
            ...data,
            id: isNew ? `thienthu_${effectStatusModalState?.type}_${Date.now()}` : data.id,
        };
    
        const updateList = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
            setter(prev => {
                const index = prev.findIndex(i => i.id === finalItem.id);
                if (index > -1) {
                    const newArr = [...prev];
                    newArr[index] = finalItem;
                    return newArr;
                }
                return [...prev, finalItem];
            });
        };
    
        if (effectStatusModalState?.type === 'hieuUng') {
            updateList(setHieuUng);
        } else if (effectStatusModalState?.type === 'trangThai') {
            updateList(setTrangThai);
        }
        setEffectStatusModalState(null);
    };

    const handleBulkDelete = () => {
        if (selectedItemIds.size === 0) return;
        

        const deleteSelected = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
            setter(prev => prev.filter(item => !selectedItemIds.has(item.id)));
        };

        switch (activeTab) {
            case 'vatPham': deleteSelected(setVatPham); break;
            case 'trangBi': deleteSelected(setTrangBi); break;
            case 'phapBao': deleteSelected(setPhapBao); break;
            case 'congPhap': deleteSelected(setCongPhap); break;
            case 'hieuUng': deleteSelected(setHieuUng); break;
            case 'trangThai': deleteSelected(setTrangThai); break;
        }
        setSelectedItemIds(new Set());
    };

    const handleUnassignImage = (setter: React.Dispatch<React.SetStateAction<any[]>>, itemId: string) => {
        setter(prev => prev.map(i => i.id === itemId ? { ...i, imageId: undefined } : i));
    };

    const filteredVatPham = useMemo(() => {
        return vatPham
            .filter((item: InitialItem) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: InitialItem) => vatPhamFilter === 'Tất cả' || item.consumableType === vatPhamFilter)
            .filter((item: InitialItem) => nguHanhFilter === 'Tất cả' || item.nguHanhAttribute === nguHanhFilter.toLowerCase())
            .sort((a: InitialItem, b: InitialItem) => {
                if (itemSortOrder === 'none') return 0;
                return itemSortOrder === 'asc' ? (a.rank || 0) - (b.rank || 0) : (b.rank || 0) - (a.rank || 0);
            });
    }, [vatPham, itemSearchTerm, vatPhamFilter, nguHanhFilter, itemSortOrder]);

    const filteredTrangBi = useMemo(() => {
        return trangBi
            .filter((item: InitialItem) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: InitialItem) => trangBiFilter === 'Tất cả' || item.equipmentType === trangBiFilter)
            .filter((item: InitialItem) => nguHanhFilter === 'Tất cả' || item.nguHanhAttribute === nguHanhFilter.toLowerCase())
            .sort((a: InitialItem, b: InitialItem) => {
                if (itemSortOrder === 'none') return 0;
                return itemSortOrder === 'asc' ? (a.rank || 0) - (b.rank || 0) : (b.rank || 0) - (a.rank || 0);
            });
    }, [trangBi, itemSearchTerm, trangBiFilter, nguHanhFilter, itemSortOrder]);

    const filteredPhapBao = useMemo(() => {
        return phapBao
            .filter((item: InitialItem) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: InitialItem) => nguHanhFilter === 'Tất cả' || item.nguHanhAttribute === nguHanhFilter.toLowerCase())
            .sort((a: InitialItem, b: InitialItem) => {
                if (itemSortOrder === 'none') return 0;
                return itemSortOrder === 'asc' ? (a.rank || 0) - (b.rank || 0) : (b.rank || 0) - (a.rank || 0);
            });
    }, [phapBao, itemSearchTerm, nguHanhFilter, itemSortOrder]);
    
    const filteredCongPhap = useMemo(() => {
        return congPhap
            .filter((item: InitialCongPhap) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: InitialCongPhap) => congPhapFilter === 'Tất cả' || item.techniqueType === congPhapFilter)
            .filter((item: InitialCongPhap) => nguHanhFilter === 'Tất cả' || item.nguHanhAttribute === nguHanhFilter.toLowerCase())
            .sort((a: InitialCongPhap, b: InitialCongPhap) => {
                if (itemSortOrder === 'none') return 0;
                return itemSortOrder === 'asc' ? (a.rank || 0) - (b.rank || 0) : (b.rank || 0) - (a.rank || 0);
            });
    }, [congPhap, itemSearchTerm, congPhapFilter, nguHanhFilter, itemSortOrder]);
    
    const filteredHieuUng = useMemo(() => {
        return hieuUng
            .filter((item: ItemEffectDefinition) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: ItemEffectDefinition) => hieuUngFilter === 'Tất cả' || item.category === hieuUngFilter)
            .sort((a, b) => {
                if (itemSortOrder === 'none') return 0;
                return itemSortOrder === 'asc' ? (a.rank || 0) - (b.rank || 0) : (b.rank || 0) - (a.rank || 0);
            });
    }, [hieuUng, itemSearchTerm, hieuUngFilter, itemSortOrder]);

    const filteredTrangThai = useMemo(() => {
        return trangThai
            .filter((item: StatusEffect) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: StatusEffect) => trangThaiFilter === 'Tất cả' || item.type === trangThaiFilter)
            .sort((a, b) => {
                if (trangThaiSortOrder === 'none') return 0;
                return trangThaiSortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            });
    }, [trangThai, itemSearchTerm, trangThaiFilter, trangThaiSortOrder]);

    const handleAssignImage = (imageId: string) => {
        if (assignmentModalState.item && assignmentModalState.itemType) {
            const itemId = assignmentModalState.item.id;
            const updateItem = (item: any) => item.id === itemId ? { ...item, imageId: imageId } : item;
    
            switch(assignmentModalState.itemType) {
                case 'vatPham': setVatPham(prev => prev.map(updateItem)); break;
                case 'trangBi': setTrangBi(prev => prev.map(updateItem)); break;
                case 'phapBao': setPhapBao(prev => prev.map(updateItem)); break;
                case 'congPhap': setCongPhap(prev => prev.map(updateItem)); break;
            }
        }
        setAssignmentModalState({ isOpen: false, item: null, itemType: null });
    };
    
    const handleBulkAssignImages = async () => {
        if (selectedItemIds.size === 0) return;

        setIsLoading(true);
        setLoadingMessage('AI đang gán ảnh cho các vật phẩm đã chọn...');

        try {
            const manifestResponse = await fetch('/thienthu_images.json');
            if (!manifestResponse.ok) throw new Error('Không thể tải thư viện ảnh.');
            const manifest: ThienThuImageManifest = await manifestResponse.json();

            const getItemsAndSetter = () => {
                switch (activeTab) {
                    case 'vatPham': return { items: vatPham, setter: setVatPham };
                    case 'trangBi': return { items: trangBi, setter: setTrangBi };
                    case 'phapBao': return { items: phapBao, setter: setPhapBao };
                    case 'congPhap': return { items: congPhap, setter: setCongPhap };
                    default: return { items: [], setter: () => {} };
                }
            };

            const { items, setter } = getItemsAndSetter();
            const selectedItems = items.filter((item: any) => selectedItemIds.has(item.id));
            
            if (selectedItems.length === 0) {
                throw new Error("Không tìm thấy vật phẩm nào được chọn.");
            }
            
            const itemsToAssign = selectedItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                category: item.techniqueType || item.equipmentType || item.consumableType || item.itemType || 'Khác'
            }));

            const assignments = await geminiService.assignImagesInBulk(itemsToAssign, manifest.images);
            
            setter((prevItems: any[]) => {
                const newItems = [...prevItems];
                assignments.forEach(assignment => {
                    const itemIndex = newItems.findIndex(item => item.id === assignment.itemId);
                    if (itemIndex > -1) {
                        newItems[itemIndex].imageId = assignment.imageId;
                    }
                });
                return newItems;
            });

            alert(`AI đã gán ảnh thành công cho ${assignments.length} vật phẩm.`);

        } catch (error) {
            console.error("Lỗi khi AI gán ảnh hàng loạt:", error);
            alert(`Đã xảy ra lỗi: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
            setSelectedItemIds(new Set());
        }
    };

    const tabs = [ { id: 'vatPham', name: 'Vật phẩm' }, { id: 'trangBi', name: 'Trang bị' }, { id: 'phapBao', name: 'Pháp bảo'}, { id: 'congPhap', name: 'Công pháp' }, { id: 'hieuUng', name: 'Hiệu ứng' }, { id: 'trangThai', name: 'Trạng thái' }];
    
    useEffect(() => {
        setSelectedItemIds(new Set());
    }, [activeTab]);

    const hieuUngOptions = [
      { value: 'Tất cả', label: 'Tất cả' },
      { value: 'consumable', label: 'Tiêu hao' },
      { value: 'equipment', label: 'Trang bị' },
      { value: 'treasure', label: 'Pháp bảo' },
      { value: 'technique', label: 'Công pháp' },
    ];
    
    const trangThaiOptions = [
      { value: 'Tất cả', label: 'Tất cả' },
      { value: 'buff', label: 'Buff (Có lợi)' },
      { value: 'debuff', label: 'Debuff (Bất lợi)' },
      { value: 'neutral', label: 'Trung lập' },
    ];

    return (
        <div className="relative flex flex-col h-full">
            {isLoading && (
                <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center">
                    <Icons.SparklesIcon className="w-16 h-16 text-yellow-300 animate-pulse" />
                    <p className="text-xl font-semibold mt-4">{loadingMessage}</p>
                </div>
            )}
            {modalState && <ElementModal modalState={modalState} onClose={() => setModalState(null)} onSave={handleSaveItem} />}
            {effectStatusModalState && <EffectStatusModal modalState={effectStatusModalState} onClose={() => setEffectStatusModalState(null)} onSave={handleSaveEffectStatus} />}
             <ImageAssignmentModal
                isOpen={assignmentModalState.isOpen}
                onClose={() => setAssignmentModalState({ isOpen: false, item: null, itemType: null })}
                item={assignmentModalState.item}
                onAssign={handleAssignImage}
            />
             <div className="flex-shrink-0 flex border-b-2 border-slate-700/50 overflow-x-auto styled-scrollbar">
                {tabs.map(tab => (
                     <button key={tab.id} onClick={() => setActiveTab(tab.id as ThienThuTab)} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                        {tab.name}
                    </button>
                ))}
            </div>
            <div className="flex-1 flex flex-col p-4 overflow-y-auto styled-scrollbar">
                {activeTab === 'vatPham' && (
                     <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                             <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                             <select value={vatPhamFilter} onChange={e => setVatPhamFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                {['Tất cả', 'Đan dược', 'Thảo dược', 'Vật liệu', 'Khoáng thạch', 'Khác'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                             <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                <option value="Tất cả">Ngũ Hành: Tất cả</option>
                                {Object.entries(NGU_HANH_DISPLAY).map(([key, val]) => <option key={key} value={val.name}>{val.icon} {val.name}</option>)}
                            </select>
                        </div>
                        <DefinitionList items={filteredVatPham} onEdit={(item) => setModalState({ type: 'item', data: item })} onDelete={(id) => setVatPham(p => p.filter((i:any) => i.id !== id))} onAdd={() => setModalState({ type: 'item', data: null })} onSort={handleItemSort} sortConfig={{direction: itemSortOrder}} onSave={handleSave} onLoad={handleLoad} selectedItemIds={selectedItemIds} onBulkAssign={handleBulkAssignImages} onBulkDelete={handleBulkDelete} onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))} isLoading={isLoading} renderItem={(item: InitialItem) => <EditableThienThuElement item={item} typeLabel={item.consumableType || item.itemType} onEdit={() => setModalState({ type: 'item', data: item })} onDelete={() => setVatPham(p => p.filter((i:any) => i.id !== item.id))} isSelected={selectedItemIds.has(item.id)} onToggleSelect={toggleItemSelection} onOpenImageModal={() => setAssignmentModalState({ isOpen: true, item: item, itemType: 'vatPham' })} onUnassignImage={() => handleUnassignImage(setVatPham, item.id)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{renderAttributes(item.attributes)}</EditableThienThuElement>} />
                    </div>
                )}
                {activeTab === 'trangBi' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                             <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                             <select value={trangBiFilter} onChange={e => setTrangBiFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                {['Tất cả', 'Vũ khí', 'Áo choàng', 'Giáp', 'Mũ', 'Găng tay', 'Giày', 'Phụ kiện', 'Trang sức'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                             <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                <option value="Tất cả">Ngũ Hành: Tất cả</option>
                                {Object.entries(NGU_HANH_DISPLAY).map(([key, val]) => <option key={key} value={val.name}>{val.icon} {val.name}</option>)}
                            </select>
                        </div>
                        <DefinitionList items={filteredTrangBi} onEdit={(item) => setModalState({ type: 'trangBi', data: item })} onDelete={(id) => setTrangBi(p => p.filter((i:any) => i.id !== id))} onAdd={() => setModalState({ type: 'trangBi', data: null })} onSort={handleItemSort} sortConfig={{direction: itemSortOrder}} onSave={handleSave} onLoad={handleLoad} selectedItemIds={selectedItemIds} onBulkAssign={handleBulkAssignImages} onBulkDelete={handleBulkDelete} onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))} isLoading={isLoading} renderItem={(item: InitialItem) => <EditableThienThuElement item={item} typeLabel={item.equipmentType || item.itemType} onEdit={() => setModalState({ type: 'trangBi', data: item })} onDelete={() => setTrangBi(p => p.filter((i:any) => i.id !== item.id))} isSelected={selectedItemIds.has(item.id)} onToggleSelect={toggleItemSelection} onOpenImageModal={() => setAssignmentModalState({ isOpen: true, item: item, itemType: 'trangBi' })} onUnassignImage={() => handleUnassignImage(setTrangBi, item.id)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{renderAttributes(item.attributes)}</EditableThienThuElement>} />
                    </div>
                )}
                {activeTab === 'phapBao' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                             <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                             <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                <option value="Tất cả">Ngũ Hành: Tất cả</option>
                                {Object.entries(NGU_HANH_DISPLAY).map(([key, val]) => <option key={key} value={val.name}>{val.icon} {val.name}</option>)}
                            </select>
                        </div>
                        <DefinitionList items={filteredPhapBao} onEdit={(item) => setModalState({ type: 'phapBao', data: item })} onDelete={(id) => setPhapBao(p => p.filter((i:any) => i.id !== id))} onAdd={() => setModalState({ type: 'phapBao', data: null })} onSort={handleItemSort} sortConfig={{direction: itemSortOrder}} onSave={handleSave} onLoad={handleLoad} selectedItemIds={selectedItemIds} onBulkAssign={handleBulkAssignImages} onBulkDelete={handleBulkDelete} onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))} isLoading={isLoading} renderItem={(item: InitialItem) => <EditableThienThuElement item={item} typeLabel={item.equipmentType || item.itemType} onEdit={() => setModalState({ type: 'phapBao', data: item })} onDelete={() => setPhapBao(p => p.filter((i:any) => i.id !== item.id))} isSelected={selectedItemIds.has(item.id)} onToggleSelect={toggleItemSelection} onOpenImageModal={() => setAssignmentModalState({ isOpen: true, item: item, itemType: 'phapBao' })} onUnassignImage={() => handleUnassignImage(setPhapBao, item.id)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{renderAttributes(item.attributes)}</EditableThienThuElement>} />
                    </div>
                )}
                {activeTab === 'congPhap' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                             <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                             <select value={congPhapFilter} onChange={e => setCongPhapFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                {['Tất cả', 'Chiến đấu', 'Phòng thủ', 'Tu luyện', 'Tâm pháp', 'Thân pháp'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                             <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                <option value="Tất cả">Ngũ Hành: Tất cả</option>
                                {Object.entries(NGU_HANH_DISPLAY).map(([key, val]) => <option key={key} value={val.name}>{val.icon} {val.name}</option>)}
                            </select>
                        </div>
                        <DefinitionList items={filteredCongPhap} onEdit={(item) => setModalState({ type: 'congPhap', data: item })} onDelete={(id) => setCongPhap(p => p.filter((i:any) => i.id !== id))} onAdd={() => setModalState({ type: 'congPhap', data: null })} onSort={handleItemSort} sortConfig={{direction: itemSortOrder}} onSave={handleSave} onLoad={handleLoad} selectedItemIds={selectedItemIds} onBulkAssign={handleBulkAssignImages} onBulkDelete={handleBulkDelete} onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))} isLoading={isLoading} renderItem={(item: InitialCongPhap) => <EditableThienThuElement item={item} typeLabel={item.techniqueType} onEdit={() => setModalState({ type: 'congPhap', data: item })} onDelete={() => setCongPhap(p => p.filter((i:any) => i.id !== item.id))} isSelected={selectedItemIds.has(item.id)} onToggleSelect={toggleItemSelection} onOpenImageModal={() => setAssignmentModalState({ isOpen: true, item: item, itemType: 'congPhap' })} onUnassignImage={() => handleUnassignImage(setCongPhap, item.id)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{renderAttributes(item.attributes)}</EditableThienThuElement>} />
                    </div>
                )}
                 {activeTab === 'hieuUng' && 
                    <div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                            <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                             <select value={hieuUngFilter} onChange={e => setHieuUngFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                {hieuUngOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <DefinitionList
                            items={filteredHieuUng}
                            onAdd={() => setEffectStatusModalState({ type: 'hieuUng', data: null })}
                            onEdit={(item) => setEffectStatusModalState({ type: 'hieuUng', data: item })}
                            onDelete={(id) => setHieuUng(p => p.filter((i:any) => i.id !== id))}
                            onSort={handleItemSort}
                            sortConfig={{ direction: itemSortOrder }}
                            hasImageAssignment={false}
                            selectedItemIds={selectedItemIds}
                            onBulkDelete={handleBulkDelete}
                            onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))}
                            renderItem={(item: ItemEffectDefinition) => (
                                <details className="bg-slate-800/50 rounded-md border border-slate-700/50 overflow-hidden">
                                    <summary className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-700/30">
                                         <div className="flex-grow flex items-center gap-3">
                                            <input type="checkbox" checked={selectedItemIds.has(item.id)} onChange={() => toggleItemSelection(item.id)} onClick={e => e.stopPropagation()} className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500 flex-shrink-0"/>
                                            <span className={`font-semibold ${getRankColor(item.rank)}`}>{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); setEffectStatusModalState({ type: 'hieuUng', data: item }); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={(e) => { e.stopPropagation(); setHieuUng(p => p.filter((i:any) => i.id !== item.id)); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </summary>
                                    <div className="p-3 border-t border-slate-700/50 bg-slate-900/30 text-xs space-y-2">
                                        <p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>
                                    </div>
                                </details>
                            )}
                        />
                    </div>
                 }
                 {activeTab === 'trangThai' && 
                    <div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                            <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                            <select value={trangThaiFilter} onChange={e => setTrangThaiFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                {trangThaiOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <DefinitionList
                            items={filteredTrangThai}
                            hasImageAssignment={false}
                            onAdd={() => setEffectStatusModalState({ type: 'trangThai', data: null })}
                            onEdit={(item) => setEffectStatusModalState({ type: 'trangThai', data: item })}
                            onDelete={(id) => setTrangThai(p => p.filter((i:any) => i.id !== id))}
                            selectedItemIds={selectedItemIds}
                            onBulkDelete={handleBulkDelete}
                            onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))}
                            onSort={handleTrangThaiSort}
                            sortConfig={{ direction: trangThaiSortOrder }}
                            sortLabel="Tên"
                            renderItem={(item: StatusEffect) => (
                                <details className="bg-slate-800/50 rounded-md border border-slate-700/50 overflow-hidden">
                                    <summary className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-700/30">
                                         <div className="flex-grow flex items-center gap-3">
                                            <input type="checkbox" checked={selectedItemIds.has(item.id)} onChange={() => toggleItemSelection(item.id)} onClick={e => e.stopPropagation()} className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500 flex-shrink-0"/>
                                            <span className={`font-semibold ${getStatusTypeColor(item.type)}`}>{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); setEffectStatusModalState({ type: 'trangThai', data: item }); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={(e) => { e.stopPropagation(); setTrangThai(p => p.filter((i:any) => i.id !== item.id)); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </summary>
                                    <div className="p-3 border-t border-slate-700/50 bg-slate-900/30 text-xs space-y-2">
                                        <p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>
                                    </div>
                                </details>
                            )}
                        />
                    </div>
                 }
            </div>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json,application/json" className="hidden" />
        </div>
    );
};