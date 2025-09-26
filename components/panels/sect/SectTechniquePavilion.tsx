import React from 'react';
import type { SectRankPermission } from '../../../types';
import * as Icons from '../../Icons';

interface SectTechniquePavilionProps {
    playerPermissions: Set<SectRankPermission>;
}

export const SectTechniquePavilion: React.FC<SectTechniquePavilionProps> = ({ playerPermissions }) => {

    const canAccessBasic = playerPermissions.has('access_basic_techniques');
    const canAccessAdvanced = playerPermissions.has('access_advanced_techniques');
    const canAccessCore = playerPermissions.has('access_core_techniques');

    // This is placeholder data. In a real implementation, this would come from gameState.
    const techniques = [
        { name: 'Dẫn Mộc Quyết', level: 'Cơ bản', cost: 50, requiredRank: 'Đệ tử Ngoại môn', permission: 'access_basic_techniques' },
        { name: 'Mộc Giáp Thuật', level: 'Cơ bản', cost: 100, requiredRank: 'Đệ tử Ngoại môn', permission: 'access_basic_techniques' },
        { name: 'Vạn Cổ Trường Thanh Quyết', level: 'Nâng cao', cost: 1000, requiredRank: 'Đệ tử Nội môn', permission: 'access_advanced_techniques' },
        { name: 'Thế Giới Thụ Thần Thông', level: 'Chân truyền', cost: 5000, requiredRank: 'Trưởng lão', permission: 'access_core_techniques' },
    ];
    
    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-base font-bold text-yellow-300 mb-2">Tàng Kinh Các</h3>
            <p className="text-xs text-slate-400 mb-4">
                Nơi lưu giữ công pháp và thần thông của môn phái. Dùng điểm cống hiến để đổi lấy những bí tịch này. Chức vụ càng cao, càng có thể tiếp xúc với những công pháp cao thâm hơn.
            </p>
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-4 space-y-3">
                {techniques.map(tech => {
                    const hasPermission = playerPermissions.has(tech.permission as SectRankPermission);
                    return (
                        <div key={tech.name} className={`p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${!hasPermission ? 'opacity-50' : ''}`}>
                            <div className="flex-grow">
                                <p className="font-semibold text-cyan-300">{tech.name} <span className="text-xs text-yellow-300">({tech.level})</span></p>
                                <p className="text-xs text-slate-400 italic mt-1">Cần {tech.cost} cống hiến | Yêu cầu chức vụ: {tech.requiredRank}</p>
                            </div>
                             <button 
                                disabled={!hasPermission}
                                className="w-full sm:w-auto text-xs px-3 py-1 bg-green-600/50 hover:bg-green-600/80 rounded disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                                {hasPermission ? 'Học' : <Icons.LockClosedIcon className="w-3 h-3"/>}
                                {hasPermission ? '' : 'Không đủ quyền hạn'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
