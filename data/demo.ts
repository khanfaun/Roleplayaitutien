

import type { GameState } from '../types';
import { INITIAL_PLAYER_STATS, INITIAL_DONG_PHU_STATE, INITIAL_AI_RULES, INITIAL_THIEN_DAO_RULES, INITIAL_CORE_MEMORY_RULES } from '../constants';

export const DEMO_GAME_STATE: GameState = {
    player: {
        ...INITIAL_PLAYER_STATS,
        name: 'Đạo Hữu Chơi Thử',
        hp: 80,
        spiritPower: 40,
        cultivationStage: 'Luyện Thể Nhị Trọng',
        age: 17,
    },
    inventory: [
        { id: 'demo_item_1', name: 'Thảo Dược Hồi Phục', description: 'Một loại thảo dược thông thường.', category: 'Vật phẩm' },
        { id: 'demo_item_2', name: 'Thiết Kiếm Rỉ Sét', description: 'Một thanh kiếm cũ.', category: 'Trang bị', equipmentType: 'Vũ khí' },
    ],
    quests: [
        {
            id: 'demo_quest_1',
            title: 'Khám phá thế giới',
            description: 'Tìm hiểu về thế giới tu tiên rộng lớn này.',
            type: 'Cốt truyện',
            status: 'Đang tiến hành',
            completionCondition: 'Chơi hết bản thử nghiệm.',
            rewards: { description: 'Trải nghiệm trò chơi.' }
        }
    ],
    board: Array.from({ length: 36 }, (_, i) => ({
        id: i,
        type: i === 0 ? 'Khởi đầu' : (i % 5 === 0 ? 'Kỳ Ngộ' : (i % 3 === 0 ? 'Sự kiện' : 'Ô Trống')),
        description: i === 0 ? 'Điểm bắt đầu' : `Ô số ${i}`
    })),
    currentEvent: {
        description: 'Một con suối nhỏ chảy róc rách gần đó, nước suối trong vắt và tỏa ra linh khí nhàn nhạt.',
        options: [
            'Uống nước suối (Hồi phục thể lực)',
            'Thiền định bên suối (Hồi phục linh lực)',
            'Dùng thần thức dò xét (Có thể phát hiện điều bất thường)',
            'Rời đi (An toàn)',
        ]
    },
    gameLog: [
        { type: 'system', content: 'Chào mừng đến với bản chơi thử của Phi Thăng Bí Sử!' },
        { type: 'ai_story', content: 'Ngươi tỉnh dậy trong một khu rừng lạ lẫm. Ánh nắng xuyên qua tán lá, không khí trong lành mang theo mùi đất ẩm và cỏ cây. Đây là đâu? Ngươi chỉ nhớ mình là một tu sĩ Luyện Thể Kỳ đang trên đường tìm kiếm cơ duyên.' }
    ],
    mapLevel: 1,
    isLoading: false,
    isDead: false,
    tribulationEvent: null,
    combatState: null,
    worldPhase: null,
    recipes: [],
    diceRolls: 5,
    turnCounter: 1,
    dongPhu: INITIAL_DONG_PHU_STATE,
    thienDaoRules: INITIAL_THIEN_DAO_RULES,
    aiRules: INITIAL_AI_RULES,
    coreMemoryRules: INITIAL_CORE_MEMORY_RULES,
    journal: [],
    shortTermMemory: [],
    turnInCycle: 0,
    // FIX: Add missing `unlockedFeatures` property to satisfy HeThongState type.
    heThong: { quests: [], unlockedFeatures: ['thienMenhBan'] },
    isAtBottleneck: false,
    breakthroughReport: null,
    scenarioSummary: 'Bản chơi thử',
    scenarioStages: [],
    cultivationSystem: [],
    thienThu: { vatPhamTieuHao: [], trangBi: [], phapBao: [], congPhap: [], tienThienKhiVan: [], hieuUng: [], trangThai: [] },
    worldData: { worldLocations: [], initialSects: [], initialNpcs: [] },
    inGameNpcs: [],
    discoveredEntityIds: { locations: [], sects: [], npcs: [] },
    currentMapViewId: null,
};
