

import React, { useState, useRef } from 'react';
import type { GameState, Recipe, Item, PlayerAttributes, ItemEffectDefinition } from '../../types';
import { PLAYER_ATTRIBUTE_NAMES } from '../../constants';
import * as Icons from '../Icons';
import { SmartTooltip } from '../SmartTooltip';
import { ALL_ITEM_EFFECT_DEFINITIONS } from '../../data/effects';
import { ImageAssignmentModal } from './ImageAssignmentModal';

// FIX: Exported EffectLabel to resolve an import error in ThienThuPanelContent.tsx.
export const EffectLabel: React.FC<{ effectId: string }> = ({ effectId }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const labelRef = useRef<HTMLDivElement>(null);
    const effect = ALL_ITEM_EFFECT_DEFINITIONS[effectId as keyof typeof ALL_ITEM_EFFECT_DEFINITIONS];

    if (!effect) {
        return <span className="text-xs italic text-red-400">Lỗi hiệu ứng</span>;
    }

    const colorClass = getRankColor(effect.rank).replace('text', 'bg').replace('-400', '-700/80 border border') + '-500';

    return (
        <>
            <div
                ref={labelRef}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(p => !p)}
                className={`inline-flex items-center px-2 py-1 rounded-md cursor-pointer transition-transform hover:scale-105 ${colorClass} text-white`}
            >
                <span className="text-xs font-semibold whitespace-nowrap">{effect.name}</span>
            </div>
            <SmartTooltip 
                target={labelRef.current} 
                show={showTooltip}
                className="w-64 p-3 text-left text-sm bg-slate-900 border border-yellow-500/50 rounded-lg shadow-xl z-50"
            >
                <p className="font-bold text-yellow-300">{effect.name}</p>
                <p className="text-xs text-slate-300 mt-1">{effect.description}</p>
            </SmartTooltip>
        </>
    );
};

export const getRankColor = (rank?: number) => {
    switch (rank) {
        case 1: return 'text-slate-300'; // Phàm Phẩm
        case 2: return 'text-green-400'; // Hạ Phẩm
        case 3: return 'text-blue-400';  // Trung Phẩm
        case 4: return 'text-purple-400';// Thượng Phẩm
        case 5: return 'text-orange-400';// Cực Phẩm
        case 6: return 'text-red-500';   // Chí Tôn
        default: return 'text-white';
    }
};

export const getImageUrl = (imageId: string | undefined) => {
    if (!imageId) return null;
    if (imageId.startsWith('http')) return imageId;
    return imageId.startsWith('/') ? imageId : `/${imageId}`;
};

export const InventoryPanel: React.FC<{
    gameState: GameState;
    inventoryCounts: Record<string, number>;
    groupedConsumableItems: { item: Item; quantity: number; }[];
    equipmentItems: Item[];
    techniqueItems: Item[];
    handleEquipItem: (item: Item) => void;
    handleCraftItem: (recipe: Recipe) => void;
    handleUseItem: (item: Item, quantity: number) => void;
    handlePlayerAction: (action: string) => void;
    handleItemImageChange: (itemId: string, imageId: string) => void;
}> = (props) => {
    const { gameState, inventoryCounts, groupedConsumableItems, equipmentItems, techniqueItems, handleEquipItem, handleCraftItem, handleUseItem, handlePlayerAction, handleItemImageChange } = props;
    const [activeInventoryTab, setActiveInventoryTab] = useState('vatPham');
    const [itemToUse, setItemToUse] = useState<{ item: Item; maxQuantity: number } | null>(null);
    const [useQuantity, setUseQuantity] = useState(1);
    const [assignmentModalState, setAssignmentModalState] = useState<{isOpen: boolean, item: Item | null}>({isOpen: false, item: null});

    const handleUseClick = (item: Item, quantity: number) => {
        if (quantity > 1) {
            setItemToUse({ item, maxQuantity: quantity });
            setUseQuantity(1);
        } else {
            handleUseItem(item, 1);
        }
    };

    const handleConfirmUse = () => {
        if (!itemToUse || useQuantity <= 0) return;
        handleUseItem(itemToUse.item, useQuantity);
        setItemToUse(null);
    };

    const renderItem = (item: Item, quantity: number | null, isEquipped: boolean, onAction: () => void, actionLabel: string) => (
        <details key={item.id} className={`p-3 bg-slate-800/50 rounded-md border ${isEquipped ? 'border-yellow-400' : 'border-slate-700'}`}>
            <summary className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 cursor-pointer">
                <div className="flex items-center gap-3 flex-grow">
                    <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden relative group">
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
                         <button
                            onClick={(e) => { e.stopPropagation(); setAssignmentModalState({isOpen: true, item: item}); }}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Đổi hình ảnh"
                         >
                            <Icons.PencilIcon className="w-6 h-6 text-white"/>
                        </button>
                    </div>
                    <div className="flex-grow">
                        <strong className={getRankColor(item.rank)}>{item.name}</strong>
                        {quantity && <span className="text-yellow-300 font-semibold ml-2">x{quantity}</span>}
                        <span className="text-xs text-gray-400 ml-2">({item.category})</span>
                        <p className="italic text-slate-400 text-xs mt-1">{item.description}</p>
                    </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onAction(); }} disabled={gameState.isLoading} className={`w-full sm:w-auto mt-2 sm:mt-0 text-xs px-3 py-2 rounded-md ${isEquipped ? 'bg-yellow-800/70 hover:bg-yellow-700' : 'bg-green-600/50 hover:bg-green-600/80'} disabled:bg-slate-600 disabled:cursor-not-allowed flex-shrink-0 transition-colors`}>
                    {actionLabel}
                </button>
            </summary>
            <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-2">
                 {item.attributes && Object.keys(item.attributes).length > 0 && (
                    <div>
                        <strong className="text-slate-400 text-xs">Thuộc tính:</strong>
                        <ul className="list-disc list-inside pl-2 text-xs">
                            {Object.entries(item.attributes).map(([key, value]) => (
                                <li key={key}>{PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: <span className="text-green-300">+{value as number}</span></li>
                            ))}
                        </ul>
                    </div>
                )}
                 {item.effectIds && item.effectIds.length > 0 && (
                    <div>
                        <strong className="text-slate-400 text-xs">Hiệu ứng:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {item.effectIds.map(id => <EffectLabel key={id} effectId={id} />)}
                        </div>
                    </div>
                )}
            </div>
        </details>
    );

    return (
        <div className="flex-grow flex flex-col styled-scrollbar overflow-y-auto min-h-0 relative">
            <ImageAssignmentModal
                isOpen={assignmentModalState.isOpen}
                onClose={() => setAssignmentModalState({isOpen: false, item: null})}
                item={assignmentModalState.item}
                onAssign={(imageId) => {
                    if (assignmentModalState.item) {
                        handleItemImageChange(assignmentModalState.item.id, imageId);
                    }
                    setAssignmentModalState({isOpen: false, item: null});
                }}
            />
            {itemToUse && (
                <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center" onClick={() => setItemToUse(null)}>
                    <div className="bg-slate-800 p-4 rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
                        <h4 className="font-bold">Dùng {itemToUse.item.name}</h4>
                        <p className="text-xs text-slate-400">Chọn số lượng (tối đa {itemToUse.maxQuantity})</p>
                        <input
                            type="number"
                            value={useQuantity}
                            onChange={e => setUseQuantity(Math.max(1, Math.min(itemToUse.maxQuantity, parseInt(e.target.value) || 1)))}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 my-2 text-white"
                        />
                        <button onClick={handleConfirmUse} className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold p-2 rounded">Xác nhận</button>
                    </div>
                </div>
            )}
            <div className="flex-shrink-0 flex border-b border-slate-700">
                <button onClick={() => setActiveInventoryTab('vatPham')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeInventoryTab === 'vatPham' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Vật phẩm</button>
                <button onClick={() => setActiveInventoryTab('trangBi')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeInventoryTab === 'trangBi' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Trang bị</button>
                <button onClick={() => setActiveInventoryTab('congPhap')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeInventoryTab === 'congPhap' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Công pháp</button>
                <button onClick={() => setActiveInventoryTab('luyenChe')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeInventoryTab === 'luyenChe' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Luyện Chế</button>
            </div>
            <div className="p-4 space-y-2 text-sm">
                {activeInventoryTab === 'vatPham' && groupedConsumableItems.map(({ item, quantity }) => renderItem(item, quantity, false, () => handleUseClick(item, quantity), 'Dùng'))}
                {activeInventoryTab === 'trangBi' && equipmentItems.map(item => renderItem(item, null, gameState.player.equippedTreasureId === item.id, () => handleEquipItem(item), gameState.player.equippedTreasureId === item.id ? "Gỡ Bỏ" : "Trang Bị"))}
                {activeInventoryTab === 'congPhap' && techniqueItems.map(item => renderItem(item, null, gameState.player.equippedTechniqueId === item.id, () => handleEquipItem(item), gameState.player.equippedTechniqueId === item.id ? "Gỡ Bỏ" : "Trang Bị"))}
                {activeInventoryTab === 'luyenChe' && (
                    <div>
                        <button onClick={() => handlePlayerAction('Tìm công thức luyện chế mới')} disabled={gameState.isLoading} className="w-full text-center text-sm mb-4 p-2 bg-blue-800/70 hover:bg-blue-700 rounded-lg transition-colors">Nghiên cứu công thức mới</button>
                        {gameState.recipes.map(recipe => {
                            const canCraft = recipe.required.every(req => (inventoryCounts[req.name] || 0) >= req.quantity);
                            return (
                                <div key={recipe.id} className="p-3 bg-slate-800/50 rounded-md border border-slate-700 mb-2">
                                    <strong className="text-white">{recipe.name}</strong>
                                    <p className="italic text-slate-400 text-xs mt-1">{recipe.description}</p>
                                    <div className="text-xs mt-2">
                                        {recipe.required.map(req => (
                                            <p key={req.itemId} className={(inventoryCounts[req.name] || 0) >= req.quantity ? 'text-green-400' : 'text-red-400'}>
                                                - {req.name}: {(inventoryCounts[req.name] || 0)} / {req.quantity}
                                            </p>
                                        ))}
                                    </div>
                                    <button onClick={() => handleCraftItem(recipe)} disabled={!canCraft || gameState.isLoading} className="text-xs w-full mt-2 px-3 py-2 rounded-md bg-green-600/50 hover:bg-green-600/80 disabled:bg-slate-600 disabled:cursor-not-allowed">
                                        Luyện chế {recipe.result.name}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};