import React from 'react';
import type { CultivationTier, GameDifficulty } from '../../types';
import { Selector, DestinySelector, StatusEffectSelector } from './SimulatorSelectorControls';
import type { SimulationSelection } from '../RealmStatsSimulator';

interface SetupColumnProps {
    selection: SimulationSelection | null;
    setSelection: React.Dispatch<React.SetStateAction<SimulationSelection | null>>;
    title: string;
    cultivationSystem: CultivationTier[];
    lockSelectors?: boolean;
    hideExtraSelectors?: boolean;
}

export const SetupColumn: React.FC<SetupColumnProps> = ({ selection, setSelection, title, cultivationSystem, lockSelectors = false, hideExtraSelectors = false }) => {
    if (!selection) return null;

    const { tierId, majorId, minorId, qualityRank, difficulty, destinyIds, statusEffectIds } = selection;

    const selectedTier = cultivationSystem.find(t => t.id === tierId);
    const selectedMajor = selectedTier?.realms.find(m => m.id === majorId);
    const minorOpts = selectedMajor?.minorRealms.filter(m => !m.isHidden) || [];
    const qualityOpts = selectedMajor?.qualities || [];

    const handleMajorRealmChange = (value: string) => {
        const [newTierId, newMajorId] = value.split(';');
        const newTier = cultivationSystem.find(t => t.id === newTierId);
        const newMajor = newTier?.realms.find(m => m.id === newMajorId);
        const newMinorOpts = newMajor?.minorRealms.filter(m => !m.isHidden) || [];
        const newMinorId = newMinorOpts[0]?.id || '';
        const newQualityOpts = newMajor?.qualities || [];

        setSelection(p => p ? {
            ...p,
            tierId: newTierId,
            majorId: newMajorId,
            minorId: newMinorId,
            qualityRank: newQualityOpts[0]?.rank || 1,
        } : null);
    };

    const handleSelectionChange = (field: keyof SimulationSelection, value: any) => {
        setSelection(prev => prev ? {...prev, [field]: value} : null);
    };
    
    return (
        <div className={`w-full ${hideExtraSelectors ? 'md:w-full' : 'md:w-1/2'} p-4 flex flex-col gap-2`}>
            <h3 className="font-semibold text-yellow-200 text-center text-lg">{title}</h3>
            <Selector
                label="Đại Cảnh Giới"
                value={`${tierId};${majorId}`}
                onChange={e => handleMajorRealmChange(e.target.value)}
                disabled={lockSelectors}
            >
                {cultivationSystem.map(tier => (
                    <optgroup key={tier.id} label={tier.name}>
                        {tier.realms.map(m => <option key={m.id} value={`${tier.id};${m.id}`}>{m.name}</option>)}
                    </optgroup>
                ))}
            </Selector>
            <Selector label="Tiểu Cảnh Giới" value={minorId} onChange={e => handleSelectionChange('minorId', e.target.value)} disabled={lockSelectors}>
                {minorOpts.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Selector>
            <Selector label="Phẩm chất" value={qualityRank} onChange={e => handleSelectionChange('qualityRank', Number(e.target.value))} disabled={lockSelectors || qualityOpts.length === 0}>
                {qualityOpts.length > 0 ? qualityOpts.map(q => <option key={q.id} value={q.rank}>{q.name}</option>) : <option value={1}>Không có</option>}
            </Selector>
            <Selector label="Độ khó" value={difficulty} onChange={e => handleSelectionChange('difficulty', e.target.value as GameDifficulty)} disabled={lockSelectors}>
                {['Cực dễ', 'Dễ', 'Bình thường', 'Khó', 'Cực khó'].map(d => <option key={d} value={d}>{d}</option>)}
            </Selector>
            {!hideExtraSelectors && (
                <>
                    <DestinySelector selectedIds={destinyIds} onChange={ids => handleSelectionChange('destinyIds', ids)} disabled={lockSelectors} />
                    <StatusEffectSelector selectedIds={statusEffectIds} onChange={ids => handleSelectionChange('statusEffectIds', ids)} disabled={lockSelectors} />
                </>
            )}
        </div>
    );
};
