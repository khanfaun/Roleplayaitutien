// FIX: Added import for React to resolve JSX namespace errors.
import React from 'react';
import type { WorldLocation } from '../../../../types';

interface WorldLocationFormProps {
    formData: any;
    renderField: (id: string, label: string, type: 'text' | 'textarea' | 'select' | 'select-tree', options?: any, placeholder?: string) => JSX.Element;
    allWorldLocations: WorldLocation[];
    onOpenImageModal: () => void;
    startingLocationId?: string | null;
    setStartingLocationId?: React.Dispatch<React.SetStateAction<string | null>>;
    handleChange: (field: string, value: any) => void;
}

export const WorldLocationForm: React.FC<WorldLocationFormProps> = ({ formData, renderField, allWorldLocations, onOpenImageModal, startingLocationId, setStartingLocationId, handleChange }) => {
    const isCurrentlyTheStartPoint = formData.id && startingLocationId === formData.id;
    const isChecked = (isCurrentlyTheStartPoint && formData.isStartingPoint !== false) || formData.isStartingPoint === true;

    const handleStartPointToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange('isStartingPoint', e.target.checked);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-4">
                {renderField('name', `Tên (Cấp ${formData.level || 1})`, 'text')}
                {formData.level > 1 && renderField('parentId', `Thuộc Cấp ${formData.level - 1}`, 'select-tree', allWorldLocations.filter(l => l.level === formData.level - 1))}
                {renderField('description', 'Mô tả', 'textarea')}
                <button
                    type="button"
                    onClick={onOpenImageModal}
                    className="text-sm bg-blue-600/80 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors w-full"
                >
                    Chọn ảnh...
                </button>
            </div>
            <div className="space-y-4">
                {renderField('type', 'Loại hình', 'select', ['Quần Cư', 'Tự Nhiên', 'Tài Nguyên', 'Nguy Hiểm', 'Đặc Biệt', 'Di Tích Cổ', 'Bí Cảnh'])}
                {renderField('safetyLevel', 'Mức độ an toàn', 'select', ['An Toàn Khu', 'Trung Lập', 'Nguy Hiểm', 'Tử Địa'])}
                {renderField('sovereignty', 'Chủ quyền', 'text', undefined, 'Tên môn phái, gia tộc, hoặc Vô chủ')}
                {renderField('resources', 'Tài nguyên đặc trưng', 'textarea', undefined, 'Linh Tâm Thảo, Hắc Thiết Khoáng...')}
                {renderField('realmRequirement', 'Yêu cầu cảnh giới', 'text', undefined, 'Ví dụ: Trúc Cơ Kỳ trở lên')}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                    <input
                        id="isStartPoint"
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleStartPointToggle}
                        className="h-5 w-5 rounded border-gray-500 bg-slate-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-slate-800 cursor-pointer"
                    />
                    <label htmlFor="isStartPoint" className="text-sm font-medium text-slate-200 cursor-pointer">Đặt làm địa điểm bắt đầu</label>
                </div>
            </div>
        </div>
    );
};
