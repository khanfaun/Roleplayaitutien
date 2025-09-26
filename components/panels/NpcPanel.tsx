
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { GameState, NpcCharacter, Relationship, RelationshipLevel } from '../../types';
import { getImageUrl } from './InventoryPanel';
import { MinusIcon, PlusCircleIcon as PlusIcon, UserIcon, QuestionMarkCircleIcon, XIcon } from '../Icons';

// --- NEW IMPLEMENTATION BASED ON USER SNIPPET ---

interface QuanHe {
    nhanVat1: string;
    nhanVat2: string;
    moTa: string;
}

const getEdgeColor = (description: string): string => {
    const lowerDesc = (description || '').toLowerCase();
    
    // Cấp 1: Sinh Tử Đại Địch -> Đỏ Sẫm
    if (['huyết hải', 'truy sát', 'sinh tử đại địch', 'diệt tộc', 'không đội trời chung'].some(kw => lowerDesc.includes(kw))) {
        return '#991b1b'; // red-800
    }
    // Cấp 2: Thù Địch -> Cam
    if (['thù địch', 'kẻ thù', 'đối địch', 'phản bội', 'hãm hại', 'âm mưu', 'ghen ghét'].some(kw => lowerDesc.includes(kw))) {
        return '#f97316'; // orange-500
    }
    // Cấp 3: Mâu Thuẫn / Cạnh Tranh -> Vàng
    if (['mâu thuẫn', 'đối thủ', 'cạnh tranh', 'coi thường', 'chán ghét', 'xung đột', 'gây sự'].some(kw => lowerDesc.includes(kw))) {
        return '#eab308'; // yellow-500
    }
    // Cấp 5: Đồng Minh / Tích Cực -> Xanh Ngọc
    if (['đồng minh', 'bằng hữu', 'đồng môn', 'thân hữu', 'giúp đỡ', 'cảm kích', 'tiền bối'].some(kw => lowerDesc.includes(kw))) {
        return '#22d3ee'; // cyan-400
    }
    // Cấp 6: Thân Thiết Tột Cùng -> Xanh Lá
    if (['thân thiết tột cùng', 'sư đồ', 'phu thê', 'tri kỷ', 'huynh đệ', 'gia tộc', 'sống chết', 'trung thành', 'ân nhân'].some(kw => lowerDesc.includes(kw))) {
        return '#22c55e'; // green-500
    }
    
    // Cấp 4: Trung Lập -> Trắng (Mặc định)
    return '#e2e8f0'; // slate-200
};

const Legend = () => {
    const legendItems = [
        { color: '#22c55e', label: 'Thân Thiết Tột Cùng' }, // green-500
        { color: '#22d3ee', label: 'Đồng Minh / Tích Cực' }, // cyan-400
        { color: '#e2e8f0', label: 'Trung Lập' }, // slate-200
        { color: '#eab308', label: 'Mâu Thuẫn' }, // yellow-500
        { color: '#f97316', label: 'Thù Địch' }, // orange-500
        { color: '#991b1b', label: 'Sinh Tử Đại Địch' } // red-800
    ];
    return (
        <div className="p-2 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg text-xs space-y-1">
            <h4 className="font-semibold text-slate-100 text-center">Chú giải</h4>
            {legendItems.map(item => (
                <div key={item.label} className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2 shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-400">{item.label}</span>
                </div>
            ))}
        </div>
    );
};


const RelationshipGraph: React.FC<{ relations: QuanHe[]; mainCharacterName: string | null; }> = ({ relations, mainCharacterName }) => {
    const [focusedCharacter, setFocusedCharacter] = useState<string | null>(mainCharacterName);
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setFocusedCharacter(mainCharacterName);
    }, [mainCharacterName]);

    useEffect(() => {
        const element = svgContainerRef.current;
        if (!element) return;

        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(element);
        
        return () => {
            resizeObserver.unobserve(element);
        };
    }, []);

    const { width, height } = dimensions;

    const filteredRelations = useMemo(() => {
        if (!focusedCharacter) return [];
        return relations.filter(
            rel => rel.nhanVat1 === focusedCharacter || rel.nhanVat2 === focusedCharacter
        );
    }, [relations, focusedCharacter]);

    const nodeNames = useMemo(() => {
        if (!focusedCharacter) return [];
        const names = new Set<string>([focusedCharacter]);
        filteredRelations.forEach(rel => {
            names.add(rel.nhanVat1);
            names.add(rel.nhanVat2);
        });
        return Array.from(names);
    }, [filteredRelations, focusedCharacter]);

    const nodesWithInfo = useMemo(() => {
        if (!focusedCharacter) return [];
        
        return nodeNames.map(name => {
            const isFocused = name === focusedCharacter;
            const isMain = name === mainCharacterName;
            let relationshipText = '';
            let nodeColor = isMain ? "#fcd34d" : "#94a3b8"; // yellow-300 : slate-400
    
            if (isFocused) {
                nodeColor = '#f1f5f9'; // slate-100
            } else {
                const relation = filteredRelations.find(r => 
                    (r.nhanVat1 === focusedCharacter && r.nhanVat2 === name) || 
                    (r.nhanVat1 === name && r.nhanVat2 === focusedCharacter)
                );
                if (relation) {
                    let shortDesc = (relation.moTa || '').split(/[.,(]/)[0].trim();
                    if (shortDesc.length > 25) {
                        const words = shortDesc.split(/\s+/);
                        if (words.length > 3) {
                            shortDesc = words.slice(0, 3).join(' ') + '...';
                        }
                    }
                    relationshipText = shortDesc;
                    nodeColor = getEdgeColor(relation.moTa);
                }
            }
    
            return { name, isFocused, isMain, relationshipText, nodeColor };
        });
    }, [nodeNames, filteredRelations, focusedCharacter, mainCharacterName]);

    useEffect(() => {
        if (nodeNames.length === 0 || !focusedCharacter || width === 0 || height === 0) return;

        const newPositions = new Map<string, { x: number; y: number }>();
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 80;

        newPositions.set(focusedCharacter, { x: centerX, y: centerY });

        const outerNodes = nodeNames.filter(name => name !== focusedCharacter);
        const angleStep = (2 * Math.PI) / (outerNodes.length || 1);

        outerNodes.forEach((name, i) => {
            const angle = i * angleStep - Math.PI / 2; 
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            newPositions.set(name, { x, y });
        });
        
        setNodePositions(newPositions);
    }, [nodeNames, focusedCharacter, width, height]);

    const handleZoomButtons = (direction: 'in' | 'out') => {
        const scaleAmount = 1.2;
        const currentScale = transform.scale;
        const newScale = direction === 'in' ? currentScale * scaleAmount : currentScale / scaleAmount;
        const clampedScale = Math.max(0.2, Math.min(5, newScale));
        if (clampedScale === currentScale) return;

        const centerX = width / 2;
        const centerY = height / 2;

        const newX = centerX - (centerX - transform.x) * (clampedScale / currentScale);
        const newY = centerY - (centerY - transform.y) * (clampedScale / currentScale);
        
        setTransform({ scale: clampedScale, x: newX, y: newY });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return;
        e.preventDefault();
        const x = e.clientX - panStartRef.current.x;
        const y = e.clientY - panStartRef.current.y;
        setTransform(prev => ({ ...prev, x, y }));
    };

    const handleMouseUp = () => setIsPanning(false);
    
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scaleAmount = 1.1;
        const { clientX, clientY } = e;
        
        if (!svgContainerRef.current) return;
        const rect = svgContainerRef.current.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const currentScale = transform.scale;
        const pointX = (mouseX - transform.x) / currentScale;
        const pointY = (mouseY - transform.y) / currentScale;

        const newScale = e.deltaY < 0 ? currentScale * scaleAmount : currentScale / scaleAmount;
        const clampedScale = Math.max(0.2, Math.min(5, newScale));

        if (clampedScale === currentScale) return;

        const newX = mouseX - pointX * clampedScale;
        const newY = mouseY - pointY * clampedScale;
        
        setTransform({ scale: clampedScale, x: newX, y: newY });
    };

    if (relations.length === 0) {
        return <p className="p-4 text-sm text-slate-400 italic">Chưa gặp gỡ nhân vật nào để hiển thị quan hệ.</p>;
    }
    
    return (
        <div ref={svgContainerRef} className="relative w-full h-full bg-slate-900 overflow-hidden rounded-b-xl">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-full" 
              aria-labelledby="graph-title" 
              role="img"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            >
                <title id="graph-title">Sơ đồ mối quan hệ giữa các nhân vật</title>
                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
                    {filteredRelations.map((rel, index) => {
                        const pos1 = nodePositions.get(rel.nhanVat1);
                        const pos2 = nodePositions.get(rel.nhanVat2);
                        if (!pos1 || !pos2) return null;
                        
                        return (
                            <g key={`${rel.nhanVat1}-${rel.nhanVat2}-${index}`} className="opacity-80">
                                <line x1={pos1.x} y1={pos1.y} x2={pos2.x} y2={pos2.y} stroke={getEdgeColor(rel.moTa)} strokeWidth="1.5" />
                            </g>
                        );
                    })}
                    {nodesWithInfo.map(node => {
                        const pos = nodePositions.get(node.name);
                        if (!pos) return null;
                       
                        const isCenterNode = node.name === focusedCharacter;
                        const textProps: { textAnchor: "start" | "middle" | "end", x: number, y: number } = {
                            textAnchor: 'middle',
                            x: 0,
                            y: isCenterNode ? -15 : 0,
                        };

                        if (!isCenterNode) {
                            const angle = Math.atan2(pos.y - height / 2, pos.x - width / 2);
                            const deg = angle * (180 / Math.PI);
                            if (deg > -45 && deg <= 45) { textProps.textAnchor = 'start'; textProps.x = 12; textProps.y = 5; } 
                            else if (deg > 45 && deg <= 135) { textProps.textAnchor = 'middle'; textProps.y = 22; } 
                            else if (deg > 135 || deg <= -135) { textProps.textAnchor = 'end'; textProps.x = -12; textProps.y = 5; } 
                            else { textProps.textAnchor = 'middle'; textProps.y = -15; }
                        }
                       
                        return (
                            <g key={node.name} transform={`translate(${pos.x}, ${pos.y})`} className="group" aria-label={`Xem quan hệ của ${node.name}`}>
                                <g onClick={() => setFocusedCharacter(node.name)} className="cursor-pointer">
                                    {node.isFocused && !node.isMain && ( <circle r="12" fill="#fcd34d" className="opacity-40 animate-pulse" /> )}
                                    <circle r="6" fill={node.nodeColor} stroke={node.isFocused ? "#fcd34d" : node.nodeColor} strokeWidth="2" className="group-hover:stroke-yellow-300 transition-all" />
                                    <text {...textProps} fontSize="12" className={`transition-colors fill-slate-100 group-hover:fill-yellow-300 ${node.isMain || node.isFocused ? "font-bold" : "font-normal"}`} style={{ paintOrder: 'stroke', stroke: '#0f172a', strokeWidth: '3px', strokeLinejoin: 'round' }}>
                                        {node.name}
                                        {node.relationshipText && (
                                            <tspan x={textProps.x} dy="1.2em" fontSize="9" className="fill-slate-400">{node.relationshipText}</tspan>
                                        )}
                                    </text>
                                </g>
                            </g>
                        );
                    })}
                </g>
            </svg>
            
            <div className="absolute top-4 left-4 p-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg text-left">
                <p className="text-sm text-slate-400">Đang xem quan hệ của:</p>
                <p className="font-bold text-lg text-yellow-400">{focusedCharacter || '...'}</p>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button onClick={() => handleZoomButtons('in')} className="w-8 h-8 flex items-center justify-center bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-md text-xl font-bold transition-colors" aria-label="Phóng to">+</button>
                <button onClick={() => handleZoomButtons('out')} className="w-8 h-8 flex items-center justify-center bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-md text-xl font-bold transition-colors" aria-label="Thu nhỏ">-</button>
            </div>

            <div className="absolute bottom-4 left-4 z-10">
                <Legend />
            </div>
            
            <div className="absolute bottom-4 right-4 z-10">
                {focusedCharacter && focusedCharacter !== mainCharacterName && (
                     <button onClick={() => setFocusedCharacter(mainCharacterName)} className="px-4 py-2 text-sm bg-slate-600/80 hover:bg-slate-500/80 backdrop-blur-sm text-white font-semibold rounded-lg transition-all">
                        Xem nhân vật chính
                    </button>
                )}
            </div>
        </div>
    );
};


const NpcList: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    const discoveredNpcs = useMemo(() => {
        return gameState.inGameNpcs.filter(npc => gameState.discoveredEntityIds.npcs.includes(npc.id));
    }, [gameState.inGameNpcs, gameState.discoveredEntityIds.npcs]);

    if (discoveredNpcs.length === 0) {
        return <p className="p-4 text-sm text-slate-400 italic">Chưa gặp gỡ nhân vật nào.</p>;
    }

    return (
        <div className="p-4 space-y-3 overflow-y-auto styled-scrollbar h-full">
            {discoveredNpcs.map(npc => (
                <div key={npc.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                        {npc.imageId ? (
                            <img src={getImageUrl(npc.imageId)} alt={npc.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                               <UserIcon className="w-10 h-10"/>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-yellow-300">{npc.name}</p>
                        <p className="text-sm text-cyan-400">{npc.cultivationStage}</p>
                        <p className="text-xs italic text-slate-400 mt-1">{npc.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const NpcPanelContent: React.FC<{ gameState: GameState; view: 'list' | 'graph' }> = ({ gameState, view }) => {
    const attitudeToMoTa = (attitude: number): string => {
        if (attitude > 80) return 'Thân thiết tột cùng';
        if (attitude > 30) return 'Bằng hữu, đồng minh';
        if (attitude > -30) return 'Trung lập, quen biết';
        if (attitude > -80) return 'Có mâu thuẫn';
        if (attitude > -150) return 'Thù địch';
        return 'Sinh tử đại địch';
    };

    const allRelations = useMemo(() => {
        const relations: QuanHe[] = [];
        const { player, inGameNpcs, discoveredEntityIds } = gameState;
        const discoveredNpcs = inGameNpcs.filter(npc => discoveredEntityIds.npcs.includes(npc.id));

        discoveredNpcs.forEach(npc => {
            relations.push({
                nhanVat1: player.name,
                nhanVat2: npc.name,
                moTa: attitudeToMoTa(npc.attitudeTowardsPC),
            });
        });

        discoveredNpcs.forEach(npc => {
            (npc.relationships || []).forEach(rel => {
                const targetNpc = discoveredNpcs.find(n => n.id === rel.targetNpcId);
                if (targetNpc) {
                    const exists = relations.some(r => (r.nhanVat1 === targetNpc.name && r.nhanVat2 === npc.name));
                    if (!exists) {
                        relations.push({
                            nhanVat1: npc.name,
                            nhanVat2: targetNpc.name,
                            moTa: rel.description,
                        });
                    }
                }
            });
        });

        return relations;
    }, [gameState]);

    return (
        <div className="flex-1 min-h-0 h-full">
            {view === 'list' && <NpcList gameState={gameState} />}
            {view === 'graph' && <RelationshipGraph relations={allRelations} mainCharacterName={gameState.player.name} />}
        </div>
    );
};
