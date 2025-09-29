// FIX: Added import for React to resolve JSX namespace errors.
import React from 'react';
import { EffectSelector } from '../ElementHelpers';

interface EquipmentFormProps {
    modalState: { type: string, data: any | null };
    formData: any;
    renderField: (id: string, label: string, type: 'text' | 'textarea' | 'number' | 'select', options?: any, placeholder?: string) => JSX.Element;
    renderAttributeFields: () => JSX.Element;
    handleChange: (field: string, value: any) => void;
    handleEffectIdsChange: (ids: string[]) => void;
    handleEffectSelectorOpen: () => void;
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
    modalState,
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