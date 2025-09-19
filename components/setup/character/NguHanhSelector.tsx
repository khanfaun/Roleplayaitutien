import React, { useMemo } from 'react';
import type { LinhCanQuality, NguHanhType } from '../../../types';

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
