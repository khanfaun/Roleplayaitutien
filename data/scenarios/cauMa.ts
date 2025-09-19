import type { ScenarioStage, InitialItem, InitialCongPhap, InitialNpc, InitialSect, WorldLocation, Rule, CultivationTier, MinorRealm } from '../../types';
import { STANDARD_4_MINOR_REALMS_DV } from './helpers';

// --- CẦU MA (Beseech the Devil) - ĐỒNG NHÂN ---
export const CAUMA_PLAYER_NAME = "Thạch Nham";
export const CAUMA_PLAYER_BIOGRAPHY = "Một thiếu niên câm lặng của Hắc Sơn Bộ, một bộ lạc nhỏ bé luôn bị các bộ lạc lớn hơn chèn ép. Hắn không có thiên phú về Man thuật, nhưng lại sở hữu một sức mạnh thể chất và sức chịu đựng kinh người. Trong một lần bộ lạc bị tấn công, hắn vô tình thức tỉnh huyết mạch Man tộc cổ xưa 'Bất Động Minh Vương', có khả năng hấp thụ sức mạnh của đại địa để cường hóa bản thân.";
export const CAUMA_PLAYER_GOALS = "Bảo vệ bộ lạc của mình, tìm lại vinh quang cho huyết mạch Bất Động Minh Vương đã bị lãng quên, và dùng nắm đấm của mình để đập tan mọi xiềng xích của số phận bi thương trong thế giới này.";
export const CAUMA_SUMMARY = "Trong thế giới Cầu Ma đầy bi thương và chấp niệm, Thạch Nham không đi theo con đường của Tô Minh. Hắn là một kẻ tu Man thuần túy, lấy thân thể làm lò luyện, lấy đại địa làm linh hồn. Con đường của hắn là ý chí bất khuất, là sự bảo vệ, là dùng sức mạnh nguyên thủy nhất để chống lại số phận. Hắn sẽ phải đối mặt với sự khinh thường của những kẻ tu Man thuật, sự săn đuổi của các thế lực mạnh mẽ, và tìm ra sự thật đằng sau sự lụi tàn của huyết mạch Bất Động Minh Vương.";
export const CAUMA_STAGES: ScenarioStage[] = [
    { id: 'cauma_dn_stage_1', text: "Hắc Sơn Bộ bị Huyết Lang Bộ uy hiếp, yêu cầu cống nạp. Thạch Nham, thiếu niên câm lặng, chỉ biết siết chặt nắm đấm." },
    { id: 'cauma_dn_stage_2', text: "Huyết Lang Bộ tấn công, tộc trưởng trọng thương. Trong cơn tuyệt vọng, Thạch Nham lao ra, cơ thể bộc phát ánh sáng màu vàng đất." },
    { id: 'cauma_dn_stage_3', text: "Huyết mạch Bất Động Minh Vương thức tỉnh, Thạch Nham hấp thụ sức mạnh đại địa, đẩy lùi kẻ địch. Hắn kiệt sức ngất đi." }
  
];
export const CAUMA_THIEN_DAO_RULES: Rule[] = [
    { id: 'cauma_td_1', text: "Ý chí và执念 (chấp niệm) có thể thay đổi thực tại và sinh ra sức mạnh không tưởng." },
    { id: 'cauma_td_2', text: "Số phận là một thực thể hữu hình, có thể bị cảm nhận và chống lại." },
    { id: 'cauma_dn_td_3', text: "Sức mạnh của đại địa là cội nguồn của Man tộc, kẻ nào có thể kết nối với nó sẽ có được sức mạnh vô biên." }
];
export const CAUMA_ITEMS: InitialItem[] = [
    { id: 'man_cot_mat_day', name: "Man Cốt Mật Dày", description: "Mật của một loại Man thú, có tác dụng cường hóa xương cốt.", itemType: 'Tiêu hao', consumableType: 'Thảo dược', quantity: 2, attributes: { bodyStrength: 2 } }
];
export const CAUMA_TRANG_BI: InitialItem[] = [
    { id: 'thu_bi_chien_giap', name: "Thú Bì Chiến Giáp", description: "Bộ giáp làm từ da của mãnh thú, cung cấp khả năng phòng ngự cơ bản.", itemType: 'Trang bị', equipmentType: 'Giáp', quantity: 1, attributes: { defense: 5 }, effectIds: ['bat_hoai'] }
];
export const CAUMA_PHAP_BAO: InitialItem[] = [];
export const CAUMA_CONG_PHAP: InitialCongPhap[] = [
    { id: 'dai_dia_quyet', name: "Đại Địa Quyết", description: "Man thuật nhập môn, giúp cảm nhận và hấp thụ một phần nhỏ sức mạnh từ mặt đất.", techniqueType: 'Tu luyện', attributes: { bodyStrength: 5, defense: 2 }, effectIds: ['luyen_the'] }
];
export const CAUMA_NPCS: InitialNpc[] = [];
export const CAUMA_SECTS: InitialSect[] = [];
export const CAUMA_WORLD_LOCATIONS: WorldLocation[] = [];
const CAUMA_CULTIVATION_SYSTEM_DATA: CultivationTier[] = [
    {
        id: 'cauma_tier_1', name: 'Man Tu Chi Lộ', rank: 1,
        realms: [
            {
                id: 'cauma_realm_1', rank: 1, name: "Ngưng Huyết", baseLifespan: 150, description: "Đánh thức huyết mạch Man tộc, khí huyết toàn thân ngưng tụ, sức mạnh tăng vọt.", hasQualities: false,
                minorRealms: Array.from({ length: 9 }, (_, i) => ({ id: `cauma_realm_1_minor_${i + 1}`, rank: i + 1, name: `Tầng ${i + 1}`, description: `Tầng ${i + 1} của Ngưng Huyết Cảnh.`, isHidden: false })),
            },
            {
                id: 'cauma_realm_2', rank: 2, name: "Khai Trần", baseLifespan: 300, description: "Mở ra Man Mạch, cảm ngộ Man Tượng, sức mạnh vượt xa phàm nhân.", hasQualities: true,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `cauma_realm_2_minor_${i+1}` })),
                qualities: [
                    { id: 'cauma_khaitran_q_1', rank: 1, name: 'Hư Tượng', description: 'Man Tượng ngưng tụ không thực, tiềm năng có hạn.', condition: 'Miễn cưỡng vượt qua, ý chí không đủ.', statBonusMultiplier: 1.0, lifespanBonus: 0 },
                    { id: 'cauma_khaitran_q_2', rank: 2, name: 'Thực Tượng', description: 'Man Tượng vững chắc, có thể phát huy một phần uy năng.', condition: 'Ý chí kiên định, có kỳ ngộ.', statBonusMultiplier: 1.2, lifespanBonus: 50 },
                    { id: 'cauma_khaitran_q_3', rank: 3, name: 'Thần Tượng', description: 'Man Tượng có linh, ẩn chứa ý chí của Man Thần cổ đại.', condition: 'Ý chí kinh người, huyết mạch tinh thuần.', statBonusMultiplier: 1.5, lifespanBonus: 100 },
                ]
            },
            {
                id: 'cauma_realm_3', rank: 3, name: "Tế Cốt", baseLifespan: 800, description: "Lấy xương của chính mình để tế luyện Man Thần, mỗi một khúc xương đều ẩn chứa sức mạnh to lớn.", hasQualities: false,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `cauma_realm_3_minor_${i+1}` })),
            },
            {
                id: 'cauma_realm_4', rank: 4, name: "Man Hồn", baseLifespan: 2000, description: "Linh hồn hòa làm một với Man Tượng, ý chí bất diệt, thân thể khó hủy.", hasQualities: false,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `cauma_realm_4_minor_${i+1}` })),
            },
        ]
    }
];
export const CAUMA_CULTIVATION_SYSTEM: CultivationTier[] = CAUMA_CULTIVATION_SYSTEM_DATA;