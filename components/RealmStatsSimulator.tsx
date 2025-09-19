import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { CultivationTier, GameDifficulty, PlayerAttributes, Player } from '../types';
import { getFinalBuff } from '../utils/buffMultipliers';
import { PLAYER_ATTRIBUTE_NAMES, INITIAL_PLAYER_STATS, ALL_STAT_NAMES } from '../constants';
import { XIcon, ScaleIcon } from './Icons';
import { DESTINY_DEFINITIONS, STATUS_EFFECT_DEFINITIONS } from '../data/effects';
import { SetupColumn } from './simulator/SetupColumn';
import { ComparisonStatRow } from './simulator/ComparisonStatRow';

const MAIN_STAT_NAMES: Record<string, string> = {
    maxHp: 'Sinh lực tối đa',
    maxExp: 'Kinh nghiệm tối đa',
    maxSpiritPower: 'Linh lực tối đa',
    maxMentalState: 'Tâm cảnh tối đa',
    maxStamina: 'Thể lực tối đa',
    lifespan: 'Tuổi thọ',
};

const ALL_STAT_NAMES_SIM = {
    ...MAIN_STAT_NAMES,
    ...PLAYER_ATTRIBUTE_NAMES,
    expPerTurn: 'Kinh nghiệm/lượt'
};

const STAT_DISPLAY_ORDER = [
    'maxHp', 'maxSpiritPower', 'maxStamina', 'maxMentalState', 'maxExp', 
    'physicalStrength', 'magicPower', 'bodyStrength', 'defense', 'agility', 
    'spiritualSense', 'aptitude', 'critChance', 'critDamage',
    'expPerTurn'
];


interface RealmStatsSimulatorProps {
    isOpen: boolean;
    onClose: () => void;
    cultivationSystem: CultivationTier[];
    currentPlayer: Player;
    isSetupMode?: boolean;
    initialSelection?: { tierId: string; majorId: string; minorId: string; } | null;
}

export interface SimulationSelection {
    tierId: string;
    majorId: string;
    minorId: string;
    qualityRank: number;
    difficulty: GameDifficulty;
    destinyIds: string[];
    statusEffectIds: string[];
}


export const RealmStatsSimulator: React.FC<RealmStatsSimulatorProps> = ({ isOpen, onClose, cultivationSystem, currentPlayer, isSetupMode = false, initialSelection = null }) => {
    const [selectionLeft, setSelectionLeft] = useState<SimulationSelection | null>(null);
    const [selectionRight, setSelectionRight] = useState<SimulationSelection | null>(null);

    const calculateExpPerTurn = useCallback((selection: SimulationSelection | null): number => {
        if (!selection) return 0;
        return selection.destinyIds.reduce((total, id) => {
            const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
            return total + (destiny?.expPerTurn || 0);
        }, 0);
    }, []);

    const calculateCleanStats = useMemo(() => (selection: SimulationSelection | null): Record<string, number> | null => {
        if (!selection) return null;
        
        const { majorId, minorId, qualityRank, difficulty, destinyIds } = selection;
        const details = cultivationSystem.flatMap(t => t.realms.map(m => ({...m, tierId: t.id, tierRank: t.rank}))).find(m => m.id === majorId);
        if (!details) return null;
        
        const minorDetails = details.minorRealms.find(m => m.id === minorId);
        if (!minorDetails) return null;

        const baseAttributes = { ...INITIAL_PLAYER_STATS.attributes };
        const basePrimary: Record<string, number> = { 
            maxHp: INITIAL_PLAYER_STATS.maxHp, maxExp: INITIAL_PLAYER_STATS.maxExp,
            maxSpiritPower: INITIAL_PLAYER_STATS.maxSpiritPower, maxStamina: INITIAL_PLAYER_STATS.maxStamina, 
            maxMentalState: INITIAL_PLAYER_STATS.maxMentalState, lifespan: INITIAL_PLAYER_STATS.lifespan,
        };
        
        destinyIds.forEach(id => {
            const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
            if (destiny?.effects?.attributeChange) {
                for (const [key, value] of Object.entries(destiny.effects.attributeChange)) {
                    if (value !== undefined) baseAttributes[key as keyof PlayerAttributes] += value;
                }
            }
            if (destiny?.effects?.primaryStatChange) {
                for (const [key, value] of Object.entries(destiny.effects.primaryStatChange)) {
                     if (value !== undefined && key in basePrimary) basePrimary[key] += value;
                }
            }
        });
        
        if (majorId === 'pham_nhan_realm_0') {
             basePrimary.maxSpiritPower = 0;
             basePrimary.maxExp = 10;
             basePrimary.lifespan = details.baseLifespan + (basePrimary.lifespan - INITIAL_PLAYER_STATS.lifespan);
             return { ...baseAttributes, ...basePrimary };
        }

        const quality = details.qualities?.find(q => q.rank === qualityRank);
        const finalAttributes: Record<string, number> = {};
        const finalPrimary: Record<string, number> = {};

        for (const key of Object.keys(baseAttributes)) {
            const mult = getFinalBuff(difficulty, 'sub', key as keyof PlayerAttributes, details.tierRank, details.rank, minorDetails.rank, quality?.rank || 1);
            finalAttributes[key] = Math.floor(baseAttributes[key as keyof PlayerAttributes] * mult);
        }
        for (const key of Object.keys(basePrimary)) {
            if (key === 'lifespan') continue;
            const mult = getFinalBuff(difficulty, 'main', key as any, details.tierRank, details.rank, minorDetails.rank, quality?.rank || 1);
            finalPrimary[key] = Math.floor(basePrimary[key] * mult);
        }

        finalPrimary.lifespan = details.baseLifespan + (quality?.lifespanBonus || 0) + (basePrimary.lifespan - INITIAL_PLAYER_STATS.lifespan);

        return { ...finalAttributes, ...finalPrimary };
    }, [cultivationSystem]);

    const initialPlayerSelectionForBonusCalc = useMemo(() => {
        if (!isOpen || !currentPlayer || isSetupMode) return null;
        
        const details = cultivationSystem.flatMap(t => t.realms.map(m => ({...m, tierId: t.id}))).find(m => m.minorRealms.some(sm => sm.id === currentPlayer.cultivationStageId));
        const quality = details?.qualities?.find(q => q.id === currentPlayer.cultivationQualityId);

        return {
            tierId: details?.tierId || cultivationSystem[0].id,
            majorId: details?.id || cultivationSystem[0].realms[0].id,
            minorId: currentPlayer.cultivationStageId,
            qualityRank: quality?.rank || 1,
            difficulty: currentPlayer.difficulty,
            destinyIds: currentPlayer.selectedDestinyIds,
            statusEffectIds: currentPlayer.statusEffects.map(e => e.id),
        };
    }, [isOpen, currentPlayer, isSetupMode, cultivationSystem]);

    const accumulatedBonuses = useMemo(() => {
        const bonuses: Record<string, number> = {};
        if (!currentPlayer || !initialPlayerSelectionForBonusCalc || isSetupMode) return bonuses;
        
        const cleanStats = calculateCleanStats(initialPlayerSelectionForBonusCalc);
        if (!cleanStats) return bonuses;

        const allStatKeys = [...Object.keys(ALL_STAT_NAMES)];
        allStatKeys.forEach(key => {
            const playerStatValue = (currentPlayer as any)[key] ?? currentPlayer.attributes[key as keyof PlayerAttributes];
            const cleanStatValue = cleanStats[key];

            if (typeof playerStatValue === 'number' && typeof cleanStatValue === 'number') {
                bonuses[key] = playerStatValue - cleanStatValue;
            }
        });
        return bonuses;
    }, [currentPlayer, initialPlayerSelectionForBonusCalc, calculateCleanStats, isSetupMode]);

    const calculateFinalStats = (selection: SimulationSelection | null) => {
        const cleanSimulatedStats = calculateCleanStats(selection);
        if (!cleanSimulatedStats) return null;
        
        const finalStats = { ...cleanSimulatedStats };

        if (!isSetupMode) {
            for (const key in accumulatedBonuses) {
                if (finalStats[key] !== undefined) {
                    finalStats[key] += accumulatedBonuses[key];
                }
            }
        }
        
        selection?.statusEffectIds.forEach(id => {
            const effect = STATUS_EFFECT_DEFINITIONS[id];
            if (effect?.effects?.attributeChangePercent) {
                for (const [key, percent] of Object.entries(effect.effects.attributeChangePercent)) {
                    if (percent) finalStats[key] += Math.floor(finalStats[key] * (percent / 100));
                }
            }
            if (effect?.effects?.primaryStatChangePercent) {
                for (const [key, percent] of Object.entries(effect.effects.primaryStatChangePercent)) {
                    if (percent) finalStats[key] += Math.floor(finalStats[key] * (percent / 100));
                }
            }
        });
        return finalStats;
    };

    const resultLeft = useMemo(() => calculateFinalStats(selectionLeft), [selectionLeft, accumulatedBonuses, calculateCleanStats, isSetupMode]);
    const resultRight = useMemo(() => calculateFinalStats(selectionRight), [selectionRight, accumulatedBonuses, calculateCleanStats, isSetupMode]);


    useEffect(() => {
        if (isOpen) {
            if(isSetupMode && initialSelection) {
                setSelectionLeft(null);
                const details = cultivationSystem.flatMap(t => t.realms.map(m => ({...m, tierId: t.id}))).find(m => m.id === initialSelection.majorId);
                const quality = details?.qualities?.[0];
                setSelectionRight({
                    tierId: initialSelection.tierId,
                    majorId: initialSelection.majorId,
                    minorId: initialSelection.minorId,
                    qualityRank: quality?.rank || 1,
                    difficulty: currentPlayer.difficulty,
                    destinyIds: currentPlayer.selectedDestinyIds,
                    statusEffectIds: [],
                });
            } else if (!isSetupMode && currentPlayer) {
                const details = cultivationSystem.flatMap(t => t.realms.map(m => ({...m, tierId: t.id}))).find(m => m.minorRealms.some(sm => sm.id === currentPlayer.cultivationStageId));
                const quality = details?.qualities?.find(q => q.id === currentPlayer.cultivationQualityId);
                const currentSelection: SimulationSelection = {
                    tierId: details?.tierId || cultivationSystem[0].id,
                    majorId: details?.id || cultivationSystem[0].realms[0].id,
                    minorId: currentPlayer.cultivationStageId,
                    qualityRank: quality?.rank || 1,
                    difficulty: currentPlayer.difficulty,
                    destinyIds: currentPlayer.selectedDestinyIds,
                    statusEffectIds: currentPlayer.statusEffects.map(e => e.id),
                };
                setSelectionLeft(currentSelection);
                
                 const mockRightSelection: SimulationSelection = {
                    tierId: details?.tierId || cultivationSystem[0].id,
                    majorId: details?.id || cultivationSystem[0].realms[0].id,
                    minorId: currentPlayer.cultivationStageId,
                    qualityRank: quality?.rank || 1,
                    difficulty: currentPlayer.difficulty,
                    destinyIds: currentPlayer.selectedDestinyIds,
                    statusEffectIds: currentPlayer.statusEffects.map(e => e.id),
                };
                setSelectionRight(mockRightSelection);
            }
        }
    }, [isOpen, isSetupMode, initialSelection, currentPlayer, cultivationSystem]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border-2 border-yellow-500 rounded-2xl shadow-2xl shadow-yellow-500/20 w-full max-w-5xl text-white transform transition-all animate-fade-in-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 px-4 py-2 border-b-2 border-yellow-500/30 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 flex items-center gap-2"><ScaleIcon className="w-6 h-6"/> Diễn Thiên Kính</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors"><XIcon className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto styled-scrollbar">
                    {!isSetupMode && (
                        <>
                            <SetupColumn selection={selectionLeft} setSelection={setSelectionLeft} title="Cảnh Giới 1" cultivationSystem={cultivationSystem} lockSelectors={false} />
                            <div className="border-b md:border-b-0 md:border-r border-slate-700/50"></div>
                        </>
                    )}
                    <SetupColumn selection={selectionRight} setSelection={setSelectionRight} title={isSetupMode ? "Mô phỏng Cảnh Giới" : "Cảnh Giới 2"} cultivationSystem={cultivationSystem} hideExtraSelectors={isSetupMode} />
                </div>
                
                {isSetupMode && resultRight && (
                    <div className="flex-shrink-0 border-t-2 border-yellow-500/30">
                        <div className="p-4 overflow-y-auto styled-scrollbar max-h-[50vh]">
                            <h3 className="text-lg font-semibold text-yellow-200 mb-3 text-center">Chỉ số mô phỏng</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                {STAT_DISPLAY_ORDER.map(key => {
                                    const isPercent = key.includes('Chance') || key.includes('Damage');
                                    const value = key === 'expPerTurn' 
                                        ? calculateExpPerTurn(selectionRight) 
                                        : (resultRight[key] === -1 ? 'Bất tử' : resultRight[key]);
                                    const label = ALL_STAT_NAMES_SIM[key as keyof typeof ALL_STAT_NAMES_SIM];
                                    return (
                                        <div key={key} className="flex justify-between p-2 bg-slate-800/50 rounded">
                                            <span className="text-slate-300">{label}</span>
                                            <span className="font-semibold text-white">{value}{isPercent && value !== 'Bất tử' ? '%' : ''}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
                {!isSetupMode && (
                    <div className="flex-shrink-0 border-t-2 border-yellow-500/30">
                        <div className="p-4 overflow-y-auto styled-scrollbar max-h-[50vh]">
                            <div className="grid grid-cols-2 items-center gap-2 py-1 px-3 bg-slate-800 rounded-t-lg">
                                <h3 className="font-bold text-yellow-200">Chỉ số</h3>
                                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 text-center text-yellow-200 font-bold">
                                    <h3>Cảnh Giới 1</h3>
                                    <span></span>
                                    <h3>Cảnh Giới 2</h3>
                                </div>
                            </div>
                            {resultLeft && resultRight ? (
                                <div className="bg-slate-800/50 rounded-b-lg">
                                    {STAT_DISPLAY_ORDER.map(key => {
                                        const isPercent = key.includes('Chance') || key.includes('Damage');
                                        const valueLeft = key === 'expPerTurn' ? calculateExpPerTurn(selectionLeft) : resultLeft[key];
                                        const valueRight = key === 'expPerTurn' ? calculateExpPerTurn(selectionRight) : resultRight[key];
                                        const label = ALL_STAT_NAMES_SIM[key as keyof typeof ALL_STAT_NAMES_SIM];
                                        
                                        return <ComparisonStatRow key={key} label={label} valueLeft={valueLeft} valueRight={valueRight} isPercent={isPercent} />;
                                    })}
                                </div>
                            ) : <p className="text-center p-4 text-slate-400">Đang chờ tính toán...</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
