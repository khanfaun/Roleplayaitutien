import type { ScenarioStage, InitialItem, InitialCongPhap, InitialNpc, InitialSect, WorldLocation, Rule, CultivationTier, MinorRealm } from '../../types';
import { STANDARD_4_MINOR_REALMS_DV } from './helpers';

// --- NHẤT NIỆM VĨNH HẰNG (A Will Eternal) - ĐỒNG NHÂN ---
export const NNVH_PLAYER_NAME = "Lãnh Nguyệt";
export const NNVH_PLAYER_BIOGRAPHY = "Sinh ra trong một gia đình thợ rèn phàm nhân, Lãnh Nguyệt từ nhỏ đã chứng kiến những tác phẩm tâm huyết nhất của cha mình bị thời gian bào mòn. Điều đó gieo vào lòng nàng một chấp niệm: tìm kiếm sự vĩnh hằng. Nàng không sợ chết, chỉ sợ sự lụi tàn. Đối với nàng, vạn vật trong trời đất, từ kim loại, linh thảo, cho đến cả sinh mệnh, đều là vật liệu để nàng thực hiện con đường Luyện Linh, đưa chúng đến một sự tồn tại bất diệt.";
export const NNVH_PLAYER_GOALS = "Tìm ra 'Vĩnh Hằng Chi Lô' trong truyền thuyết, hoàn thành lần Luyện Linh thứ 100 thần thoại, và cuối cùng, Luyện Linh chính bản thân mình để trở thành một tồn tại vĩnh hằng thực sự.";
export const NNVH_SUMMARY = "Trong thế giới Nhất Niệm Vĩnh Hằng, Lãnh Nguyệt đi trên một con đường đối lập hoàn toàn với Bạch Tiểu Thuần. Nàng lạnh lùng, quyết đoán, và theo đuổi sức mạnh một cách cực đoan thông qua Luyện Linh. Hành trình của nàng sẽ đầy rẫy những thử nghiệm nguy hiểm, tạo ra những pháp bảo có linh trí và sức mạnh không thể kiểm soát. Nàng sẽ phải đối mặt với những nhân quả do chính sự chấp nhất của mình gây ra, và học cách cân bằng giữa việc theo đuổi sức mạnh và giữ lại nhân tính của mình.";
export const NNVH_STAGES: ScenarioStage[] = [
    { id: 'nnvh_dn_stage_1', text: "Ám ảnh bởi sự lụi tàn của các tác phẩm rèn của cha, Lãnh Nguyệt quyết tâm tìm con đường tu tiên để chống lại thời gian." },
    { id: 'nnvh_dn_stage_2', text: "Sau nhiều gian khổ, nàng gia nhập Linh Khê Tông và được phân vào Hỏa Táo Phòng vì có kinh nghiệm với lửa." },
    { id: 'nnvh_dn_stage_3', text: "Trong một góc kho cũ kỹ, nàng tình cờ tìm thấy quyển 'Luyện Linh Sơ Giải', ghi lại các phương pháp Luyện Linh cổ xưa." }

];
export const NNVH_THIEN_DAO_RULES: Rule[] = [
    { id: 'nnvh_td_1', text: "Luyện đan và Luyện linh có thể tạo ra những kết quả không thể lường trước, đôi khi là tai họa." },
    { id: 'nnvh_td_2', text: "Thiên địa có ý chí, việc đi ngược lại ý trời (như trường sinh) sẽ gặp phải vô vàn trắc trở." },
    { id: 'nnvh_dn_td_3', text: "Luyện Linh quá nhiều lần sẽ khiến vật phẩm sinh ra linh trí không ổn định, có thể phản chủ." },
    { id: 'nnvh_dn_td_4', text: "Luyện Linh sinh mệnh là một điều cấm kỵ, có thể dẫn đến hậu quả không thể tưởng tượng nổi." }
];
export const NNVH_ITEMS: InitialItem[] = [
    { id: 'luyen_linh_so_giai', name: "Luyện Linh Sơ Giải", description: "Một quyển sách da thú cũ nát, ghi lại những phương pháp Luyện Linh cơ bản nhưng có phần khác biệt so với chính thống.", itemType: 'Nhiệm vụ', quantity: 1 },
    { id: 'thiet_tinh', name: "Thiết Tinh", description: "Khoáng thạch cấp thấp, dùng để luyện khí và thử nghiệm Luyện Linh.", itemType: 'Tiêu hao', consumableType: 'Khoáng thạch', quantity: 10 }
];
export const NNVH_TRANG_BI: InitialItem[] = [
    { id: 'hac_thiet_chuy', name: "Hắc Thiết Chủy", description: "Một cây chủy thủ bằng hắc thiết, được Luyện Linh một lần, vô cùng sắc bén.", itemType: 'Trang bị', equipmentType: 'Vũ khí', quantity: 1, attributes: { physicalStrength: 5 }, effectIds: ['pha_giap'] }
];
export const NNVH_PHAP_BAO: InitialItem[] = [
    { id: 'huyen_quy_trac', name: "Huyền Quy Trạc", description: "Vòng tay được làm từ mai của một con rùa đen nhỏ. Sau khi được Luyện Linh hai lần, nó có khả năng cảm ứng với các loại khoáng thạch.", itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, attributes: { defense: 5 }, effectIds: ['than_minh'] }
];
export const NNVH_CONG_PHAP: InitialCongPhap[] = [
    { id: 'khong_hoa_quyet', name: "Khống Hỏa Quyết", description: "Công pháp cơ bản để điều khiển địa hỏa, cần thiết cho việc luyện khí và Luyện Linh.", techniqueType: 'Tâm pháp', attributes: { magicPower: 2 }, effectIds: ['ngu_linh'] }
];
export const NNVH_NPCS: InitialNpc[] = [
    { id: 'lao_mac', name: "Lão Mặc", description: "Một trưởng lão Hỏa Táo Phòng có vẻ ngoài lôi thôi nhưng lại có kiến thức sâu rộng về Luyện Khí, người đầu tiên nhận ra tài năng của Lãnh Nguyệt.", personalHistory: "Từng là một thiên tài Luyện Khí nhưng vì một lần thất bại mà tâm huyết nguội lạnh, lui về Hỏa Táo Phòng. Nhìn thấy Lãnh Nguyệt như thấy lại chính mình năm xưa." }
];
export const NNVH_SECTS: InitialSect[] = [
    { id: 'linh_khe_tong', name: "Linh Khê Tông", alignment: 'Chính Đạo', description: "Một trong tứ đại tông môn của hạ du Tu Chân Giới, nội tình sâu không lường được." }
];
// FIX: Add missing 'controllingSectIds' property to WorldLocation objects to satisfy the type definition.
export const NNVH_WORLD_LOCATIONS: WorldLocation[] = [
    { id: 'nnvh_wr_dong_mach', name: 'Đông Mạch Hạ Du', description: 'Vùng hạ du của Thông Thiên Hà.', level: 1, parentId: null, controllingSectIds: [] },
    { id: 'nnvh_prov_dong_lam', name: 'Đông Lâm Sơn Mạch', description: 'Một dãy núi trù phú, nơi Linh Khê Tông tọa lạc.', level: 2, parentId: 'nnvh_wr_dong_mach', controllingSectIds: ['linh_khe_tong'] },
    { id: 'hoa_tao_phong', name: "Hỏa Táo Phòng", description: "Nơi tưởng chừng như chỉ dành cho đệ tử tạp dịch, nhưng lại ẩn chứa địa hỏa và các tài nguyên cần thiết cho Luyện Khí.", level: 3, parentId: 'nnvh_prov_dong_lam', controllingSectIds: ['linh_khe_tong'] }
];
const NNVH_CULTIVATION_SYSTEM_DATA: CultivationTier[] = [
    {
        id: 'nnvh_tier_1', name: 'Hạ Du Tu Sĩ', rank: 1,
        realms: [
            {
                id: 'nnvh_realm_1', rank: 1, name: "Ngưng Khí", baseLifespan: 150, description: "Hô hấp thổ nạp, ngưng tụ linh khí, trường sinh chi lộ từ đây bắt đầu.", hasQualities: false,
                minorRealms: Array.from({ length: 10 }, (_, i) => ({ id: `nnvh_realm_1_minor_${i + 1}`, rank: i + 1, name: `Tầng ${i + 1}`, description: `Tầng ${i + 1} của Ngưng Khí Cảnh.`, isHidden: false })),
            },
            {
                id: 'nnvh_realm_2', rank: 2, name: "Trúc Cơ", baseLifespan: 500, description: "Linh khí hóa hải, mở ra đạo đài, là nền móng của con đường tu tiên.", hasQualities: true,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `nnvh_realm_2_minor_${i+1}` })),
                qualities: [
                    { id: 'nnvh_trucco_q_1', rank: 1, name: 'Phàm Mạch Trúc Cơ', description: 'Dùng đan dược miễn cưỡng đột phá, đạo đài có vết nứt, tiềm năng thấp nhất.', condition: 'Dùng Trúc Cơ Đan đột phá.', statBonusMultiplier: 1.0, lifespanBonus: 0 },
                    { id: 'nnvh_trucco_q_2', rank: 2, name: 'Địa Mạch Trúc Cơ', description: 'Hấp thu Địa Mạch chi khí, đạo đài vững chắc, tiềm năng khá tốt.', condition: 'Tìm được và hấp thụ Địa Mạch chi khí khi đột phá.', statBonusMultiplier: 1.3, lifespanBonus: 100 },
                    { id: 'nnvh_trucco_q_3', rank: 3, name: 'Thiên Đạo Trúc Cơ', description: 'Dẫn Thiên Mạch chi khí nhập thể, đạo đài hoàn mỹ, tiềm năng vô hạn.', condition: 'Có đại cơ duyên, hấp thụ Thiên Mạch chi khí.', statBonusMultiplier: 1.8, lifespanBonus: 300 },
                ]
            },
            {
                id: 'nnvh_realm_3', rank: 3, name: "Kết Đan", baseLifespan: 1000, description: "Linh hải kết tinh, ngưng tụ Kim Đan, pháp lực vô tận.", hasQualities: true,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `nnvh_realm_3_minor_${i+1}` })),
                qualities: [
                    { id: 'nnvh_ketdan_q_1', rank: 1, name: 'Phàm Đan', description: 'Kim đan có tạp chất, uy lực bình thường.', condition: 'Đột phá thông thường.', statBonusMultiplier: 1.0, lifespanBonus: 0 },
                    { id: 'nnvh_ketdan_q_2', rank: 2, name: 'Địa Đan', description: 'Kim đan tinh thuần, uy lực khá.', condition: 'Có sự chuẩn bị tốt.', statBonusMultiplier: 1.2, lifespanBonus: 200 },
                    { id: 'nnvh_ketdan_q_3', rank: 3, name: 'Thiên Đan', description: 'Kim đan hoàn mỹ, ẩn chứa một tia thiên địa quy tắc.', condition: 'Dùng Thiên Đạo Trúc Cơ đột phá.', statBonusMultiplier: 1.5, lifespanBonus: 500 },
                ]
            },
            {
                id: 'nnvh_realm_4', rank: 4, name: "Nguyên Anh", baseLifespan: 2000, description: "Phá đan sinh anh, Nguyên Anh bất diệt, tu sĩ bất tử.", hasQualities: false,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `nnvh_realm_4_minor_${i+1}` })),
            },
            {
                id: 'nnvh_realm_5', rank: 5, name: "Thiên Nhân", baseLifespan: 5000, description: "Hợp nhất với ý trời, trở thành một phần của thiên địa, nhất niệm có thể ảnh hưởng một phương.", hasQualities: false,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `nnvh_realm_5_minor_${i+1}` })),
            },
        ]
    }
];
export const NNVH_CULTIVATION_SYSTEM: CultivationTier[] = NNVH_CULTIVATION_SYSTEM_DATA;