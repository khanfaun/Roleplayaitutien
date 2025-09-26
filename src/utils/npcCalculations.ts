import type { CultivationTier, GameDifficulty, InitialNpc, MajorRealm, MinorRealm, NpcCharacter, PlayerAttributes } from '../types';
import { INITIAL_PLAYER_STATS } from '../constants';
import { DESTINY_DEFINITIONS } from '../data/effects';
import { getFinalBuff } from './buffMultipliers';

const attitudeScores: Record<string, number> = {
    'Thân thiện': 50,
    'Trung lập': 0,
    'Cảnh giác': -25,
    'Thù địch': -75,
};

export const findRealmDetails = (system: CultivationTier[], stageId: string | null | undefined): { tier: CultivationTier, major: MajorRealm, minor: MinorRealm } | null => {
    if (!stageId) return null;
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

export const calculateNpcStats = (npcSetupData: InitialNpc, cultivationSystem: CultivationTier[], difficulty: GameDifficulty): NpcCharacter => {
    
    // FIX: Pass the `imageId` from the setup data to the in-game NPC object.
    let baseNpc: NpcCharacter = {
        id: npcSetupData.id,
        ...INITIAL_PLAYER_STATS,
        name: npcSetupData.name,
        // FIX: Pass `description` from setup data to the in-game NPC object.
        description: npcSetupData.description,
        age: npcSetupData.age ?? 100,
        linhCan: `${npcSetupData.linhCanQuality || 'Phàm Linh Căn'} linh căn`,
        nguHanh: npcSetupData.nguHanh ? Object.entries(npcSetupData.nguHanh).filter(([, val]) => (val as number) > 0).map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)} (${(val as number) * 20}%)`).join(', ') : 'Không có',
        difficulty: difficulty,
        selectedDestinyIds: npcSetupData.selectedDestinyIds || [],
        sect: npcSetupData.sectId ? 'Unknown' : null, // Will be resolved later
        sectRank: npcSetupData.sectRank,
        attitudeTowardsPC: attitudeScores[npcSetupData.initialAttitude || 'Trung lập'] ?? 0,
        personality: npcSetupData.personality,
        personalHistory: npcSetupData.personalHistory,
        imageId: npcSetupData.imageId,
    };
    
    const startingStageId = npcSetupData.startingCultivationStageId;
    if (!startingStageId) {
        baseNpc.cultivationStage = "Phàm Nhân";
        baseNpc.cultivationStageId = 'pham_nhan_realm_0_minor_0';
        return baseNpc;
    }

    const details = findRealmDetails(cultivationSystem, startingStageId);
    if (!details) return baseNpc;

    const { tier, major, minor } = details;
    const newNpc = { ...baseNpc };
    
    const qualityRank = 1;
    const qualityLifespanBonus = 0;

    const baseAttributes = { ...INITIAL_PLAYER_STATS.attributes };
    const basePrimary = { 
        maxHp: INITIAL_PLAYER_STATS.maxHp, 
        maxSpiritPower: INITIAL_PLAYER_STATS.maxSpiritPower, 
        maxStamina: INITIAL_PLAYER_STATS.maxStamina, 
        maxMentalState: INITIAL_PLAYER_STATS.maxMentalState,
        maxExp: INITIAL_PLAYER_STATS.maxExp
    };

    (npcSetupData.selectedDestinyIds || []).forEach(id => {
        const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
        if (destiny?.effects?.attributeChange) {
            for (const [key, value] of Object.entries(destiny.effects.attributeChange)) {
                if (value !== undefined) baseAttributes[key as keyof PlayerAttributes] += value;
            }
        }
        if(destiny?.effects?.primaryStatChange) {
            for (const [key, value] of Object.entries(destiny.effects.primaryStatChange)) {
                 if (value !== undefined && key in basePrimary) {
                    (basePrimary as any)[key] += value;
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
    
    newNpc.attributes = newAttributes;
    newNpc.maxHp = Math.floor(basePrimary.maxHp * getFinalBuff(difficulty, 'main', 'maxHp', tier.rank, major.rank, minor.rank, qualityRank));
    newNpc.maxSpiritPower = Math.floor(basePrimary.maxSpiritPower * getFinalBuff(difficulty, 'main', 'maxSpiritPower', tier.rank, major.rank, minor.rank, qualityRank));
    newNpc.maxStamina = Math.floor(basePrimary.maxStamina * getFinalBuff(difficulty, 'main', 'maxStamina', tier.rank, major.rank, minor.rank, qualityRank));
    newNpc.maxMentalState = Math.floor(basePrimary.maxMentalState * getFinalBuff(difficulty, 'main', 'maxMentalState', tier.rank, major.rank, minor.rank, qualityRank));
    newNpc.maxExp = Math.floor(basePrimary.maxExp * getFinalBuff(difficulty, 'main', 'maxExp', tier.rank, major.rank, minor.rank, qualityRank));

    newNpc.lifespan = major.baseLifespan + qualityLifespanBonus;
    
    (npcSetupData.selectedDestinyIds || []).forEach(id => {
        const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
        if (destiny?.effects?.primaryStatChange?.lifespan) {
            newNpc.lifespan += destiny.effects.primaryStatChange.lifespan;
        }
    });

    newNpc.cultivationStageId = startingStageId;
    newNpc.cultivationStage = `${major.name} ${minor.name}`.trim();
    
    // NPC state initialization
    newNpc.hp = newNpc.maxHp;
    newNpc.spiritPower = newNpc.maxSpiritPower;
    newNpc.stamina = newNpc.maxStamina;
    newNpc.mentalState = newNpc.maxMentalState;
    newNpc.exp = 0;
    
    return newNpc;
};