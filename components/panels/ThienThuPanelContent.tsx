import React, { useState } from 'react';
import type { GameState, InitialItem, InitialCongPhap, PlayerAttributes } from '../../types';
import { PLAYER_ATTRIBUTE_NAMES } from '../../constants';
import * as Icons from '../Icons';
import { ImageAssignmentModal } from './ImageAssignmentModal';
import { getImageUrl, getRankColor, EffectLabel } from './InventoryPanel'; // Assuming shared components are exported from InventoryPanel

export const ThienThuPanelContent: React.FC<{
    thienThu: GameState['thienThu'];
    onItemImageChange: (itemType: 'vatPhamTieuHao' | 'trangBi' | 'phapBao' | 'congPhap', itemId: string, imageId: string) => void;
}> = ({ thienThu, onItemImageChange }) => {
    const [activeTab, setActiveTab] = useState('vatPhamTieuHao');
    const [assignmentModalState, setAssignmentModalState] = useState<{ isOpen: boolean; item: any | null; itemType: 'vatPhamTieuHao' | 'trangBi' | 'phapBao' | 'congPhap' | null }>({ isOpen: false, item: null, itemType: null });
    
    const handleAssignImage = (imageId: string) => {
        if (assignmentModalState.item && assignmentModalState.itemType) {
            onItemImageChange(assignmentModalState.itemType, assignmentModalState.item.id, imageId);
        }
        setAssignmentModalState({ isOpen: false, item: null, itemType: null });
    };

    const renderItemList = (items: (InitialItem | InitialCongPhap)[], itemType: 'vatPhamTieuHao' | 'trangBi' | 'phapBao' | 'congPhap') => (
        <div className="p-4 space-y-2">
            {items.map(item => (
                <details key={item.id} className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
                    <summary className="flex items-center gap-3 cursor-pointer">
                        <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden relative group">
                             <img src={getImageUrl(item.imageId)} alt={item.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                             <button onClick={(e) => { e.stopPropagation(); setAssignmentModalState({ isOpen: true, item: item, itemType: itemType }); }}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icons.PencilIcon className="w-6 h-6 text-white"/>
                            </button>
                        </div>
                        <div>
                            <strong className={getRankColor(item.rank)}>{item.name}</strong>
                            <p className="italic text-slate-400 text-xs mt-1">{item.description}</p>
                        </div>
                    </summary>
                     <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs space-y-2">
                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                             <div>
                                <strong className="text-slate-400">Thuộc tính:</strong>
                                <ul className="list-disc list-inside pl-2">
                                    {Object.entries(item.attributes).map(([key, value]) => (
                                        <li key={key}>{PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: <span className="text-green-300">+{value as number}</span></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {item.effectIds && item.effectIds.length > 0 && (
                            <div>
                                <strong className="text-slate-400">Hiệu ứng:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {item.effectIds.map(id => <EffectLabel key={id} effectId={id} />)}
                                </div>
                            </div>
                        )}
                    </div>
                </details>
            ))}
        </div>
    );

    return (
        <div className="flex-grow flex flex-col styled-scrollbar overflow-y-auto min-h-0 relative">
            <ImageAssignmentModal
                isOpen={assignmentModalState.isOpen}
                onClose={() => setAssignmentModalState({ isOpen: false, item: null, itemType: null })}
                item={assignmentModalState.item}
                onAssign={handleAssignImage}
            />
            <div className="flex-shrink-0 flex border-b border-slate-700">
                <button onClick={() => setActiveTab('vatPhamTieuHao')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeTab === 'vatPhamTieuHao' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Vật phẩm</button>
                <button onClick={() => setActiveTab('trangBi')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeTab === 'trangBi' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Trang bị</button>
                <button onClick={() => setActiveTab('phapBao')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeTab === 'phapBao' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Pháp bảo</button>
                <button onClick={() => setActiveTab('congPhap')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeTab === 'congPhap' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Công pháp</button>
            </div>
            {activeTab === 'vatPhamTieuHao' && renderItemList(thienThu.vatPhamTieuHao, 'vatPhamTieuHao')}
            {activeTab === 'trangBi' && renderItemList(thienThu.trangBi, 'trangBi')}
            {activeTab === 'phapBao' && renderItemList(thienThu.phapBao, 'phapBao')}
            {activeTab === 'congPhap' && renderItemList(thienThu.congPhap, 'congPhap')}
        </div>
    );
};