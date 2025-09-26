// FIX: Added import for React to resolve JSX namespace errors.
import React from 'react';
import { EffectSelector } from '../ElementHelpers';

interface CongPhapFormProps {
    formData: any;
    renderField: (id: string, label: string, type: 'text' | 'textarea' | 'number' | 'select', options?: any, placeholder?: string) => JSX.Element;
    renderAttributeFields: () => JSX.Element;
    handleChange: (field: string, value: any) => void;
    handleEffectIdsChange: (ids: string[]) => void;
    handleEffectSelectorOpen: () => void;
}

export const CongPhapForm: React.FC<CongPhapFormProps> = ({
    formData,
    renderField,
    renderAttributeFields,
    handleChange,
    handleEffectIdsChange,
    handleEffectSelectorOpen
}) => (
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
