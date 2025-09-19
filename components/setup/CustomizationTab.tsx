import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { DestinyDefinition, StatusEffect, ItemEffectDefinition, PlayerAttributes, InitialItem, InitialCongPhap, ThienThuImageManifest } from '../../types';
import * as Icons from '../Icons';
import { PencilIcon, TrashIcon } from '../Icons';
import * as geminiService from '../../services/geminiService';

// Refactored imports
import { EffectStatusModal } from './customization/EffectStatusModal';
import { DefinitionList } from './customization/DefinitionList';
import { EditableThienThuElement } from './customization/EditableThienThuElement';
import { NGU_HANH_DISPLAY, getRankColor, getStatusTypeColor, renderAttributes } from './customization/helpers';

// Original imports that are still needed
import { ElementModal } from './elements/ElementModals';
import { ImageAssignmentModal } from '../GamePanels';

interface CustomizationTabProps {
    destinyDefs: Record<string, DestinyDefinition>;
    setDestinyDefs: React.Dispatch<React.SetStateAction<Record<string, DestinyDefinition>>>;
    statusEffectDefs: Record<string, StatusEffect>;
    setStatusEffectDefs: React.Dispatch<React.SetStateAction<Record<string, StatusEffect>>>;
    itemEffectDefs: Record<string, ItemEffectDefinition>;
    setItemEffectDefs: React.Dispatch<React.SetStateAction<Record<string, ItemEffectDefinition>>>;
    customThienThu: any;
    setCustomThienThu: React.Dispatch<React.SetStateAction<any>>;
}

export const CustomizationTab: React.FC<CustomizationTabProps> = (props) => {
    const { customThienThu, setCustomThienThu } = props;

    type ThienThuTab = 'vatPham' | 'trangBi' | 'phapBao' | 'congPhap' | 'hieuUng' | 'trangThai';
    const [activeTab, setActiveTab] = useState<ThienThuTab>('vatPham');
    const [modalState, setModalState] = useState<{type: string, data: any | null} | null>(null);
    const [effectStatusModalState, setEffectStatusModalState] = useState<{type: 'hieuUng' | 'trangThai', data: any | null} | null>(null);
    const [itemSortOrder, setItemSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
    const [trangThaiSortOrder, setTrangThaiSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // Item state is derived from props
    const { vatPhamTieuHao: vatPham, trangBi, phapBao, congPhap, hieuUng, trangThai } = customThienThu;
    
    // Create setter functions that update the parent state
    const setVatPham = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, vatPhamTieuHao: typeof updater === 'function' ? updater(prev.vatPhamTieuHao) : updater }));
    const setTrangBi = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, trangBi: typeof updater === 'function' ? updater(prev.trangBi) : updater }));
    const setPhapBao = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, phapBao: typeof updater === 'function' ? updater(prev.phapBao) : updater }));
    const setCongPhap = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, congPhap: typeof updater === 'function' ? updater(prev.congPhap) : updater }));
    const setHieuUng = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, hieuUng: typeof updater === 'function' ? updater(prev.hieuUng) : updater }));
    const setTrangThai = (updater: any) => setCustomThienThu((prev: any) => ({ ...prev, trangThai: typeof updater === 'function' ? updater(prev.trangThai) : updater }));

    // Filter states
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [itemSearchTerm, setItemSearchTerm] = useState('');
    const [vatPhamFilter, setVatPhamFilter] = useState('Tất cả');
    const [trangBiFilter, setTrangBiFilter] = useState('Tất cả');
    const [congPhapFilter, setCongPhapFilter] = useState('Tất cả');
    const [nguHanhFilter, setNguHanhFilter] = useState('Tất cả');
    const [hieuUngFilter, setHieuUngFilter] = useState('Tất cả');
    const [trangThaiFilter, setTrangThaiFilter] = useState('Tất cả');


    // State for image assignment
    const [assignmentModalState, setAssignmentModalState] = useState<{ isOpen: boolean; item: any | null; itemType: ThienThuTab | null; }>({ isOpen: false, item: null, itemType: null });
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    
    const toggleItemSelection = (itemId: string) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleItemSort = () => {
        setItemSortOrder(current => {
            if (current === 'none') return 'asc';
            if (current === 'asc') return 'desc';
            return 'none';
        });
    };
    
    const handleTrangThaiSort = () => {
        setTrangThaiSortOrder(current => {
            if (current === 'none') return 'asc';
            if (current === 'asc') return 'desc';
            return 'none';
        });
    };

    const handleSave = useCallback(() => {
        const dataToSave = { vatPhamTieuHao: vatPham, trangBi, phapBao, congPhap, hieuUng, trangThai };
        const jsonString = JSON.stringify(dataToSave, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ThienThu_Items_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [vatPham, trangBi, phapBao, congPhap, hieuUng, trangThai]);

    const handleLoad = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);

                // Validation function
                const isValid = (d: any) => d && Array.isArray(d) && d.every(item => typeof item === 'object' && item !== null && 'id' in item && 'name' in item);

                let loadedSomething = false;
                if (isValid(data.vatPhamTieuHao)) { setVatPham(data.vatPhamTieuHao); loadedSomething = true; }
                if (isValid(data.trangBi)) { setTrangBi(data.trangBi); loadedSomething = true; }
                if (isValid(data.phapBao)) { setPhapBao(data.phapBao); loadedSomething = true; }
                if (isValid(data.congPhap)) { setCongPhap(data.congPhap); loadedSomething = true; }
                if (isValid(data.hieuUng)) { setHieuUng(data.hieuUng); loadedSomething = true; }
                if (isValid(data.trangThai)) { setTrangThai(data.trangThai); loadedSomething = true; }
                
                if (loadedSomething) {
                    alert("Tải dữ liệu Thiên Thư thành công!");
                } else {
                    alert("Định dạng tệp không đúng hoặc không chứa dữ liệu hợp lệ.");
                }
            } catch (err) {
                 console.error("Lỗi khi tải dữ liệu:", err);
                alert("Lỗi: Không thể đọc tệp hoặc định dạng tệp không đúng.");
            }
        };
        reader.readAsText(file);
        if (event.target) event.target.value = '';
    }, [setVatPham, setTrangBi, setPhapBao, setCongPhap, setHieuUng, setTrangThai]);

    const handleSaveItem = (data: any) => {
        const isNew = !modalState?.data;
        const finalItem = {
            ...data,
            id: isNew ? `thienthu_${modalState?.type}_${Date.now()}` : (modalState?.data?.id || `thienthu_${modalState?.type}_${Date.now()}`),
        };

        const updateList = (setter: (updater: (prev: any[]) => any[]) => void) => {
            setter(prevList => {
                const index = prevList.findIndex(i => i.id === finalItem.id);
                if (index > -1) {
                    const newList = [...prevList];
                    newList[index] = finalItem;
                    return newList;
                }
                return [...prevList, finalItem];
            });
        };

        switch (modalState?.type) {
            case 'item': updateList(setVatPham); break;
            case 'trangBi': updateList(setTrangBi); break;
            case 'phapBao': updateList(setPhapBao); break;
            case 'congPhap': updateList(setCongPhap); break;
        }
        setModalState(null);
    };
    
    const handleSaveEffectStatus = (data: any) => {
        const isNew = !effectStatusModalState?.data?.id;
        const finalItem = {
            ...data,
            id: isNew ? `thienthu_${effectStatusModalState?.type}_${Date.now()}` : data.id,
        };
    
        const updateList = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
            setter(prev => {
                const index = prev.findIndex(i => i.id === finalItem.id);
                if (index > -1) {
                    const newArr = [...prev];
                    newArr[index] = finalItem;
                    return newArr;
                }
                return [...prev, finalItem];
            });
        };
    
        if (effectStatusModalState?.type === 'hieuUng') {
            updateList(setHieuUng);
        } else if (effectStatusModalState?.type === 'trangThai') {
            updateList(setTrangThai);
        }
        setEffectStatusModalState(null);
    };

    const handleBulkDelete = () => {
        if (selectedItemIds.size === 0) return;
        
        const deleteSelected = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
            setter(prev => prev.filter(item => !selectedItemIds.has(item.id)));
        };

        switch (activeTab) {
            case 'vatPham': deleteSelected(setVatPham); break;
            case 'trangBi': deleteSelected(setTrangBi); break;
            case 'phapBao': deleteSelected(setPhapBao); break;
            case 'congPhap': deleteSelected(setCongPhap); break;
            case 'hieuUng': deleteSelected(setHieuUng); break;
            case 'trangThai': deleteSelected(setTrangThai); break;
        }
        setSelectedItemIds(new Set());
    };

    const handleUnassignImage = (setter: React.Dispatch<React.SetStateAction<any[]>>, itemId: string) => {
        setter(prev => prev.map(i => i.id === itemId ? { ...i, imageId: undefined } : i));
    };

    const filteredVatPham = useMemo(() => {
        return vatPham
            .filter((item: InitialItem) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: InitialItem) => vatPhamFilter === 'Tất cả' || item.consumableType === vatPhamFilter)
            .filter((item: InitialItem) => nguHanhFilter === 'Tất cả' || item.nguHanhAttribute === nguHanhFilter.toLowerCase())
            .sort((a: InitialItem, b: InitialItem) => {
                if (itemSortOrder === 'none') return 0;
                return itemSortOrder === 'asc' ? (a.rank || 0) - (b.rank || 0) : (b.rank || 0) - (a.rank || 0);
            });
    }, [vatPham, itemSearchTerm, vatPhamFilter, nguHanhFilter, itemSortOrder]);

    const filteredTrangBi = useMemo(() => {
        return trangBi
            .filter((item: InitialItem) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: InitialItem) => trangBiFilter === 'Tất cả' || item.equipmentType === trangBiFilter)
            .filter((item: InitialItem) => nguHanhFilter === 'Tất cả' || item.nguHanhAttribute === nguHanhFilter.toLowerCase())
            .sort((a: InitialItem, b: InitialItem) => {
                if (itemSortOrder === 'none') return 0;
                return itemSortOrder === 'asc' ? (a.rank || 0) - (b.rank || 0) : (b.rank || 0) - (a.rank || 0);
            });
    }, [trangBi, itemSearchTerm, trangBiFilter, nguHanhFilter, itemSortOrder]);

    const filteredPhapBao = useMemo(() => {
        return phapBao
            .filter((item: InitialItem) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: InitialItem) => nguHanhFilter === 'Tất cả' || item.nguHanhAttribute === nguHanhFilter.toLowerCase())
            .sort((a: InitialItem, b: InitialItem) => {
                if (itemSortOrder === 'none') return 0;
                return itemSortOrder === 'asc' ? (a.rank || 0) - (b.rank || 0) : (b.rank || 0) - (a.rank || 0);
            });
    }, [phapBao, itemSearchTerm, nguHanhFilter, itemSortOrder]);
    
    const filteredCongPhap = useMemo(() => {
        return congPhap
            .filter((item: InitialCongPhap) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: InitialCongPhap) => congPhapFilter === 'Tất cả' || item.techniqueType === congPhapFilter)
            .filter((item: InitialCongPhap) => nguHanhFilter === 'Tất cả' || item.nguHanhAttribute === nguHanhFilter.toLowerCase())
            .sort((a: InitialCongPhap, b: InitialCongPhap) => {
                if (itemSortOrder === 'none') return 0;
                return itemSortOrder === 'asc' ? (a.rank || 0) - (b.rank || 0) : (b.rank || 0) - (a.rank || 0);
            });
    }, [congPhap, itemSearchTerm, congPhapFilter, nguHanhFilter, itemSortOrder]);
    
    const filteredHieuUng = useMemo(() => {
        return hieuUng
            .filter((item: ItemEffectDefinition) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: ItemEffectDefinition) => hieuUngFilter === 'Tất cả' || item.category === hieuUngFilter)
            .sort((a, b) => {
                if (itemSortOrder === 'none') return 0;
                return itemSortOrder === 'asc' ? (a.rank || 0) - (b.rank || 0) : (b.rank || 0) - (a.rank || 0);
            });
    }, [hieuUng, itemSearchTerm, hieuUngFilter, itemSortOrder]);

    const filteredTrangThai = useMemo(() => {
        return trangThai
            .filter((item: StatusEffect) => item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
            .filter((item: StatusEffect) => trangThaiFilter === 'Tất cả' || item.type === trangThaiFilter)
            .sort((a, b) => {
                if (trangThaiSortOrder === 'none') return 0;
                return trangThaiSortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            });
    }, [trangThai, itemSearchTerm, trangThaiFilter, trangThaiSortOrder]);

    const handleAssignImage = (imageId: string) => {
        if (assignmentModalState.item && assignmentModalState.itemType) {
            const itemId = assignmentModalState.item.id;
            const updateItem = (item: any) => item.id === itemId ? { ...item, imageId: imageId } : item;
    
            switch(assignmentModalState.itemType) {
                case 'vatPham': setVatPham(prev => prev.map(updateItem)); break;
                case 'trangBi': setTrangBi(prev => prev.map(updateItem)); break;
                case 'phapBao': setPhapBao(prev => prev.map(updateItem)); break;
                case 'congPhap': setCongPhap(prev => prev.map(updateItem)); break;
            }
        }
        setAssignmentModalState({ isOpen: false, item: null, itemType: null });
    };
    
    const handleBulkAssignImages = async () => {
        if (selectedItemIds.size === 0) return;

        setIsLoading(true);
        setLoadingMessage('AI đang gán ảnh cho các vật phẩm đã chọn...');

        try {
            const manifestResponse = await fetch('/thienthu_images.json');
            if (!manifestResponse.ok) throw new Error('Không thể tải thư viện ảnh.');
            const manifest: ThienThuImageManifest = await manifestResponse.json();

            const getItemsAndSetter = () => {
                switch (activeTab) {
                    case 'vatPham': return { items: vatPham, setter: setVatPham };
                    case 'trangBi': return { items: trangBi, setter: setTrangBi };
                    case 'phapBao': return { items: phapBao, setter: setPhapBao };
                    case 'congPhap': return { items: congPhap, setter: setCongPhap };
                    default: return { items: [], setter: () => {} };
                }
            };

            const { items, setter } = getItemsAndSetter();
            const selectedItems = items.filter((item: any) => selectedItemIds.has(item.id));
            
            if (selectedItems.length === 0) {
                throw new Error("Không tìm thấy vật phẩm nào được chọn.");
            }
            
            const itemsToAssign = selectedItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                category: item.techniqueType || item.equipmentType || item.consumableType || item.itemType || 'Khác'
            }));

            const assignments = await geminiService.assignImagesInBulk(itemsToAssign, manifest.images);
            
            setter((prevItems: any[]) => {
                const newItems = [...prevItems];
                assignments.forEach(assignment => {
                    const itemIndex = newItems.findIndex(item => item.id === assignment.itemId);
                    if (itemIndex > -1) {
                        newItems[itemIndex].imageId = assignment.imageId;
                    }
                });
                return newItems;
            });

            alert(`AI đã gán ảnh thành công cho ${assignments.length} vật phẩm.`);

        } catch (error) {
            console.error("Lỗi khi AI gán ảnh hàng loạt:", error);
            alert(`Đã xảy ra lỗi: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
            setSelectedItemIds(new Set());
        }
    };

    const tabs = [ { id: 'vatPham', name: 'Vật phẩm' }, { id: 'trangBi', name: 'Trang bị' }, { id: 'phapBao', name: 'Pháp bảo'}, { id: 'congPhap', name: 'Công pháp' }, { id: 'hieuUng', name: 'Hiệu ứng' }, { id: 'trangThai', name: 'Trạng thái' }];
    
    useEffect(() => {
        setSelectedItemIds(new Set());
    }, [activeTab]);

    const hieuUngOptions = [
      { value: 'Tất cả', label: 'Tất cả' },
      { value: 'consumable', label: 'Tiêu hao' },
      { value: 'equipment', label: 'Trang bị' },
      { value: 'treasure', label: 'Pháp bảo' },
      { value: 'technique', label: 'Công pháp' },
    ];
    
    const trangThaiOptions = [
      { value: 'Tất cả', label: 'Tất cả' },
      { value: 'buff', label: 'Buff (Có lợi)' },
      { value: 'debuff', label: 'Debuff (Bất lợi)' },
      { value: 'neutral', label: 'Trung lập' },
    ];

    return (
        <div className="relative flex flex-col h-full">
            {isLoading && (
                <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center">
                    <Icons.SparklesIcon className="w-16 h-16 text-yellow-300 animate-pulse" />
                    <p className="text-xl font-semibold mt-4">{loadingMessage}</p>
                </div>
            )}
            {modalState && <ElementModal modalState={modalState} onClose={() => setModalState(null)} onSave={handleSaveItem} />}
            {effectStatusModalState && <EffectStatusModal modalState={effectStatusModalState} onClose={() => setEffectStatusModalState(null)} onSave={handleSaveEffectStatus} />}
             <ImageAssignmentModal
                isOpen={assignmentModalState.isOpen}
                onClose={() => setAssignmentModalState({ isOpen: false, item: null, itemType: null })}
                item={assignmentModalState.item}
                onAssign={handleAssignImage}
            />
             <div className="flex-shrink-0 flex border-b-2 border-slate-700/50 overflow-x-auto styled-scrollbar">
                {tabs.map(tab => (
                     <button key={tab.id} onClick={() => setActiveTab(tab.id as ThienThuTab)} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                        {tab.name}
                    </button>
                ))}
            </div>
            <div className="flex-1 flex flex-col p-4 overflow-y-auto styled-scrollbar">
                {activeTab === 'vatPham' && (
                     <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                             <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                             <select value={vatPhamFilter} onChange={e => setVatPhamFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                {['Tất cả', 'Đan dược', 'Thảo dược', 'Vật liệu', 'Khoáng thạch', 'Khác'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                             <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                <option value="Tất cả">Ngũ Hành: Tất cả</option>
                                {Object.entries(NGU_HANH_DISPLAY).map(([key, val]) => <option key={key} value={val.name}>{val.icon} {val.name}</option>)}
                            </select>
                        </div>
                        <DefinitionList items={filteredVatPham} onEdit={(item) => setModalState({ type: 'item', data: item })} onDelete={(id) => setVatPham(p => p.filter((i:any) => i.id !== id))} onAdd={() => setModalState({ type: 'item', data: null })} onSort={handleItemSort} sortConfig={{direction: itemSortOrder}} onSave={handleSave} onLoad={handleLoad} selectedItemIds={selectedItemIds} onBulkAssign={handleBulkAssignImages} onBulkDelete={handleBulkDelete} onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))} isLoading={isLoading} renderItem={(item: InitialItem) => <EditableThienThuElement item={item} typeLabel={item.consumableType || item.itemType} onEdit={() => setModalState({ type: 'item', data: item })} onDelete={() => setVatPham(p => p.filter((i:any) => i.id !== item.id))} isSelected={selectedItemIds.has(item.id)} onToggleSelect={toggleItemSelection} onOpenImageModal={() => setAssignmentModalState({ isOpen: true, item: item, itemType: 'vatPham' })} onUnassignImage={() => handleUnassignImage(setVatPham, item.id)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{renderAttributes(item.attributes)}</EditableThienThuElement>} />
                    </div>
                )}
                {activeTab === 'trangBi' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                             <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                             <select value={trangBiFilter} onChange={e => setTrangBiFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                {['Tất cả', 'Vũ khí', 'Áo choàng', 'Giáp', 'Mũ', 'Găng tay', 'Giày', 'Phụ kiện', 'Trang sức'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                             <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                <option value="Tất cả">Ngũ Hành: Tất cả</option>
                                {Object.entries(NGU_HANH_DISPLAY).map(([key, val]) => <option key={key} value={val.name}>{val.icon} {val.name}</option>)}
                            </select>
                        </div>
                        <DefinitionList items={filteredTrangBi} onEdit={(item) => setModalState({ type: 'trangBi', data: item })} onDelete={(id) => setTrangBi(p => p.filter((i:any) => i.id !== id))} onAdd={() => setModalState({ type: 'trangBi', data: null })} onSort={handleItemSort} sortConfig={{direction: itemSortOrder}} onSave={handleSave} onLoad={handleLoad} selectedItemIds={selectedItemIds} onBulkAssign={handleBulkAssignImages} onBulkDelete={handleBulkDelete} onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))} isLoading={isLoading} renderItem={(item: InitialItem) => <EditableThienThuElement item={item} typeLabel={item.equipmentType || item.itemType} onEdit={() => setModalState({ type: 'trangBi', data: item })} onDelete={() => setTrangBi(p => p.filter((i:any) => i.id !== item.id))} isSelected={selectedItemIds.has(item.id)} onToggleSelect={toggleItemSelection} onOpenImageModal={() => setAssignmentModalState({ isOpen: true, item: item, itemType: 'trangBi' })} onUnassignImage={() => handleUnassignImage(setTrangBi, item.id)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{renderAttributes(item.attributes)}</EditableThienThuElement>} />
                    </div>
                )}
                {activeTab === 'phapBao' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                             <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                             <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                <option value="Tất cả">Ngũ Hành: Tất cả</option>
                                {Object.entries(NGU_HANH_DISPLAY).map(([key, val]) => <option key={key} value={val.name}>{val.icon} {val.name}</option>)}
                            </select>
                        </div>
                        <DefinitionList items={filteredPhapBao} onEdit={(item) => setModalState({ type: 'phapBao', data: item })} onDelete={(id) => setPhapBao(p => p.filter((i:any) => i.id !== id))} onAdd={() => setModalState({ type: 'phapBao', data: null })} onSort={handleItemSort} sortConfig={{direction: itemSortOrder}} onSave={handleSave} onLoad={handleLoad} selectedItemIds={selectedItemIds} onBulkAssign={handleBulkAssignImages} onBulkDelete={handleBulkDelete} onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))} isLoading={isLoading} renderItem={(item: InitialItem) => <EditableThienThuElement item={item} typeLabel={item.equipmentType || item.itemType} onEdit={() => setModalState({ type: 'phapBao', data: item })} onDelete={() => setPhapBao(p => p.filter((i:any) => i.id !== item.id))} isSelected={selectedItemIds.has(item.id)} onToggleSelect={toggleItemSelection} onOpenImageModal={() => setAssignmentModalState({ isOpen: true, item: item, itemType: 'phapBao' })} onUnassignImage={() => handleUnassignImage(setPhapBao, item.id)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{renderAttributes(item.attributes)}</EditableThienThuElement>} />
                    </div>
                )}
                {activeTab === 'congPhap' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                             <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                             <select value={congPhapFilter} onChange={e => setCongPhapFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                {['Tất cả', 'Chiến đấu', 'Phòng thủ', 'Tu luyện', 'Tâm pháp', 'Thân pháp'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                             <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                <option value="Tất cả">Ngũ Hành: Tất cả</option>
                                {Object.entries(NGU_HANH_DISPLAY).map(([key, val]) => <option key={key} value={val.name}>{val.icon} {val.name}</option>)}
                            </select>
                        </div>
                        <DefinitionList items={filteredCongPhap} onEdit={(item) => setModalState({ type: 'congPhap', data: item })} onDelete={(id) => setCongPhap(p => p.filter((i:any) => i.id !== id))} onAdd={() => setModalState({ type: 'congPhap', data: null })} onSort={handleItemSort} sortConfig={{direction: itemSortOrder}} onSave={handleSave} onLoad={handleLoad} selectedItemIds={selectedItemIds} onBulkAssign={handleBulkAssignImages} onBulkDelete={handleBulkDelete} onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))} isLoading={isLoading} renderItem={(item: InitialCongPhap) => <EditableThienThuElement item={item} typeLabel={item.techniqueType} onEdit={() => setModalState({ type: 'congPhap', data: item })} onDelete={() => setCongPhap(p => p.filter((i:any) => i.id !== item.id))} isSelected={selectedItemIds.has(item.id)} onToggleSelect={toggleItemSelection} onOpenImageModal={() => setAssignmentModalState({ isOpen: true, item: item, itemType: 'congPhap' })} onUnassignImage={() => handleUnassignImage(setCongPhap, item.id)}><p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>{renderAttributes(item.attributes)}</EditableThienThuElement>} />
                    </div>
                )}
                 {activeTab === 'hieuUng' && 
                    <div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                            <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                             <select value={hieuUngFilter} onChange={e => setHieuUngFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                {hieuUngOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <DefinitionList
                            items={filteredHieuUng}
                            onAdd={() => setEffectStatusModalState({ type: 'hieuUng', data: null })}
                            onEdit={(item) => setEffectStatusModalState({ type: 'hieuUng', data: item })}
                            onDelete={(id) => setHieuUng(p => p.filter((i:any) => i.id !== id))}
                            onSort={handleItemSort}
                            sortConfig={{ direction: itemSortOrder }}
                            hasImageAssignment={false}
                            selectedItemIds={selectedItemIds}
                            onBulkDelete={handleBulkDelete}
                            onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))}
                            renderItem={(item: ItemEffectDefinition) => (
                                <details className="bg-slate-800/50 rounded-md border border-slate-700/50 overflow-hidden">
                                    <summary className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-700/30">
                                         <div className="flex-grow flex items-center gap-3">
                                            <input type="checkbox" checked={selectedItemIds.has(item.id)} onChange={() => toggleItemSelection(item.id)} onClick={e => e.stopPropagation()} className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500 flex-shrink-0"/>
                                            <span className={`font-semibold ${getRankColor(item.rank)}`}>{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); setEffectStatusModalState({ type: 'hieuUng', data: item }); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={(e) => { e.stopPropagation(); setHieuUng(p => p.filter((i:any) => i.id !== item.id)); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </summary>
                                    <div className="p-3 border-t border-slate-700/50 bg-slate-900/30 text-xs space-y-2">
                                        <p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>
                                    </div>
                                </details>
                            )}
                        />
                    </div>
                 }
                 {activeTab === 'trangThai' && 
                    <div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                            <input type="text" placeholder="Tìm kiếm theo tên..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
                            <select value={trangThaiFilter} onChange={e => setTrangThaiFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
                                {trangThaiOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <DefinitionList
                            items={filteredTrangThai}
                            hasImageAssignment={false}
                            onAdd={() => setEffectStatusModalState({ type: 'trangThai', data: null })}
                            onEdit={(item) => setEffectStatusModalState({ type: 'trangThai', data: item })}
                            onDelete={(id) => setTrangThai(p => p.filter((i:any) => i.id !== id))}
                            selectedItemIds={selectedItemIds}
                            onBulkDelete={handleBulkDelete}
                            onSelectAll={(allIds) => setSelectedItemIds(ids => ids.size === allIds.length ? new Set() : new Set(allIds))}
                            onSort={handleTrangThaiSort}
                            sortConfig={{ direction: trangThaiSortOrder }}
                            sortLabel="Tên"
                            renderItem={(item: StatusEffect) => (
                                <details className="bg-slate-800/50 rounded-md border border-slate-700/50 overflow-hidden">
                                    <summary className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-700/30">
                                         <div className="flex-grow flex items-center gap-3">
                                            <input type="checkbox" checked={selectedItemIds.has(item.id)} onChange={() => toggleItemSelection(item.id)} onClick={e => e.stopPropagation()} className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-500 flex-shrink-0"/>
                                            <span className={`font-semibold ${getStatusTypeColor(item.type)}`}>{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); setEffectStatusModalState({ type: 'trangThai', data: item }); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={(e) => { e.stopPropagation(); setTrangThai(p => p.filter((i:any) => i.id !== item.id)); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </summary>
                                    <div className="p-3 border-t border-slate-700/50 bg-slate-900/30 text-xs space-y-2">
                                        <p><strong className="text-slate-400">Mô tả:</strong> {item.description}</p>
                                    </div>
                                </details>
                            )}
                        />
                    </div>
                 }
            </div>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json,application/json" className="hidden" />
        </div>
    );
};
