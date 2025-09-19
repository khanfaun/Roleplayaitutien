import React, { useState, useEffect } from 'react';
import type { PlayerAttributes } from '../../../types';
import { PLAYER_ATTRIBUTE_NAMES } from '../../../constants';
import { rankMap } from './helpers';

export const EffectStatusModal = ({ modalState, onClose, onSave }: {
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
