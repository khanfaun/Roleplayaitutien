import React from 'react';
import type { LinhCanQuality, NguHanhType, GameDifficulty, DestinyDefinition, InitialSect, CultivationTier } from '../../types';
import { LinhCanSelector } from './character/LinhCanSelector';
import { NguHanhSelector } from './character/NguHanhSelector';
import { DestinySelector } from './character/DestinySelector';
import { getSectDisplayName } from './elements/shared';
import { getImageUrl } from '../GamePanels';
import { PencilIcon, UserIcon } from '../Icons';


interface CharacterTabProps {
    playerName: string; setPlayerName: (value: string) => void;
    playerImageId?: string;
    onOpenImageModal: () => void;
    playerAge: number; setPlayerAge: (value: number) => void;
    playerBiography: string; setPlayerBiography: (value: string) => void;
    playerGoals: string; setPlayerGoals: (value: string) => void;
    enableHeThong: boolean; setEnableHeThong: (value: boolean) => void;
    enableAdultContent: boolean; setEnableAdultContent: (value: boolean) => void;
    linhCanQuality: LinhCanQuality; setLinhCanQuality: (value: LinhCanQuality) => void;
    nguHanh: Record<NguHanhType, number>; setNguHanh: (value: Record<NguHanhType, number>) => void;
    difficulty: GameDifficulty;
    selectedDestinyIds: string[]; setSelectedDestinyIds: (value: string[]) => void;
    destinyDefs: Record<string, DestinyDefinition>;
    initialSects: InitialSect[];
    playerSectId: string | null; setPlayerSectId: (value: string | null) => void;
    playerSectRank: string | null; setPlayerSectRank: (value: string | null) => void;
    cultivationSystem: CultivationTier[];
    startingCultivationStageId: string | null;
    setStartingCultivationStageId: (value: string | null) => void;
}

export const CharacterTab: React.FC<CharacterTabProps> = ({
    playerName, setPlayerName, playerImageId, onOpenImageModal, playerAge, setPlayerAge, playerBiography, setPlayerBiography, playerGoals, setPlayerGoals,
    enableHeThong, setEnableHeThong, enableAdultContent, setEnableAdultContent,
    linhCanQuality, setLinhCanQuality, nguHanh, setNguHanh, difficulty,
    selectedDestinyIds, setSelectedDestinyIds, destinyDefs,
    initialSects, playerSectId, setPlayerSectId, playerSectRank, setPlayerSectRank,
    cultivationSystem, startingCultivationStageId, setStartingCultivationStageId
}) => {
    const sectRanks = [
        'Lão tổ', 'Thái thượng trưởng lão', 'Tông chủ', 'Trưởng lão', 'Đường chủ', 'Hộ Pháp', 
        'Chấp sự', 'Thủ tịch đệ tử', 'Đệ tử thân truyền', 'Đệ tử nội môn', 'Đệ tử ký danh', 'Đệ tử ngoại môn'
    ];

    const handleSectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSectId = e.target.value;
        if (newSectId === 'tan_tu') {
            setPlayerSectId(null);
            setPlayerSectRank(null);
        } else {
            setPlayerSectId(newSectId);
            if (!playerSectRank) {
                setPlayerSectRank('Đệ tử ngoại môn'); // Default rank
            }
        }
    };
    
    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                {/* --- LEFT COLUMN --- */}
                <div className="space-y-4">
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <label className="block text-sm font-medium text-yellow-300 mb-1 text-center">Ảnh Đại Diện</label>
                            <div className="w-24 h-24 bg-slate-700 rounded-lg overflow-hidden relative group">
                                {playerImageId ? <img src={getImageUrl(playerImageId) || ''} alt="Player Avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full text-slate-500 p-2"/>}
                                <button type="button" onClick={onOpenImageModal} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PencilIcon className="w-8 h-8 text-white"/>
                                </button>
                            </div>
                        </div>
                        <div className="flex-grow space-y-4">
                            <div>
                                <label htmlFor="player-name" className="block text-sm font-medium text-yellow-300 mb-1">Tên Nhân Vật</label>
                                <input id="player-name" type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Ví dụ: Vương Lâm, Hàn Lập..." className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
                            </div>
                            <div>
                                <label htmlFor="player-age" className="block text-sm font-medium text-yellow-300 mb-1">Tuổi Khởi Đầu</label>
                                <input id="player-age" type="number" value={playerAge} onChange={(e) => setPlayerAge(parseInt(e.target.value, 10) || 16)} min="1" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
                            </div>
                        </div>
                    </div>
                     <LinhCanSelector value={linhCanQuality} onChange={setLinhCanQuality} />
                     <div>
                        <label htmlFor="game-difficulty" className="block text-sm font-medium text-yellow-300 mb-1">Độ Khó Game (Tự động theo Linh Căn)</label>
                        <input 
                            id="game-difficulty" 
                            type="text" 
                            value={difficulty} 
                            disabled 
                            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 font-bold cursor-not-allowed"
                        />
                    </div>
                     <div>
                        <label htmlFor="starting-cultivation-stage" className="block text-sm font-medium text-yellow-300 mb-1">Cảnh giới khởi đầu</label>
                        <select
                            id="starting-cultivation-stage"
                            value={startingCultivationStageId || ''}
                            onChange={(e) => setStartingCultivationStageId(e.target.value || null)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            disabled={cultivationSystem.length === 0}
                        >
                            <option value="">-- Mặc định (Cảnh giới đầu tiên) --</option>
                            {cultivationSystem.map(tier => (
                                <optgroup key={tier.id} label={tier.name}>
                                    {tier.realms.flatMap(majorRealm => {
                                        // Special case for Phàm Nhân or similar realms
                                        if (majorRealm.id === 'pham_nhan_realm_0' && majorRealm.minorRealms.length > 0) {
                                            return [(
                                                <option key={majorRealm.minorRealms[0].id} value={majorRealm.minorRealms[0].id}>
                                                    {majorRealm.name}
                                                </option>
                                            )];
                                        }
                                        // Normal case
                                        return majorRealm.minorRealms.filter(minor => !minor.isHidden).map(minorRealm => (
                                            <option key={minorRealm.id} value={minorRealm.id}>
                                                {majorRealm.name} {minorRealm.name}
                                            </option>
                                        ));
                                    })}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="player-sect" className="block text-sm font-medium text-yellow-300 mb-1">Môn phái</label>
                            <select id="player-sect" value={playerSectId || 'tan_tu'} onChange={handleSectChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500">
                                <option value="tan_tu">Tán tu</option>
                                {initialSects.map(sect => (
                                    <option key={sect.id} value={sect.id}>{getSectDisplayName(sect, initialSects)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="player-rank" className="block text-sm font-medium text-yellow-300 mb-1">Chức vụ</label>
                            <select id="player-rank" value={playerSectRank || ''} onChange={(e) => setPlayerSectRank(e.target.value)} disabled={!playerSectId} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:bg-slate-800/50 disabled:cursor-not-allowed">
                                 <option value="" disabled>-- Chọn --</option>
                                 {sectRanks.map(rank => (
                                    <option key={rank} value={rank}>{rank}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <NguHanhSelector value={nguHanh} onChange={setNguHanh} linhCanQuality={linhCanQuality} />
            </div>
            
            <DestinySelector selectedIds={selectedDestinyIds} onChange={setSelectedDestinyIds} destinyDefs={destinyDefs} />

            <div>
                <label htmlFor="player-bio" className="block text-sm font-medium text-yellow-300 mb-1">Tiểu sử</label>
                <textarea id="player-bio" value={playerBiography} onChange={(e) => setPlayerBiography(e.target.value)} rows={3} placeholder="Mô tả xuất thân, tính cách, và những sự kiện quan trọng đã định hình nên nhân vật của ngươi..." className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 styled-scrollbar"/>
            </div>
            <div>
                <label htmlFor="player-goals" className="block text-sm font-medium text-yellow-300 mb-1">Mục tiêu</label>
                <textarea id="player-goals" value={playerGoals} onChange={(e) => setPlayerGoals(e.target.value)} rows={2} placeholder="Mục tiêu lớn nhất của nhân vật là gì? Trường sinh? Báo thù? Hay bảo vệ người thân?..." className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 styled-scrollbar"/>
            </div>
             <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="hethong-checkbox" className="h-5 w-5 rounded border-gray-500 bg-slate-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-slate-900 cursor-pointer" checked={enableHeThong} onChange={(e) => setEnableHeThong(e.target.checked)} />
                    <label htmlFor="hethong-checkbox" className="text-sm font-medium text-yellow-300 cursor-pointer select-none">Kích hoạt Hệ Thống</label>
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="adult-checkbox" className="h-5 w-5 rounded border-gray-500 bg-slate-700 text-red-500 focus:ring-red-500 focus:ring-offset-slate-900 cursor-pointer" checked={enableAdultContent} onChange={(e) => setEnableAdultContent(e.target.checked)} />
                    <label htmlFor="adult-checkbox" className="text-sm font-medium text-red-300 cursor-pointer select-none">Kích hoạt nội dung 18+</label>
                </div>
            </div>
        </div>
    );
};