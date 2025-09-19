import React, { useState, useMemo } from 'react';
import type { InitialItem, InitialCongPhap, EquipmentType } from '../../../../types';
import * as Icons from '../../../Icons';
import { getRankColor, getImageUrl } from '../ElementHelpers';

export const ThienThuSelectorModal = ({ type, onClose, onSelect, customThienThu }: { 
    type: string, 
    onClose: () => void, 
    onSelect: (item: InitialItem | InitialCongPhap) => void,
    customThienThu: {
        vatPhamTieuHao: InitialItem[];
        trangBi: InitialItem[];
        phapBao: InitialItem[];
        congPhap: InitialCongPhap[];
    }
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [vatPhamFilter, setVatPhamFilter] = useState('Tất cả');
    const [nguHanhFilter, setNguHanhFilter] = useState('Tất cả');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | 'none' }>({ key: 'rank', direction: 'none' });

    const handleSort = () => {
        setSortConfig(current => {
            if (current.direction === 'none') return { ...current, direction: 'asc' };
            if (current.direction === 'asc') return { ...current, direction: 'desc' };
            return { ...current, direction: 'none' };
        });
    };
    const sortIcon = sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '↕';

    const sourceList = useMemo(() => {
        switch(type) {
            case 'item':
                return customThienThu.vatPhamTieuHao;
            case 'trangBi':
                return customThienThu.trangBi;
            case 'phapBao':
                return customThienThu.phapBao;
            case 'congPhap':
                return customThienThu.congPhap;
            default:
                return [];
        }
    }, [type, customThienThu]);

    const filteredAndSortedItems = useMemo(() => {
        let items = sourceList.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (vatPhamFilter !== 'Tất cả') {
            switch(type) {
                case 'item':
                    items = items.filter(i => 'consumableType' in i && (i as InitialItem).consumableType === vatPhamFilter);
                    break;
                case 'trangBi':
                    items = items.filter(i => 'equipmentType' in i && (i as InitialItem).equipmentType === vatPhamFilter);
                    break;
                case 'phapBao':
                    // Pháp bảo uses itemType for filtering
                    items = items.filter(i => 'itemType' in i && (i as InitialItem).itemType === 'Pháp bảo');
                    break;
            }
        }
        
        if (nguHanhFilter !== 'Tất cả') {
            items = items.filter(i => 'nguHanhAttribute' in i && i.nguHanhAttribute === nguHanhFilter.toLowerCase());
        }

        items.sort((a, b) => {
            const isLockedA = (a.rank || 0) >= 3;
            const isLockedB = (b.rank || 0) >= 3;

            if (isLockedA && !isLockedB) return 1; // Locked items go to the bottom
            if (!isLockedA && isLockedB) return -1; // Unlocked items go to the top

            if (sortConfig.direction !== 'none') {
                const rankA = a.rank || 0;
                const rankB = b.rank || 0;
                if (rankA < rankB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (rankA > rankB) return sortConfig.direction === 'asc' ? 1 : -1;
            }

            return 0;
        });

        return items;
    }, [searchTerm, sourceList, vatPhamFilter, nguHanhFilter, sortConfig, type]);

    const vatPhamFilterOptions = useMemo(() => {
        const vatPhamSubtypes = ['Đan dược', 'Vật liệu', 'Khoáng thạch', 'Thảo dược', 'Khác'];
        const equipmentSubtypes: EquipmentType[] = ['Vũ khí', 'Áo choàng', 'Giáp', 'Mũ', 'Găng tay', 'Giày', 'Phụ kiện', 'Trang sức'];
        switch (type) {
            case 'item':
                return ['Tất cả', ...vatPhamSubtypes];
            case 'trangBi':
                return ['Tất cả', ...equipmentSubtypes];
            case 'phapBao':
                return ['Tất cả', 'Pháp bảo'];
            default:
                return [];
        }
    }, [type]);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800/95 backdrop-blur-sm border border-yellow-500 rounded-lg p-6 shadow-xl w-full max-w-4xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-yellow-300 mb-4 flex-shrink-0">Thêm từ Thiên Thư</h2>
                <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:col-span-2 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                    />
                    {type !== 'congPhap' && (
                        <div>
                            <select value={vatPhamFilter} onChange={e => setVatPhamFilter(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                                {vatPhamFilterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    )}
                     <div>
                        <select value={nguHanhFilter} onChange={e => setNguHanhFilter(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                            <option>Tất cả</option>
                            <option>Kim</option>
                            <option>Mộc</option>
                            <option>Thủy</option>
                            <option>Hỏa</option>
                            <option>Thổ</option>
                        </select>
                    </div>
                     <button onClick={handleSort} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white hover:bg-slate-600">
                        Sắp xếp Phẩm chất {sortIcon}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto styled-scrollbar space-y-2 pr-2">
                    {filteredAndSortedItems.map(item => (
                         <div 
                            key={item.id} 
                            className={`p-2 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center justify-between transition-opacity hover:bg-slate-800/50`}
                        >
                            <div className="flex items-center gap-3 flex-grow">
                                <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden">
                                    {(() => {
                                        const imageUrl = getImageUrl(item.imageId);
                                        return imageUrl ? (
                                            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                <Icons.QuestionMarkCircleIcon className="w-8 h-8"/>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="flex-grow">
                                    <p className={`font-semibold ${getRankColor(item.rank)}`}>{item.name}</p>
                                    <p className="text-xs text-slate-400 italic mt-1">{item.description}</p>
                                </div>
                            </div>
                            <button onClick={() => onSelect(item)} className="p-2 text-green-400 hover:bg-slate-700 rounded-full flex-shrink-0">
                                <Icons.PlusCircleIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex-shrink-0">
                    <button type="button" onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded transition-colors">Đóng</button>
                </div>
            </div>
        </div>
    );
};
