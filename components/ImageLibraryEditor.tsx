

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ThienThuImage, ThienThuImageManifest, InitialItem, InitialCongPhap, InitialNpc, NguHanhType, PlayerAttributes } from '../types';
import * as Icons from './Icons';
import * as geminiService from '../services/geminiService';
import { THIEN_THU_VAT_PHAM_TIEU_HAO, THIEN_THU_TRANG_BI, THIEN_THU_PHAP_BAO, THIEN_THU_CONG_PHAP } from '../data/thienThu';
import { PLAYER_ATTRIBUTE_NAMES } from '../constants';

import { ConfirmationDialog } from './imageLibraryEditor/ConfirmationDialog';
import { EditorHeader } from './imageLibraryEditor/EditorHeader';
import { ImageGalleryPanel } from './imageLibraryEditor/ImageGalleryPanel';
import { ThienThuItemListPanel } from './imageLibraryEditor/ThienThuItemListPanel';
import { TagManagerPanel } from './imageLibraryEditor/TagManagerPanel';
import { MobileUI } from './imageLibraryEditor/MobileUI';


interface ImageLibraryEditorProps {
    onBack: () => void;
}

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


    const loadData = useCallback(async () => {
        try {
            const manifestResponse = await fetch('/thienthu_images.json');
            if (!manifestResponse.ok) {
                throw new Error('Failed to load image manifest.');
            }
            const data: ThienThuImageManifest = await manifestResponse.json();
            setManifest(data);
            if (data.categories && Object.keys(data.categories).length > 0) {
                setNewTagCategory(Object.keys(data.categories)[0]);
            }
        } catch (err) {
            console.error("Error loading image manifest:", err);
            setManifest({ categories: {}, images: [] });
        }
        
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

    const handleBulkAssignImages = async () => {
        if (selectedItemIds.size === 0) return;

        setIsLoading(true);
        setLoadingMessage('AI đang gán ảnh cho các vật phẩm đã chọn...');

        try {
            if (!manifest) throw new Error("Manifest chưa được tải.");

            const allSelectedItems = Array.from(selectedItemIds)
                .map(id => thienThuItems.find(item => item.id === id))
                .filter((item): item is NonNullable<typeof item> => !!item);

            if (allSelectedItems.length === 0) {
                throw new Error("Không tìm thấy vật phẩm nào được chọn.");
            }
            
            const itemsToAssign = allSelectedItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                category: manifest.categories[item.__type]?.name || item.__type
            }));

            const assignments = await geminiService.assignImagesInBulk(itemsToAssign, manifest.images);
            
            const assignmentsMap = new Map(assignments.map(a => [a.itemId, a.imageId]));

            const updateList = (list: any[]) => list.map(item => {
                const newImageId = assignmentsMap.get(item.id);
                return newImageId ? { ...item, imageId: newImageId } : item;
            });
        
            setVatPham(prev => updateList(prev));
            setTrangBi(prev => updateList(prev));
            setPhapBao(prev => updateList(prev));
            setCongPhap(prev => updateList(prev));
            setNpcs(prev => updateList(prev));

            alert(`AI đã gán ảnh thành công cho ${assignments.length} vật phẩm.`);

        } catch (error) {
            console.error("Lỗi khi AI gán ảnh hàng loạt:", error);
            alert(`Đã xảy ra lỗi: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
            setSelectedItemIds(new Set());
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
                <ConfirmationDialog
                    onExitWithoutUpdating={handleExitWithoutUpdating}
                    onConfirmUpdateAndExit={handleConfirmUpdateAndExit}
                />
            )}
            
            {/* --- DESKTOP LAYOUT --- */}
            <div className="hidden md:flex w-full max-w-full h-full max-h-[95vh] flex-col gap-4">
                <EditorHeader
                    handleBackClick={handleBackClick}
                    handleImportClick={handleImportClick}
                    handleSave={handleSave}
                    handleUpdate={handleUpdate}
                    isLoading={isLoading}
                />
                <div className="flex-1 flex flex-col md:flex-row gap-4 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 text-white min-h-0">
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center">
                            <Icons.SparklesIcon className="w-16 h-16 text-yellow-300 animate-pulse" />
                            <p className="text-xl font-semibold mt-4">{loadingMessage}</p>
                        </div>
                    )}
                    <ImageGalleryPanel
                        manifest={manifest}
                        imageSearchTerm={imageSearchTerm}
                        setImageSearchTerm={setImageSearchTerm}
                        expandedCategory={expandedCategory}
                        handleCategoryToggle={handleCategoryToggle}
                        imageUrl={imageUrl}
                        setImageUrl={setImageUrl}
                        handleAddUrlImage={handleAddUrlImage}
                        selectedImage={selectedImage}
                        setSelectedImage={setSelectedImage}
                    />
                    <ThienThuItemListPanel
                        itemSearchTerm={itemSearchTerm}
                        setItemSearchTerm={setItemSearchTerm}
                        nguHanhFilter={nguHanhFilter}
                        setNguHanhFilter={setNguHanhFilter}
                        toggleSelectAllItems={toggleSelectAllItems}
                        filteredAndSortedItems={filteredAndSortedItems}
                        selectedItemIds={selectedItemIds}
                        handleAiGenerateTagsFromSelection={handleAiGenerateTagsFromSelection}
                        handleBulkAssignImages={handleBulkAssignImages}
                        isLoading={isLoading}
                        itemSortOrder={itemSortOrder}
                        setItemSortOrder={setItemSortOrder}
                        toggleItemSelection={toggleItemSelection}
                        handleUnassignImage={handleUnassignImage}
                        manifest={manifest}
                        renderAttributes={renderAttributes}
                        handleAssignImage={handleAssignImage}
                        selectedImage={selectedImage}
                    />
                    <TagManagerPanel
                        expandedCategory={expandedCategory}
                        manifest={manifest}
                        tagSearchTerm={tagSearchTerm}
                        setTagSearchTerm={setTagSearchTerm}
                        newTag={newTag}
                        setNewTag={setNewTag}
                        handleAddTag={handleAddTag}
                        displayedTags={displayedTags}
                        editingTag={editingTag}
                        editingTagName={editingTagName}
                        setEditingTag={setEditingTag}
                        setEditingTagName={setEditingTagName}
                        handleUpdateTag={handleUpdateTag}
                        selectedImage={selectedImage}
                        handleTagToggle={handleTagToggle}
                        handleDeleteTag={handleDeleteTag}
                        isLoading={isLoading}
                        allTags={allTags}
                        handleAiOptimizeTags={handleAiOptimizeTags}
                    />
                </div>
            </div>

            {/* --- MOBILE/TABLET LAYOUT --- */}
            <MobileUI
                handleBackClick={handleBackClick}
                handleImportClick={handleImportClick}
                handleSave={handleSave}
                handleUpdate={handleUpdate}
                isLoading={isLoading}
                mobileTab={mobileTab}
                setMobileTab={setMobileTab}
                itemSearchTerm={itemSearchTerm}
                setItemSearchTerm={setItemSearchTerm}
                nguHanhFilter={nguHanhFilter}
                setNguHanhFilter={setNguHanhFilter}
                expandedCategory={expandedCategory}
                setExpandedCategory={setExpandedCategory}
                manifest={manifest}
                toggleSelectAllItems={toggleSelectAllItems}
                filteredAndSortedItems={filteredAndSortedItems}
                selectedItemIds={selectedItemIds}
                handleAiGenerateTagsFromSelection={handleAiGenerateTagsFromSelection}
                handleBulkAssignImages={handleBulkAssignImages}
                toggleItemSelection={toggleItemSelection}
                setImgLibModal={setImgLibModal}
                imageSearchTerm={imageSearchTerm}
                setImageSearchTerm={setImageSearchTerm}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                handleAddUrlImage={handleAddUrlImage}
                setTagMgmtModal={setTagMgmtModal}
                tagSearchTerm={tagSearchTerm}
                setTagSearchTerm={setTagSearchTerm}
                newTagCategory={newTagCategory}
                setNewTagCategory={setNewTagCategory}
                newTag={newTag}
                setNewTag={setNewTag}
                handleAddTag={handleAddTag}
                editingTag={editingTag}
                editingTagName={editingTagName}
                setEditingTag={setEditingTag}
                setEditingTagName={setEditingTagName}
                handleUpdateTag={handleUpdateTag}
                handleDeleteTag={handleDeleteTag}
                tagMgmtModal={tagMgmtModal}
                handleTagToggle={handleTagToggle}
                imgLibModal={imgLibModal}
                handleAssignImage={handleAssignImage}
            />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json,application/json" className="hidden" />
        </main>
    );
};