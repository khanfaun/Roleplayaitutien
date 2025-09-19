import React from 'react';
import type { GameState, DongPhuBuilding } from '../../types';

export const DongPhuPanel: React.FC<{
    dongPhu: GameState['dongPhu'];
    inventoryCounts: Record<string, number>;
    isLoading: boolean;
    handleUpgradeBuilding: (building: DongPhuBuilding) => void;
    handlePlayerAction: (action: string) => void;
}> = ({ dongPhu, inventoryCounts, isLoading, handleUpgradeBuilding, handlePlayerAction }) => {
    return (
        <div className="flex-grow p-4 space-y-4 styled-scrollbar overflow-y-auto min-h-0 text-sm">
            {dongPhu.buildings.map(b => {
                const canUpgrade = b.upgradeCost.every(cost => (inventoryCounts[cost.name] || 0) >= cost.quantity);
                const isHarvestable = b.id === 'linhDuocVien' && b.level > 0;
                return (
                    <div key={b.id} className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
                         <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                            <div className="flex-grow">
                                <p className="font-bold text-yellow-200">{b.name} <span className="text-xs text-cyan-300">(Cấp {b.level})</span></p>
                                <p className="text-xs italic text-slate-400 mt-1 mb-2">{b.description}</p>
                                {b.level > 0 && isHarvestable && 
                                    <button onClick={() => handlePlayerAction(`Thu hoạch từ ${b.name} cấp ${b.level}`)} disabled={isLoading} className="text-xs px-2 py-1 bg-green-600/50 hover:bg-green-600/80 rounded disabled:bg-slate-600 disabled:cursor-not-allowed">Thu Hoạch</button>
                                }
                            </div>
                            <div className="flex-shrink-0 w-full sm:w-auto sm:text-right">
                                 <button onClick={() => handleUpgradeBuilding(b)} disabled={!canUpgrade || isLoading} className="w-full sm:w-auto text-xs px-3 py-1 bg-green-600/50 hover:bg-green-600/80 rounded disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400">Nâng Cấp</button>
                                 <div className="text-xs mt-2 space-y-1">
                                     {b.upgradeCost.map((cost, i) => (
                                         <p key={i} className={`flex justify-between sm:justify-start sm:gap-2 ${ (inventoryCounts[cost.name] || 0) >= cost.quantity ? 'text-green-400' : 'text-red-400'}`}>
                                            <span>{cost.name}:</span>
                                            <span>{(inventoryCounts[cost.name] || 0)}/{cost.quantity}</span>
                                         </p>
                                     ))}
                                 </div>
                            </div>
                         </div>
                    </div>
                )
            })}
        </div>
    );
};
