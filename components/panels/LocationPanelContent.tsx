import React, { useMemo, useState, useRef } from 'react';
import type { GameState, WorldLocation, NpcCharacter } from '../../types';
import { HomeIcon, UserIcon, ChevronRightIcon } from '../Icons';
import { getImageUrl } from './InventoryPanel';
import * as Icons from '../Icons';

const LocationNode: React.FC<{ 
    location: WorldLocation, 
    isCurrent: boolean,
    npc: NpcCharacter | undefined,
    onClick: () => void,
    hasChildren: boolean,
    discoveredIds: string[],
}> = ({ location, isCurrent, npc, onClick, hasChildren, discoveredIds }) => {
    
    const isDiscovered = discoveredIds.includes(location.id);
    const displayName = isDiscovered ? location.name : '??????';
    const isPlayerHome = location.isPlayerHome;
    const hasNpc = !!npc && isDiscovered; // Only show NPC if location is discovered

    let glowClass = '';
    if (isCurrent) {
         glowClass = 'ring-4 ring-offset-2 ring-offset-slate-900 ring-green-400 shadow-[0_0_20px_theme(colors.green.400)]';
    } else if (isPlayerHome && isDiscovered) { // Home only glows if discovered
        glowClass = 'ring-4 ring-offset-2 ring-offset-slate-900 ring-yellow-400 shadow-[0_0_20px_theme(colors.yellow.400)]';
    }
    
    const baseBorder = hasNpc ? 'border-red-500/50' : 'border-slate-400/50';
    const hoverBorder = hasChildren ? 'group-hover:border-cyan-400' : 'group-hover:border-slate-300';
    const cursorClass = hasChildren ? 'cursor-pointer' : 'cursor-default';

    return (
        <div 
            className={`absolute -translate-x-1/2 -translate-y-1/2 group ${cursorClass}`}
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
            onClick={onClick}
        >
            <div className={`relative w-10 h-10 rounded-full bg-slate-800 border-2 ${baseBorder} ${hoverBorder} flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${glowClass}`}>
                {isDiscovered ? (
                    <>
                        {hasNpc && npc?.imageId ? (
                            <img src={getImageUrl(npc.imageId)} alt={npc.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <HomeIcon className="w-6 h-6 text-slate-300"/>
                        )}
                    </>
                ) : (
                     <Icons.QuestionMarkCircleIcon className="w-8 h-8 text-slate-500" />
                )}

                {isCurrent && (
                    <div className="absolute -top-1 -right-1 animate-pulse">
                        <UserIcon className="w-5 h-5 text-green-300 bg-slate-800 rounded-full p-0.5" />
                    </div>
                )}
            </div>
             <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {displayName} {hasChildren && isDiscovered && '(...)'}
                {!isDiscovered && ' (Chưa khám phá)'}
            </div>
        </div>
    );
};


export const LocationPanelContent: React.FC<{ 
    gameState: GameState,
    setCurrentMapViewId: (id: string | null) => void;
}> = ({ gameState, setCurrentMapViewId }) => {
    const { player, worldData, inGameNpcs, currentMapViewId, discoveredEntityIds } = gameState;
    const { worldLocations } = worldData;
    
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const locationsById = useMemo(() => 
        worldLocations.reduce((acc, loc) => {
            acc[loc.id] = loc;
            return acc;
        }, {} as Record<string, WorldLocation>), 
    [worldLocations]);

    const locationsToDisplay = useMemo(() => {
        return worldLocations.filter(loc => loc.parentId === currentMapViewId && loc.x != null && loc.y != null);
    }, [worldLocations, currentMapViewId]);
    
    const npcsByLocationId = useMemo(() => 
        inGameNpcs.reduce((acc, npc) => {
            if (npc.currentLocationId) {
                acc[npc.currentLocationId] = npc;
            }
            return acc;
        }, {} as Record<string, NpcCharacter>),
    [inGameNpcs]);
    
    const breadcrumbPath = useMemo(() => {
        const path: WorldLocation[] = [];
        let currentId = currentMapViewId;
        while(currentId) {
            const currentLocation = locationsById[currentId];
            if(currentLocation) {
                path.unshift(currentLocation);
                currentId = currentLocation.parentId;
            } else {
                break;
            }
        }
        return path;
    }, [currentMapViewId, locationsById]);

    const SiblingConnectionLines = useMemo(() => {
        const lines = [];
        for (let i = 0; i < locationsToDisplay.length; i++) {
            for (let j = i + 1; j < locationsToDisplay.length; j++) {
                const loc1 = locationsToDisplay[i];
                const loc2 = locationsToDisplay[j];
                lines.push(
                    <line
                        key={`${loc1.id}-${loc2.id}`}
                        x1={`${loc1.x}%`} y1={`${loc1.y}%`}
                        x2={`${loc2.x}%`} y2={`${loc2.y}%`}
                        stroke="rgba(252, 211, 77, 0.4)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                    />
                );
            }
        }
        return lines;
    }, [locationsToDisplay]);
    
    const currentMapLocation = currentMapViewId ? locationsById[currentMapViewId] : null;
    const currentMapIsDiscovered = currentMapViewId ? discoveredEntityIds.locations.includes(currentMapViewId) : true;
    const mapBackgroundUrl = currentMapLocation?.imageId && currentMapIsDiscovered ? getImageUrl(currentMapLocation.imageId) : '/assets/map_background.jpg';
    const currentMapName = currentMapIsDiscovered ? currentMapLocation?.name : '??????';
    
    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('.cursor-pointer')) {
            return;
        }
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

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scaleAmount = 1.1;
        const { clientX, clientY } = e;
        
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const currentScale = transform.scale;
        const pointX = (mouseX - transform.x) / currentScale;
        const pointY = (mouseY - transform.y) / currentScale;

        const newScale = e.deltaY < 0 ? currentScale * scaleAmount : currentScale / scaleAmount;
        const clampedScale = Math.max(0.2, Math.min(3, newScale));

        if (clampedScale === currentScale) return;

        const newX = mouseX - pointX * clampedScale;
        const newY = mouseY - pointY * clampedScale;
        
        setTransform({ scale: clampedScale, x: newX, y: newY });
    };

    const handleZoomButtons = (direction: 'in' | 'out') => {
        if (!containerRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        const centerX = width / 2;
        const centerY = height / 2;

        const scaleAmount = 1.2;
        const currentScale = transform.scale;
        const pointX = (centerX - transform.x) / currentScale;
        const pointY = (centerY - transform.y) / currentScale;
        
        const newScale = direction === 'in' ? currentScale * scaleAmount : currentScale / scaleAmount;
        const clampedScale = Math.max(0.2, Math.min(3, newScale));

        if (clampedScale === currentScale) return;

        const newX = centerX - pointX * clampedScale;
        const newY = centerY - pointY * clampedScale;

        setTransform({ scale: clampedScale, x: newX, y: newY });
    };

    return (
        <div className="w-full h-full bg-slate-900 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 p-2 bg-slate-900/50 border-b border-slate-700 flex items-center text-sm font-semibold flex-wrap">
                <button onClick={() => setCurrentMapViewId(null)} className="text-slate-300 hover:text-yellow-300 transition-colors">Bản đồ Thế giới</button>
                {breadcrumbPath.map(loc => {
                    const isDiscovered = discoveredEntityIds.locations.includes(loc.id);
                    return (
                        <React.Fragment key={loc.id}>
                            <ChevronRightIcon className="w-4 h-4 text-slate-500 mx-1 flex-shrink-0"/>
                            <button onClick={() => setCurrentMapViewId(loc.id)} className="text-slate-300 hover:text-yellow-300 transition-colors truncate">{isDiscovered ? loc.name : '??????'}</button>
                        </React.Fragment>
                    )
                })}
            </div>
            <div 
                ref={containerRef}
                className="flex-1 min-h-0 relative overflow-hidden bg-slate-900"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            >
                <div 
                    className="w-full h-full"
                    style={{ 
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        transformOrigin: '0 0'
                    }}
                >
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                        style={{ backgroundImage: `url('${mapBackgroundUrl}')` }}
                    >
                        <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                           {SiblingConnectionLines}
                        </svg>

                        {locationsToDisplay.map(location => {
                            const hasChildren = worldLocations.some(l => l.parentId === location.id);
                            return (
                                 <LocationNode 
                                    key={location.id}
                                    location={location}
                                    isCurrent={player.currentLocationId === location.id}
                                    npc={npcsByLocationId[location.id]}
                                    hasChildren={hasChildren}
                                    onClick={() => {
                                        if(hasChildren) {
                                            setCurrentMapViewId(location.id)
                                        }
                                    }}
                                    discoveredIds={discoveredEntityIds.locations}
                                />
                            )
                        })}
                    </div>
                </div>
                
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <button onClick={() => handleZoomButtons('in')} className="w-8 h-8 flex items-center justify-center bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-md text-xl font-bold transition-colors" aria-label="Phóng to">+</button>
                    <button onClick={() => handleZoomButtons('out')} className="w-8 h-8 flex items-center justify-center bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-md text-xl font-bold transition-colors" aria-label="Thu nhỏ">-</button>
                </div>

                 {locationsToDisplay.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="p-4 bg-black/50 rounded-lg text-center">
                            <h3 className="text-lg font-semibold text-slate-200">{currentMapName || 'Thế giới'}</h3>
                            <p className="text-sm text-slate-400 mt-1">Không có địa điểm con nào tại đây.</p>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};