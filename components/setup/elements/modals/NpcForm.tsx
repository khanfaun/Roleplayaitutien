import React, { useState } from 'react';
import type { InitialNpc, InitialSect, CultivationTier, InitialItem, InitialCongPhap, DestinyDefinition } from '../../../../types';
import { getSectDisplayName } from '../shared';
import { LinhCanSelector } from '../../character/LinhCanSelector';
import { NguHanhSelector } from '../../character/NguHanhSelector';
import { DestinySelector } from '../../character/DestinySelector';
import * as Icons from '../../../Icons';
import { EMPTY_NGU_HANH } from '../../../../data/scenarios/helpers';

interface NpcFormProps {
    formData: InitialNpc;
    handleChange: (field: string, value: any) => void;
    allSects: InitialSect[];
    cultivationSystem?: CultivationTier[];
    customThienThu?: any;
    setThienThuModalState?: React.Dispatch<React.SetStateAction<any>>;
    destinyDefs?: Record<string, DestinyDefinition>;
}

const ItemList: React.FC<{
    title: string;
    items: any[];
    onAdd: () => void;
    onRemove: (index: number) => void;
}> = ({ title, items, onAdd, onRemove }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-yellow-200">{title}</h4>
            <button type="button" onClick={onAdd} className="p-1 text-green-400 hover:bg-slate-700/50 rounded-full">
                <Icons.PlusCircleIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="space-y-1 p-2 bg-slate-900/50 rounded-lg border border-slate-700 max-h-40 overflow-y-auto styled-scrollbar">
            {items && items.length > 0 ? items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex justify-between items-center p-1 bg-slate-800 rounded text-xs">
                    <span className="truncate">{item.name}</span>
                    <button type="button" onClick={() => onRemove(index)} className="p-0.5 text-red-400 hover:bg-slate-700 rounded-full">
                        <Icons.XIcon className="w-3 h-3"/>
                    </button>
                </div>
            )) : <p className="text-xs text-slate-500 italic">Chưa có.</p>}
        </div>
    </div>
);


export const NpcForm: React.FC<NpcFormProps> = ({ formData, handleChange, allSects, cultivationSystem, customThienThu, setThienThuModalState, destinyDefs }) => {
    const [activeTab, setActiveTab] = useState<'coBan' | 'tuLuyen' | 'hanhTrang'>('coBan');
    
    const sectRanks = [
        'Lão tổ', 'Thái thượng trưởng lão', 'Tông chủ', 'Trưởng lão', 'Đường chủ', 'Hộ Pháp', 
        'Chấp sự', 'Thủ tịch đệ tử', 'Đệ tử thân truyền', 'Đệ tử nội môn', 'Đệ tử ký danh', 'Đệ tử ngoại môn'
    ];

    const handleItemRemove = (field: keyof InitialNpc, index: number) => {
        const currentItems = formData[field] as any[] || [];
        handleChange(field, [...currentItems.slice(0, index), ...currentItems.slice(index + 1)]);
    };

    return (
        <div className="flex flex-col gap-4">
             <div className="flex-shrink-0 flex border-b-2 border-slate-700/50">
                <button type="button" onClick={() => setActiveTab('coBan')} className={`flex-1 p-2 text-xs font-bold transition-colors ${activeTab === 'coBan' ? 'bg-slate-700 text-yellow-300' : 'text-slate-400 hover:bg-slate-700/50'}`}>Cơ Bản</button>
                <button type="button" onClick={() => setActiveTab('tuLuyen')} className={`flex-1 p-2 text-xs font-bold transition-colors ${activeTab === 'tuLuyen' ? 'bg-slate-700 text-yellow-300' : 'text-slate-400 hover:bg-slate-700/50'}`}>Tu Luyện</button>
                <button type="button" onClick={() => setActiveTab('hanhTrang')} className={`flex-1 p-2 text-xs font-bold transition-colors ${activeTab === 'hanhTrang' ? 'bg-slate-700 text-yellow-300' : 'text-slate-400 hover:bg-slate-700/50'}`}>Hành Trang</button>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'coBan' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-sm font-medium text-yellow-300 mb-1 block">Tên NPC</span>
                                <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"/>
                            </label>
                             <label className="block">
                                <span className="text-sm font-medium text-yellow-300 mb-1 block">Tuổi</span>
                                <input type="number" value={formData.age || ''} onChange={e => handleChange('age', parseInt(e.target.value, 10))} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"/>
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-sm font-medium text-yellow-300 mb-1 block">Tiểu sử</span>
                            <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} rows={3} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm styled-scrollbar"/>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-yellow-300 mb-1 block">Mục tiêu</span>
                            <textarea value={formData.goals || ''} onChange={e => handleChange('goals', e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm styled-scrollbar"/>
                        </label>
                         <label className="block">
                            <span className="text-sm font-medium text-yellow-300 mb-1 block">Lý lịch/Ân oán</span>
                            <textarea value={formData.personalHistory || ''} onChange={e => handleChange('personalHistory', e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm styled-scrollbar"/>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="block">
                                <span className="text-sm font-medium text-yellow-300 mb-1 block">Quan hệ với người chơi</span>
                                <input type="text" value={formData.relationship || ''} onChange={e => handleChange('relationship', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"/>
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-yellow-300 mb-1 block">Thái độ ban đầu</span>
                                <select value={formData.initialAttitude || 'Trung lập'} onChange={e => handleChange('initialAttitude', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm">
                                    <option value="Thân thiện">Thân thiện</option>
                                    <option value="Trung lập">Trung lập</option>
                                    <option value="Cảnh giác">Cảnh giác</option>
                                    <option value="Thù địch">Thù địch</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-yellow-300 mb-1 block">Tính cách</span>
                                <select value={formData.personality || ''} onChange={e => handleChange('personality', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm">
                                    <option value="">-- Chọn --</option>
                                    <option value="Ôn hòa">Ôn hòa</option>
                                    <option value="Hiếu chiến">Hiếu chiến</option>
                                    <option value="Trung dung">Trung dung</option>
                                    <option value="Mưu mô">Mưu mô</option>
                                </select>
                            </label>
                        </div>
                    </div>
                )}
                {activeTab === 'tuLuyen' && (
                     <div className="space-y-4">
                        <LinhCanSelector value={formData.linhCanQuality} onChange={(val) => handleChange('linhCanQuality', val)} />
                        <NguHanhSelector value={formData.nguHanh || EMPTY_NGU_HANH} onChange={(val) => handleChange('nguHanh', val)} linhCanQuality={formData.linhCanQuality} />
                        <DestinySelector selectedIds={formData.selectedDestinyIds || []} onChange={(val) => handleChange('selectedDestinyIds', val)} destinyDefs={destinyDefs || {}} />
                        <div>
                            <label className="block text-sm font-medium text-yellow-300 mb-1">Cảnh giới khởi đầu</label>
                            <select value={formData.startingCultivationStageId || ''} onChange={(e) => handleChange('startingCultivationStageId', e.target.value || null)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm" disabled={!cultivationSystem || cultivationSystem.length === 0}>
                                <option value="">-- Mặc định --</option>
                                {cultivationSystem?.map(tier => (
                                    <optgroup key={tier.id} label={tier.name}>
                                        {tier.realms.flatMap(majorRealm => 
                                            majorRealm.minorRealms.filter(minor => !minor.isHidden).map(minorRealm => (
                                                <option key={minorRealm.id} value={minorRealm.id}>{majorRealm.name} {minorRealm.name}</option>
                                            ))
                                        )}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-yellow-300 mb-1">Môn phái</label>
                                <select value={formData.sectId || ''} onChange={(e) => handleChange('sectId', e.target.value || null)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm">
                                    <option value="">Tán tu</option>
                                    {allSects.map(sect => (<option key={sect.id} value={sect.id}>{getSectDisplayName(sect, allSects)}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-yellow-300 mb-1">Chức vụ</label>
                                <select value={formData.sectRank || ''} onChange={(e) => handleChange('sectRank', e.target.value)} disabled={!formData.sectId} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm disabled:bg-slate-800/50">
                                    <option value="" disabled>-- Chọn --</option>
                                    {sectRanks.map(rank => (<option key={rank} value={rank}>{rank}</option>))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                 {activeTab === 'hanhTrang' && setThienThuModalState && (
                    <div className="space-y-4">
                        <ItemList title="Vật phẩm" items={formData.initialItems || []} onAdd={() => setThienThuModalState({ type: 'item', npcId: formData.id })} onRemove={(index) => handleItemRemove('initialItems', index)} />
                        <ItemList title="Trang bị" items={formData.initialTrangBi || []} onAdd={() => setThienThuModalState({ type: 'trangBi', npcId: formData.id })} onRemove={(index) => handleItemRemove('initialTrangBi', index)} />
                        <ItemList title="Pháp bảo" items={formData.initialPhapBao || []} onAdd={() => setThienThuModalState({ type: 'phapBao', npcId: formData.id })} onRemove={(index) => handleItemRemove('initialPhapBao', index)} />
                        <ItemList title="Công pháp" items={formData.initialCongPhap || []} onAdd={() => setThienThuModalState({ type: 'congPhap', npcId: formData.id })} onRemove={(index) => handleItemRemove('initialCongPhap', index)} />
                    </div>
                )}
            </div>
        </div>
    );
};