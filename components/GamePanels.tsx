
import React, { useState, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import type { Quest, Player, GameState, DongPhuBuilding, Recipe, Item, Rule, JournalEntry, HeThongQuest, PlayerAttributes, ScenarioStage, StatusEffect, LinhCanQuality, NguHanhType, DestinyDefinition, InitialItem, InitialCongPhap, ItemEffectDefinition, EquipmentType, TechniqueType, ConsumableType, ThienThuImage, ThienThuImageManifest } from '../types';
import { SECTS, PLAYER_ATTRIBUTE_NAMES, ALL_STAT_NAMES } from '../constants';
import * as Icons from './Icons';
import { PlusCircleIcon, PencilIcon, TrashIcon, CheckIcon, XIcon, ShieldCheckIcon, ChevronRightIcon, CpuChipIcon, QuestionMarkCircleIcon, ScaleIcon, HammerIcon, UserPlusIcon, BuildingLibraryIcon, MapIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import Panel from './Panel';
import { SmartTooltip } from './SmartTooltip';
import { DESTINY_DEFINITIONS } from '../data/effects';
import { ALL_ITEM_EFFECT_DEFINITIONS } from '../data/effects';
import { LinhCanSelector, NguHanhSelector } from './setup/CharacterTab';
import * as geminiService from '../services/geminiService';


export const ImageAssignmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAssign: (imageId: string) => void;
    item: InitialItem | InitialCongPhap | Item | null;
}> = ({ isOpen, onClose, onAssign, item }) => {
    const [manifest, setManifest] = useState<ThienThuImageManifest | null>(null);
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetch('/thienthu_images.json')
                .then(res => res.json())
                .then(data => setManifest(data))
                .catch(err => console.error("Failed to load image manifest", err));
        }
    }, [isOpen]);

    const handleAiSelect = async () => {
        if (!manifest || !item) return;
        setIsLoading(true);
        try {
            const category = 'techniqueType' in item 
                ? 'Công pháp' 
                : 'itemType' in item 
                    ? item.itemType 
                    : item.category;
            const imageId = await geminiService.assignSingleImage({ name: item.name, description: item.description, category }, manifest.images);
            onAssign(imageId);
        } catch (error) {
            console.error("AI image assignment failed", error);
            alert("AI gán ảnh thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !item) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 p-4 rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-yellow-300 mb-4 flex-shrink-0">Gán ảnh cho "{item.name}"</h3>
                
                <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-700">
                    <div className="flex flex-col gap-2">
                         <label className="text-sm font-semibold text-slate-300">1. Nhập URL hình ảnh</label>
                        <div className="flex gap-2">
                             <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="flex-grow bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm" />
                             <button onClick={() => { if(url) onAssign(url); }} disabled={!url.startsWith('http')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold disabled:opacity-50">Gán</button>
                        </div>
                    </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-300">2. Để AI chọn ảnh từ thư viện</label>
                        <button onClick={handleAiSelect} disabled={isLoading || !manifest} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading ? 'Đang suy diễn...' : <><Icons.SparklesIcon className="w-5 h-5"/> AI Chọn Ảnh</>}
                        </button>
                     </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col">
                    <h4 className="text-lg font-semibold text-slate-300 mb-2 flex-shrink-0">3. Chọn thủ công từ thư viện</h4>
                    {!manifest ? <p>Đang tải thư viện...</p> : (
                        <div className="flex-1 overflow-y-auto styled-scrollbar grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {manifest.images.map(image => (
                                <button key={image.fileName} onClick={() => onAssign(image.fileName)} className="aspect-square rounded-lg overflow-hidden border-2 border-slate-600 hover:border-yellow-400 transition-colors">
                                    <img src={`/assets/thienthu/${image.fileName}`} alt={image.fileName} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                 <button onClick={onClose} className="flex-shrink-0 mt-4 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded transition-colors">Đóng</button>
            </div>
        </div>,
        document.body
    );
};


// --- STATUS EFFECTS DISPLAY ---
const StatusLabel: React.FC<{ effect: StatusEffect, player: Player }> = ({ effect, player }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const labelRef = useRef<HTMLDivElement>(null);

    const typeColors: Record<StatusEffect['type'], string> = {
        'buff': 'bg-green-700/80 border border-green-500',
        'debuff': 'bg-red-700/80 border border-red-500',
        'neutral': 'bg-slate-600/80 border border-slate-400',
    };

    const colorClass = typeColors[effect.type] || 'bg-gray-700/80 border-gray-500';

    const formatStatusEffects = (effect: StatusEffect, player: Player): string => {
        if (!effect.effects) return '';
        const allEffects: string[] = [];
        const statNames: Record<string, string> = ALL_STAT_NAMES;
        
        // Percent changes
        if (effect.effects.primaryStatChangePercent) {
            for (const [key, value] of Object.entries(effect.effects.primaryStatChangePercent)) {
                if (value !== undefined && value !== 0) {
                    const name = statNames[key] || key;
                    const baseValue = player[key as keyof Player] as number;
                    const change = Math.floor(baseValue * (value / 100));
                    allEffects.push(`${name} ${change >= 0 ? '+' : ''}${change}`);
                }
            }
        }
        if (effect.effects.attributeChangePercent) {
            for (const [key, value] of Object.entries(effect.effects.attributeChangePercent)) {
                if (value !== undefined && value !== 0) {
                    const name = statNames[key] || key;
                    const baseValue = player.attributes[key as keyof PlayerAttributes];
                    const change = Math.floor(baseValue * (value / 100));
                    allEffects.push(`${name} ${change >= 0 ? '+' : ''}${change}`);
                }
            }
        }
        return allEffects.join('<br />');
    };

    const effectsHtml = formatStatusEffects(effect, player);


    return (
        <>
            <div
                ref={labelRef}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(p => !p)}
            >
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-transform hover:scale-105 ${colorClass} text-white`}>
                    <span className="text-xs font-semibold whitespace-nowrap">{effect.name}</span>
                </div>
            </div>
            <SmartTooltip 
                target={labelRef.current} 
                show={showTooltip}
                className="w-64 p-3 text-left text-sm bg-slate-900 border border-yellow-500/50 rounded-lg shadow-xl z-50"
            >
                <p className="font-bold text-yellow-300">{effect.name} <span className="text-xs text-slate-400">({effect.duration === -1 ? 'Vĩnh viễn' : `Còn ${effect.duration} lượt`})</span></p>
                <p className="text-xs text-slate-300 mt-1">{effect.description}</p>
                {effectsHtml && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                        <p className="text-xs font-semibold text-green-300 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: effectsHtml }} />
                    </div>
                )}
            </SmartTooltip>
        </>
    );
}

export const StatusEffectsDisplay: React.FC<{ effects: StatusEffect[], player: Player }> = ({ effects, player }) => {
    if (!effects || effects.length === 0) {
        return <p className="text-sm text-slate-400 italic px-4">Không có trạng thái đặc biệt.</p>;
    }

    return (
        <div className="flex flex-wrap gap-2 p-2">
            {effects.map(effect => <StatusLabel key={effect.id} effect={effect} player={player}/>)}
        </div>
    );
}


// --- QUEST PANEL ---
interface QuestPanelContentProps {
    quests: Quest[];
}
export const QuestPanelContent: React.FC<QuestPanelContentProps> = ({ quests }) => {
    const mainQuests = quests.filter(q => q.type === 'Cốt truyện' && q.status === 'Đang tiến hành');
    const sideQuests = quests.filter(q => q.type === 'Phụ' && q.status === 'Đang tiến hành');
    const sectQuests = quests.filter(q => q.type === 'Môn phái' && q.status === 'Đang tiến hành');

    const renderQuest = (q: Quest) => (
        <div key={q.id} className="p-3 bg-slate-800/50 rounded-md mb-2 border border-slate-700/50">
            <p className={`font-bold ${
                q.type === 'Cốt truyện' ? 'text-yellow-300' :
                q.type === 'Phụ' ? 'text-cyan-300' :
                'text-green-300'
            }`}>{q.title} <span className="text-xs font-normal">({q.type})</span></p>
            <p className="italic text-slate-300 text-sm mt-1">{q.description}</p>
            <div className="text-xs text-slate-400 mt-2">
                <p>Thời hạn: {q.timeLimit != null ? `Còn ${q.timeLimit} lượt` : '∞'}</p>
                {(q.progress !== undefined && q.target !== undefined) && <p>Tiến độ: {q.progress || 0}/{q.target}</p>}
            </div>
            {q.rewards && (
                <div className="text-xs text-green-300 mt-2 pt-2 border-t border-slate-700/50">
                    <strong>Thưởng:</strong> {q.rewards.description}
                </div>
            )}
            {q.penalties && (
                <div className="text-xs text-red-300 mt-1">
                    <strong>Phạt:</strong> {q.penalties.description}
                </div>
            )}
        </div>
    );

    return (
         <div className="flex-grow p-2 sm:p-4 space-y-4 text-sm styled-scrollbar overflow-y-auto min-h-0">
            <div>
                <h4 className="text-lg font-bold text-yellow-200 mb-2">Cốt Truyện</h4>
                {mainQuests.length > 0 ? mainQuests.map(renderQuest) : <p className="text-sm text-slate-400 italic">Không có nhiệm vụ cốt truyện nào.</p>}
            </div>
            <div className="mt-3">
                <h4 className="text-lg font-bold text-cyan-200 mb-2">Nhiệm Vụ Phụ</h4>
                {sideQuests.length > 0 ? sideQuests.map(renderQuest) : <p className="text-sm text-slate-400 italic">Không có nhiệm vụ phụ nào.</p>}
            </div>
             <div className="mt-3">
                <h4 className="text-lg font-bold text-green-200 mb-2">Nhiệm Vụ Môn Phái</h4>
                {sectQuests.length > 0 ? sectQuests.map(renderQuest) : <p className="text-sm text-slate-400 italic">Không có nhiệm vụ môn phái nào.</p>}
            </div>
        </div>
    );
};

// --- CHARACTER PANEL ---
interface CharacterPanelContentProps {
    gameState: GameState;
    onOpenSimulator: () => void;
}
export const CharacterPanelContent: React.FC<CharacterPanelContentProps> = ({ gameState, onOpenSimulator }) => {
    const { player, inventory } = gameState;
    const effectiveAttributes = useMemo(() => {
        const attributes = { ...player.attributes };
        player.statusEffects.forEach(effect => {
            if (effect.effects?.attributeChangePercent) {
                for (const [key, value] of Object.entries(effect.effects.attributeChangePercent)) {
                    if(value !== undefined) {
                        const baseValue = player.attributes[key as keyof PlayerAttributes];
                        const change = Math.floor(baseValue * (value / 100));
                        attributes[key as keyof PlayerAttributes] += change;
                    }
                }
            }
        });
        return attributes;
    }, [player.attributes, player.statusEffects]);

    const totalExpPerTurn = useMemo(() => {
        let total = 0;
        const equippedTechnique = inventory.find(i => i.id === player.equippedTechniqueId);
        const equippedTreasure = inventory.find(i => i.id === player.equippedTreasureId);

        if (equippedTechnique && equippedTechnique.expPerTurn) {
            total += equippedTechnique.expPerTurn;
        }
        if (equippedTreasure && equippedTreasure.expPerTurn) {
            total += equippedTreasure.expPerTurn;
        }
        
        return total;
    }, [inventory, player.equippedTechniqueId, player.equippedTreasureId]);

    const parsedLinhCan = useMemo(() => {
        return player.linhCan.replace(' linh căn', '').trim() as LinhCanQuality;
    }, [player.linhCan]);

    const parsedNguHanh = useMemo(() => {
        const result: Record<NguHanhType, number> = { kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0 };
        if (!player.nguHanh || player.nguHanh === 'Không có') return result;
        const matches = player.nguHanh.matchAll(/(\w+)\s\((\d+)%\)/g);
        for (const match of matches) {
            const type = match[1].toLowerCase() as NguHanhType;
            const percentage = parseInt(match[2], 10);
            if (result.hasOwnProperty(type)) {
                result[type] = percentage / 20;
            }
        }
        return result;
    }, [player.nguHanh]);

    const renderAttribute = (attr: keyof PlayerAttributes) => {
        const isPercent = attr === 'critChance' || attr === 'critDamage';
        const baseValue = player.attributes[attr];
        const effectiveValue = effectiveAttributes[attr];
        const change = effectiveValue - baseValue;

        return (
             <div key={attr} className="flex justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-slate-300">{PLAYER_ATTRIBUTE_NAMES[attr]}</span>
                <div className="font-semibold text-white flex items-center gap-2">
                    {change !== 0 && (
                        <span className={`text-xs ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                           ({change > 0 ? '+' : ''}{change})
                        </span>
                    )}
                    <span>{effectiveValue}{isPercent ? '%' : ''}</span>
                </div>
            </div>
        );
    }

    return (
         <div className="flex-grow flex flex-col p-4 space-y-4 text-sm styled-scrollbar overflow-y-auto min-h-0">
            <div>
                <h3 className="text-lg font-semibold text-yellow-300">Thông Tin Tu Luyện</h3>
                 <p><strong>Độ khó:</strong> {player.difficulty}</p>
                 <p><strong>Môn Phái:</strong> {player.sect || "Tán tu"}</p>
                 <div className="mt-4">
                    <LinhCanSelector value={parsedLinhCan} onChange={() => {}} displayOnly />
                </div>
                 <div className="mt-4 pointer-events-none">
                     <NguHanhSelector value={parsedNguHanh} onChange={() => {}} linhCanQuality={parsedLinhCan} />
                 </div>
            </div>

            <div className="md:hidden pt-3 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-yellow-300 mb-1">Trạng thái</h3>
                <StatusEffectsDisplay effects={player.statusEffects} player={player}/>
            </div>
             
             {player.selectedDestinyIds && player.selectedDestinyIds.length > 0 && (
                <div className="pt-3 border-t border-slate-700">
                    <h3 className="text-lg font-semibold text-yellow-300 mb-2">Tiên Thiên Khí Vận</h3>
                    <div className="flex flex-wrap gap-2">
                        {player.selectedDestinyIds.map(id => {
                            const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
                            if (!destiny) return null;
                            return <DestinyLabel key={id} destiny={destiny} />;
                        })}
                    </div>
                </div>
             )}

            <div className="pt-3 border-t border-slate-700">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-yellow-300">Thuộc tính chi tiết</h3>
                    <button onClick={onOpenSimulator} className="flex items-center gap-2 text-sm bg-cyan-600/80 hover:bg-cyan-700 text-white font-semibold px-3 py-1 rounded-md transition-colors">
                        <ScaleIcon className="w-4 h-4" />
                        Diễn Thiên Kính
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {Object.keys(player.attributes).map(key => renderAttribute(key as keyof PlayerAttributes))}
                     <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-300">Kinh nghiệm/lượt</span>
                        <div className="font-semibold text-white flex items-center gap-2">
                            <span className="text-green-400">+{totalExpPerTurn}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-3 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-yellow-300">Danh Vọng</h3>
                {Object.keys(player.reputation).length > 0 ? Object.entries(player.reputation).map(([faction, value]) => (
                    <p key={faction}><strong>{faction}:</strong> <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>{value}</span></p>
                )) : <p>Chưa có danh vọng.</p>}
            </div>
        </div>
    );
}

const formatDestinyEffects = (effects?: DestinyDefinition['effects']): string => {
    if (!effects) return '';
    const allEffects: string[] = [];
    const statNames: Record<string, string> = ALL_STAT_NAMES;

    if (effects.primaryStatChange) {
        for (const [key, value] of Object.entries(effects.primaryStatChange)) {
            if (value !== undefined && value !== 0) {
                const name = statNames[key] || key;
                allEffects.push(`${name} ${value > 0 ? '+' : ''}${value}`);
            }
        }
    }
    if (effects.attributeChange) {
        for (const [key, value] of Object.entries(effects.attributeChange)) {
            if (value !== undefined && value !== 0) {
                const name = statNames[key] || key;
                allEffects.push(`${name} ${value > 0 ? '+' : ''}${value}`);
            }
        }
    }

    return allEffects.join('<br />');
};

export const DestinyLabel: React.FC<{ destiny: import('../types').DestinyDefinition }> = ({ destiny }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const labelRef = useRef<HTMLDivElement>(null);

    const rankColors: Record<number, string> = {
        1: 'bg-slate-600/80 border-slate-400', 
        2: 'bg-green-700/80 border-green-500', 
        3: 'bg-sky-700/80 border-sky-500', 
        4: 'bg-purple-700/80 border-purple-500', 
        5: 'bg-orange-600/80 border-orange-400', 
        6: 'bg-red-700/80 border-red-500',
    };
    
    const colorClass = rankColors[destiny.rank] || 'bg-gray-700/80 border-gray-500';
    const effectsHtml = formatDestinyEffects(destiny.effects);

    return (
        <>
            <div
                ref={labelRef}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(p => !p)}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-transform hover:scale-105 ${colorClass} text-white`}
            >
                <span className="text-xs font-semibold whitespace-nowrap">{destiny.name}</span>
            </div>
            <SmartTooltip 
                target={labelRef.current} 
                show={showTooltip}
                className="w-64 p-3 text-left text-sm bg-slate-900 border border-yellow-500/50 rounded-lg shadow-xl z-50"
            >
                <p className="font-bold text-yellow-300">{destiny.name}</p>
                <p className="text-xs text-slate-300 mt-1">{destiny.description}</p>
                {effectsHtml && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                        <p className="text-xs font-semibold text-green-300 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: effectsHtml }} />
                    </div>
                )}
            </SmartTooltip>
        </>
    );
};

// --- LOCATION PANEL ---
export const LocationPanelContent: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    const { player, worldData } = gameState;
    const currentLocation = worldData.locations.find(l => l.id === player.currentLocationId);
    const currentProvince = currentLocation ? worldData.provinces.find(p => p.id === currentLocation.provinceId) : null;
    const currentWorldRegion = currentProvince ? worldData.worldRegions.find(wr => wr.id === currentProvince.worldRegionId) : null;

    if (!currentLocation) {
        return <div className="p-4 text-slate-400 italic">Vị trí không xác định.</div>;
    }

    return (
        <div className="space-y-4 text-sm">
            {currentWorldRegion && (
                <div>
                    <h4 className="font-bold text-yellow-300 flex items-center gap-2 text-base">
                        <Icons.SparklesIcon className="w-4 h-4"/> Đại Vực
                    </h4>
                    <div className="pl-6 mt-1">
                        <p className="text-slate-200 font-semibold">{currentWorldRegion.name}</p>
                        <p className="text-slate-400 text-xs italic">{currentWorldRegion.description}</p>
                    </div>
                </div>
            )}
            {currentProvince && (
                <div>
                    <h4 className="font-bold text-cyan-300 flex items-center gap-2 text-base">
                        <Icons.MapIcon className="w-4 h-4"/> Châu Lục
                    </h4>
                    <div className="pl-6 mt-1">
                        <p className="text-slate-200 font-semibold">{currentProvince.name}</p>
                        <p className="text-slate-400 text-xs italic">{currentProvince.description}</p>
                    </div>
                </div>
            )}
            <div>
                <h4 className="font-bold text-green-300 flex items-center gap-2 text-base">
                    <Icons.HomeIcon className="w-4 h-4"/> Khu Vực
                </h4>
                <div className="pl-6 mt-1 space-y-2">
                    <p className="text-slate-200 font-semibold">{currentLocation.name}</p>
                    <p className="text-slate-400 text-xs italic">{currentLocation.description}</p>
                    <div className="text-xs flex flex-wrap gap-x-4 gap-y-1">
                        {currentLocation.type && <p><strong>Loại hình:</strong> {currentLocation.type}</p>}
                        {currentLocation.safetyLevel && <p><strong>An toàn:</strong> {currentLocation.safetyLevel}</p>}
                        {currentLocation.sovereignty && <p><strong>Chủ quyền:</strong> {currentLocation.sovereignty}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- SECT PANEL ---
interface SectPanelContentProps {
    player: Player;
    isLoading: boolean;
    handleLeaveSect: () => void;
    handlePlayerAction: (action: string) => void;
}
export const SectPanelContent: React.FC<SectPanelContentProps> = ({ player, isLoading, handleLeaveSect, handlePlayerAction }) => {
    const [activeSectTab, setActiveSectTab] = useState(player.sect ? 'quanLy' : 'danhSach');
    const [activeSectManagementTab, setActiveSectManagementTab] = useState('chinhDien');
    const currentSectDetails = player.sect ? SECTS.find(s => s.name === player.sect) : null;
    
    React.useEffect(() => {
        if (!player.sect) {
            setActiveSectTab('danhSach');
        }
    }, [player.sect]);

    const renderSectList = () => (
        <div className="p-4 space-y-4 text-sm">
            <p className="text-center font-semibold">{player.sect ? `Đạo hữu là thành viên của ${player.sect}.` : 'Đạo hữu hiện là Tán tu, tự do tự tại.'}</p>
            <p className="text-center text-xs text-slate-400">Gia nhập môn phái sẽ mở ra nhiều cơ duyên mới. Hãy tìm kiếm kỳ ngộ trong lúc du ngoạn giang hồ.</p>
            <div className="pt-2 border-t border-slate-700 space-y-3">
                <h4 className="font-bold text-yellow-300">Các thế lực lớn:</h4>
                {SECTS.map(sect => (
                    <div key={sect.id} className="p-2 bg-slate-800/30 rounded-md">
                        <p><strong>{sect.name}</strong> <span className={`text-xs ${sect.alignment === 'Chính Đạo' ? 'text-green-400' : sect.alignment === 'Ma Đạo' ? 'text-red-400' : 'text-gray-400'}`}>({sect.alignment})</span></p>
                        <p className="text-xs italic text-slate-400">{sect.description}</p>
                        <p className="text-xs mt-1"><strong>Điều kiện:</strong> {sect.joinRequirement}</p>
                    </div>
                ))}
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
                            <h3 className="text-base font-bold text-yellow-300">{currentSectDetails.name}</h3>
                            <p className="text-xs italic text-slate-400">{currentSectDetails.description}</p>
                            <div>
                                <p><strong>Cống hiến:</strong> <span className="text-cyan-300">{player.sectContribution || 0}</span></p>
                                <p className="mt-1"><strong>Lợi ích:</strong></p>
                                <ul className="list-disc list-inside text-xs">
                                    {currentSectDetails.benefits.map((b, i) => <li key={i}>{b}</li>)}
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


// --- DONG PHU PANEL ---
interface DongPhuPanelProps {
    dongPhu: GameState['dongPhu'];
    inventoryCounts: Record<string, number>;
    isLoading: boolean;
    handleUpgradeBuilding: (building: DongPhuBuilding) => void;
    handlePlayerAction: (action: string) => void;
}
export const DongPhuPanel: React.FC<DongPhuPanelProps> = ({ dongPhu, inventoryCounts, isLoading, handleUpgradeBuilding, handlePlayerAction }) => {
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

// --- INVENTORY PANEL ---
const EffectLabel: React.FC<{ effectId: string }> = ({ effectId }) => {
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

const getRankColor = (rank?: number) => {
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
    return `/assets/thienthu/${imageId}`;
};

interface InventoryPanelProps {
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
}
export const InventoryPanel: React.FC<InventoryPanelProps> = (props) => {
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

// --- HETHONG PANEL ---
interface HeThongPanelContentProps {
    gameState: GameState;
    isLoading: boolean;
    handlePlayerAction: (action: string) => void;
}
export const HeThongPanelContent: React.FC<HeThongPanelContentProps> = ({ gameState, isLoading, handlePlayerAction }) => {
    const activeQuests = gameState.heThong.quests.filter(q => q.status === 'Đang tiến hành');

    if (activeQuests.length === 0) {
        return <p className="text-sm text-slate-400 italic p-4">Không có nhiệm vụ Hệ Thống nào.</p>;
    }

    return (
        <div className="flex-grow p-2 sm:p-4 space-y-3 text-sm styled-scrollbar overflow-y-auto min-h-0">
            {activeQuests.map(q => (
                <div key={q.id} className="p-3 bg-cyan-900/40 rounded-md border border-cyan-700/50">
                    <p className="font-bold text-cyan-300">{q.title} <span className="text-xs font-normal">({q.type})</span></p>
                    <p className="italic text-slate-300 text-xs mt-1">{q.description}</p>
                    {q.hiddenObjective && !q.hiddenObjective.completed && (
                        <p className="text-xs mt-2 text-purple-300 bg-purple-900/30 p-1 rounded-sm">Mục tiêu ẩn: ???</p>
                    )}
                     {q.hiddenObjective && q.hiddenObjective.completed && (
                        <p className="text-xs mt-2 text-green-300 bg-green-900/30 p-1 rounded-sm">Đã hoàn thành mục tiêu ẩn!</p>
                    )}
                    <div className="text-xs text-slate-400 mt-2">
                        <p>Thời hạn: {q.timeLimit != null ? `Còn ${q.timeLimit} lượt` : 'Vĩnh viễn'}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};


interface HeThongPanelProps {
    gameState: GameState;
    isLoading: boolean;
    handlePlayerAction: (action: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}
export const HeThongPanel: React.FC<HeThongPanelProps> = ({ gameState, isLoading, handlePlayerAction, isCollapsed, onToggleCollapse }) => {
    if (gameState.player.heThongStatus !== 'active') {
        return null;
    }

    if (isCollapsed) {
        return (
            <div 
                onClick={onToggleCollapse}
                className="relative flex-shrink-0 w-20 h-20 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 flex items-center justify-center cursor-pointer group hover:border-cyan-400/80 transition-all duration-300 ease-in-out"
                title="Hệ Thống"
                aria-label="Mở rộng bảng Hệ Thống"
            >
                <CpuChipIcon className="w-10 h-10 text-cyan-300 group-hover:text-cyan-100 transition-colors" />
            </div>
        );
    }
    
    return (
        <Panel title="Hệ Thống" icon={<CpuChipIcon />} className="w-full md:w-[500px]" contentNoOverflow isCollapsed={isCollapsed} onToggle={onToggleCollapse}>
             <div className="flex flex-col h-full min-h-0">
                 <div className="p-3 border-b border-slate-700/50">
                    <p className="text-sm font-semibold">Điểm Hệ Thống: <span className="font-bold text-cyan-300">{gameState.player.heThongPoints}</span></p>
                 </div>
                 <HeThongPanelContent gameState={gameState} isLoading={isLoading} handlePlayerAction={handlePlayerAction} />
             </div>
        </Panel>
    );
};

interface SectPanelProps {
    player: Player;
    isLoading: boolean;
    handleLeaveSect: () => void;
    handlePlayerAction: (action: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}
export const SectPanel: React.FC<SectPanelProps> = ({ player, isLoading, handleLeaveSect, handlePlayerAction, isCollapsed, onToggleCollapse }) => {
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
                player={player} 
                isLoading={isLoading}
                handleLeaveSect={handleLeaveSect}
                handlePlayerAction={handlePlayerAction}
            />
        </Panel>
    );
};

// --- NEWLY ADDED COMPONENTS ---

// Management Panel
interface ManagementPanelContentProps {
    gameState: GameState;
    onRulesChange: (type: 'thienDao' | 'ai' | 'coreMemory', rules: Rule[]) => void;
    onJournalChange: (journal: JournalEntry[]) => void;
    onScenarioUpdate: (updates: { summary?: string; stages?: ScenarioStage[] }) => void;
    handleSaveGame: () => void;
    handleLoadGame: (file: File) => void;
    handleGoHome: () => void;
    handleClearApiKey: () => void;
}

const EditableList = ({ title, items, onUpdate, onAdd, onDelete, itemDisplay = 'text' }: { title: string, items: any[], onUpdate: (id: string, text: string) => void, onAdd: (text: string) => void, onDelete: (id: string) => void, itemDisplay?: 'text' | 'journal' }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [newItemText, setNewItemText] = useState('');

    const handleEditStart = (item: any) => {
        setEditingId(item.id);
        setEditText(item.text);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditText('');
    };

    const handleConfirmUpdate = (id: string) => {
        if (!editText.trim()) return;
        onUpdate(id, editText);
        handleEditCancel();
    };

    const handleConfirmAdd = () => {
        if (!newItemText.trim()) return;
        onAdd(newItemText);
        setNewItemText('');
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-lg font-bold text-yellow-300 mb-2">{title} ({items.length})</h3>
            <div className="flex-1 space-y-2 overflow-y-auto styled-scrollbar pr-2 min-h-0">
                {items.map((item) => (
                    <div key={item.id} className="p-2 bg-slate-900/50 rounded-md border border-slate-700/50 flex items-start gap-2">
                        {editingId === item.id ? (
                            <div className="flex-grow flex flex-col gap-2">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full h-24 bg-slate-900 border border-slate-600 rounded-md px-2 py-1 text-sm text-white focus:outline-none ring-1 ring-yellow-500"
                                    autoFocus
                                />
                                <div className="flex items-center gap-2 self-end">
                                    <button onClick={() => handleConfirmUpdate(item.id)} className="p-1 text-green-400 hover:bg-slate-700 rounded-full"><CheckIcon className="w-5 h-5"/></button>
                                    <button onClick={handleEditCancel} className="p-1 text-gray-400 hover:bg-slate-700 rounded-full"><XIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex-grow">
                                    {itemDisplay === 'text' && <span className="text-sm">{item.text}</span>}
                                    {itemDisplay === 'journal' && <span className="text-sm"><strong className="text-yellow-300">Lượt {item.turn}:</strong> {item.text}</span>}
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    <button onClick={() => handleEditStart(item)} className="p-1 text-cyan-400 hover:bg-slate-700 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => onDelete(item.id)} className="p-1 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="pt-2 mt-2 border-t border-slate-700/50 flex items-center gap-2">
                <input
                    type="text"
                    value={newItemText}
                    onChange={e => setNewItemText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleConfirmAdd()}
                    placeholder="Thêm mục mới..."
                    className="flex-grow bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                />
                <button onClick={handleConfirmAdd} className="p-2 text-green-400 hover:bg-slate-700 rounded-full"><PlusCircleIcon className="w-6 h-6"/></button>
            </div>
        </div>
    );
};


export const ManagementPanelContent: React.FC<ManagementPanelContentProps> = ({
    gameState, onRulesChange, onJournalChange, onScenarioUpdate, handleSaveGame, handleLoadGame, handleGoHome, handleClearApiKey
}) => {
    const [activeTab, setActiveTab] = useState('thaoTac');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleLoadGame(file);
        }
    };

    const tabs = [
        { id: 'thaoTac', label: 'Thao Tác Game' },
        { id: 'thienDao', label: 'Luật Thiên Đạo' },
        { id: 'ai', label: 'Luật AI' },
        { id: 'coreMemory', label: 'Bộ Nhớ Cốt Lõi' },
        { id: 'nhatKy', label: 'Nhật Ký' },
    ];

    return (
        <div className="flex-grow flex flex-col styled-scrollbar min-h-0">
            <div className="flex-shrink-0 flex border-b border-slate-700 overflow-x-auto styled-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 p-2 text-xs font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="p-4 text-sm overflow-y-auto styled-scrollbar flex-1">
                {activeTab === 'thaoTac' && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-yellow-300">Thao Tác Game</h3>
                            <p className="text-xs text-slate-400">Lưu tiến trình, tải file đã lưu, hoặc quay về trang chủ.</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={handleSaveGame} className="px-3 py-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 rounded">Lưu Game</button>
                                <button onClick={handleLoadClick} className="px-3 py-1.5 text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 rounded">Tải Game</button>
                                <button onClick={handleGoHome} className="px-3 py-1.5 text-sm font-semibold bg-red-800 hover:bg-red-700 rounded">Về Trang Chủ</button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json,application/json" className="hidden" />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-700">
                             <h3 className="text-lg font-bold text-yellow-300">Quản lý API Key</h3>
                             <p className="text-xs text-slate-400">Xóa API Key hiện tại để nhập lại một key mới.</p>
                             <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={handleClearApiKey} className="px-3 py-1.5 text-sm font-semibold bg-red-600 hover:bg-red-700 rounded">Xóa và Đổi API Key</button>
                             </div>
                        </div>
                    </div>
                )}
                {activeTab === 'thienDao' && (
                     <EditableList
                        title="Luật Thiên Đạo"
                        items={gameState.thienDaoRules}
                        onUpdate={(id, text) => onRulesChange('thienDao', gameState.thienDaoRules.map(r => r.id === id ? { ...r, text } : r))}
                        onAdd={text => onRulesChange('thienDao', [...gameState.thienDaoRules, { id: `td_${Date.now()}`, text }])}
                        onDelete={id => onRulesChange('thienDao', gameState.thienDaoRules.filter(r => r.id !== id))}
                    />
                )}
                {activeTab === 'ai' && (
                    <EditableList
                        title="Luật AI"
                        items={gameState.aiRules}
                        onUpdate={(id, text) => onRulesChange('ai', gameState.aiRules.map(r => r.id === id ? { ...r, text } : r))}
                        onAdd={text => onRulesChange('ai', [...gameState.aiRules, { id: `ai_${Date.now()}`, text }])}
                        onDelete={id => onRulesChange('ai', gameState.aiRules.filter(r => r.id !== id))}
                    />
                )}
                {activeTab === 'coreMemory' && (
                    <EditableList
                        title="Bộ Nhớ Cốt Lõi"
                        items={gameState.coreMemoryRules}
                        onUpdate={(id, text) => onRulesChange('coreMemory', gameState.coreMemoryRules.map(r => r.id === id ? { ...r, text } : r))}
                        onAdd={text => onRulesChange('coreMemory', [...gameState.coreMemoryRules, { id: `cm_${Date.now()}`, text }])}
                        onDelete={id => onRulesChange('coreMemory', gameState.coreMemoryRules.filter(r => r.id !== id))}
                    />
                )}
                {activeTab === 'nhatKy' && (
                    <EditableList
                        title="Nhật Ký"
                        items={[...gameState.journal].reverse()}
                        itemDisplay="journal"
                        onUpdate={(id, text) => onJournalChange(gameState.journal.map(j => j.id === id ? { ...j, text } : j))}
                        onAdd={text => onJournalChange([...gameState.journal, { id: `j_${Date.now()}`, turn: gameState.turnCounter, text }])}
                        onDelete={id => onJournalChange(gameState.journal.filter(j => j.id !== id))}
                    />
                )}
            </div>
        </div>
    );
};


// Thien Thu Panel
interface ThienThuPanelContentProps {
    thienThu: GameState['thienThu'];
    onItemImageChange: (itemType: 'vatPhamTieuHao' | 'trangBi' | 'phapBao' | 'congPhap', itemId: string, imageId: string) => void;
}

export const ThienThuPanelContent: React.FC<ThienThuPanelContentProps> = ({ thienThu, onItemImageChange }) => {
    const [activeTab, setActiveTab] = useState('vatPhamTieuHao');
    const [assignmentModalState, setAssignmentModalState] = useState<{ isOpen: boolean; item: any | null; itemType: 'vatPhamTieuHao' | 'trangBi' | 'phapBao' | 'congPhap' | null }>({ isOpen: false, item: null, itemType: null });
    
    const handleAssignImage = (imageId: string) => {
        if (assignmentModalState.item && assignmentModalState.itemType) {
            onItemImageChange(assignmentModalState.itemType, assignmentModalState.item.id, imageId);
        }
        setAssignmentModalState({ isOpen: false, item: null, itemType: null });
    };

    const renderItemList = (items: (InitialItem | InitialCongPhap)[], itemType: 'vatPhamTieuHao' | 'trangBi' | 'phapBao' | 'congPhap') => (
        <div className="p-4 space-y-2">
            {items.map(item => (
                <details key={item.id} className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
                    <summary className="flex items-center gap-3 cursor-pointer">
                        <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden relative group">
                             <img src={getImageUrl(item.imageId)} alt={item.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                             <button onClick={(e) => { e.stopPropagation(); setAssignmentModalState({ isOpen: true, item: item, itemType: itemType }); }}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PencilIcon className="w-6 h-6 text-white"/>
                            </button>
                        </div>
                        <div>
                            <strong className={getRankColor(item.rank)}>{item.name}</strong>
                            <p className="italic text-slate-400 text-xs mt-1">{item.description}</p>
                        </div>
                    </summary>
                     <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs space-y-2">
                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                             <div>
                                <strong className="text-slate-400">Thuộc tính:</strong>
                                <ul className="list-disc list-inside pl-2">
                                    {Object.entries(item.attributes).map(([key, value]) => (
                                        <li key={key}>{PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes]}: <span className="text-green-300">+{value as number}</span></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {item.effectIds && item.effectIds.length > 0 && (
                            <div>
                                <strong className="text-slate-400">Hiệu ứng:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {item.effectIds.map(id => <EffectLabel key={id} effectId={id} />)}
                                </div>
                            </div>
                        )}
                    </div>
                </details>
            ))}
        </div>
    );

    return (
        <div className="flex-grow flex flex-col styled-scrollbar overflow-y-auto min-h-0 relative">
            <ImageAssignmentModal
                isOpen={assignmentModalState.isOpen}
                onClose={() => setAssignmentModalState({ isOpen: false, item: null, itemType: null })}
                item={assignmentModalState.item}
                onAssign={handleAssignImage}
            />
            <div className="flex-shrink-0 flex border-b border-slate-700">
                <button onClick={() => setActiveTab('vatPhamTieuHao')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeTab === 'vatPhamTieuHao' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Vật phẩm</button>
                <button onClick={() => setActiveTab('trangBi')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeTab === 'trangBi' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Trang bị</button>
                <button onClick={() => setActiveTab('phapBao')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeTab === 'phapBao' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Pháp bảo</button>
                <button onClick={() => setActiveTab('congPhap')} className={`flex-1 p-2 text-xs font-semibold transition-colors ${activeTab === 'congPhap' ? 'bg-slate-700/50 text-yellow-200' : 'text-slate-300 hover:bg-slate-700/30'}`}>Công pháp</button>
            </div>
            {activeTab === 'vatPhamTieuHao' && renderItemList(thienThu.vatPhamTieuHao, 'vatPhamTieuHao')}
            {activeTab === 'trangBi' && renderItemList(thienThu.trangBi, 'trangBi')}
            {activeTab === 'phapBao' && renderItemList(thienThu.phapBao, 'phapBao')}
            {activeTab === 'congPhap' && renderItemList(thienThu.congPhap, 'congPhap')}
        </div>
    );
};
