import React from 'react';
import type { ThienThuImage, ThienThuImageManifest, InitialItem, InitialCongPhap, InitialNpc, NguHanhType, PlayerAttributes } from '../../types';
import * as Icons from '@/components/Icons';
import { getRankColor, NGU_HANH_DISPLAY } from './helpers';
import { getImageUrl } from '../GamePanels';

interface ThienThuItemListPanelProps {
    itemSearchTerm: string;
    setItemSearchTerm: (value: string) => void;
    nguHanhFilter: string;
    setNguHanhFilter: (value: string) => void;
    toggleSelectAllItems: () => void;
    filteredAndSortedItems: any[];
    selectedItemIds: Set<string>;
    handleAiGenerateTagsFromSelection: () => void;
    isLoading: boolean;
    itemSortOrder: 'asc' | 'desc' | 'none';
    setItemSortOrder: (value: React.SetStateAction<'asc' | 'desc' | 'none'>) => void;
    toggleItemSelection: (id: string) => void;
    handleUnassignImage: (id: string) => void;
    manifest: ThienThuImageManifest;
    renderAttributes: (attributes: Partial<PlayerAttributes> | undefined) => React.ReactNode;
    handleAssignImage: (itemId: string, imageId: string | null) => void;
    selectedImage: ThienThuImage | null;
}

export const ThienThuItemListPanel: React.FC<ThienThuItemListPanelProps> = ({
    itemSearchTerm,
    setItemSearchTerm,
    nguHanhFilter,
    setNguHanhFilter,
    toggleSelectAllItems,
    filteredAndSortedItems,
    selectedItemIds,
    handleAiGenerateTagsFromSelection,
    isLoading,
    itemSortOrder,
    setItemSortOrder,
    toggleItemSelection,
    handleUnassignImage,
    manifest,
    renderAttributes,
    handleAssignImage,
    selectedImage,
}) => {
    return (
        <div className="w-full md:w-[50%] p-4 border-b md:border-b-0 md:border-r border-slate-700/50 flex flex-col h-[50%] md:h-auto">
            <h2 className="text-xl font-bold text-yellow-300 mb-2 flex-shrink-0">Vật phẩm Thiên Thư</h2>
             <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <input type="text" placeholder="Tìm kiếm vật phẩm..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm" />
                <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm">
                    <option value="Tất cả">Ngũ Hành: Tất cả</option>
                    {Object.entries(NGU_HANH_DISPLAY).map(([key, val]) => <option key={key} value={val.name}>{val.icon} {val.name}</option>)}
                </select>
            </div>
            <div className="flex-shrink-0 px-2 py-3 border-y border-slate-700/50 flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" onChange={toggleSelectAllItems} checked={filteredAndSortedItems.length > 0 && selectedItemIds.size === filteredAndSortedItems.length} className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500" />
                    Chọn tất cả ({selectedItemIds.size})
                </label>
                <button onClick={handleAiGenerateTagsFromSelection} disabled={isLoading || selectedItemIds.size === 0} className="flex items-center justify-center gap-2 px-3 py-1.5 font-bold rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm shadow-lg transition-all disabled:opacity-50">
                    <Icons.CpuChipIcon className="w-5 h-5"/> AI tạo nhãn
                </button>
                <button onClick={() => setItemSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="text-xs px-2 py-1 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600"> Sắp xếp {itemSortOrder === 'asc' ? '▲' : '▼'} </button>
            </div>

            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-4 pt-2">
                {filteredAndSortedItems.map(item => (
                    <div key={item.id} className="p-3 mb-2 bg-slate-900/50 rounded-lg border border-slate-700 flex items-start gap-4">
                        <input type="checkbox" checked={selectedItemIds.has(item.id)} onChange={() => toggleItemSelection(item.id)} className="mt-1 h-5 w-5 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500 flex-shrink-0"/>
                        
                        <div className="flex-grow flex items-start gap-3">
                            <div className="w-16 h-16 relative group flex-shrink-0">
                                <div className="w-full h-full bg-slate-700 rounded-md overflow-hidden flex items-center justify-center">
                                    {item.imageId ? <img src={getImageUrl(item.imageId) || ''} alt={item.name} className="w-full h-full object-cover"/> : <Icons.QuestionMarkCircleIcon className="w-8 h-8 text-slate-500"/>}
                                </div>
                                {item.imageId && <button onClick={() => handleUnassignImage(item.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><Icons.XIcon className="w-3 h-3"/></button>}
                            </div>
                            
                            <div className="flex-grow min-w-0 text-xs space-y-1.5">
                                <div>
                                    <p>
                                        <strong className={`text-sm ${getRankColor('rank' in item && typeof item.rank === 'number' ? item.rank : undefined)}`}>{item.name}</strong>
                                        <span className="text-slate-400 ml-2">({manifest.categories[item.__type]?.name || item.__type})</span>
                                    </p>
                                    {'nguHanhAttribute' in item && item.nguHanhAttribute && NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType] && (
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 self-start ${NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].colors}`}>
                                            <span>{NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].icon}</span>
                                            <span>{NGU_HANH_DISPLAY[item.nguHanhAttribute as NguHanhType].name}</span>
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-slate-300">
                                    <strong className="text-slate-400">Mô tả:</strong> {item.description}
                                </p>
                                
                                {'attributes' in item && renderAttributes(item.attributes)}
                            </div>
                        </div>

                        <button 
                            onClick={() => handleAssignImage(item.id, selectedImage?.fileName || null)} 
                            disabled={!selectedImage || selectedImage.category !== item.__type} 
                            className="w-24 h-full flex-shrink-0 flex items-center justify-center p-2 text-center text-xs font-semibold bg-green-700 hover:bg-green-600 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                            Gán ảnh đã chọn
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};