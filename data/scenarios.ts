import type { ScenarioStage, InitialItem, InitialCongPhap, InitialNpc, InitialSect, InitialLocation, NguHanhType, Rule, CultivationTier, LinhCanQuality, MajorRealm, MinorRealm, RealmQuality, InitialWorldRegion, InitialProvince } from '../types';
import { CULTIVATION_SYSTEM } from '../constants';

// --- SHARED ---
export const DEFAULT_NGU_HANH: Record<NguHanhType, number> = { kim: 1, moc: 1, thuy: 1, hoa: 1, tho: 1 };
export const EMPTY_NGU_HANH: Record<NguHanhType, number> = { kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0 };

// --- HELPER CONSTANTS FOR CULTIVATION SYSTEMS ---
const STANDARD_3_MINOR_REALMS: Omit<MinorRealm, 'id'>[] = [
    { rank: 1, name: "Sơ Kỳ", description: "Vừa đột phá, cảnh giới chưa ổn định.", isHidden: false },
    { rank: 2, name: "Trung Kỳ", description: "Cảnh giới vững chắc, thực lực tăng tiến.", isHidden: false },
    { rank: 3, name: "Hậu Kỳ", description: "Tu vi hùng hậu, sắp chạm đến bình cảnh.", isHidden: false },
];

const STANDARD_4_MINOR_REALMS_DV: Omit<MinorRealm, 'id'>[] = [
    ...STANDARD_3_MINOR_REALMS,
    { rank: 4, name: "Đại Viên Mãn", description: "Cảnh giới hoàn mỹ, sẵn sàng cho lần đột phá tiếp theo.", isHidden: false },
];

const DEBA_5_MINOR_REALMS: Omit<MinorRealm, 'id'>[] = [
    { rank: 1, name: "Sơ Cảnh", description: "Bước đầu vào cảnh giới.", isHidden: false },
    { rank: 2, name: "Tiểu Cảnh", description: "Cảnh giới dần vững chắc.", isHidden: false },
    { rank: 3, name: "Trung Cảnh", description: "Tu vi có chút thành tựu.", isHidden: false },
    { rank: 4, name: "Đại Cảnh", description: "Tu vi hùng hậu.", isHidden: false },
    { rank: 5, name: "Đỉnh Phong", description: "Đạt đến đỉnh cao của cảnh giới này.", isHidden: false },
];

const kimDanQualities: Omit<RealmQuality, 'id' | 'description' | 'condition' | 'statBonusMultiplier' | 'lifespanBonus'>[] = [
    { rank: 1, name: 'Cửu Phẩm' }, { rank: 2, name: 'Bát Phẩm' }, { rank: 3, name: 'Thất Phẩm' },
    { rank: 4, name: 'Lục Phẩm' }, { rank: 5, name: 'Ngũ Phẩm' }, { rank: 6, name: 'Tứ Phẩm' },
    { rank: 7, name: 'Tam Phẩm' }, { rank: 8, name: 'Nhị Phẩm' }, { rank: 9, name: 'Nhất Phẩm' }
];

// --- TIÊN NGHỊCH (Renegade Immortal) - ĐỒNG NHÂN ---
export const TIEN_NGHICH_PLAYER_NAME = "Lâm Hồn";
export const TIEN_NGHICH_PLAYER_BIOGRAPHY = "Một thiếu niên sinh ra trong một ngôi làng hẻo lánh tại nước Triệu, từ nhỏ đã có khả năng giao cảm kỳ lạ với cây cỏ. Nơi hắn đi qua, hoa nở trái mùa, cây khô đâm chồi. Bị dân làng xa lánh vì cho là yêu ma, hắn được một trưởng lão của Thanh Mộc Tông, một tiểu môn phái sắp lụi tàn, phát hiện và nhận làm đệ tử. Hắn không có sát tâm như Vương Lâm, nhưng lại sở hữu một đạo tâm kiên định với sinh mệnh, tin rằng vạn vật đều có linh.";
export const TIEN_NGHICH_PLAYER_GOALS = "Tìm ra nguồn gốc của khả năng 'Vạn Mộc Đồng Sinh' của bản thân, tìm kiếm Tổ Mộc trong truyền thuyết để đạt tới cảnh giới tối cao của sinh mệnh, và chứng minh con đường tu tiên không nhất thiết phải trải đầy máu tanh.";
export const TIEN_NGHICH_SUMMARY = "Đây là một câu chuyện đồng nhân trong thế giới Tiên Nghịch. Nhân vật chính, Lâm Hồn, sở hữu đạo thai 'Vạn Mộc Đồng Sinh', cho phép hắn mượn sinh cơ từ thảo mộc để chiến đấu và tu luyện. Con đường của hắn đối lập với Vương Lâm: không cầu sát phạt, chỉ cầu sinh sôi. Hắn sẽ phải đối mặt với sự tàn khốc của thế giới tu chân, nơi đạo của hắn bị coi là yếu đuối. Hắn sẽ phải tìm cách bảo vệ những gì mình trân quý, chứng minh sức mạnh của sinh mệnh cũng có thể khuấy đảo cả vũ trụ, và hành trình tìm kiếm Tổ Mộc sẽ đưa hắn đến những bí mật kinh thiên động địa, có thể sẽ giao thoa với vận mệnh của những nhân vật quen thuộc theo một cách không ai ngờ tới.";

export const TIEN_NGHICH_LINH_CAN_QUALITY: LinhCanQuality = 'Địa Linh Căn';
export const TIEN_NGHICH_NGU_HANH: Record<NguHanhType, number> = { kim: 0, moc: 3, thuy: 1, hoa: 0, tho: 1 };
export const TIEN_NGHICH_DESTINY_IDS: string[] = ['tho_moc_dao_thai', 'linh_khi_than_hoa', 'dai_khi_van'];

export const TIEN_NGHICH_STAGES: ScenarioStage[] = [
    { id: 'tn_dn_stage_1', text: "Được trưởng lão Mộc Trần của Thanh Mộc Tông cứu khỏi dân làng và đưa về tông môn." },
    { id: 'tn_dn_stage_2', text: "Chính thức tu luyện 'Dẫn Mộc Quyết', học cách kiểm soát sơ bộ khả năng của mình." },
    { id: 'tn_dn_stage_3', text: "Lần đầu xuống núi tìm dược liệu, đối mặt với yêu thú và sự hiểm ác của tu sĩ khác." },
    { id: 'tn_dn_stage_4', text: "Thanh Mộc Tông bị một ma phái gần đó để mắt tới vì sở hữu linh tuyền." },
    { id: 'tn_dn_stage_5', text: "Ma phái tấn công, Mộc Trần trưởng lão hi sinh thân mình để bảo vệ Lâm Hồn chạy thoát." },
    { id: 'tn_dn_stage_6', text: "Trước khi chết, Mộc Trần trao cho hắn 'Tổ Mộc Chi Chủng', hạt giống của hy vọng cuối cùng." },
    { id: 'tn_dn_stage_7', text: "Bắt đầu cuộc sống lưu vong, dùng khả năng của mình để sống sót trong rừng sâu." },
    { id: 'tn_dn_stage_8', text: "Phát hiện ra hạt giống có thể hấp thụ sinh khí của yêu thú để trưởng thành." },
    { id: 'tn_dn_stage_9', text: "Đụng độ một nhóm tu sĩ đang săn lùng một con yêu thú quý hiếm, bị cuốn vào cuộc chiến." },
    { id: 'tn_dn_stage_10', text: "Vô tình cứu được Lục Yên, một nữ tu sĩ của Bách Độc Môn, người đang bị thương nặng." },
    { id: 'tn_dn_stage_11', text: "Lục Yên ngạc nhiên trước khả năng miễn nhiễm độc và chữa trị của Lâm Hồn, quyết định đi cùng hắn." },
    { id: 'tn_dn_stage_12', text: "Hai người cùng nhau khám phá một hang động cổ, tìm thấy một bản đồ không hoàn chỉnh." },
    { id: 'tn_dn_stage_13', text: "Bản đồ dường như chỉ đến một nơi có linh khí Mộc cực kỳ dồi dào, có thể là cơ hội cho Tổ Mộc Chi Chủng." },
    { id: 'tn_dn_stage_14', text: "Bị đám tu sĩ ma phái đã hủy diệt Thanh Mộc Tông truy lùng, cả hai phải chạy trốn." },
    { id: 'tn_dn_stage_15', text: "Thành công đột phá Trúc Cơ trong lúc hiểm nghèo nhờ vào sinh khí tích lũy, đánh bại kẻ thù và quyết định rời khỏi nước Triệu." },
    { id: 'tn_dn_stage_16', text: "Tiến vào Vực Ngoại Chiến Trường, không phải để giết chóc, mà để tìm kiếm những linh thực cổ đại." },
    { id: 'tn_dn_stage_17', text: "Tại đây, khả năng của Lâm Hồn phát huy tác dụng cực lớn, giúp hắn tránh né nguy hiểm và tìm kiếm tài nguyên." },
    { id: 'tn_dn_stage_18', text: "Tổ Mộc Chi Chủng nảy mầm, trở thành một cây non có linh tính, có thể hỗ trợ Lâm Hồn chiến đấu." },
    { id: 'tn_dn_stage_19', text: "Gặp phải một khu vực bị tử khí bao trùm, nơi một đại năng từng thi triển thần thông hủy diệt." },
    { id: 'tn_dn_stage_20', text: "Lâm Hồn dùng sức mạnh của mình để thử hồi sinh một vùng đất nhỏ, gây ra dị tượng kinh động." },
    { id: 'tn_dn_stage_21', text: "Hành động này thu hút sự chú ý của một tu sĩ Kết Đan kỳ, người muốn bắt hắn về nghiên cứu." },
    { id: 'tn_dn_stage_22', text: "Lục Yên dùng độc thuật hỗ trợ, cả hai thành công chạy thoát nhưng cũng bị trọng thương." },
    { id: 'tn_dn_stage_23', text: "Trong lúc chữa thương, Lâm Hồn lĩnh ngộ được sự cân bằng giữa Sinh và Tử, bước đầu chạm đến ngưỡng cửa của ý cảnh." },
    { id: 'tn_dn_stage_24', text: "Nghe tin đồn về một buổi đấu giá lớn ở một tu chân thành gần đó, có bán 'Tức Nhưỡng'." },
    { id: 'tn_dn_stage_25', text: "Lâm Hồn quyết định tham gia, hy vọng mua được Tức Nhưỡng để bồi bổ cho cây non linh tính." },
    { id: 'tn_dn_stage_26', text: "Tại buổi đấu giá, hắn gặp lại kẻ thù Kết Đan kỳ và phải cạnh tranh quyết liệt." },
    { id: 'tn_dn_stage_27', text: "Nhờ vào sự giúp đỡ bất ngờ của một thế lực bí ẩn, hắn thành công có được Tức Nhưỡng." },
    { id: 'tn_dn_stage_28', text: "Cây non hấp thụ Tức Nhưỡng, tiến hóa thành 'Thế Giới Thụ' sơ sinh, tạo ra một không gian nhỏ bên trong." },
    { id: 'tn_dn_stage_29', text: "Lâm Hồn phát hiện có thể trồng dược liệu trong không gian này với tốc độ cực nhanh." },
    { id: 'tn_dn_stage_30', text: "Bắt đầu con đường 'lấy nông dưỡng tu', tự cung tự cấp tài nguyên." },
    { id: 'tn_dn_stage_31', text: "Danh tiếng về một 'Mộc Sư' có khả năng cứu sống linh thảo quý hiếm bắt đầu lan truyền." },
    { id: 'tn_dn_stage_32', text: "Một đại gia tộc tìm đến, nhờ hắn cứu sống cây gia truyền của họ, hứa hẹn trả công hậu hĩnh." },
    { id: 'tn_dn_stage_33', text: "Hắn phát hiện cây bị trúng một loại nguyền rủa tà độc, không phải bệnh tự nhiên." },
    { id: 'tn_dn_stage_34', text: "Điều này dẫn hắn đến âm mưu tranh đoạt gia sản trong nội bộ gia tộc." },
    { id: 'tn_dn_stage_35', text: "Sau khi giải quyết sự việc, hắn nhận ra thế giới tu chân phức tạp hơn nhiều so với chỉ có chém giết." },
    { id: 'tn_dn_stage_36', text: "Tu vi đạt đến Kết Đan Đại Viên Mãn, Lâm Hồn bắt đầu chuẩn bị cho việc đột phá Nguyên Anh." },
    { id: 'tn_dn_stage_37', text: "Hắn cần một nơi có Mộc linh khí cực kỳ tinh khiết để tăng cơ hội thành công." },
    { id: 'tn_dn_stage_38', text: "Theo tấm bản đồ cũ, hắn và Lục Yên tìm đến một bí cảnh thượng cổ đã bị lãng quên." },
    { id: 'tn_dn_stage_39', text: "Bí cảnh là tàn tích của Mộc Linh Tộc, một chủng tộc cổ đại có khả năng tương tự hắn." },
    { id: 'tn_dn_stage_40', text: "Tại đây, hắn tìm thấy công pháp tu luyện hoàn chỉnh cho huyết mạch của mình: 'Vạn Cổ Trường Thanh Quyết'." },
    { id: 'tn_dn_stage_41', text: "Hắn hiểu ra mình là hậu duệ của Mộc Linh Tộc, và Tổ Mộc không chỉ là một cái cây, mà là cội nguồn của cả chủng tộc." },
    { id: 'tn_dn_stage_42', text: "Trong lúc đột phá Nguyên Anh, tâm ma của hắn chính là sự cô độc và nỗi sợ bị coi là dị loại." },
    { id: 'tn_dn_stage_43', text: "Nhờ đạo tâm kiên định và sự bảo vệ của Lục Yên, hắn thành công ngưng tụ 'Mộc Linh Nguyên Anh'." },
    { id: 'tn_dn_stage_44', text: "Nguyên Anh của hắn có khả năng chữa trị và sinh sôi, hoàn toàn khác biệt với các Nguyên Anh thông thường." },
    { id: 'tn_dn_stage_45', text: "Thế Giới Thụ cũng tiến hóa, không gian bên trong mở rộng, có thể chứa được sinh vật sống." },
    { id: 'tn_dn_stage_46', text: "Hắn quyết định xây dựng một nơi trú ẩn an toàn bên trong Thế Giới Thụ." },
    { id: 'tn_dn_stage_47', text: "Sự đột phá của hắn gây ra chấn động, bí cảnh bị phát hiện, các thế lực lớn bắt đầu kéo đến." },
    { id: 'tn_dn_stage_48', text: "Lâm Hồn phải đối mặt với các tu sĩ Nguyên Anh khác, thậm chí là Hóa Thần." },
    { id: 'tn_dn_stage_49', text: "Hắn sử dụng địa lợi của bí cảnh, kết hợp sức mạnh của Thế Giới Thụ để chiến đấu." },
    { id: 'tn_dn_stage_50', text: "Trận chiến này khiến tên tuổi Lâm Hồn vang dội, được gọi là 'Sinh Mệnh Đạo Chủ'." },
    { id: 'tn_dn_stage_51', text: "Hắn nhận ra muốn tìm Tổ Mộc, hắn cần phải mạnh hơn nữa và cần có thế lực của riêng mình." },
    { id: 'tn_dn_stage_52', text: "Bắt đầu thu nhận những tán tu hoặc yêu thú yêu chuộng hòa bình, có thiên phú về Mộc hệ." },
    { id: 'tn_dn_stage_53', text: "Thành lập một tổ chức ẩn thế mang tên 'Trường Sinh Điện', với căn cứ nằm trong Thế Giới Thụ." },
    { id: 'tn_dn_stage_54', text: "Mục tiêu của Trường Sinh Điện là bảo vệ sinh linh, chữa trị cho vùng đất bị hủy hoại và tìm kiếm Tổ Mộc." },
    { id: 'tn_dn_stage_55', text: "Manh mối tiếp theo về Tổ Mộc chỉ về phía La Thiên Tinh Vực, một nơi xa xôi và nguy hiểm hơn vạn lần." }
];
export const TIEN_NGHICH_THIEN_DAO_RULES: Rule[] = [
    { id: 'tn_td_1', text: "Ý cảnh là một phần quan trọng của sức mạnh, có thể vượt cấp thách đấu." },
    { id: 'tn_td_2', text: "Thiên kiếp cực kỳ nguy hiểm, có thể dẫn đến hồn phi phách tán." },
    { id: 'tn_td_3', text: "Thời gian có thể bị đảo ngược bởi đại năng, nhưng phải trả giá đắt." },
    { id: 'tn_dn_td_4', text: "Linh hồn của vạn vật, đặc biệt là thảo mộc, có thể ảnh hưởng đến kỳ ngộ và vận mệnh của người có duyên." }
];
export const TIEN_NGHICH_ITEMS: InitialItem[] = [
    { id: 'to_moc_chi_chung', name: "Tổ Mộc Chi Chủng", description: "Một hạt giống màu xanh biếc, ẩn chứa sinh cơ vô tận và một bí mật động trời. Là hy vọng cuối cùng của Thanh Mộc Tông.", itemType: 'Nhiệm vụ', quantity: 1 },
    { id: 'bach_thao_lo', name: "Bách Thảo Lộ", description: "Sương sớm được ngưng tụ từ hàng trăm loại linh thảo, giúp nhanh chóng hồi phục thể lực và một ít linh lực.", itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 3, enableRecovery: true, recoveryStamina: 50, recoverySpiritPower: 20 }
];
export const TIEN_NGHICH_TRANG_BI: InitialItem[] = [
    { 
        id: 'thanh_moc_trac', 
        name: "Thanh Mộc Trạc", 
        description: "Vòng tay được làm từ cành của một cây cổ thụ ngàn năm, tỏa ra sinh khí ấm áp, giúp người đeo luôn cảm thấy an bình và sinh lực dồi dào.", 
        itemType: 'Trang bị', 
        equipmentType: 'Phụ kiện',
        quantity: 1, 
        attributes: { defense: 2, aptitude: 3 },
        effectIds: ['sinh_sinh_bat_tuc'] 
    }
];
export const TIEN_NGHICH_PHAP_BAO: InitialItem[] = [
    { 
       id: 'van_moc_gioi', 
       name: "Vạn Mộc Giới", 
       description: "Chiếc nhẫn ẩn chứa sức mạnh của đạo thai 'Vạn Mộc Đồng Sinh', khuếch đại khả năng điều khiển Mộc linh khí của chủ nhân.", 
       itemType: 'Pháp bảo', 
       equipmentType: 'Trang sức',
       quantity: 1, 
       attributes: { magicPower: 5, spiritualSense: 5 },
       effectIds: ['ngu_linh'] 
   }
];
export const TIEN_NGHICH_CONG_PHAP: InitialCongPhap[] = [
    { 
        id: 'dan_moc_quyet', 
        name: "Dẫn Mộc Quyết", 
        description: "Công pháp nhập môn của Thanh Mộc Tông, giúp tu sĩ cảm nhận và dẫn dắt linh khí Mộc hệ.", 
        techniqueType: 'Tu luyện', 
        attributes: { aptitude: 5, magicPower: 2 },
        effectIds: ['tu_linh']
    },
    {
        id: 'moc_giap_thuat',
        name: "Mộc Giáp Thuật",
        description: "Triệu hồi linh khí Mộc hệ để tạo ra một lớp giáp gỗ chắc chắn bao bọc cơ thể, tăng cường khả năng phòng ngự.",
        techniqueType: 'Phòng thủ',
        attributes: { defense: 10, bodyStrength: 5 },
        effectIds: ['kim_than_bat_hoai']
    }
];
export const TIEN_NGHICH_NPCS: InitialNpc[] = [
    { id: 'moc_tran_chan_nhan', name: "Mộc Trần Chân Nhân", description: "Trưởng lão cuối cùng của Thanh Mộc Tông, người đã cứu và truyền lại hy vọng cho Lâm Hồn.", relationship: 'Sư phụ' },
    { id: 'luc_yen', name: "Lục Yên", description: "Nữ tu sĩ Bách Độc Môn, tính cách cổ quái, am hiểu độc thuật. Ban đầu lạnh lùng nhưng dần bị sự lương thiện của Lâm Hồn cảm hóa.", relationship: 'Đồng hành' }
];
export const TIEN_NGHICH_SECTS: InitialSect[] = [
    { id: 'thanh_moc_tong', name: "Thanh Mộc Tông", alignment: 'Chính Đạo', description: "Một tiểu môn phái chuyên tu luyện công pháp Mộc hệ, chủ trương thuận theo tự nhiên, không thích tranh đấu." }
];
export const TIEN_NGHICH_WORLD_REGIONS: InitialWorldRegion[] = [
    { id: 'tn_wr_nam_vuc', name: 'Nam Vực', description: 'Vùng đất phía nam của Tu Chân Liên Minh.' }
];
export const TIEN_NGHICH_PROVINCES: InitialProvince[] = [
    { id: 'tn_prov_trieu_quoc', name: 'Triệu Quốc', description: 'Một nước tu chân nhỏ bé ở Nam Vực.', worldRegionId: 'tn_wr_nam_vuc' }
];
export const TIEN_NGHICH_LOCATIONS: InitialLocation[] = [
    { id: 'thanh_moc_coc', name: "Thanh Mộc Cốc", description: "Một sơn cốc hẻo lánh, nơi Thanh Mộc Tông tọa lạc. Linh khí Mộc hệ dồi dào, cây cối xanh tốt quanh năm.", provinceId: 'tn_prov_trieu_quoc' }
];
export const TIEN_NGHICH_CULTIVATION_SYSTEM: CultivationTier[] = CULTIVATION_SYSTEM;

// --- PHÀM NHÂN TU TIÊN (A Record of a Mortal's Journey to Immortality) - ĐỒNG NHÂN ---
export const PNTT_PLAYER_NAME = "Trần Minh";
export const PNTT_PLAYER_BIOGRAPHY = "Một thiếu niên có tư chất tu tiên tam linh căn, không cao không thấp, nhưng từ nhỏ đã có thiên phú đặc biệt với các loại hình vẽ và kết cấu phức tạp. Hắn có thể dễ dàng ghi nhớ và phân tích các đồ án trận pháp chỉ sau một lần nhìn. Ước mơ của hắn không phải là trường sinh bất tử, mà là tạo ra một tòa 'Vạn Tiên Trận' trong truyền thuyết, có khả năng tru sát cả Chân Tiên.";
export const PNTT_PLAYER_GOALS = "Trở thành một Trận Pháp Tông Sư vĩ đại nhất, tìm kiếm các trận đồ cổ xưa bị thất lạc, và tự mình sáng tạo ra những đại trận kinh thiên động địa.";
export const PNTT_SUMMARY = "Trong thế giới tu tiên tàn khốc của Phàm Nhân, Trần Minh không có tiểu bình thần bí, chỉ có một bộ não và đôi tay trời sinh để khắc họa trận văn. Hắn sẽ phải dùng trí tuệ của mình để bù đắp cho tư chất không xuất chúng, dùng trận pháp để vượt cấp giết địch, dùng cạm bẫy để tính kế những lão quái vật. Hành trình của hắn là con đường của một Trận Pháp Sư, nơi mỗi bước đi đều là một lần bố cục, mỗi trận chiến đều là một ván cờ sinh tử.";
export const PNTT_STAGES: ScenarioStage[] = [
    { id: 'pntt_dn_stage_1', text: "Bị một tán tu lừa bán vào một hắc điếm chuyên khai thác khoáng thạch." },
    { id: 'pntt_dn_stage_2', text: "Trong lúc lao động khổ sai, phát hiện các đường vân tự nhiên trên khoáng thạch có khả năng dẫn dắt linh khí." },
    { id: 'pntt_dn_stage_3', text: "Lén lút học hỏi, dùng các mảnh khoáng thạch phế liệu để thử nghiệm khắc họa các trận văn đơn giản." },
    { id: 'pntt_dn_stage_4', text: "Tạo ra một 'Mê Huyễn Trận' cấp thấp, thành công gây rối loạn cho đám giám công và chạy trốn." },
    { id: 'pntt_dn_stage_5', text: "Lưu lạc trong giới tán tu, kiếm sống bằng cách bố trí các trận pháp cảnh báo đơn giản cho các tu sĩ khác." },
    { id: 'pntt_dn_stage_6', text: "Tình cờ nhặt được một quyển 'Trận Đạo Sơ Giải' không hoàn chỉnh, kiến thức về trận pháp tăng mạnh." },
    { id: 'pntt_dn_stage_7', text: "Dùng trận pháp bẫy được một con yêu thú cấp cao, bán nội đan của nó và có được khoản linh thạch đầu tiên." },
    { id: 'pntt_dn_stage_8', text: "Bị kẻ bán mình năm xưa phát hiện, hắn bị truy sát." },
    { id: 'pntt_dn_stage_9', text: "Dùng toàn bộ tài sản mua tài liệu, bố trí một cái 'Tụ Sát Trận' và thành công giết chết kẻ thù." },
    { id: 'pntt_dn_stage_10', text: "Việc này khiến hắn hiểu ra sự tàn khốc của tu tiên giới, quyết tâm phải trở nên mạnh hơn." },
    { id: 'pntt_dn_stage_11', text: "Nghe tin Hoàng Phong Cốc đang tuyển nhận đệ tử, hắn quyết định đi thử vận may." },
    { id: 'pntt_dn_stage_12', text: "Trong lúc khảo hạch, hắn không thể hiện được gì nhiều về tu vi, nhưng khả năng phá giải một trận pháp nhỏ đã gây chú ý cho một trưởng lão." },
    { id: 'pntt_dn_stage_13', text: "Được nhận làm đệ tử ký danh, phụ trách việc bảo trì các trận pháp phòng hộ của môn phái." },
    { id: 'pntt_dn_stage_14', text: "Lợi dụng công việc, hắn có cơ hội tiếp xúc và học hỏi từ các đại trận của môn phái." },
    { id: 'pntt_dn_stage_15', text: "Trong một lần bảo trì, hắn phát hiện một lỗ hổng nhỏ trong đại trận hộ sơn, hắn lặng lẽ sửa chữa nó." },
    { id: 'pntt_dn_stage_16', text: "Thành công Trúc Cơ, trở thành đệ tử nội môn." },
    { id: 'pntt_dn_stage_17', text: "Tham gia Huyết Sắc Thí Luyện, mục tiêu của hắn không phải là dược liệu, mà là các khoáng thạch布阵 quý hiếm." },
    { id: 'pntt_dn_stage_18', text: "Trong bí cảnh, hắn dùng trận pháp để sống sót và tính kế các đệ tử môn phái khác, thu được lợi ích to lớn." },
    { id: 'pntt_dn_stage_19', text: "Hắn gặp được một nữ tu của Yểm Nguyệt Tông, Nam Cung Uyển (ở trạng thái tu vi thấp), đang bị vây công. Hắn bố trận giúp nàng giải vây." },
    { id: 'pntt_dn_stage_20', text: "Sau khi rời bí cảnh, hắn bắt đầu bế quan, nghiên cứu các trận pháp phức tạp hơn." },
    { id: 'pntt_dn_stage_21', text: "Lỗ hổng mà hắn sửa chữa năm xưa bị một tên gian tế trong môn phái phát hiện, hắn bị nghi ngờ là nội gián." },
    { id: 'pntt_dn_stage_22', text: "Đối mặt với sự tra hỏi của cao tầng, hắn dùng kiến thức trận pháp để chứng minh sự trong sạch và vạch mặt tên gian tế." },
    { id: 'pntt_dn_stage_23', text: "Tài năng trận pháp của hắn được công nhận, được phép vào Tàng Kinh Các để đọc các điển tịch về trận pháp." },
    { id: 'pntt_dn_stage_24', text: "Hắn tìm thấy manh mối về 'Thất Tuyệt Trận Đồ', một bộ trận pháp cổ đại có uy lực kinh người." },
    { id: 'pntt_dn_stage_25', text: "Ma đạo sáu phái xâm lược, chiến tranh bùng nổ. Trần Minh được giao nhiệm vụ quan trọng trong việc phòng thủ." },
    { id: 'pntt_dn_stage_26', text: "Hắn cải tiến các trận pháp phòng ngự, gây ra tổn thất nặng nề cho quân địch." },
    { id: 'pntt_dn_stage_27', text: "Trong một trận chiến, hắn bị một tu sĩ Kết Đan của ma đạo truy sát." },
    { id: 'pntt_dn_stage_28', text: "Hắn dụ địch vào một hẻm núi đã bố trí sẵn 'Băng Hỏa Lưỡng Nghi Trận', thành công trọng thương đối thủ và chạy thoát." },
    { id: 'pntt_dn_stage_29', text: "Chiến tranh kết thúc, Hoàng Phong Cốc thất thủ, hắn cùng một số đệ tử phải di tản." },
    { id: 'pntt_dn_stage_30', text: "Hắn quyết định đến Loạn Tinh Hải, một nơi hỗn loạn nhưng cũng đầy cơ duyên cho các trận pháp sư." },
    { id: 'pntt_dn_stage_31', text: "Tại Loạn Tinh Hải, hắn kiếm sống bằng cách khắc họa trận bàn và hộ trận để bán." },
    { id: 'pntt_dn_stage_32', text: "Sản phẩm của hắn vì chất lượng tốt mà nổi tiếng, nhưng cũng vì thế mà bị các thế lực địa phương chèn ép." },
    { id: 'pntt_dn_stage_33', text: "Hắn gia nhập một thương hội nhỏ để tìm kiếm sự bảo vệ." },
    { id: 'pntt_dn_stage_34', text: "Trong một lần hộ tống hàng hóa, đoàn tàu bị yêu thú biển tấn công. Hắn dùng trận pháp kết hợp với những người khác để đẩy lùi chúng." },
    { id: 'pntt_dn_stage_35', text: "Hắn tìm thấy mảnh đầu tiên của Thất Tuyệt Trận Đồ trong một hang động dưới đáy biển." },
    { id: 'pntt_dn_stage_36', text: "Bắt đầu Kết Đan, thiên kiếp của hắn thu hút yêu thú cường đại." },
    { id: 'pntt_dn_stage_37', text: "Hắn bố trí một đại trận phòng hộ, vừa chống lại thiên kiếp, vừa chống lại yêu thú, cuối cùng thành công Kết Đan." },
    { id: 'pntt_dn_stage_38', text: "Trở thành một Kết Đan tu sĩ, hắn có được vị thế nhất định ở Loạn Tinh Hải." },
    { id: 'pntt_dn_stage_39', text: "Hắn nghe tin về một bí cảnh cổ xưa sắp mở, có thể chứa các mảnh trận đồ khác." },
    { id: 'pntt_dn_stage_40', text: "Bí cảnh là một hòn đảo di động, bên trên đầy rẫy các cấm chế và tàn trận cổ đại." },
    { id: 'pntt_dn_stage_41', text: "Đây chính là thiên đường đối với Trần Minh. Hắn dễ dàng phá giải các tàn trận, thu được nhiều bảo vật." },
    { id: 'pntt_dn_stage_42', text: "Hắn tìm được thêm hai mảnh của Thất Tuyệt Trận Đồ." },
    { id: 'pntt_dn_stage_43', text: "Khi rời khỏi bí cảnh, hắn bị một tu sĩ Nguyên Anh để mắt tới, muốn cướp đoạt trận đồ." },
    { id: 'pntt_dn_stage_44', text: "Trần Minh dùng kiến thức trận pháp vừa học được, lợi dụng các cấm chế tự nhiên của Loạn Tinh Hải để chạy trốn." },
    { id: 'pntt_dn_stage_45', text: "Hắn nhận ra sự chênh lệch tuyệt đối về thực lực, quyết định phải tìm một nơi an toàn để tu luyện đến Nguyên Anh." },
    { id: 'pntt_dn_stage_46', text: "Hắn trở lại Thiên Nam, nơi tình hình đã ổn định lại sau chiến tranh." },
    { id: 'pntt_dn_stage_47', text: "Hắn tìm một động phủ hẻo lánh, bố trí tầng tầng lớp lớp trận pháp xung quanh và bắt đầu bế tử quan." },
    { id: 'pntt_dn_stage_48', text: "Trong thời gian này, hắn dốc lòng nghiên cứu Thất Tuyệt Trận Đồ, tu vi trận pháp tăng lên một tầm cao mới." },
    { id: 'pntt_dn_stage_49', text: "Manh mối của các mảnh còn lại chỉ về phía Đại Tấn, một nơi mà các tu sĩ cấp cao tụ tập." },
    { id: 'pntt_dn_stage_50', text: "Sau khi tu vi đạt đến Kết Đan hậu kỳ, hắn lên đường đi Đại Tấn." },
    { id: 'pntt_dn_stage_51', text: "Gia nhập một tông môn chuyên về trận pháp ở Đại Tấn để che giấu thân phận và học hỏi thêm." },
    { id: 'pntt_dn_stage_52', text: "Tại đây, hắn bộc lộ tài năng, trở thành một ngôi sao mới trong giới trận pháp." },
    { id: 'pntt_dn_stage_53', text: "Hắn đại diện cho tông môn tham gia một đại hội trận pháp, đối đầu với các thiên tài trận pháp khác." },
    { id: 'pntt_dn_stage_54', text: "Phần thưởng của đại hội chính là một mảnh của Thất Tuyệt Trận Đồ." },
    { id: 'pntt_dn_stage_55', text: "Trần Minh giành chiến thắng, nhưng cũng vì thế mà bị các thế lực lớn hơn để ý." },
    { id: 'pntt_dn_stage_56', text: "Trong lúc chuẩn bị đột phá Nguyên Anh, hắn phát hiện mình đã bị một đại tu sĩ Hóa Thần theo dõi từ lâu." },
    { id: 'pntt_dn_stage_57', text: "Đại tu sĩ này muốn đoạt xá hắn vì thiên phú trận pháp của hắn có lợi cho việc phá giải một cấm chế cổ." },
    { id: 'pntt_dn_stage_58', text: "Trần Minh giả vờ hợp tác, trong lòng đang lên một kế hoạch kinh thiên." },
    { id: 'pntt_dn_stage_59', text: "Hắn lợi dụng tài nguyên của đại tu sĩ để chuẩn bị cho việc đột phá và bố trí một cái bẫy." },
    { id: 'pntt_dn_stage_60', text: "Khi đại tu sĩ định đoạt xá, cũng là lúc thiên kiếp Nguyên Anh của Trần Minh ập đến." },
    { id: 'pntt_dn_stage_61', text: "Hắn kích hoạt một cái 'Nghịch Linh Trận', mượn sức mạnh của thiên kiếp và cấm chế cổ để phản công." },
    { id: 'pntt_dn_stage_62', text: "Đại tu sĩ Hóa Thần bị trọng thương, linh hồn suy yếu. Trần Minh thành công đột phá Nguyên Anh." },
    { id: 'pntt_dn_stage_63', text: "Hắn đoạt lại được thân thể, nhưng cũng phải đối mặt với sự truy sát của thế lực sau lưng đại tu sĩ kia." },
    { id: 'pntt_dn_stage_64', text: "Hắn trốn vào một không gian loạn lưu do trận pháp gây ra." },
    { id: 'pntt_dn_stage_65', text: "Tại đây, hắn tìm thấy mảnh cuối cùng của Thất Tuyệt Trận Đồ và một bộ 'Hư Thiên Tàn Quyển'." },
    { id: 'pntt_dn_stage_66', text: "Hư Thiên Tàn Quyển ghi lại các kiến thức về không gian trận pháp." },
    { id: 'pntt_dn_stage_67', text: "Trần Minh kết hợp Thất Tuyệt Trận Đồ và Hư Thiên Tàn Quyển, bắt đầu sáng tạo ra con đường của riêng mình." },
    { id: 'pntt_dn_stage_68', text: "Hắn tu luyện thành công 'Hư Không Na Di Trận', có thể dịch chuyển tức thời trong khoảng cách ngắn." },
    { id: 'pntt_dn_stage_69', text: "Trở lại Đại Tấn, hắn bắt đầu kế hoạch trả thù." },
    { id: 'pntt_dn_stage_70', text: "Hắn không đối đầu trực diện, mà dùng trận pháp phá hoại các nguồn tài nguyên, gây hỗn loạn nội bộ cho thế lực kia." },
    { id: 'pntt_dn_stage_71', text: "Danh tiếng 'Vô Ảnh Trận Ma' bắt đầu lan truyền, khiến các đại thế lực phải kiêng dè." },
    { id: 'pntt_dn_stage_72', text: "Sau khi trả thù thành công, hắn cảm thấy con đường tu tiên ở Nhân Giới đã đến giới hạn." },
    { id: 'pntt_dn_stage_73', text: "Hắn bắt đầu tìm kiếm con đường phi thăng Linh Giới." },
    { id: 'pntt_dn_stage_74', text: "Hắn phát hiện ra một tiết điểm không gian yếu, nhưng được canh giữ bởi một con yêu thú Hóa Thần kỳ." },
    { id: 'pntt_dn_stage_75', text: "Trần Minh dành nhiều năm để nghiên cứu và bố trí một tòa 'Tru Thiên Đại Trận' xung quanh tiết điểm." },
    { id: 'pntt_dn_stage_76', text: "Hắn kích hoạt đại trận, thành công vây khốn con yêu thú." },
    { id: 'pntt_dn_stage_77', text: "Trong lúc con yêu thú đang phá trận, hắn lợi dụng năng lượng không gian hỗn loạn để mở ra con đường phi thăng." },
    { id: 'pntt_dn_stage_78', text: "Đối mặt với thiên kiếp phi thăng, Trần Minh dùng chính bản thân làm trận nhãn, lấy thiên kiếp làm nguồn năng lượng." },
    { id: 'pntt_dn_stage_79', text: "Hắn thành công vượt qua, nhưng cũng bị cuốn vào một cơn bão không gian." },
    { id: 'pntt_dn_stage_80', text: "Khi tỉnh lại, hắn đã ở Linh Giới, nhưng tu vi bị rơi xuống Nguyên Anh sơ kỳ, thân thể trọng thương." },
    { id: 'pntt_dn_stage_81', text: "Nhìn thế giới hoàn toàn mới với các quy tắc thiên địa khác biệt, Trần Minh mỉm cười. Con đường Trận Pháp Tông Sư của hắn, giờ mới thực sự bắt đầu." }
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
export const PNTT_LOCATIONS: InitialLocation[] = [];
export const PNTT_WORLD_REGIONS: InitialWorldRegion[] = [];
export const PNTT_PROVINCES: InitialProvince[] = [];
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

// --- CẦU MA (Beseech the Devil) - ĐỒNG NHÂN ---
export const CAUMA_PLAYER_NAME = "Thạch Nham";
export const CAUMA_PLAYER_BIOGRAPHY = "Một thiếu niên câm lặng của Hắc Sơn Bộ, một bộ lạc nhỏ bé luôn bị các bộ lạc lớn hơn chèn ép. Hắn không có thiên phú về Man thuật, nhưng lại sở hữu một sức mạnh thể chất và sức chịu đựng kinh người. Trong một lần bộ lạc bị tấn công, hắn vô tình thức tỉnh huyết mạch Man tộc cổ xưa 'Bất Động Minh Vương', có khả năng hấp thụ sức mạnh của đại địa để cường hóa bản thân.";
export const CAUMA_PLAYER_GOALS = "Bảo vệ bộ lạc của mình, tìm lại vinh quang cho huyết mạch Bất Động Minh Vương đã bị lãng quên, và dùng nắm đấm của mình để đập tan mọi xiềng xích của số phận bi thương trong thế giới này.";
export const CAUMA_SUMMARY = "Trong thế giới Cầu Ma đầy bi thương và chấp niệm, Thạch Nham không đi theo con đường của Tô Minh. Hắn là một kẻ tu Man thuần túy, lấy thân thể làm lò luyện, lấy đại địa làm linh hồn. Con đường của hắn là ý chí bất khuất, là sự bảo vệ, là dùng sức mạnh nguyên thủy nhất để chống lại số phận. Hắn sẽ phải đối mặt với sự khinh thường của những kẻ tu Man thuật, sự săn đuổi của các thế lực mạnh mẽ, và tìm ra sự thật đằng sau sự lụi tàn của huyết mạch Bất Động Minh Vương.";
export const CAUMA_STAGES: ScenarioStage[] = [
    { id: 'cauma_dn_stage_1', text: "Hắc Sơn Bộ bị Huyết Lang Bộ uy hiếp, yêu cầu cống nạp. Thạch Nham, thiếu niên câm lặng, chỉ biết siết chặt nắm đấm." },
    { id: 'cauma_dn_stage_2', text: "Huyết Lang Bộ tấn công, tộc trưởng trọng thương. Trong cơn tuyệt vọng, Thạch Nham lao ra, cơ thể bộc phát ánh sáng màu vàng đất." },
    { id: 'cauma_dn_stage_3', text: "Huyết mạch Bất Động Minh Vương thức tỉnh, Thạch Nham hấp thụ sức mạnh đại địa, đẩy lùi kẻ địch. Hắn kiệt sức ngất đi." },
    { id: 'cauma_dn_stage_4', text: "Thạch Nham tỉnh lại, được cả bộ lạc vừa kính vừa sợ. Hắn cảm nhận được mối liên kết kỳ lạ với mặt đất dưới chân." },
    { id: 'cauma_dn_stage_5', text: "Man vu của bộ lạc nhận ra huyết mạch cổ xưa, trao cho Thạch Nham một mảnh thú cốt, chỉ dẫn hắn đến 'Man Thần Cốc'." },
    { id: 'cauma_dn_stage_6', text: "Thạch Nham nhận ra sức mạnh của mình sẽ mang lại tai họa cho bộ lạc. Hắn quyết định rời đi một mình để tìm kiếm câu trả lời." },
    { id: 'cauma_dn_stage_7', text: "Hắn để lại lời nhắn bằng cách khắc lên đá rồi lặng lẽ rời đi trong đêm." },
    { id: 'cauma_dn_stage_8', text: "Bắt đầu hành trình trong Man Hoang, Thạch Nham săn giết Man thú, dùng máu của chúng để tôi luyện thân thể." },
    { id: 'cauma_dn_stage_9', text: "Hắn dần học cách chủ động hấp thụ địa lực, mỗi bước chân đều cảm thấy nặng như ngàn cân." },
    { id: 'cauma_dn_stage_10', text: "Đạt tới Ngưng Huyết tầng ba, sức mạnh thể chất tăng vọt." },
    { id: 'cauma_dn_stage_11', text: "Gặp một bộ lạc nhỏ khác đang bị Man thú tấn công, hắn ra tay cứu giúp." },
    { id: 'cauma_dn_stage_12', text: "Được bộ lạc nhỏ cảm tạ, hắn biết thêm về sự tàn khốc của Man Hoang và sự thống trị của các đại bộ lạc." },
    { id: 'cauma_dn_stage_13', text: "Huyết Lang Bộ phát hiện kẻ phá hoại kế hoạch của chúng chính là Thạch Nham, chúng treo thưởng cho cái đầu của hắn." },
    { id: 'cauma_dn_stage_14', text: "Thạch Nham bị một nhóm Man tu săn lùng, hắn dựa vào địa hình hiểm trở để chiến đấu và chạy thoát." },
    { id: 'cauma_dn_stage_15', text: "Trong lúc chiến đấu, hắn lĩnh ngộ được cách dùng địa lực để tạo ra một lớp phòng ngự đơn giản." },
    { id: 'cauma_dn_stage_16', text: "Bị dồn vào đường cùng, hắn nhảy xuống một vực sâu." },
    { id: 'cauma_dn_stage_17', text: "Dưới vực, hắn tìm thấy một hang động có chứa một bộ hài cốt của Man tộc cổ đại, tỏa ra ý chí bất khuất." },
    { id: 'cauma_dn_stage_18', text: "Hắn bái lạy hài cốt và được một luồng năng lượng thuần túy灌顶 (quán đỉnh), tu vi đột phá Ngưng Huyết tầng sáu." },
    { id: 'cauma_dn_stage_19', text: "Hắn tìm thấy một vài Man thuật tàn khuyết được khắc trên vách đá: 'Đại Địa Thủ' và 'Bất Động Như Sơn'." },
    { id: 'cauma_dn_stage_20', text: "Bắt đầu tu luyện Man thuật mới, sức mạnh của hắn dần được định hình." },
    { id: 'cauma_dn_stage_21', text: "Trở lại mặt đất, Thạch Nham đối mặt với đội truy sát của Huyết Lang Bộ." },
    { id: 'cauma_dn_stage_22', text: "Hắn dùng 'Đại Địa Thủ' và thân thể cường hãn để nghiền nát kẻ địch, danh tiếng bắt đầu lan truyền." },
    { id: 'cauma_dn_stage_23', text: "Hắn nghe tin Huyết Lang Bộ muốn thôn tính Hắc Sơn Bộ và các bộ lạc nhỏ xung quanh. Hắn quyết định trở về." },
    { id: 'cauma_dn_stage_24', text: "Trên đường về, hắn gặp được A Man, một thiếu nữ có khả năng chữa trị của Thảo Mộc Bộ." },
    { id: 'cauma_dn_stage_25', text: "A Man bị thương, Thạch Nham bảo vệ nàng khỏi Man thú, A Man dùng năng lực chữa trị cho hắn." },
    { id: 'cauma_dn_stage_26', text: "Hai người đồng hành, Thạch Nham cảm nhận được sự ấm áp lần đầu tiên." },
    { id: 'cauma_dn_stage_27', text: "Trở về Hắc Sơn Bộ, hắn thấy bộ lạc đang chuẩn bị cho trận chiến cuối cùng." },
    { id: 'cauma_dn_stage_28', text: "Thạch Nham xuất hiện, một mình đứng trước đội quân của Huyết Lang Bộ." },
    { id: 'cauma_dn_stage_29', text: "Hắn thách đấu thủ lĩnh Huyết Lang Bộ, một cường giả Ngưng Huyết Đại Viên Mãn." },
    { id: 'cauma_dn_stage_30', text: "Trận chiến diễn ra ác liệt, Thạch Nham dùng 'Bất Động Như Sơn', chịu đựng vô số đòn tấn công và cuối cùng đánh bại thủ lĩnh địch." },
    { id: 'cauma_dn_stage_31', text: "Huyết Lang Bộ tan rã, Thạch Nham trở thành anh hùng của các bộ lạc nhỏ. Hắn đạt tới Ngưng Huyết Đại Viên Mãn." },
    { id: 'cauma_dn_stage_32', text: "Hắn quyết định đã đến lúc tìm đến Man Thần Cốc để tìm hiểu bí mật huyết mạch và đột phá Khai Trần." },
    { id: 'cauma_dn_stage_33', text: "A Man quyết định đi cùng, Thảo Mộc Bộ của nàng cũng bị đại bộ lạc chèn ép." },
    { id: 'cauma_dn_stage_34', text: "Hành trình đến Man Thần Cốc đầy rẫy nguy hiểm, họ phải vượt qua những vùng đất của các Man thú cường đại." },
    { id: 'cauma_dn_stage_35', text: "Họ tìm thấy một con suối có khả năng tẩy rửa Man thể, Thạch Nham ngâm mình trong đó, thân thể càng thêm tinh thuần." },
    { id: 'cauma_dn_stage_36', text: "Đến được Man Thần Cốc, một nơi hoang tàn nhưng ẩn chứa Man vận cổ xưa." },
    { id: 'cauma_dn_stage_37', text: "Thử thách đầu tiên: Vượt qua 'Trọng Lực Trường', nơi sức nặng tăng lên gấp trăm lần. Ý chí của Thạch Nham được mài giũa." },
    { id: 'cauma_dn_stage_38', text: "Thử thách thứ hai: 'Man Hồn Vấn Tâm', đối mặt với tâm ma và sự cô độc của chính mình." },
    { id: 'cauma_dn_stage_39', text: "Vượt qua thử thách, hắn tìm thấy tế đàn trung tâm của Man Thần Cốc, nơi có một pho tượng Bất Động Minh Vương đã vỡ nát." },
    { id: 'cauma_dn_stage_40', text: "Hắn nhỏ máu lên tượng, mảnh thú cốt của Man vu hóa thành ánh sáng dung nhập vào cơ thể hắn. Hắn đột phá Khai Trần Cảnh." },
    { id: 'cauma_dn_stage_41', text: "Man Tượng của hắn hiện ra - một vị Minh Vương khổng lồ, ngồi vững như núi, tỏa ra ý chí bất khuất, là 'Thực Tượng'." },
    { id: 'cauma_dn_stage_42', text: "Thạch Nham nhận được傳承 (truyền thừa) không hoàn chỉnh: công pháp 'Bất Động Minh Vương Kinh' và biết được huyết mạch này bị nguyền rủa." },
    { id: 'cauma_dn_stage_43', text: "Lời nguyền khiến người mang huyết mạch khó có thể tu luyện Man thuật phức tạp, chỉ có thể tin vào sức mạnh của bản thân và đại địa." },
    { id: 'cauma_dn_stage_44', text: "Rời khỏi Man Thần Cốc, hắn cảm nhận được sức mạnh của mình đã khác xưa." },
    { id: 'cauma_dn_stage_45', text: "Hắn quyết định thống nhất các bộ lạc nhỏ, tạo ra một nơi an toàn cho những người yếu thế." },
    { id: 'cauma_dn_stage_46', text: "Hắn thành lập 'Đại Địa Minh', lấy Hắc Sơn Bộ làm trung tâm, mời các bộ lạc nhỏ khác gia nhập." },
    { id: 'cauma_dn_stage_47', text: "Nhiều bộ lạc hưởng ứng, nhưng cũng có kẻ nghi ngờ. Thạch Nham dùng sức mạnh và sự chân thành để thuyết phục họ." },
    { id: 'cauma_dn_stage_48', text: "Một đại bộ lạc khác, 'Thiết Phù Bộ', cảm thấy bị đe dọa, liên minh với tàn dư của Huyết Lang Bộ để tấn công Đại Địa Minh." },
    { id: 'cauma_dn_stage_49', text: "Thạch Nham lãnh đạo liên minh non trẻ chống lại kẻ địch mạnh hơn." },
    { id: 'cauma_dn_stage_50', text: "Hắn dùng năng lực kết nối với đại địa để tạo ra địa chấn, thay đổi địa hình, gây bất lợi cho quân địch." },
    { id: 'cauma_dn_stage_51', text: "Trong trận chiến quyết định, hắn một mình chống lại hai thủ lĩnh Khai Trần Cảnh của địch." },
    { id: 'cauma_dn_stage_52', text: "Hắn bị trọng thương, nhưng ý chí bảo vệ mọi người khiến hắn bộc phát, Man Tượng Bất Động Minh Vương trở nên thực chất hơn." },
    { id: 'cauma_dn_stage_53', text: "Hắn đánh bại kẻ địch, Đại Địa Minh giành thắng lợi, danh tiếng Thạch Nham vang dội khắp vùng Man Hoang phía Nam." },
    { id: 'cauma_dn_stage_54', text: "A Man trở thành Man vu của Đại Địa Minh, dùng năng lực của mình để chữa trị và phát triển bộ lạc." },
    { id: 'cauma_dn_stage_55', text: "Thạch Nham bắt đầu quá trình tu luyện Tế Cốt, dùng chính huyết khí và địa lực để tôi luyện từng khúc xương. Quá trình vô cùng đau đớn." },
    { id: 'cauma_dn_stage_56', text: "Tin tức về một Man Vương mới nổi truyền đến tai các thế lực lớn hơn ở trung tâm Man Hoang và cả các tông môn tu tiên ở biên giới." },
    { id: 'cauma_dn_stage_57', text: "Một sứ giả từ 'Man Thần Điện' - thế lực thống trị Man Hoang - đến, mời Thạch Nham tham gia 'Man Tử Thí Luyện'." },
    { id: 'cauma_dn_stage_58', text: "Man Tử Thí Luyện là cuộc chiến sinh tử giữa các thiên tài Man tộc để chọn ra người thừa kế Man Thần." },
    { id: 'cauma_dn_stage_59', text: "Thạch Nham ban đầu từ chối, nhưng sứ giả tiết lộ Man Thần Điện có cách để giải lời nguyền cho huyết mạch của hắn." },
    { id: 'cauma_dn_stage_60', text: "Vì tương lai của chính mình và Đại Địa Minh, hắn đồng ý tham gia. A Man và các tộc trưởng lo lắng." },
    { id: 'cauma_dn_stage_61', text: "Hắn đến Man Thần Điện, một thành trì khổng lồ xây trên lưng một con Man thú cổ đại đã hóa đá." },
    { id: 'cauma_dn_stage_62', text: "Tại đây, hắn gặp các thiên tài Man tộc khác, kẻ thì kiêu ngạo, kẻ thì âm hiểm, tất cả đều là cường giả Khai Trần Đại Viên Mãn." },
    { id: 'cauma_dn_stage_63', text: "Hắn bị coi thường vì chỉ tu luyện thân thể." },
    { id: 'cauma_dn_stage_64', text: "Thí luyện bắt đầu trong một bí cảnh đặc biệt. Hắn phải đối mặt với không chỉ các đối thủ mà cả những sinh vật đáng sợ trong bí cảnh." },
    { id: 'cauma_dn_stage_65', text: "Hắn dùng sức mạnh phòng ngự và sức bền vô song của mình để sống sót và tiến lên. Hắn không chủ động giết người, chỉ phản击 (phản kích) khi bị tấn công." },
    { id: 'cauma_dn_stage_66', text: "Hắn phát hiện ra bí mật của thí luyện: không phải giết nhiều người nhất sẽ thắng, mà là người có thể chịu đựng được Man uy của Man Thần lâu nhất." },
    { id: 'cauma_dn_stage_67', text: "Công pháp Bất Động Minh Vương Kinh của hắn phát huy tác dụng không ngờ, giúp hắn chống lại Man uy." },
    { id: 'cauma_dn_stage_68', text: "Cuối cùng, chỉ còn lại hắn và một đối thủ khác, người có huyết mạch Man Thần cuồng bạo." },
    { id: 'cauma_dn_stage_69', text: "Trận chiến cuối cùng diễn ra. Thạch Nham phòng thủ kiên cố, mặc cho đối thủ tấn công điên cuồng, dần dần làm tiêu hao sức lực của đối phương." },
    { id: 'cauma_dn_stage_70', text: "Hắn chiến thắng, trở thành Man Tử mới của Man Hoang. Hắn đột phá Tế Cốt Cảnh." },
    { id: 'cauma_dn_stage_71', text: "Đại trưởng lão Man Thần Điện giữ lời, cho hắn vào Thánh Địa để tìm cách giải nguyền." },
    { id: 'cauma_dn_stage_72', text: "Trong Thánh Địa, hắn không tìm thấy cách giải nguyền, mà tìm thấy sự thật: Bất Động Minh Vương huyết mạch không bị nguyền rủa, mà là một sự lựa chọn." },
    { id: 'cauma_dn_stage_73', text: "Tổ tiên của hắn đã từ bỏ Man thuật để theo đuổi con đường bảo vệ thuần túy, trở thành tấm khiên của Man tộc." },
    { id: 'cauma_dn_stage_74', text: "Hắn hiểu ra con đường của mình, đạo tâm càng thêm kiên định. Hắn nhận được một phần傳承 (truyền thừa) hoàn chỉnh hơn." },
    { id: 'cauma_dn_stage_75', text: "Khi hắn trở ra, một tông môn tu tiên lớn là 'Thiên Kiếm Tông' bất ngờ tấn công Man Hoang, muốn cướp đoạt 'Man Thần Chi Tâm'." },
    { id: 'cauma_dn_stage_76', text: "Man Thần Điện lâm vào chiến tranh. Man Tử như hắn phải ra trận." },
    { id: 'cauma_dn_stage_77', text: "Hắn chứng kiến sự tàn khốc của chiến tranh, các Man tộc ngã xuống. Lòng bảo vệ của hắn bùng cháy." },
    { id: 'cauma_dn_stage_78', text: "Hắn đứng ở tiền tuyến, dùng thân thể của mình làm lá chắn, bảo vệ cho các Man tu khác." },
    { id: 'cauma_dn_stage_79', text: "Hắn đối đầu với một trưởng lão Tế Cốt Cảnh của Thiên Kiếm Tông." },
    { id: 'cauma_dn_stage_80', text: "Trận chiến kinh thiên động địa, hắn dùng ý chí Bất Động Minh Vương, hấp thụ sức mạnh của cả chiến trường, hóa thành một ngọn núi không thể lay chuyển." },
    { id: 'cauma_dn_stage_81', text: "Hắn thành công cầm chân trưởng lão địch, tạo cơ hội cho Đại trưởng lão Man Thần Điện phản công, đẩy lùi Thiên Kiếm Tông. Thạch Nham được tôn vinh là 'Bất Động Man Vương', trở thành người bảo hộ mới của Man Hoang." }
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
export const CAUMA_LOCATIONS: InitialLocation[] = [];
export const CAUMA_WORLD_REGIONS: InitialWorldRegion[] = [];
export const CAUMA_PROVINCES: InitialProvince[] = [];
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

// --- NHẤT NIỆM VĨNH HẰNG (A Will Eternal) - ĐỒNG NHÂN ---
export const NNVH_PLAYER_NAME = "Lãnh Nguyệt";
export const NNVH_PLAYER_BIOGRAPHY = "Sinh ra trong một gia đình thợ rèn phàm nhân, Lãnh Nguyệt từ nhỏ đã chứng kiến những tác phẩm tâm huyết nhất của cha mình bị thời gian bào mòn. Điều đó gieo vào lòng nàng một chấp niệm: tìm kiếm sự vĩnh hằng. Nàng không sợ chết, chỉ sợ sự lụi tàn. Đối với nàng, vạn vật trong trời đất, từ kim loại, linh thảo, cho đến cả sinh mệnh, đều là vật liệu để nàng thực hiện con đường Luyện Linh, đưa chúng đến một sự tồn tại bất diệt.";
export const NNVH_PLAYER_GOALS = "Tìm ra 'Vĩnh Hằng Chi Lô' trong truyền thuyết, hoàn thành lần Luyện Linh thứ 100 thần thoại, và cuối cùng, Luyện Linh chính bản thân mình để trở thành một tồn tại vĩnh hằng thực sự.";
export const NNVH_SUMMARY = "Trong thế giới Nhất Niệm Vĩnh Hằng, Lãnh Nguyệt đi trên một con đường đối lập hoàn toàn với Bạch Tiểu Thuần. Nàng lạnh lùng, quyết đoán, và theo đuổi sức mạnh một cách cực đoan thông qua Luyện Linh. Hành trình của nàng sẽ đầy rẫy những thử nghiệm nguy hiểm, tạo ra những pháp bảo có linh trí và sức mạnh không thể kiểm soát. Nàng sẽ phải đối mặt với những nhân quả do chính sự chấp nhất của mình gây ra, và học cách cân bằng giữa việc theo đuổi sức mạnh và giữ lại nhân tính của mình.";
export const NNVH_STAGES: ScenarioStage[] = [
    { id: 'nnvh_dn_stage_1', text: "Ám ảnh bởi sự lụi tàn của các tác phẩm rèn của cha, Lãnh Nguyệt quyết tâm tìm con đường tu tiên để chống lại thời gian." },
    { id: 'nnvh_dn_stage_2', text: "Sau nhiều gian khổ, nàng gia nhập Linh Khê Tông và được phân vào Hỏa Táo Phòng vì có kinh nghiệm với lửa." },
    { id: 'nnvh_dn_stage_3', text: "Trong một góc kho cũ kỹ, nàng tình cờ tìm thấy quyển 'Luyện Linh Sơ Giải', ghi lại các phương pháp Luyện Linh cổ xưa." },
    { id: 'nnvh_dn_stage_4', text: "Lần đầu thử nghiệm Luyện Linh thành công trên một cái cuốc sắt, khiến nó trở nên sắc bén lạ thường." },
    { id: 'nnvh_dn_stage_5', text: "Dùng cái cuốc đã Luyện Linh, nàng dễ dàng đào được các loại khoáng thạch tốt hơn, bắt đầu chu kỳ 'lấy luyện dưỡng luyện'." },
    { id: 'nnvh_dn_stage_6', text: "Nàng bắt một con rùa đen nhỏ, thử Luyện Linh nó. Con rùa không chết mà trở nên lanh lợi, mai cứng hơn." },
    { id: 'nnvh_dn_stage_7', text: "Con rùa (được đặt tên là Huyền Quy) giúp nàng tìm thấy linh thảo, nàng dùng chúng đổi lấy điểm cống hiến để mua thêm tài liệu." },
    { id: 'nnvh_dn_stage_8', text: "Tài năng khác thường của nàng bị Lão Mặc, một trưởng lão ở Hỏa Táo Phòng, chú ý tới." },
    { id: 'nnvh_dn_stage_9', text: "Được Lão Mặc âm thầm chỉ điểm, kiến thức Luyện Linh của nàng tăng mạnh, nàng hiểu ra tầm quan trọng của việc khống hỏa." },
    { id: 'nnvh_dn_stage_10', text: "Nàng Luyện Linh cây chủy thủ của mình lên ba lần, nó phát ra hàn quang, uy lực kinh người." },
    { id: 'nnvh_dn_stage_11', text: "Trong kỳ khảo hạch ngoại môn, nàng dùng chủy thủ và Huyền Quy đã được Luyện Linh để dễ dàng chiến thắng." },
    { id: 'nnvh_dn_stage_12', text: "Trở thành đệ tử ngoại môn, nàng xin được chuyển đến Bách Thú Viện để nghiên cứu Luyện Linh trên sinh mệnh." },
    { id: 'nnvh_dn_stage_13', text: "Ý tưởng Luyện Linh cho thú sủng của nàng bị coi là tà đạo và bị nghiêm cấm." },
    { id: 'nnvh_dn_stage_14', text: "Nàng bí mật Luyện Linh cho Huyền Quy lên năm lần, mai của nó cứng như pháp bảo, có thể chống lại phi kiếm." },
    { id: 'nnvh_dn_stage_15', text: "Huyền Quy nuốt mất một pháp bảo của sư huynh đến gây sự, gây ra rắc rối lớn." },
    { id: 'nnvh_dn_stage_16', text: "Lãnh Nguyệt bị phạt, nhưng cũng vì chuyện này mà được một trưởng lão của Tử Đỉnh Sơn để mắt tới." },
    { id: 'nnvh_dn_stage_17', text: "Nàng từ chối học luyện đan, khẳng định con đường của mình chỉ có Luyện Linh." },
    { id: 'nnvh_dn_stage_18', text: "Nàng bắt đầu thử nghiệm Luyện Linh cho những vật phẩm phức tạp hơn như trận kỳ, bùa chú." },
    { id: 'nnvh_dn_stage_19', text: "Nàng Luyện Linh một cái lò luyện đan phế phẩm, khiến nó có khả năng tự động hấp thụ linh khí." },
    { id: 'nnvh_dn_stage_20', text: "Trong một cuộc tỷ thí, nàng Luyện Linh phi kiếm của đối thủ ngay trên sàn đấu, khiến nó mất kiểm soát và bay loạn xạ." },
    { id: 'nnvh_dn_stage_21', text: "Hành động này khiến nàng nổi danh là 'Linh Nữ', nhưng cũng bị các đệ tử khác xa lánh và kiêng dè." },
    { id: 'nnvh_dn_stage_22', text: "Khi chuẩn bị Trúc Cơ, nàng quyết định làm một việc điên rồ: Luyện Linh cho chính đạo đài của mình." },
    { id: 'nnvh_dn_stage_23', text: "Quá trình cực kỳ nguy hiểm, linh khí bạo động suýt nữa khiến nàng tẩu hỏa nhập ma, nhưng Huyền Quy đã dùng thân mình che chắn." },
    { id: 'nnvh_dn_stage_24', text: "Nàng thành công, đạt được 'Linh Mạch Trúc Cơ', một loại Trúc Cơ chưa từng có. Đạo đài của nàng có thể tự Luyện Linh, hấp thụ linh khí nhanh hơn." },
    { id: 'nnvh_dn_stage_25', text: "Thực lực tăng mạnh sau khi Trúc Cơ, nàng quyết định xuống núi tìm kiếm tài liệu Luyện Linh hiếm có." },
    { id: 'nnvh_dn_stage_26', text: "Nàng nghe tin về Huyết Khê Tông và phương pháp 'Dung Huyết Luyện Thể' của họ." },
    { id: 'nnvh_dn_stage_27', text: "Nàng tò mò, cho rằng đây là một hình thức Luyện Linh trên cơ thể sống và muốn tìm hiểu." },
    { id: 'nnvh_dn_stage_28', text: "Nàng lẻn vào lãnh địa của Huyết Khê Tông, quan sát các đệ tử của họ tu luyện." },
    { id: 'nnvh_dn_stage_29', text: "Nàng chứng kiến sự tàn nhẫn của họ, nhưng cũng bị hấp dẫn bởi lý thuyết dung hợp vạn vật của họ." },
    { id: 'nnvh_dn_stage_30', text: "Nàng bắt một đệ tử Huyết Khê Tông, ép hỏi công pháp và tự mình nghiên cứu." },
    { id: 'nnvh_dn_stage_31', text: "Nàng thử Luyện Linh một giọt máu của yêu thú, khiến nó bộc phát sức mạnh và linh tính kinh người." },
    { id: 'nnvh_dn_stage_32', text: "Thí nghiệm của nàng bị phát hiện, nàng bị các trưởng lão Huyết Khê Tông truy sát." },
    { id: 'nnvh_dn_stage_33', text: "Nàng Luyện Linh chính những phi kiếm của kẻ địch, khiến chúng phản chủ, gây ra cảnh hỗn loạn." },
    { id: 'nnvh_dn_stage_34', text: "Huyền Quy đã được Luyện Linh bảy lần, giờ đây là một con yêu thú mạnh mẽ, giúp nàng chống lại một trưởng lão." },
    { id: 'nnvh_dn_stage_35', text: "Nàng thành công chạy thoát ra biển lớn, nhưng cũng bị trọng thương, Huyền Quy thì bị một vết nứt trên mai." },
    { id: 'nnvh_dn_stage_36', text: "Trôi dạt trên biển, nàng tìm thấy một hòn đảo hoang tàn nhưng có linh khí cổ xưa." },
    { id: 'nnvh_dn_stage_37', text: "Hòn đảo là di tích của 'Vật Linh Tông', một tông môn cổ đại chuyên về Luyện Linh đến mức cực đoan." },
    { id: 'nnvh_dn_stage_38', text: "Nàng tìm thấy công pháp cao hơn trong di tích: 'Vạn Vật Hóa Linh Kinh'." },
    { id: 'nnvh_dn_stage_39', text: "Nàng hiểu ra, Luyện Linh không chỉ là tăng cường, mà là thức tỉnh 'vật linh' bên trong vạn vật." },
    { id: 'nnvh_dn_stage_40', text: "Nàng tìm thấy trung tâm của đảo, một cái 'Đảo Hạch' đang suy yếu, là trái tim của hòn đảo." },
    { id: 'nnvh_dn_stage_41', text: "Nàng quyết định Luyện Linh cho Đảo Hạch, một việc làm không tưởng để cứu hòn đảo và cũng là để thử nghiệm công pháp mới." },
    { id: 'nnvh_dn_stage_42', text: "Sau nhiều tháng dốc toàn lực, nàng thành công. Hòn đảo sống lại, có thể di chuyển và tự phòng ngự." },
    { id: 'nnvh_dn_stage_43', text: "Nàng đặt tên cho hòn đảo là 'Linh Nguyệt Đảo' và xem nó như động phủ của mình." },
    { id: 'nnvh_dn_stage_44', text: "Trên đảo, nàng tìm thấy manh mối đầu tiên về 'Vĩnh Hằng Chi Lô', thứ có thể Luyện Linh mà không làm tổn hại vật linh." },
    { id: 'nnvh_dn_stage_45', text: "Tu vi của nàng cũng đột phá Kết Đan. Kim Đan của nàng là một 'Vạn Vật Linh Đan', có thể dung hợp với vật linh của pháp bảo." },
    { id: 'nnvh_dn_stage_46', text: "Sự xuất hiện của Linh Nguyệt Đảo trên biển gây chấn động, Huyền Khê Tông và Đan Khê Tông phái người đến điều tra." },
    { id: 'nnvh_dn_stage_47', text: "Họ cho rằng Lãnh Nguyệt là ma đầu, yêu cầu nàng giao ra hòn đảo và bí pháp." },
    { id: 'nnvh_dn_stage_48', text: "Lãnh Nguyệt từ chối, một trận đại chiến nổ ra trên mặt biển." },
    { id: 'nnvh_dn_stage_49', text: "Nàng điều khiển cả hòn đảo để chiến đấu, dùng các trận pháp được Luyện Linh để chống lại các cường giả Kết Đan." },
    { id: 'nnvh_dn_stage_50', text: "Nàng đánh bại liên quân hai phái, nhưng cũng tiêu hao rất lớn, Linh Nguyệt Đảo xuất hiện thêm nhiều vết nứt." },
    { id: 'nnvh_dn_stage_51', text: "Danh xưng 'Linh Ma' ra đời và lan truyền khắp hạ du." },
    { id: 'nnvh_dn_stage_52', text: "Trong lúc chữa trị cho hòn đảo, nàng nhận ra Huyền Quy có dấu hiệu bị tổn thương linh hồn do Luyện Linh quá độ." },
    { id: 'nnvh_dn_stage_53', text: "Lần đầu tiên, nàng cảm thấy dao động và hối hận về con đường của mình. Chấp niệm về vĩnh hằng của nàng bắt đầu rạn nứt." },
    { id: 'nnvh_dn_stage_54', text: "Nàng quyết định tìm Vĩnh Hằng Chi Lô không chỉ cho bản thân, mà còn để cứu Huyền Quy." },
    { id: 'nnvh_dn_stage_55', text: "Dựa theo manh mối, nàng điều khiển Linh Nguyệt Đảo tiến vào vùng biển sương mù nguy hiểm hơn." },
    { id: 'nnvh_dn_stage_56', text: "Nàng gặp phải các hải thú cường đại thời thượng cổ, thay vì chiến đấu, nàng thử Luyện Linh cho chính môi trường biển." },
    { id: 'nnvh_dn_stage_57', text: "Nàng tạo ra một khu vực 'an toàn', nơi linh khí hiền hòa, khiến các hải thú không tấn công, và đi qua an toàn." },
    { id: 'nnvh_dn_stage_58', text: "Nàng tìm thấy một di tích dưới đáy biển, nơi có manh mối tiếp theo về Vĩnh Hằng Chi Lô." },
    { id: 'nnvh_dn_stage_59', text: "Manh mối chỉ về một nơi không ai ngờ tới: Không Hà Viện ở trung du Tu Chân Giới." },
    { id: 'nnvh_dn_stage_60', text: "Biết không thể mang đảo đi, nàng thu nhỏ Linh Nguyệt Đảo thành một viên ngọc châu, mang theo bên mình." },
    { id: 'nnvh_dn_stage_61', text: "Nàng cải trang thành một tán tu, tiến vào khu vực trung du, tìm cách gia nhập Không Hà Viện." },
    { id: 'nnvh_dn_stage_62', text: "Nàng tham gia vào cuộc tuyển chọn đệ tử, đối mặt với các thiên tài từ khắp nơi." },
    { id: 'nnvh_dn_stage_63', text: "Với kiến thức Luyện Linh độc đáo, nàng dễ dàng phá giải các khảo hạch liên quan đến trận pháp và cấm chế." },
    { id: 'nnvh_dn_stage_64', text: "Nàng thành công gia nhập Không Hà Viện, trở thành đệ tử của Tử Khí Nhất Mạch." },
    { id: 'nnvh_dn_stage_65', text: "Trong tông môn, nàng phát hiện ra Vĩnh Hằng Chi Lô là một bí mật được các lão tổ canh giữ." },
    { id: 'nnvh_dn_stage_66', text: "Nó không phải là một pháp bảo hữu hình, mà là một quy tắc của thế giới, chỉ có thể được tiếp cận tại một thời điểm và địa điểm đặc biệt." },
    { id: 'nnvh_dn_stage_67', text: "Thời điểm đó chính là khi 'Thông Thiên Hà' xuất hiện và chảy ngược." },
    { id: 'nnvh_dn_stage_68', text: "Lãnh Nguyệt dốc lòng tu luyện, chờ đợi thời cơ, đồng thời tìm cách chữa trị cho Huyền Quy." },
    { id: 'nnvh_dn_stage_69', text: "Nàng đột phá Nguyên Anh. Nguyên Anh của nàng có hình dạng một cái lò luyện đan, không ngừng hấp thụ và phân tích quy tắc thiên địa." },
    { id: 'nnvh_dn_stage_70', text: "Sự đột phá của nàng gây ra dị tượng, các tông môn khác cảm nhận được, bắt đầu chú ý đến nàng." },
    { id: 'nnvh_dn_stage_71', text: "Thân phận 'Linh Ma' ở hạ du của nàng có nguy cơ bị bại lộ." },
    { id: 'nnvh_dn_stage_72', text: "Thông Thiên Hà xuất hiện, các thiên tài của bốn đại tông môn đều tập trung." },
    { id: 'nnvh_dn_stage_73', text: "Cánh cửa dẫn đến khu vực có Vĩnh Hằng Chi Lô mở ra bên trong Thông Thiên Hà." },
    { id: 'nnvh_dn_stage_74', text: "Lãnh Nguyệt tiến vào, đối mặt với sự cạnh tranh từ các Nguyên Anh khác." },
    { id: 'nnvh_dn_stage_75', text: "Nàng không chiến đấu, mà dùng kiến thức Luyện Linh để hòa hợp với các quy tắc bên trong, dễ dàng vượt qua các chướng ngại." },
    { id: 'nnvh_dn_stage_76', text: "Nàng đến được trước Vĩnh Hằng Chi Lô. Nó không phải một cái lò, mà là một vòng xoáy của sáng tạo và hủy diệt." },
    { id: 'nnvh_dn_stage_77', text: "Một ý chí cổ xưa, tự xưng là 'Lô Linh', xuất hiện và đưa ra thử thách cuối cùng." },
    { id: 'nnvh_dn_stage_78', text: "Thử thách không phải là sức mạnh, mà là một câu hỏi: 'Vĩnh hằng là gì?'." },
    { id: 'nnvh_dn_stage_79', text: "Lãnh Nguyệt nhìn lại con đường của mình, sự chấp nhất, sự tổn thương của Huyền Quy. Nàng trả lời: 'Vĩnh hằng không phải là bất biến, mà là sự tiếp nối trong luân hồi.'." },
    { id: 'nnvh_dn_stage_80', text: "Lô Linh chấp nhận câu trả lời của nàng, cho rằng nàng đã có tư cách chạm đến Tạo Hóa." },
    { id: 'nnvh_dn_stage_81', text: "Nàng được phép sử dụng sức mạnh của Vĩnh Hằng Chi Lô một lần." },
    { id: 'nnvh_dn_stage_82', text: "Nàng không dùng nó cho bản thân, mà dùng để chữa trị hoàn toàn cho linh hồn của Huyền Quy, giải thoát nó khỏi sự ràng buộc của Luyện Linh." },
    { id: 'nnvh_dn_stage_83', text: "Huyền Quy hóa thành một sinh linh tự do, cảm kích nhìn nàng rồi trở về với đất trời." },
    { id: 'nnvh_dn_stage_84', text: "Lãnh Nguyệt mỉm cười, đạo tâm của nàng được viên mãn, chấp niệm được cởi bỏ." },
    { id: 'nnvh_dn_stage_85', text: "Nàng lĩnh ngộ được con đường mới: 'Tạo Hóa Linh Đạo', dùng Luyện Linh để sửa chữa và sáng tạo, chứ không phải để ép buộc sự vĩnh hằng. Con đường tu tiên của nàng giờ đây mới thực sự rộng mở." }
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
    { id: 'lao_mac', name: "Lão Mặc", description: "Một trưởng lão Hỏa Táo Phòng có vẻ ngoài lôi thôi nhưng lại có kiến thức sâu rộng về Luyện Khí, người đầu tiên nhận ra tài năng của Lãnh Nguyệt." }
];
export const NNVH_SECTS: InitialSect[] = [
    { id: 'linh_khe_tong', name: "Linh Khê Tông", alignment: 'Chính Đạo', description: "Một trong tứ đại tông môn của hạ du Tu Chân Giới, nội tình sâu không lường được." }
];
export const NNVH_WORLD_REGIONS: InitialWorldRegion[] = [
    { id: 'nnvh_wr_dong_mach', name: 'Đông Mạch Hạ Du', description: 'Vùng hạ du của Thông Thiên Hà.' }
];
export const NNVH_PROVINCES: InitialProvince[] = [
    { id: 'nnvh_prov_dong_lam', name: 'Đông Lâm Sơn Mạch', description: 'Một dãy núi trù phú, nơi Linh Khê Tông tọa lạc.', worldRegionId: 'nnvh_wr_dong_mach' }
];
export const NNVH_LOCATIONS: InitialLocation[] = [
    { id: 'hoa_tao_phong', name: "Hỏa Táo Phòng", description: "Nơi tưởng chừng như chỉ dành cho đệ tử tạp dịch, nhưng lại ẩn chứa địa hỏa và các tài nguyên cần thiết cho Luyện Khí.", provinceId: 'nnvh_prov_dong_lam' }
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

// --- ĐẾ BÁ (Emperor's Domination) - ĐỒNG NHÂN ---
export const DEBA_PLAYER_NAME = "Lâm Phong";
export const DEBA_PLAYER_BIOGRAPHY = "Một đệ tử ngoại môn của Tẩy Nhan Cổ Phái, tư chất bình thường, cam chịu số phận. Trong một lần bị ức hiếp và rơi xuống vực sâu, hắn tình cờ nhặt được một mảnh gương vỡ, 'Ma Ha Cổ Kính'. Mảnh gương chứa đựng một tia tàn niệm và một phần ký ức vô cùng hỗn loạn của Âm Nha - Lý Thất Dạ. Hắn không phải Lý Thất Dạ, mà chỉ là một người bình thường đột nhiên sở hữu một di sản và một gánh nặng quá lớn.";
export const DEBA_PLAYER_GOALS = "Sống sót, tìm hiểu bí mật của Ma Ha Cổ Kính, chưởng khống sức mạnh của Âm Nha để không bị nó nuốt chửng, và từng bước đi lên từ một đệ tử ngoại môn, đối mặt với những kẻ thù mà Lý Thất Dạ đã từng đắc tội trong quá khứ.";
export const DEBA_SUMMARY = "Đây là câu chuyện về một người bình thường phải gánh vác di sản của một huyền thoại. Lâm Phong sẽ phải dựa vào những mảnh ký ức rời rạc và những công pháp bá đạo không hoàn chỉnh từ tàn niệm của Âm Nha để sinh tồn. Hắn không có sự tự tin và kiến thức vô tận của Lý Thất Dạ, mỗi bước đi đều là một lần dò dẫm, mỗi quyết định đều có thể dẫn đến cái chết. Hắn phải đối mặt với sự nghi ngờ từ những người xung quanh và sự truy lùng của những kẻ địch nhận ra khí tức của Âm Nha trên người hắn.";
export const DEBA_STAGES: ScenarioStage[] = [
    { id: 'deba_dn_stage_1', text: "Bị các sư huynh trong Tẩy Nhan Cổ Phái ức hiếp, đẩy xuống vực thẳm." },
    { id: 'deba_dn_stage_2', text: "Dưới vực, hắn tìm thấy mảnh Ma Ha Cổ Kính và bị tàn niệm của Âm Nha xâm nhập." },
    { id: 'deba_dn_stage_3', text: "Trong đầu hắn xuất hiện vô số ký ức hỗn loạn và một phần công pháp 'Tù Ngưu Công'." },
    { id: 'deba_dn_stage_4', text: "Dựa vào Tù Ngưu Công và ý chí sinh tồn, hắn bò ra khỏi vực sâu." },
    { id: 'deba_dn_stage_5', text: "Trở lại môn phái, những kẻ đã hại hắn kinh ngạc. Hắn che giấu kỳ ngộ của mình." },
    { id: 'deba_dn_stage_6', text: "Hắn bắt đầu tu luyện Tù Ngưu Công, sức mạnh tăng tiến nhanh chóng, nhưng tâm trí thường xuyên bị ảnh hưởng bởi sát ý của Âm Nha." },
    { id: 'deba_dn_stage_7', text: "Trong một lần khảo hạch ngoại môn, hắn dễ dàng đánh bại những kẻ đã ức hiếp mình, gây sự chú ý của trưởng lão." },
    { id: 'deba_dn_stage_8', text: "Hắn được thăng lên đệ tử nội môn." },
    { id: 'deba_dn_stage_9', text: "Dựa vào ký ức rời rạc, hắn tìm thấy một nơi hẻo lánh trong tông môn, nơi Âm Nha năm xưa từng để lại một ít đồ vật." },
    { id: 'deba_dn_stage_10', text: "Hắn tìm thấy 'Nguyệt Nha Đao', một thanh đao bình thường, nhưng là vũ khí mà Âm Nha từng dùng lúc còn yếu." },
    { id: 'deba_dn_stage_11', text: "Khí tức của Âm Nha trên người hắn ngày càng nồng đậm, một trưởng lão có kiến thức uyên bác bắt đầu nghi ngờ." },
    { id: 'deba_dn_stage_12', text: "Trưởng lão này không có ác ý, chỉ muốn tìm hiểu sự thật về sự trở lại của 'người đó'." },
    { id: 'deba_dn_stage_13', text: "Cùng lúc đó, một kẻ thù cũ của Tẩy Nhan Cổ Phái là 'Cửu Thánh Yêu Môn' đến gây sự." },
    { id: 'deba_dn_stage_14', text: "Đệ tử thiên tài của Cửu Thánh Yêu Môn thách đấu các đệ tử của Tẩy Nhan Cổ Phái, không ai là đối thủ." },
    { id: 'deba_dn_stage_15', text: "Vào lúc nguy cấp, Lâm Phong ra mặt, dùng những thủ đoạn và kiến thức chiến đấu từ ký ức của Âm Nha để đánh bại đối thủ." },
    { id: 'deba_dn_stage_16', text: "Việc này khiến hắn trở thành anh hùng, nhưng cũng khiến khí tức Âm Nha của hắn bị cường giả Cửu Thánh Yêu Môn nhận ra." },
    { id: 'deba_dn_stage_17', text: "Trưởng lão Cửu Thánh Yêu Môn là một kẻ từng bị Âm Nha sỉ nhục, lão ta thề sẽ giết chết 'kẻ đó'." },
    { id: 'deba_dn_stage_18', text: "Lâm Phong rơi vào tình thế nguy hiểm. Trưởng lão của Tẩy Nhan Cổ Phái ra mặt bảo vệ hắn." },
    { id: 'deba_dn_stage_19', text: "Để bảo vệ mình và môn phái, Lâm Phong đề nghị mở ra 'Tổ Địa' của Tẩy Nhan Cổ Phái, nơi Minh Nhân Tiên Đế từng để lại cơ duyên." },
    { id: 'deba_dn_stage_20', text: "Dựa vào ký ức Âm Nha, hắn biết cách mở Tổ Địa. Hắn cùng các trưởng lão và một số đệ tử ưu tú tiến vào." },
    { id: 'deba_dn_stage_21', text: "Trong Tổ Địa, hắn không đi tìm đế thuật, mà đi tìm một thứ mà Âm Nha cất giấu: 'Ma Tâm'." },
    { id: 'deba_dn_stage_22', text: "Ma Tâm là thứ Âm Nha dùng để trấn áp sát niệm của chính mình, có thể giúp Lâm Phong khống chế ảnh hưởng từ tàn niệm." },
    { id: 'deba_dn_stage_23', text: "Hắn thành công dung hợp Ma Tâm, tâm trí trở nên sáng suốt, có thể chủ động sử dụng kiến thức của Âm Nha mà không bị ảnh hưởng." },
    { id: 'deba_dn_stage_24', text: "Tu vi của hắn đột phá đến Dục Thần Cảnh." },
    { id: 'deba_dn_stage_25', text: "Khi rời khỏi Tổ Địa, hắn đối mặt với trưởng lão Cửu Thánh Yêu Môn một lần nữa." },
    { id: 'deba_dn_stage_26', text: "Lần này, hắn dùng kiến thức uyên bác, vạch ra điểm yếu trong công pháp của đối phương, kết hợp với thực lực mới để đánh bại lão." },
    { id: 'deba_dn_stage_27', text: "Sự kiện này chấn động cả Đại Trung Vực. Tẩy Nhan Cổ Phái dường như có dấu hiệu trỗi dậy." },
    { id: 'deba_dn_stage_28', text: "Lâm Phong trở thành Thủ tịch đại đệ tử của Tẩy Nhan Cổ Phái." },
    { id: 'deba_dn_stage_29', text: "Hắn bắt đầu cải tổ môn phái, dùng các phương pháp luyện đan, luyện khí từ ký ức Âm Nha để nâng cao thực lực cho các đệ tử khác." },
    { id: 'deba_dn_stage_30', text: "Tuy nhiên, hành động của hắn vấp phải sự phản đối của một phe bảo thủ trong tông môn." },
    { id: 'deba_dn_stage_31', text: "Hắn biết rằng muốn môn phái thực sự lớn mạnh, hắn cần phải có uy quyền tuyệt đối." },
    { id: 'deba_dn_stage_32', text: "Hắn rời môn phái, bắt đầu hành trình của riêng mình để tìm kiếm sức mạnh và các mảnh vỡ khác của Ma Ha Cổ Kính." },
    { id: 'deba_dn_stage_33', text: "Manh mối đầu tiên chỉ về 'Thiên Cổ Thi Địa', một trong những cấm địa nguy hiểm nhất." },
    { id: 'deba_dn_stage_34', text: "Hắn tiến vào Thiên Cổ Thi Địa, nơi mà ngay cả đại hiền cũng có thể ngã xuống." },
    { id: 'deba_dn_stage_35', text: "Dựa vào kiến thức của Âm Nha, hắn tránh né vô số nguy hiểm, tìm được một mảnh gương thứ hai." },
    { id: 'deba_dn_stage_36', text: "Mảnh gương mới cho hắn công pháp 'Thiên Thủ Kỹ', một loại kỹ năng chiến đấu biến hóa vô lường." },
    { id: 'deba_dn_stage_37', text: "Tại đây, hắn cũng gặp được một người đến từ 'U Thánh Giới', một thế lực chuyên nghiên cứu về tử vong và linh hồn." },
    { id: 'deba_dn_stage_38', text: "Người này nhận ra khí tức của Âm Nha và Ma Ha Cổ Kính, muốn cướp đoạt nó." },
    { id: 'deba_dn_stage_39', text: "Lâm Phong chiến một trận ác liệt, cuối cùng thành công chạy thoát nhưng cũng biết được sự tồn tại của những thế lực ẩn giấu." },
    { id: 'deba_dn_stage_40', text: "Hắn đột phá Trấn Ngục Cảnh." },
    { id: 'deba_dn_stage_41', text: "Hắn quyết định xây dựng thế lực của riêng mình, bắt đầu từ việc thu phục một số tán tu và tiểu yêu có tiềm lực." },
    { id: 'deba_dn_stage_42', text: "Hắn dùng kiến thức của mình để chỉ điểm cho họ, giúp họ giải quyết các vấn đề nan giải trong tu luyện." },
    { id: 'deba_dn_stage_43', text: "Dần dần, một tổ chức bí ẩn mang tên 'Ma Nha Các' bắt đầu hình thành." },
    { id: 'deba_dn_stage_44', text: "Mục tiêu của Ma Nha Các là thu thập thông tin, tìm kiếm các mảnh vỡ của Ma Ha Cổ Kính và đối phó với các kẻ thù của Âm Nha." },
    { id: 'deba_dn_stage_45', text: "Trong lúc phát triển thế lực, hắn nghe tin một đại giáo là 'Chiến Thần Điện' đang tìm kiếm truyền nhân." },
    { id: 'deba_dn_stage_46', text: "Dựa vào ký ức, hắn biết Chiến Thần Điện có một mảnh gương." },
    { id: 'deba_dn_stage_47', text: "Hắn tham gia vào cuộc tuyển chọn, đối đầu với vô số thiên tài từ khắp Cửu Giới." },
    { id: 'deba_dn_stage_48', text: "Hắn không dùng sức mạnh của Âm Nha, mà chỉ dùng thực lực và trí tuệ của bản thân để vượt qua các thử thách." },
    { id: 'deba_dn_stage_49', text: "Hắn thành công trở thành một trong các ứng viên cuối cùng." },
    { id: 'deba_dn_stage_50', text: "Trong thử thách cuối cùng, hắn phải đối mặt với một tia ý chí của Chiến Thần Tiên Đế." },
    { id: 'deba_dn_stage_51', text: "Ý chí này nhận ra khí tức của Âm Nha, nổi giận và muốn tiêu diệt hắn." },
    { id: 'deba_dn_stage_52', text: "Lâm Phong phải dùng tàn niệm của Âm Nha để đối thoại và thỏa thuận với ý chí của Tiên Đế." },
    { id: 'deba_dn_stage_53', text: "Cuối cùng, hắn thành công có được mảnh gương và cả傳承 (truyền thừa) của Chiến Thần Điện." },
    { id: 'deba_dn_stage_54', text: "Hắn không trở thành truyền nhân, mà chỉ lấy đi thứ mình cần, sau đó rời đi, để lại sự kinh ngạc cho cả Chiến Thần Điện." },
    { id: 'deba_dn_stage_55', text: "Các mảnh gương hợp lại, cho hắn một phần ký ức hoàn chỉnh hơn về kẻ thù thực sự của Âm Nha - những kẻ đứng sau Hắc Ám Cựu Thổ." },
    { id: 'deba_dn_stage_56', text: "Lâm Phong nhận ra gánh nặng trên vai mình lớn hơn hắn tưởng rất nhiều." },
    { id: 'deba_dn_stage_57', text: "Hắn trở lại Tẩy Nhan Cổ Phái, dùng uy danh và thực lực của mình để dẹp tan phe bảo thủ, hoàn toàn nắm quyền." },
    { id: 'deba_dn_stage_58', text: "Dưới sự lãnh đạo của hắn, Tẩy Nhan Cổ Phái bắt đầu lấy lại vinh quang năm xưa." },
    { id: 'deba_dn_stage_59', text: "Hắn đột phá Uẩn Thể Cảnh, chuẩn bị cho con đường trở thành Thánh Tôn." },
    { id: 'deba_dn_stage_60', text: "Con đường phía trước còn rất dài, hắn phải đối mặt với các Đế thống tiên môn khác, các cấm địa, và cả những tồn tại cổ xưa mà Âm Nha từng phong ấn." }
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
    { id: 'tay_nhan_co_phai', name: "Tẩy Nhan Cổ Phái", alignment: 'Trung Lập', description: "Một Đế thống tiên môn đã từng huy hoàng dưới thời Minh Nhân Tiên Đế, nay đã sa sút không phanh." }
];
export const DEBA_LOCATIONS: InitialLocation[] = [];
export const DEBA_WORLD_REGIONS: InitialWorldRegion[] = [];
export const DEBA_PROVINCES: InitialProvince[] = [];
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