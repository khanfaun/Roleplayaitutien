

import React, { useState, useRef, useMemo } from 'react';
import type { GameState, PlayerAttributes, LinhCanQuality, NguHanhType, DestinyDefinition } from '../../types';
import { PLAYER_ATTRIBUTE_NAMES, ALL_STAT_NAMES } from '../../constants';
import { ScaleIcon } from '../Icons';
import { SmartTooltip } from '../SmartTooltip';
import { DESTINY_DEFINITIONS } from '../../data/effects';
// FIX: Corrected import paths for LinhCanSelector and NguHanhSelector.
import { LinhCanSelector } from '../setup/character/LinhCanSelector';
import { NguHanhSelector } from '../setup/character/NguHanhSelector';
import { StatusEffectsDisplay } from './StatusEffectsDisplay';

const formatDestinyEffects = (effects?: DestinyDefinition['effects']): string => {
    if (!effects) return '';
    const allEffects: string[] = [];
    const statNames: Record<string, string> = ALL_STAT_NAMES;

    if (effects.primaryStatChange) {
        for (const [key, value] of Object.entries(effects.primaryStatChange)) {
            if (value !== undefined && value !== 0) {
                const name = statNames[key] || key;
                allEffects.push(`${name} ${(value as number) > 0 ? '+' : ''}${value}`);
            }
        }
    }
    if (effects.attributeChange) {
        for (const [key, value] of Object.entries(effects.attributeChange)) {
            if (value !== undefined && value !== 0) {
                const name = statNames[key] || key;
                allEffects.push(`${name} ${(value as number) > 0 ? '+' : ''}${value}`);
            }
        }
    }

    return allEffects.join('<br />');
};

export const DestinyLabel: React.FC<{ destiny: DestinyDefinition }> = ({ destiny }) => {
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

export const CharacterPanelContent: React.FC<{ gameState: GameState; onOpenSimulator: () => void; }> = ({ gameState, onOpenSimulator }) => {
    const { player, inventory } = gameState;
    const effectiveAttributes = useMemo(() => {
        const attributes = { ...player.attributes };
        player.statusEffects.forEach(effect => {
            if (effect.effects?.attributeChangePercent) {
                for (const [key, value] of Object.entries(effect.effects.attributeChangePercent)) {
                    if(value !== undefined) {
                        const baseValue = player.attributes[key as keyof PlayerAttributes];
// FIX: Cast value to number to fix arithmetic operation error.
                        const change = Math.floor(baseValue * ((value as number) / 100));
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
