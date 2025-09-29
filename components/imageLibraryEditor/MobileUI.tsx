
import React from 'react';
import type { ThienThuImage, ThienThuImageManifest, InitialItem, InitialCongPhap, InitialNpc, NguHanhType, PlayerAttributes } from '../../types';
import * as Icons from '../Icons';
import { getRankColor, NGU_HANH_DISPLAY } from './helpers';
import { getImageUrl } from '../GamePanels';

interface MobileUIProps {
    handleBackClick: () => void;
    handleImportClick: () => void;
    handleSave: () => void;
    handleUpdate: () => void;
    isLoading: boolean;
    mobileTab: 'library' | 'items' | 'tags';
    setMobileTab: (tab: 'library' | 'items' | 'tags') => void;
    itemSearchTerm: string;
    setItemSearchTerm: (value: string) => void;
    nguHanhFilter: string;
    setNguHanhFilter: (value: string) => void;
    expandedCategory: string | null;
    setExpandedCategory: (value: string | null) => void;
    manifest: ThienThuImageManifest;
    toggleSelectAllItems: () => void;
    filteredAndSortedItems: any[];
    selectedItemIds: Set<string>;
    handleAiGenerateTagsFromSelection: () => void;
    toggleItemSelection: (id: string) => void;
    setImgLibModal: (state: { isOpen: boolean; item: any | null }) => void;
    imageSearchTerm: string;
    setImageSearchTerm: (value: string) => void;
    imageUrl: string;
    setImageUrl: (value: string) => void;
    handleAddUrlImage: (category?: string) => void;
    setTagMgmtModal: (state: { isOpen: boolean; image: ThienThuImage | null }) => void;
    tagSearchTerm: string;
    setTagSearchTerm: (value: string) => void;
    newTagCategory: string;
    setNewTagCategory: (value: string) => void;
    newTag: string;
    setNewTag: (value: string) => void;
    handleAddTag: (tag: string, category?: string) => void;
    editingTag: string | null;
    editingTagName: string;
    setEditingTag: (tag: string | null) => void;
    setEditingTagName: (name: string) => void;
    handleUpdateTag: (oldTag: string, newTag: string, category?: string) => void;
    handleDeleteTag: (tag: string, category?: string) => void;
    tagMgmtModal: { isOpen: boolean; image: ThienThuImage | null };
    handleTagToggle: (tag: string, image?: ThienThuImage) => void;
    imgLibModal: { isOpen: boolean; item: any | null };
    handleAssignImage: (itemId: string, imageId: string | null) => void;
}

export const MobileUI: React.FC<MobileUIProps> = (props) => {
    const {
        handleBackClick, handleImportClick, handleSave, handleUpdate, isLoading,
        mobileTab, setMobileTab, itemSearchTerm, setItemSearchTerm, nguHanhFilter,
        setNguHanhFilter, expandedCategory, setExpandedCategory, manifest,
        toggleSelectAllItems, filteredAndSortedItems, selectedItemIds,
        handleAiGenerateTagsFromSelection, toggleItemSelection, setImgLibModal,
        imageSearchTerm, setImageSearchTerm, imageUrl, setImageUrl, handleAddUrlImage,
        setTagMgmtModal, tagSearchTerm, setTagSearchTerm, newTagCategory,
        setNewTagCategory, newTag, setNewTag, handleAddTag, editingTag,
        editingTagName, setEditingTag, setEditingTagName, handleUpdateTag,
        handleDeleteTag, tagMgmtModal, handleTagToggle, imgLibModal, handleAssignImage
    } = props;

    return (
        <div className="flex md:hidden w-full h-full flex-col bg-slate-900/50">
            {tagMgmtModal.isOpen && tagMgmtModal.image && (
                 <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setTagMgmtModal({ isOpen: false, image: null })}>
                    <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-yellow-300 p-4 border-b border-slate-700">Quản lý nhãn</h3>
                        <div className="p-4 flex items-center gap-4">
                            <img src={getImageUrl(tagMgmtModal.image.fileName) || ''} alt={tagMgmtModal.image.fileName} className="w-20 h-20 object-cover rounded-md"/>
                            <div className="flex-grow min-w-0">
                                <h4 className="font-semibold break-all">{tagMgmtModal.image.fileName.split('/').pop()}</h4>
                                <p className="text-sm text-slate-400">{manifest.categories[tagMgmtModal.image.category]?.name}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-700 flex flex-col flex-1 min-h-0">
                            <input type="text" value={tagSearchTerm} onChange={e => setTagSearchTerm(e.target.value)} placeholder="Tìm nhãn..." className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm mb-2"/>
                            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-4 space-y-1">
                                {(manifest.categories[tagMgmtModal.image.category]?.tags || [])
                                    .filter(tag => tag.toLowerCase().includes(tagSearchTerm.toLowerCase()))
                                    .map(tag => (
                                    <div key={tag} className="flex items-center justify-between p-1.5 bg-slate-700/50 rounded group">
                                        {editingTag === tag ? (
                                            <div className="flex-grow flex items-center gap-2">
                                                <input type="text" value={editingTagName} onChange={e => setEditingTagName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUpdateTag(tag, editingTagName, tagMgmtModal.image!.category)} autoFocus className="flex-grow bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-sm"/>
                                                <button onClick={() => handleUpdateTag(tag, editingTagName, tagMgmtModal.image!.category)} className="p-1 text-green-400 hover:bg-slate-800 rounded-full"><Icons.CheckIcon className="w-4 h-4"/></button>
                                                <button onClick={() => setEditingTag(null)} className="p-1 text-gray-400 hover:bg-slate-800 rounded-full"><Icons.XIcon className="w-4 h-4"/></button>
                                            </div>
                                        ) : (
                                            <>
                                                <label className="flex items-center gap-2 cursor-pointer flex-grow">
                                                    <input type="checkbox" checked={tagMgmtModal.image!.tags.includes(tag)} onChange={() => handleTagToggle(tag, tagMgmtModal.image!)} className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-400"/>
                                                    <span className="text-sm">{tag}</span>
                                                </label>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setEditingTag(tag); setEditingTagName(tag); }} className="p-1 text-cyan-400 hover:bg-slate-800 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
                                                    <button onClick={() => handleDeleteTag(tag, tagMgmtModal.image!.category)} className="p-1 text-red-400 hover:bg-slate-800 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 mt-auto border-t border-slate-700">
                             <button onClick={() => setTagMgmtModal({ isOpen: false, image: null })} className="w-full bg-slate-600 hover:bg-slate-700 font-bold py-2 rounded">Đóng</button>
                        </div>
                    </div>
                 </div>
            )}

            {imgLibModal.isOpen && imgLibModal.item && (
                 <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setImgLibModal({ isOpen: false, item: null })}>
                    <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-yellow-300 p-4 border-b border-slate-700">Chọn ảnh cho "{imgLibModal.item.name}"</h3>
                         <div className="p-4 flex-shrink-0">
                            <input type="text" value={imageSearchTerm} onChange={e => setImageSearchTerm(e.target.value)} placeholder="Tìm ảnh..." className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm"/>
                        </div>
                        <div className="flex-1 overflow-y-auto styled-scrollbar p-4">
                            {Object.entries(manifest.categories).map(([catKey, category]) => (
                                <details key={catKey} className="bg-slate-800/50 rounded-lg border border-slate-700 mb-2" open>
                                    {/* FIX: Check if category exists before accessing its name property */}
                                    <summary className="p-2 font-bold text-yellow-200 cursor-pointer">{category?.name}</summary>
                                    <div className="p-2 border-t border-slate-700">
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {manifest.images.filter(img => img.category === catKey && img.fileName.toLowerCase().includes(imageSearchTerm.toLowerCase())).map(image => (
                                                <button key={image.fileName} onClick={() => { handleAssignImage(imgLibModal.item!.id, image.fileName); setImgLibModal({isOpen: false, item: null}); }} className="aspect-square rounded-lg overflow-hidden border-2 border-slate-600 hover:border-yellow-400 transition-colors">
                                                    <img src={getImageUrl(image.fileName) || ''} alt={image.fileName} className="w-full h-full object-cover"/>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </details>
                            ))}
                        </div>
                         <div className="p-4 mt-auto border-t border-slate-700">
                             <button onClick={() => setImgLibModal({ isOpen: false, item: null })} className="w-full bg-slate-600 hover:bg-slate-700 font-bold py-2 rounded">Hủy</button>
                        </div>
                    </div>
                 </div>
            )}
            <div className="flex-shrink-0 p-3 border-b border-slate-700/50 flex flex-col gap-3">
                 <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600">Thiên Thư Họa Quyển</h1>
                 <div className="flex flex-wrap gap-2 justify-center">
                    <button onClick={handleBackClick} className="flex-1 px-3 py-2 text-sm font-bold rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition-colors">Quay Lại</button>
                    <button onClick={handleImportClick} disabled={isLoading} className="flex-1 px-3 py-2 text-sm font-bold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors">Nhập</button>
                    <button onClick={handleSave} disabled={isLoading} className="flex-1 px-3 py-2 text-sm font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">Xuất</button>
                    <button onClick={handleUpdate} disabled={isLoading} className="flex-1 px-3 py-2 text-sm font-bold rounded-lg bg-yellow-500 text-slate-900 shadow-lg disabled:opacity-50">Cập nhật</button>
                </div>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto">
                {mobileTab === 'items' && (
                    <div className="p-2 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                            <input type="text" placeholder="Tìm kiếm vật phẩm..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm" />
                            <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm">
                                <option value="Tất cả">Ngũ Hành: Tất cả</option>
                                {Object.entries(NGU_HANH_DISPLAY).map(([key, val]) => <option key={key} value={val.name}>{val.icon} {val.name}</option>)}
                            </select>
                        </div>
                         <select value={expandedCategory || ''} onChange={(e) => setExpandedCategory(e.target.value || null)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm mb-2">
                            <option value="">Tất cả nhóm</option>
                            {/* FIX: Check if cat exists before accessing its name property */}
                            {Object.entries(manifest.categories).map(([key, cat]) => <option key={key} value={key}>{cat?.name}</option>)}
                        </select>
                         <div className="px-2 py-3 border-y border-slate-700/50 flex justify-between items-center">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" onChange={toggleSelectAllItems} checked={filteredAndSortedItems.length > 0 && selectedItemIds.size === filteredAndSortedItems.length} className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-400" />
                                Chọn tất cả ({selectedItemIds.size})
                            </label>
                            <button onClick={handleAiGenerateTagsFromSelection} disabled={isLoading || selectedItemIds.size === 0} className="flex items-center justify-center gap-2 px-3 py-1.5 font-bold rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm shadow-lg transition-all disabled:opacity-50">
                                <Icons.CpuChipIcon className="w-5 h-5"/> AI tạo nhãn
                            </button>
                        </div>
                        {filteredAndSortedItems.map(item => (
                            <div key={item.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-start gap-3">
                                <input type="checkbox" checked={selectedItemIds.has(item.id)} onChange={() => toggleItemSelection(item.id)} className="mt-1 h-5 w-5 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500 flex-shrink-0"/>
                                <div className="flex-grow flex items-start gap-3">
                                    <div className="w-16 h-16 bg-slate-700 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {item.imageId ? <img src={getImageUrl(item.imageId) || ''} alt={item.name} className="w-full h-full object-cover"/> : <Icons.QuestionMarkCircleIcon className="w-8 h-8 text-slate-500"/>}
                                    </div>
                                    <div className="flex-grow min-w-0 text-xs space-y-1">
                                        <p><strong className={`text-sm ${getRankColor('rank' in item && typeof item.rank === 'number' ? item.rank : undefined)}`}>{item.name}</strong></p>
                                        <p className="text-slate-300">{item.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => setImgLibModal({ isOpen: true, item })} className="w-16 h-16 flex-shrink-0 flex items-center justify-center p-2 text-center text-xs font-semibold bg-green-700 hover:bg-green-600 rounded-md transition-colors">
                                    Gắn ảnh
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {mobileTab === 'library' && (
                    <div className="p-2 space-y-2">
                        <input type="text" placeholder="Tìm ảnh..." value={imageSearchTerm} onChange={e => setImageSearchTerm(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm mb-2" />
                        {Object.entries(manifest.categories).map(([catKey, category]) => (
                            <details key={catKey} className="bg-slate-800/50 rounded-lg border border-slate-700" open>
                                {/* FIX: Check if category exists before accessing its name property */}
                                <summary className="p-2 font-bold text-yellow-200 cursor-pointer">{category?.name}</summary>
                                <div className="p-2 border-t border-slate-700 space-y-2">
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Thêm ảnh bằng URL..." 
                                            value={imageUrl} 
                                            onChange={e => setImageUrl(e.target.value)} 
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <button 
                                            onClick={() => handleAddUrlImage(catKey)}
                                            disabled={!imageUrl.startsWith('http')}
                                            className="p-2 bg-green-600 rounded-lg disabled:opacity-50"
                                        >
                                            <Icons.PlusCircleIcon className="w-6 h-6"/>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {manifest.images.filter(img => img.category === catKey && img.fileName.toLowerCase().includes(imageSearchTerm.toLowerCase())).map(image => (
                                            <div key={image.fileName} onClick={() => setTagMgmtModal({ isOpen: true, image: image })} className="aspect-square rounded-lg overflow-hidden border-2 border-slate-600 hover:border-yellow-400 transition-colors relative group bg-slate-800 flex flex-col cursor-pointer">
                                                <img src={getImageUrl(image.fileName) || ''} alt={image.fileName} className="w-full h-full object-cover"/>
                                                <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 backdrop-blur-sm">
                                                    <h5 className="text-[10px] text-white font-semibold truncate">
                                                        {image.fileName.startsWith('http') ? (
                                                            <a href={image.fileName} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-cyan-400 hover:underline">Link ngoài</a>
                                                        ) : (
                                                            image.fileName.split('/').pop()
                                                        )}
                                                    </h5>
                                                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                                                         {/* FIX: Check if image.tags exists before accessing it */}
                                                        {image.tags && image.tags.length > 0 ? image.tags.slice(0, 3).map(tag => (
                                                            <span key={tag} className="text-[9px] bg-slate-700 px-1 py-0.5 rounded">{tag}</span>
                                                        )) : <span className="text-[9px] text-slate-400 italic">Chưa có nhãn</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                )}
                {mobileTab === 'tags' && (
                    <div className="p-4 space-y-4">
                        <input type="text" value={tagSearchTerm} onChange={e => setTagSearchTerm(e.target.value)} placeholder="Tìm nhãn..." className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-2 text-sm"/>
                        <div className="flex gap-2">
                            <select value={newTagCategory} onChange={(e) => setNewTagCategory(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm">
                                {/* FIX: Check if cat exists before accessing its name property */}
                                {Object.entries(manifest.categories).map(([key, cat]) => <option key={key} value={key}>{cat?.name}</option>)}
                            </select>
                            <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag(newTag, newTagCategory)} placeholder="Nhãn mới..." className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-2 text-sm"/>
                            <button onClick={() => handleAddTag(newTag, newTagCategory)} className="p-2 bg-green-600 rounded-lg"><Icons.PlusCircleIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto styled-scrollbar">
                            {Object.entries(manifest.categories).map(([catKey, category]) => (
                                 <div key={catKey}>
                                    {/* FIX: Check if category exists before accessing its name property */}
                                    <h4 className="font-bold text-yellow-200 mb-2">{category?.name}</h4>
                                    <div className="space-y-1">
                                        {category.tags.filter(tag => tag.toLowerCase().includes(tagSearchTerm.toLowerCase())).map(tag => (
                                            <div key={tag} className="flex items-center justify-between p-1.5 bg-slate-700/50 rounded group">
                                                {editingTag === tag ? (
                                                    <div className="flex-grow flex items-center gap-2">
                                                        <input type="text" value={editingTagName} onChange={e => setEditingTagName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUpdateTag(tag, editingTagName, catKey)} autoFocus className="flex-grow bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-sm"/>
                                                        <button onClick={() => handleUpdateTag(tag, editingTagName, catKey)} className="p-1 text-green-400 hover:bg-slate-800 rounded-full"><Icons.CheckIcon className="w-4 h-4"/></button>
                                                        <button onClick={() => setEditingTag(null)} className="p-1 text-gray-400 hover:bg-slate-800 rounded-full"><Icons.XIcon className="w-4 h-4"/></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-sm">{tag}</span>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => { setEditingTag(tag); setEditingTagName(tag); }} className="p-1 text-cyan-400 hover:bg-slate-800 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
                                                            <button onClick={() => handleDeleteTag(tag, catKey)} className="p-1 text-red-400 hover:bg-slate-800 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-shrink-0 bg-slate-900/80 backdrop-blur-sm flex justify-around border-t border-slate-700/50">
                <button onClick={() => setMobileTab('library')} className={`flex-1 p-2 text-center transition-colors ${mobileTab === 'library' ? 'bg-yellow-500/20 text-yellow-300' : 'text-slate-400'}`}>
                    <Icons.MapIcon className="w-6 h-6 mx-auto mb-1"/> <span className="text-xs font-bold">Thư viện</span>
                </button>
                 <button onClick={() => setMobileTab('items')} className={`flex-1 p-2 text-center transition-colors ${mobileTab === 'items' ? 'bg-yellow-500/20 text-yellow-300' : 'text-slate-400'}`}>
                    <Icons.BookOpenIcon className="w-6 h-6 mx-auto mb-1"/> <span className="text-xs font-bold">Vật phẩm</span>
                </button>
                <button onClick={() => setMobileTab('tags')} className={`flex-1 p-2 text-center transition-colors ${mobileTab === 'tags' ? 'bg-yellow-500/20 text-yellow-300' : 'text-slate-400'}`}>
                    <Icons.PencilIcon className="w-6 h-6 mx-auto mb-1"/> <span className="text-xs font-bold">Nhãn</span>
                </button>
            </nav>
        </div>
    );
};
