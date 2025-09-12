import type { InitialItem, InitialCongPhap } from '../types';

export const THIEN_THU_VAT_PHAM_TIEU_HAO: InitialItem[] = [
    // Đan dược
    { id: 'thien_thu_dan_1', name: 'Hồi Linh Tán', description: 'Linh dược cơ bản, giúp phục hồi một lượng nhỏ linh lực.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 2, enableRecovery: true, recoverySpiritPower: 25, recoveryHp: 0, recoveryStamina: 0, recoveryMentalState: 0, enableRecoveryOverTime: false, recoveryDuration: 1 },
    { id: 'thien_thu_dan_2', name: 'Trúc Cơ Đan', description: 'Đan dược quý giá, tăng tỷ lệ đột phá Trúc Cơ thành công.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 4, effectIds: ['pha_canh_dan'] },
    { id: 'thien_thu_dan_3', name: 'Bồi Nguyên Đan', description: 'Đan dược ôn hòa, giúp củng cố và phục hồi cả sinh lực lẫn linh lực.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 3, enableRecovery: true, recoveryHp: 50, recoverySpiritPower: 30 },
    { id: 'thien_thu_dan_4', name: 'Tật Phong Đan', description: 'Tạm thời tăng mạnh thân pháp, giúp di chuyển nhanh như gió.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 2, effectIds: ['than_hanh'] },
    { id: 'thien_thu_dan_5', name: 'Thanh Hồn Đan', description: 'Giúp tâm thần thanh tịnh, tăng nhẹ khả năng chống lại tâm ma và ảo giác.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 4, enableRecovery: true, recoveryMentalState: 40 },
    { id: 'thien_thu_dan_6', name: 'Huyền Nham Đan', description: 'Sau khi dùng, toàn thân cứng như đá hoa cương, tăng mạnh phòng ngự trong một thời gian ngắn.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 3, effectIds: ['kim_than_bat_hoai'] },
    { id: 'thien_thu_dan_7', name: 'Cửu Chuyển Hồi Hồn Đan', description: 'Linh đan cứu mạng, có thể kéo người từ quỷ môn quan trở về, hồi phục một lượng lớn sinh lực ngay tức thì.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 5, enableRecovery: true, recoveryHp: 250 },
    
    // Thảo dược
    { id: 'thien_thu_thao_duoc_1', name: 'Linh Tâm Thảo', description: 'Linh thảo phổ biến, là thành phần chính của nhiều loại đan dược cấp thấp.', itemType: 'Tiêu hao', consumableType: 'Thảo dược', quantity: 1, rank: 1 },
    { id: 'thien_thu_thao_duoc_2', name: 'Ngân Tuyến Hoa', description: 'Một đóa hoa có những sợi tơ bạc lấp lánh, dùng để luyện chế các loại đan dược liên quan đến thần hồn.', itemType: 'Tiêu hao', consumableType: 'Thảo dược', quantity: 1, rank: 3 },
    { id: 'thien_thu_thao_duoc_3', name: 'Huyết Long Quả', description: 'Linh quả màu đỏ như máu, chứa đựng khí huyết dồi dào, có thể dùng trực tiếp để cường hóa nhục thân.', itemType: 'Tiêu hao', consumableType: 'Thảo dược', quantity: 1, rank: 4, attributes: { bodyStrength: 5 } },
    { id: 'thien_thu_thao_duoc_4', name: 'Uẩn Hồn Thảo', description: 'Loại cỏ mọc ở nơi âm khí cực thịnh, có tác dụng nuôi dưỡng và phục hồi thần hồn bị tổn thương.', itemType: 'Tiêu hao', consumableType: 'Thảo dược', quantity: 1, rank: 4 },

    // Khoáng thạch
    { id: 'thien_thu_khoang_thach_1', name: 'Hắc Thiết', description: 'Một loại khoáng thạch phổ biến, dùng để luyện chế pháp khí cấp thấp.', itemType: 'Tiêu hao', consumableType: 'Khoáng thạch', quantity: 1, rank: 1 },
    { id: 'thien_thu_khoang_thach_2', name: 'Hàn Thiết Tinh', description: 'Khoáng thạch ẩn chứa hàn khí, thích hợp để luyện chế các pháp bảo thuộc tính Thủy.', itemType: 'Tiêu hao', consumableType: 'Khoáng thạch', quantity: 1, rank: 3, nguHanhAttribute: 'thuy' },
    { id: 'thien_thu_khoang_thach_3', name: 'Thiên Ngoại Vẫn Thiết', description: 'Kim loại từ ngoài không trung rơi xuống, cực kỳ cứng rắn và nặng nề, là tài liệu tuyệt hảo để luyện chế trọng bảo.', itemType: 'Tiêu hao', consumableType: 'Khoáng thạch', quantity: 1, rank: 5, nguHanhAttribute: 'kim' },
    
    // Vật liệu
    { id: 'thien_thu_vlieu_1', name: 'Yêu Thú Nội Đan (Hạ phẩm)', description: 'Nội đan từ yêu thú cấp thấp, chứa đựng một lượng linh khí nhất định.', itemType: 'Tiêu hao', consumableType: 'Vật liệu', quantity: 1, rank: 2 },
    { id: 'thien_thu_vlieu_2', name: 'Ma Hạch', description: 'Hạt nhân năng lượng của ma vật, ẩn chứa ma khí tinh thuần, là tài liệu cần thiết cho ma tu.', itemType: 'Tiêu hao', consumableType: 'Vật liệu', quantity: 1, rank: 3 },
    { id: 'thien_thu_vlieu_3', name: 'Lân Giáp Giao Long', description: 'Vảy của giao long, cứng rắn vô song, có khả năng kháng Thủy pháp cực mạnh.', itemType: 'Tiêu hao', consumableType: 'Vật liệu', quantity: 1, rank: 5, nguHanhAttribute: 'thuy' },

    // More Dan Duoc
    { id: 'thien_thu_dan_8', name: 'Tụ Khí Tán', description: 'Tăng tốc độ hấp thụ linh khí trong một thời gian ngắn, hiệu quả tu luyện tăng nhẹ.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 2, effectIds: ['tu_linh'] },
    { id: 'thien_thu_dan_9', name: 'Kim Cương Đan', description: 'Đan dược Thổ hệ, sau khi dùng thân thể cứng như kim cương, tăng mạnh phòng ngự nhục thân.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 3, attributes: { bodyStrength: 10, defense: 10 }, nguHanhAttribute: 'tho' },
    { id: 'thien_thu_dan_10', name: 'Liệt Hỏa Đan', description: 'Đan dược Hỏa hệ, tạm thời tăng mạnh uy lực của các pháp thuật Hỏa hệ.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 3, attributes: { magicPower: 15 }, nguHanhAttribute: 'hoa' },
    { id: 'thien_thu_dan_11', name: 'Trường Sinh Đan', description: 'Đan dược nghịch thiên, có khả năng đoạt tạo hóa, giúp tăng 10 năm tuổi thọ. Cả đời chỉ có thể dùng một lần.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 6 },
    { id: 'thien_thu_dan_12', name: 'Vô Ảnh Đan', description: 'Sau khi dùng, thân hình trở nên hư ảo, tăng mạnh thân pháp và khả năng ẩn nấp.', itemType: 'Tiêu hao', consumableType: 'Đan dược', quantity: 1, rank: 4, attributes: { agility: 20 } },
    
    // More Thao Duoc
    { id: 'thien_thu_thao_duoc_5', name: 'Thiên Diệp Chi', description: 'Linh chi ngàn năm, mỗi phiến lá ẩn chứa linh khí tinh thuần, dùng trực tiếp có thể tăng mạnh tu vi.', itemType: 'Tiêu hao', consumableType: 'Thảo dược', quantity: 1, rank: 5, attributes: { aptitude: 10 } },
    { id: 'thien_thu_thao_duoc_6', name: 'Đoạn Hồn Thảo', description: 'Cỏ độc mọc ở nơi tử khí, có thể dùng để luyện chế các loại kịch độc hoặc ám khí.', itemType: 'Tiêu hao', consumableType: 'Thảo dược', quantity: 1, rank: 4 },
    { id: 'thien_thu_thao_duoc_7', name: 'Cửu Sắc Lộc Nhung', description: 'Nhung của hươu chín màu, đại bổ chi vật, có thể cải tử hoàn sinh, tăng toàn diện các chỉ số một cách vĩnh viễn.', itemType: 'Tiêu hao', consumableType: 'Thảo dược', quantity: 1, rank: 6, attributes: { physicalStrength: 5, magicPower: 5, bodyStrength: 5, defense: 5, agility: 5, spiritualSense: 5, aptitude: 5 } },
    { id: 'thien_thu_thao_duoc_8', name: 'Băng Linh Tuyết Liên', description: 'Bông sen tuyết ngàn năm mọc ở nơi cực hàn, chứa đựng linh khí Thủy hệ tinh khiết nhất.', itemType: 'Tiêu hao', consumableType: 'Thảo dược', quantity: 1, rank: 5, nguHanhAttribute: 'thuy' },

    // More Khoang Thach
    { id: 'thien_thu_khoang_thach_4', name: 'Dương Viêm Thạch', description: 'Khoáng thạch được hình thành trong lòng dung nham, chứa đựng năng lượng Hỏa hệ bạo liệt.', itemType: 'Tiêu hao', consumableType: 'Khoáng thạch', quantity: 1, rank: 3, nguHanhAttribute: 'hoa' },
    { id: 'thien_thu_khoang_thach_5', name: 'Tinh Ngân', description: 'Kim loại hiếm, dẫn linh khí cực tốt, là tài liệu chủ yếu để luyện chế phi kiếm và pháp bảo sắc bén.', itemType: 'Tiêu hao', consumableType: 'Khoáng thạch', quantity: 1, rank: 4, nguHanhAttribute: 'kim' },
    { id: 'thien_thu_khoang_thach_6', name: 'Hỗn Độn Thạch', description: 'Viên đá tồn tại từ thời khai thiên lập địa, chứa đựng quy tắc nguyên thủy, vô cùng nặng nề.', itemType: 'Tiêu hao', consumableType: 'Khoáng thạch', quantity: 1, rank: 6 },
    
    // More Vat Lieu
    { id: 'thien_thu_vlieu_4', name: 'Phượng Hoàng Linh Vũ', description: 'Lông vũ của thần thú Phượng Hoàng, chứa đựng ngọn lửa Niết Bàn bất diệt.', itemType: 'Tiêu hao', consumableType: 'Vật liệu', quantity: 1, rank: 6, nguHanhAttribute: 'hoa' },
    { id: 'thien_thu_vlieu_5', name: 'Yêu Thú Nội Đan (Trung phẩm)', description: 'Nội đan từ yêu thú Kết Đan kỳ, linh khí dồi dào, có thể dùng để luyện đan hoặc bố trận.', itemType: 'Tiêu hao', consumableType: 'Vật liệu', quantity: 1, rank: 4 },
    { id: 'thien_thu_vlieu_6', name: 'Quỷ Vương Chi Giác', description: 'Sừng của Quỷ Vương, chứa đựng oán khí và ma lực ngập trời, là tuyệt phẩm cho ma tu.', itemType: 'Tiêu hao', consumableType: 'Vật liệu', quantity: 1, rank: 5 },
];

export const THIEN_THU_TRANG_BI: InitialItem[] = [
    // Vũ khí
    { id: 'thien_thu_tb_1', name: 'Hắc Thiết Kiếm', description: 'Kiếm làm từ Hắc Thiết, nặng và bền.', itemType: 'Trang bị', equipmentType: 'Vũ khí', quantity: 1, rank: 1, attributes: { physicalStrength: 5 } },
    { id: 'thien_thu_tb_3', name: 'Lưu Ly Phiến', description: 'Quạt làm từ ngọc lưu ly, vừa là vũ khí vừa là pháp khí tao nhã, tăng cường uy lực pháp thuật Mộc hệ.', itemType: 'Trang bị', equipmentType: 'Vũ khí', quantity: 1, rank: 3, attributes: { magicPower: 15, spiritualSense: 5 }, nguHanhAttribute: 'moc' },
    { id: 'thien_thu_tb_7', name: 'Phá Quân Thương', description: 'Một cây trường thương mang theo sát khí, càng chiến càng mạnh, có khả năng xuyên phá mọi phòng ngự.', itemType: 'Trang bị', equipmentType: 'Vũ khí', quantity: 1, rank: 4, attributes: { physicalStrength: 25, critChance: 5 }, effectIds: ['pha_giap'] },
    { id: 'thien_thu_tb_8', name: 'Huyết Ảnh Đao', description: 'Thanh đao uống máu, mỗi lần chém trúng kẻ địch sẽ tự hồi phục một phần sinh lực cho chủ nhân.', itemType: 'Trang bị', equipmentType: 'Vũ khí', quantity: 1, rank: 4, attributes: { physicalStrength: 20 }, effectIds: ['hap_huyet'] },
    { id: 'thien_thu_tb_9', name: 'Vong Trần Cầm', description: 'Cây đàn cổ, tiếng đàn có thể tấn công trực tiếp vào thần hồn của địch thủ.', itemType: 'Trang bị', equipmentType: 'Vũ khí', quantity: 1, rank: 5, attributes: { magicPower: 30, spiritualSense: 10 }, effectIds: ['chan_hon'] },

    // Giáp
    { id: 'thien_thu_tb_4', name: 'Huyền Quy Giáp', description: 'Giáp được chế tác từ mai của Huyền Quy ngàn năm, phòng ngự cực cao nhưng hơi nặng nề.', itemType: 'Trang bị', equipmentType: 'Giáp', quantity: 1, rank: 4, attributes: { defense: 30, agility: -5 }, effectIds: ['bat_hoai'], nguHanhAttribute: 'thuy' },
    { id: 'thien_thu_tb_10', name: 'Linh Xà Lân Giáp', description: 'Bộ giáp nhẹ làm từ vảy của Linh Xà, cực kỳ dẻo dai, tăng mạnh thân pháp và khả năng né tránh.', itemType: 'Trang bị', equipmentType: 'Giáp', quantity: 1, rank: 3, attributes: { defense: 15, agility: 10 } },
    
    // Áo choàng
    { id: 'thien_thu_tb_2', name: 'Thanh Vân Bào', description: 'Pháp bào của đệ tử Thanh Vân Môn, có khả năng phòng ngự nhất định.', itemType: 'Trang bị', equipmentType: 'Áo choàng', quantity: 1, rank: 2, attributes: { defense: 10, magicPower: 2 } },
    { id: 'thien_thu_tb_11', name: 'Tinh Thần Pháp Bào', description: 'Pháp bào được dệt từ tơ của Tinh Thần Thảo, giúp tu sĩ dễ dàng câu thông với linh khí, tăng cường sức mạnh phép thuật.', itemType: 'Trang bị', equipmentType: 'Áo choàng', quantity: 1, rank: 4, attributes: { magicPower: 20, spiritualSense: 5 }, effectIds: ['tu_linh'] },
    
    // Giày
    { id: 'thien_thu_tb_5', name: 'Tà Vân Ngoa', description: 'Đôi giày được dệt từ tơ của Tà Vân T蛛, giúp người mang có thân pháp nhẹ nhàng, phiêu dật.', itemType: 'Trang bị', equipmentType: 'Giày', quantity: 1, rank: 3, attributes: { agility: 15 }, effectIds: ['than_hanh'] },
    
    // Mũ
    { id: 'thien_thu_tb_12', name: 'Thông Thiên Quán', description: 'Mũ miện giúp tu sĩ giữ tâm thần thanh tịnh, tăng mạnh thần thức và khả năng kháng lại các đòn tấn công tinh thần.', itemType: 'Trang bị', equipmentType: 'Mũ', quantity: 1, rank: 4, attributes: { spiritualSense: 20 }, effectIds: ['than_minh', 'van_phap_bat_xam'] },

    // Găng tay
    { id: 'thien_thu_tb_13', name: 'Phá Sơn Quyền Sáo', description: 'Đôi găng tay làm từ đá Phá Sơn, tăng cường sức mạnh cho các đòn tấn công bằng tay không.', itemType: 'Trang bị', equipmentType: 'Găng tay', quantity: 1, rank: 3, attributes: { physicalStrength: 15, bodyStrength: 5 }, nguHanhAttribute: 'tho' },

    // Phụ kiện
    { id: 'thien_thu_tb_6', name: 'An Hồn Mộc', description: 'Một miếng gỗ tỏa ra hương thơm dịu nhẹ, giúp an định thần hồn, chống lại các đòn tấn công tâm thần.', itemType: 'Trang bị', equipmentType: 'Phụ kiện', quantity: 1, rank: 2, attributes: { spiritualSense: 8 }, nguHanhAttribute: 'moc', effectIds: ['van_phap_bat_xam'] },
    { id: 'thien_thu_tb_14', name: 'Tụ Linh Bội', description: 'Miếng ngọc bội có khả năng tự động hấp thụ linh khí trời đất, từ từ hồi phục linh lực cho người đeo.', itemType: 'Trang bị', equipmentType: 'Phụ kiện', quantity: 1, rank: 3, attributes: { spiritualSense: 5 }, effectIds: ['tu_linh'] },

    // Trang sức
    { id: 'thien_thu_tb_15', name: 'Liệt Hỏa Giới', description: 'Chiếc nhẫn được rèn trong địa tâm hỏa, khuếch đại uy lực của các pháp thuật Hỏa hệ.', itemType: 'Trang bị', equipmentType: 'Trang sức', quantity: 1, rank: 3, attributes: { magicPower: 10 }, nguHanhAttribute: 'hoa' },
    
    // More Vu Khi
    { id: 'thien_thu_tb_16', name: 'Huyền Băng Kiếm', description: 'Kiếm được rèn từ Hàn Thiết Tinh ngàn năm, toát ra hàn khí, đòn đánh có thể làm chậm kẻ địch.', itemType: 'Trang bị', equipmentType: 'Vũ khí', quantity: 1, rank: 4, attributes: { magicPower: 20 }, nguHanhAttribute: 'thuy' },
    { id: 'thien_thu_tb_17', name: 'Thí Thần Thương', description: 'Cây trường thương từng nhuốm máu thần ma, ẩn chứa sát khí kinh thiên, càng chém càng hăng.', itemType: 'Trang bị', equipmentType: 'Vũ khí', quantity: 1, rank: 6, attributes: { physicalStrength: 40, critDamage: 50 }, effectIds: ['sat_luc_chi_tam'] },
    { id: 'thien_thu_tb_18', name: 'Cửu Cung Kính', description: 'Gương đồng cổ khắc Cửu Cung Bát Quái, có thể diễn hóa thiên cơ, phá giải trận pháp.', itemType: 'Trang bị', equipmentType: 'Vũ khí', quantity: 1, rank: 5, attributes: { spiritualSense: 30 }, effectIds: ['dien_thien_co'] },
    
    // More Giap
    { id: 'thien_thu_tb_19', name: 'Vạn Tượng Giáp', description: 'Bộ giáp có thể thay đổi hình dạng theo ý niệm, tăng khả năng chống chịu mọi loại sát thương.', itemType: 'Trang bị', equipmentType: 'Giáp', quantity: 1, rank: 5, attributes: { defense: 35 }, effectIds: ['nguyen_to_khang'] },
    { id: 'thien_thu_tb_20', name: 'Hỏa Lân Giáp', description: 'Giáp làm từ vảy của Hỏa Kỳ Lân, kháng hỏa công cực mạnh và có thể phản lại một phần sát thương lửa.', itemType: 'Trang bị', equipmentType: 'Giáp', quantity: 1, rank: 4, attributes: { defense: 25 }, nguHanhAttribute: 'hoa', effectIds: ['phan_thuong'] },

    // More Ao Choang
    { id: 'thien_thu_tb_21', name: 'Vô Tướng Bào', description: 'Áo choàng có khả năng ẩn giấu khí tức và hình thể, giúp né tránh sự dò xét của thần thức.', itemType: 'Trang bị', equipmentType: 'Áo choàng', quantity: 1, rank: 5, attributes: { agility: 15 }, effectIds: ['huyen_than'] },
    { id: 'thien_thu_tb_22', name: 'Thủy Vân Bào', description: 'Áo choàng dệt từ tơ của Giao Long Nước, mềm mại như mây, kháng thủy pháp và giảm tiêu hao linh lực khi thi triển phép Thủy.', itemType: 'Trang bị', equipmentType: 'Áo choàng', quantity: 1, rank: 3, attributes: { defense: 15, magicPower: 5 }, nguHanhAttribute: 'thuy' },

    // More Giay
    { id: 'thien_thu_tb_23', name: 'Truy Tinh Ngoa', description: 'Đôi giày có thể hấp thụ ánh sao, đi nhanh như sao băng, càng ở dưới trời đêm tốc độ càng nhanh.', itemType: 'Trang bị', equipmentType: 'Giày', quantity: 1, rank: 5, attributes: { agility: 30 }, effectIds: ['suc_dia_thanh_thon'] },
    
    // More Mu
    { id: 'thien_thu_tb_24', name: 'Ngọc Thanh Khôi', description: 'Mũ ngọc giúp giữ đầu óc tỉnh táo, tăng tốc độ hồi phục linh lực và giảm thời gian lĩnh ngộ công pháp.', itemType: 'Trang bị', equipmentType: 'Mũ', quantity: 1, rank: 3, attributes: { spiritualSense: 10, aptitude: 5 }, effectIds: ['than_minh'] },
    
    // More Gang Tay
    { id: 'thien_thu_tb_25', name: 'Thiên Tàm Thủ Sáo', description: 'Găng tay làm từ tơ của Thiên Tằm ngàn năm, bền chắc không thể phá hủy, giúp thi triển pháp quyết nhanh hơn và tăng uy lực.', itemType: 'Trang bị', equipmentType: 'Găng tay', quantity: 1, rank: 4, attributes: { magicPower: 10, agility: 5 } },
    
    // More Phu Kien
    { id: 'thien_thu_tb_26', name: 'Trấn Hồn Ngọc', description: 'Miếng ngọc bội có khả năng trấn áp và làm suy yếu linh hồn, hiệu quả đặc biệt với yêu ma, quỷ vật.', itemType: 'Trang bị', equipmentType: 'Phụ kiện', quantity: 1, rank: 5, attributes: { spiritualSense: 15 }, effectIds: ['tran_hon'] },
    { id: 'thien_thu_tb_27', name: 'Bình An Phù', description: 'Bùa cầu may được cao tăng khai quang, không có tác dụng thực tế nhưng mang lại sự an tâm, tăng nhẹ căn cốt.', itemType: 'Trang bị', equipmentType: 'Phụ kiện', quantity: 1, rank: 1, attributes: { aptitude: 1 } },
    
    // More Trang Suc
    { id: 'thien_thu_tb_28', name: 'Càn Khôn Nhẫn', description: 'Nhẫn trữ vật không gian cực lớn, bên trong dường như có một tiểu thế giới có thể chứa được cả sinh vật sống.', itemType: 'Trang bị', equipmentType: 'Trang sức', quantity: 1, rank: 6, attributes: { spiritualSense: 10 } },
    { id: 'thien_thu_tb_29', name: 'Thái Dương Tinh Thạch', description: 'Dây chuyền gắn viên đá được ngưng tụ từ tinh hoa mặt trời, tăng mạnh sức mạnh Hỏa hệ và có thể phát ra quang minh chính đại.', itemType: 'Trang bị', equipmentType: 'Trang sức', quantity: 1, rank: 5, attributes: { magicPower: 25 }, nguHanhAttribute: 'hoa' },
    { id: 'thien_thu_tb_30', name: 'Thái Âm Tinh Thạch', description: 'Dây chuyền gắn viên đá được ngưng tụ từ tinh hoa mặt trăng, tăng mạnh sức mạnh Thủy hệ và có thể phát ra hàn khí cực độ.', itemType: 'Trang bị', equipmentType: 'Trang sức', quantity: 1, rank: 5, attributes: { magicPower: 25 }, nguHanhAttribute: 'thuy' },
];

export const THIEN_THU_PHAP_BAO: InitialItem[] = [
    { id: 'thien_thu_pb_1', name: 'Tử Kim Hồ Lô', description: 'Một cái hồ lô màu tím vàng, có thể thu và phóng ra tam muội chân hỏa.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 4, attributes: { magicPower: 20 }, effectIds: ['ngu_linh'], nguHanhAttribute: 'hoa' },
    { id: 'thien_thu_pb_2', name: 'Vạn Dặm Sơn Hà Đồ', description: 'Một bức tranh cổ, khi mở ra có thể vây khốn kẻ địch trong một không gian riêng, núi non trùng điệp.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 5, attributes: { spiritualSense: 25 }, effectIds: ['linh_vuc'], nguHanhAttribute: 'tho' },
    { id: 'thien_thu_pb_3', name: 'Lạc Phách Chung', description: 'Tiếng chuông có thể làm chấn động linh hồn, gây tổn thương trực tiếp lên thần thức của đối phương.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 5, attributes: { magicPower: 15, spiritualSense: 15 }, effectIds: ['chan_hon'] },
    { id: 'thien_thu_pb_4', name: 'Huyễn Quang Kính', description: 'Tấm gương có khả năng sao chép và phản lại pháp thuật cấp thấp của đối phương.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 4, attributes: { spiritualSense: 20 }, effectIds: ['mo_phong'] },
    { id: 'thien_thu_pb_5', name: 'Phi Vân Toa', description: 'Pháp bảo phi hành, có thể chở nhiều người di chuyển với tốc độ cực nhanh.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 3, attributes: { agility: 25 } },
    { id: 'thien_thu_pb_6', name: 'Phục Ma Ấn', description: 'Chiếc ấn lớn mang theo chính khí, khi nện xuống có khả năng trấn áp yêu ma, khiến chúng suy yếu.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 5, attributes: { physicalStrength: 30 }, effectIds: ['tran_hon'] },
    { id: 'thien_thu_pb_7', name: 'Âm Dương Luân', description: 'Một cặp vòng tròn đen trắng, có thể phóng ra để công kích hoặc phòng ngự, biến hóa khôn lường.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 6, attributes: { physicalStrength: 20, magicPower: 20, defense: 10 } },
    { id: 'thien_thu_pb_8', name: 'Ngũ Sắc Thần Quang Phiến', description: 'Quạt làm từ lông của Khổng Tước năm màu, một cái phẩy có thể quét ra thần quang ngũ sắc, không gì không phá.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 6, attributes: { magicPower: 40 }, effectIds: ['thon_phe'] },
    { id: 'thien_thu_pb_9', name: 'Định Hải Châu', description: 'Hạt châu có thể trấn áp tứ hải, điều khiển nước, tạo ra sóng lớn hoặc màn chắn nước.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 5, attributes: { magicPower: 30 }, nguHanhAttribute: 'thuy' },
    { id: 'thien_thu_pb_10', name: 'Khổn Tiên Thằng', description: 'Sợi dây thừng được luyện từ gân rồng, một khi bị trói, tiên nhân cũng khó thoát, toàn thân linh lực bị phong bế.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 4, attributes: { spiritualSense: 15 } },
    { id: 'thien_thu_pb_11', name: 'Cửu Long Thần Hỏa Tráo', description: 'Cái lồng được tạo ra từ chín con rồng lửa, vây khốn và thiêu đốt kẻ địch bằng lửa thần.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 6, attributes: { magicPower: 35 }, effectIds: ['linh_vuc'], nguHanhAttribute: 'hoa' },
    { id: 'thien_thu_pb_12', name: 'Chu Thiên Tinh Đấu Bàn', description: 'Trận bàn có thể mô phỏng sự vận hành của các vì sao để diễn hóa thiên cơ hoặc dẫn dắt tinh thần lực tấn công.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 5, attributes: { spiritualSense: 30 }, effectIds: ['dien_thien_co'] },
    { id: 'thien_thu_pb_13', name: 'Hóa Huyết Thần Đao', description: 'Ma đạo chí bảo, đao có thể làm tan chảy máu thịt của kẻ địch, chuyển hóa thành sức mạnh cho chủ nhân.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 5, attributes: { physicalStrength: 35 }, effectIds: ['hap_huyet'] },
    { id: 'thien_thu_pb_14', name: 'Sơn Hà Xã Tắc Đồ', description: 'Bức họa chứa đựng một thế giới núi sông, có thể thu kẻ địch vào trong tranh, dùng sức mạnh của cả một thế giới để trấn áp.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 6, attributes: { spiritualSense: 35 }, nguHanhAttribute: 'tho', effectIds: ['linh_vuc'] },
    { id: 'thien_thu_pb_15', name: 'Thí Tiên Kiếm', description: 'Kiếm thai được nuôi dưỡng bằng oán khí của hàng vạn sinh linh, chuyên khắc chế tiên linh và các loại hộ thể thần quang.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 6, attributes: { physicalStrength: 50 }, nguHanhAttribute: 'kim', effectIds: ['phe_hon'] },
    { id: 'thien_thu_pb_16', name: 'Luân Hồi Kính', description: 'Gương có thể chiếu ra tiền kiếp và tâm ma của một người, khiến họ rơi vào ảo cảnh luân hồi không thể thoát ra.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 6, attributes: { magicPower: 20, spiritualSense: 20 }, effectIds: ['chan_hon', 'huyen_anh'] },
    { id: 'thien_thu_pb_17', name: 'Bàn Cổ Phiên', description: 'Cờ hiệu mang theo khí tức hỗn độn từ thời khai thiên, một cái phất có thể phá vỡ không gian, uy lực hủy thiên diệt địa.', itemType: 'Pháp bảo', equipmentType: 'Phụ kiện', quantity: 1, rank: 6, attributes: { physicalStrength: 30, magicPower: 30 }, effectIds: ['di_hinh_hoan_anh'] },
];

export const THIEN_THU_CONG_PHAP: InitialCongPhap[] = [
    { id: 'thien_thu_cp_1', name: 'Trường Xuân Công', description: 'Công pháp dưỡng sinh cơ bản, giúp tu vi chậm rãi tăng tiến, kéo dài tuổi thọ.', techniqueType: 'Tu luyện', rank: 2, attributes: { aptitude: 5 }, expPerTurn: 1 },
    { id: 'thien_thu_cp_2', name: 'Kim Quang Hộ Thể', description: 'Vận chuyển linh lực tạo thành một lớp kim quang bảo vệ cơ thể.', techniqueType: 'Phòng thủ', rank: 3, attributes: { defense: 15 }, effectIds: ['kim_than_bat_hoai'], nguHanhAttribute: 'kim' },
    { id: 'thien_thu_cp_3', name: 'Đại Lực Kim Cang Quyết', description: 'Công pháp luyện thể, tăng cường sức mạnh nhục thân và lực bộc phát.', techniqueType: 'Tu luyện', rank: 3, attributes: { physicalStrength: 10, bodyStrength: 10 }, nguHanhAttribute: 'kim' },
    { id: 'thien_thu_cp_4', name: 'Lăng Ba Vi Bộ', description: 'Thân pháp ảo diệu, di chuyển như hình với bóng, né tránh các đòn tấn công.', techniqueType: 'Thân pháp', rank: 4, attributes: { agility: 20 }, effectIds: ['huyen_than'] },
    { id: 'thien_thu_cp_5', name: 'Thái Ất Kiếm Quyết', description: 'Kiếm quyết chính tông, kiếm khí sắc bén, uy lực vô song.', techniqueType: 'Chiến đấu', rank: 5, attributes: { physicalStrength: 25, magicPower: 15 }, effectIds: ['kiem_khi_ho_the'], nguHanhAttribute: 'kim' },
    { id: 'thien_thu_cp_6', name: 'Hóa Huyết Thần Chưởng', description: 'Ma công tà dị, chưởng pháp có thể làm tan chảy huyết nhục của đối phương, vô cùng độc ác.', techniqueType: 'Chiến đấu', rank: 5, attributes: { magicPower: 30, physicalStrength: 5 }, effectIds: ['hap_tinh_dai_phap'] },
    { id: 'thien_thu_cp_7', name: 'Cửu Chuyển Ma Công', description: 'Ma công thượng thừa, tu luyện cực nhanh nhưng dễ tẩu hỏa nhập ma, ảnh hưởng đến tâm trí.', techniqueType: 'Tu luyện', rank: 6, attributes: { aptitude: 25, magicPower: 10 }, expPerTurn: 10, effectIds: ['sat_luc_chi_tam'] },
    { id: 'thien_thu_cp_8', name: 'Băng Tâm Quyết', description: 'Tâm pháp giữ cho nội tâm thanh tịnh như băng, không bị ngoại vật quấy nhiễu, tăng mạnh khả năng kháng hiệu ứng tâm thần.', techniqueType: 'Tâm pháp', rank: 4, attributes: { spiritualSense: 15 }, effectIds: ['thanh_tam_quyet'], nguHanhAttribute: 'thuy' },
    { id: 'thien_thu_cp_9', name: 'Vạn Mộc Sinh Sinh Quyết', description: 'Công pháp Mộc hệ, có khả năng chữa trị vết thương và hồi phục sinh lực cực nhanh.', techniqueType: 'Tu luyện', rank: 4, attributes: { aptitude: 10 }, expPerTurn: 3, nguHanhAttribute: 'moc' },
    { id: 'thien_thu_cp_10', name: 'Súc Địa Thành Thốn', description: 'Thân pháp đỉnh cao, có thể rút ngắn không gian, một bước đi ngàn dặm.', techniqueType: 'Thân pháp', rank: 6, attributes: { agility: 35 }, effectIds: ['suc_dia_thanh_thon'] },
    { id: 'thien_thu_cp_11', name: 'Vạn Kiếm Quy Tông', description: 'Kiếm pháp tối thượng, có thể triệu hồi vạn kiếm tấn công cùng lúc, uy lực hủy diệt.', techniqueType: 'Chiến đấu', rank: 6, attributes: { physicalStrength: 40, magicPower: 20 }, nguHanhAttribute: 'kim' },
    { id: 'thien_thu_cp_12', name: 'Bất Diệt Trường Xuân Công', description: 'Công pháp Mộc hệ, hồi phục sinh lực cực nhanh, gần như đạt đến cảnh giới bất tử bất diệt.', techniqueType: 'Tu luyện', rank: 5, attributes: { aptitude: 15 }, expPerTurn: 5, nguHanhAttribute: 'moc' },
    { id: 'thien_thu_cp_13', name: 'Thôn Thiên Ma Công', description: 'Ma công bá đạo có thể thôn phệ linh lực và tu vi của người khác để bổ sung cho bản thân.', techniqueType: 'Tu luyện', rank: 6, effectIds: ['hap_tinh_dai_phap'], attributes: { magicPower: 30 } },
    { id: 'thien_thu_cp_14', name: 'Đại Mộng Thiên Thu', description: 'Tâm pháp đưa kẻ địch vào giấc mộng, sống hết một đời trong khoảnh khắc, làm hao mòn tâm trí và thần hồn.', techniqueType: 'Tâm pháp', rank: 5, attributes: { spiritualSense: 30 }, effectIds: ['nhiep_hon_thuat'] },
    { id: 'thien_thu_cp_15', name: 'Huyền Vũ Chân Thân', description: 'Công pháp phòng ngự tối cao của Thủy hệ, hóa thân thành thần thú Huyền Vũ, phòng ngự vô song.', techniqueType: 'Phòng thủ', rank: 5, attributes: { defense: 40 }, nguHanhAttribute: 'thuy', effectIds: ['kim_than_bat_hoai'] },
    { id: 'thien_thu_cp_16', name: 'Thần Tượng Trấn Ngục Kình', description: 'Luyện thể công pháp, sức mạnh vô song như Thần Tượng viễn cổ, một quyền có thể trấn áp địa ngục.', techniqueType: 'Tu luyện', rank: 6, attributes: { bodyStrength: 50 }, nguHanhAttribute: 'tho', effectIds: ['luyen_the'] },
    { id: 'thien_thu_cp_17', name: 'Phần Thiên Hỏa Điển', description: 'Công pháp Hỏa hệ, có thể triệu hồi các loại dị hỏa trong trời đất để thiêu đốt vạn vật.', techniqueType: 'Chiến đấu', rank: 5, attributes: { magicPower: 40 }, nguHanhAttribute: 'hoa' },
    { id: 'thien_thu_cp_18', name: 'Nhất Khí Hóa Tam Thanh', description: 'Đại thần thông trong truyền thuyết, có thể phân ra hai hóa thân có thực lực tương đương bản thể.', techniqueType: 'Tâm pháp', rank: 6, attributes: { spiritualSense: 40 } },
    { id: 'thien_thu_cp_19', name: 'Túng Địa Kim Quang', description: 'Thân pháp hệ Kim, hóa thành một tia sáng vàng di chuyển, tốc độ cực nhanh, không gì cản nổi.', techniqueType: 'Thân pháp', rank: 5, attributes: { agility: 30 }, nguHanhAttribute: 'kim', effectIds: ['tan_anh'] },
    { id: 'thien_thu_cp_20', name: 'Tâm Kiếm', description: 'Công pháp đặc biệt, dùng tâm làm kiếm, tấn công vô hình vô ảnh, trực tiếp vào thần hồn, khó lòng phòng bị.', techniqueType: 'Chiến đấu', rank: 4, attributes: { spiritualSense: 25 }, effectIds: ['nhiep_hon_thuat'] },
];