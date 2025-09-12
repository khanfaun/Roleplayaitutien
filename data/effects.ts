import type { StatusEffect, ItemEffectDefinition, DestinyDefinition } from '../types';

// ==================================
// STATUS EFFECT DEFINITIONS
// ==================================
export const STATUS_EFFECT_DEFINITIONS: Record<string, StatusEffect> = {
    // Debuffs
    poisoned: { id: 'poisoned', name: 'Trúng Độc', description: 'Độc khí xâm nhập kinh mạch, liên tục bào mòn sinh lực và thể lực.', type: 'debuff', duration: 3, effects: { primaryStatChangePercent: { maxHp: -10, maxStamina: -5 } } },
    heavily_wounded: { id: 'heavily_wounded', name: 'Bị Thương Nặng', description: 'Thân thể rạn nứt, suy giảm nghiêm trọng sức mạnh và phòng thủ, đồng thời sinh lực liên tục thất thoát.', type: 'debuff', duration: 5, effects: { attributeChangePercent: { physicalStrength: -10, defense: -10 }, primaryStatChangePercent: { maxHp: -20 } } },
    inner_demon: { id: 'inner_demon', name: 'Tâm Ma Xâm Thực', description: 'Ảo ảnh quấy nhiễu, tâm cảnh bất ổn, sức mạnh phép thuật suy giảm.', type: 'debuff', duration: 3, effects: { attributeChangePercent: { magicPower: -10 }, primaryStatChangePercent: { maxMentalState: -10 } } },
    soul_damage: { id: 'soul_damage', name: 'Linh Hồn Tổn Thương', description: 'Thần hồn bất ổn, linh lực khó tụ, thần thức suy yếu.', type: 'debuff', duration: 4, effects: { attributeChangePercent: { spiritualSense: -10 }, primaryStatChangePercent: { maxSpiritPower: -10 } } },
    exhausted: { id: 'exhausted', name: 'Kiệt Sức', description: 'Cạn kiệt sinh cơ, thân pháp trở nên chậm chạp, thể lực khó có thể hồi phục.', type: 'debuff', duration: 2, effects: { attributeChangePercent: { agility: -20 }, primaryStatChangePercent: { maxStamina: -20 } } },
    depressed: { id: 'depressed', name: 'U Uất', description: 'Tâm trí nặng trĩu, tâm cảnh suy sụp, việc cảm ngộ tu luyện trở nên trì trệ.', type: 'debuff', duration: 10, expPerTurn: -5, effects: { primaryStatChangePercent: { maxMentalState: -10 }, attributeChangePercent: { aptitude: -5 } } },
    
    // Buffs
    vigorous: { id: 'vigorous', name: 'Sung Mãn', description: 'Khí huyết dồi dào, sinh cơ cuồn cuộn, giúp thể lực và sinh lực liên tục hồi phục.', type: 'buff', duration: 3, effects: { primaryStatChangePercent: { maxHp: 10, maxStamina: 10 } } },
    battle_frenzy: { id: 'battle_frenzy', name: 'Chiến Ý Ngút Trời', description: 'Lao vào cuồng chiến, tấn công mạnh mẽ hơn nhưng cũng để lộ nhiều sơ hở.', type: 'buff', duration: 2, effects: { attributeChangePercent: { physicalStrength: 15, critChance: 10, defense: -10 } } },
    body_fortification: { id: 'body_fortification', name: 'Thân Thể Cường Hóa', description: 'Nhục thân được cường hóa, vững như bàn thạch, tăng cường sức mạnh và phòng ngự.', type: 'buff', duration: 5, effects: { attributeChangePercent: { bodyStrength: 10, defense: 10 } } },
    abundant_spirit: { id: 'abundant_spirit', name: 'Linh Lực Dồi Dào', description: 'Linh lực trong cơ thể như sông dài bất tận, liên tục hồi phục.', type: 'buff', duration: 5, effects: { primaryStatChangePercent: { maxSpiritPower: 15 } } },
    elated: { id: 'elated', name: 'Tinh Thần Phấn Chấn', description: 'Tâm cảnh vui vẻ, sảng khoái, giúp tinh thần luôn phấn chấn và việc lĩnh ngộ trở nên dễ dàng hơn.', type: 'buff', duration: 10, expPerTurn: 5, effects: { primaryStatChangePercent: { maxMentalState: 10 }, attributeChangePercent: { aptitude: 10 } } },
    heavenly_insight: { id: 'heavenly_insight', name: 'Thiên Nhân Cảm Ứng', description: 'Bất chợt có cảm ngộ với thiên địa, tâm trí thông suốt, thần thức và căn cốt đều được khai mở.', type: 'buff', duration: 1, expPerTurn: 50, effects: { attributeChangePercent: { spiritualSense: 20, aptitude: 10 } } },

    // Neutral/Mixed
    enraged: { id: 'enraged', name: 'Phẫn Nộ', description: 'Lửa giận bùng cháy, mất đi lý trí, sức mạnh tăng vọt nhưng tâm cảnh bất ổn.', type: 'neutral', duration: 2, effects: { attributeChangePercent: { physicalStrength: 20 }, primaryStatChangePercent: { maxMentalState: -10 } } },
    drunk: { id: 'drunk', name: 'Say Rượu', description: 'Chân nam đá chân chiêu, thân pháp loạng choạng nhưng lại ra đòn hiểm hóc bất ngờ.', type: 'neutral', duration: 3, effects: { attributeChangePercent: { agility: -10, physicalStrength: 5 } } },
    paranoid: { id: 'paranoid', name: 'Hoang Tưởng', description: 'Tâm thần bất định, luôn cảm thấy nguy hiểm rình rập, thần thức trở nên nhạy bén một cách thái quá nhưng dễ bị ảnh hưởng bởi ảo giác.', type: 'neutral', duration: 5, effects: { attributeChangePercent: { spiritualSense: 5 }, primaryStatChangePercent: { maxMentalState: -10 } } },
    
    // Roleplay/Social
    renowned: { id: 'renowned', name: 'Danh Tiếng Vang Dội', description: 'Là một tu sĩ được kính trọng trong Chính Đạo, hành sự dễ nhận được sự trợ giúp.', type: 'buff', duration: 999 },
    infamous: { id: 'infamous', name: 'Tai Tiếng Đồn Xa', description: 'Tiếng xấu đồn xa, tu sĩ Chính Đạo luôn đề phòng, nhưng lại như cá gặp nước trong Ma Đạo.', type: 'neutral', duration: 999 },
    hated: { id: 'hated', name: 'Bị Ghét Bỏ', description: 'Vì một lý do nào đó, ngươi bị nhiều người căm ghét, gặp nhiều trắc trở khi giao tiếp.', type: 'debuff', duration: 999 },
    blood_curse: { id: 'blood_curse', name: 'Huyết Chú', description: 'Dính phải lời nguyền máu độc ác, sinh mệnh lực bị bào mòn không ngừng, tuổi thọ từ từ suy giảm.', type: 'debuff', duration: 100, effects: { primaryStatChangePercent: { maxHp: -15 } } },
    golden_light: { id: 'golden_light', name: 'Hộ Thể Kim Quang', description: 'Một luồng kim quang bí ẩn bảo vệ cơ thể, vững chắc như kim cang.', type: 'buff', duration: 3, effects: { attributeChangePercent: { defense: 20 } } },
    
    // New Buffs for consumables
    physical_strength_buff: { id: 'physical_strength_buff', name: 'Sức Mạnh Bộc Phát', description: 'Cơ bắp cuồn cuộn, sức mạnh vật lý tạm thời tăng lên.', type: 'buff', duration: 3, effects: { attributeChangePercent: { physicalStrength: 10 } } },
    magic_power_buff: { id: 'magic_power_buff', name: 'Linh Lực Bùng Nổ', description: 'Linh lực trong kinh mạch dâng trào, sức mạnh phép thuật tạm thời tăng lên.', type: 'buff', duration: 3, effects: { attributeChangePercent: { magicPower: 10 } } },
    poison_resistance: { id: 'poison_resistance', name: 'Kháng Độc', description: 'Cơ thể có khả năng chống lại độc tố trong một thời gian ngắn.', type: 'buff', duration: 5 },
    berserk: { id: 'berserk', name: 'Cuồng Bạo', description: 'Mất đi lý trí, sức mạnh tăng vọt nhưng không thể phòng thủ.', type: 'buff', duration: 3, effects: { attributeChangePercent: { physicalStrength: 25, magicPower: 25, defense: -20 }, primaryStatChangePercent: { maxMentalState: -20 } } },
    invisibility: { id: 'invisibility', name: 'Ẩn Thân', description: 'Thân hình biến mất, ẩn giấu khí tức.', type: 'buff', duration: 3 },
    soul_protection: { id: 'soul_protection', name: 'Thần Hồn Hộ Thể', description: 'Thần hồn được bảo vệ, chống lại các đòn tấn công tinh thần.', type: 'buff', duration: 5, effects: { attributeChangePercent: { spiritualSense: 15 } } },
    ngu_hanh_buff: { id: 'ngu_hanh_buff', name: 'Ngũ Hành Tương Hợp', description: 'Tạm thời tăng cường sức mạnh của các pháp thuật ngũ hành.', type: 'buff', duration: 3, effects: { attributeChangePercent: { magicPower: 10 } } },
};


// ==================================
// ITEM EFFECT DEFINITIONS
// ==================================

const CONSUMABLE_EFFECTS: Record<string, ItemEffectDefinition> = {
    'man_te_tan': { id: 'man_te_tan', name: 'Man Tê Tán', description: 'Tăng mạnh sức mạnh vật lý trong một khoảng thời gian ngắn.', category: 'consumable', rank: 2, useEffects: { statusEffect: { id: 'physical_strength_buff', duration: 3 } } },
    'hon_linh_tan': { id: 'hon_linh_tan', name: 'Hồn Linh Tán', description: 'Tăng mạnh sức mạnh phép thuật trong một khoảng thời gian ngắn.', category: 'consumable', rank: 2, useEffects: { statusEffect: { id: 'magic_power_buff', duration: 3 } } },
    'bach_thao_dan': { id: 'bach_thao_dan', name: 'Bách Thảo Đan', description: 'Loại bỏ các hiệu ứng trúng độc và tăng khả năng kháng độc trong một thời gian ngắn. Hiệu quả: Giải trừ trạng thái \'Trúng Độc\'.', category: 'consumable', rank: 3, useEffects: { statusEffect: { id: 'poison_resistance', duration: 10 } } },
    'cuong_bao_dan': { id: 'cuong_bao_dan', name: 'Cuồng Bạo Đan', description: 'Tăng mạnh các chỉ số tấn công nhưng giảm mạnh phòng thủ và không thể điều khiển được.', category: 'consumable', rank: 4, useEffects: { statusEffect: { id: 'berserk', duration: 2 } } },
    'ngo_dao_dan': { id: 'ngo_dao_dan', name: 'Ngộ Đạo Đan', description: 'Tăng mạnh ngộ tính, giúp tăng tốc độ tu luyện hoặc lĩnh ngộ công pháp trong một thời gian.', category: 'consumable', rank: 5, useEffects: { statusEffect: { id: 'elated', duration: 10 } } },
    'an_tuc_phu': { id: 'an_tuc_phu', name: 'Ẩn Tức Phù', description: 'Trở nên vô hình trong một khoảng thời gian, giúp lẩn trốn hoặc ám sát.', category: 'consumable', rank: 3, useEffects: { statusEffect: { id: 'invisibility', duration: 3 } } },
    'tay_tuy_dan': { id: 'tay_tuy_dan', name: 'Tẩy Tủy Đan', description: 'Gột rửa tạp chất trong cơ thể, có tỉ lệ nhỏ vĩnh viễn cải thiện căn cốt.', category: 'consumable', rank: 6, useEffects: { expChange: 500 } },
    'cuu_chuyen_hoi_hon_dan': { id: 'cuu_chuyen_hoi_hon_dan', name: 'Cửu Chuyển Hồi Hồn Đan', description: 'Ngay lập tức hồi phục một lượng lớn sinh lực và linh lực.', category: 'consumable', rank: 4, useEffects: { hpChange: 250, spiritPowerChange: 100 } },
    'thanh_tam_dan': { id: 'thanh_tam_dan', name: 'Thanh Tâm Đan', description: 'Tăng cường thần thức, giúp chống lại các ảo ảnh và đòn tấn công tinh thần.', category: 'consumable', rank: 3, useEffects: { statusEffect: { id: 'soul_protection', duration: 5 }, mentalStateChange: 50 } },
    'bao_linh_dan': { id: 'bao_linh_dan', name: 'Bạo Linh Đan', description: 'Hi sinh một phần sinh lực để bộc phát một lượng lớn linh lực trong chốc lát.', category: 'consumable', rank: 4, useEffects: { hpChange: -100, spiritPowerChange: 200 } },
    'ngu_hanh_tan': { id: 'ngu_hanh_tan', name: 'Ngũ Hành Tán', description: 'Tạm thời tăng cường sự tương thích với linh khí ngũ hành, tăng hiệu quả của các phép thuật tương ứng.', category: 'consumable', rank: 2, useEffects: { statusEffect: { id: 'ngu_hanh_buff', duration: 5 } } },
    'pha_canh_dan': { id: 'pha_canh_dan', name: 'Phá Cảnh Đan', description: 'Hỗ trợ quá trình đột phá cảnh giới, tăng tỉ lệ thành công và giảm thiểu rủi ro tẩu hỏa nhập ma.', category: 'consumable', rank: 5, useEffects: { expChange: 300 } },
};

const EQUIPMENT_EFFECTS: Record<string, ItemEffectDefinition> = {
    // Vũ khí
    'hap_huyet': { id: 'hap_huyet', name: 'Hấp Huyết', description: 'Chuyển một phần sát thương gây ra thành sinh lực cho người sử dụng.', category: 'equipment', rank: 4, allowedEquipmentTypes: ['Vũ khí'] },
    'pha_giap': { id: 'pha_giap', name: 'Phá Giáp', description: 'Đòn tấn công có khả năng bỏ qua một phần phòng ngự của đối thủ.', category: 'equipment', rank: 3, allowedEquipmentTypes: ['Vũ khí'] },
    'chan_hon': { id: 'chan_hon', name: 'Chấn Hồn', description: 'Đòn tấn công có tỉ lệ nhỏ làm choáng mục tiêu trong giây lát.', category: 'equipment', rank: 3, allowedEquipmentTypes: ['Vũ khí'] },
    'tat_anh': { id: 'tat_anh', name: 'Tật Ảnh', description: 'Tăng cơ hội gây ra sát thương chí mạng.', category: 'equipment', rank: 2, allowedEquipmentTypes: ['Vũ khí', 'Găng tay', 'Phụ kiện'], passiveEffects: { attributeChange: { critChance: 5 } } },
    'dan_loi': { id: 'dan_loi', name: 'Dẫn Lôi', description: 'Đòn tấn công có tỉ lệ tạo ra một tia sét lan sang các kẻ địch gần đó.', category: 'equipment', rank: 5, allowedEquipmentTypes: ['Vũ khí'] },

    // Giáp & Áo choàng
    'phan_thuong': { id: 'phan_thuong', name: 'Phản Thương', description: 'Phản lại một phần sát thương vật lý cho kẻ tấn công.', category: 'equipment', rank: 3, allowedEquipmentTypes: ['Giáp', 'Áo choàng'] },
    'nguyen_to_khang': { id: 'nguyen_to_khang', name: 'Nguyên Tố Kháng', description: 'Giảm sát thương phải chịu từ các đòn tấn công thuộc tính nguyên tố (Băng, Hỏa, Lôi...).', category: 'equipment', rank: 2, allowedEquipmentTypes: ['Giáp', 'Áo choàng', 'Trang sức'], passiveEffects: { attributeChange: { defense: 10 } } },
    'sinh_sinh_bat_tuc': { id: 'sinh_sinh_bat_tuc', name: 'Sinh Sinh Bất Tức', description: 'Từ từ hồi phục sinh lực theo thời gian.', category: 'equipment', rank: 4, allowedEquipmentTypes: ['Giáp', 'Phụ kiện'], passiveEffects: { primaryStatChange: { maxHp: 50 } } },
    'bat_hoai': { id: 'bat_hoai', name: 'Bất Hoại', description: 'Giảm một lượng sát thương cố định từ mọi đòn tấn công.', category: 'equipment', rank: 5, allowedEquipmentTypes: ['Giáp'], passiveEffects: { attributeChange: { defense: 30 } } },
    'luc_bat_son_ha': { id: 'luc_bat_son_ha', name: 'Lực Bạt Sơn Hà', description: 'Khi sinh lực xuống dưới một ngưỡng nhất định, phòng thủ sẽ được tăng cường đáng kể.', category: 'equipment', rank: 4, allowedEquipmentTypes: ['Giáp'], passiveEffects: { attributeChange: { defense: 15, bodyStrength: 10 } } },

    // Phụ kiện, Mũ, Giày, Găng tay
    'than_minh': { id: 'than_minh', name: 'Thần Minh', description: 'Mở rộng phạm vi thần thức, giúp dễ dàng phát hiện nguy hiểm và tìm kiếm vật phẩm.', category: 'equipment', rank: 2, allowedEquipmentTypes: ['Mũ', 'Phụ kiện', 'Trang sức'], passiveEffects: { attributeChange: { spiritualSense: 15 } } },
    'van_phap_bat_xam': { id: 'van_phap_bat_xam', name: 'Vạn Pháp Bất Xâm', description: 'Giảm thời gian hoặc hiệu quả của các hiệu ứng bất lợi như trúng độc, làm chậm.', category: 'equipment', rank: 3, allowedEquipmentTypes: ['Mũ', 'Phụ kiện', 'Trang sức'], passiveEffects: { primaryStatChange: { maxMentalState: 30 } } },
    'than_hanh': { id: 'than_hanh', name: 'Thần Hành', description: 'Tăng tốc độ di chuyển và né tránh.', category: 'equipment', rank: 2, allowedEquipmentTypes: ['Giày'], passiveEffects: { attributeChange: { agility: 15 } } },
    'khi_dinh': { id: 'khi_dinh', name: 'Khí Định', description: 'Giảm tiêu hao thể lực khi thi triển kỹ năng hoặc di chuyển.', category: 'equipment', rank: 1, allowedEquipmentTypes: ['Giày', 'Phụ kiện'], passiveEffects: { primaryStatChange: { maxStamina: 40 } } },
    'cuong_phong': { id: 'cuong_phong', name: 'Cuồng Phong', description: 'Rút ngắn thời gian giữa các đòn tấn công.', category: 'equipment', rank: 3, allowedEquipmentTypes: ['Găng tay'], passiveEffects: { attributeChange: { agility: 10 } } },
};

const TREASURE_EFFECTS: Record<string, ItemEffectDefinition> = {
    'trieu_linh': { id: 'trieu_linh', name: 'Triệu Linh', description: 'Triệu hồi một sinh vật hoặc tinh linh để hỗ trợ chiến đấu trong một khoảng thời gian.', category: 'treasure', rank: 4, passiveEffects: { attributeChange: { magicPower: 15 } } },
    'huyen_anh': { id: 'huyen_anh', name: 'Huyễn Ảnh', description: 'Tạo ra các ảo ảnh giống hệt bản thể để đánh lừa và gây rối loạn kẻ địch.', category: 'treasure', rank: 3, passiveEffects: { attributeChange: { spiritualSense: 10, agility: 10 } } },
    'tran_hon': { id: 'tran_hon', name: 'Trấn Hồn', description: 'Phát ra uy áp mạnh mẽ, làm suy yếu và trấn áp các sinh vật hệ linh hồn, yêu ma.', category: 'treasure', rank: 5, passiveEffects: { attributeChange: { spiritualSense: 25 } } },
    'di_hinh_hoan_anh': { id: 'di_hinh_hoan_anh', name: 'Di Hình Hoán Ảnh', description: 'Có khả năng tạo ra các vết nứt không gian nhỏ để dịch chuyển tức thời hoặc bóp méo không gian.', category: 'treasure', rank: 6, passiveEffects: { attributeChange: { agility: 30 } } },
    'dien_thien_co': { id: 'dien_thien_co', name: 'Diễn Thiên Cơ', description: 'Cho phép nhìn thấy một vài manh mối mơ hồ về tương lai hoặc những sự kiện sắp xảy ra.', category: 'treasure', rank: 5, passiveEffects: { attributeChange: { spiritualSense: 20, aptitude: 10 } } },
    'ngu_linh': { id: 'ngu_linh', name: 'Ngự Linh', description: 'Khuếch đại khả năng điều khiển một loại nguyên tố cụ thể (Băng, Hỏa, Lôi...), tăng mạnh uy lực của các phép thuật tương ứng.', category: 'treasure', rank: 4, passiveEffects: { attributeChange: { magicPower: 25 } } },
    'linh_vuc': { id: 'linh_vuc', name: 'Lĩnh Vực', description: 'Tạo ra một khu vực đặc biệt xung quanh người sử dụng, áp đặt các quy tắc có lợi cho bản thân và bất lợi cho kẻ địch.', category: 'treasure', rank: 6, passiveEffects: { attributeChange: { magicPower: 25, spiritualSense: 25 } } },
    'thon_phe': { id: 'thon_phe', name: 'Thôn Phệ', description: 'Có tỉ lệ vô hiệu hóa và hấp thụ năng lượng từ pháp bảo cấp thấp của đối phương.', category: 'treasure', rank: 5, passiveEffects: { attributeChange: { magicPower: 20 } } },
    'mo_phong': { id: 'mo_phong', name: 'Mô Phỏng', description: 'Sao chép một kỹ năng hoặc phép thuật cấp thấp mà đối phương vừa sử dụng.', category: 'treasure', rank: 4, passiveEffects: { attributeChange: { aptitude: 20 } } },
    'phe_hon': { id: 'phe_hon', name: 'Phệ Hồn', description: 'Khi đánh bại kẻ địch, có thể hút lấy một phần linh hồn của chúng để vĩnh viễn tăng cường một chỉ số ngẫu nhiên.', category: 'treasure', rank: 6, passiveEffects: { attributeChange: { critChance: 10 } } },
    'thoi_gian_truong': { id: 'thoi_gian_truong', name: 'Thời Gian Trường', description: 'Tạo ra một khu vực nhỏ nơi thời gian trôi nhanh hơn, giúp đẩy nhanh tốc độ tu luyện hoặc nghiên cứu.', category: 'treasure', rank: 5, expPerTurn: 5, passiveEffects: { attributeChange: { aptitude: 25 } } },
    'niet_ban': { id: 'niet_ban', name: 'Niết Bàn', description: 'Khi nhận sát thương chí mạng, tự động kích hoạt để hồi sinh người sử dụng tại chỗ với một lượng sinh lực nhỏ. Chỉ có thể dùng một lần.', category: 'treasure', rank: 6, passiveEffects: { primaryStatChange: { maxHp: 100 } } },
};

const TECHNIQUE_EFFECTS: Record<string, ItemEffectDefinition> = {
    // Chiến đấu
    'hap_tinh_dai_phap': { id: 'hap_tinh_dai_phap', name: 'Hấp Tinh Đại Pháp', description: 'Đòn tấn công có khả năng hút một phần linh lực của đối phương.', category: 'technique', rank: 4, allowedTechniqueTypes: ['Chiến đấu', 'Tâm pháp'], passiveEffects: { attributeChange: { magicPower: 15 } } },
    'huyet_te': { id: 'huyet_te', name: 'Huyết Tế', description: 'Hi sinh một phần sinh lực để đổi lấy một đòn tấn công với sức mạnh kinh người.', category: 'technique', rank: 5, allowedTechniqueTypes: ['Chiến đấu'], passiveEffects: { attributeChange: { physicalStrength: 30, magicPower: 30 }, primaryStatChange: { maxHp: -50 } } },
    'kiem_khi_ho_the': { id: 'kiem_khi_ho_the', name: 'Kiếm Khí Hộ Thể', description: 'Kiếm khí vô hình bao bọc cơ thể, tự động phản công khi bị tấn công cận chiến.', category: 'technique', rank: 3, allowedTechniqueTypes: ['Chiến đấu', 'Phòng thủ'], passiveEffects: { attributeChange: { defense: 15 } } },

    // Phòng thủ
    'kim_than_bat_hoai': { id: 'kim_than_bat_hoai', name: 'Kim Thân Bất Hoại', description: 'Tăng mạnh sức mạnh nhục thân và phòng thủ, giảm thiểu sát thương vật lý phải chịu.', category: 'technique', rank: 4, allowedTechniqueTypes: ['Phòng thủ', 'Tu luyện'], passiveEffects: { attributeChange: { bodyStrength: 25, defense: 25 } } },
    'nguyen_to_giap': { id: 'nguyen_to_giap', name: 'Nguyên Tố Giáp', description: 'Tạo ra một lớp giáp bằng nguyên tố, hấp thụ sát thương phép thuật.', category: 'technique', rank: 3, allowedTechniqueTypes: ['Phòng thủ'], passiveEffects: { attributeChange: { magicPower: 15, defense: 20 } } },
    'huyen_than': { id: 'huyen_than', name: 'Huyễn Thân', description: 'Khi bị tấn công, có một tỉ lệ nhỏ biến thành hư ảo để né tránh hoàn toàn đòn đánh đó.', category: 'technique', rank: 5, allowedTechniqueTypes: ['Phòng thủ', 'Thân pháp'], passiveEffects: { attributeChange: { agility: 25 } } },

    // Tu luyện
    'tu_linh': { id: 'tu_linh', name: 'Tụ Linh', description: 'Tăng tốc độ hấp thụ linh khí trời đất, đẩy nhanh hiệu quả của việc thiền định và tu luyện.', category: 'technique', rank: 2, allowedTechniqueTypes: ['Tu luyện', 'Tâm pháp'], expPerTurn: 2, passiveEffects: { attributeChange: { aptitude: 5 } } },
    'luyen_the': { id: 'luyen_the', name: 'Luyện Thể', description: 'Sau mỗi lần chịu sát thương, sức mạnh nhục thân và giới hạn sinh lực sẽ tăng nhẹ một cách vĩnh viễn.', category: 'technique', rank: 4, allowedTechniqueTypes: ['Tu luyện'], passiveEffects: { attributeChange: { bodyStrength: 20 }, primaryStatChange: { maxHp: 40 } } },
    'ngo_dao_cong_phap': { id: 'ngo_dao_cong_phap', name: 'Ngộ Đạo', description: 'Tăng tốc độ lĩnh ngộ và học các công pháp mới.', category: 'technique', rank: 3, allowedTechniqueTypes: ['Tu luyện'], expPerTurn: 1, passiveEffects: { attributeChange: { aptitude: 20 } } },

    // Tâm pháp
    'thanh_tam_quyet': { id: 'thanh_tam_quyet', name: 'Thanh Tâm Quyết', description: 'Giúp giữ vững tâm thần, giảm ảnh hưởng từ tâm ma và các đòn tấn công tinh thần.', category: 'technique', rank: 2, allowedTechniqueTypes: ['Tâm pháp', 'Phòng thủ'], passiveEffects: { primaryStatChange: { maxMentalState: 50 } } },
    'sat_luc_chi_tam': { id: 'sat_luc_chi_tam', name: 'Sát Lục Chi Tâm', description: 'Tỏa ra sát khí mạnh mẽ, làm suy yếu ý chí và các chỉ số của kẻ địch yếu hơn.', category: 'technique', rank: 4, allowedTechniqueTypes: ['Tâm pháp', 'Chiến đấu'], passiveEffects: { attributeChange: { physicalStrength: 15, magicPower: 15, critChance: 5 } } },
    'nhiep_hon_thuat': { id: 'nhiep_hon_thuat', name: 'Nhiếp Hồn Thuật', description: 'Có khả năng tấn công trực tiếp vào linh hồn của đối phương, bỏ qua phòng ngự vật lý.', category: 'technique', rank: 5, allowedTechniqueTypes: ['Tâm pháp'], passiveEffects: { attributeChange: { spiritualSense: 30 } } },

    // Thân pháp
    'suc_dia_thanh_thon': { id: 'suc_dia_thanh_thon', name: 'Súc Địa Thành Thốn', description: 'Rút ngắn khoảng cách, cho phép di chuyển một quãng đường dài chỉ trong chớp mắt.', category: 'technique', rank: 5, allowedTechniqueTypes: ['Thân pháp'], passiveEffects: { attributeChange: { agility: 30 } } },
    'tan_anh': { id: 'tan_anh', name: 'Tàn Ảnh', description: 'Tạo ra các tàn ảnh khi di chuyển, gây khó khăn cho đối phương trong việc xác định vị trí thật.', category: 'technique', rank: 3, allowedTechniqueTypes: ['Thân pháp'], passiveEffects: { attributeChange: { agility: 20 } } },
    'ngu_phong_quyet': { id: 'ngu_phong_quyet', name: 'Ngự Phong Quyết', description: 'Điều khiển gió để bay lượn hoặc tăng tốc độ di chuyển.', category: 'technique', rank: 2, allowedTechniqueTypes: ['Thân pháp'], passiveEffects: { attributeChange: { agility: 15 } } },
};


export const ALL_ITEM_EFFECT_DEFINITIONS = {
    ...CONSUMABLE_EFFECTS,
    ...EQUIPMENT_EFFECTS,
    ...TREASURE_EFFECTS,
    ...TECHNIQUE_EFFECTS,
};

// ==================================
// DESTINY DEFINITIONS (TIÊN THIÊN KHÍ VẬN)
// ==================================
export const DESTINY_DEFINITIONS: Record<string, DestinyDefinition> = {
    // Rank 1 (White) - 10 cost
    'than_the_khoe_manh': { id: 'than_the_khoe_manh', name: 'Thân Thể Khỏe Mạnh', description: 'Bẩm sinh khỏe mạnh hơn người thường, căn cơ vững chắc.', rank: 1, cost: 10, effects: { primaryStatChange: { maxHp: 20 }, attributeChange: { bodyStrength: 2 } } },
    'tinh_than_minh_man': { id: 'tinh_than_minh_man', name: 'Tinh Thần Minh Mẫn', description: 'Trời sinh đầu óc lanh lợi, thần hồn sáng suốt.', rank: 1, cost: 10, effects: { primaryStatChange: { maxMentalState: 20 }, attributeChange: { spiritualSense: 2 } } },
    'khi_luc_doi_dao': { id: 'khi_luc_doi_dao', name: 'Khí Lực Dồi Dào', description: 'Thể lực bẩm sinh tốt, ít khi mệt mỏi.', rank: 1, cost: 10, effects: { primaryStatChange: { maxStamina: 20 }, attributeChange: { agility: 2 } } },
    'gia_canh_kha_gia': { id: 'gia_canh_kha_gia', name: 'Gia Cảnh Khá Giả', description: 'Xuất thân từ gia đình giàu có, bắt đầu với một ít tài sản.', rank: 1, cost: 10 },
    'ke_ngoc': { id: 'ke_ngoc', name: 'Kẻ Ngốc', description: 'Tư chất tu luyện kém nhưng bù lại thân thể lại cực kỳ tráng kiện.', rank: 1, cost: 10, effects: { attributeChange: { aptitude: -5, bodyStrength: 10 } } },

    // Rank 2 (Green) - 20 cost
    'sat_phat_qua_duyet': { id: 'sat_phat_qua_duyet', name: 'Sát Phạt Quả Quyết', description: 'Thiên phú chiến đấu, ra tay tàn nhẫn, có duyên với sát đạo.', rank: 2, cost: 20, effects: { attributeChange: { physicalStrength: 5, critChance: 2 } } },
    'linh_khi_than_hoa': { id: 'linh_khi_than_hoa', name: 'Linh Khí Thân Hòa', description: 'Thân thể dễ dàng tương thích và hấp thụ linh khí, có lợi cho việc tu luyện pháp thuật.', rank: 2, cost: 20, effects: { primaryStatChange: { maxSpiritPower: 25 }, attributeChange: { magicPower: 5 } } },
    'thien_co_thong_minh': { id: 'thien_co_thong_minh', name: 'Thiên Tư Thông Minh', description: 'Tư chất hơn người, học một biết mười, việc tu luyện dễ dàng hơn.', rank: 2, cost: 20, expPerTurn: 1, effects: { attributeChange: { aptitude: 8 } } },
    'da_day_hon_sat': { id: 'da_day_hon_sat', name: 'Da Dày Hơn Sắt', description: 'Thân thể cứng cáp, khả năng chống chịu đòn tốt hơn người thường.', rank: 2, cost: 20, effects: { attributeChange: { defense: 8 } } },
    'benh_tat_quan_than': { id: 'benh_tat_quan_than', name: 'Bệnh Tật Quấn Thân', description: 'Thân thể yếu đuối bẩm sinh, nhưng thần hồn lại mạnh mẽ lạ thường.', rank: 2, cost: 20, effects: { primaryStatChange: { maxHp: -20 }, attributeChange: { spiritualSense: 10, magicPower: 5 } } },

    // Rank 3 (Blue) - 30 cost
    'thien_ly_nhan': { id: 'thien_ly_nhan', name: 'Thiên Lý Nhãn', description: 'Tầm nhìn xa, thần thức mạnh mẽ bẩm sinh, giúp dễ dàng quan sát và nhận biết.', rank: 3, cost: 30, effects: { attributeChange: { spiritualSense: 15 } } },
    'phong_hanh_giả': { id: 'phong_hanh_giả', name: 'Phong Hành Giả', description: 'Thân nhẹ như yến, tốc độ hơn người.', rank: 3, cost: 30, effects: { attributeChange: { agility: 15 } } },
    'dai_khi_van': { id: 'dai_khi_van', name: 'Đại Khí Vận', description: 'Khí vận hơn người, thường gặp may mắn, dễ có những đòn đánh bất ngờ.', rank: 3, cost: 30, effects: { attributeChange: { critChance: 5 } } },
    'van_du_thien_ha': { id: 'van_du_thien_ha', name: 'Vân Du Thiên Hạ', description: 'Thích ngao du sơn thủy, nhờ đó thân pháp và thần thức đều được rèn luyện.', rank: 3, cost: 30, effects: { attributeChange: { agility: 10, spiritualSense: 10 } } },

    // Rank 4 (Purple) - 40 cost
    'dai_tri_nhuoc_ngu': { id: 'dai_tri_nhuoc_ngu', name: 'Đại Trí Nhược Ngu', description: 'Bề ngoài khờ khạo, nhưng có ngộ tính kinh người, căn cốt vượt trội.', rank: 4, cost: 40, expPerTurn: 2, effects: { attributeChange: { aptitude: 20 } } },
    'cuong_vong_tu_dai': { id: 'cuong_vong_tu_dai', name: 'Cuồng Vọng Tự Đại', description: 'Tính cách kiêu ngạo, chỉ tin vào sức mạnh tuyệt đối, tấn công là cách phòng thủ tốt nhất.', rank: 4, cost: 40, effects: { attributeChange: { physicalStrength: 20, critDamage: 20, defense: -10 } } },
    'dao_ma_chuyen_the': { id: 'dao_ma_chuyen_the', name: 'Đạo Ma Chuyển Thế', description: 'Cùng lúc sở hữu tiềm năng của cả Đạo và Ma, sức mạnh toàn diện.', rank: 4, cost: 40, effects: { attributeChange: { physicalStrength: 10, magicPower: 10, bodyStrength: 10 } } },

    // Rank 5 (Orange) - 50 cost
    'tho_moc_dao_thai': { id: 'tho_moc_dao_thai', name: 'Thổ Mộc Đạo Thai', description: 'Đạo thai của đất trời, thân thể cường hãn, sinh lực và phòng thủ vượt trội.', rank: 5, cost: 50, effects: { primaryStatChange: { maxHp: 50 }, attributeChange: { bodyStrength: 15, defense: 15 } } },
    'phuong_hoang_linh_the': { id: 'phuong_hoang_linh_the', name: 'Phượng Hoàng Linh Thể', description: 'Mang trong mình huyết mạch Phượng Hoàng, tuổi thọ cao hơn người thường, có thiên phú về pháp thuật và tốc độ.', rank: 5, cost: 50, effects: { primaryStatChange: { lifespan: 50 }, attributeChange: { magicPower: 20, agility: 10 } } },

    // Rank 6 (Red) - 60 cost
    'thien_menh_chi_tu': { id: 'thien_menh_chi_tu', name: 'Thiên Mệnh Chi Tử', description: 'Kẻ được thiên mệnh ưu ái, tư chất toàn diện, con đường tu luyện thuận buồm xuôi gió.', rank: 6, cost: 60, expPerTurn: 3, effects: { attributeChange: { physicalStrength: 15, magicPower: 15, bodyStrength: 15, defense: 10, agility: 10, spiritualSense: 15, aptitude: 15 } } },
};