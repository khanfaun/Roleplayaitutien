// FIX: Added `import React from 'react'` to resolve JSX error.
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { ScenarioData, ScenarioStage, InitialItem, InitialCongPhap, InitialNpc, InitialSect, WorldLocation, LinhCanQuality, NguHanhType, GameDifficulty, CultivationTier, Rule, DestinyDefinition, StatusEffect, ItemEffectDefinition, Player } from '../types';
import * as Scenarios from '../data/scenarios';
import { INITIAL_THIEN_DAO_RULES, INITIAL_CORE_MEMORY_RULES, INITIAL_PLAYER_STATS } from '../constants';
import { DESTINY_DEFINITIONS, STATUS_EFFECT_DEFINITIONS, ALL_ITEM_EFFECT_DEFINITIONS } from '../data/effects';
import { PHAM_NHAN_TIER } from '../components/setup/ElementsTab';
import { THIEN_THU_VAT_PHAM_TIEU_HAO, THIEN_THU_TRANG_BI, THIEN_THU_PHAP_BAO, THIEN_THU_CONG_PHAP } from '../data/thienThu';
import { calculatePlayerStatsForCultivation } from '../components/setup/scenarioCalculations';
import { PREDEFINED_SCENARIOS } from '../components/setup/predefinedScenarios';


interface UseScenarioSetupProps {
    onStartGame: (setupData: ScenarioData) => void;
}

interface LoadedScenario {
  id: string;
  name: string;
  data: ScenarioData;
}

export const useScenarioSetup = ({ onStartGame }: UseScenarioSetupProps) => {
    const [mainTab, setMainTab] = useState<'scenarioSetup' | 'elements' | 'character' | 'customization'>('scenarioSetup');

    // Character Tab State
    const [playerName, setPlayerName] = useState('');
    const [playerImageId, setPlayerImageId] = useState<string | undefined>();
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
    // FIX: Removed deprecated world structure states.
    const [worldLocations, setWorldLocations] = useState<WorldLocation[]>([]);
    const [startingLocationId, setStartingLocationId] = useState<string | null>(null);
    const [cultivationSystem, setCultivationSystem] = useState<CultivationTier[]>([PHAM_NHAN_TIER]);
    const [startingCultivationStageId, setStartingCultivationStageId] = useState<string | null>(null);

    // Stats Simulator State
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
    const [isPlayerImageModalOpen, setIsPlayerImageModalOpen] = useState(false);
    const [simulatorSelection, setSimulatorSelection] = useState<{ tierId: string; majorId: string; minorId: string; } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scenario management logic
    const [selectedScenario, setSelectedScenario] = useState<string>('custom');
    const [loadedScenarios, setLoadedScenarios] = useState<LoadedScenario[]>([]);
    
    // Customization Tab State
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

    const clearAllData = useCallback(() => {
        setScenarioName(''); setPlayerName(''); setPlayerImageId(undefined); setPlayerAge(16); setPlayerBiography(''); setPlayerGoals('');
        setEnableHeThong(true); setEnableAdultContent(false); setLinhCanQuality('Phàm Linh Căn');
        setNguHanh(Scenarios.EMPTY_NGU_HANH); setDifficulty('Dễ'); setSelectedDestinyIds([]);
        setPlayerSectId(null); setPlayerSectRank(null); setScenarioSummary(''); setScenarioStages([]);
        setThienDaoRules([...INITIAL_THIEN_DAO_RULES]); setCoreMemoryRules([...INITIAL_CORE_MEMORY_RULES]);
        setInitialItems([]); setInitialTrangBi([]); setInitialPhapBao([]); setInitialCongPhap([]);
        setInitialNpcs([]); setInitialSects([]); setWorldLocations([]);
        setCultivationSystem([PHAM_NHAN_TIER]); setStartingLocationId(null);
        setStartingCultivationStageId(null);
    }, []);

    const loadFullScenarioData = useCallback((data: ScenarioData) => {
        setScenarioName(data.scenarioName || ''); setPlayerName(data.playerName); setPlayerImageId(data.playerImageId); setPlayerAge(data.playerAge || 16);
        setPlayerBiography(data.playerBiography || ''); setPlayerGoals(data.playerGoals || '');
        setEnableHeThong(data.enableHeThong ?? true); setEnableAdultContent(data.enableAdultContent ?? false);
        setLinhCanQuality(data.linhCanQuality || 'Phàm Linh Căn'); setNguHanh(data.nguHanh || Scenarios.DEFAULT_NGU_HANH);
        setDifficulty(data.difficulty || 'Bình thường'); setSelectedDestinyIds(data.selectedDestinyIds || []);
        setPlayerSectId(data.playerSectId || null); setPlayerSectRank(data.playerSectRank || null);
        setScenarioSummary(data.scenarioSummary); setScenarioStages(data.scenarioStages as ScenarioStage[]);
        
        const scenarioRules = data.thienDaoRules || [];
        const combinedRules = [...INITIAL_THIEN_DAO_RULES, ...scenarioRules];
        const uniqueRules = combinedRules.filter((rule, index, self) => index === self.findIndex(r => r.text === rule.text));
        setThienDaoRules(uniqueRules);
        setCoreMemoryRules(data.coreMemoryRules || []);
        
        setInitialItems(data.initialItems || []); setInitialTrangBi(data.initialTrangBi || []);
        setInitialPhapBao(data.initialPhapBao || []); setInitialCongPhap(data.initialCongPhap || []);
        setInitialNpcs(data.initialNpcs || []); setInitialSects(data.initialSects || []);
        setWorldLocations(data.worldLocations || []);
        
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
            name: playerName || 'Đạo Hữu', age: playerAge, difficulty: difficulty,
            selectedDestinyIds: selectedDestinyIds, linhCan: `${linhCanQuality} linh căn`,
            nguHanh: nguHanhString, cultivationStageId: 'pham_nhan_realm_0_minor_0',
            cultivationQualityId: null, cultivationStage: 'Phàm Nhân',
        };
        const stageIdToSimulate = startingCultivationStageId || 'pham_nhan_realm_0_minor_0';
        return calculatePlayerStatsForCultivation(initialPlayer, cultivationSystem, stageIdToSimulate, null);
    }, [playerName, playerAge, difficulty, selectedDestinyIds, linhCanQuality, nguHanh, startingCultivationStageId, cultivationSystem]);

    const handleScenarioChange = useCallback((id: string) => {
        setSelectedScenario(id);
        if (id === 'custom') { clearAllData(); return; }
        const loaded = loadedScenarios.find(s => s.id === id);
        if (loaded) { loadFullScenarioData(loaded.data); return; }
        const predefined = PREDEFINED_SCENARIOS[id as keyof typeof PREDEFINED_SCENARIOS];
        if (predefined) {
            const predefinedData: ScenarioData = {
                scenarioName: predefined.name, playerName: predefined.data.PLAYER_NAME, playerAge: 16,
                playerBiography: predefined.data.PLAYER_BIOGRAPHY, playerGoals: predefined.data.PLAYER_GOALS,
                enableHeThong: true, enableAdultContent: false,
                linhCanQuality: predefined.data.LINH_CAN_QUALITY || 'Phàm Linh Căn',
                nguHanh: predefined.data.NGU_HANH || Scenarios.DEFAULT_NGU_HANH,
                difficulty: 'Dễ', selectedDestinyIds: predefined.data.DESTINY_IDS || [],
                playerSectId: null, playerSectRank: null,
                scenarioSummary: predefined.data.SUMMARY, scenarioStages: predefined.data.STAGES,
                thienDaoRules: predefined.data.THIEN_DAO_RULES, coreMemoryRules: [],
                initialItems: predefined.data.ITEMS, initialTrangBi: predefined.data.TRANG_BI,
                initialPhapBao: predefined.data.PHAP_BAO, initialCongPhap: predefined.data.CONG_PHAP,
                initialNpcs: predefined.data.NPCS, initialSects: predefined.data.SECTS,
                worldLocations: predefined.data.WORLD_LOCATIONS || [],
                cultivationSystem: JSON.parse(JSON.stringify(predefined.data.CULTIVATION_SYSTEM)),
                startingLocationId: null, startingCultivationStageId: null,
            };
            loadFullScenarioData(predefinedData);
        }
    }, [clearAllData, loadFullScenarioData, loadedScenarios]);

    const handleResetClick = useCallback(() => {
        clearAllData(); setLoadedScenarios([]); setSelectedScenario('custom');
    }, [clearAllData]);
    
    useEffect(() => {
        switch(linhCanQuality) {
            case 'Ngụy Linh Căn': setDifficulty('Cực dễ'); break;
            case 'Phàm Linh Căn': setDifficulty('Dễ'); break;
            case 'Huyền Linh Căn': setDifficulty('Bình thường'); break;
            case 'Địa Linh Căn': setDifficulty('Khó'); break;
            case 'Thiên Linh Căn': setDifficulty('Cực khó'); break;
            default: setDifficulty('Bình thường');
        }
    }, [linhCanQuality]);

    const handleStartClick = () => {
        if (!playerName.trim() || !scenarioSummary.trim() || scenarioStages.length === 0) {
            alert("Vui lòng nhập tên nhân vật, tóm tắt kịch bản và ít nhất một giai đoạn kịch bản.");
            setMainTab('scenarioSetup');
            return;
        }

        let finalStartingLocationId = startingLocationId;

        const allLeafLocations = worldLocations.filter(loc => 
            !worldLocations.some(child => child.parentId === loc.id)
        );

        if (!startingLocationId) {
            // Case 1: User did not choose a starting point.
            if (allLeafLocations.length > 0) {
                const randomIndex = Math.floor(Math.random() * allLeafLocations.length);
                finalStartingLocationId = allLeafLocations[randomIndex].id;
            } else if (worldLocations.length > 0) {
                // Fallback if no leaf nodes are found (e.g., malformed data)
                const randomIndex = Math.floor(Math.random() * worldLocations.length);
                finalStartingLocationId = worldLocations[randomIndex].id;
            }
        } else {
            // Case 2: User chose a starting point.
            const hasChildren = worldLocations.some(child => child.parentId === startingLocationId);

            if (hasChildren) {
                const getDescendants = (parentId: string): WorldLocation[] => {
                    const directChildren = worldLocations.filter(loc => loc.parentId === parentId);
                    if (directChildren.length === 0) {
                        return [];
                    }
                    return directChildren.concat(
                        directChildren.flatMap(child => getDescendants(child.id))
                    );
                };

                const descendants = getDescendants(startingLocationId);
                const leafDescendants = descendants.filter(desc => 
                    !worldLocations.some(child => child.parentId === desc.id)
                );

                if (leafDescendants.length > 0) {
                    const randomIndex = Math.floor(Math.random() * leafDescendants.length);
                    finalStartingLocationId = leafDescendants[randomIndex].id;
                }
                // If no leaf descendants, we keep the user's choice as a fallback.
            }
            // If it has no children, the user's choice is already a leaf node.
        }

        onStartGame({
            scenarioName, playerName, playerImageId, playerAge, playerBiography, playerGoals, enableHeThong, enableAdultContent,
            linhCanQuality, nguHanh, difficulty, selectedDestinyIds, playerSectId, playerSectRank,
            scenarioSummary, scenarioStages, thienDaoRules, coreMemoryRules,
            initialItems, initialTrangBi, initialPhapBao, initialCongPhap, initialNpcs,
            initialSects, worldLocations,
            cultivationSystem, 
            startingLocationId: finalStartingLocationId, 
            startingCultivationStageId,
        });
    };

    const handleSaveSetup = () => {
        const setupData: ScenarioData = {
            scenarioName, playerName, playerImageId, playerAge, playerBiography, playerGoals, enableHeThong, enableAdultContent,
            linhCanQuality, nguHanh, difficulty, selectedDestinyIds, playerSectId, playerSectRank,
            scenarioSummary, scenarioStages, thienDaoRules, coreMemoryRules,
            initialItems, initialTrangBi, initialPhapBao, initialCongPhap, initialNpcs,
            initialSects, worldLocations,
            cultivationSystem, startingLocationId, startingCultivationStageId,
        };
        const fullSetupData = { scenarioData: setupData, customThienThuData: customThienThu };
        const jsonString = JSON.stringify(fullSetupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${scenarioName || 'Custom'}_Setup.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    const handleLoadSetup = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const loadedJson = JSON.parse(text);
                let scenarioDataToLoad: ScenarioData | null = null;
                let customThienThuToLoad: any | null = null;

                if (loadedJson.scenarioData && loadedJson.customThienThuData) {
                    scenarioDataToLoad = loadedJson.scenarioData;
                    customThienThuToLoad = loadedJson.customThienThuData;
                } else {
                    scenarioDataToLoad = loadedJson;
                }
                
                if (scenarioDataToLoad && 'playerName' in scenarioDataToLoad && 'scenarioSummary' in scenarioDataToLoad && 'scenarioStages' in scenarioDataToLoad) {
                   const newId = file.name + Date.now();
                   const newName = scenarioDataToLoad.scenarioName || file.name.replace('.json', '').replace(/_/g, ' ');
                   scenarioDataToLoad.scenarioName = newName;
                   const newScenario: LoadedScenario = { id: newId, name: newName, data: scenarioDataToLoad };
                   setLoadedScenarios(prev => [...prev, newScenario]);
                   setSelectedScenario(newId);
                   loadFullScenarioData(scenarioDataToLoad);
                   if (customThienThuToLoad) setCustomThienThu(customThienThuToLoad);
                } else {
                    alert("Tệp thiết lập không hợp lệ.");
                }
            } catch (err) {
                console.error("Lỗi đọc tệp thiết lập:", err);
                alert("Không thể đọc tệp thiết lập.");
            }
        };
        reader.readAsText(file);
        if(event.target) event.target.value = '';
    };
    
    const handleOpenSimulator = (selection: { tierId: string; majorId?: string; minorId?: string; }) => {
        const findFirstValidMinor = (tierId: string, majorId?: string): { majorId: string, minorId: string } | null => {
            const tier = cultivationSystem.find(t => t.id === tierId); if (!tier) return null;
            const major = majorId ? tier.realms.find(m => m.id === majorId) : tier.realms[0]; if (!major) return null;
            const minor = major.minorRealms.find(m => !m.isHidden); if (!minor) return null;
            return { majorId: major.id, minorId: minor.id };
        };
        const finalSelection = { tierId: selection.tierId, majorId: selection.majorId || '', minorId: selection.minorId || '' };
        if (!finalSelection.majorId || !finalSelection.minorId) {
            const firstValid = findFirstValidMinor(selection.tierId, selection.majorId);
            if (firstValid) { finalSelection.majorId = firstValid.majorId; finalSelection.minorId = firstValid.minorId; }
        }
        if (finalSelection.majorId && finalSelection.minorId) {
            setSimulatorSelection(finalSelection); setIsSimulatorOpen(true);
        } else {
            console.error("Could not determine a valid realm to simulate.");
        }
    };

    return {
        mainTab, setMainTab, playerName, setPlayerName, playerImageId, setPlayerImageId, playerAge, setPlayerAge,
        playerBiography, setPlayerBiography, playerGoals, setPlayerGoals,
        enableHeThong, setEnableHeThong, enableAdultContent, setEnableAdultContent,
        linhCanQuality, setLinhCanQuality, nguHanh, setNguHanh, difficulty,
        selectedDestinyIds, setSelectedDestinyIds, playerSectId, setPlayerSectId,
        playerSectRank, setPlayerSectRank, scenarioName, setScenarioName,
        scenarioSummary, setScenarioSummary, scenarioStages, setScenarioStages,
        thienDaoRules, setThienDaoRules, coreMemoryRules, setCoreMemoryRules,
        initialItems, setInitialItems, initialTrangBi, setInitialTrangBi,
        initialPhapBao, setInitialPhapBao, initialCongPhap, setInitialCongPhap,
        initialNpcs, setInitialNpcs, initialSects, setInitialSects,
        worldLocations, setWorldLocations, startingLocationId, setStartingLocationId,
        cultivationSystem, setCultivationSystem, startingCultivationStageId, setStartingCultivationStageId,
        isSimulatorOpen, setIsSimulatorOpen, isPlayerImageModalOpen, setIsPlayerImageModalOpen, simulatorSelection,
        fileInputRef, selectedScenario, loadedScenarios, customThienThu,
        setCustomThienThu, destinyDefs, setDestinyDefs, statusEffectDefs,
        setStatusEffectDefs, itemEffectDefs, setItemEffectDefs,
        mockPlayerForSimulator, handleScenarioChange, handleResetClick, handleStartClick,
        handleSaveSetup, handleLoadSetup, handleOpenSimulator,
        PREDEFINED_SCENARIOS
    };
};