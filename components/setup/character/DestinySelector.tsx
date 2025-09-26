import React, { useState, useRef, useEffect } from 'react';
import type { DestinyDefinition } from '../../../types';
import { XIcon } from '../../Icons';
import { SmartTooltip } from '../../SmartTooltip';
import { ALL_STAT_NAMES } from '../../../constants';

const DestinySelector: React.FC<{selectedIds: string[], onChange: (ids: string[]) => void, destinyDefs: Record<string, DestinyDefinition>}> = ({ selectedIds, onChange, destinyDefs }) => {
    const MAX_POINTS = 100;
    const MAX_DESTINIES = 3;
    const destinies = Object.values(destinyDefs);
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredDestiny, setHoveredDestiny] = useState<DestinyDefinition | null>(null);
    const [hoveredTarget, setHoveredTarget] = useState<HTMLElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const spentPoints = selectedIds.reduce((total, id) => {
        // FIX: Ensure destiny is not undefined before accessing cost
        const destiny = destinies.find(d => d.id === id);
        return total + (destiny?.cost || 0);
    }, 0);
    
    const remainingPoints = MAX_POINTS - spentPoints;

    const handleSelect = (id: string, cost: number) => {
        if (selectedIds.length < MAX_DESTINIES && spentPoints + cost <= MAX_POINTS) {
            onChange([...selectedIds, id]);
        }
    };
    
    const handleRemove = (id: string) => {
        onChange(selectedIds.filter(i => i !== id));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wrapperRef]);

    const rankTagStyles: Record<number, { container: string, closeButton: string }> = {
        1: { container: 'bg-slate-600 text-white', closeButton: 'text-slate-200 hover:text-white' },
        2: { container: 'bg-green-700 text-white', closeButton: 'text-green-200 hover:text-white' },
        3: { container: 'bg-sky-700 text-white', closeButton: 'text-sky-200 hover:text-white' },
        4: { container: 'bg-purple-700 text-white', closeButton: 'text-purple-200 hover:text-white' },
        5: { container: 'bg-orange-600 text-white', closeButton: 'text-orange-200 hover:text-white' },
        6: { container: 'bg-red-700 text-white', closeButton: 'text-red-200 hover:text-white' },
    };
    const defaultTagStyle = { container: 'bg-gray-700 text-white', closeButton: 'text-gray-200 hover:text-white' };
    
    const rankButtonStyles: Record<number, string> = {
        1: 'border-slate-400 bg-slate-700/50 hover:bg-slate-700/80',
        2: 'border-green-500 bg-green-800/50 hover:bg-green-800/80',
        3: 'border-sky-500 bg-sky-800/50 hover:bg-sky-800/80',
        4: 'border-purple-500 bg-purple-800/50 hover:bg-purple-800/80',
        5: 'border-orange-400 bg-orange-800/50 hover:bg-orange-800/80',
        6: 'border-red-500 bg-red-800/50 hover:bg-red-800/80',
    };

    const formatDestinyEffects = (effects?: DestinyDefinition['effects']): string => {
        if (!effects) return 'Không có hiệu ứng đặc biệt.';
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

        if (allEffects.length === 0) return 'Không có hiệu ứng đặc biệt.';
        return allEffects.join('<br />');
    };
    
    // FIX: Used a type guard to ensure TypeScript correctly infers the type of `destiny` after filtering.
    const selectedDestinies = selectedIds.map(id => destinies.find(d => d.id === id)).filter((d): d is DestinyDefinition => !!d);
    const availableDestinies = destinies.filter(d => !selectedIds.includes(d.id));

    return (
        <div className="pt-4 border-t border-slate-700/50">
            <h3 className="text-lg font-medium text-yellow-300 mb-2">Tiên Thiên Khí Vận (Đã chọn: {selectedIds.length}/{MAX_DESTINIES} | Điểm còn lại: <span className="text-xl font-bold">{remainingPoints}</span>)</h3>
            <div ref={wrapperRef} className="relative">
                <div className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white flex flex-wrap gap-2 min-h-[42px] cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    {selectedDestinies.length === 0 && <span className="text-gray-400">Chọn khí vận...</span>}
                    {selectedDestinies.map(destiny => {
                        const style = rankTagStyles[destiny.rank] || defaultTagStyle;
                        return (
                            <div
                                key={destiny.id}
                                onMouseEnter={(e) => { setHoveredDestiny(destiny); setHoveredTarget(e.currentTarget); }}
                                onMouseLeave={() => { setHoveredDestiny(null); setHoveredTarget(null); }}
                                className={`flex items-center gap-1.5 ${style.container} text-xs font-semibold px-2 py-1 rounded`}
                            >
                                <span>{destiny.name}</span>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(destiny.id); }} className={`${style.closeButton} rounded-full hover:bg-black/20`}>
                                    <XIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        );
                    })}
                </div>
                {isOpen && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-slate-700 border border-slate-600 rounded-lg shadow-lg p-2 max-h-60 overflow-y-auto styled-scrollbar">
                        <div className="flex flex-wrap gap-2">
                            {availableDestinies.map(destiny => {
                                const canAfford = remainingPoints >= destiny.cost && selectedIds.length < MAX_DESTINIES;
                                return (
                                    <div
                                        key={destiny.id}
                                        onMouseEnter={(e) => { setHoveredDestiny(destiny); setHoveredTarget(e.currentTarget); }}
                                        onMouseLeave={() => { setHoveredDestiny(null); setHoveredTarget(null); }}
                                        className="inline-flex"
                                    >
                                        <button
                                            type="button"
                                            disabled={!canAfford}
                                            onClick={() => handleSelect(destiny.id, destiny.cost)}
                                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-all duration-200 border-2 ${rankButtonStyles[destiny.rank]} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <span className="text-xs font-semibold whitespace-nowrap">{destiny.name}</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            <SmartTooltip 
                target={hoveredTarget}
                show={!!hoveredDestiny}
                className="w-64 p-3 text-left text-sm bg-slate-900 border border-yellow-500/50 rounded-lg shadow-xl z-50"
            >
                {hoveredDestiny && (
                    <>
                        <p className="font-bold text-yellow-300">{hoveredDestiny.name} <span className="text-sm text-slate-400">({hoveredDestiny.cost} điểm)</span></p>
                        <p className="text-xs text-slate-300 mt-1">{hoveredDestiny.description}</p>
                        <div className="mt-2 pt-2 border-t border-slate-700">
                            <p className="text-xs font-semibold text-green-300 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: formatDestinyEffects(hoveredDestiny.effects) }} />
                        </div>
                    </>
                )}
            </SmartTooltip>
        </div>
    );
};

export { DestinySelector };