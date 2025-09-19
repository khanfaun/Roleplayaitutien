
import React, { useState, useMemo } from 'react';
import type { Player, GameState } from '../../types';
import { ShieldCheckIcon } from '../Icons';
import Panel from '../Panel';
import { getSectDisplayName } from '../setup/elements/shared';

export const SectPanelContent: React.FC<{
    gameState: GameState;
    isLoading: boolean;
    handleLeaveSect: () => void;
    handlePlayerAction: (action: string) => void;
}> = ({ gameState, isLoading, handleLeaveSect, handlePlayerAction }) => {
    const { player, worldData, discoveredEntityIds } = gameState;
    const { initialSects } = worldData;

    const [activeSectTab, setActiveSectTab] = useState(player.sect ? 'quanLy' : 'danhSach');
    const [activeSectManagementTab, setActiveSectManagementTab] = useState('chinhDien');
    const currentSectDetails = player.sect ? initialSects.find(s => s.name === player.sect) : null;
    
    React.useEffect(() => {
        if (!player.sect) {
            setActiveSectTab('danhSach');
        }
    }, [player.sect]);
    
    const visibleSects = useMemo(() => {
        const visibleIds = new Set(discoveredEntityIds.sects);
        if (player.sect) {
            const currentSectDetails = initialSects.find(s => s.name === player.sect);
            if (currentSectDetails) {
                visibleIds.add(currentSectDetails.id);
            }
        }
        return initialSects.filter(sect => visibleIds.has(sect.id));
    }, [initialSects, discoveredEntityIds.sects, player.sect]);

    const renderSectList = () => (
        <div className="p-4 space-y-4 text-sm">
            <p className="text-center font-semibold">{player.sect ? `Đạo hữu là thành viên của ${getSectDisplayName(currentSectDetails!, initialSects)}.` : 'Đạo hữu hiện là Tán tu, tự do tự tại.'}</p>
            <p className="text-center text-xs text-slate-400">Gia nhập môn phái sẽ mở ra nhiều cơ duyên mới. Hãy tìm kiếm kỳ ngộ trong lúc du ngoạn giang hồ.</p>
            <div className="pt-2 border-t border-slate-700 space-y-3">
                <h4 className="font-bold text-yellow-300">Các thế lực lớn đã biết:</h4>
                {visibleSects.length > 0 ? visibleSects.map(sect => (
                    <div key={sect.id} className="p-2 bg-slate-800/30 rounded-md">
                        <p><strong>{getSectDisplayName(sect, initialSects)}</strong> <span className={`text-xs ${sect.alignment === 'Chính Đạo' ? 'text-green-400' : sect.alignment === 'Ma Đạo' ? 'text-red-400' : 'text-gray-400'}`}>({sect.alignment})</span></p>
                        <p className="text-xs italic text-slate-400">{sect.description}</p>
                    </div>
                )) : <p className="text-sm text-slate-400 italic">Chưa phát hiện thế lực nào.</p>}
            </div>
        </div>
    );

    const renderSectManagement = () => {
        if (!currentSectDetails) return null;

        const managementTabs = [
            { id: 'chinhDien', name: 'Chính Điện' },
            { id: 'nhiemVu', name: 'Nhiệm Vụ' },
            { id: 'deTu', name: 'Đệ Tử (Sắp có)', disabled: true },
            { id: 'congPhap', name: 'Công Pháp (Sắp có)', disabled: true },
            { id: 'cuaHang', name: 'Cửa Hàng (Sắp có)', disabled: true },
            { id: 'suKien', name: 'Sự Kiện (Sắp có)', disabled: true },
        ];

        return (
            <div className="flex flex-col lg:flex-row h-full text-sm">
                <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-700/50 p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto styled-scrollbar">
                    {managementTabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveSectManagementTab(tab.id)} disabled={tab.disabled} className={`w-full text-left p-2 rounded text-xs font-semibold transition-colors disabled:text-slate-500 disabled:cursor-not-allowed flex-shrink-0 lg:flex-shrink ${activeSectManagementTab === tab.id ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>
                            {tab.name}
                        </button>
                    ))}
                </div>
                <div className="w-full lg:w-2/3 p-4 overflow-y-auto styled-scrollbar">
                    {activeSectManagementTab === 'chinhDien' && (
                        <div className="space-y-3">
                            <h3 className="text-base font-bold text-yellow-300">{getSectDisplayName(currentSectDetails, initialSects)}</h3>
                            <p className="text-xs italic text-slate-400">{currentSectDetails.description}</p>
                            <div>
                                <p><strong>Cống hiến:</strong> <span className="text-cyan-300">{player.sectContribution || 0}</span></p>
                                <p className="mt-1"><strong>Lợi ích:</strong></p>
                                {/* Benefits are not defined in InitialSect, this seems like a pre-existing issue. Will leave as is for now. */}
                                <ul className="list-disc list-inside text-xs">
                                    {(currentSectDetails as any).benefits?.map((b: string, i: number) => <li key={i}>{b}</li>)}
                                </ul>
                            </div>
                             <button onClick={handleLeaveSect} disabled={isLoading} className="w-full text-center text-xs mt-4 p-2 bg-red-800/70 hover:bg-red-700 rounded-lg transition-colors disabled:bg-slate-600">Rời Môn Phái</button>
                        </div>
                    )}
                    {activeSectManagementTab === 'nhiemVu' && (
                        <div className="space-y-3">
                             <h3 className="text-base font-bold text-yellow-300">Nhiệm Vụ Môn Phái</h3>
                             <p className="text-xs text-slate-400">Hoàn thành nhiệm vụ để nhận điểm cống hiến và các phần thưởng giá trị khác.</p>
                             <button onClick={() => handlePlayerAction(`Xin nhận nhiệm vụ từ ${player.sect}`)} disabled={isLoading} className="w-full text-center text-sm p-2 bg-blue-800/70 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-slate-600">Xin nhận nhiệm vụ</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-shrink-0 flex border-b-2 border-slate-700/50">
                <button onClick={() => setActiveSectTab('danhSach')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeSectTab === 'danhSach' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                    Danh sách
                </button>
                <button onClick={() => setActiveSectTab('quanLy')} disabled={!player.sect} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed ${activeSectTab === 'quanLy' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                    Quản lý
                </button>
            </div>
             <div className="flex-1 overflow-y-auto styled-scrollbar">
                {activeSectTab === 'danhSach' && renderSectList()}
                {activeSectTab === 'quanLy' && renderSectManagement()}
             </div>
        </div>
    );
};

export const SectPanel: React.FC<{
    // FIX: Changed 'player' prop to 'gameState' to align with the needs of the child component 'SectPanelContent'.
    gameState: GameState;
    isLoading: boolean;
    handleLeaveSect: () => void;
    handlePlayerAction: (action: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}> = ({ gameState, isLoading, handleLeaveSect, handlePlayerAction, isCollapsed, onToggleCollapse }) => {
    if (gameState.player.heThongStatus !== 'active') {
        return null;
    }

    if (isCollapsed) {
        return (
            <div 
                onClick={onToggleCollapse}
                className="relative flex-shrink-0 w-20 h-20 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 flex items-center justify-center cursor-pointer group hover:border-yellow-400/80 transition-all duration-300 ease-in-out"
                title="Môn Phái"
                aria-label="Mở rộng bảng Môn Phái"
            >
                <ShieldCheckIcon className="w-10 h-10 text-yellow-300 group-hover:text-yellow-100 transition-colors" />
            </div>
        );
    }

    return (
        <Panel title="Môn Phái" icon={<ShieldCheckIcon />} className="w-full md:w-[500px]" contentNoOverflow isCollapsed={isCollapsed} onToggle={onToggleCollapse}>
            <SectPanelContent 
                gameState={gameState} 
                isLoading={isLoading}
                handleLeaveSect={handleLeaveSect}
                handlePlayerAction={handlePlayerAction}
            />
        </Panel>
    );
};
