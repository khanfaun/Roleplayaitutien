// FIX: Added import for React to resolve JSX namespace errors.
import React from 'react';
import { rankMap, EffectSelector } from '../ElementHelpers';

interface ItemFormProps {
    formData: any;
    renderField: (id: string, label: string, type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox', options?: any, placeholder?: string) => JSX.Element;
    renderAttributeFields: () => JSX.Element;
    handleChange: (field: string, value: any) => void;
    handleEffectIdsChange: (ids: string[]) => void;
    handleEffectSelectorOpen: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({
    formData,
    renderField,
    renderAttributeFields,
    handleChange,
    handleEffectIdsChange,
    handleEffectSelectorOpen
}) => {
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
