import React from 'react';
import type { GameState, Item } from '../../../types';
import * as Icons from '../../Icons';
import { getImageUrl } from '../InventoryPanel';

interface SectContributionHallProps {
    gameState: GameState;
    handlePlayerAction: (action: string, type: 'suggestion' | 'input') => void;
    isLoading: boolean;
}

export const SectContributionHall: React.FC<SectContributionHallProps> = ({ gameState, handlePlayerAction, isLoading }) => {
    const { inventory } = gameState;

    const donatableItems = inventory.filter(item => 
        item.category !== 'Nhiệm vụ' && 
        item.id !== gameState.player.equippedTechniqueId &&
        item.id !== gameState.player.equippedTreasureId
    );

    const handleDonate = (item: Item) => {
        const confirmation = window.confirm(`Bạn có chắc muốn quyên góp ${item.name} cho môn phái?`);
        if (confirmation) {
            handlePlayerAction(`Quyên góp ${item.name}`, 'suggestion');
        }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-base font-bold text-yellow-300 mb-2">Cống Hiến Đường</h3>
            <p className="text-xs text-slate-400 mb-4">
                Quyên góp vật phẩm không cần thiết để nhận điểm cống hiến. Điểm cống hiến có thể dùng để đổi lấy công pháp, pháp bảo, hoặc thăng tiến chức vụ trong môn phái.
            </p>
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-4 space-y-2">
                {donatableItems.length > 0 ? donatableItems.map(item => (
                    <div key={item.id} className="p-2 bg-slate-900/50 rounded-md border border-slate-700 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-grow min-w-0">
                            <div className="w-10 h-10 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden">
                                {item.imageId && <img src={getImageUrl(item.imageId)} alt={item.name} className="w-full h-full object-cover" />}
                            </div>
                            <div className="truncate">
                                <p className="font-semibold truncate">{item.name}</p>
                                <p className="text-xs text-slate-400 truncate">{item.category}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDonate(item)}
                            disabled={isLoading}
                            className="flex-shrink-0 text-xs px-3 py-1 bg-green-600/50 hover:bg-green-600/80 rounded disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            Quyên góp
                        </button>
                    </div>
                )) : (
                    <p className="text-center text-slate-400 italic">Túi đồ của đạo hữu trống không.</p>
                )}
            </div>
        </div>
    );
};
