

import type { ScenarioStage, InitialItem, InitialCongPhap, InitialNpc, InitialSect, WorldLocation, NguHanhType, Rule, CultivationTier, LinhCanQuality } from '../../types';
import { CULTIVATION_SYSTEM } from '../../constants';

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
    { id: 'moc_tran_chan_nhan', name: "Mộc Trần Chân Nhân", description: "Trưởng lão cuối cùng của Thanh Mộc Tông, người đã cứu và truyền lại hy vọng cho Lâm Hồn.", relationship: 'Sư phụ', personalHistory: "Cả đời tâm huyết với Thanh Mộc Tông, chứng kiến tông môn suy tàn trong tay ma đạo. Hy vọng cuối cùng đặt cả vào Lâm Hồn." },
    { id: 'luc_yen', name: "Lục Yên", description: "Nữ tu sĩ Bách Độc Môn, tính cách cổ quái, am hiểu độc thuật. Ban đầu lạnh lùng nhưng dần bị sự lương thiện của Lâm Hồn cảm hóa.", relationship: 'Đồng hành', personalHistory: "Từng bị phản bội trong môn phái nên luôn cảnh giác với người lạ. Việc được Lâm Hồn cứu giúp đã gieo một hạt giống hoài nghi về con đường tu luyện của bản thân." }
];
export const TIEN_NGHICH_SECTS: InitialSect[] = [
// FIX: Add missing properties `ranks`, `facilities`, and `treasury` to conform to the InitialSect type.
    { id: 'thanh_moc_tong', name: "Thanh Mộc Tông", alignment: 'Chính Đạo', description: "Một tiểu môn phái chuyên tu luyện công pháp Mộc hệ, chủ trương thuận theo tự nhiên, không thích tranh đấu.", level: 2, locationId: 'tn_khu_vuc_thanh_moc', ranks: [], facilities: [], treasury: {} },
// FIX: Add missing properties `ranks`, `facilities`, and `treasury` to conform to the InitialSect type.
    { id: 'hang_nhac_phai', name: "Hằng Nhạc Phái", alignment: 'Chính Đạo', description: "Một trong ba đại tông môn của nước Triệu, từng là nơi Vương Lâm tu luyện.", level: 4, locationId: 'tn_khu_vuc_hang_nhac', ranks: [], facilities: [], treasury: {} },
// FIX: Add missing properties `ranks`, `facilities`, and `treasury` to conform to the InitialSect type.
    { id: 'huyen_dao_tong', name: "Huyền Đạo Tông", alignment: 'Chính Đạo', description: "Một trong ba đại tông môn của nước Triệu, nổi tiếng với các đan dược và pháp thuật kỳ dị.", level: 4, locationId: 'tn_quoc_gia_trieu', ranks: [], facilities: [], treasury: {} },
// FIX: Add missing properties `ranks`, `facilities`, and `treasury` to conform to the InitialSect type.
    { id: 'thi_ma_mon', name: "Thi Ma Môn", alignment: 'Ma Đạo', description: "Ma môn tàn độc, chuyên luyện chế cương thi và các loại ma công âm hiểm.", level: 5, locationId: 'tn_khu_vuc_thi_am_tong', ranks: [], facilities: [], treasury: {} },
// FIX: Add missing properties `ranks`, `facilities`, and `treasury` to conform to the InitialSect type.
    { id: 'hop_hoan_tong', name: "Hợp Hoan Tông", alignment: 'Ma Đạo', description: "Ma môn nổi tiếng với thuật song tu, đệ tử thường dùng mị thuật để khống chế người khác.", level: 5, locationId: 'tn_quoc_gia_trieu', ranks: [], facilities: [], treasury: {} }
];
export const TIEN_NGHICH_WORLD_LOCATIONS: WorldLocation[] = [
    // Level 1: Đại Vực
    { 
        id: 'tn_dai_vuc_nam_vuc', 
        name: 'Nam Vực', 
        description: 'Một trong Tứ Đại Vực của Chu Tước Tinh, nơi tài nguyên tu chân không quá phong phú, các tu sĩ tranh đấu kịch liệt.', 
        level: 1, 
        parentId: null, 
        controllingSectIds: [],
        type: 'Quần Cư',
        safetyLevel: 'Nguy Hiểm',
        x: 50,
        y: 50,
    },
    {
        id: 'tn_dai_vuc_ngoai_vuc',
        name: 'Vực Ngoại Chiến Trường',
        description: 'Một khu vực không gian bất ổn định nằm giữa các tinh vực, là nơi các tu sĩ liều mạng tìm kiếm cơ duyên và chém giết lẫn nhau. Vô cùng nguy hiểm nhưng cũng đầy kỳ ngộ.',
        level: 1,
        parentId: null,
        controllingSectIds: [],
        type: 'Nguy Hiểm',
        safetyLevel: 'Tử Địa',
        realmRequirement: 'Kết Đan Kỳ',
        x: 85,
        y: 40,
    },
    {
        id: 'tn_dai_vuc_la_thien',
        name: 'La Thiên Tinh Vực',
        description: 'Một tinh vực hùng mạnh và rộng lớn hơn Tu Chân Liên Minh rất nhiều, là trung tâm của vô số cường giả và thế lực.',
        level: 1,
        parentId: null,
        controllingSectIds: [],
        type: 'Quần Cư',
        safetyLevel: 'Nguy Hiểm',
        realmRequirement: 'Nguyên Anh Kỳ',
        x: 40,
        y: 15,
    },
    // Level 2: Quốc Gia in Nam Vực
    { 
        id: 'tn_quoc_gia_trieu', 
        name: 'Triệu Quốc', 
        description: 'Một nước tu chân nhỏ bé ở biên giới Nam Vực, do ba đại tông môn Hằng Nhạc, Huyền Đạo và Phiêu Miểu cùng cai quản.', 
        level: 2, 
        parentId: 'tn_dai_vuc_nam_vuc', 
        sovereigntyType: 'autonomous',
        controllingSectIds: ['hang_nhac_phai', 'huyen_dao_tong'],
        type: 'Quần Cư',
        safetyLevel: 'Trung Lập',
        x: 50,
        y: 50,
    },
    // Level 3: Locations in Triệu Quốc
    { 
        id: 'tn_khu_vuc_thanh_moc', 
        name: "Thanh Mộc Cốc", 
        description: "Một sơn cốc hẻo lánh, nơi Thanh Mộc Tông tọa lạc. Linh khí Mộc hệ dồi dào, cây cối xanh tốt quanh năm.", 
        level: 3, 
        parentId: 'tn_quoc_gia_trieu', 
        sovereigntyType: 'autonomous',
        controllingSectIds: ['thanh_moc_tong'],
        type: 'Tự Nhiên',
        safetyLevel: 'An Toàn Khu',
        realmRequirement: 'Ngưng Khí Kỳ',
        x: 30,
        y: 70,
    },
    { 
        id: 'tn_khu_vuc_hang_nhac', 
        name: "Hằng Nhạc Sơn Mạch", 
        description: "Dãy núi chính của Triệu Quốc, linh