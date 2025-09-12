import type { GameDifficulty, PlayerAttributes } from '../types';

// Part 1: Define realm multipliers (Tier, Major, Minor, Rank Bonus) for each difficulty.
export const difficultyMultipliers: Record<GameDifficulty, { Tier: number, Major: number, Minor: number, RankBonus: number }> = {
  'Cực dễ':     { Tier: 1.30, Major: 1.60, Minor: 1.30, RankBonus: 0.30 },
  'Dễ':         { Tier: 1.25, Major: 1.50, Minor: 1.25, RankBonus: 0.25 },
  'Bình thường': { Tier: 1.20, Major: 1.40, Minor: 1.20, RankBonus: 0.20 },
  'Khó':        { Tier: 1.15, Major: 1.30, Minor: 1.15, RankBonus: 0.15 },
  'Cực khó':    { Tier: 1.10, Major: 1.20, Minor: 1.10, RankBonus: 0.10 }
};

// Part 2: Define specific buff multipliers for each main and sub-attribute for each difficulty.
type MainStatKeys = 'maxHp' | 'maxExp' | 'maxSpiritPower' | 'maxMentalState' | 'maxStamina';
type SubStatKeys = keyof PlayerAttributes;

export const statSpecificMultipliers: Record<GameDifficulty, { main: Record<MainStatKeys, number>, sub: Record<SubStatKeys, number> }> = {
  'Cực dễ': {
    main: { maxHp: 1.35, maxExp: 1.25, maxSpiritPower: 1.20, maxMentalState: 1.15, maxStamina: 1.18 },
    sub: { physicalStrength: 1.25, magicPower: 1.35, bodyStrength: 1.20, defense: 1.20, agility: 1.10, spiritualSense: 1.12, aptitude: 1.08, critChance: 1.05, critDamage: 1.05 }
  },
  'Dễ': {
    main: { maxHp: 1.30, maxExp: 1.20, maxSpiritPower: 1.15, maxMentalState: 1.10, maxStamina: 1.14 },
    sub: { physicalStrength: 1.20, magicPower: 1.30, bodyStrength: 1.15, defense: 1.15, agility: 1.08, spiritualSense: 1.10, aptitude: 1.06, critChance: 1.04, critDamage: 1.04 }
  },
  'Bình thường': {
    main: { maxHp: 1.25, maxExp: 1.15, maxSpiritPower: 1.10, maxMentalState: 1.05, maxStamina: 1.10 },
    sub: { physicalStrength: 1.15, magicPower: 1.25, bodyStrength: 1.10, defense: 1.10, agility: 1.06, spiritualSense: 1.08, aptitude: 1.04, critChance: 1.03, critDamage: 1.03 }
  },
  'Khó': {
    main: { maxHp: 1.20, maxExp: 1.10, maxSpiritPower: 1.05, maxMentalState: 1.03, maxStamina: 1.06 },
    sub: { physicalStrength: 1.10, magicPower: 1.20, bodyStrength: 1.05, defense: 1.05, agility: 1.04, spiritualSense: 1.06, aptitude: 1.02, critChance: 1.02, critDamage: 1.02 }
  },
  'Cực khó': {
    main: { maxHp: 1.15, maxExp: 1.05, maxSpiritPower: 1.03, maxMentalState: 1.01, maxStamina: 1.03 },
    sub: { physicalStrength: 1.05, magicPower: 1.15, bodyStrength: 1.03, defense: 1.03, agility: 1.02, spiritualSense: 1.04, aptitude: 1.01, critChance: 1.01, critDamage: 1.01 }
  }
};

/**
 * Calculates the final multiplier for a specific stat based on cultivation progress.
 * @param difficulty - The game's difficulty setting.
 * @param statType - The type of stat, either 'main' or 'sub'.
 * @param statName - The name of the stat (e.g., 'maxHp', 'physicalStrength').
 * @param tierRank - The rank of the Cultivation Tier (Cấp Bậc).
 * @param majorRank - The cumulative rank of the Major Realm (Đại Cảnh Giới).
 * @param minorRank - The rank of the Minor Realm within its Major Realm (Tiểu Cảnh Giới).
 * @param qualityRank - The rank of the achieved quality (phẩm chất).
 * @returns The final calculated multiplier for the stat.
 */
export function getFinalBuff(
  difficulty: GameDifficulty, 
  statType: 'main' | 'sub', 
  statName: MainStatKeys | SubStatKeys, 
  tierRank: number, 
  majorRank: number, 
  minorRank: number, 
  qualityRank: number
): number {
  const diff = difficultyMultipliers[difficulty];
  const qualityMult = 1 + (qualityRank - 1) * diff.RankBonus;

  // Exponential growth formula based on ranks. Ranks start from 1, so power is rank-1.
  // Rank 0 (Phàm Nhân) results in power of 0, which is 1.
  // The majorRank exponent is multiplied by 10 to ensure a significant jump between major realms, fixing the progression bug.
  const realmBuff = (diff.Tier ** (tierRank > 0 ? tierRank - 1 : 0)) *
                    (diff.Major ** (majorRank > 0 ? (majorRank - 1) * 10 : 0)) *
                    (diff.Minor ** (minorRank > 0 ? minorRank - 1 : 0)) *
                    qualityMult;

  const specificMults = statSpecificMultipliers[difficulty][statType];
  const specificMult = (specificMults as Record<string, number>)[statName as string];

  if (specificMult === undefined) {
    console.warn(`Multiplier for ${statType}.${String(statName)} not found at difficulty ${difficulty}. Defaulting to 1.`);
    return realmBuff;
  }

  return realmBuff * specificMult;
}