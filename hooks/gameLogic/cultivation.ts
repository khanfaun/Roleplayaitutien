import type { CultivationTier, MajorRealm, MinorRealm, Player, PlayerAttributes, StatChange } from '../../types';
import { INITIAL_PLAYER_STATS, PLAYER_ATTRIBUTE_NAMES } from '../../constants';
import { DESTINY_DEFINITIONS } from '../../data/effects';
import { getFinalBuff } from '../../utils/buffMultipliers';


export const findRealmDetails = (system: CultivationTier[], stageId: string): { tier: CultivationTier, major: MajorRealm, minor: MinorRealm } | null => {
    for (const tier of system) {
        for (const major of tier.realms) {
            const minor = major.minorRealms.find(m => m.id === stageId);
            if (minor) {
                return { tier, major, minor };
            }
        }
    }
    return null;
};

export const calculateStatChanges = (oldPlayer: Player, newPlayer: Player): Record<string, StatChange> => {
    const changes: Record<string, StatChange> = {};
    const allStatNames: Record<string, string> = { ...PLAYER_ATTRIBUTE_NAMES, maxHp: 'Sinh lực tối đa', maxSpiritPower: 'Linh lực tối đa', maxMentalState: 'Tâm cảnh tối đa', maxStamina: 'Thể lực tối đa', lifespan: 'Tuổi thọ' };

    // Check primary stats
    for (const key of ['maxHp', 'maxSpiritPower', 'maxStamina', 'maxMentalState', 'lifespan']) {
        const statKey = key as keyof Player;
        if (oldPlayer[statKey] !== newPlayer[statKey]) {
            changes[allStatNames[key]] = { before: oldPlayer[statKey] as number, after: newPlayer[statKey] as number };
        }
    }

    // Check attributes
    for (const key of Object.keys(PLAYER_ATTRIBUTE_NAMES)) {
        const attrKey = key as keyof PlayerAttributes;
        if (oldPlayer.attributes[attrKey] !== newPlayer.attributes[attrKey]) {
            changes[PLAYER_ATTRIBUTE_NAMES[attrKey]] = { before: oldPlayer.attributes[attrKey], after: newPlayer.attributes[attrKey] };
        }
    }
    return changes;
};

export const updatePlayerStatsForCultivation = (playerState: Player, system: CultivationTier[], newStageId: string, newQualityId: string | null): Player => {
    const details = findRealmDetails(system, newStageId);
    if (!details) return playerState;

    const { tier, major, minor } = details;
    const newPlayer = { ...playerState };

    if (major.id === 'pham_nhan_realm_0') {
        const baseAttrs = { ...INITIAL_PLAYER_STATS.attributes };
        playerState.selectedDestinyIds.forEach(id => {
            const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
            if (destiny?.effects?.attributeChange) {
                for (const [key, value] of Object.entries(destiny.effects.attributeChange)) {
                    if (value !== undefined) baseAttrs[key as keyof PlayerAttributes] += value;
                }
            }
        });
        newPlayer.attributes = baseAttrs;
        
        newPlayer.cultivationStageId = newStageId;
        newPlayer.cultivationStage = major.name.trim();
        newPlayer.cultivationQualityId = null;
        newPlayer.cultivationQuality = null;

        newPlayer.maxHp = INITIAL_PLAYER_STATS.maxHp;
        newPlayer.maxStamina = INITIAL_PLAYER_STATS.maxStamina;
        newPlayer.maxMentalState = INITIAL_PLAYER_STATS.maxMentalState;
        newPlayer.lifespan = major.baseLifespan;
        newPlayer.maxSpiritPower = 0;
        newPlayer.spiritPower = 0;
        newPlayer.maxExp = 10;
        newPlayer.hp = newPlayer.maxHp;
        newPlayer.stamina = newPlayer.maxStamina;
        newPlayer.mentalState = newPlayer.maxMentalState;
        newPlayer.exp = 0;
        newPlayer.level = 1;

        playerState.selectedDestinyIds.forEach(id => {
            const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
            if(destiny?.effects?.primaryStatChange) {
                for (const [key, value] of Object.entries(destiny.effects.primaryStatChange)) {
                     if (value !== undefined) {
                         const statKey = key as keyof Player;
                         (newPlayer[statKey] as number) += value;
                         if (key === 'maxHp') newPlayer.hp = newPlayer.maxHp;
                         if (key === 'maxStamina') newPlayer.stamina = newPlayer.maxStamina;
                         if (key === 'maxMentalState') newPlayer.mentalState = newPlayer.maxMentalState;
                     }
                }
            }
        });
        
        return newPlayer;
    }

    const newQuality = newQualityId ? major.qualities?.find(q => q.id === newQualityId) : null;
    const qualityRank = newQuality?.rank || 1;
    const qualityLifespanBonus = newQuality?.lifespanBonus || 0;
    const difficulty = playerState.difficulty;

    const baseAttributes = { ...INITIAL_PLAYER_STATS.attributes };
    const basePrimary = { 
        maxHp: INITIAL_PLAYER_STATS.maxHp, 
        maxSpiritPower: INITIAL_PLAYER_STATS.maxSpiritPower, 
        maxStamina: INITIAL_PLAYER_STATS.maxStamina, 
        maxMentalState: INITIAL_PLAYER_STATS.maxMentalState,
        maxExp: INITIAL_PLAYER_STATS.maxExp
    };

    playerState.selectedDestinyIds.forEach(id => {
        const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
        if (destiny?.effects?.attributeChange) {
            for (const [key, value] of Object.entries(destiny.effects.attributeChange)) {
                if (value !== undefined) baseAttributes[key as keyof PlayerAttributes] += value;
            }
        }
        if(destiny?.effects?.primaryStatChange) {
            for (const [key, value] of Object.entries(destiny.effects.primaryStatChange)) {
                 if (value !== undefined && key in basePrimary) {
                    basePrimary[key as keyof typeof basePrimary] += value;
                 }
            }
        }
    });

    const newAttributes: PlayerAttributes = { ...baseAttributes };
    for (const key of Object.keys(newAttributes)) {
        const attrKey = key as keyof PlayerAttributes;
        const multiplier = getFinalBuff(difficulty, 'sub', attrKey, tier.rank, major.rank, minor.rank, qualityRank);
        newAttributes[attrKey] = Math.floor(baseAttributes[attrKey] * multiplier);
    }
    
    newPlayer.attributes = newAttributes;
    newPlayer.maxHp = Math.floor(basePrimary.maxHp * getFinalBuff(difficulty, 'main', 'maxHp', tier.rank, major.rank, minor.rank, qualityRank));
    newPlayer.maxSpiritPower = Math.floor(basePrimary.maxSpiritPower * getFinalBuff(difficulty, 'main', 'maxSpiritPower', tier.rank, major.rank, minor.rank, qualityRank));
    newPlayer.maxStamina = Math.floor(basePrimary.maxStamina * getFinalBuff(difficulty, 'main', 'maxStamina', tier.rank, major.rank, minor.rank, qualityRank));
    newPlayer.maxMentalState = Math.floor(basePrimary.maxMentalState * getFinalBuff(difficulty, 'main', 'maxMentalState', tier.rank, major.rank, minor.rank, qualityRank));
    newPlayer.maxExp = Math.floor(basePrimary.maxExp * getFinalBuff(difficulty, 'main', 'maxExp', tier.rank, major.rank, minor.rank, qualityRank));
    newPlayer.lifespan = major.baseLifespan + qualityLifespanBonus;
    
    playerState.selectedDestinyIds.forEach(id => {
        const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
        if (destiny?.effects?.primaryStatChange?.lifespan) {
            newPlayer.lifespan += destiny.effects.primaryStatChange.lifespan;
        }
    });

    newPlayer.cultivationStageId = newStageId;
    newPlayer.cultivationQualityId = newQualityId;
    newPlayer.cultivationStage = `${major.name} ${minor.name}`.trim();
    newPlayer.cultivationQuality = newQuality ? newQuality.name : null;
    newPlayer.level += 1;
    newPlayer.exp = 0;
    newPlayer.hp = newPlayer.maxHp;
    newPlayer.spiritPower = newPlayer.maxSpiritPower;
    newPlayer.stamina = newPlayer.maxStamina;
    newPlayer.mentalState = newPlayer.maxMentalState;
    
    return newPlayer;
};
