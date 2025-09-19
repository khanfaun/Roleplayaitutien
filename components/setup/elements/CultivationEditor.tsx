import React, { useState, useEffect } from 'react';
import type { CultivationTier, MajorRealm, MinorRealm, RealmQuality } from '../../../types';
import * as Icons from '../../Icons';

export const PHAM_NHAN_TIER: CultivationTier = {
  id: 'pham_nhan_tier_0',
  name: 'Cấp Bậc Phàm Nhân',
  rank: 0,
  realms: [{
    id: 'pham_nhan_realm_0',
    rank: 0,
    name: 'Phàm Nhân',
    baseLifespan: 80,
    description: 'Cảnh giới khởi đầu của vạn vật, chưa bước chân vào con đường tu tiên.',
    minorRealms: [
      {
        id: 'pham_nhan_realm_0_minor_0',
        rank: 0,
        name: '', // Empty name for clean display
        description: 'Chưa bước chân vào con đường tu tiên.',
        isHidden: false,
      }
    ],
    hasQualities: false,
    qualities: [],
  }]
};

const CultivationModal: React.FC<{ modalState: any, onClose: () => void, onSave: (state: any) => void }> = ({ modalState, onClose, onSave }) => {
    const [data, setData] = useState(modalState.data || {});
    
    useEffect(() => {
        setData(modalState.data || { id: `new_${modalState.type}_${Date.now()}`});
    }, [modalState]);

    const handleChange = (field: string, value: any) => {
        setData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ type: modalState.type, data, parentIds: modalState.parentIds });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">Edit {modalState.type}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm">Name</label>
                        <input type="text" value={data.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-700 p-2 rounded" />
                    </div>
                    <div>
                        <label className="text-sm">Rank</label>
                        <input type="number" value={data.rank || 0} onChange={e => handleChange('rank', parseInt(e.target.value, 10) || 0)} className="w-full bg-slate-700 p-2 rounded" />
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-600 p-2 rounded">Cancel</button>
                        <button type="submit" className="flex-1 bg-yellow-500 text-black p-2 rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const CultivationEditor: React.FC<{
    system: CultivationTier[],
    setSystem: React.Dispatch<React.SetStateAction<CultivationTier[]>>,
    onOpenSimulator: (selection: { tierId: string, majorId?: string, minorId?: string }) => void,
}> = ({ system, setSystem, onOpenSimulator }) => {
    const [modalState, setModalState] = useState<{ type: 'tier' | 'major' | 'minor', data: any | null, parentIds?: { tierId?: string, majorId?: string } } | null>(null);
    const [expandedTierId, setExpandedTierId] = useState<string | null>(system[0]?.id || null);
    const [expandedMajorRealmIds, setExpandedMajorRealmIds] = useState<Record<string, string | null>>({});

    const handleSave = ({ type, data, parentIds }: { type: string, data: any, parentIds?: any }) => {
        setSystem(prev => {
            const newSystem = JSON.parse(JSON.stringify(prev));
            if (type === 'tier') {
                const index = newSystem.findIndex((t: CultivationTier) => t.id === data.id);
                if (index > -1) newSystem[index] = data; else newSystem.push(data);
            } else if (type === 'major' && parentIds?.tierId) {
                const tier = newSystem.find((t: CultivationTier) => t.id === parentIds.tierId);
                if (tier) {
                    const index = tier.realms.findIndex((m: MajorRealm) => m.id === data.id);
                    if (index > -1) tier.realms[index] = data; else tier.realms.push(data);
                }
            } else if (type === 'minor' && parentIds?.tierId && parentIds?.majorId) {
                const tier = newSystem.find((t: CultivationTier) => t.id === parentIds.tierId);
                const major = tier?.realms.find((m: MajorRealm) => m.id === parentIds.majorId);
                if (major) {
                    const index = major.minorRealms.findIndex((sm: MinorRealm) => sm.id === data.id);
                    if (index > -1) major.minorRealms[index] = data; else major.minorRealms.push(data);
                }
            }
            return newSystem;
        });
        setModalState(null);
    };

    const handleDelete = (type: 'tier' | 'major' | 'minor', ids: { tierId: string, majorId?: string, minorId?: string }) => {
        if (ids.tierId === 'pham_nhan_tier_0') return;

        setSystem(prev => {
            if (type === 'tier') {
                return prev.filter(t => t.id !== ids.tierId);
            }
            if (type === 'major' && ids.majorId) {
                return prev.map(t => t.id === ids.tierId ? { ...t, realms: t.realms.filter(m => m.id !== ids.majorId) } : t);
            }
            if (type === 'minor' && ids.majorId && ids.minorId) {
                return prev.map(t => t.id === ids.tierId ? { ...t, realms: t.realms.map(m => m.id === ids.majorId ? { ...m, minorRealms: m.minorRealms.filter(sm => sm.id !== ids.minorId) } : m) } : t);
            }
            return prev;
        });
    };

    const handleToggleMajorRealm = (tierId: string, majorRealmId: string) => {
        setExpandedMajorRealmIds(prev => ({
            ...prev,
            [tierId]: prev[tierId] === majorRealmId ? null : majorRealmId
        }));
    };

    return (
        <div className="h-full flex flex-col">
            {modalState && (
                <CultivationModal modalState={modalState} onClose={() => setModalState(null)} onSave={handleSave} />
            )}
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-yellow-300 flex items-center gap-3">
                    <Icons.CpuChipIcon className="w-6 h-6"/>
                    Hệ Thống Cảnh Giới
                </h3>
                <button onClick={() => setModalState({ type: 'tier', data: null })} className="flex items-center gap-2 text-sm bg-green-600/80 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded-md transition-colors">
                    <Icons.PlusCircleIcon className="w-5 h-5"/> Thêm Cấp Bậc
                </button>
            </div>
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-2 -mr-2 space-y-2">
                {system.map(tier => {
                    const isLocked = tier.id === 'pham_nhan_tier_0';
                    return (
                        <div key={tier.id} className={`bg-slate-800/50 rounded-lg border border-slate-700 ${isLocked ? 'opacity-70' : ''}`}>
                            <div className="p-2 flex items-center justify-between">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => !isLocked && setExpandedTierId(prev => prev === tier.id ? null : tier.id)}>
                                    {isLocked 
                                        ? <Icons.LockClosedIcon className="w-5 h-5 text-slate-400"/>
                                        : (expandedTierId === tier.id ? <Icons.ChevronUpIcon className="w-5 h-5 text-slate-400"/> : <Icons.ChevronDownIcon className="w-5 h-5 text-slate-400"/>)
                                    }
                                    <span className="font-bold text-lg text-yellow-200">{tier.name}</span>
                                </div>
                                {!isLocked && (
                                    <div className="flex items-center gap-1">
                                        <button title="Chỉnh sửa" onClick={(e) => { e.stopPropagation(); setModalState({ type: 'tier', data: tier }); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
                                        <button title="Xóa" onClick={(e) => { e.stopPropagation(); handleDelete('tier', { tierId: tier.id }); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                )}
                            </div>
                            {(expandedTierId === tier.id || isLocked) && (
                                <div className="pl-6 pr-2 pb-2 space-y-1">
                                    {tier.realms.map(majorRealm => {
                                        const isMajorLocked = majorRealm.id === 'pham_nhan_realm_0';
                                        return (
                                            <div key={majorRealm.id} className="bg-slate-700/40 rounded-md border border-slate-600">
                                                <div className="p-2 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => !isMajorLocked && handleToggleMajorRealm(tier.id, majorRealm.id)}>
                                                        {isMajorLocked 
                                                            ? <Icons.LockClosedIcon className="w-4 h-4 text-slate-400"/>
                                                            : (expandedMajorRealmIds[tier.id] === majorRealm.id ? <Icons.ChevronUpIcon className="w-4 h-4 text-slate-400"/> : <Icons.ChevronDownIcon className="w-4 h-4 text-slate-400"/>)
                                                        }
                                                        <span className="font-semibold text-cyan-300">{majorRealm.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button title="Diễn Thiên Kính" onClick={(e) => { e.stopPropagation(); onOpenSimulator({ tierId: tier.id, majorId: majorRealm.id }); }} className="p-1 text-green-400 hover:bg-slate-700 rounded-full"><Icons.ScaleIcon className="w-4 h-4"/></button>
                                                        {!isMajorLocked && (
                                                            <>
                                                                <button title="Chỉnh sửa" onClick={(e) => { e.stopPropagation(); setModalState({ type: 'major', data: majorRealm, parentIds: { tierId: tier.id } }); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
                                                                <button title="Xóa" onClick={(e) => { e.stopPropagation(); handleDelete('major', { tierId: tier.id, majorId: majorRealm.id }); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {expandedMajorRealmIds[tier.id] === majorRealm.id && !isMajorLocked && (
                                                    <div className="pl-6 pr-2 pb-2 space-y-1 text-sm">
                                                        {majorRealm.hasQualities && majorRealm.qualities && majorRealm.qualities.length > 0 && (
                                                            <div className="space-y-1 my-2">
                                                                <h5 className="text-xs font-bold text-slate-400">Phẩm chất có thể đạt được:</h5>
                                                                {majorRealm.qualities.map(quality => (
                                                                    <div key={quality.id} className="p-1.5 bg-yellow-900/30 border-l-2 border-yellow-500 rounded-r-md flex items-center justify-between">
                                                                        <span className="font-semibold text-yellow-300">{quality.name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {majorRealm.minorRealms.map(minorRealm => (
                                                            <div key={minorRealm.id} className="p-1.5 bg-slate-600/30 rounded flex items-center justify-between">
                                                                <span>{minorRealm.name} {minorRealm.isHidden && <span className="text-xs text-purple-400">(Ẩn)</span>}</span>
                                                                <div className="flex items-center gap-1">
                                                                    <button title="Diễn Thiên Kính" onClick={(e) => { e.stopPropagation(); onOpenSimulator({ tierId: tier.id, majorId: majorRealm.id, minorId: minorRealm.id }); }} className="p-1 text-green-400 hover:bg-slate-700 rounded-full"><Icons.ScaleIcon className="w-4 h-4"/></button>
                                                                    <button title="Chỉnh sửa" onClick={(e) => { e.stopPropagation(); setModalState({ type: 'minor', data: minorRealm, parentIds: { tierId: tier.id, majorId: majorRealm.id } }); }} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><Icons.PencilIcon className="w-4 h-4"/></button>
                                                                    <button title="Xóa" onClick={(e) => { e.stopPropagation(); handleDelete('minor', { tierId: tier.id, majorId: majorRealm.id, minorId: minorRealm.id }); }} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><Icons.TrashIcon className="w-4 h-4"/></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => setModalState({ type: 'minor', data: null, parentIds: { tierId: tier.id, majorId: majorRealm.id } })} className="w-full text-xs p-1 mt-1 bg-green-800/50 hover:bg-green-700/50 rounded-md transition-colors">Thêm Tiểu Cảnh Giới</button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {!isLocked && <button onClick={() => setModalState({ type: 'major', data: null, parentIds: { tierId: tier.id } })} className="w-full text-sm p-2 mt-2 bg-blue-800/50 hover:bg-blue-700/50 rounded-md transition-colors">Thêm Đại Cảnh Giới</button>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
