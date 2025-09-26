

import React, { useState, useRef } from 'react';
import type { StatusEffect, Player, PlayerAttributes } from '../../types';
import { ALL_STAT_NAMES } from '../../constants';
import { SmartTooltip } from '../SmartTooltip';

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
                // FIX: Added a type guard to ensure a player property is a number before performing arithmetic operations, preventing potential runtime errors and fixing the compile-time type error.
                if (value !== undefined && value !== 0) {
                    const name = statNames[key] || key;
                    const baseValue = player[key as keyof Player];
                    if (typeof baseValue === 'number') {
                        const change = Math.floor(baseValue * (value / 100));
                        allEffects.push(`${name} ${change >= 0 ? '+' : ''}${change}`);
                    }
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
        return <p className="text-sm text-slate-400 italic">Không có trạng thái đặc biệt.</p>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {effects.map(effect => <StatusLabel key={effect.id} effect={effect} player={player}/>)}
        </div>
    );
}
