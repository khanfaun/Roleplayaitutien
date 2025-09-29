
import React from 'react';
import type { ThienThuImage, ThienThuImageManifest } from '../../types';
import * as Icons from '../Icons';

interface TagManagerPanelProps {
    expandedCategory: string | null;
    manifest: ThienThuImageManifest;
    tagSearchTerm: string;
    setTagSearchTerm: (value: string) => void;
    newTag: string;
    setNewTag: (value: string) => void;
    handleAddTag: (tag: string) => void;
    displayedTags: string[];
    editingTag: string | null;
    editingTagName: string;
    setEditingTag: (tag: string | null) => void;
    setEditingTagName: (name: string) => void;
    handleUpdateTag: (oldTag: string, newTag: string) => void;
    selectedImage: ThienThuImage | null;
    handleTagToggle: (tag: string) => void;
    handleDeleteTag: (tag: string) => void;
    isLoading: boolean;
    allTags: string[];
    handleAiOptimizeTags: () => void;
}

const FIXED_CATEGORIES = {
    tieu_hao: { name: "Tiêu hao" },
    trang_bi: { name: "Trang bị" },
    phap_bao: { name: "Pháp bảo" },
    cong_phap: { name: "Công pháp" },
    npc: { name: "NPC" }
};

export const TagManagerPanel: React.FC<TagManagerPanelProps> = ({
    expandedCategory,
    manifest,
    tagSearchTerm,
    setTagSearchTerm,
    newTag,
    setNewTag,
    handleAddTag,
    displayedTags,
    editingTag,
    editingTagName,
    setEditingTag,
    setEditingTagName,
    handleUpdateTag,
    selectedImage,
    handleTagToggle,
    handleDeleteTag,
    isLoading,
    allTags,
    handleAiOptimizeTags,
}) => {
    return (
        <div className="w-full md:w-[25%] p-4 flex flex-col h-full">
            <h3 className="text-lg font-bold text-yellow-300 mb-2 flex-shrink-0">Quản lý Nhãn {expandedCategory ? `(${FIXED_CATEGORIES[expandedCategory as keyof typeof FIXED_CATEGORIES]?.name})` : '(Tất cả)'}</h3>
             <div className="mb-2 flex-shrink-0"> <input type="text" value={tagSearchTerm} onChange={e => setTagSearchTerm(e.target.value)} placeholder="Tìm nhãn..." className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm"/> </div>
            
            <label className="text-xs text-slate-400 mb-1 block">
                 {expandedCategory ? `Thêm nhãn vào nhóm "${FIXED_CATEGORIES[expandedCategory as keyof typeof FIXED_CATEGORIES]?.name}"` : 'Chọn một nhóm để thêm nhãn'}
            </label>
            <div className="mb-2 flex-shrink-0 flex gap-2">
                 <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag(newTag)} placeholder="Nhãn mới..." disabled={!expandedCategory} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm disabled:cursor-not-allowed"/>
                <button onClick={() => handleAddTag(newTag)} disabled={!expandedCategory} className="p-1 bg-green-600 rounded-lg disabled:opacity-50"><Icons.PlusCircleIcon className="w-6 h-6"/></button>
            </div>
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-4 space-y-1 mb-4">
                {displayedTags.filter(tag => tag.toLowerCase().includes(tagSearchTerm.toLowerCase())).map(tag => (
                    <div key={tag} className="flex items-center justify-between p-1.5 bg-slate-700/50 rounded group">
                        {editingTag === tag ? (
                            <div className="flex-grow flex items-center gap-2">
                                <input type="text" value={editingTagName} onChange={e => setEditingTagName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUpdateTag(tag, editingTagName)} autoFocus className="flex-grow bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-sm"/>
                                <button onClick={() => handleUpdateTag(tag, editingTagName)} className="p-1 text-green-400 hover:bg-slate-800 rounded-full"><Icons.CheckIcon className="w-4 h-4"/></button>
                                <button onClick={() => setEditingTag(null)} className="p-1 text-gray-400 hover:bg-slate-800 rounded-full"><Icons.XIcon className="w-4 h-4"/></button>
                            </div>
                        ) : (
                            <>
                                <label className="flex items-center gap-2 cursor-pointer flex-grow">
                                    <input type="checkbox" checked={selectedImage?.tags.includes(tag) || false} onChange={() => handleTagToggle(tag)} disabled={!selectedImage || (expandedCategory ? selectedImage.category !== expandedCategory : false)} className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500 disabled:cursor-not-allowed"/>
                                    <span className={`text-sm ${!selectedImage || (expandedCategory ? selectedImage.category !== expandedCategory : true) ? 'text-slate-500' : ''}`}>{tag}</span>
                                </label>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingTag(tag); setEditingTagName(tag); }} disabled={!expandedCategory} className="p-1 text-cyan-400 hover:bg-slate-800 rounded-full disabled:opacity-50"><Icons.PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteTag(tag)} disabled={!expandedCategory} className="p-1 text-red-400 hover:bg-slate-800 rounded-full disabled:opacity-50"><Icons.TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="pt-4 mt-auto border-t border-slate-700/50 space-y-2 flex-shrink-0">
                <button onClick={handleAiOptimizeTags} disabled={isLoading || allTags.length < 2 || !expandedCategory} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-bold rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg transition-all disabled:opacity-50">
                    <Icons.SparklesIcon className="w-5 h-5"/> AI Tối ưu hóa nhãn
                </button>
            </div>
        </div>
    );
};
