import type { ScenarioStage, InitialItem, InitialCongPhap, InitialNpc, InitialSect, WorldLocation, Rule, CultivationTier, MinorRealm, RealmQuality } from '../../types';
import { STANDARD_3_MINOR_REALMS, kimDanQualities } from './helpers';

// --- PHÀM NHÂN TU TIÊN (A Record of a Mortal's Journey to Immortality) - ĐỒNG NHÂN ---
export const PNTT_PLAYER_NAME = "Trần Minh";
export const PNTT_PLAYER_BIOGRAPHY = "Một thiếu niên có tư chất tu tiên tam linh căn, không cao không thấp, nhưng từ nhỏ đã có thiên phú đặc biệt với các loại hình vẽ và kết cấu phức tạp. Hắn có thể dễ dàng ghi nhớ và phân tích các đồ án trận pháp chỉ sau một lần nhìn. Ước mơ của hắn không phải là trường sinh bất tử, mà là tạo ra một tòa 'Vạn Tiên Trận' trong truyền thuyết, có khả năng tru sát cả Chân Tiên.";
export const PNTT_PLAYER_GOALS = "Trở thành một Trận Pháp Tông Sư vĩ đại nhất, tìm kiếm các trận đồ cổ xưa bị thất lạc, và tự mình sáng tạo ra những đại trận kinh thiên động địa.";
export const PNTT_SUMMARY = "Trong thế giới tu tiên tàn khốc của Phàm Nhân, Trần Minh không có tiểu bình thần bí, chỉ có một bộ não và đôi tay trời sinh để khắc họa trận văn. Hắn sẽ phải dùng trí tuệ của mình để bù đắp cho tư chất không xuất chúng, dùng trận pháp để vượt cấp giết địch, dùng cạm bẫy để tính kế những lão quái vật. Hành trình của hắn là con đường của một Trận Pháp Sư, nơi mỗi bước đi đều là một lần bố cục, mỗi trận chiến đều là một ván cờ sinh tử.";
export const PNTT_STAGES: ScenarioStage[] = [
    { id: 'pntt_dn_stage_1', text: "Bị một tán tu lừa bán vào một hắc điếm chuyên khai thác khoáng thạch." },
    { id: 'pntt_dn_stage_2', text: "Trong lúc lao động khổ sai, phát hiện các đường vân tự nhiên trên khoáng thạch có khả năng dẫn dắt linh khí." },
    { id: 'pntt_dn_stage_3', text: "Lén lút học hỏi, dùng các mảnh khoáng thạch phế liệu để thử nghiệm khắc họa các trận văn đơn giản." }
];
export const PNTT_THIEN_DAO_RULES: Rule[] = [
    { id: 'pntt_td_1', text: "Tài nguyên tu luyện cực kỳ quan trọng và khan hiếm." },
    { id: 'pntt_td_2', text: "Tu sĩ cấp cao có thể đoạt xá, phải luôn cẩn trọng với những linh hồn mạnh mẽ." },
    { id: 'pntt_dn_td_3', text: "Trận pháp có thể thay đổi địa thế, nghịch chuyển càn khôn, nhưng布阵 cần thời gian và tài liệu quý giá." }
];
export const PNTT_ITEMS: InitialItem[] = [
    { id: 'tran_phap_co_ban', name: "Trận Pháp Cơ Bản", description: "Một cuốn sách da thú cũ kỹ, ghi lại những kiến thức nhập môn về trận pháp.", itemType: 'Nhiệm vụ', quantity: 1 },
    { id: 'linh_thach_ha_pham', name: "Linh Thạch Hạ Phẩm", description: "Đơn vị tiền tệ và cũng là nguồn cung cấp linh khí cơ bản cho tu sĩ và trận pháp.", itemType: 'Tiêu hao', consumableType: 'Khoáng thạch', quantity: 20 }
];
export const PNTT_TRANG_BI: InitialItem[] = [
    { id: 'vai_bo_ao', name: "Vải Bố Y", description: "Trang phục bình thường của tán tu, không có khả năng phòng ngự đặc biệt.", itemType: 'Trang bị', equipmentType: 'Áo choàng', quantity: 1, attributes: { defense: 1 } }
];
export const PNTT_PHAP_BAO: InitialItem[] = [
    { id: 'khac_tran_but', name: "Khắc Trận Bút", description: "Một cây bút pháp khí cấp thấp, dùng để khắc họa các trận văn đơn giản lên trận kỳ hoặc trận bàn.", itemType: 'Pháp bảo', quantity: 1, attributes: { spiritualSense: 5 }, effectIds: ['dien_thien_co'] }
];
export const PNTT_CONG_PHAP: InitialCongPhap[] = [
    { id: 'ngung_than_quyet', name: "Ngưng Thần Quyết", description: "Công pháp cơ bản giúp tu sĩ ngưng tụ thần thức, là nền tảng cho việc điều khiển trận pháp.", techniqueType: 'Tu luyện', attributes: { spiritualSense: 3 }, effectIds: ['thanh_tam_quyet'] }
];
export const PNTT_NPCS: InitialNpc[] = [];
export const PNTT_SECTS: InitialSect[] = [];
export const PNTT_WORLD_LOCATIONS: WorldLocation[] = [];
const PNTT_CULTIVATION_SYSTEM_DATA: CultivationTier[] = [
    {
        id: 'pntt_tier_1', name: 'Nhân Giới Thiên', rank: 1,
        realms: [
            {
                id: 'pntt_realm_1', rank: 1, name: "Luyện Khí", baseLifespan: 120, description: "Hấp thụ linh khí, tẩy kinh phạt tủy, bước đầu tiên trên con đường tu tiên.", hasQualities: false,
                minorRealms: Array.from({ length: 13 }, (_, i) => ({ id: `pntt_realm_1_minor_${i + 1}`, rank: i + 1, name: `Tầng ${i + 1}`, description: `Tầng ${i + 1} của Luyện Khí Kỳ.`, isHidden: false })),
            },
            {
                id: 'pntt_realm_2', rank: 2, name: "Trúc Cơ", baseLifespan: 250, description: "Linh khí hóa dịch, thần thức đại tăng, chính thức thoát ly phàm nhân.", hasQualities: false,
                minorRealms: STANDARD_3_MINOR_REALMS.map((mr, i) => ({ ...mr, id: `pntt_realm_2_minor_${i+1}` })),
            },
            {
                id: 'pntt_realm_3', rank: 3, name: "Kết Đan", baseLifespan: 500, description: "Ngưng tụ Kim Đan, pháp lực hùng hậu, bắt đầu có vị thế trong giới tu tiên.", hasQualities: true,
                minorRealms: STANDARD_3_MINOR_REALMS.map((mr, i) => ({ ...mr, id: `pntt_realm_3_minor_${i+1}` })),
                qualities: kimDanQualities.map(q => ({
                    id: `pntt_ketdan_q_${q.rank}`, rank: q.rank, name: `${q.name} Kim Đan`,
                    description: `Kim đan phẩm chất ${q.name}, phẩm chất càng cao, tiềm năng càng lớn.`,
                    condition: 'Phụ thuộc vào công pháp, tài liệu và quá trình kết đan.',
                    statBonusMultiplier: 1.0 + ((q.rank - 1) * 0.1), lifespanBonus: (q.rank - 1) * 15,
                }))
            },
            {
                id: 'pntt_realm_4', rank: 4, name: "Nguyên Anh", baseLifespan: 1200, description: "Phá đan thành anh, có thể đoạt xá trùng sinh, trở thành lão quái một phương.", hasQualities: false,
                minorRealms: STANDARD_3_MINOR_REALMS.map((mr, i) => ({ ...mr, id: `pntt_realm_4_minor_${i+1}` })),
            },
            {
                id: 'pntt_realm_5', rank: 5, name: "Hóa Thần", baseLifespan: 3000, description: "Câu thông thiên địa, lĩnh ngộ quy tắc, thần thông quảng đại.", hasQualities: false,
                minorRealms: STANDARD_3_MINOR_REALMS.map((mr, i) => ({ ...mr, id: `pntt_realm_5_minor_${i+1}` })),
            },
        ]
    }
];
export const PNTT_CULTIVATION_SYSTEM: CultivationTier[] = PNTT_CULTIVATION_SYSTEM_DATA;