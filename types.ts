

export type LinhCanQuality = 'Ngụy Linh Căn' | 'Phàm Linh Căn' | 'Huyền Linh Căn' | 'Địa Linh Căn' | 'Thiên Linh Căn';
export type NguHanhType = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

export interface Rule {
  id: string;
  text: string;
}

export interface JournalEntry {
    id: string;
    turn: number;
    text: string;
}

export interface LogEntry {
    type: 'system' | 'ai_story' | 'player_choice' | 'player_input' | 'dice_roll' | 'he_thong' | 'event' | 'tribulation' | 'status_effect';
    content: string;
}

export interface Sect {
  id: string;
  name: string;
  alignment: 'Chính Đạo' | 'Ma Đạo' | 'Trung Lập';
  description: string;
  joinRequirement: string;
  benefits: string[];
}

export interface PlayerAttributes {
  physicalStrength: number; // Sức mạnh vật lý
  magicPower: number; // Sức mạnh phép thuật
  bodyStrength: number; // Sức mạnh nhục thân
  defense: number; // Phòng thủ
  agility: number; // Thân pháp
  spiritualSense: number; // Thần thức
  aptitude: number; // Căn cốt
  critChance: number; // Tỉ lệ bạo kích (%)
  critDamage: number; // Sát thương bạo kích (%)
}

export type GameDifficulty = 'Cực dễ' | 'Dễ' | 'Bình thường' | 'Khó' | 'Cực khó';

// Moved from constants.ts to a dedicated effects file later, but defined here for type safety
export interface StatusEffect {
  id: string;
  name:string;
  description: string;
  type: 'buff' | 'debuff' | 'neutral';
  duration: number; // in turns. -1 for permanent
  expPerTurn?: number;
  effects?: {
    attributeChangePercent?: Partial<PlayerAttributes>;
    primaryStatChangePercent?: {
        maxHp?: number;
        maxSpiritPower?: number;
        maxStamina?: number;
        maxMentalState?: number;
    };
  };
}

export type TechniqueType = 'Chiến đấu' | 'Phòng thủ' | 'Tu luyện' | 'Tâm pháp' | 'Thân pháp';
export type EquipmentType = 'Vũ khí' | 'Áo choàng' | 'Giáp' | 'Mũ' | 'Găng tay' | 'Giày' | 'Phụ kiện' | 'Trang sức';


// New definition for static effects on items/equipment
export interface ItemEffectDefinition {
  id: string;
  name: string;
  description: string;
  category: 'consumable' | 'equipment' | 'treasure' | 'technique';
  rank: number; // 1: common (gray), 2: uncommon (green), 3: rare (blue), 4: epic (purple), 5: legendary (orange), 6: mythic (red)
  allowedEquipmentTypes?: EquipmentType[];
  allowedTechniqueTypes?: TechniqueType[];
  expPerTurn?: number;
  // Passive effects when equipped
  passiveEffects?: {
    attributeChange?: Partial<PlayerAttributes>;
    primaryStatChange?: {
      maxHp?: number;
      maxSpiritPower?: number;
      maxStamina?: number;
      maxMentalState?: number;
      lifespan?: number;
    }
  };
  // Immediate effects when used
  useEffects?: {
    hpChange?: number;
    spiritPowerChange?: number;
    staminaChange?: number;
    mentalStateChange?: number;
    expChange?: number;
    // Can also grant a status effect
    statusEffect?: {
      id: string;
      duration: number;
    }
  };
}

export interface DestinyDefinition {
  id: string;
  name: string;
  description: string;
  rank: number; // 1-6 for color
  cost: number; // "diem tien thien"
  expPerTurn?: number;
  effects?: {
    attributeChange?: Partial<PlayerAttributes>;
    primaryStatChange?: {
      maxHp?: number;
      maxSpiritPower?: number;
      maxStamina?: number;
      maxMentalState?: number;
      lifespan?: number;
    }
  };
}


export interface Player {
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  spiritPower: number;
  maxSpiritPower: number;
  stamina: number;
  maxStamina: number;
  mentalState: number;
  maxMentalState: number;
  day: number;
  month: number;
  year: number;
  age: number;
  lifespan: number;
  cultivationStage: string; // E.g. "Luyện Thể Nhất Trọng" or "Thiên Đạo Trúc Cơ Sơ Kỳ"
  cultivationQuality: string | null; // E.g., 'Thiên Đạo Trúc Cơ'
  cultivationStageId: string; // ID of the current MinorRealm
  cultivationQualityId: string | null; // ID of the quality for the current MajorRealm
  position: number; // index on the board
  currentLocationId: string; // Geographical location ID
  linhCan: string; // e.g., 'Thiên Linh Căn', 'Ngũ Hành Tạp Linh Căn'
  nguHanh: string; // e.g., 'Hỏa', 'Kim, Mộc'
  sect: string | null; // e.g., 'Thanh Vân Môn'
  sectRank: string | null;
  sectContribution: number;
  reputation: Record<string, number>; // e.g., { 'Chính Đạo': 10, 'Ma Đạo': -5 }
  equippedTechniqueId: string | null;
  equippedTreasureId: string | null;
  attributes: PlayerAttributes;
  difficulty: GameDifficulty;
  selectedDestinyIds: string[];
  // He Thong Fields
  heThongStatus: 'inactive' | 'active' | 'disabled';
  heThongPoints: number;
  statusEffects: StatusEffect[];
}


export interface Item {
  id: string;
  name: string;
  description: string;
  category: 'Vật phẩm' | 'Trang bị' | 'Nhiệm vụ' | 'Công pháp' | 'Pháp bảo' | 'Linh dược' | 'Khoáng thạch' | 'Vật phẩm Hệ thống';
  equipmentType?: EquipmentType;
  effectIds?: string[];
  attributes?: Partial<PlayerAttributes>; // Direct stat bonus for simplicity in some items
  nguHanhAttribute?: NguHanhType | '';
  rank?: number;
  expPerTurn?: number;
  imageId?: string;
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    required: { itemId: string; name: string; quantity: number }[];
    result: { name: string; category: Item['category'] };
}

export interface QuestReward {
    description: string;
    expChange?: number;
    items?: Item[];
    reputationChange?: { faction: string; change: number }[];
    sectContributionChange?: number;
}

export interface QuestPenalty {
    description: string;
    hpChange?: number;
    mentalStateChange?: number;
    reputationChange?: { faction: string; change: number }[];
}

export interface Quest {
  id:string;
  title: string;
  description: string;
  status: 'Đang tiến hành' | 'Hoàn thành' | 'Thất bại';
  type: 'Cốt truyện' | 'Phụ' | 'Môn phái';
  timeLimit?: number; // in turns
  progress?: number;
  target?: number;
  completionCondition: string; // Natural language for AI
  rewards?: QuestReward;
  penalties?: QuestPenalty;
}

export interface HeThongQuestReward {
    description: string;
    heThongPoints?: number;
    items?: Item[];
}

export interface HeThongQuestPenalty {
    description: string;
    hpChange?: number; // Should be negative
    heThongPointsChange?: number; // Should be negative
}

export interface HeThongQuest {
    id: string;
    title: string;
    description: string;
    type: 'Bình thường' | 'Sự kiện đặc biệt' | 'Nhiệm vụ tối thượng';
    status: 'Đang tiến hành' | 'Hoàn thành' | 'Thất bại';
    rewards: HeThongQuestReward;
    penalties?: HeThongQuestPenalty;
    timeLimit?: number;
    hiddenObjective?: {
        description: string;
        condition: string; // Natural language condition for AI
        rewards: HeThongQuestReward;
        completed: boolean;
    };
}

export interface BoardSquare {
  id: number;
  type: 'Sự kiện' | 'May mắn' | 'Xui xẻo' | 'Cột mốc' | 'Kỳ Ngộ' | 'Tâm Ma' | 'Nhân Quả' | 'Thiên Cơ' | 'Thử Luyện' | 'Bế Quan' | 'Hồng Trần' | 'Linh Mạch' | 'Pháp Bảo' | 'Giao Dịch' | 'Ô Trống' | 'Tai Ương' | 'Khởi đầu';
  description: string;
}

export interface CurrentEvent {
  description: string;
  options: string[];
  isTribulation?: boolean; // Flag for special tribulation events
}

export interface CombatState {
    enemyName: string;
    enemyHp: number;
    enemyMaxHp: number;
    enemyDescription: string;
    combatLog: string[];
}

export interface WorldPhase {
    name: string;
    description: string;
    effects: { description: string; type: 'buff' | 'debuff', target: 'world' | 'board' }[];
    turnsRemaining: number;
}

export interface DongPhuBuilding {
  id: 'tuLinhTran' | 'linhDuocVien' | 'luyenDanPhong' | 'luyenKhiCac';
  name: string;
  level: number;
  description: string;
  upgradeCost: { name: string; quantity: number }[];
}

export interface DongPhuState {
  buildings: DongPhuBuilding[];
  lastOnlineTimestamp: number;
}

export interface HeThongState {
    quests: HeThongQuest[];
}

export interface MinorRealm {
    id: string;
    rank: number;
    name: string;
    description: string;
    isHidden: boolean;
}

export interface RealmQuality {
    id: string;
    rank: number; // Higher is better (1 is lowest)
    name: string;
    description: string;
    condition: string;
    statBonusMultiplier: number;
    lifespanBonus: number;
}

export interface MajorRealm {
    id: string;
    rank: number;
    name: string; // No "Kỳ"
    baseLifespan: number;
    description: string;
    minorRealms: MinorRealm[];
    hasQualities: boolean;
    qualities?: RealmQuality[];
}

export interface CultivationTier {
    id: string;
    name: string;
    rank: number;
    realms: MajorRealm[];
}

export interface StatChange {
  before: number;
  after: number;
}

export interface BreakthroughReport {
  oldStage: string;
  newStage: string;
  achievedQuality: string | null;
  statChanges: Record<string, StatChange>;
}

export interface ThienThuData {
  vatPhamTieuHao: InitialItem[];
  trangBi: InitialItem[];
  phapBao: InitialItem[];
  congPhap: InitialCongPhap[];
  tienThienKhiVan: DestinyDefinition[];
  hieuUng: ItemEffectDefinition[];
  trangThai: StatusEffect[];
}

export interface GameState {
  player: Player;
  inventory: Item[];
  quests: Quest[];
  board: BoardSquare[];
  currentEvent: CurrentEvent | null;
  gameLog: LogEntry[];
  mapLevel: number;
  isLoading: boolean;
  isDead: boolean;
  tribulationEvent: CurrentEvent | null;
  combatState: CombatState | null;
  worldPhase: WorldPhase | null;
  recipes: Recipe[];
  diceRolls: number;
  turnCounter: number;
  dongPhu: DongPhuState;
  thienDaoRules: Rule[];
  aiRules: Rule[];
  coreMemoryRules: Rule[];
  journal: JournalEntry[];
  shortTermMemory: JournalEntry[];
  turnInCycle: number;
  heThong: HeThongState;
  isAtBottleneck: boolean;
  breakthroughReport: BreakthroughReport | null;
  scenarioSummary: string;
  scenarioStages: ScenarioStage[];
  isThienMenhBanActive: boolean;
  cultivationSystem: CultivationTier[];
  thienThu: ThienThuData;
  worldData: {
    locations: InitialLocation[];
    provinces: InitialProvince[];
    worldRegions: InitialWorldRegion[];
  };
}

export interface ActionOutcome {
    outcomeDescription: string;
    hpChange: number;
    expChange: number;
    spiritPowerChange: number;
    staminaChange: number;
    mentalStateChange: number;
    daysToAdvance: number; // Number of days to advance. Must be >= 0.
    journalEntry?: string; // Short summary for the journal
    newItem?: Item;
    newRecipe?: Recipe;
    newQuest?: Omit<Quest, 'status' | 'id'>;
    questUpdates?: { questId: string; newStatus?: 'Hoàn thành' | 'Thất bại'; progressChange?: number }[];
    reputationChange?: { faction: string; change: number }[];
    sectContributionChange?: number;
    diceRollsChange?: number;
    attributeChanges?: Partial<PlayerAttributes>;
    joinSect?: string;
    combatTrigger?: {
        enemyName: string;
        enemyHp: number;
        enemyDescription: string;
    };
    nextEvent?: {
        description: string;
        options: string[];
    };
    // He Thong Fields
    awakenHeThong?: boolean;
    heThongPointsChange?: number;
    newHeThongQuest?: Omit<HeThongQuest, 'status' | 'id' | 'hiddenObjective.completed'>;
    heThongQuestUpdates?: {
        questId: string;
        newStatus?: 'Hoàn thành' | 'Thất bại';
        hiddenObjectiveCompleted?: boolean;
    }[];
    tribulationOutcome?: {
        success: boolean;
        nextStageId?: string; // ID of the next MinorRealm
        achievedQualityId?: string | null; // ID of the achieved Quality
    };
    activateThienMenhBan?: boolean;
    // Status Effects
    newStatusEffects?: { id: string; duration: number; }[];
    removeStatusEffectIds?: string[];
    // World Structure
    newLocationId?: string;
}

export interface CombatTurnOutcome {
    turnDescription: string;
    playerHpChange: number;
    enemyHpChange: number;
    playerStaminaChange: number;
    playerMentalStateChange: number;
    isFleeSuccessful?: boolean;
    loot?: CombatLoot;
}

export interface CombatLoot {
    lootDescription: string;
    expChange: number;
    newItem?: Item;
}

export interface ScenarioStage {
  id: string;
  text: string;
}

// --- SCENARIO SETUP TYPES ---

export type InitialItemType = 'Tiêu hao' | 'Trang bị' | 'Công pháp' | 'Pháp bảo' | 'Nhiệm vụ' | 'Khác';
export type ConsumableType = 'Đan dược' | 'Thảo dược' | 'Vật liệu' | 'Khoáng thạch' | 'Khác';

export interface InitialItem {
  id: string;
  name: string;
  description: string;
  itemType: InitialItemType;
  consumableType?: ConsumableType;
  equipmentType?: EquipmentType;
  quantity: number;
  attributes?: Partial<PlayerAttributes>;
  effectIds?: string[];
  isCraftable?: boolean;
  nguHanhAttribute?: NguHanhType | '';
  rank?: number;
  // New fields
  attributeDuration?: string;
  usageLimit?: string;
  expPerTurn?: number;
  enableRecovery?: boolean;
  recoveryHp?: number;
  recoverySpiritPower?: number;
  recoveryStamina?: number;
  recoveryMentalState?: number;
  enableRecoveryOverTime?: boolean;
  recoveryDuration?: number;
  imageId?: string;
}

export interface InitialCongPhap {
    id: string;
    name: string;
    description: string;
    techniqueType: TechniqueType;
    attributes?: Partial<PlayerAttributes>;
    effectIds?: string[];
    nguHanhAttribute?: NguHanhType | '';
    rank?: number;
    expPerTurn?: number;
    imageId?: string;
}

export interface InitialNpc {
    id: string;
    name: string;
    description: string;
    relationship?: string;
    imageId?: string;
    sectId?: string | null;
    sectRank?: string | null;
}

export interface InitialSect {
    id: string;
    name: string;
    alignment: 'Chính Đạo' | 'Ma Đạo' | 'Trung Lập';
    description: string;
    locationId?: string | null;
}

export interface InitialLocation {
    id: string;
    name: string;
    description: string;
    provinceId: string;
    type?: 'Quần Cư' | 'Tự Nhiên' | 'Tài Nguyên' | 'Nguy Hiểm' | 'Đặc Biệt' | 'Di Tích Cổ' | 'Bí Cảnh';
    safetyLevel?: 'An Toàn Khu' | 'Trung Lập' | 'Nguy Hiểm' | 'Tử Địa';
    sovereignty?: string;
    resources?: string;
    realmRequirement?: string;
    imageId?: string;
}

export interface InitialProvince {
    id: string;
    name: string;
    description: string;
    worldRegionId: string;
}

export interface InitialWorldRegion {
    id: string;
    name: string;
    description: string;
}

export interface ScenarioData {
  scenarioName: string;
  playerName: string;
  playerAge: number;
  playerBiography: string;
  playerGoals: string;
  enableHeThong: boolean;
  enableAdultContent: boolean;
  linhCanQuality: LinhCanQuality;
  nguHanh: Record<NguHanhType, number>;
  difficulty: GameDifficulty;
  selectedDestinyIds: string[];
  playerSectId: string | null;
  playerSectRank: string | null;
  scenarioSummary: string;
  scenarioStages: ScenarioStage[];
  thienDaoRules: Rule[];
  coreMemoryRules: Rule[];
  initialItems: InitialItem[];
  initialTrangBi: InitialItem[];
  initialPhapBao: InitialItem[];
  initialCongPhap: InitialCongPhap[];
  initialNpcs: InitialNpc[];
  initialSects: InitialSect[];
  initialLocations: InitialLocation[];
  initialProvinces: InitialProvince[];
  initialWorldRegions: InitialWorldRegion[];
  cultivationSystem: CultivationTier[];
  startingLocationId: string | null;
  startingCultivationStageId: string | null;
}

// --- IMAGE LIBRARY TYPES ---
export interface ThienThuImage {
    fileName: string;
    category: string; // e.g., 'tieu_hao', 'trang_bi'
    tags: string[];
}

export interface ThienThuImageCategory {
    name: string; // e.g., 'Tiêu hao'
    tags: string[];
}

export interface ThienThuImageManifest {
    categories: Record<string, ThienThuImageCategory>;
    images: ThienThuImage[];
}