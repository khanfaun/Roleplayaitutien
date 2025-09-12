import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { ScenarioData, ScenarioStage, InitialItem, InitialCongPhap, InitialNpc, InitialSect, InitialLocation, LinhCanQuality, NguHanhType, GameDifficulty, CultivationTier, Rule, DestinyDefinition, StatusEffect, ItemEffectDefinition, InitialProvince, InitialWorldRegion, Player, MajorRealm, MinorRealm, PlayerAttributes } from '../types';
import { BookOpenIcon, SparklesIcon, UserIcon, CogIcon } from './Icons';
import * as Scenarios from '../data/scenarios';
import { RealmStatsSimulator } from './RealmStatsSimulator';
import { INITIAL_THIEN_DAO_RULES, INITIAL_CORE_MEMORY_RULES, INITIAL_PLAYER_STATS } from '../constants';
import { DESTINY_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, ALL_ITEM_EFFECT_DEFINITIONS } from '../../data/effects';

import { CharacterTab } from './setup/CharacterTab';
import { ScenarioTab } from './setup/ScenarioTab';
import { ElementsTab, PHAM_NHAN_TIER } from './setup/ElementsTab';
import { CustomizationTab } from './setup/CustomizationTab';
import { THIEN_THU_VAT_PHAM_TIEU_HAO, THIEN_THU_TRANG_BI, THIEN_THU_PHAP_BAO, THIEN_THU_CONG_PHAP } from '../../data/thienThu';
import { getFinalBuff } from '../utils/buffMultipliers';


interface ScenarioSetupProps {
  onStartGame: (setupData: ScenarioData) => void;
  onBack: () => void;
  isLoading: boolean;
}

interface LoadedScenario {
  id: string;
  name: string;
  data: ScenarioData;
}

// --- HELPER FUNCTIONS FOR STAT CALCULATION (copied from useGameLogic) ---
const findRealmDetails = (system: CultivationTier[], stageId: string): { tier: CultivationTier, major: MajorRealm, minor: MinorRealm } | null => {
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

const calculatePlayerStatsForCultivation = (playerState: Player, system: CultivationTier[], newStageId: string, newQualityId: string | null): Player => {
    const details = findRealmDetails(system, newStageId);
    if (!details) return playerState;

    const { tier, major, minor } = details;
    const newPlayer = { ...playerState };

    // Special case for Phàm Nhân
    if (major.id === 'pham_nhan_realm_0') {
        const baseAttrs = { ...INITIAL_PLAYER_STATS.attributes };
        // Apply destiny bonuses to base attributes
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

        // Apply primary stat bonuses from destiny
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

    // --- BASE STATS CALCULATION ---
    const baseAttributes = { ...INITIAL_PLAYER_STATS.attributes };
    const basePrimary = { 
        maxHp: INITIAL_PLAYER_STATS.maxHp, 
        maxSpiritPower: INITIAL_PLAYER_STATS.maxSpiritPower, 
        maxStamina: INITIAL_PLAYER_STATS.maxStamina, 
        maxMentalState: INITIAL_PLAYER_STATS.maxMentalState,
        maxExp: INITIAL_PLAYER_STATS.maxExp
    };

    // Apply destiny bonuses to the base stats
    playerState.selectedDestinyIds.forEach(id => {
        const destiny = DESTINY_DEFINITIONS[id as keyof typeof DESTINY_DEFINITIONS];
        if (destiny?.effects?.attributeChange) {
            for (const [key, value] of Object.entries(destiny.effects.attributeChange)) {
                if (value !== undefined) baseAttributes[key as keyof PlayerAttributes] += value;
            }
        }
        if(destiny?.effects?.primaryStatChange) {
            for (const [key, value] of Object.entries(destiny.effects.primaryStatChange)) {
                 if (value !== undefined) {
                     if (key in basePrimary) {
                        basePrimary[key as keyof typeof basePrimary] += value;
                     }
                 }
            }
        }
    });

    // --- APPLY CULTIVATION BUFFS ---
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
    
    // Full heal on breakthrough
    newPlayer.hp = newPlayer.maxHp;
    newPlayer.spiritPower = newPlayer.maxSpiritPower;
    newPlayer.stamina = newPlayer.maxStamina;
    newPlayer.mentalState = newPlayer.maxMentalState;
    
    return newPlayer;
};


export const ScenarioSetup: React.FC<ScenarioSetupProps> = ({ onStartGame, onBack, isLoading }) => {
    const [mainTab, setMainTab] = useState<'scenarioSetup' | 'elements' | 'character' | 'customization'>('scenarioSetup');

    // Character Tab State
    const [playerName, setPlayerName] = useState('');
    const [playerAge, setPlayerAge] = useState(16);
    const [playerBiography, setPlayerBiography] = useState('');
    const [playerGoals, setPlayerGoals] = useState('');
    const [enableHeThong, setEnableHeThong] = useState(true);
    const [enableAdultContent, setEnableAdultContent] = useState(false);
    const [linhCanQuality, setLinhCanQuality] = useState<LinhCanQuality>('Phàm Linh Căn');
    const [nguHanh, setNguHanh] = useState<Record<NguHanhType, number>>(Scenarios.EMPTY_NGU_HANH);
    const [difficulty, setDifficulty] = useState<GameDifficulty>('Dễ');
    const [selectedDestinyIds, setSelectedDestinyIds] = useState<string[]>([]);
    const [playerSectId, setPlayerSectId] = useState<string | null>(null);
    const [playerSectRank, setPlayerSectRank] = useState<string | null>(null);

    // Scenario Tab State
    const [scenarioName, setScenarioName] = useState('');
    const [scenarioSummary, setScenarioSummary] = useState('');
    const [scenarioStages, setScenarioStages] = useState<ScenarioStage[]>([]);
    const [thienDaoRules, setThienDaoRules] = useState<Rule[]>([...INITIAL_THIEN_DAO_RULES]);
    const [coreMemoryRules, setCoreMemoryRules] = useState<Rule[]>([...INITIAL_CORE_MEMORY_RULES]);

    // Initial Elements Tab State
    const [initialItems, setInitialItems] = useState<InitialItem[]>([]);
    const [initialTrangBi, setInitialTrangBi] = useState<InitialItem[]>([]);
    const [initialPhapBao, setInitialPhapBao] = useState<InitialItem[]>([]);
    const [initialCongPhap, setInitialCongPhap] = useState<InitialCongPhap[]>([]);
    const [initialNpcs, setInitialNpcs] = useState<InitialNpc[]>([]);
    const [initialSects, setInitialSects] = useState<InitialSect[]>([]);
    const [initialLocations, setInitialLocations] = useState<InitialLocation[]>([]);
    const [initialProvinces, setInitialProvinces] = useState<InitialProvince[]>([]);
    const [initialWorldRegions, setInitialWorldRegions] = useState<InitialWorldRegion[]>([]);
    const [startingLocationId, setStartingLocationId] = useState<string | null>(null);
    const [cultivationSystem, setCultivationSystem] = useState<CultivationTier[]>([PHAM_NHAN_TIER]);
    const [startingCultivationStageId, setStartingCultivationStageId] = useState<string | null>(null);

    // Stats Simulator State
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
    const [simulatorSelection, setSimulatorSelection] = useState<{ tierId: string; majorId: string; minorId: string; } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scenario management logic
    const [selectedScenario, setSelectedScenario] = useState<string>('custom');
    const [loadedScenarios, setLoadedScenarios] = useState<LoadedScenario[]>([]);
    
    // Customization Tab State - Lifted up to sync between tabs
    const [customThienThu, setCustomThienThu] = useState(() => {
        try {
            const saved = localStorage.getItem('customThienThuItems');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    vatPhamTieuHao: parsed.vatPhamTieuHao || JSON.parse(JSON.stringify(THIEN_THU_VAT_PHAM_TIEU_HAO)),
                    trangBi: parsed.trangBi || JSON.parse(JSON.stringify(THIEN_THU_TRANG_BI)),
                    phapBao: parsed.phapBao || JSON.parse(JSON.stringify(THIEN_THU_PHAP_BAO)),
                    congPhap: parsed.congPhap || JSON.parse(JSON.stringify(THIEN_THU_CONG_PHAP)),
                    hieuUng: parsed.hieuUng || Object.values(JSON.parse(JSON.stringify(ALL_ITEM_EFFECT_DEFINITIONS))),
                    trangThai: parsed.trangThai || Object.values(JSON.parse(JSON.stringify(STATUS_EFFECT_DEFINITIONS))),
                };
            }
        } catch (e) {
             console.error("Lỗi khi tải vật phẩm tùy chỉnh từ localStorage:", e);
        }
        return {
            vatPhamTieuHao: JSON.parse(JSON.stringify(THIEN_THU_VAT_PHAM_TIEU_HAO)),
            trangBi: JSON.parse(JSON.stringify(THIEN_THU_TRANG_BI)),
            phapBao: JSON.parse(JSON.stringify(THIEN_THU_PHAP_BAO)),
            congPhap: JSON.parse(JSON.stringify(THIEN_THU_CONG_PHAP)),
            hieuUng: Object.values(JSON.parse(JSON.stringify(ALL_ITEM_EFFECT_DEFINITIONS))),
            trangThai: Object.values(JSON.parse(JSON.stringify(STATUS_EFFECT_DEFINITIONS))),
        };
    });

    // Save custom thien thu data to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('customThienThuItems', JSON.stringify(customThienThu));
        } catch (e) {
            console.error("Lỗi khi lưu vật phẩm tùy chỉnh vào localStorage:", e);
        }
    }, [customThienThu]);
    
    const [destinyDefs, setDestinyDefs] = useState<Record<string, DestinyDefinition>>(() => JSON.parse(JSON.stringify(DESTINY_DEFINITIONS)));
    const [statusEffectDefs, setStatusEffectDefs] = useState<Record<string, StatusEffect>>(() => JSON.parse(JSON.stringify(STATUS_EFFECT_DEFINITIONS)));
    const [itemEffectDefs, setItemEffectDefs] = useState<Record<string, ItemEffectDefinition>>(() => JSON.parse(JSON.stringify(ALL_ITEM_EFFECT_DEFINITIONS)));


    
    const PREDEFINED_SCENARIOS = {
        'tienNghich': { name: "Tiên Nghịch (Đồng Nhân)", data: { PLAYER_NAME: Scenarios.TIEN_NGHICH_PLAYER_NAME, PLAYER_BIOGRAPHY: Scenarios.TIEN_NGHICH_PLAYER_BIOGRAPHY, PLAYER_GOALS: Scenarios.TIEN_NGHICH_PLAYER_GOALS, SUMMARY: Scenarios.TIEN_NGHICH_SUMMARY, STAGES: Scenarios.TIEN_NGHICH_STAGES, THIEN_DAO_RULES: Scenarios.TIEN_NGHICH_THIEN_DAO_RULES, ITEMS: Scenarios.TIEN_NGHICH_ITEMS, TRANG_BI: Scenarios.TIEN_NGHICH_TRANG_BI, PHAP_BAO: Scenarios.TIEN_NGHICH_PHAP_BAO, CONG_PHAP: Scenarios.TIEN_NGHICH_CONG_PHAP, NPCS: Scenarios.TIEN_NGHICH_NPCS, SECTS: Scenarios.TIEN_NGHICH_SECTS, LOCATIONS: Scenarios.TIEN_NGHICH_LOCATIONS, CULTIVATION_SYSTEM: Scenarios.TIEN_NGHICH_CULTIVATION_SYSTEM, LINH_CAN_QUALITY: Scenarios.TIEN_NGHICH_LINH_CAN_QUALITY, NGU_HANH: Scenarios.TIEN_NGHICH_NGU_HANH, DESTINY_IDS: Scenarios.TIEN_NGHICH_DESTINY_IDS, WORLD_REGIONS: Scenarios.TIEN_NGHICH_WORLD_REGIONS, PROVINCES: Scenarios.TIEN_NGHICH_PROVINCES }},
        'phamNhanTuTien': { name: "Phàm Nhân Tu Tiên", data: { PLAYER_NAME: Scenarios.PNTT_PLAYER_NAME, PLAYER_BIOGRAPHY: Scenarios.PNTT_PLAYER_BIOGRAPHY, PLAYER_GOALS: Scenarios.PNTT_PLAYER_GOALS, SUMMARY: Scenarios.PNTT_SUMMARY, STAGES: Scenarios.PNTT_STAGES, THIEN_DAO_RULES: Scenarios.PNTT_THIEN_DAO_RULES, ITEMS: Scenarios.PNTT_ITEMS, TRANG_BI: Scenarios.PNTT_TRANG_BI, PHAP_BAO: Scenarios.PNTT_PHAP_BAO, CONG_PHAP: Scenarios.PNTT_CONG_PHAP, NPCS: Scenarios.PNTT_NPCS, SECTS: Scenarios.PNTT_SECTS, LOCATIONS: Scenarios.PNTT_LOCATIONS, CULTIVATION_SYSTEM: Scenarios.PNTT_CULTIVATION_SYSTEM, WORLD_REGIONS: Scenarios.PNTT_WORLD_REGIONS, PROVINCES: Scenarios.PNTT_PROVINCES }},
        'cauMa': { name: "Cầu Ma", data: { PLAYER_NAME: Scenarios.CAUMA_PLAYER_NAME, PLAYER_BIOGRAPHY: Scenarios.CAUMA_PLAYER_BIOGRAPHY, PLAYER_GOALS: Scenarios.CAUMA_PLAYER_GOALS, SUMMARY: Scenarios.CAUMA_SUMMARY, STAGES: Scenarios.CAUMA_STAGES, THIEN_DAO_RULES: Scenarios.CAUMA_THIEN_DAO_RULES, ITEMS: Scenarios.CAUMA_ITEMS, TRANG_BI: Scenarios.CAUMA_TRANG_BI, PHAP_BAO: Scenarios.CAUMA_PHAP_BAO, CONG_PHAP: Scenarios.CAUMA_CONG_PHAP, NPCS: Scenarios.CAUMA_NPCS, SECTS: Scenarios.CAUMA_SECTS, LOCATIONS: Scenarios.CAUMA_LOCATIONS, CULTIVATION_SYSTEM: Scenarios.CAUMA_CULTIVATION_SYSTEM, WORLD_REGIONS: Scenarios.CAUMA_WORLD_REGIONS, PROVINCES: Scenarios.CAUMA_PROVINCES }},
        'nhatNiemVinhHang': { name: "Nhất Niệm Vĩnh Hằng", data: { PLAYER_NAME: Scenarios.NNVH_PLAYER_NAME, PLAYER_BIOGRAPHY: Scenarios.NNVH_PLAYER_BIOGRAPHY, PLAYER_GOALS: Scenarios.NNVH_PLAYER_GOALS, SUMMARY: Scenarios.NNVH_SUMMARY, STAGES: Scenarios.NNVH_STAGES, THIEN_DAO_RULES: Scenarios.NNVH_THIEN_DAO_RULES, ITEMS: Scenarios.NNVH_ITEMS, TRANG_BI: Scenarios.NNVH_TRANG_BI, PHAP_BAO: Scenarios.NNVH_PHAP_BAO, CONG_PHAP: Scenarios.NNVH_CONG_PHAP, NPCS: Scenarios.NNVH_NPCS, SECTS: Scenarios.NNVH_SECTS, LOCATIONS: Scenarios.NNVH_LOCATIONS, CULTIVATION_SYSTEM: Scenarios.NNVH_CULTIVATION_SYSTEM, WORLD_REGIONS: Scenarios.NNVH_WORLD_REGIONS, PROVINCES: Scenarios.NNVH_PROVINCES }},
        'deBa': { name: "Đế Bá", data: { PLAYER_NAME: Scenarios.DEBA_PLAYER_NAME, PLAYER_BIOGRAPHY: Scenarios.DEBA_PLAYER_BIOGRAPHY, PLAYER_GOALS: Scenarios.DEBA_PLAYER_GOALS, SUMMARY: Scenarios.DEBA_SUMMARY, STAGES: Scenarios.DEBA_STAGES, THIEN_DAO_RULES: Scenarios.DEBA_THIEN_DAO_RULES, ITEMS: Scenarios.DEBA_ITEMS, TRANG_BI: Scenarios.DEBA_TRANG_BI, PHAP_BAO: Scenarios.DEBA_PHAP_BAO, CONG_PHAP: Scenarios.DEBA_CONG_PHAP, NPCS: Scenarios.DEBA_NPCS, SECTS: Scenarios.DEBA_SECTS, LOCATIONS: Scenarios.DEBA_LOCATIONS, CULTIVATION_SYSTEM: Scenarios.DEBA_CULTIVATION_SYSTEM, WORLD_REGIONS: Scenarios.DEBA_WORLD_REGIONS, PROVINCES: Scenarios.DEBA_PROVINCES }},
    };

    const clearAllData = useCallback(() => {
        setScenarioName('');
        setPlayerName('');
        setPlayerAge(16);
        setPlayerBiography('');
        setPlayerGoals('');
        setEnableHeThong(true);
        setEnableAdultContent(false);
        setLinhCanQuality('Phàm Linh Căn');
        setNguHanh(Scenarios.EMPTY_NGU_HANH);
        setDifficulty('Dễ');
        setSelectedDestinyIds([]);
        setPlayerSectId(null);
        setPlayerSectRank(null);
        setScenarioSummary('');
        setScenarioStages([]);
        setThienDaoRules([...INITIAL_THIEN_DAO_RULES]);
        setCoreMemoryRules([...INITIAL_CORE_MEMORY_RULES]);
        setInitialItems([]);
        setInitialTrangBi([]);
        setInitialPhapBao([]);
        setInitialCongPhap([]);
        setInitialNpcs([]);
        setInitialSects([]);
        setInitialLocations([]);
        setInitialProvinces([]);
        setInitialWorldRegions([]);
        setCultivationSystem([PHAM_NHAN_TIER]);
        setStartingLocationId(null);
        setStartingCultivationStageId(null);
    }, []);

    const loadFullScenarioData = useCallback((data: ScenarioData) => {
        setScenarioName(data.scenarioName || '');
        setPlayerName(data.playerName);
        setPlayerAge(data.playerAge || 16);
        setPlayerBiography(data.playerBiography || '');
        setPlayerGoals(data.playerGoals || '');
        setEnableHeThong(data.enableHeThong ?? true);
        setEnableAdultContent(data.enableAdultContent ?? false);
        setLinhCanQuality(data.linhCanQuality || 'Phàm Linh Căn');
        setNguHanh(data.nguHanh || Scenarios.DEFAULT_NGU_HANH);
        setDifficulty(data.difficulty || 'Bình thường');
        setSelectedDestinyIds(data.selectedDestinyIds || []);
        setPlayerSectId(data.playerSectId || null);
        setPlayerSectRank(data.playerSectRank || null);
        setScenarioSummary(data.scenarioSummary);
        setScenarioStages(data.scenarioStages);
        
        const scenarioRules = data.thienDaoRules || [];
        const combinedRules = [...INITIAL_THIEN_DAO_RULES, ...scenarioRules];
        const uniqueRules = combinedRules.filter((rule, index, self) => 
            index === self.findIndex(r => r.text === rule.text)
        );
        setThienDaoRules(uniqueRules);
        setCoreMemoryRules(data.coreMemoryRules || []);
        
        setInitialItems(data.initialItems || []);
        setInitialTrangBi(data.initialTrangBi || []);
        setInitialPhapBao(data.initialPhapBao || []);
        setInitialCongPhap(data.initialCongPhap || []);
        setInitialNpcs(data.initialNpcs || []);
        setInitialSects(data.initialSects || []);
        setInitialLocations(data.initialLocations || []);
        setInitialProvinces(data.initialProvinces || []);
        setInitialWorldRegions(data.initialWorldRegions || []);
        
        const loadedSystem = data.cultivationSystem || [];
        if (!loadedSystem.find(t => t.id === 'pham_nhan_tier_0')) {
            setCultivationSystem([PHAM_NHAN_TIER, ...loadedSystem]);
        } else {
            setCultivationSystem(loadedSystem);
        }

        setStartingLocationId(data.startingLocationId || null);
        setStartingCultivationStageId(data.startingCultivationStageId || null);
    }, []);
    
    const mockPlayerForSimulator = useMemo((): Player => {
        const nguHanhString = (Object.keys(nguHanh) as NguHanhType[])
            .filter(key => nguHanh[key] > 0)
            .map(key => `${key.charAt(0).toUpperCase() + key.slice(1)} (${nguHanh[key] * 20}%)`).join(', ') || 'Không có';

        const initialPlayer: Player = {
            ...INITIAL_PLAYER_STATS,
            name: playerName || 'Đạo Hữu',
            age: playerAge,
            difficulty: difficulty,
            selectedDestinyIds: selectedDestinyIds,
            linhCan: `${linhCanQuality} linh căn`,
            nguHanh: nguHanhString,
            cultivationStageId: 'pham_nhan_realm_0_minor_0', // Start from base
            cultivationQualityId: null,
            cultivationStage: 'Phàm Nhân',
        };

        const stageIdToSimulate = startingCultivationStageId || 'pham_nhan_realm_0_minor_0';
        
        // The stat calculation logic from useGameLogic.ts
        return calculatePlayerStatsForCultivation(initialPlayer, cultivationSystem, stageIdToSimulate, null);

    }, [playerName, playerAge, difficulty, selectedDestinyIds, linhCanQuality, nguHanh, startingCultivationStageId, cultivationSystem]);

    const handleScenarioChange = useCallback((id: string) => {
        setSelectedScenario(id);
        
        if (id === 'custom') {
            clearAllData();
            return;
        }

        const loaded = loadedScenarios.find(s => s.id === id);
        if (loaded) {
            loadFullScenarioData(loaded.data);
            return;
        }
        
        const predefined = (PREDEFINED_SCENARIOS as any)[id];
        if (predefined) {
            const predefinedData: ScenarioData = {
                scenarioName: predefined.name,
                playerName: predefined.data.PLAYER_NAME,
                playerAge: 16,
                playerBiography: predefined.data.PLAYER_BIOGRAPHY,
                playerGoals: predefined.data.PLAYER_GOALS,
                enableHeThong: true,
                enableAdultContent: false,
                linhCanQuality: predefined.data.LINH_CAN_QUALITY || 'Phàm Linh Căn',
                nguHanh: predefined.data.NGU_HANH || Scenarios.DEFAULT_NGU_HANH,
                difficulty: 'Dễ', // This will be auto-updated by useEffect
                selectedDestinyIds: predefined.data.DESTINY_IDS || [],
                playerSectId: null,
                playerSectRank: null,
                scenarioSummary: predefined.data.SUMMARY,
                scenarioStages: predefined.data.STAGES,
                thienDaoRules: predefined.data.THIEN_DAO_RULES,
                coreMemoryRules: [],
                initialItems: predefined.data.ITEMS,
                initialTrangBi: predefined.data.TRANG_BI,
                initialPhapBao: predefined.data.PHAP_BAO,
                initialCongPhap: predefined.data.CONG_PHAP,
                initialNpcs: predefined.data.NPCS,
                initialSects: predefined.data.SECTS,
                initialLocations: predefined.data.LOCATIONS,
                initialProvinces: predefined.data.PROVINCES || [],
                initialWorldRegions: predefined.data.WORLD_REGIONS || [],
                cultivationSystem: JSON.parse(JSON.stringify(predefined.data.CULTIVATION_SYSTEM)),
                startingLocationId: null,
                startingCultivationStageId: null,
            };
            loadFullScenarioData(predefinedData);
        }

    }, [clearAllData, loadFullScenarioData, loadedScenarios]);

    const handleResetClick = useCallback(() => {
        clearAllData();
        setLoadedScenarios([]);
        setSelectedScenario('custom');
    }, [clearAllData]);
    
    useEffect(() => {
        switch(linhCanQuality) {
            case 'Ngụy Linh Căn':
                setDifficulty('Cực dễ');
                break;
            case 'Phàm Linh Căn':
                setDifficulty('Dễ');
                break;
            case 'Huyền Linh Căn':
                setDifficulty('Bình thường');
                break;
            case 'Địa Linh Căn':
                setDifficulty('Khó');
                break;
            case 'Thiên Linh Căn':
                setDifficulty('Cực khó');
                break;
            default:
                setDifficulty('Bình thường');
        }
    }, [linhCanQuality]);

    const handleStartClick = () => {
        if (!playerName.trim() || !scenarioSummary.trim() || scenarioStages.length === 0) {
            alert("Vui lòng nhập tên nhân vật, tóm tắt kịch bản và ít nhất một giai đoạn kịch bản.");
            setMainTab('scenarioSetup');
            return;
        }
        onStartGame({
            scenarioName, playerName, playerAge, playerBiography, playerGoals, enableHeThong, enableAdultContent, linhCanQuality, nguHanh, difficulty, selectedDestinyIds, playerSectId, playerSectRank,
            scenarioSummary, scenarioStages, thienDaoRules, coreMemoryRules,
            initialItems, initialTrangBi, initialPhapBao, initialCongPhap, initialNpcs, initialSects, initialLocations, initialProvinces, initialWorldRegions,
            cultivationSystem: cultivationSystem,
            startingLocationId, startingCultivationStageId,
        });
    };

    const handleSaveSetup = () => {
        const setupData: ScenarioData = {
            scenarioName, playerName, playerAge, playerBiography, playerGoals, enableHeThong, enableAdultContent, linhCanQuality, nguHanh, difficulty, selectedDestinyIds, playerSectId, playerSectRank,
            scenarioSummary, scenarioStages, thienDaoRules, coreMemoryRules,
            initialItems, initialTrangBi, initialPhapBao, initialCongPhap, initialNpcs, initialSects, initialLocations, initialProvinces, initialWorldRegions,
            cultivationSystem,
            startingLocationId, startingCultivationStageId,
        };
        const fullSetupData = {
            scenarioData: setupData,
            customThienThuData: customThienThu
        };
        const jsonString = JSON.stringify(fullSetupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${scenarioName || 'Custom'}_Setup.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleLoadSetup = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const loadedJson = JSON.parse(text);
                    
                    let scenarioDataToLoad: ScenarioData | null = null;
                    let customThienThuToLoad: any | null = null;

                    // Check for new format vs old format
                    if (loadedJson.scenarioData && loadedJson.customThienThuData) {
                        scenarioDataToLoad = loadedJson.scenarioData;
                        customThienThuToLoad = loadedJson.customThienThuData;
                    } else {
                        scenarioDataToLoad = loadedJson; // Assume old format
                    }
                    
                    if (scenarioDataToLoad && 'playerName' in scenarioDataToLoad && 'scenarioSummary' in scenarioDataToLoad && 'scenarioStages' in scenarioDataToLoad) {
                       const newId = file.name + Date.now();
                       const newName = scenarioDataToLoad.scenarioName || file.name.replace('.json', '').replace(/_/g, ' ');
                       scenarioDataToLoad.scenarioName = newName;

                       const newScenario: LoadedScenario = { id: newId, name: newName, data: scenarioDataToLoad };
                       
                       setLoadedScenarios(prev => [...prev, newScenario]);
                       setSelectedScenario(newId);
                       
                       loadFullScenarioData(scenarioDataToLoad);
                       if (customThienThuToLoad) {
                           setCustomThienThu(customThienThuToLoad);
                       }
                    } else {
                        alert("Tệp thiết lập không hợp lệ hoặc thiếu trường dữ liệu quan trọng.");
                    }
                }
            } catch (err) {
                console.error("Lỗi đọc tệp thiết lập:", err);
                alert("Không thể đọc tệp thiết lập. Tệp có thể bị hỏng.");
            }
        };
        reader.readAsText(file);
        if(event.target) event.target.value = ''; // Reset input
    };
    
    const handleOpenSimulator = (selection: { tierId: string; majorId?: string; minorId?: string; }) => {
        const findFirstValidMinor = (tierId: string, majorId?: string): { majorId: string, minorId: string } | null => {
            const tier = cultivationSystem.find(t => t.id === tierId);
            if (!tier) return null;
            
            const major = majorId ? tier.realms.find(m => m.id === majorId) : tier.realms[0];
            if (!major) return null;

            const minor = major.minorRealms.find(m => !m.isHidden);
            if (!minor) return null;
            
            return { majorId: major.id, minorId: minor.id };
        };

        const finalSelection = {
            tierId: selection.tierId,
            majorId: selection.majorId || '',
            minorId: selection.minorId || '',
        };

        if (!finalSelection.majorId || !finalSelection.minorId) {
            const firstValid = findFirstValidMinor(selection.tierId, selection.majorId);
            if (firstValid) {
                finalSelection.majorId = firstValid.majorId;
                finalSelection.minorId = firstValid.minorId;
            }
        }

        if (finalSelection.majorId && finalSelection.minorId) {
            setSimulatorSelection(finalSelection);
            setIsSimulatorOpen(true);
        } else {
            console.error("Could not determine a valid realm to simulate.");
        }
    };

    return (
        <main className="h-screen w-screen p-4 text-white flex flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
            <RealmStatsSimulator
                isOpen={isSimulatorOpen}
                onClose={() => setIsSimulatorOpen(false)}
                cultivationSystem={cultivationSystem}
                currentPlayer={mockPlayerForSimulator}
                isSetupMode={true}
                initialSelection={simulatorSelection}
            />

            <div className="w-full max-w-7xl h-full max-h-[95vh] flex flex-col gap-4">
                <div className="flex-shrink-0 flex justify-between items-center">
                    <div className="text-left">
                        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600">Thiết Lập Thế Giới</h1>
                        <p className="text-md text-slate-300">Hãy sáng tạo nên thế giới tu tiên của riêng ngươi.</p>
                    </div>
                    <button onClick={handleStartClick} disabled={isLoading} className="flex-shrink-0 px-6 py-3 font-bold text-lg rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait">
                        {isLoading ? "Đang Mở Thiên Môn..." : "Bắt Đầu Phiêu Lưu"}
                    </button>
                </div>

                <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 text-white min-h-0">
                    <div className="flex-shrink-0 flex border-b-2 border-slate-700/50">
                        <button onClick={() => setMainTab('scenarioSetup')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mainTab === 'scenarioSetup' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <BookOpenIcon className="w-5 h-5"/> Thiết lập kịch bản
                        </button>
                        <button onClick={() => setMainTab('elements')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mainTab === 'elements' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <SparklesIcon className="w-5 h-5"/> Yếu Tố Khởi Đầu
                        </button>
                        <button onClick={() => setMainTab('character')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mainTab === 'character' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <UserIcon className="w-5 h-5"/> Nhân Vật
                        </button>
                         <button onClick={() => setMainTab('customization')} className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mainTab === 'customization' ? 'bg-slate-800/70 text-yellow-300' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            <CogIcon className="w-5 h-5"/> Tùy Chỉnh Thiên Thư
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto styled-scrollbar p-4 flex flex-col gap-4">
                        {mainTab === 'scenarioSetup' && (
                           <ScenarioTab 
                                scenarioName={scenarioName} setScenarioName={setScenarioName}
                                scenarioSummary={scenarioSummary} setScenarioSummary={setScenarioSummary}
                                scenarioStages={scenarioStages} setScenarioStages={setScenarioStages}
                                thienDaoRules={thienDaoRules} setThienDaoRules={setThienDaoRules}
                                coreMemoryRules={coreMemoryRules} setCoreMemoryRules={setCoreMemoryRules}
                                isCustomScenario={selectedScenario === 'custom'}
                           />
                        )}
                        {mainTab === 'elements' && (
                            <ElementsTab
                                initialItems={initialItems} setInitialItems={setInitialItems}
                                initialTrangBi={initialTrangBi} setInitialTrangBi={setInitialTrangBi}
                                initialPhapBao={initialPhapBao} setInitialPhapBao={setInitialPhapBao}
                                initialCongPhap={initialCongPhap} setInitialCongPhap={setInitialCongPhap}
                                initialNpcs={initialNpcs} setInitialNpcs={setInitialNpcs}
                                initialSects={initialSects} setInitialSects={setInitialSects}
                                initialLocations={initialLocations} setInitialLocations={setInitialLocations}
                                initialProvinces={initialProvinces} setInitialProvinces={setInitialProvinces}
                                initialWorldRegions={initialWorldRegions} setInitialWorldRegions={setInitialWorldRegions}
                                startingLocationId={startingLocationId} setStartingLocationId={setStartingLocationId}
                                cultivationSystem={cultivationSystem} setCultivationSystem={setCultivationSystem}
                                onOpenSimulator={handleOpenSimulator}
                                customThienThu={customThienThu}
                                setCustomThienThu={setCustomThienThu}
                            />
                        )}
                        {mainTab === 'character' && (
                            <CharacterTab 
                                playerName={playerName} setPlayerName={setPlayerName}
                                playerAge={playerAge} setPlayerAge={setPlayerAge}
                                playerBiography={playerBiography} setPlayerBiography={setPlayerBiography}
                                playerGoals={playerGoals} setPlayerGoals={setPlayerGoals}
                                enableHeThong={enableHeThong} setEnableHeThong={setEnableHeThong}
                                enableAdultContent={enableAdultContent} setEnableAdultContent={setEnableAdultContent}
                                linhCanQuality={linhCanQuality} setLinhCanQuality={setLinhCanQuality}
                                nguHanh={nguHanh} setNguHanh={setNguHanh}
                                difficulty={difficulty}
                                selectedDestinyIds={selectedDestinyIds} setSelectedDestinyIds={setSelectedDestinyIds}
                                destinyDefs={destinyDefs}
                                initialSects={initialSects}
                                playerSectId={playerSectId}
                                setPlayerSectId={setPlayerSectId}
                                playerSectRank={playerSectRank}
                                setPlayerSectRank={setPlayerSectRank}
                                cultivationSystem={cultivationSystem}
                                startingCultivationStageId={startingCultivationStageId}
                                setStartingCultivationStageId={setStartingCultivationStageId}
                            />
                        )}
                        {mainTab === 'customization' && (
                             <CustomizationTab
                                customThienThu={customThienThu}
                                setCustomThienThu={setCustomThienThu}
                                destinyDefs={destinyDefs} setDestinyDefs={setDestinyDefs}
                                statusEffectDefs={statusEffectDefs} setStatusEffectDefs={setStatusEffectDefs}
                                itemEffectDefs={itemEffectDefs} setItemEffectDefs={setItemEffectDefs}
                             />
                        )}
                    </div>
                </div>
               
                <div className="flex-shrink-0 flex flex-col md:flex-row gap-3">
                    <button onClick={onBack} className="w-full md:w-auto px-4 py-2 md:px-6 md:py-3 font-bold text-base md:text-lg rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition-colors">
                        Quay Lại
                    </button>
                    <div className="flex-grow flex flex-wrap gap-3">
                         <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-4 py-2 md:px-6 md:py-3 font-bold text-base md:text-lg rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors">
                            Tải
                        </button>
                        <button onClick={handleSaveSetup} className="flex-1 px-4 py-2 md:px-6 md:py-3 font-bold text-base md:text-lg rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                            Lưu
                        </button>
                        <select 
                            id="scenario-select" 
                            value={selectedScenario} 
                            onChange={e => handleScenarioChange(e.target.value)}
                            className="flex-1 text-center bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 md:py-3 font-bold text-base md:text-lg text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        >
                            <option value="custom">Tùy chỉnh kịch bản</option>
                            <option value="tienNghich">Tiên Nghịch (Đồng Nhân)</option>
                            <option value="phamNhanTuTien">Phàm Nhân Tu Tiên (Đồng Nhân)</option>
                            <option value="cauMa">Cầu Ma (Đồng Nhân)</option>
                            <option value="nhatNiemVinhHang">Nhất Niệm Vĩnh Hằng (Đồng Nhân)</option>
                            <option value="deBa">Đế Bá (Đồng Nhân)</option>
                            {loadedScenarios.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <button onClick={handleResetClick} className="flex-1 px-4 py-2 md:px-6 md:py-3 font-bold text-base md:text-lg rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">
                            Làm Mới
                        </button>
                    </div>
                </div>
                 <input type="file" ref={fileInputRef} onChange={handleLoadSetup} accept=".json,application/json" className="hidden" />
            </div>
        </main>
    );
};