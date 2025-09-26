

import type { ScenarioStage, InitialItem, InitialCongPhap, InitialNpc, InitialSect, WorldLocation, Rule, CultivationTier, MinorRealm } from '../../types';
import { DEBA_5_MINOR_REALMS } from './helpers';

// --- ĐẾ BÁ (Emperor's Domination) - ĐỒNG NHÂN ---
export const DEBA_PLAYER_NAME = "Lâm Phong";
export const DEBA_PLAYER_BIOGRAPHY = "Một đệ tử ngoại môn của Tẩy Nhan Cổ Phái, tư chất bình thường, cam chịu số phận. Trong một lần bị ức hiếp và rơi xuống vực sâu, hắn tình cờ nhặt được một mảnh gương vỡ, 'Ma Ha Cổ Kính'. Mảnh gương chứa đựng một tia tàn niệm và một phần ký ức vô cùng hỗn loạn của Âm Nha - Lý Thất Dạ. Hắn không phải Lý Thất Dạ, mà chỉ là một người bình thường đột nhiên sở hữu một di sản và một gánh nặng quá lớn.";
export const DEBA_PLAYER_GOALS = "Sống sót, tìm hiểu bí mật của Ma Ha Cổ Kính, chưởng khống sức mạnh của Âm Nha để không bị nó nuốt chửng, và từng bước đi lên từ một đệ tử ngoại môn, đối mặt với những kẻ thù mà Lý Thất Dạ đã từng đắc tội trong quá khứ.";
export const DEBA_SUMMARY = "Đây là câu chuyện về một người bình thường phải gánh vác di sản của một huyền thoại. Lâm Phong sẽ phải dựa vào những mảnh ký ức rời rạc và những công pháp bá đạo không hoàn chỉnh từ tàn niệm của Âm Nha để sinh tồn. Hắn không có sự tự tin và kiến thức vô tận của Lý Thất Dạ, mỗi bước đi đều là một lần dò dẫm, mỗi quyết định đều có thể dẫn đến cái chết. Hắn phải đối mặt với sự nghi ngờ từ những người xung quanh và sự truy lùng của những kẻ địch nhận ra khí tức của Âm Nha trên người hắn.";
export const DEBA_STAGES: ScenarioStage[] = [
    { id: 'deba_dn_stage_1', text: "Bị các sư huynh trong Tẩy Nhan Cổ Phái ức hiếp, đẩy xuống vực thẳm." },
    { id: 'deba_dn_stage_2', text: "Dưới vực, hắn tìm thấy mảnh Ma Ha Cổ Kính và bị tàn niệm của Âm Nha xâm nhập." },
    { id: 'deba_dn_stage_3', text: "Trong đầu hắn xuất hiện vô số ký ức hỗn loạn và một phần công pháp 'Tù Ngưu Công'." }
 
];
export const DEBA_THIEN_DAO_RULES: Rule[] = [
    { id: 'deba_td_1', text: "Vạn vật trong Cửu Giới đều có thể tu luyện, từ một con cá chép cho đến một cây liễu." },
    { id: 'deba_td_2', text: "Mệnh Cung là căn cơ của tu sĩ, số lượng Mệnh Cung quyết định tiềm năng và sức mạnh." },
    { id: 'deba_dn_td_3', text: "Di sản của Lý Thất Dạ là một con dao hai lưỡi, có thể mang lại sức mạnh vô song nhưng cũng có thể dẫn đến sự chú ý của những tồn tại không thể tưởng tượng nổi." }
];
export const DEBA_ITEMS: InitialItem[] = [
    { id: 'ma_ha_co_kinh', name: "Ma Ha Cổ Kính (Mảnh vỡ)", description: "Một mảnh gương cổ xưa, bề mặt lấp lánh những phù văn không thể hiểu nổi, ẩn chứa tàn niệm và ký ức của Âm Nha.", itemType: 'Nhiệm vụ', quantity: 1 }
];
export const DEBA_TRANG_BI: InitialItem[] = [];
export const DEBA_PHAP_BAO: InitialItem[] = [];
export const DEBA_CONG_PHAP: InitialCongPhap[] = [
    { id: 'tẩy_nhan_tam_phap', name: "Tẩy Nhan Tâm Pháp", description: "Công pháp nhập môn của Tẩy Nhan Cổ Phái, vô cùng bình thường, hầu như không có điểm gì đặc biệt.", techniqueType: 'Tu luyện', attributes: { aptitude: 1 }, effectIds: ['tu_linh'] }
];
export const DEBA_NPCS: InitialNpc[] = [];
export const DEBA_SECTS: InitialSect[] = [
// FIX: Add missing properties `ranks`, `facilities`, and `treasury` to conform to the InitialSect type.
    { id: 'tay_nhan_co_phai', name: "Tẩy Nhan Cổ Phái", alignment: 'Trung Lập', description: "Một Đế thống tiên môn đã từng huy hoàng dưới thời Minh Nhân Tiên Đế, nay đã sa sút không phanh.", ranks: [], facilities: [], treasury: {} }
];
export const DEBA_WORLD_LOCATIONS: WorldLocation[] = [];
const DEBA_CULTIVATION_SYSTEM_DATA: CultivationTier[] = [
    {
        id: 'deba_tier_1', name: 'Đạo Cơ', rank: 1,
        realms: [
            {
                id: 'deba_realm_1', rank: 1, name: "Tẩy Nhan", baseLifespan: 100, description: "Tẩy đi bụi trần, mở ra Mệnh Cung, bước đầu tu đạo.", hasQualities: true,
                minorRealms: DEBA_5_MINOR_REALMS.map((mr, i) => ({ ...mr, id: `deba_realm_1_minor_${i+1}` })),
                qualities: [
                    { id: 'deba_thechat_q_1', rank: 1, name: 'Phàm Thể', description: 'Thể chất bình thường, không có gì đặc biệt.', condition: 'Hoàn thành Tẩy Nhan một cách thông thường.', statBonusMultiplier: 1.0, lifespanBonus: 0 },
                    { id: 'deba_thechat_q_2', rank: 2, name: 'Tiên Thiên Thể', description: 'Thể chất được thiên địa ưu ái, tu luyện nhanh hơn.', condition: 'Có kỳ ngộ trong quá trình Tẩy Nhan.', statBonusMultiplier: 1.2, lifespanBonus: 20 },
                    { id: 'deba_thechat_q_3', rank: 3, name: 'Thánh Thể', description: 'Một trong các loại Thánh Thể trong truyền thuyết, tiềm năng vô hạn.', condition: 'Có đại cơ duyên, thức tỉnh huyết mạch cổ xưa.', statBonusMultiplier: 1.5, lifespanBonus: 50 },
                ]
            },
            {
                id: 'deba_realm_2', rank: 2, name: "Dục Thần", baseLifespan: 200, description: "Tư dưỡng Chân Mệnh, khiến nó lớn mạnh.", hasQualities: false,
                minorRealms: DEBA_5_MINOR_REALMS.map((mr, i) => ({ ...mr, id: `deba_realm_2_minor_${i+1}` })),
            },
            {
                id: 'deba_realm_3', rank: 3, name: "Trấn Ngục", baseLifespan: 400, description: "Chân Mệnh hóa thành thần chỉ, trấn giữ trong Mệnh Cung.", hasQualities: false,
                minorRealms: DEBA_5_MINOR_REALMS.map((mr, i) => ({ ...mr, id: `deba_realm_3_minor_${i+1}` })),
            },
            {
                id: 'deba_realm_4', rank: 4, name: "Uẩn Thể", baseLifespan: 800, description: "Dùng huyết khí nuôi dưỡng Thể Phách, khiến nó trở nên cường đại.", hasQualities: false,
                minorRealms: DEBA_5_MINOR_REALMS.map((mr, i) => ({ ...mr, id: `deba_realm_4_minor_${i+1}` })),
            },
        ]
    }
];
export const DEBA_CULTIVATION_SYSTEM: CultivationTier[] = DEBA_CULTIVATION_SYSTEM_DATA;
