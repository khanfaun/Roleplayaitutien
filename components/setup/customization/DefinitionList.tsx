import React from 'react';
import * as Icons from '../../Icons';
import { PlusCircleIcon, CheckIcon, TrashIcon } from '../../Icons';

export const DefinitionList: React.FC<{
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
