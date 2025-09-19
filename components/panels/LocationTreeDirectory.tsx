import React, { useState, useRef, useEffect } from 'react';
import type { GameState, WorldLocation, InitialSect } from '../../types';
import * as Icons from '../Icons';
import { SmartTooltip } from '../SmartTooltip';

// Helper to get sect name, including parent sect if it's a branch
const getSectDisplayName = (sect: InitialSect, allSects: InitialSect[]): string => {
    if (sect.parentSectId) {
        const parentSect = allSects.find(s => s.id === sect.parentSectId);
        if (parentSect) {
            return `${parentSect.name} (${sect.name})`;
        }
    }
    return sect.name;
};

const LOCATION_TYPE_COLORS: Record<string, string> = {
    'Quần Cư': 'bg-sky-600 text-white',
    'Tự Nhiên': 'bg-emerald-600 text-white',
    'Tài Nguyên': 'bg-yellow-600 text-black',
    'Đặc Biệt': 'bg-purple-600 text-white',
    'Di Tích Cổ': 'bg-amber-700 text-white',
    'Bí Cảnh': 'bg-cyan-500 text-white',
    'Nguy Hiểm': 'bg-red-600 text-white',
};

const LocationLabel: React.FC<{ text: string, colors: string }> = ({ text, colors }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${colors}`}>{text}</span>
);

const getImageUrl = (imageId: string | undefined) => {
    if (!imageId) return null;
    if (imageId.startsWith('http')) return imageId;
    return `/assets/thienthu/${imageId}`;
};


const LocationNodeDisplay: React.FC<{
    location: WorldLocation;
    allLocations: WorldLocation[];
    allSects: InitialSect[];
    currentId: string;
    isLast: boolean;
}> = ({ location, allLocations, allSects, currentId, isLast }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const children = allLocations.filter(l => l.parentId === location.id);
    const isCurrent = currentId === location.id;
    const sectsAtThisLocation = allSects.filter(s => s.locationId === location.id);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                nodeRef.current && !nodeRef.current.contains(event.target as Node) &&
                tooltipRef.current && !tooltipRef.current.contains(event.target as Node)
            ) {
                setIsTooltipVisible(false);
            }
        };

        if (isTooltipVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isTooltipVisible]);

    const controllingSectNames = (location.controllingSectIds || [])
        .map(id => allSects.find(s => s.id === id))
        .filter((s): s is InitialSect => !!s)
        .map(s => getSectDisplayName(s, allSects));

    const sovereigntyLabel = location.sovereigntyType === 'dependent' ? 'Kiểm soát' : 'Đại diện';
    const controlText = controllingSectNames.length > 0 ? `${sovereigntyLabel}: ${controllingSectNames.join(', ')}` : null;

    const TooltipContent = () => (
        <div className="w-80 max-w-xs p-3 bg-slate-900 border border-yellow-500/50 rounded-lg shadow-xl text-white flex flex-col gap-2">
            <div className="flex items-start gap-3">
                <div className="w-16 h-16 flex-shrink-0 bg-slate-700 rounded-md overflow-hidden relative group">
                    {getImageUrl(location.imageId) ? <img src={getImageUrl(location.imageId)!} alt={location.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><Icons.MapIcon className="w-8 h-8"/></div>}
                </div>
                <div className="flex-grow">
                    <span className="font-bold text-lg text-yellow-300">{location.name}</span>
                    <span className="text-sm text-slate-400 ml-2">(Cấp {location.level})</span>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                        {controlText && <LocationLabel text={controlText} colors="bg-slate-600 text-white" />}
                        {location.type && LOCATION_TYPE_COLORS[location.type] && <LocationLabel text={location.type} colors={LOCATION_TYPE_COLORS[location.type]} />}
                    </div>
                </div>
            </div>
            <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-700/50">
                <p><strong className="text-slate-400">Mô tả:</strong> {location.description}</p>
                {location.realmRequirement && location.realmRequirement !== 'Không yêu cầu' && <p><strong className="text-slate-400">Yêu cầu cảnh giới:</strong> {location.realmRequirement}</p>}
            </div>
            {sectsAtThisLocation.length > 0 && (
                <div className="pt-2 border-t border-slate-700/50">
                    <h5 className="text-xs font-bold text-slate-400">Thế lực tại đây</h5>
                    <div className="space-y-1 mt-1">
                        {sectsAtThisLocation.map(sect => (
                            <div key={sect.id} className="p-1.5 bg-slate-700/30 rounded text-xs">
                                <span className={sect.alignment === 'Chính Đạo' ? 'text-green-300' : sect.alignment === 'Ma Đạo' ? 'text-red-300' : 'text-slate-300'}>
                                    {getSectDisplayName(sect, allSects)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="relative">
            <div className={`absolute top-0 left-3 w-px bg-slate-600 ${isLast ? 'h-7' : 'h-full'}`}></div>
            <div className="absolute top-7 left-3 w-4 h-px bg-slate-600"></div>
            
            <div className="pl-8 relative">
                <div 
                    ref={nodeRef}
                    className={`flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border ${isCurrent ? 'border-yellow-400' : 'border-slate-700/50'} transition-colors hover:border-yellow-300/50`}
                >
                    <button onClick={() => setIsExpanded(!isExpanded)} className="flex-shrink-0 p-1" disabled={children.length === 0}>
                        {children.length > 0 ? (isExpanded ? <Icons.ChevronDownIcon className="w-4 h-4" /> : <Icons.ChevronRightIcon className="w-4 h-4" />) : <div className="w-4 h-4"/>}
                    </button>
                    <div className="flex-grow cursor-pointer" onClick={() => setIsTooltipVisible(prev => !prev)}>
                        <span className="font-semibold">{location.name}</span>
                    </div>
                    {/* FIX: Wrap UserIcon in a div to apply the `title` attribute, as the component itself does not accept it. This resolves a TypeScript error. */}
                    {isCurrent && <div title="Vị trí hiện tại" className="flex-shrink-0"><Icons.UserIcon className="w-5 h-5 text-green-300"/></div>}
                </div>

                <SmartTooltip
                    ref={tooltipRef}
                    target={nodeRef.current}
                    show={isTooltipVisible}
                    className="z-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <TooltipContent />
                </SmartTooltip>

                {isExpanded && children.length > 0 && (
                    <div className="mt-1 pl-4 space-y-1">
                        {children.map((child, index) => (
                            <LocationNodeDisplay
                                key={child.id}
                                location={child}
                                allLocations={allLocations}
                                allSects={allSects}
                                currentId={currentId}
                                isLast={index === children.length - 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const LocationTreeDirectory: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    const { player, worldData, discoveredEntityIds } = gameState;
    const discoveredIds = new Set(discoveredEntityIds.locations);
    const visibleLocations = worldData.worldLocations.filter(loc => discoveredIds.has(loc.id));
    const rootLocations = visibleLocations.filter(loc => !loc.parentId || !discoveredIds.has(loc.parentId));

    return (
        <div className="h-full styled-scrollbar overflow-y-auto p-2">
            <div className="space-y-1">
                {rootLocations.length > 0 ? rootLocations.map((loc, index) => (
                    <LocationNodeDisplay
                        key={loc.id}
                        location={loc}
                        allLocations={visibleLocations}
                        allSects={worldData.initialSects}
                        currentId={player.currentLocationId}
                        isLast={index === rootLocations.length - 1}
                    />
                )) : (
                    <p className="text-sm text-slate-400 italic text-center py-8">Chưa khám phá được địa điểm nào.</p>
                )}
            </div>
        </div>
    );
};
