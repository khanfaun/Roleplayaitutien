import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ThienThuImage, ThienThuImageManifest, InitialItem, InitialCongPhap, InitialNpc, NguHanhType, PlayerAttributes } from '../types';
import * as Icons from './Icons';
import * as geminiService from '../services/geminiService';
import { THIEN_THU_VAT_PHAM_TIEU_HAO, THIEN_THU_TRANG_BI, THIEN_THU_PHAP_BAO, THIEN_THU_CONG_PHAP } from '../data/thienThu';
import { PLAYER_ATTRIBUTE_NAMES } from '../constants';

interface ImageLibraryEditorProps {
    onBack: () => void;
}

const getRankColor = (rank?: number) => {
    switch (rank) {
        case 1: return 'text-slate-300';
        case 2: return 'text-green-400';
        case 3: return 'text-blue-400';
        case 4: return 'text-purple-400';
        case 5: return 'text-orange-400';
        case 6: return 'text-red-500';
        default: return 'text-white';
    }
};

const getImageUrl = (imageId: string | undefined) => {
    if (!imageId) return null;
    if (imageId.startsWith('http')) return imageId;
    return `/assets/thienthu/${imageId}`;
};

const NGU_HANH_DISPLAY: Record<NguHanhType, { icon: string; name: string; colors: string }> = {
    kim: { icon: '⚙️', name: 'Kim', colors: 'bg-gray-400 text-black' },
    moc: { icon: '🌳', name: 'Mộc', colors: 'bg-green-500 text-white' },
    thuy: { icon: '💧', name: 'Thủy', colors: 'bg-blue-500 text-white' },
    hoa: { icon: '🔥', name: 'Hỏa', colors: 'bg-red-500 text-white' },
    tho: { icon: '⛰️', name: 'Thổ', colors: 'bg-yellow-600 text-black' }
};

export const ImageLibraryEditor: React.FC<ImageLibraryEditorProps> = ({ onBack }) => {
    const [manifest, setManifest] = useState<ThienThuImageManifest>({ categories: {}, images: [] });
    
    const [vatPham, setVatPham] = useState<InitialItem[]>([]);
    const [trangBi, setTrangBi] = useState<InitialItem[]>([]);
    const [phapBao, setPhapBao] = useState<InitialItem[]>([]);
    const [congPhap, setCongPhap] = useState<InitialCongPhap[]>([]);
    const [npcs, setNpcs] = useState<InitialNpc[]>([]);

    const thienThuItems = useMemo(() => [
        ...vatPham.map(i => ({ ...i, __type: 'tieu_hao' })),
        ...trangBi.map(i => ({ ...i, __type: 'trang_bi' })),
        ...phapBao.map(i => ({ ...i, __type: 'phap_bao' })),
        ...congPhap.map(i => ({ ...i, __type: 'cong_phap' })),
        ...npcs.map(i => ({ ...i, __type: 'npc' }))
    ], [vatPham, trangBi, phapBao, congPhap, npcs]);

    const [selectedImage, setSelectedImage] = useState<ThienThuImage | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    const [itemSearchTerm, setItemSearchTerm] = useState('');
    const [nguHanhFilter, setNguHanhFilter] = useState('Tất cả');
    const [itemSortOrder, setItemSortOrder] = useState<'asc' | 'desc' | 'none'>('none');

    const [imageSearchTerm, setImageSearchTerm] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    
    const [tagSearchTerm, setTagSearchTerm] = useState('');
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [editingTagName, setEditingTagName] = useState('');
    const [newTag, setNewTag] = useState('');
    
    const [lastSavedThienThu, setLastSavedThienThu] = useState<any | null>(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // --- MOBILE STATE ---
    const [mobileTab, setMobileTab] = useState<'library' | 'items' | 'tags'>('library');
    const [tagMgmtModal, setTagMgmtModal] = useState<{ isOpen: boolean; image: ThienThuImage | null }>({ isOpen: false, image: null });
    const [imgLibModal, setImgLibModal] = useState<{ isOpen: boolean; item: any | null }>({ isOpen: false, item: null });
    const [newTagCategory, setNewTagCategory] = useState<string>('');


    const loadData = useCallback(() => {
        fetch('/thienthu_images.json')
            .then(response => {
                if (!response.ok) { throw new Error('Manifest not found'); }
                return response.json();
            })
            .then(data => {
                setManifest(data);
                if (data.categories && Object.keys(data.categories).length > 0) {
                    setNewTagCategory(Object.keys(data.categories)[0]);
                }
            })
            .catch(error => {
                console.warn("thienthu_images.json not found. Using empty data.", error);
                setManifest({ categories: {}, images: [] });
            });
        try {
            const saved = localStorage.getItem('customThienThuItems');
            const initialThienThu = saved ? JSON.parse(saved) : {
                vatPhamTieuHao: JSON.parse(JSON.stringify(THIEN_THU_VAT_PHAM_TIEU_HAO)),
                trangBi: JSON.parse(JSON.stringify(THIEN_THU_TRANG_BI)),
                phapBao: JSON.parse(JSON.stringify(THIEN_THU_PHAP_BAO)),
                congPhap: JSON.parse(JSON.stringify(THIEN_THU_CONG_PHAP)),
                npcs: [],
            };
            setVatPham(initialThienThu.vatPhamTieuHao || []);
            setTrangBi(initialThienThu.trangBi || []);
            setPhapBao(initialThienThu.phapBao || []);
            setCongPhap(initialThienThu.congPhap || []);
            setNpcs(initialThienThu.npcs || []);
            setLastSavedThienThu(initialThienThu);
        } catch (e) { console.error("Error loading custom Thien Thu items", e); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);


    const filteredAndSortedItems = useMemo(() => {
        let items = thienThuItems.filter(item =>
            item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
        );
        if (expandedCategory) {
            items = items.filter(item => item.__type === expandedCategory);
        }
        if (nguHanhFilter !== 'Tất cả') {
            items = items.filter(item => 'nguHanhAttribute' in item && item.nguHanhAttribute === nguHanhFilter.toLowerCase());
        }
        if (itemSortOrder !== 'none') {
            items.sort((a, b) => {
                const rankA = 'rank' in a && typeof a.rank === 'number' ? a.rank : 0;
                const rankB = 'rank' in b && typeof b.rank === 'number' ? b.rank : 0;

                if (rankA !== rankB) {
                  return itemSortOrder === 'asc' ? rankA - rankB : rankB - rankA;
                }
                return a.name.localeCompare(b.name);
            });
        }
        return items;
    }, [thienThuItems, itemSearchTerm, expandedCategory, nguHanhFilter, itemSortOrder]);
    
    const allTags = useMemo(() => {
        if (!manifest || !manifest.categories) return [];
        const all = Object.values(manifest.categories).flatMap(cat => cat.tags);
        return [...new Set(all)].sort();
    }, [manifest]);

    const displayedTags = useMemo(() => {
        if (expandedCategory && manifest.categories[expandedCategory]) {
            return manifest.categories[expandedCategory].tags.sort();
        }
        if (!expandedCategory) {
             return allTags;
        }
        return [];
    }, [expandedCategory, manifest.categories, allTags]);

    const handleSave = () => {
        const dataToSave = {
            manifest,
            thienThu: { vatPhamTieuHao: vatPham, trangBi, phapBao, congPhap, npcs }
        };
        const jsonString = JSON.stringify(dataToSave, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'thienthu_data.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                let loaded = false;
                if (data.manifest?.images && data.manifest?.categories) {
                    setManifest(data.manifest);
                    loaded = true;
                }
                if(data.thienThu) {
                    if(data.thienThu.vatPhamTieuHao) setVatPham(data.thienThu.vatPhamTieuHao);
                    if(data.thienThu.trangBi) setTrangBi(data.thienThu.trangBi);
                    if(data.thienThu.phapBao) setPhapBao(data.thienThu.phapBao);
                    if(data.thienThu.congPhap) setCongPhap(data.thienThu.congPhap);
                    if(data.thienThu.npcs) setNpcs(data.thienThu.npcs);
                    loaded = true;
                }
                if(loaded) alert("Nhập dữ liệu thành công!");
                else alert("Tệp không hợp lệ.");
            } catch (err) { alert("Lỗi đọc tệp."); }
        };
        reader.readAsText(file);
        if (event.target) event.target.value = '';
    };

    const handleUpdate = useCallback(() => {
        try {
            const thienThuToSave = { vatPhamTieuHao: vatPham, trangBi, phapBao, congPhap, npcs };
            localStorage.setItem('customThienThuItems', JSON.stringify(thienThuToSave));
            setLastSavedThienThu(thienThuToSave);
            alert('Đã cập nhật dữ liệu Thiên Thư vào bộ nhớ của trình duyệt.');
            return true;
        } catch (e) {
            alert("Lỗi khi cập nhật dữ liệu Thiên Thư.");
            return false;
        }
    }, [vatPham, trangBi, phapBao, congPhap, npcs]);
    
    const hasUnsavedChanges = useCallback(() => {
        if (!lastSavedThienThu) return false;
        const currentThienThu = { vatPhamTieuHao: vatPham, trangBi, phapBao, congPhap, npcs };
        try {
            return JSON.stringify(currentThienThu) !== JSON.stringify(lastSavedThienThu);
        } catch (e) { return true; }
    }, [lastSavedThienThu, vatPham, trangBi, phapBao, congPhap, npcs]);

    const handleBackClick = () => {
        if (hasUnsavedChanges()) setShowExitConfirm(true);
        else onBack();
    };

    const handleConfirmUpdateAndExit = () => {
        if (handleUpdate()) onBack();
        setShowExitConfirm(false);
    };

    const handleExitWithoutUpdating = () => {
        setShowExitConfirm(false);
        onBack();
    };

    const handleAssignImage = (itemId: string, imageId: string | null) => {
         if (!imageId) {
            alert("Vui lòng chọn một ảnh.");
            return;
        }
        const updateItem = (item: any) => item.id === itemId ? { ...item, imageId: imageId } : item;
        setVatPham(prev => prev.map(updateItem));
        setTrangBi(prev => prev.map(updateItem));
        setPhapBao(prev => prev.map(updateItem));
        setCongPhap(prev => prev.map(updateItem));
        setNpcs(prev => prev.map(updateItem));
    };

    const handleUnassignImage = (itemId: string) => {
        const updateItem = (item: any) => item.id === itemId ? { ...item, imageId: undefined } : item;
        setVatPham(prev => prev.map(updateItem));
        setTrangBi(prev => prev.map(updateItem));
        setPhapBao(prev => prev.map(updateItem));
        setCongPhap(prev => prev.map(updateItem));
        setNpcs(prev => prev.map(updateItem));
    };
    
    const handleTagToggle = (tagToToggle: string, imageToUpdate?: ThienThuImage) => {
        const targetImage = imageToUpdate || selectedImage;
        if (!targetImage) return;

        const newTags = targetImage.tags.includes(tagToToggle)
            ? targetImage.tags.filter(t => t !== tagToToggle)
            : [...targetImage.tags, tagToToggle];
        const updatedImage = { ...targetImage, tags: newTags };
        
        if(tagMgmtModal.isOpen){
            setTagMgmtModal(prev => ({...prev, image: updatedImage}));
        }
        if(selectedImage?.fileName === updatedImage.fileName){
            setSelectedImage(updatedImage);
        }

        setManifest(prev => ({ ...prev, images: prev.images.map(img => img.fileName === updatedImage.fileName ? updatedImage : img) }));
    };

    const handleAddTag = (tagToAdd: string, category?: string) => {
        const targetCategory = category || expandedCategory;
        const newTagClean = tagToAdd.trim().toLowerCase();
        if (!newTagClean || !targetCategory) {
            alert("Vui lòng chọn một nhóm ảnh và nhập tên nhãn.");
            return;
        }

        const categoryTags = manifest.categories[targetCategory]?.tags;
        if (categoryTags && !categoryTags.includes(newTagClean)) {
            const newManifest = { ...manifest };
            newManifest.categories[targetCategory].tags = [...categoryTags, newTagClean].sort();
            setManifest(newManifest);
            setNewTag('');
        }
    };
    
    const handleUpdateTag = (oldTag: string, newTag: string, categoryOverride?: string) => {
        const newTagClean = newTag.trim().toLowerCase();
        const category = categoryOverride || expandedCategory;
        if (!newTagClean || oldTag === newTagClean || !category) {
            setEditingTag(null);
            return;
        }
        setManifest(prev => {
            const newM = JSON.parse(JSON.stringify(prev));
            const cat = newM.categories[category!];
            if (!cat) return prev;
            cat.tags = [...new Set(cat.tags.map((t: string) => t === oldTag ? newTagClean : t))].sort();
            newM.images = newM.images.map((img: ThienThuImage) => {
                if (img.category === category && img.tags.includes(oldTag)) {
                    return { ...img, tags: [...new Set(img.tags.map((t: string) => t === oldTag ? newTagClean : t))] };
                }
                return img;
            });
            return newM;
        });
        setEditingTag(null);
    };

    const handleDeleteTag = (tagToDelete: string, categoryOverride?: string) => {
        const category = categoryOverride || expandedCategory;
        if (!category) return;
        setManifest(prev => {
            const newM = JSON.parse(JSON.stringify(prev));
            const cat = newM.categories[category!];
            if (!cat) return prev;
            cat.tags = cat.tags.filter((t: string) => t !== tagToDelete);
            newM.images = newM.images.map((img: ThienThuImage) => 
                img.category === category 
                ? { ...img, tags: img.tags.filter((t: string) => t !== tagToDelete) } 
                : img
            );
            return newM;
        });
    };
    
    const handleCategoryToggle = (catKey: string) => {
        setExpandedCategory(prev => prev === catKey ? null : catKey);
    };
    
    const toggleSelectAllItems = () => {
        if (selectedItemIds.size === filteredAndSortedItems.length) {
            setSelectedItemIds(new Set());
        } else {
            setSelectedItemIds(new Set(filteredAndSortedItems.map(item => item.id)));
        }
    };
    
    const toggleItemSelection = (itemId: string) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) newSet.delete(itemId);
            else newSet.add(itemId);
            return newSet;
        });
    };

    const handleAiGenerateTagsFromSelection = async () => {
        setLoadingMessage('AI đang tạo nhãn từ vật phẩm...');
        setIsLoading(true);

        const selectedItems = thienThuItems.filter(item => selectedItemIds.has(item.id));
        if (selectedItems.length === 0) {
            setIsLoading(false);
            return;
        }

        const itemsByCategory = selectedItems.reduce((acc, item) => {
            const category = item.__type;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, any[]>);

        try {
            const newManifest = JSON.parse(JSON.stringify(manifest));
            
            for (const categoryKey in itemsByCategory) {
                if (newManifest.categories[categoryKey]) {
                    const items = itemsByCategory[categoryKey];
                    const generatedTags = await geminiService.generateTagsFromItems(items);
                    
                    const categoryTags = newManifest.categories[categoryKey].tags;
                    const newTags = [...new Set([...categoryTags, ...generatedTags])].sort();
                    newManifest.categories[categoryKey].tags = newTags;
                }
            }
            
            setManifest(newManifest);
            alert('AI đã tạo và thêm nhãn mới vào các nhóm tương ứng!');
        } catch (error) {
            console.error("AI tag generation failed", error);
            alert("AI tạo nhãn thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAiOptimizeTags = async () => {
        const categoryToOptimize = expandedCategory; // Use the one selected in desktop, or from the mobile view state
        if (!categoryToOptimize) {
            alert("Vui lòng chọn một nhóm ảnh để tối ưu hóa nhãn.");
            return;
        }
        
        const categoryTags = manifest.categories[categoryToOptimize].tags;
        if (categoryTags.length < 2) {
            alert("Nhóm này có quá ít nhãn để tối ưu hóa.");
            return;
        }

        setLoadingMessage('AI đang tối ưu hóa nhãn...');
        setIsLoading(true);

        try {
            const { optimizedTags, changes } = await geminiService.optimizeTags(categoryTags);
            
            const newManifest = JSON.parse(JSON.stringify(manifest));
            
            newManifest.categories[categoryToOptimize].tags = optimizedTags;

            const changesMap = new Map(changes.map(c => [c.old, c.new]));
            
            newManifest.images = newManifest.images.map((img: ThienThuImage) => {
                if (img.category === categoryToOptimize) {
                    const updatedTags = img.tags.map(tag => changesMap.get(tag) || tag);
                    return { ...img, tags: [...new Set(updatedTags)] };
                }
                return img;
            });

            setManifest(newManifest);
            alert(`Đã tối ưu hóa các nhãn cho nhóm "${manifest.categories[categoryToOptimize].name}".`);

        } catch (error) {
            console.error("AI tag optimization failed", error);
            alert("AI tối ưu hóa nhãn thất bại.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddUrlImage = (categoryOverride?: string) => {
        const category = categoryOverride || expandedCategory;
        if (!imageUrl.trim().startsWith('http') || !category) return;
        const newImage: ThienThuImage = {
            fileName: imageUrl.trim(),
            category: category,
            tags: []
        };
        setManifest(prev => ({ ...prev, images: [...prev.images, newImage] }));
        setImageUrl('');
    };
    
    const renderAttributes = (attributes: Partial<PlayerAttributes> | undefined) => {
        if (!attributes || Object.keys(attributes).length === 0) return null;
        return (
            <div className="pt-1 border-t border-slate-700/50">
                <strong className="text-slate-400">Thuộc tính:</strong>
                <ul className="list-disc list-inside text-slate-300">
                    {Object.entries(attributes).map(([key, value]) => (
                        <li key={key} className="text-xs">{PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: <span className="text-green-300 font-semibold">+{value as number}</span></li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <main className="h-dvh w-screen p-0 md:p-4 text-white flex flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
            {showExitConfirm && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-xl font-bold text-yellow-300 mb-4">Xác nhận</h3>
                        <p className="text-slate-300 mb-6">Bạn chưa cập nhật các thay đổi vào Thiên Thư. Bạn có muốn cập nhật trước khi thoát không?</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={handleExitWithoutUpdating} className="px-4 py-2 font-bold text-base rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition-colors">Không</button>
                            <button onClick={handleConfirmUpdateAndExit} className="px-4 py-2 font-bold text-base rounded-lg bg-yellow-500 hover:bg-yellow-600 text-slate-900 transition-colors">Cập nhật</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* MODALS for Mobile UI */}
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
                                                    <input type="checkbox" checked={tagMgmtModal.image!.tags.includes(tag)} onChange={() => handleTagToggle(tag, tagMgmtModal.image!)} className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500"/>
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
                                    <summary className="p-2 font-bold text-yellow-200 cursor-pointer">{category.name}</summary>
                                    <div className="p-2 border-t border-slate-700">
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {manifest.images.filter(img => img.category === catKey && img.fileName.toLowerCase().includes(imageSearchTerm.toLowerCase())).map(image => (
                                                <button key={image.fileName} onClick={() => { handleAssignImage(imgLibModal.item!.id, image.fileName); setImgLibModal({isOpen: false, item: null}); }} className="aspect-square rounded-lg overflow-hidden border-2 border-slate-600 hover:border-yellow-400 transition-colors">
                                                    <img src={getImageUrl(image.fileName)} alt={image.fileName} className="w-full h-full object-cover"/>
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

            {/* --- DESKTOP LAYOUT --- */}
            <div className="hidden md:flex w-full max-w-full h-full max-h-[95vh] flex-col gap-4">
                 <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600 text-center sm:text-left">Thiên Thư Họa Quyển</h1>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center">
                        <button onClick={handleBackClick} className="flex-1 sm:flex-none px-4 py-2 font-bold text-base rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition-colors">Quay Lại</button>
                        <button onClick={handleImportClick} disabled={isLoading} className="flex-1 sm:flex-none px-4 py-2 font-bold text-base rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors">Nhập JSON</button>
                        <button onClick={handleSave} disabled={isLoading} className="flex-1 sm:flex-none px-4 py-2 font-bold text-base rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">Xuất JSON</button>
                        <button onClick={handleUpdate} disabled={isLoading} className="flex-1 sm:flex-none px-4 py-2 font-bold text-base rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50">Cập nhật</button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row gap-4 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 text-white min-h-0">
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center">
                            <Icons.SparklesIcon className="w-16 h-16 text-yellow-300 animate-pulse" />
                            <p className="text-xl font-semibold mt-4">{loadingMessage}</p>
                        </div>
                    )}
                    {/* Left Column: Image Gallery */}
                    <div className="w-full md:w-[25%] p-4 border-b md:border-b-0 md:border-r border-slate-700/50 flex flex-col h-[50%] md:h-auto">
                        <h2 className="text-xl font-bold text-yellow-300 mb-2 flex-shrink-0">Thư Viện Ảnh</h2>
                        <input type="text" placeholder="Tìm tên ảnh..." value={imageSearchTerm} onChange={e => setImageSearchTerm(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm mb-2 flex-shrink-0" />
                        <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-4 space-y-2">
                             {Object.entries(manifest.categories).map(([catKey, category]) => (
                                <details key={catKey} className="bg-slate-800/50 rounded-lg border border-slate-700" open={expandedCategory === catKey || !expandedCategory}>
                                    <summary className="p-2 flex items-center justify-between cursor-pointer" onClick={(e) => { e.preventDefault(); handleCategoryToggle(catKey); }}>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-yellow-200">{category.name}</span>
                                        </div>
                                        {expandedCategory === catKey ? <Icons.ChevronUpIcon className="w-5 h-5 text-slate-400"/> : <Icons.ChevronDownIcon className="w-5 h-5 text-slate-400"/>}
                                    </summary>
                                    {expandedCategory === catKey && (
                                        <div className="p-2 border-t border-slate-700 space-y-2 max-h-64 overflow-y-auto styled-scrollbar">
                                             <div className="flex-shrink-0 flex gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Thêm ảnh bằng URL..." 
                                                    value={imageUrl} 
                                                    onChange={e => setImageUrl(e.target.value)} 
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                                                />
                                                <button 
                                                    onClick={() => handleAddUrlImage()}
                                                    disabled={!imageUrl.startsWith('http')}
                                                    className="p-2 bg-green-600 rounded-lg disabled:opacity-50"
                                                >
                                                    <Icons.PlusCircleIcon className="w-6 h-6"/>
                                                </button>
                                            </div>
                                            {manifest.images.filter(img => img.category === catKey && img.fileName.toLowerCase().includes(imageSearchTerm.toLowerCase())).map(image => (
                                                <div key={image.fileName} onClick={() => setSelectedImage(image)} className={`w-full p-2 rounded-lg flex items-start gap-3 text-left transition-all cursor-pointer ${selectedImage?.fileName === image.fileName ? 'bg-yellow-500/10 border-yellow-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'} border`}>
                                                    <img src={getImageUrl(image.fileName) || ''} alt={image.fileName} className="w-12 h-12 object-cover rounded-md flex-shrink-0"/>
                                                    <div className="flex-grow min-w-0">
                                                        {image.fileName.startsWith('http') ? (
                                                            <a href={image.fileName} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs font-semibold text-cyan-400 hover:underline">
                                                                Ảnh tự thêm
                                                            </a>
                                                        ) : (
                                                            <h4 className="text-xs font-semibold break-all">{image.fileName.split('/').pop()}</h4>
                                                        )}
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {image.tags.map(tag => (
                                                                <span key={tag} className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </details>
                            ))}
                        </div>
                    </div>

                    {/* Center Column: Thien Thu Item List */}
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
                                                {item.imageId ? <img src={getImageUrl(item.imageId)} alt={item.name} className="w-full h-full object-cover"/> : <Icons.QuestionMarkCircleIcon className="w-8 h-8 text-slate-500"/>}
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

                    {/* Right Column: Tag Manager */}
                     <div className="w-full md:w-[25%] p-4 flex flex-col h-full">
                        <h3 className="text-lg font-bold text-yellow-300 mb-2 flex-shrink-0">Quản lý Nhãn {expandedCategory ? `(${manifest.categories[expandedCategory]?.name})` : '(Tất cả)'}</h3>
                         <div className="mb-2 flex-shrink-0"> <input type="text" value={tagSearchTerm} onChange={e => setTagSearchTerm(e.target.value)} placeholder="Tìm nhãn..." className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm"/> </div>
                        
                        <label className="text-xs text-slate-400 mb-1 block">
                             {expandedCategory ? `Thêm nhãn vào nhóm "${manifest.categories[expandedCategory]?.name}"` : 'Chọn một nhóm để thêm nhãn'}
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
                </div>
            </div>

            {/* --- MOBILE/TABLET LAYOUT --- */}
            <div className="flex md:hidden w-full h-full flex-col bg-slate-900/50">
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
                                {Object.entries(manifest.categories).map(([key, cat]) => <option key={key} value={key}>{cat.name}</option>)}
                            </select>
                             <div className="px-2 py-3 border-y border-slate-700/50 flex justify-between items-center">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" onChange={toggleSelectAllItems} checked={filteredAndSortedItems.length > 0 && selectedItemIds.size === filteredAndSortedItems.length} className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500" />
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
                                            {item.imageId ? <img src={getImageUrl(item.imageId)} alt={item.name} className="w-full h-full object-cover"/> : <Icons.QuestionMarkCircleIcon className="w-8 h-8 text-slate-500"/>}
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
                                    <summary className="p-2 font-bold text-yellow-200 cursor-pointer">{category.name}</summary>
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
                                                    <img src={getImageUrl(image.fileName)} alt={image.fileName} className="w-full h-full object-cover"/>
                                                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 backdrop-blur-sm">
                                                        <h5 className="text-[10px] text-white font-semibold truncate">
                                                            {image.fileName.startsWith('http') ? (
                                                                <a href={image.fileName} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-cyan-400 hover:underline">Link ngoài</a>
                                                            ) : (
                                                                image.fileName.split('/').pop()
                                                            )}
                                                        </h5>
                                                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                                                            {image.tags.length > 0 ? image.tags.slice(0, 3).map(tag => (
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
                                    {Object.entries(manifest.categories).map(([key, cat]) => <option key={key} value={key}>{cat.name}</option>)}
                                </select>
                                <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag(newTag, newTagCategory)} placeholder="Nhãn mới..." className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-2 text-sm"/>
                                <button onClick={() => handleAddTag(newTag, newTagCategory)} className="p-2 bg-green-600 rounded-lg"><Icons.PlusCircleIcon className="w-6 h-6"/></button>
                            </div>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto styled-scrollbar">
                                {Object.entries(manifest.categories).map(([catKey, category]) => (
                                     <div key={catKey}>
                                        <h4 className="font-bold text-yellow-200 mb-2">{category.name}</h4>
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
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json,application/json" className="hidden" />
        </main>
    );
};