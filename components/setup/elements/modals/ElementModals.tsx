// FIX: Added `import React from 'react'` to resolve JSX namespace errors.
import React, { useState, useRef, useEffect, useCallback, Dispatch, SetStateAction, useMemo } from 'react';
import type { InitialItem, InitialCongPhap, InitialSect, WorldLocation, PlayerAttributes, EquipmentType, NguHanhType, CultivationTier, DestinyDefinition } from '../../../../types';
import * as Icons from '../../../Icons';
import { PLAYER_ATTRIBUTE_NAMES } from '../../../../constants';
import { ImageAssignmentModal } from '../../../GamePanels';
import { EffectSelector, rankMap } from '../ElementHelpers';
import { ItemForm } from './ItemForm';
import { EquipmentForm } from './EquipmentForm';
import { CongPhapForm } from './CongPhapForm';
import { NpcForm } from './NpcForm';
import { getSectDisplayName } from '../shared';
import { SectForm } from './SectForm';
import { getImageUrl } from '../../../GamePanels';

const buildLocationOptions = (allLocations: WorldLocation[], currentItem?: WorldLocation) => {
    type TreeLocation = WorldLocation & { children: TreeLocation[] };

    const locationMap: Record<string, TreeLocation> = {};
    const roots: TreeLocation[] = [];

    allLocations.forEach(loc => {
        locationMap[loc.id] = { ...loc, children: [] };
    });

    allLocations.forEach(loc => {
        if (loc.parentId && locationMap[loc.parentId]) {
            locationMap[loc.parentId].children.push(locationMap[loc.id]);
        } else {
            roots.push(locationMap[loc.id]);
        }
    });

    const options: JSX.Element[] = [];
    const traverse = (node: TreeLocation, depth: number) => {
        if (currentItem && (node.id === currentItem.id || (node.parentId && node.parentId === currentItem.id))) {
            return;
        }
        options.push(
            <option key={node.id} value={node.id}>
                {'—'.repeat(depth)} {node.name} (Cấp {node.level})
            </option>
        );
        node.children.forEach(child => traverse(child, depth + 1));
    };

    roots.forEach(rootNode => traverse(rootNode, 0));
    return options;
};

export const ElementModal = ({ modalState, onClose, onSave, allSects = [], allWorldLocations = [], startingLocationId, setStartingLocationId, cultivationSystem, customThienThu, setThienThuModalState, destinyDefs }: { 
    modalState: { type: string, data: any | null, parentIds?: any }, 
    onClose: () => void, 
    onSave: (data: any) => void,
    allSects?: InitialSect[],
    allWorldLocations?: WorldLocation[],
    startingLocationId?: string | null,
    setStartingLocationId?: Dispatch<SetStateAction<string | null>>,
    cultivationSystem?: CultivationTier[],
    customThienThu?: any,
    setThienThuModalState?: Dispatch<SetStateAction<any>>,
    destinyDefs?: Record<string, DestinyDefinition>;
}) => {
    const [formData, setFormData] = useState<any>({});
    const modalScrollRef = useRef<HTMLDivElement>(null);
    const [assignmentModalState, setAssignmentModalState] = useState<{ isOpen: boolean; item: any | null; onAssign: (imageId: string) => void; }>({ isOpen: false, item: null, onAssign: () => {} });
    
    const handleChange = useCallback((field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    }, []);

    useEffect(() => {
        const defaults: Partial<InitialItem & InitialCongPhap & WorldLocation & InitialSect> = {
            attributes: {},
            attributeDuration: 'vĩnh viễn',
            usageLimit: 'không giới hạn',
            expPerTurn: 0,
            enableRecovery: false,
            recoveryHp: 0,
            recoverySpiritPower: 0,
            recoveryStamina: 0,
            recoveryMentalState: 0,
            enableRecoveryOverTime: false,
            recoveryDuration: 1,
            quantity: 1,
            nguHanhAttribute: '',
            rank: 1,
            controllingSectIds: [],
            level: 1,
            sovereigntyType: 'autonomous',
// FIX: Removed nonexistent 'connections' property from the defaults object to resolve a type error.
        };
        const initialData = modalState.data 
            ? { ...defaults, ...modalState.data, attributes: { ...defaults.attributes, ...(modalState.data.attributes || {}) } }
            : { ...defaults, ...(modalState.parentIds || {}) };
            
        initialData.enableAttributes = !!(modalState.data?.attributes && Object.keys(modalState.data.attributes).length > 0);
        initialData.enableRecovery = !!modalState.data?.enableRecovery;

        setFormData(initialData);
    }, [modalState.data, modalState.parentIds]);
    

    const handleAttributeChange = (attr: keyof PlayerAttributes, value: string) => {
        const numValue = parseInt(value, 10);
        setFormData((prev: any) => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [attr]: isNaN(numValue) ? 0 : numValue
            }
        }));
    };

    const handleEffectIdsChange = (ids: string[]) => {
        setFormData((prev: any) => ({ ...prev, effectIds: ids }));
    };
    
    const handleEffectSelectorOpen = () => {
        setTimeout(() => {
            modalScrollRef.current?.scrollTo({
                top: modalScrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let finalData = { ...formData };

        if (modalState.type === 'worldLocation') {
            if (finalData.isStartingPoint) {
                const newId = finalData.id || `init_worldLocation_${Date.now()}`;
                finalData.id = newId;
                if (setStartingLocationId) setStartingLocationId(newId);
            } else if (!finalData.isStartingPoint && finalData.id && startingLocationId === finalData.id) {
                if (setStartingLocationId) setStartingLocationId(null);
            }
        }
        delete finalData.isStartingPoint;

        if (!finalData.enableAttributes) {
            delete finalData.attributes;
            delete finalData.attributeDuration;
            delete finalData.usageLimit;
            delete finalData.expPerTurn;
        }
        if (!finalData.enableRecovery) {
            delete finalData.recoveryHp;
            delete finalData.recoverySpiritPower;
            delete finalData.recoveryStamina;
            delete finalData.recoveryMentalState;
            delete finalData.enableRecoveryOverTime;
            delete finalData.recoveryDuration;
        }
        onSave(finalData);
    };
    
    const renderField = (id: string, label: string, type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'select-tree', options?: any, placeholder?: string, disabled: boolean = false): JSX.Element => (
        <div key={id}>
            {type !== 'checkbox' && <label htmlFor={id} className="block text-sm font-medium text-yellow-300 mb-1">{label}</label>}
            {type === 'text' && <input id={id} type="text" value={formData[id] || ''} onChange={e => handleChange(id, e.target.value)} placeholder={placeholder || ''} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:bg-slate-900/50 disabled:cursor-not-allowed" disabled={disabled} />}
            {type === 'textarea' && <textarea id={id} value={formData[id] || ''} onChange={e => handleChange(id, e.target.value)} rows={3} placeholder={placeholder || ''} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 styled-scrollbar disabled:bg-slate-900/50 disabled:cursor-not-allowed" disabled={disabled} />}
            {type === 'number' && <input id={id} type="number" value={formData[id] ?? (id === 'quantity' || id === 'level' ? 1 : 0)} onChange={e => handleChange(id, parseInt(e.target.value, 10) || 0)} placeholder={placeholder || ''} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500" disabled={disabled} />}
            {type === 'checkbox' && (
                <div className="flex items-center gap-2">
                    <input id={id} type="checkbox" checked={formData[id] || false} onChange={e => handleChange(id, e.target.checked)} className="h-5 w-5 rounded border-gray-500 bg-slate-700 text-yellow-500" disabled={disabled} />
                    <label htmlFor={id} className="text-sm font-medium text-slate-200">{label}</label>
                </div>
            )}
            {(type === 'select' || type === 'select-tree') && <select
                id={id}
                value={formData[id] || ''}
                onChange={e => handleChange(id, id === 'rank' ? (parseInt(e.target.value, 10) || undefined) : e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:bg-slate-900/50 disabled:cursor-not-allowed"
                disabled={disabled}
            >
                <option value="">-- Chọn --</option>
                {id === 'rank' ? (
                    Object.entries(rankMap).map(([rankValue, rankLabel]) => (
                        <option key={rankValue} value={rankValue}>{rankLabel}</option>
                    ))
                ) : type === 'select-tree' ? (
                    buildLocationOptions(options, formData)
                ) : (
                    options.map((opt: string | {value: string, label: string}) => typeof opt === 'string' ? <option key={opt} value={opt}>{opt}</option> : <option key={opt.value} value={opt.value}>{opt.label}</option>)
                )}
            </select>}
        </div>
    );

    const renderAttributeFields = () => (
        <details className="bg-slate-900/50 p-3 rounded-lg border border-slate-700" open={!!formData.enableAttributes}>
            <summary className="font-semibold text-yellow-300 cursor-pointer flex items-center gap-2" onClick={(e) => { e.preventDefault(); handleChange('enableAttributes', !formData.enableAttributes); }}>
                <input
                    type="checkbox"
                    checked={!!formData.enableAttributes}
                    onChange={e => handleChange('enableAttributes', e.target.checked)}
                    onClick={e => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-500 bg-slate-700 text-yellow-500 flex-shrink-0"
                />
                <span>Thuộc tính cộng thêm</span>
            </summary>
             {formData.enableAttributes && (
                <div className="mt-2 pt-3 border-t border-slate-700 space-y-4">
                    {modalState.type === 'item' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderField('attributeDuration', 'Số lượt tác dụng', 'select', ['vĩnh viễn', '1', '3', '5', '10', '20', '50', '100'])}
                            {renderField('usageLimit', 'Giới hạn sử dụng', 'select', ['không giới hạn', '1', '5', '10', '100', '300'])}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(PLAYER_ATTRIBUTE_NAMES).map(key => {
                            const attrKey = key as keyof PlayerAttributes;
                            return (
                                <div key={attrKey}>
                                    <label htmlFor={attrKey} className="block text-xs font-medium text-slate-300 mb-1">{PLAYER_ATTRIBUTE_NAMES[attrKey]}</label>
                                    <input
                                        id={attrKey}
                                        type="number"
                                        value={formData.attributes?.[attrKey] || 0}
                                        onChange={e => handleAttributeChange(attrKey, e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                    />
                                </div>
                            )
                        })}
                        <div>
                            <label htmlFor="expPerTurn" className="block text-xs font-medium text-slate-300 mb-1">Kinh nghiệm cộng thêm mỗi lượt</label>
                            <input
                                id="expPerTurn"
                                type="number"
                                value={formData.expPerTurn ?? 0}
                                onChange={e => handleChange('expPerTurn', parseInt(e.target.value, 10) || 0)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            />
                            <p className="text-xs text-slate-400 mt-1">Mỗi lượt sẽ được cộng thêm 1 lượng kinh nghiệm khi dùng món đồ đó.</p>
                        </div>
                    </div>
                </div>
             )}
        </details>
    );
    
    const renderWorldLocationForm = () => {
        const isCurrentlyTheStartPoint = formData.id && startingLocationId === formData.id;
        const isChecked = (isCurrentlyTheStartPoint && formData.isStartingPoint !== false) || formData.isStartingPoint === true;
    
        const handleStartPointToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
            handleChange('isStartingPoint', e.target.checked);
        };

        const realmOptions = useMemo(() => {
            const options: string[] = ['Không yêu cầu'];
            if (cultivationSystem) {
                cultivationSystem.forEach(tier => {
                    tier.realms.forEach(major => {
                        options.push(major.name);
                        major.minorRealms.forEach(minor => {
                            if (minor.name && !minor.isHidden) {
                                options.push(`${major.name} ${minor.name}`);
                            }
                        });
                    });
                });
            }
            return options;
        }, [cultivationSystem]);
        
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                    {renderField('name', `Tên (Cấp ${formData.level || 1})`, 'text')}
                    {formData.level > 1 && renderField('parentId', `Thuộc Cấp ${formData.level - 1}`, 'select-tree', allWorldLocations.filter(l => l.level === formData.level - 1))}
                    {renderField('description', 'Mô tả', 'textarea')}
                    {renderField('type', 'Loại hình', 'select', ['Quần Cư', 'Tự Nhiên', 'Tài Nguyên', 'Đặc Biệt', 'Di Tích Cổ', 'Bí Cảnh'])}
                    {renderField('realmRequirement', 'Yêu cầu cảnh giới', 'select', realmOptions)}
                     <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                        <input
                            id="isStartPoint"
                            type="checkbox"
                            checked={isChecked}
                            onChange={handleStartPointToggle}
                            className="h-5 w-5 rounded border-gray-500 bg-slate-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-slate-800 cursor-pointer"
                        />
                        <label htmlFor="isStartPoint" className="text-sm font-medium text-slate-200 cursor-pointer">Đặt làm địa điểm bắt đầu</label>
                    </div>
                </div>
                {/* Right Column: Map */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-yellow-300 mb-1">Định vị trên Bản đồ</label>
                        <div 
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = ((e.clientX - rect.left) / rect.width) * 100;
                                const y = ((e.clientY - rect.top) / rect.height) * 100;
                                handleChange('x', parseFloat(x.toFixed(2)));
                                handleChange('y', parseFloat(y.toFixed(2)));
                            }}
                            className="w-full aspect-video bg-slate-900/50 border border-slate-600 rounded-lg relative cursor-crosshair overflow-hidden"
                            style={{
                                backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
                                backgroundSize: '15px 15px'
                            }}
                        >
                            {formData.x != null && formData.y != null && (
                                <div 
                                    className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ left: `${formData.x}%`, top: `${formData.y}%` }}
                                >
                                    <div className="w-full h-full rounded-full bg-green-500 ring-4 ring-green-500/50 animate-pulse"></div>
                                </div>
                            )}
                        </div>
                         <div className="grid grid-cols-2 gap-4 mt-2">
                             <div>
                                 <label htmlFor="coord-x" className="block text-xs text-slate-400">Tọa độ X (%)</label>
                                 <input id="coord-x" type="number" readOnly value={formData.x ?? ''} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm text-cyan-300" />
                             </div>
                             <div>
                                 <label htmlFor="coord-y" className="block text-xs text-slate-400">Tọa độ Y (%)</label>
                                 <input id="coord-y" type="number" readOnly value={formData.y ?? ''} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm text-cyan-300" />
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        );
    };
    
    let formContent;
    let title = 'Yếu Tố Mới';
    switch (modalState.type) {
        case 'item': formContent = <ItemForm formData={formData} renderField={renderField} renderAttributeFields={renderAttributeFields} handleChange={handleChange} handleEffectIdsChange={handleEffectIdsChange} handleEffectSelectorOpen={handleEffectSelectorOpen} />; title = 'Vật phẩm'; break;
        case 'trangBi': formContent = <EquipmentForm modalState={modalState} formData={formData} renderField={renderField} renderAttributeFields={renderAttributeFields} handleChange={handleChange} handleEffectIdsChange={handleEffectIdsChange} handleEffectSelectorOpen={handleEffectSelectorOpen} />; title = 'Trang bị'; break;
        case 'phapBao': formContent = <EquipmentForm modalState={modalState} formData={formData} renderField={renderField} renderAttributeFields={renderAttributeFields} handleChange={handleChange} handleEffectIdsChange={handleEffectIdsChange} handleEffectSelectorOpen={handleEffectSelectorOpen} />; title = 'Pháp bảo'; break;
        case 'congPhap': formContent = <CongPhapForm formData={formData} renderField={renderField} renderAttributeFields={renderAttributeFields} handleChange={handleChange} handleEffectIdsChange={handleEffectIdsChange} handleEffectSelectorOpen={handleEffectSelectorOpen} />; title = 'Công pháp'; break;
        case 'npc': formContent = <NpcForm formData={formData} handleChange={handleChange} allSects={allSects} cultivationSystem={cultivationSystem} customThienThu={customThienThu} setThienThuModalState={setThienThuModalState} destinyDefs={destinyDefs} />; title = 'NPC'; break;
        case 'sect': formContent = <SectForm formData={formData} handleChange={handleChange} allSects={allSects} renderField={renderField} allWorldLocations={allWorldLocations} />; title = 'Môn Phái'; break;
        case 'worldLocation': formContent = renderWorldLocationForm(); title = 'Địa Điểm'; break;
        default: return null;
    }
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800/95 backdrop-blur-sm border border-yellow-500 rounded-lg p-6 shadow-xl w-full max-w-5xl" onClick={e => e.stopPropagation()}>
                <ImageAssignmentModal
                    isOpen={assignmentModalState.isOpen}
                    onClose={() => setAssignmentModalState({ ...assignmentModalState, isOpen: false })}
                    item={assignmentModalState.item}
                    onAssign={(imageId) => {
                        assignmentModalState.onAssign(imageId);
                        setAssignmentModalState({ ...assignmentModalState, isOpen: false });
                    }}
                />
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-yellow-300 mb-2">{modalState.data ? 'Chỉnh sửa' : 'Thêm'} {title}</h2>
                    {!['sect', 'worldLocation'].includes(modalState.type) && (
                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden relative group">
                                {(() => {
                                    const imageUrl = getImageUrl(formData.imageId);
                                    return imageUrl ? (
                                        <img src={imageUrl || ''} alt={formData.name || 'Preview'} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                                           <Icons.QuestionMarkCircleIcon className="w-10 h-10"/>
                                        </div>
                                    );
                                })()}
                                {formData.imageId && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleChange('imageId', undefined); }}
                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        title="Gỡ ảnh"
                                    >
                                        <Icons.XIcon className="w-4 h-4"/>
                                    </button>
                                )}
                            </div>
                            <div className="flex-grow">
                                <label className="block text-sm font-medium text-yellow-300 mb-1">Ảnh đại diện</label>
                                <p className="text-xs text-slate-400 mb-2">Chọn một ảnh đại diện cho yếu tố này.</p>
                                <button
                                    type="button"
                                    onClick={() => setAssignmentModalState({
                                        isOpen: true,
                                        item: formData,
                                        onAssign: (imgId) => handleChange('imageId', imgId)
                                    })}
                                    className="text-sm bg-blue-600/80 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors"
                                >
                                    Chọn ảnh...
                                </button>
                            </div>
                        </div>
                    )}
                    <div ref={modalScrollRef} className="max-h-[60vh] overflow-y-auto styled-scrollbar pr-4 space-y-4">
                        {formContent}
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded transition-colors">Hủy</button>
                        <button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded transition-colors">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export * from './AddElementChoiceModal';
export * from './ThienThuSelectorModal';