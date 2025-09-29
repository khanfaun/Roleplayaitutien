import type { GameState } from '../types';
import { INITIAL_PLAYER_STATS, INITIAL_DONG_PHU_STATE, INITIAL_AI_RULES, INITIAL_THIEN_DAO_RULES, INITIAL_CORE_MEMORY_RULES } from '../constants';

export const DEMO_GAME_STATE: GameState = {
  "player": {
    "name": "Lâm Hồn",
    "level": 2,
    "exp": 18,
    "maxExp": 110,
    "hp": 180,
    "maxHp": 180,
    "spiritPower": 78,
    "maxSpiritPower": 78,
    "stamina": 75,
    "maxStamina": 106,
    "mentalState": 102,
    "maxMentalState": 103,
    "day": 1,
    "month": 1,
    "year": 1,
    "age": 16,
    "lifespan": 100,
    "cultivationStage": "Ngưng Khí Tầng 1",
    "cultivationQuality": null,
    "cultivationStageId": "tn_realm_1_minor_1",
    "cultivationQualityId": null,
    "position": 0,
    "currentLocationId": "tn_khu_vuc_hang_nhac",
    "linhCan": "Địa Linh Căn linh căn",
    "nguHanh": "Moc (60%), Thuy (20%), Tho (20%)",
    "sect": null,
    "sectRank": null,
    "reputation": {},
    "sectContribution": 0,
    "equippedTechniqueId": null,
    "equippedTreasureId": null,
    "attributes": {
      "physicalStrength": 11,
      "magicPower": 18,
      "bodyStrength": 26,
      "defense": 21,
      "agility": 5,
      "spiritualSense": 5,
      "aptitude": 5,
      "critChance": 10,
      "critDamage": 153
    },
    "difficulty": "Khó",
    "selectedDestinyIds": [
      "tho_moc_dao_thai",
      "linh_khi_than_hoa",
      "dai_khi_van"
    ],
    "heThongStatus": "active",
    "heThongPoints": 0,
    "statusEffects": [
        {
          "id": "vigorous",
          "name": "Sung Mãn",
          "description": "Khí huyết dồi dào, sinh cơ cuồn cuộn, giúp thể lực và sinh lực liên tục hồi phục.",
          "type": "buff",
          "duration": 5,
          "effects": {
            "primaryStatChangePercent": { "maxHp": 10, "maxStamina": 10 }
          }
        },
        {
          "id": "soul_damage",
          "name": "Linh Hồn Tổn Thương",
          "description": "Thần hồn bất ổn, linh lực khó tụ, thần thức suy yếu.",
          "type": "debuff",
          "duration": 3,
          "effects": {
            "attributeChangePercent": { "spiritualSense": -10 },
            "primaryStatChangePercent": { "maxSpiritPower": -10 }
          }
        }
      ]
  },
  "inventory": [
    {
      "id": "to_moc_chi_chung_0",
      "name": "Tổ Mộc Chi Chủng",
      "description": "Một hạt giống màu xanh biếc, ẩn chứa sinh cơ vô tận và một bí mật động trời. Là hy vọng cuối cùng của Thanh Mộc Tông.",
      "category": "Nhiệm vụ"
    },
    {
      "id": "bach_thao_lo_0",
      "name": "Bách Thảo Lộ",
      "description": "Sương sớm được ngưng tụ từ hàng trăm loại linh thảo, giúp nhanh chóng hồi phục thể lực và một ít linh lực.",
      "category": "Vật phẩm"
    },
    {
      "id": "bach_thao_lo_1",
      "name": "Bách Thảo Lộ",
      "description": "Sương sớm được ngưng tụ từ hàng trăm loại linh thảo, giúp nhanh chóng hồi phục thể lực và một ít linh lực.",
      "category": "Vật phẩm"
    },
    {
      "id": "bach_thao_lo_2",
      "name": "Bách Thảo Lộ",
      "description": "Sương sớm được ngưng tụ từ hàng trăm loại linh thảo, giúp nhanh chóng hồi phục thể lực và một ít linh lực.",
      "category": "Vật phẩm"
    },
    {
      "id": "thanh_moc_trac_0",
      "name": "Thanh Mộc Trạc",
      "description": "Vòng tay được làm từ cành của một cây cổ thụ ngàn năm, tỏa ra sinh khí ấm áp, giúp người đeo luôn cảm thấy an bình và sinh lực dồi dào.",
      "category": "Trang bị",
      "attributes": {
        "defense": 2,
        "aptitude": 3
      },
      "effectIds": [
        "sinh_sinh_bat_tuc"
      ],
      "equipmentType": "Phụ kiện"
    },
    {
      "id": "van_moc_gioi_0",
      "name": "Vạn Mộc Giới",
      "description": "Chiếc nhẫn ẩn chứa sức mạnh của đạo thai 'Vạn Mộc Đồng Sinh', khuếch đại khả năng điều khiển Mộc linh khí của chủ nhân.",
      "category": "Pháp bảo",
      "attributes": {
        "magicPower": 5,
        "spiritualSense": 5
      },
      "effectIds": [
        "ngu_linh"
      ],
      "equipmentType": "Trang sức"
    },
    {
      "id": "dan_moc_quyet_0",
      "name": "Dẫn Mộc Quyết",
      "description": "Công pháp nhập môn của Thanh Mộc Tông, giúp tu sĩ cảm nhận và dẫn dắt linh khí Mộc hệ.",
      "category": "Công pháp",
      "attributes": {
        "aptitude": 5,
        "magicPower": 2
      },
      "effectIds": [
        "tu_linh"
      ]
    },
    {
      "id": "moc_giap_thuat_0",
      "name": "Mộc Giáp Thuật",
      "description": "Triệu hồi linh khí Mộc hệ để tạo ra một lớp giáp gỗ chắc chắn bao bọc cơ thể, tăng cường khả năng phòng ngự.",
      "category": "Công pháp",
      "attributes": {
        "defense": 10,
        "bodyStrength": 5
      },
      "effectIds": [
        "kim_than_bat_hoai"
      ]
    },
    {
      "id": "thien_diep_chi",
      "name": "Thiên Diệp Chi",
      "description": "Linh chi ngàn năm, mỗi phiến lá ẩn chứa linh khí tinh thuần, dùng trực tiếp có thể tăng mạnh tu vi.",
      "category": "Linh dược"
    }
  ],
  "quests": [
    {
      "title": "Cơ Duyên Thanh Mộc: Bước Đầu Nhập Môn",
      "description": "Lâm Hồn đã được Mộc Trần Chân Nhân cứu thoát và đưa về Thanh Mộc Tông. Nhiệm vụ của ngươi là hoàn thành nghi thức nhập môn, chính thức trở thành đệ tử Thanh Mộc và bắt đầu con đường tu luyện 'Dẫn Mộc Quyết'.",
      "type": "Cốt truyện",
      "completionCondition": "Hoàn thành nghi thức nhập môn và được truyền thụ 'Dẫn Mộc Quyết' bởi Mộc Trần Chân Nhân.",
      "rewards": {
        "description": "Chính thức gia nhập Thanh Mộc Tông, nhận 'Dẫn Mộc Quyết' (công pháp sơ cấp), 5 Linh Thạch Hạ Phẩm, tăng kinh nghiệm và cống hiến môn phái.",
        "expChange": 150,
        "items": [],
        "reputationChange": [
          {
            "faction": "Thanh Mộc Tông",
            "change": 10
          }
        ],
        "sectContributionChange": 5
      },
      "id": "q_1758693784849",
      "status": "Hoàn thành"
    },
    {
      "id": "q_1800000000001",
      "title": "Di Sản Thanh Mộc",
      "description": "Tổ Mộc Chi Chủng trong tay ngươi rung động không ngừng, dường như có một mối liên kết vô hình với nơi sâu thẳm trong Hằng Nhạc Sơn Mạch. Có lẽ đây là lúc tìm hiểu bí mật mà Mộc Trần Chân Nhân đã giao phó.",
      "type": "Cốt truyện",
      "status": "Đang tiến hành",
      "completionCondition": "Tìm ra nguồn gốc của sự rung động của Tổ Mộc Chi Chủng.",
      "rewards": {
        "description": "Mở ra một chương mới trong vận mệnh, nhận được kỳ ngộ lớn.",
        "expChange": 500
      }
    },
    {
      "id": "q_1800000000002",
      "title": "Khí Tức Bất Thường",
      "description": "Linh khí xao động từ lần đột phá của ngươi đã thu hút sự chú ý của một số tu sĩ Hằng Nhạc Phái gần đó. Một vài ánh mắt không mấy thiện cảm đang hướng về phía ngươi.",
      "type": "Phụ",
      "status": "Đang tiến hành",
      "completionCondition": "Giải quyết sự chú ý của các tu sĩ Hằng Nhạc Phái.",
      "rewards": {
        "description": "Danh vọng tại Hằng Nhạc Phái thay đổi.",
        "expChange": 100,
        "reputationChange": [
          { "faction": "Hằng Nhạc Phái", "change": 5 }
        ]
      }
    }
  ],
  "board": [
    {
      "id": 0,
      "type": "Khởi đầu",
      "description": "Vòng lặp nhân sinh mới"
    },
    {
      "id": 1,
      "type": "Tai Ưng",
      "description": "Họa sát thân: Ma vật truy sát"
    },
    {
      "id": 2,
      "type": "Xui xẻo",
      "description": "Thân mang bệnh tật: Khí huyết hao tổn"
    },
    {
      "id": 3,
      "type": "Sự kiện",
      "description": "Gặp gỡ đạo hữu: Phân tranh lợi ích"
    },
    {
      "id": 4,
      "type": "Tâm Ma",
      "description": "Ảo cảnh trùng trùng: Ý chí dao động"
    },
    {
      "id": 5,
      "type": "Thử Luyện",
      "description": "Vượt ải tông môn: Khảo nghiệm căn cơ"
    },
    {
      "id": 6,
      "type": "Nhân Quả",
      "description": "Oan gia ngõ hẹp: Ân oán tiền kiếp"
    },
    {
      "id": 7,
      "type": "Hồng Trần",
      "description": "Mắc kẹt thế tục: Tình ái vấn vương"
    },
    {
      "id": 8,
      "type": "Ô Trống",
      "description": "Bình yên nhất thời: Không có gì xảy ra"
    },
    {
      "id": 9,
      "type": "May mắn",
      "description": "Linh vật dâng hiến: Ngẫu nhiên tăng ích"
    },
    {
      "id": 10,
      "type": "Kỳ Ngộ",
      "description": "Duyên đến khó cưỡng: Khai phá cơ hội"
    },
    {
      "id": 11,
      "type": "Cột mốc",
      "description": "Đột phá cảnh giới: Đạo cơ củng cố"
    },
    {
      "id": 12,
      "type": "Thiên Cơ",
      "description": "Thiên đạo gợi ý: Nhận được chỉ dẫn"
    },
    {
      "id": 13,
      "type": "Bế Quan",
      "description": "Tĩnh tu dưỡng khí: Nâng cao tu vi"
    },
    {
      "id": 14,
      "type": "Linh Mạch",
      "description": "Tìm thấy địa mạch: Hấp thu linh khí"
    },
    {
      "id": 15,
      "type": "Pháp Bảo",
      "description": "Thần binh xuất thế: Khế ước khí linh"
    },
    {
      "id": 16,
      "type": "Giao Dịch",
      "description": "Chợ đen mở cửa: Mua bán vật phẩm"
    },
    {
      "id": 17,
      "type": "Tai Ưng",
      "description": "Thiên kiếp giáng lâm: Cửu tử nhất sinh"
    },
    {
      "id": 18,
      "type": "Xui xẻo",
      "description": "Thất lạc bảo vật: Mất mát nặng nề"
    },
    {
      "id": 19,
      "type": "Sự kiện",
      "description": "Tranh chấp tài nguyên: Cường địch xuất hiện"
    },
    {
      "id": 20,
      "type": "Tâm Ma",
      "description": "Vấn vương chấp niệm: Đạo tâm lung lay"
    },
    {
      "id": 21,
      "type": "Thử Luyện",
      "description": "Đối đầu yêu thú: Sinh tử một đường"
    },
    {
      "id": 22,
      "type": "Nhân Quả",
      "description": "Gieo nhân gặt quả: Ân đền oán trả"
    },
    {
      "id": 23,
      "type": "Hồng Trần",
      "description": "Kết giao bằng hữu: Đời người thêm màu"
    },
    {
      "id": 24,
      "type": "Ô Trống",
      "description": "Thời gian trôi qua: Không có gì xảy ra"
    },
    {
      "id": 25,
      "type": "May mắn",
      "description": "Khám phá di tích: Bất ngờ có thu hoạch"
    },
    {
      "id": 26,
      "type": "Kỳ Ngộ",
      "description": "Gặp gỡ ẩn sĩ: Được truyền bí pháp"
    },
    {
      "id": 27,
      "type": "Tai Ưng",
      "description": "Bị vu oan giáng họa: Vướng vào thị phi"
    },
    {
      "id": 28,
      "type": "Xui xẻo",
      "description": "Tu luyện tẩu hỏa nhập ma: Khí tức hỗn loạn"
    },
    {
      "id": 29,
      "type": "Sự kiện",
      "description": "Tham gia đại hội: Mở rộng tầm nhìn"
    },
    {
      "id": 30,
      "type": "Tâm Ma",
      "description": "Sợ hãi xâm chiếm: Đạo tâm bị tổn thương"
    },
    {
      "id": 31,
      "type": "Thử Luyện",
      "description": "Vượt qua giới hạn: Cực hạn thử thách"
    },
    {
      "id": 32,
      "type": "Tai Ưng",
      "description": "Trúng độc trầm trọng: Sinh mệnh nguy cấp"
    },
    {
      "id": 33,
      "type": "Xui xẻo",
      "description": "Bị cướp bóc: Tài sản tiêu tán"
    },
    {
      "id": 34,
      "type": "Sự kiện",
      "description": "Giải cứu thế nhân: Gieo thiện duyên"
    },
    {
      "id": 35,
      "type": "Tai Ưng",
      "description": "Phản phệ bởi công pháp: Thân thể trọng thương"
    }
  ],
  "currentEvent": {
    "description": "Lâm Hồn đứng trước gốc cây cổ thụ và đóa Thiên Diệp Chi ngàn năm, cảm nhận một mối liên kết sâu sắc giữa nơi đây và Tổ Mộc Chi Chủng của mình. Đây dường như là một di tích cổ xưa của một thế lực Mộc tu đã biến mất, hoặc là một điểm hội tụ linh khí Mộc tự nhiên hiếm có. Hắn có thể thu hoạch Thiên Diệp Chi, thử kết nối với gốc cây, hoặc tìm kiếm thêm manh mối khác.",
    "options": [
      "Thu hoạch Thiên Diệp Chi (Nhận được dược liệu quý, có thể bỏ lỡ cơ hội lớn hơn)",
      "Thử dung hợp Tổ Mộc Chi Chủng với gốc cây cổ thụ (Cơ hội đột phá, rủi ro cực cao)",
      "Quan sát xung quanh tìm kiếm dấu vết khác (Tìm kiếm thêm manh mối, có thể tốn thời gian)",
      "Lập tức rời đi, tránh xa nơi hiểm địa này (An toàn nhưng bỏ lỡ cơ duyên)"
    ]
  },
  "gameLog": [
    {
      "type": "system",
      "content": "Chào mừng đến với Phi Thăng Bí Sử!"
    },
    {
      "type": "ai_story",
      "content": "Trong một ngôi làng hẻo lánh thuộc nước Triệu, tại biên giới phía Nam Vực, Lâm Hồn đã sống những ngày tháng bị xa lánh. Từ khi còn nhỏ, một khả năng kỳ lạ đã bám lấy hắn: nơi hắn đi qua, cây khô đâm chồi, hoa nở trái mùa, sinh khí bùng phát một cách phi tự nhiên. Dân làng, những phàm nhân mê tín, gán cho hắn cái danh 'yêu ma', xua đuổi hắn khỏi nơi chôn rau cắt rốn. Lâm Hồn lang thang, cuối cùng bị đẩy đến vùng rìa của Hằng Nhạc Sơn Mạch, nơi linh khí phong phú hơn, khiến năng lực 'Vạn Mộc Đồng Sinh' trong hắn càng bộc phát mạnh mẽ, thu hút sự chú ý. Giữa lúc hắn bị vây bởi sự sợ hãi và hiếu kỳ của một vài tu sĩ tản mạn muốn trục lợi từ điều dị thường, một bóng người thanh tao xuất hiện. Đó là Mộc Trần Chân Nhân, trưởng lão cuối cùng của Thanh Mộc Tông, một tiểu môn phái đã tàn lụi, chuyên tu Mộc hệ. Với đôi mắt tinh tường và đạo tâm thuần khiết, Mộc Trần không thấy yêu ma mà chỉ thấy một đạo thai sinh mệnh hiếm có. Ông đã ra tay cứu vớt Lâm Hồn, đưa hắn về Thanh Mộc Tông tại Thanh Mộc Cốc, một sơn cốc ẩn mình giữa vùng linh khí Mộc dồi dào. Tại đây, Lâm Hồn cuối cùng cũng tìm thấy một chốn dung thân, một sư phụ thấu hiểu, và một con đường để bước chân vào thế giới tu tiên tàn khốc, nhưng không phải để sát phạt, mà để chứng minh sức mạnh của sự sinh sôi."
    },
    {
      "type": "player_choice",
      "content": "Sử dụng 1 Bách Thảo Lộ"
    },
    {
      "type": "ai_story",
      "content": "Lâm Hồn cẩn thận lấy ra một chai Bách Thảo Lộ từ trong Vạn Mộc Giới, mở nắp và nhẹ nhàng uống cạn. Một dòng linh khí ôn hòa, mang theo hương thơm dịu mát của thảo mộc, chảy xuống đan điền, xua tan cảm giác trống rỗng. Từng sợi linh lực mỏng manh bắt đầu hình thành, mang lại cho Lâm Hồn một cảm giác dễ chịu và sảng khoái. Mộc Trần Chân Nhân mỉm cười hài lòng, gật đầu: \"Tốt, linh lực tuy còn yếu ớt nhưng đã có khởi sắc. Đừng quên đạo tu hành là bền bỉ và thuận theo tự nhiên.\""
    },
    {
      "type": "player_choice",
      "content": "Trang bị Dẫn Mộc Quyết"
    },
    {
      "type": "system",
      "content": "Nhiệm vụ [Cơ Duyên Thanh Mộc: Bước Đầu Nhập Môn] đã hoàn thành!"
    },
    {
      "type": "ai_story",
      "content": "Lâm Hồn tập trung tâm thần, thầm niệm pháp quyết 'Dẫn Mộc Quyết'. Một luồng sinh khí ấm áp từ Vạn Mộc Giới tuôn ra, hòa vào kinh mạch. Cảm giác quen thuộc như hơi thở của vạn vật bao trùm lấy hắn, khiến Lâm Hồn cảm thấy như mình đã thực sự dung hợp với thiên địa. Hắn cảm nhận được linh lực Mộc hệ trong cơ thể mình đã được điều hòa, sẵn sàng cho con đường tu luyện. Mộc Trần Chân Nhân khẽ gật đầu, ánh mắt ánh lên vẻ hài lòng. \"Tốt lắm, Lâm Hồn. Ngươi đã chính thức nhập môn, con đường tu tiên chân chính đã mở ra trước mắt ngươi.\""
    },
    {
      "type": "player_choice",
      "content": "Ngồi tĩnh tọa tu luyện Dẫn Mộc Quyết (Tu luyện cơ bản, tăng tiến chậm rãi)"
    },
    {
      "type": "ai_story",
      "content": "Lâm Hồn khoanh chân tĩnh tọa, nhắm mắt nhập định. Dẫn Mộc Quyết vận chuyển tự nhiên trong cơ thể, hòa cùng đạo thai Vạn Mộc Đồng Sinh. Từng luồng linh khí Mộc hệ từ môi trường xung quanh nhẹ nhàng thẩm thấu vào kinh mạch, nuôi dưỡng và củng cố căn cơ cho hắn. Tuy sự tăng tiến còn chậm rãi, nhưng Lâm Hồn cảm nhận rõ ràng linh lực trong đan điền đã dày đặc hơn một chút, tâm thần cũng trở nên thanh tịnh. Một cảm giác kết nối sâu sắc với vạn vật xung quanh trỗi dậy, như thể hắn là một phần không thể tách rời của núi rừng."
    },
    {
      "type": "system",
      "content": "Lâm Hồn bắt đầu quá trình đột phá!"
    },
    {
      "type": "tribulation",
      "content": "Một luồng linh khí thiên địa đột nhiên cuộn trào, mây đen từ hư không kéo đến bao phủ đỉnh đầu ngươi, tạo thành một lốc xoáy năng lượng khổng lồ. Áp lực vô hình đè nén khiến xương cốt ngươi như muốn vỡ vụn. Đây là Thiên Kiếp của Ngưng Khí Tầng 1, một thử thách tất yếu để bước vào cảnh giới mới. Khí tức của lôi đình đang dần hình thành trong tầng mây dày đặc, báo hiệu một đòn công kích không thể tránh khỏi!"
    },
    {
      "type": "player_choice",
      "content": "Vận chuyển toàn bộ linh lực trong cơ thể, trực diện chống đỡ đòn Kiếp Lôi đầu tiên (Rủi ro cao, tôi luyện ý chí)"
    },
    {
      "type": "ai_story",
      "content": "Kiếp Lôi đầu tiên giáng xuống! Một tia chớp màu tím khổng lồ xé toạc bầu trời, lao thẳng vào đỉnh đầu Lâm Hồn. Linh lực trong cơ thể ngươi gào thét, cuộn trào lên như sóng dữ, cố gắng tạo thành một lá chắn mỏng manh. Cơn đau thấu xương lan khắp toàn thân, từng tấc da thịt như muốn nứt toác, nội tạng rung chuyển dữ dội. Nhưng với ý chí kiên cường và sức sống mãnh liệt của Vạn Mộc Đồng Sinh Đạo Thai, ngươi không hề lùi bước. Áp lực kinh hoàng ấy tựa hồ đang nghiền nát thân thể phàm tục, nhưng cũng chính lúc đó, một sức sống mới bùng nổ, tái tạo từng tế bào, từng kinh mạch. Tiếng Kiếp Lôi cuối cùng dần tan biến, mây đen từ từ rút đi, để lại một luồng linh khí trong lành bao phủ lấy ngươi. Ngươi cảm nhận được một sự biến đổi sâu sắc, rốt cuộc đã thành công bước vào cảnh giới Ngưng Khí Tầng 1!"
    },
    {
      "type": "player_choice",
      "content": "Tĩnh tọa củng cố cảnh giới Ngưng Khí Tầng 1 (An toàn, ổn định tu vi)"
    },
    {
      "type": "ai_story",
      "content": "Lâm Hồn khoanh chân tĩnh tọa giữa Hằng Nhạc Sơn Mạch, điều hòa linh lực vừa đạt được từ đột phá. Dòng chảy linh khí Mộc hệ độc đáo nơi đây như vỗ về, giúp thân thể hắn dần hồi phục sau kiếp nạn. Hắn cảm nhận từng kinh mạch được củng cố, linh lực Ngưng Khí tầng một vững chắc hơn. Tâm cảnh cũng trở nên thanh tịnh, gạt bỏ những tạp niệm còn sót lại. Tuy nhiên, sự xao động linh khí do đột phá vẫn còn vương vấn, như một dấu hiệu vô hình lan tỏa trong khu vực."
    },
    {
      "type": "player_choice",
      "content": "Kiểm tra xung quanh bằng thần thức của mình (Có thể bị lộ vị trí, nhưng thu thập thông tin)"
    },
    {
      "type": "he_thong",
      "content": "[Hệ Thống] đã thức tỉnh và liên kết với linh hồn của ngươi."
    },
    {
      "type": "he_thong",
      "content": "Nhận nhiệm vụ mới: [Lắc Xúc Xắc Thiên Mệnh]."
    },
    {
      "type": "ai_story",
      "content": "Lâm Hồn tập trung thần thức, cẩn trọng khuếch tán ra xung quanh. Linh khí mộc hệ trong cơ thể hắn như hòa cùng cây cỏ, giúp thần thức lướt đi nhẹ nhàng hơn. Hắn cảm nhận được vài luồng khí tức ẩn hiện, có vẻ là những tu sĩ đang dò xét, nhưng thần thức của hắn còn yếu nên không thể nắm bắt chi tiết. Mùi hương thảo dược trộn lẫn huyết khí quả nhiên nồng hơn, dường như từ phía tây bắc đang có một cuộc truy đuổi hoặc chiến đấu nào đó. Nhưng khi hắn cố gắng truy tìm sâu hơn, một cảm giác kỳ lạ chợt dâng lên trong tâm hải, như có một lực lượng vô hình đang thúc đẩy vận mệnh. Một tiếng \"Đinh!\" vang vọng trong tâm trí hắn, cùng lúc đó, những đường nét cổ xưa, lờ mờ hiện ra trước mắt hắn, tạo thành một bàn cờ bí ẩn với những ô chữ đầy mê hoặc."
    },
    {
      "type": "player_choice",
      "content": "Lắc xúc xắc Thiên Mệnh Bàn (Khám phá vận mệnh mới)"
    },
    {
      "type": "ai_story",
      "content": "Lâm Hồn đưa tay chạm vào viên xúc xắc Thiên Mệnh Bàn đang lơ lửng, cảm nhận một luồng năng lượng huyền ảo tuôn chảy. Viên xúc xắc xoay tròn nhanh đến chóng mặt, phát ra ánh sáng ngũ sắc chói lọi, rồi đột ngột dừng lại, chỉ vào một ô 'Tiên Duyên Hiện Thế'. Ngay lập tức, một cảm giác kỳ lạ ập đến, dẫn dắt hắn hướng về phía sâu hơn trong Hằng Nhạc Sơn Mạch. Không phải là nơi có mùi máu tanh lúc trước, mà là một hướng khác, ẩn chứa một sinh cơ nồng đậm đến kinh người. Dường như, vận mệnh đã an bài một cơ duyên khác cho hắn."
    },
    {
      "type": "player_choice",
      "content": "Đi sâu vào hẻm núi để tìm kiếm cơ duyên (Cơ hội lớn, rủi ro cao)"
    },
    {
      "type": "system",
      "content": "Nhận được [Thiên Diệp Chi]."
    },
    {
      "type": "ai_story",
      "content": "Lâm Hồn cẩn trọng tiến sâu vào hẻm núi, xuyên qua lớp kết giới tự nhiên mỏng manh đang dần hé mở. Càng vào sâu, linh khí Mộc hệ càng trở nên nồng đậm, tinh thuần đến kinh ngạc, khiến mỗi tế bào trong cơ thể hắn như được tắm mình trong suối nguồn sinh mệnh. Tổ Mộc Chi Chủng trong đan điền không ngừng rung động, truyền đến một cảm giác hưng phấn và khao khát mãnh liệt. Hắn phát hiện ra một không gian bí ẩn, tựa như một tiểu thế giới bị lãng quên, nơi ngự trị bởi một gốc cây cổ thụ khổng lồ. Thân cây đã khô héo, nhưng những cành lá tàn úa lại tỏa ra một sức sống diệu kỳ, tựa hồ đang chờ đợi một sự tái sinh. Dưới gốc cây đó, một đóa Thiên Diệp Chi ngàn năm rực rỡ sắc xanh lục, linh khí cuồn cuộn đang chờ được hái lượm."
    }
  ],
  "mapLevel": 1,
  "isLoading": false,
  "isDead": false,
  "tribulationEvent": null,
  "combatState": null,
  "worldPhase": {
    "name": "Hồng Hoang Sơ Khai",
    "description": "Thời kỳ hồng hoang hỗn độn, thiên địa mới hình thành, linh khí nguyên thủy dồi dào nhưng cũng ẩn chứa vô số hiểm nguy và cơ duyên. Các chủng tộc sơ khai đang bắt đầu vươn lên, tìm kiếm con đường sinh tồn và phát triển giữa sự bất ổn của vũ trụ.",
    "effects": [
      {
        "description": "Linh khí thiên địa cuồn cuộn, mọi sinh linh dễ dàng cảm ngộ đại đạo, tốc độ tu luyện cơ bản tăng 15%.",
        "type": "buff",
        "target": "world"
      },
      {
        "description": "Thiên địa sơ khai, quy tắc hỗn loạn, ma chướng tâm cảnh thường xuyên xuất hiện, nguy cơ tẩu hỏa nhập ma tăng 20% khi đột phá cảnh giới.",
        "type": "debuff",
        "target": "world"
      },
      {
        "description": "Cơ duyên ẩn tàng khắp nơi, tỉ lệ xuất hiện các ô 'Kỳ Ngộ' hoặc 'Pháp Bảo' trên Thiên Mệnh Bàn tăng 25%.",
        "type": "buff",
        "target": "board"
      },
      {
        "description": "Thượng cổ hung thú hoành hành, tỉ lệ xuất hiện các ô 'Nguy Hiểm' hoặc 'Hung Thú' tăng 30%, đồng thời có 20% tỉ lệ gặp phải sự kiện phụ khắc nghiệt khi rơi vào ô 'Chiến Đấu'.",
        "type": "debuff",
        "target": "board"
      }
    ],
    "turnsRemaining": 100
  },
  "recipes": [
    {
      "id": "recipe_1",
      "name": "Hồi Linh Tán",
      "description": "Linh dược cơ bản, giúp phục hồi một lượng nhỏ linh lực.",
      "required": [
        {
          "itemId": "linh_thao_1",
          "name": "Linh Tâm Thảo",
          "quantity": 2
        }
      ],
      "result": {
        "name": "Hồi Linh Tán",
        "category": "Linh dược"
      }
    }
  ],
  "diceRolls": 1,
  "turnCounter": 8,
  "dongPhu": INITIAL_DONG_PHU_STATE,
  "thienDaoRules": [
    {
      "id": "td_1",
      "text": "Phàm nhân không thể tự ý phi hành, cần có pháp bảo hoặc đạt tới cảnh giới nhất định."
    },
    {
      "id": "td_2",
      "text": "Không thể dùng ngôn ngữ để trực tiếp thay đổi chỉ số hay cảnh giới. Mọi thứ cần tu luyện và kỳ ngộ."
    },
    {
      "id": "td_3",
      "text": "Thế giới có quy luật riêng, không thể biết trước tương lai hoặc điều khiển vận mệnh một cách tuyệt đối."
    },
    {
      "id": "td_4",
      "text": "Vật phẩm không thể được tạo ra từ hư không, phải thông qua chế tạo, mua bán hoặc tìm kiếm."
    },
    {
      "id": "tn_td_1",
      "text": "Ý cảnh là một phần quan trọng của sức mạnh, có thể vượt cấp thách đấu."
    },
    {
      "id": "tn_td_2",
      "text": "Thiên kiếp cực kỳ nguy hiểm, có thể dẫn đến hồn phi phách tán."
    },
    {
      "id": "tn_td_3",
      "text": "Thời gian có thể bị đảo ngược bởi đại năng, nhưng phải trả giá đắt."
    },
    {
      "id": "tn_dn_td_4",
      "text": "Linh hồn của vạn vật, đặc biệt là thảo mộc, có thể ảnh hưởng đến kỳ ngộ và vận mệnh của người có duyên."
    }
  ],
  "aiRules": INITIAL_AI_RULES,
  "coreMemoryRules": INITIAL_CORE_MEMORY_RULES,
  "journal": [
    {
      "id": "j_1758693784849",
      "turn": 0,
      "text": "Lâm Hồn, một thiếu niên bị xa lánh vì khả năng giao cảm với cây cỏ, được Mộc Trần Chân Nhân của Thanh Mộc Tông cứu và đưa về tông môn, bắt đầu con đường tu tiên."
    },
    {
      "id": "j_1758872420055",
      "turn": 1,
      "text": "Lâm Hồn dùng Bách Thảo Lộ, hồi phục một phần linh lực và được Mộc Trần Chân Nhân tán thưởng."
    },
    {
      "id": "j_1758872466341",
      "turn": 2,
      "text": "Lâm Hồn trang bị Dẫn Mộc Quyết, hoàn thành nghi thức nhập môn và được Mộc Trần Chân Nhân công nhận."
    },
    {
      "id": "j_1758872512439",
      "turn": 3,
      "text": "Lâm Hồn tĩnh tọa tu luyện Dẫn Mộc Quyết, cảm nhận linh lực Mộc hệ, tu vi tăng tiến chậm rãi."
    },
    {
      "id": "j_1758872548866",
      "turn": 4,
      "text": "Đột phá thành công Ngưng Khí Tầng 1 sau khi trực diện chống đỡ Kiếp Lôi, thân thể trọng thương nhưng ý chí kiên cường."
    },
    {
      "id": "j_1758872574523",
      "turn": 5,
      "text": "Lâm Hồn tĩnh tọa củng cố tu vi Ngưng Khí Tầng 1, hồi phục sức lực và tâm cảnh sau đột phá, nhưng linh khí xao động có thể gây chú ý."
    },
    {
      "id": "j_1758872630917",
      "turn": 6,
      "text": "Lâm Hồn dùng thần thức dò xét, phát hiện khí tức tu sĩ và mùi máu tanh, đồng thời kích hoạt Thiên Mệnh Bàn và Hệ Thống."
    },
    {
      "id": "j_1758872676700",
      "turn": 7,
      "text": "Lâm Hồn lắc xúc xắc Thiên Mệnh, hé lộ cơ duyên 'Tiên Duyên Hiện Thế' tại Hằng Nhạc Sơn Mạch."
    },
    {
      "id": "j_1758872720999",
      "turn": 8,
      "text": "Lâm Hồn khám phá hẻm núi bí ẩn, tìm thấy gốc cây cổ thụ và Thiên Diệp Chi, cảm nhận Tổ Mộc Chi Chủng rung động."
    }
  ],
  "shortTermMemory": [
    {
      "id": "j_1758872548866",
      "turn": 4,
      "text": "Đột phá thành công Ngưng Khí Tầng 1 sau khi trực diện chống đỡ Kiếp Lôi, thân thể trọng thương nhưng ý chí kiên cường."
    },
    {
      "id": "j_1758872574523",
      "turn": 5,
      "text": "Lâm Hồn tĩnh tọa củng cố tu vi Ngưng Khí Tầng 1, hồi phục sức lực và tâm cảnh sau đột phá, nhưng linh khí xao động có thể gây chú ý."
    },
    {
      "id": "j_1758872630917",
      "turn": 6,
      "text": "Lâm Hồn dùng thần thức dò xét, phát hiện khí tức tu sĩ và mùi máu tanh, đồng thời kích hoạt Thiên Mệnh Bàn và Hệ Thống."
    },
    {
      "id": "j_1758872676700",
      "turn": 7,
      "text": "Lâm Hồn lắc xúc xắc Thiên Mệnh, hé lộ cơ duyên 'Tiên Duyên Hiện Thế' tại Hằng Nhạc Sơn Mạch."
    },
    {
      "id": "j_1758872720999",
      "turn": 8,
      "text": "Lâm Hồn khám phá hẻm núi bí ẩn, tìm thấy gốc cây cổ thụ và Thiên Diệp Chi, cảm nhận Tổ Mộc Chi Chủng rung động."
    }
  ],
  "turnInCycle": 3,
  "heThong": {
    "quests": [
      {
        "title": "Lắc Xúc Xắc Thiên Mệnh",
        "description": "Dùng xúc xắc Thiên Mệnh Bàn để khám phá biến số đầu tiên trên con đường tu tiên.",
        "type": "Bình thường",
        "rewards": {
          "description": "Hoàn thành nhiệm vụ khởi động Hệ Thống, mở ra một chương mới trong hành trình tu tiên.",
          "heThongPoints": 10
        },
        "timeLimit": 3,
        "id": "htq_1758872630917",
        "status": "Hoàn thành"
      }
    ],
    "unlockedFeatures": ["thienMenhBan"]
  },
  "isAtBottleneck": false,
  "breakthroughReport": null,
  "scenarioSummary": "Đây là một câu chuyện đồng nhân trong thế giới Tiên Nghịch. Nhân vật chính, Lâm Hồn, sở hữu đạo thai 'Vạn Mộc Đồng Sinh', cho phép hắn mượn sinh cơ từ thảo mộc để chiến đấu và tu luyện. Con đường của hắn đối lập với Vương Lâm: không cầu sát phạt, chỉ cầu sinh sôi. Hắn sẽ phải đối mặt với sự tàn khốc của thế giới tu chân, nơi đạo của hắn bị coi là yếu đuối. Hắn sẽ phải tìm cách bảo vệ những gì mình trân quý, chứng minh sức mạnh của sinh mệnh cũng có thể khuấy đảo cả vũ trụ, và hành trình tìm kiếm Tổ Mộc sẽ đưa hắn đến những bí mật kinh thiên động địa, có thể sẽ giao thoa với vận mệnh của những nhân vật quen thuộc theo một cách không ai ngờ tới.",
  "scenarioStages": [
    {
      "id": "tn_dn_stage_1",
      "text": "Được trưởng lão Mộc Trần của Thanh Mộc Tông cứu khỏi dân làng và đưa về tông môn."
    },
    {
      "id": "tn_dn_stage_2",
      "text": "Chính thức tu luyện 'Dẫn Mộc Quyết', học cách kiểm soát sơ bộ khả năng của mình."
    },
    {
      "id": "tn_dn_stage_3",
      "text": "Lần đầu xuống núi tìm dược liệu, đối mặt với yêu thú và sự hiểm ác của tu sĩ khác."
    },
    {
      "id": "tn_dn_stage_4",
      "text": "Thanh Mộc Tông bị một ma phái gần đó để mắt tới vì sở hữu linh tuyền."
    },
    {
      "id": "tn_dn_stage_5",
      "text": "Ma phái tấn công, Mộc Trần trưởng lão hi sinh thân mình để bảo vệ Lâm Hồn chạy thoát."
    }
  ],
  "cultivationSystem": [
    {
      "id": "pham_nhan_tier_0",
      "name": "Cấp Bậc Phàm Nhân",
      "rank": 0,
      "realms": [
        {
          "id": "pham_nhan_realm_0",
          "rank": 0,
          "name": "Phàm Nhân",
          "baseLifespan": 80,
          "description": "Cảnh giới khởi đầu của vạn vật, chưa bước chân vào con đường tu tiên.",
          "minorRealms": [
            {
              "id": "pham_nhan_realm_0_minor_0",
              "rank": 0,
              "name": "",
              "description": "Chưa bước chân vào con đường tu tiên.",
              "isHidden": false
            }
          ],
          "hasQualities": false,
          "qualities": []
        }
      ]
    },
    {
      "id": "tiennghich_tier_1",
      "name": "Bước Thứ Nhất: Sơ Nhập Tiên Đồ",
      "rank": 1,
      "realms": [
        {
          "id": "tn_realm_1",
          "rank": 1,
          "name": "Ngưng Khí",
          "baseLifespan": 100,
          "description": "Hấp thụ linh khí trời đất, bước những bước đầu tiên trên con đường tu tiên.",
          "hasQualities": false,
          "minorRealms": [
            {
              "id": "tn_realm_1_minor_1",
              "rank": 1,
              "name": "Tầng 1",
              "description": "Tầng 1 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_2",
              "rank": 2,
              "name": "Tầng 2",
              "description": "Tầng 2 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_3",
              "rank": 3,
              "name": "Tầng 3",
              "description": "Tầng 3 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_4",
              "rank": 4,
              "name": "Tầng 4",
              "description": "Tầng 4 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_5",
              "rank": 5,
              "name": "Tầng 5",
              "description": "Tầng 5 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_6",
              "rank": 6,
              "name": "Tầng 6",
              "description": "Tầng 6 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_7",
              "rank": 7,
              "name": "Tầng 7",
              "description": "Tầng 7 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_8",
              "rank": 8,
              "name": "Tầng 8",
              "description": "Tầng 8 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_9",
              "rank": 9,
              "name": "Tầng 9",
              "description": "Tầng 9 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_10",
              "rank": 10,
              "name": "Tầng 10",
              "description": "Tầng 10 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_11",
              "rank": 11,
              "name": "Tầng 11",
              "description": "Tầng 11 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_12",
              "rank": 12,
              "name": "Tầng 12",
              "description": "Tầng 12 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_13",
              "rank": 13,
              "name": "Tầng 13",
              "description": "Tầng 13 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_14",
              "rank": 14,
              "name": "Tầng 14",
              "description": "Tầng 14 của Ngưng Khí Kỳ.",
              "isHidden": false
            },
            {
              "id": "tn_realm_1_minor_15",
              "rank": 15,
              "name": "Tầng 15",
              "description": "Tầng 15 của Ngưng Khí Kỳ.",
              "isHidden": false
            }
          ]
        },
        {
          "id": "tn_realm_2",
          "rank": 2,
          "name": "Trúc Cơ",
          "baseLifespan": 200,
          "description": "Linh khí hóa lỏng, thần thức mở rộng, chính thức thoát ly phàm tục.",
          "hasQualities": true,
          "minorRealms": [
            {
              "rank": 1,
              "name": "Sơ Kỳ",
              "description": "Vừa đột phá, cảnh giới chưa ổn định.",
              "isHidden": false,
              "id": "tn_realm_2_minor_1"
            },
            {
              "rank": 2,
              "name": "Trung Kỳ",
              "description": "Cảnh giới vững chắc, thực lực tăng tiến.",
              "isHidden": false,
              "id": "tn_realm_2_minor_2"
            },
            {
              "rank": 3,
              "name": "Hậu Kỳ",
              "description": "Tu vi hùng hậu, sắp chạm đến bình cảnh.",
              "isHidden": false,
              "id": "tn_realm_2_minor_3"
            },
            {
              "rank": 4,
              "name": "Đại Viên Mãn",
              "description": "Cảnh giới hoàn mỹ, sẵn sàng cho lần đột phá tiếp theo.",
              "isHidden": false,
              "id": "tn_realm_2_minor_4"
            }
          ],
          "qualities": [
            {
              "id": "trucco_q_1",
              "rank": 1,
              "name": "Nhân Đạo Trúc Cơ",
              "description": "Trúc Cơ thành công nhưng nền tảng không vững, tiềm năng có hạn.",
              "condition": "Vượt qua thiên kiếp một cách miễn cưỡng.",
              "statBonusMultiplier": 1,
              "lifespanBonus": 0
            },
            {
              "id": "trucco_q_2",
              "rank": 2,
              "name": "Địa Đạo Trúc Cơ",
              "description": "Trúc Cơ vững chắc, đạo cơ ổn định, tiềm năng khá.",
              "condition": "Có sự chuẩn bị tốt và vượt qua thiên kiếp một cách vững vàng.",
              "statBonusMultiplier": 1.2,
              "lifespanBonus": 50
            },
            {
              "id": "trucco_q_3",
              "rank": 3,
              "name": "Thiên Đạo Trúc Cơ",
              "description": "Trúc Cơ hoàn mỹ, được thiên địa thừa nhận, tiềm năng vô hạn.",
              "condition": "Có đại cơ duyên, sự chuẩn bị hoàn hảo và vượt qua thiên kiếp một cách xuất sắc.",
              "statBonusMultiplier": 1.5,
              "lifespanBonus": 100
            }
          ]
        },
        {
          "id": "tn_realm_3",
          "rank": 3,
          "name": "Kết Đan",
          "baseLifespan": 400,
          "description": "Linh khí hóa lỏng ngưng tụ thành kim đan, pháp lực hùng hậu.",
          "hasQualities": true,
          "minorRealms": [
            {
              "rank": 1,
              "name": "Sơ Kỳ",
              "description": "Vừa đột phá, cảnh giới chưa ổn định.",
              "isHidden": false,
              "id": "tn_realm_3_minor_1"
            },
            {
              "rank": 2,
              "name": "Trung Kỳ",
              "description": "Cảnh giới vững chắc, thực lực tăng tiến.",
              "isHidden": false,
              "id": "tn_realm_3_minor_2"
            },
            {
              "rank": 3,
              "name": "Hậu Kỳ",
              "description": "Tu vi hùng hậu, sắp chạm đến bình cảnh.",
              "isHidden": false,
              "id": "tn_realm_3_minor_3"
            },
            {
              "rank": 4,
              "name": "Đại Viên Mãn",
              "description": "Cảnh giới hoàn mỹ, sẵn sàng cho lần đột phá tiếp theo.",
              "isHidden": false,
              "id": "tn_realm_3_minor_4"
            }
          ],
          "qualities": [
            {
              "id": "ketdan_q_1",
              "rank": 1,
              "name": "Cửu Phẩm Kim Đan",
              "description": "Kim đan phẩm chất Cửu Phẩm, phẩm chất càng cao, tiềm năng càng lớn.",
              "condition": "Chất lượng kim đan phụ thuộc vào công pháp, tài liệu và quá trình kết đan.",
              "statBonusMultiplier": 1,
              "lifespanBonus": 0
            },
            {
              "id": "ketdan_q_2",
              "rank": 2,
              "name": "Bát Phẩm Kim Đan",
              "description": "Kim đan phẩm chất Bát Phẩm, phẩm chất càng cao, tiềm năng càng lớn.",
              "condition": "Chất lượng kim đan phụ thuộc vào công pháp, tài liệu và quá trình kết đan.",
              "statBonusMultiplier": 1.125,
              "lifespanBonus": 25
            },
            {
              "id": "ketdan_q_3",
              "rank": 3,
              "name": "Thất Phẩm Kim Đan",
              "description": "Kim đan phẩm chất Thất Phẩm, phẩm chất càng cao, tiềm năng càng lớn.",
              "condition": "Chất lượng kim đan phụ thuộc vào công pháp, tài liệu và quá trình kết đan.",
              "statBonusMultiplier": 1.25,
              "lifespanBonus": 50
            },
            {
              "id": "ketdan_q_4",
              "rank": 4,
              "name": "Lục Phẩm Kim Đan",
              "description": "Kim đan phẩm chất Lục Phẩm, phẩm chất càng cao, tiềm năng càng lớn.",
              "condition": "Chất lượng kim đan phụ thuộc vào công pháp, tài liệu và quá trình kết đan.",
              "statBonusMultiplier": 1.375,
              "lifespanBonus": 75
            },
            {
              "id": "ketdan_q_5",
              "rank": 5,
              "name": "Ngũ Phẩm Kim Đan",
              "description": "Kim đan phẩm chất Ngũ Phẩm, phẩm chất càng cao, tiềm năng càng lớn.",
              "condition": "Chất lượng kim đan phụ thuộc vào công pháp, tài liệu và quá trình kết đan.",
              "statBonusMultiplier": 1.5,
              "lifespanBonus": 100
            },
            {
              "id": "ketdan_q_6",
              "rank": 6,
              "name": "Tứ Phẩm Kim Đan",
              "description": "Kim đan phẩm chất Tứ Phẩm, phẩm chất càng cao, tiềm năng càng lớn.",
              "condition": "Chất lượng kim đan phụ thuộc vào công pháp, tài liệu và quá trình kết đan.",
              "statBonusMultiplier": 1.625,
              "lifespanBonus": 125
            },
            {
              "id": "ketdan_q_7",
              "rank": 7,
              "name": "Tam Phẩm Kim Đan",
              "description": "Kim đan phẩm chất Tam Phẩm, phẩm chất càng cao, tiềm năng càng lớn.",
              "condition": "Chất lượng kim đan phụ thuộc vào công pháp, tài liệu và quá trình kết đan.",
              "statBonusMultiplier": 1.75,
              "lifespanBonus": 150
            },
            {
              "id": "ketdan_q_8",
              "rank": 8,
              "name": "Nhị Phẩm Kim Đan",
              "description": "Kim đan phẩm chất Nhị Phẩm, phẩm chất càng cao, tiềm năng càng lớn.",
              "condition": "Chất lượng kim đan phụ thuộc vào công pháp, tài liệu và quá trình kết đan.",
              "statBonusMultiplier": 1.875,
              "lifespanBonus": 175
            },
            {
              "id": "ketdan_q_9",
              "rank": 9,
              "name": "Nhất Phẩm Kim Đan",
              "description": "Kim đan phẩm chất Nhất Phẩm, phẩm chất càng cao, tiềm năng càng lớn.",
              "condition": "Chất lượng kim đan phụ thuộc vào công pháp, tài liệu và quá trình kết đan.",
              "statBonusMultiplier": 2,
              "lifespanBonus": 200
            }
          ]
        },
        {
          "id": "tn_realm_4",
          "rank": 4,
          "name": "Nguyên Anh",
          "baseLifespan": 800,
          "description": "Kim đan vỡ, Nguyên Anh sinh. Từ đây có thể đoạt xá trùng sinh, thần thông quảng đại.",
          "hasQualities": false,
          "minorRealms": [
            {
              "rank": 1,
              "name": "Sơ Kỳ",
              "description": "Vừa đột phá, cảnh giới chưa ổn định.",
              "isHidden": false,
              "id": "tn_realm_4_minor_1"
            },
            {
              "rank": 2,
              "name": "Trung Kỳ",
              "description": "Cảnh giới vững chắc, thực lực tăng tiến.",
              "isHidden": false,
              "id": "tn_realm_4_minor_2"
            },
            {
              "rank": 3,
              "name": "Hậu Kỳ",
              "description": "Tu vi hùng hậu, sắp chạm đến bình cảnh.",
              "isHidden": false,
              "id": "tn_realm_4_minor_3"
            },
            {
              "rank": 4,
              "name": "Đại Viên Mãn",
              "description": "Cảnh giới hoàn mỹ, sẵn sàng cho lần đột phá tiếp theo.",
              "isHidden": false,
              "id": "tn_realm_4_minor_4"
            }
          ]
        },
        {
          "id": "tn_realm_5",
          "rank": 5,
          "name": "Hóa Thần",
          "baseLifespan": 1500,
          "description": "Nguyên Anh hòa cùng trời đất, cảm ngộ quy tắc, thần du thái hư.",
          "hasQualities": false,
          "minorRealms": [
            {
              "rank": 1,
              "name": "Sơ Kỳ",
              "description": "Vừa đột phá, cảnh giới chưa ổn định.",
              "isHidden": false,
              "id": "tn_realm_5_minor_1"
            },
            {
              "rank": 2,
              "name": "Trung Kỳ",
              "description": "Cảnh giới vững chắc, thực lực tăng tiến.",
              "isHidden": false,
              "id": "tn_realm_5_minor_2"
            },
            {
              "rank": 3,
              "name": "Hậu Kỳ",
              "description": "Tu vi hùng hậu, sắp chạm đến bình cảnh.",
              "isHidden": false,
              "id": "tn_realm_5_minor_3"
            },
            {
              "rank": 4,
              "name": "Đại Viên Mãn",
              "description": "Cảnh giới hoàn mỹ, sẵn sàng cho lần đột phá tiếp theo.",
              "isHidden": false,
              "id": "tn_realm_5_minor_4"
            }
          ]
        },
        {
          "id": "tn_realm_6",
          "rank": 6,
          "name": "Anh Biến",
          "baseLifespan": 3000,
          "description": "Nguyên Anh phát sinh biến dị, sức mạnh tăng vọt, bắt đầu chạm đến cánh cửa của thiên địa.",
          "hasQualities": false,
          "minorRealms": [
            {
              "rank": 1,
              "name": "Sơ Kỳ",
              "description": "Vừa đột phá, cảnh giới chưa ổn định.",
              "isHidden": false,
              "id": "tn_realm_6_minor_1"
            },
            {
              "rank": 2,
              "name": "Trung Kỳ",
              "description": "Cảnh giới vững chắc, thực lực tăng tiến.",
              "isHidden": false,
              "id": "tn_realm_6_minor_2"
            },
            {
              "rank": 3,
              "name": "Hậu Kỳ",
              "description": "Tu vi hùng hậu, sắp chạm đến bình cảnh.",
              "isHidden": false,
              "id": "tn_realm_6_minor_3"
            },
            {
              "rank": 4,
              "name": "Đại Viên Mãn",
              "description": "Cảnh giới hoàn mỹ, sẵn sàng cho lần đột phá tiếp theo.",
              "isHidden": false,
              "id": "tn_realm_6_minor_4"
            }
          ]
        },
        {
          "id": "tn_realm_7",
          "rank": 7,
          "name": "Vấn Đỉnh",
          "baseLifespan": 5000,
          "description": "Hỏi đỉnh thiên địa, tu vi đạt đến đỉnh cao của Bước Thứ Nhất, một bước có thể thành tiên.",
          "hasQualities": false,
          "minorRealms": [
            {
              "rank": 1,
              "name": "Sơ Kỳ",
              "description": "Vừa đột phá, cảnh giới chưa ổn định.",
              "isHidden": false,
              "id": "tn_realm_7_minor_1"
            },
            {
              "rank": 2,
              "name": "Trung Kỳ",
              "description": "Cảnh giới vững chắc, thực lực tăng tiến.",
              "isHidden": false,
              "id": "tn_realm_7_minor_2"
            },
            {
              "rank": 3,
              "name": "Hậu Kỳ",
              "description": "Tu vi hùng hậu, sắp chạm đến bình cảnh.",
              "isHidden": false,
              "id": "tn_realm_7_minor_3"
            },
            {
              "rank": 4,
              "name": "Đại Viên Mãn",
              "description": "Cảnh giới hoàn mỹ, sẵn sàng cho lần đột phá tiếp theo.",
              "isHidden": false,
              "id": "tn_realm_7_minor_4"
            }
          ]
        }
      ]
    }
  ],
  "thienThu": {
    "vatPhamTieuHao": [],
    "trangBi": [],
    "phapBao": [],
    "congPhap": [],
    "tienThienKhiVan": [],
    "hieuUng": [],
    "trangThai": []
  },
  "worldData": {
    "worldLocations": [
      { "id": "tn_dai_vuc_nam_vuc", "name": "Nam Vực", "description": "Một trong Tứ Đại Vực của Chu Tước Tinh, tài nguyên tu chân không quá phong phú.", "level": 1, "parentId": null, "controllingSectIds": [], "type": "Quần Cư", "safetyLevel": "Nguy Hiểm", "x": 50, "y": 50 },
      { "id": "tn_quoc_gia_trieu", "name": "Triệu Quốc", "description": "Một nước tu chân nhỏ bé ở biên giới Nam Vực.", "level": 2, "parentId": "tn_dai_vuc_nam_vuc", "controllingSectIds": ["hang_nhac_phai"], "type": "Quần Cư", "safetyLevel": "Trung Lập", "x": 50, "y": 50, "sovereigntyType": "autonomous" },
      { "id": "tn_khu_vuc_thanh_moc", "name": "Thanh Mộc Cốc", "description": "Một sơn cốc hẻo lánh, nơi Thanh Mộc Tông tọa lạc. Linh khí Mộc hệ dồi dào.", "level": 3, "parentId": "tn_quoc_gia_trieu", "controllingSectIds": ["thanh_moc_tong"], "type": "Tự Nhiên", "safetyLevel": "An Toàn Khu", "x": 30, "y": 70, "sovereigntyType": "autonomous" },
      { "id": "tn_khu_vuc_hang_nhac", "name": "Hằng Nhạc Sơn Mạch", "description": "Dãy núi chính của Triệu Quốc, linh khí dồi dào, là nơi Hằng Nhạc Phái tọa lạc.", "level": 3, "parentId": "tn_quoc_gia_trieu", "controllingSectIds": ["hang_nhac_phai"], "type": "Tự Nhiên", "safetyLevel": "Trung Lập", "sovereigntyType": "autonomous", "x": 65, "y": 50 }
    ],
    "initialSects": [
      { "id": "thanh_moc_tong", "name": "Thanh Mộc Tông", "alignment": "Chính Đạo", "description": "Một tiểu môn phái chuyên tu luyện công pháp Mộc hệ, đã suy tàn.", "level": 2, "locationId": "tn_khu_vuc_thanh_moc", "ranks": [], "facilities": [], "treasury": {} },
      { "id": "hang_nhac_phai", "name": "Hằng Nhạc Phái", "alignment": "Chính Đạo", "description": "Một trong ba đại tông môn của nước Triệu.", "level": 4, "locationId": "tn_khu_vuc_hang_nhac", "ranks": [], "facilities": [], "treasury": {} }
    ],
    "initialNpcs": [
      { "id": "moc_tran_chan_nhan", "name": "Mộc Trần Chân Nhân", "description": "Trưởng lão cuối cùng của Thanh Mộc Tông, sư phụ của Lâm Hồn.", "relationship": "Sư phụ", "sectId": "thanh_moc_tong", "initialLocationId": "tn_khu_vuc_thanh_moc", "startingCultivationStageId": "tn_realm_3_minor_4" },
      { "id": "ly_han", "name": "Lý Hàn", "description": "Một đệ tử nội môn của Hằng Nhạc Phái, tính tình kiêu ngạo.", "relationship": "Người lạ", "sectId": "hang_nhac_phai", "initialLocationId": "tn_khu_vuc_hang_nhac", "initialAttitude": "Cảnh giác", "personality": "Hiếu chiến", "startingCultivationStageId": "tn_realm_1_minor_5" }
    ]
  },
  "inGameNpcs": [
    {
      "id": "moc_tran_chan_nhan", "name": "Mộc Trần Chân Nhân", "level": 50, "exp": 0, "maxExp": 1000, "hp": 2500, "maxHp": 2500, "spiritPower": 1800, "maxSpiritPower": 1800, "stamina": 1000, "maxStamina": 1000, "mentalState": 1500, "maxMentalState": 1500, "day": 1, "month": 1, "year": 1, "age": 350, "lifespan": 400, "cultivationStage": "Kết Đan Đại Viên Mãn", "cultivationQuality": null, "cultivationStageId": "tn_realm_3_minor_4", "cultivationQualityId": null, "position": 0, "currentLocationId": "tn_khu_vuc_thanh_moc", "linhCan": "Địa Linh Căn", "nguHanh": "Mộc", "sect": "Thanh Mộc Tông", "reputation": {}, "sectContribution": 0, "equippedTechniqueId": null, "equippedTreasureId": null,
      "attributes": { "physicalStrength": 150, "magicPower": 400, "bodyStrength": 200, "defense": 250, "agility": 180, "spiritualSense": 300, "aptitude": 70, "critChance": 10, "critDamage": 150 },
      "difficulty": "Khó", "selectedDestinyIds": [], "heThongStatus": "disabled", "heThongPoints": 0, "statusEffects": [], "attitudeTowardsPC": 100, "personalHistory": "Cả đời tâm huyết với Thanh Mộc Tông, chứng kiến tông môn suy tàn. Hy vọng cuối cùng đặt cả vào Lâm Hồn."
    },
    {
      "id": "ly_han", "name": "Lý Hàn", "level": 5, "exp": 0, "maxExp": 200, "hp": 250, "maxHp": 250, "spiritPower": 150, "maxSpiritPower": 150, "stamina": 120, "maxStamina": 120, "mentalState": 110, "maxMentalState": 110, "day": 1, "month": 1, "year": 1, "age": 18, "lifespan": 100, "cultivationStage": "Ngưng Khí Tầng 5", "cultivationQuality": null, "cultivationStageId": "tn_realm_1_minor_5", "cultivationQualityId": null, "position": 0, "currentLocationId": "tn_khu_vuc_hang_nhac", "linhCan": "Huyền Linh Căn", "nguHanh": "Kim", "sect": "Hằng Nhạc Phái", "reputation": {}, "sectContribution": 0, "equippedTechniqueId": null, "equippedTreasureId": null,
      "attributes": { "physicalStrength": 25, "magicPower": 30, "bodyStrength": 20, "defense": 22, "agility": 18, "spiritualSense": 25, "aptitude": 20, "critChance": 8, "critDamage": 150 },
      "difficulty": "Khó", "selectedDestinyIds": [], "heThongStatus": "disabled", "heThongPoints": 0, "statusEffects": [], "attitudeTowardsPC": -20, "personalHistory": "Đệ tử nội môn Hằng Nhạc Phái, có chút thiên phú nên coi thường người khác."
    }
  ],
  "discoveredEntityIds": {
    "locations": ["tn_dai_vuc_nam_vuc", "tn_quoc_gia_trieu", "tn_khu_vuc_hang_nhac", "tn_khu_vuc_thanh_moc"],
    "sects": ["thanh_moc_tong", "hang_nhac_phai"],
    "npcs": ["moc_tran_chan_nhan", "ly_han"]
  },
  "currentMapViewId": null
};