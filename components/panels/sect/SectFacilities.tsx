import React from 'react';
import type { InitialSect, SectRankPermission } from '../../../types';
import * as Icons from '../../Icons';

interface SectFacilitiesProps {
    currentSect: InitialSect;
    playerPermissions: Set<SectRankPermission>;
    handlePlayerAction: (action: string, type: 'suggestion' | 'input') => void;
    isLoading: boolean;
}

export const SectFacilities: React.FC<SectFacilitiesProps> = ({ currentSect, playerPermissions, handlePlayerAction, isLoading }) => {

    const canUpgrade = playerPermissions.has('upgrade_facilities');

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-base font-bold text-yellow-300 mb-2">Công Trình Môn Phái</h3>
            <p className="text-xs text-slate-400 mb-4">
                Các công trình của môn phái là nền tảng cho sự phát triển. Nâng cấp chúng sẽ mở khóa thêm nhiều chức năng và lợi ích cho toàn thể đệ tử.
            </p>
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-4 space-y-3">
                {currentSect.facilities.map(facility => (
                    <div key={facility.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-grow">
                            <p className="font-semibold text-cyan-300">{facility.name} <span className="text-xs text-yellow-300">(Cấp {facility.level})</span></p>
                            <p className="text-xs text-slate-400 italic mt-1">{facility.description}</p>
                        </div>
                        {canUpgrade && (
                            <div className="flex-shrink-0 w-full sm:w-auto">
                                <button
                                    onClick={() => handlePlayerAction(`Nâng cấp ${facility.name}`, 'suggestion')}
                                    disabled={isLoading}
                                    className="w-full text-xs px-3 py-1 bg-green-600/50 hover:bg-green-600/80 rounded disabled:bg-slate-600 disabled:cursor-not-allowed"
                                >
                                    Nâng Cấp
                                </button>
                                <div className="text-xs mt-1 text-slate-400">
                                    {facility.upgradeCost.map(cost => (
                                        <p key={cost.itemId}>- {cost.itemId}: {cost.quantity}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
