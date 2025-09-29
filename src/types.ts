// FIX: Replaced entire file content with correct type definitions to resolve circular dependencies and widespread type errors.
export type GameDifficulty = 'Cực dễ' | 'Dễ' | 'Bình thường' | 'Khó' | 'Cực khó';
export type HeThongStatus = 'disabled' | 'inactive' | 'active';
export type NguHanhType = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';
export type LinhCanQuality = 'Thiên Linh Căn' | 'Địa Linh Căn' | 'Huyền Linh Căn' | 'Phàm Linh Căn' | 'Ngụy Linh Căn';
export type EquipmentType = 'Vũ khí' | 'Áo choàng' | 'Giáp' | 'Mũ' | 'Găng tay' | 'Giày' | 'Phụ kiện' | 'Trang sức';
export type TechniqueType = 'Chiến đấu' | 'Phòng thủ' | 'Tu luyện' | 'Tâm pháp' | 'Thân pháp';
export type ConsumableType = 'Đan dược' | 'Thảo dược' | 'Vật liệu' | 'Khoáng thạch' | 'Khác';
export type ItemType = 'Tiêu hao' | 'Nhiệm vụ' | 'Khác' | 'Trang bị' | 'Pháp bảo';
export type RelationshipLevel = 'Thân Thiết Tột Cùng' | 'Đồng Minh / Tích Cực' | 'Trung Lập' | 'Mâu Thuẫn' | 'Thù Địch' | 'Sinh Tử Đại Địch';
export type SectRankPermission = 
    | 'view_treasury'
    | 'request_resources'
    | 'access_basic_techniques'
    | 'access_advanced_techniques'
    | 'access_core_techniques'
    | 'manage_members'
    | 'assign_tasks'
    | 'upgrade_facilities'
    | 'view_member_list';


export interface Relationship {
    targetNpcId: string;
    level: RelationshipLevel;
    description: string;
}

export interface PlayerAttributes {
  physicalStrength: number;
  magicPower: number;
  bodyStrength: number;
  defense: number;
  agility: number;
  spiritualSense: number;
  aptitude: number;
  critChance: number;
  critDamage: number;
}

export interface StatusEffectInstance {
    id: string;
    duration: number; // in turns, -1 for infinite
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
  cultivationStage: string;
  cultivationQuality: string | null;
  cultivationStageId: string;
  cultivationQualityId: string | null;
  position: number;
  currentLocationId: string;
  linhCan: string;
  nguHanh: string;
  sect: string | null;
  sectRank: string | null;
  reputation: Record<string, number>;
  sectContribution: number;
  equippedTechniqueId: string | null;
  equippedTreasureId: string | null;
  attributes: PlayerAttributes;
  difficulty: GameDifficulty;
  selectedDestinyIds: string[];
  heThongStatus: HeThongStatus;
  heThongPoints: number;
  // FIX: Changed type from StatusEffectInstance[] to StatusEffect[] to allow access to properties like `name`.
  statusEffects: StatusEffect[];
}

export interface DongPhuBuilding {
    id: string;
    name: string;
    level: number;
    description: string;
    upgradeCost: { name: string; quantity: number }[];
}

export interface DongPhuState {
    buildings: DongPhuBuilding[];
    lastOnlineTimestamp: number;
}

export interface Rule {
    id: string;
    text: string;
}

export interface RealmQuality {
    id: string;
    rank: number;
    name: string;
    description: string;
    condition: string;
    statBonusMultiplier: number;
    lifespanBonus: number;
}
export interface MinorRealm {
    id: string;
    rank: number;
    name: string;
    description: string;
    isHidden: boolean;
}
export interface MajorRealm {
    id: string;
    rank: number;
    name: string;
    baseLifespan: number;
    description: string;
    hasQualities: boolean;
    minorRealms: MinorRealm[];
    qualities?: RealmQuality[];
}
export interface CultivationTier {
    id: string;
    name: string;
    rank: number;
    realms: MajorRealm[];
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    required: { itemId: string; name: string; quantity: number }[];
    result: { name: string; category: string };
}

export interface WorldPhase {
    name: string;
    description: string;
    effects: {
        description: string;
        type: 'buff' | 'debuff';
        target: 'world' | 'board';
    }[];
    turnsRemaining: number;
}

export interface BoardSquare {
    id: number;
    type: 'Khởi đầu' | 'Sự kiện' | 'May mắn' | 'Xui xẻo' | 'Cột mốc' | 'Kỳ Ngộ' | 'Tâm Ma' | 'Nhân Quả' | 'Thiên Cơ' | 'Thử Luyện' | 'Bế Quan' | 'Hồng Trần' | 'Linh Mạch' | 'Pháp Bảo' | 'Giao Dịch' | 'Tai Ương' | 'Ô Trống';
    description: string;
}

export interface ScenarioStage {
    id: string;
    text: string;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    category: 'Vật phẩm' | 'Trang bị' | 'Nhiệm vụ' | 'Công pháp' | 'Pháp bảo' | 'Linh dược' | 'Khoáng thạch' | 'Vật phẩm Hệ thống';
    attributes?: Partial<PlayerAttributes>;
    effectIds?: string[];
    rank?: number;
    expPerTurn?: number;
    nguHanhAttribute?: NguHanhType | '';
    equipmentType?: EquipmentType;
    imageId?: string;
}

export interface InitialItem {
    id: string;
    name: string;
    description: string;
    itemType: ItemType;
    consumableType?: ConsumableType;
    equipmentType?: EquipmentType;
    quantity: number;
    rank?: number;
    attributes?: Partial<PlayerAttributes>;
    effectIds?: string[];
    nguHanhAttribute?: NguHanhType | '';
    isCraftable?: boolean;
    enableRecovery?: boolean;
    recoveryHp?: number;
    recoverySpiritPower?: number;
    recoveryStamina?: number;
    recoveryMentalState?: number;
    enableRecoveryOverTime?: boolean;
    recoveryDuration?: number;
    usageLimit?: 'không giới hạn' | string;
    attributeDuration?: 'vĩnh viễn' | string;
    expPerTurn?: number;
    imageId?: string;
}

export interface InitialCongPhap {
    id: string;
    name: string;
    description: string;
    techniqueType: TechniqueType;
    rank?: number;
    attributes?: Partial<PlayerAttributes>;
    effectIds?: string[];
    expPerTurn?: number;
    nguHanhAttribute?: NguHanhType | '';
    imageId?: string;
}
export interface InitialNpc {
    id: string;
    name: string;
    description: string;
    relationship?: string;
    personalHistory?: string;
    sectId?: string | null;
    initialLocationId?: string;
    age?: number;
    linhCanQuality?: LinhCanQuality;
    nguHanh?: Record<NguHanhType, number>;
    selectedDestinyIds?: string[];
    startingCultivationStageId?: string | null;
    sectRank?: string | null;
    initialAttitude?: 'Thân thiện' | 'Trung lập' | 'Cảnh giác' | 'Thù địch';
    personality?: 'Ôn hòa' | 'Hiếu chiến' | 'Trung dung' | 'Mưu mô' | '';
    goals?: string;
    initialItems?: InitialItem[];
    initialTrangBi?: InitialItem[];
    initialPhapBao?: InitialItem[];
    initialCongPhap?: InitialCongPhap[];
    imageId?: string;
}
export interface SectRank {
    name: string;
    contributionRequired: number;
    permissions: SectRankPermission[];
}

export interface SectFacility {
    id: string;
    name: string;
    level: number;
    description: string;
    upgradeCost: { itemId: string; quantity: number }[];
}

export interface InitialSect {
    id: string;
    name: string;
    alignment: 'Chính Đạo' | 'Ma Đạo' | 'Trung Lập';
    description: string;
    level?: number;
    locationId?: string;
    parentSectId?: string | null;
    relationships?: Partial<Record<'allied' | 'friendly' | 'neutral' | 'rival' | 'hostile', string[]>>;
    joinRequirement?: string;
    benefits?: string[];
    ranks: SectRank[];
    facilities: SectFacility[];
    treasury: Record<string, number>;
}


// FIX: Add Sect type alias to resolve import errors in older files.
export type Sect = InitialSect;

export interface WorldLocation {
    id: string;
    name: string;
    description: string;
    level: number;
    parentId: string | null;
    controllingSectIds: string[];
    type: 'Quần Cư' | 'Tự Nhiên' | 'Tài Nguyên' | 'Đặc Biệt' | 'Di Tích Cổ' | 'Bí Cảnh' | 'Nguy Hiểm';
    safetyLevel?: 'An Toàn Khu' | 'Trung Lập' | 'Nguy Hiểm' | 'Tử Địa';
    sovereigntyType?: 'autonomous' | 'dependent';
    resources?: string;
    realmRequirement?: string;
    isPlayerHome?: boolean;
    imageId?: string;
    x?: number;
    y?: number;
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
    worldLocations: WorldLocation[];
    cultivationSystem: CultivationTier[];
    startingLocationId: string | null;
    startingCultivationStageId: string | null;
}

export interface LogEntry {
    type: 'player_choice' | 'player_input' | 'ai_story' | 'system' | 'dice_roll' | 'he_thong' | 'event' | 'tribulation' | 'status_effect';
    content: string;
}
export type EventOption = string | EventOptionObject;

export interface EventOptionObject {
    text: string;
    tooltip: string;
}
export interface CurrentEvent {
    description: string;
    options: EventOption[];
}
export interface HeThongQuest {
    id: string;
    title: string;
    description: string;
    type: 'Bình thường' | 'Sự kiện đặc biệt' | 'Nhiệm vụ tối thượng';
    status: 'Đang tiến hành' | 'Hoàn thành' | 'Thất bại';
    rewards: {
        description: string;
        heThongPoints?: number;
        items?: Item[];
    };
    penalties?: {
        description: string;
        hpChange?: number;
        heThongPointsChange?: number;
    };
    timeLimit?: number;
    hiddenObjective?: {
        description: string;
        condition: string;
        rewards: HeThongQuest['rewards'];
        completed: boolean;
    };
}
export interface HeThongState {
    quests: HeThongQuest[];
    unlockedFeatures: string[]; // ví dụ: 'thienMenhBan', 'dongPhu'
}
export interface CombatState {
    enemyName: string;
    enemyHp: number;
    enemyMaxHp: number;
    enemyDescription: string;
    combatLog: string[];
}
export interface Quest {
    id: string;
    title: string;
    description: string;
    type: 'Cốt truyện' | 'Phụ' | 'Môn phái';
    status: 'Đang tiến hành' | 'Hoàn thành' | 'Thất bại';
    timeLimit?: number;
    progress?: number;
    target?: number;
    completionCondition: string;
    rewards: {
        description: string;
        expChange?: number;
        items?: Item[];
        reputationChange?: { faction: string; change: number }[];
        sectContributionChange?: number;
    };
    penalties?: {
        description: string;
        hpChange?: number;
        mentalStateChange?: number;
        reputationChange?: { faction: string; change: number }[];
    };
}

export interface JournalEntry {
    id: string;
    turn: number;
    text: string;
}

export interface NpcCharacter extends Player {
    // FIX: Add `id` property to uniquely identify NPCs, fixing multiple downstream errors.
    id: string;
    // FIX: Added 'description' property to align with InitialNpc and fix usage errors.
    description: string;
    initialAttitude?: 'Thân thiện' | 'Trung lập' | 'Cảnh giác' | 'Thù địch';
    attitudeTowardsPC: number;
    personality?: 'Ôn hòa' | 'Hiếu chiến' | 'Trung dung' | 'Mưu mô' | '';
    personalHistory?: string;
    initialItems?: InitialItem[];
    initialTrangBi?: InitialItem[];
    initialPhapBao?: InitialItem[];
    initialCongPhap?: InitialCongPhap[];
    imageId?: string;
    relationships?: Relationship[];
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
    cultivationSystem: CultivationTier[];
    thienThu: ThienThuData;
    worldData: {
        worldLocations: WorldLocation[];
        initialSects: InitialSect[];
        initialNpcs: InitialNpc[];
    };
    inGameNpcs: NpcCharacter[];
    discoveredEntityIds: {
        locations: string[];
        sects: string[];
        npcs: string[];
    };
    currentMapViewId: string | null;
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

export interface ActionOutcome {
    outcomeDescription: string;
    hpChange: number;
    expChange: number;
    spiritPowerChange: number;
    staminaChange: number;
    mentalStateChange: number;
    daysToAdvance: number;
    journalEntry: string;
    newItem?: Item;
    newRecipe?: Recipe;
    newQuest?: Omit<Quest, 'id' | 'status'>;
    questUpdates?: {
        questId: string;
        newStatus?: 'Hoàn thành' | 'Thất bại';
        progressChange?: number;
    }[];
    reputationChange?: { faction: string; change: number }[];
    attributeChanges?: Partial<PlayerAttributes>;
    sectContributionChange?: number;
    diceRollsChange?: number;
    joinSect?: string;
    combatTrigger?: {
        enemyName: string;
        enemyHp: number;
        enemyDescription: string;
    };
    nextEvent: CurrentEvent | null;
    awakenHeThong?: boolean;
    heThongPointsChange?: number;
    newHeThongQuest?: Omit<HeThongQuest, 'id' | 'status'>;
    heThongQuestUpdates?: {
        questId: string;
        newStatus?: 'Hoàn thành' | 'Thất bại';
        hiddenObjectiveCompleted?: boolean;
        unlockSystemFeature?: string;
    }[];
    tribulationOutcome?: {
        success: boolean;
        nextStageId?: string;
        achievedQualityId?: string;
    };
    newStatusEffects?: { id: string; duration: number }[];
    removeStatusEffectIds?: string[];
    newLocationId?: string;
    newlyDiscoveredIds?: {
        locations?: string[];
        sects?: string[];
        npcs?: string[];
    };
    npcRelationshipChanges?: { npcId: string; newRelationship: Relationship }[];
}

export interface CombatTurnOutcome {
    turnDescription: string;
    playerHpChange: number;
    enemyHpChange: number;
    playerStaminaChange: number;
    playerMentalStateChange: number;
    isFleeSuccessful?: boolean;
    loot?: {
        lootDescription: string;
        expChange: number;
        newItem?: Item;
    };
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

export interface StatusEffect extends StatusEffectInstance {
    id: string;
    name: string;
    description: string;
    type: 'buff' | 'debuff' | 'neutral';
    duration: number; // in turns, -1 for infinite
    effects?: {
        primaryStatChangePercent?: Partial<Record<keyof Omit<Player, 'attributes' | 'name' | 'selectedDestinyIds' | 'statusEffects'>, number>>;
        attributeChangePercent?: Partial<PlayerAttributes>;
    };
    expPerTurn?: number;
}
export interface ItemEffectDefinition {
    id: string;
    name: string;
    description: string;
    category: 'consumable' | 'equipment' | 'treasure' | 'technique';
    rank: number;
    useEffects?: {
        statusEffect?: { id: string; duration: number };
        expChange?: number;
        hpChange?: number;
        spiritPowerChange?: number;
        staminaChange?: number;
        mentalStateChange?: number;
    };
    passiveEffects?: {
        attributeChange?: Partial<PlayerAttributes>;
        primaryStatChange?: Partial<Record<keyof Omit<Player, 'attributes' | 'name' | 'selectedDestinyIds' | 'statusEffects'>, number>>;
    };
    allowedEquipmentTypes?: EquipmentType[];
    allowedTechniqueTypes?: TechniqueType[];
    expPerTurn?: number;
}

export interface DestinyDefinition {
    id: string;
    name: string;
    description: string;
    rank: number;
    cost: number;
    effects?: {
        primaryStatChange?: Partial<Record<keyof Omit<Player, 'attributes' | 'name' | 'selectedDestinyIds' | 'statusEffects' | 'difficulty' | 'heThongStatus'>, number>>;
        attributeChange?: Partial<PlayerAttributes>;
    };
    expPerTurn?: number;
}

export interface ThienThuImage {
    fileName: string;
    category: string;
    tags: string[];
}

export interface ThienThuImageManifest {
    categories: Record<string, { name: string; tags: string[] }>;
    images: ThienThuImage[];
}