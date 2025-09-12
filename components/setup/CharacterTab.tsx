import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { LinhCanQuality, NguHanhType, GameDifficulty, DestinyDefinition, InitialSect, CultivationTier } from '../../types';
import { XIcon } from '../Icons';
import { SmartTooltip } from '../SmartTooltip';
import { ALL_STAT_NAMES } from '../../constants';

const linhCanOptions: {
    value: LinhCanQuality;
    label: string;
    orbClass: string;
    glowClass: string;
}[] = [
    { value: 'Thiên Linh Căn', label: 'Thiên', orbClass: 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white', glowClass: 'shadow-yellow-400/50' },
    { value: 'Địa Linh Căn', label: 'Địa', orbClass: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white', glowClass: 'shadow-purple-500/50' },
    { value: 'Huyền Linh Căn', label: 'Huyền', orbClass: 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white', glowClass: 'shadow-cyan-400/50' },
    { value: 'Phàm Linh Căn', label: 'Phàm', orbClass: 'bg-gradient-to-br from-emerald-400 to-green-600 text-white', glowClass: 'shadow-emerald-400/50' },
    { value: 'Ngụy Linh Căn', label: 'Ngụy', orbClass: 'bg-gradient-to-br from-slate-500 to-gray-700 text-white', glowClass: 'shadow-slate-500/50' },
];

export const LinhCanSelector = ({ value, onChange, displayOnly = false }: { value: LinhCanQuality, onChange: (newValue: LinhCanQuality) => void, displayOnly?: boolean }) => {
    const optionsToShow = displayOnly ? linhCanOptions.filter(option => option.value === value) : linhCanOptions;
    
    return (
        <div>
            <label className="block text-sm font-medium text-yellow-300 mb-2">Phẩm Chất Linh Căn</label>
            <div className={`flex ${displayOnly ? 'justify-center' : 'justify-around'} items-center gap-2 p-2 bg-slate-900/50 rounded-lg`}>
                {optionsToShow.map(option => {
                    // In displayOnly mode, the single item shown is always the selected one.
                    // This simplifies the logic and makes it robust even if the value prop has a subtle issue
                    // that passes the filter but fails a direct comparison for styling.
                    const isSelected = displayOnly || value === option.value;
                    
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => !displayOnly && onChange(option.value)}
                            className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform ${
                                isSelected
                                    ? 'scale-110 opacity-100' 
                                    : 'scale-90 opacity-60 hover:opacity-100 hover:scale-100'
                            }`}
                            title={option.value}
                            disabled={displayOnly}
                        >
                            <div className={`absolute inset-0 rounded-full ${option.orbClass} ${ isSelected ? `shadow-lg ${option.glowClass}` : ''} transition-all`}></div>
                            <span className="relative text-lg font-semibold">{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export const NguHanhSelector = ({ value, onChange, linhCanQuality }: { value: Record<NguHanhType, number>, onChange: (newValue: Record<NguHanhType, number>) => void, linhCanQuality: LinhCanQuality }) => {
    
    const elementLimit = useMemo(() => {
        switch(linhCanQuality) {
            case 'Thiên Linh Căn': return 1;
            case 'Địa Linh Căn': return 2;
            case 'Huyền Linh Căn': return 3;
            case 'Phàm Linh Căn': return 4;
            case 'Ngụy Linh Căn': return 5;
            default: return 5;
        }
    }, [linhCanQuality]);

    const elements: { type: NguHanhType, name: string, icon: string, color: string }[] = [
        { type: 'hoa', name: 'Hỏa', icon: '🔥', color: '#ef4444' },
        { type: 'tho', name: 'Thổ', icon: '⛰️', color: '#d97706' },
        { type: 'kim', name: 'Kim', icon: '⚙️', color: '#9ca3af' },
        { type: 'thuy', name: 'Thủy', icon: '💧', color: '#3b82f6' },
        { type: 'moc', name: 'Mộc', icon: '🌳', color: '#22c55e' },
    ];

    const handlePointSet = (type: NguHanhType, point: number) => {
        const newValue = { ...value };
        const originalValue = value[type] || 0;
        const nextValue = point === originalValue ? point - 1 : point;
        newValue[type] = nextValue;
    
        let activeElements = Object.entries(newValue).filter(([_, v]) => v > 0);
        
        // Enforce element count limit
        if (activeElements.length > elementLimit) {
            // Find elements to potentially remove (not the one we just changed)
            const candidatesForRemoval = elements
                .map(e => e.type)
                .filter(t => t !== type && (newValue[t] || 0) > 0);
            
            // Remove candidates until the limit is met
            let overflow = activeElements.length - elementLimit;
            for (let i = 0; i < overflow && i < candidatesForRemoval.length; i++) {
                newValue[candidatesForRemoval[i]] = 0;
            }
        }
    
        // Enforce total ticks limit
        let currentTotalTicks = Object.values(newValue).reduce((sum, v) => sum + v, 0);
        while (currentTotalTicks > 5) {
            // Reduce from the element that wasn't just clicked and has the most points
            let maxTicks = -1;
            let typeToReduce: NguHanhType | null = null;
            for (const t of elements.map(e => e.type)) {
                if (t === type) continue;
                if ((newValue[t] || 0) > maxTicks) {
                    maxTicks = newValue[t] as number;
                    typeToReduce = t;
                }
            }
            
            if (typeToReduce && (newValue[typeToReduce] || 0) > 0) {
                newValue[typeToReduce]--;
            } else { // Fallback to reducing the clicked element if others can't be reduced
                if ((newValue[type] || 0) > 0) {
                    newValue[type]--;
                } else {
                    break; // Should not happen
                }
            }
            currentTotalTicks--;
        }
        
        onChange(newValue);
    };


    const size = 240;
    const center = size / 2;
    const radius = size / 2 - 40;
    const numLevels = 5;

    const dataPoints = useMemo(() => {
        const getPointCoords = (index: number, pointValue: number) => {
            const angle = (Math.PI / 180) * (index * (360 / 5) - 90);
            const pointRadius = (pointValue / numLevels) * radius;
            return {
                x: center + pointRadius * Math.cos(angle),
                y: center + pointRadius * Math.sin(angle)
            };
        }
        
        const getPointCoordsString = (coords: {x: number, y: number}) => `${coords.x},${coords.y}`;

        // Get all active elements with their original index
        const activeElements = elements
            .map((el, index) => ({ ...el, index, value: value[el.type] || 0 }))
            .filter(el => el.value > 0);

        const centerPointString = `${center},${center}`;

        if (activeElements.length === 0) {
            return '';
        }

        if (activeElements.length === 1) {
            const el = activeElements[0];
            const pointCoords = getPointCoords(el.index, el.value);
            
            // Create a very thin triangle for fill effect. It's subtle but makes it a shape.
            const angle = (Math.PI / 180) * (el.index * (360 / 5) - 90);
            const smallOffset = 0.5; // A very small offset to create a base at the center
            const p2 = {
                x: center + smallOffset * Math.cos(angle + Math.PI / 2),
                y: center + smallOffset * Math.sin(angle + Math.PI / 2)
            };
            const p3 = {
                x: center + smallOffset * Math.cos(angle - Math.PI / 2),
                y: center + smallOffset * Math.sin(angle - Math.PI / 2)
            };
            
            return [getPointCoordsString(pointCoords), getPointCoordsString(p2), getPointCoordsString(p3)].join(' ');
        }
        
        if (activeElements.length === 2) {
            // A triangle from center to the two points.
            const p1 = getPointCoordsString(getPointCoords(activeElements[0].index, activeElements[0].value));
            const p2 = getPointCoordsString(getPointCoords(activeElements[1].index, activeElements[1].value));
            return [centerPointString, p1, p2].join(' ');
        }

        // For 3 or more points, connect them directly to form a polygon.
        const activePoints = activeElements.map(el => getPointCoordsString(getPointCoords(el.index, el.value)));
        return activePoints.join(' ');

    }, [value, center, radius, elements]);


    const getCheckboxTransform = (textAnchor: 'start' | 'middle' | 'end', groupX: number, groupY: number) => {
        let xOffset = 0;
        if (textAnchor === 'middle') {
            xOffset = -28;
        } else if (textAnchor === 'end') {
            xOffset = -56;
        }
        return `translate(${xOffset}, 8)`;
    };
    
    return (
        <div>
            <label className="block text-sm font-medium text-yellow-300 mb-2">Tỉ Lệ Ngũ Hành (Tối đa {elementLimit} hệ)</label>
            <div className="flex items-center justify-center -mt-2">
                <svg width="100%" height="240" viewBox={`0 0 ${size} ${size}`}>
                    <defs>
                        <radialGradient id="radarGradient">
                            <stop offset="0%" stopColor="rgba(252, 211, 77, 0.6)" />
                            <stop offset="100%" stopColor="rgba(252, 211, 77, 0.1)" />
                        </radialGradient>
                    </defs>
                    <g className="radar-grid">
                        {/* Concentric pentagons */}
                        {Array.from({ length: numLevels }).map((_, i) => {
                            const levelRadius = radius * ((i + 1) / numLevels);
                            const levelPoints = elements.map((el, j) => {
                                const angle = (Math.PI / 180) * (j * (360 / 5) - 90);
                                return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
                            }).join(' ');
                            return <polygon key={i} points={levelPoints} fill="none" stroke="rgba(246, 211, 101, 0.15)" />;
                        })}
                        {/* Axes */}
                        {elements.map((el, i) => {
                             const angle = (Math.PI / 180) * (i * (360 / 5) - 90);
                             const x2 = center + radius * Math.cos(angle);
                             const y2 = center + radius * Math.sin(angle);
                            return <line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke="rgba(246, 211, 101, 0.15)" />
                        })}
                    </g>
                    {/* Data polygon */}
                    {dataPoints && <polygon points={dataPoints} fill="url(#radarGradient)" stroke="rgba(252, 211, 77, 1)" strokeWidth="2" />}

                    {/* Labels and clickable points */}
                    {elements.map((el, i) => {
                        const angle = (Math.PI / 180) * (i * (360 / 5) - 90);
                        const labelRadius = radius + 25; // Increased space for checkboxes
                        const groupX = center + labelRadius * Math.cos(angle);
                        const groupY = center + labelRadius * Math.sin(angle);
                        
                        let textAnchor: "start" | "middle" | "end" = "middle";
                        if (groupX < center - 10) textAnchor = "end";
                        if (groupX > center + 10) textAnchor = "start";

                        const checkboxTransform = getCheckboxTransform(textAnchor, groupX, groupY);

                        return (
                             <g key={el.type} className="group" transform={`translate(${groupX}, ${groupY})`}>
                                <text
                                    x={0}
                                    y={-8}
                                    dominantBaseline="middle"
                                    textAnchor={textAnchor}
                                    className="select-none cursor-pointer"
                                    onClick={() => handlePointSet(el.type, (value[el.type] || 0) + 1)}
                                >
                                    <tspan 
                                        className="text-sm font-semibold fill-white group-hover:fill-yellow-300 transition-all"
                                    >
                                        {el.icon}{el.name} ({(value[el.type] || 0) * 20}%)
                                    </tspan>
                                </text>
                                <g transform={checkboxTransform}>
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        const pointValue = i + 1;
                                        const isFilled = (value[el.type] || 0) >= pointValue;
                                        return (
                                            <rect
                                                key={i}
                                                x={i * 12}
                                                y={-4}
                                                width={8}
                                                height={8}
                                                rx={2}
                                                className={`cursor-pointer transition-all ${isFilled ? 'fill-yellow-400' : 'fill-slate-600 group-hover:fill-slate-500'}`}
                                                onClick={() => handlePointSet(el.type, pointValue)}
                                            />
                                        );
                                    })}
                                </g>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

const DestinySelector: React.FC<{selectedIds: string[], onChange: (ids: string[]) => void, destinyDefs: Record<string, DestinyDefinition>}> = ({ selectedIds, onChange, destinyDefs }) => {
    const MAX_POINTS = 100;
    const destinies = Object.values(destinyDefs);
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredDestiny, setHoveredDestiny] = useState<DestinyDefinition | null>(null);
    const [hoveredTarget, setHoveredTarget] = useState<HTMLElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const spentPoints = selectedIds.reduce((total, id) => {
        const destiny = destinies.find(d => d.id === id);
        return total + (destiny?.cost || 0);
    }, 0);
    
    const remainingPoints = MAX_POINTS - spentPoints;

    const handleSelect = (id: string, cost: number) => {
        if (spentPoints + cost <= MAX_POINTS) {
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

    const selectedDestinies = selectedIds.map(id => destinies.find(d => d.id === id)).filter(Boolean);
    const availableDestinies = destinies.filter(d => !selectedIds.includes(d.id));

    return (
        <div className="pt-4 border-t border-slate-700/50">
            <h3 className="text-lg font-medium text-yellow-300 mb-2">Tiên Thiên Khí Vận (Điểm còn lại: <span className="text-xl font-bold">{remainingPoints}</span>)</h3>
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
                                const canAfford = remainingPoints >= destiny.cost;
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

interface CharacterTabProps {
    playerName: string; setPlayerName: (value: string) => void;
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
    playerName, setPlayerName, playerAge, setPlayerAge, playerBiography, setPlayerBiography, playerGoals, setPlayerGoals,
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
                    <div>
                        <label htmlFor="player-name" className="block text-sm font-medium text-yellow-300 mb-1">Tên Nhân Vật</label>
                        <input id="player-name" type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Ví dụ: Vương Lâm, Hàn Lập..." className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
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
                        <label htmlFor="player-age" className="block text-sm font-medium text-yellow-300 mb-1">Tuổi Khởi Đầu</label>
                        <input id="player-age" type="number" value={playerAge} onChange={(e) => setPlayerAge(parseInt(e.target.value, 10) || 16)} min="1" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
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
                                    <option key={sect.id} value={sect.id}>{sect.name}</option>
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