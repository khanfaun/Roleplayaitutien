// FIX: Replaced `Sect` with `InitialSect` to align with updated type definitions.
import type { Player, Recipe, DongPhuState, InitialSect, Rule, MinorRealm, GameState, CultivationTier, RealmQuality, PlayerAttributes } from './types';

export const PLAYER_NAME = "Đạo Hữu";

export const INITIAL_PLAYER_STATS: Player = {
  name: PLAYER_NAME,
  imageId: undefined,
  level: 1,
  exp: 0,
  maxExp: 100,
  hp: 100,
  maxHp: 100,
  spiritPower: 50,
  maxSpiritPower: 50,
  stamina: 100,
  maxStamina: 100,
  mentalState: 100,
  maxMentalState: 100,
  day: 1,
  month: 1,
  year: 1,
  age: 16,
  lifespan: 100,
  cultivationStage: "Luyện Thể Nhất Trọng",
  cultivationQuality: null,
  cultivationStageId: 'realm_1_minor_1',
  cultivationQualityId: null,
  position: 0,
  currentLocationId: '',
  linhCan: "Chưa xác định",
  nguHanh: "Chưa xác định",
  sect: null,
  sectRank: null,
  reputation: {},
  sectContribution: 0,
  equippedTechniqueId: null,
  equippedTreasureId: null,
  attributes: {
    physicalStrength: 10,
    magicPower: 10,
    bodyStrength: 10,
    defense: 5,
    agility: 5,
    spiritualSense: 5,
    aptitude: 5,
    critChance: 5, // Percent
    critDamage: 150, // Percent
  },
  difficulty: 'Bình thường',
  selectedDestinyIds: [],
  heThongStatus: 'disabled',
  heThongPoints: 0,
  statusEffects: [],
};

export const INITIAL_DONG_PHU_STATE: DongPhuState = {
    buildings: [
        { id: 'tuLinhTran', name: 'Tụ Linh Trận', level: 0, description: 'Tự động tích lũy Linh Lực khi không online. Cấp 1: +10 Linh Lực mỗi giờ.', upgradeCost: [{ name: 'Linh Thạch Hạ Phẩm', quantity: 10 }] },
        { id: 'linhDuocVien', name: 'Linh Dược Viên', level: 0, description: 'Trồng và thu hoạch linh thảo. Cấp càng cao, sản vật càng quý.', upgradeCost: [{ name: 'Linh Thạch Hạ Phẩm', quantity: 15 }] },
        { id: 'luyenDanPhong', name: 'Luyện Đan Phòng', level: 0, description: 'Cần thiết để luyện chế đan dược cao cấp.', upgradeCost: [{ name: 'Linh Thạch Hạ Phẩm', quantity: 20 }] },
        { id: 'luyenKhiCac', name: 'Luyện Khí Các', level: 0, description: 'Cần thiết để chế tạo và nâng cấp pháp bảo.', upgradeCost: [{ name: 'Linh Thạch Hạ Phẩm', quantity: 20 }] },
    ],
    lastOnlineTimestamp: Date.now(),
};

export const INITIAL_THIEN_DAO_RULES: Rule[] = [
    { id: 'td_1', text: 'Phàm nhân không thể tự ý phi hành, cần có pháp bảo hoặc đạt tới cảnh giới nhất định.' },
    { id: 'td_2', text: 'Không thể dùng ngôn ngữ để trực tiếp thay đổi chỉ số hay cảnh giới. Mọi thứ cần tu luyện và kỳ ngộ.' },
    { id: 'td_3', text: 'Thế giới có quy luật riêng, không thể biết trước tương lai hoặc điều khiển vận mệnh một cách tuyệt đối.' },
    { id: 'td_4', text: 'Vật phẩm không thể được tạo ra từ hư không, phải thông qua chế tạo, mua bán hoặc tìm kiếm.' },
];

export const INITIAL_CORE_MEMORY_RULES: Rule[] = [];

export const INITIAL_AI_RULES: Rule[] = [
    { id: 'ai_1', text: 'Luôn duy trì sự bí ẩn của thế giới tu tiên. Không giải thích cơ chế game một cách máy móc.' },
    { id: 'ai_2', text: 'Mỗi hành động đều có nhân quả. Lựa chọn của người chơi phải để lại dấu ấn, dù là nhỏ.' },
    { id: 'ai_3', text: 'Không bao giờ phá vỡ vai trò Quản Trò. Luôn nói chuyện như một phần của thế giới game.' },
    { id: 'ai_4', text: 'Thời gian là tuyến tính và trôi về phía trước. Không tạo ra các sự kiện du hành thời gian trừ khi có vật phẩm hoặc kỳ ngộ cực kỳ đặc biệt.' },
    { id: 'ai_5', text: "QUẢN LÝ THỂ LỰC (STAMINA) - QUY TẮC SỐNG CÒN:\n*   Nguyên tắc cốt lõi: Mọi hành động trong thế giới tu tiên đều có cái giá của nó, chủ yếu được đo bằng Thể Lực. Nhân vật không thể hành động không giới hạn.\n*   Hành động TIÊU HAO Thể Lực (staminaChange là số ÂM): Đây là những hành động gắng sức, yêu cầu sự tập trung hoặc vận dụng linh lực/thể phách. Bạn PHẢI suy diễn và áp dụng cho các hành động tương tự. Ví dụ: Chiến đấu, sử dụng công pháp mạnh, luyện đan, luyện khí, Độ Kiếp, di chuyển đường dài (phi hành), thu hoạch tài nguyên.\n*   Hành động PHỤC HỒI Thể Lực (staminaChange là số DƯƠNG hoặc 0): Đây là những hành động nghỉ ngơi, thư giãn. Ví dụ: Thiền định, ngủ, nghỉ ngơi, ăn uống, dùng đan dược.\n*   KIỆT SỨC: Nếu Thể Lực (`player.stamina`) không đủ cho một hành động gắng sức, bạn BẮT BUỘC phải mô tả rằng nhân vật kiệt sức và hành động đó thất bại. Các chỉ số khác (`expChange`, `newItem`) đều không có lợi." },
    { id: 'ai_6', text: "QUẢN LÝ TU VI (EXP) - QUY TẮC CÂN BẰNG:\n*   Nguyên tắc cốt lõi: Tu vi phải đến từ nỗ lực và kỳ ngộ tương xứng. Tránh lạm phát EXP.\n*   Hành động thông thường (đi dạo, nói chuyện, mua bán): `expChange` = 0.\n*   Tu luyện ngắn hạn (chọn gợi ý thiền định, luyện tập): `expChange` RẤT THẤP (1-5 EXP).\n*   Tu luyện dài hạn (nhập hành động 'bế quan 10 ngày'): `expChange` có thể cao hơn, tương ứng với thời gian.\n*   Nhiệm vụ: Lượng EXP thưởng PHẢI TƯƠNG XỨNG với độ khó. Nhiệm vụ dễ ('đưa thư'): EXP thấp (10-20). Nhiệm vụ khó ('giết yêu vương'): EXP cao (100+). Áp dụng cho cả nhiệm vụ thường và nhiệm vụ Hệ Thống.\n*   Chiến đấu: EXP nhận được từ kẻ địch phải tương ứng với sức mạnh của chúng.\n*   Các trường hợp khác (giác ngộ, kỳ ngộ): Lượng EXP phải phù hợp với tầm quan trọng của sự kiện." },
    { id: 'ai_7', text: "Phong cách xưng hô: TUYỆT ĐỐI KHÔNG dùng 'bạn', 'của bạn'. Luôn gọi nhân vật chính bằng tên của họ (`player.name`) và dùng văn phong tiên hiệp (ví dụ: đạo hữu, tại hạ, tiền bối)." },
    { id: 'ai_8', text: "Quy tắc tạo gợi ý (options): LUÔN LUÔN tạo ra CHÍNH XÁC 4 gợi ý hành động. Mỗi gợi ý PHẢI kèm theo một chú thích ngắn gọn về rủi ro/cơ hội trong dấu ngoặc đơn ()." },
    { id: 'ai_9', text: "Tính nhất quán của sự kiện: Mọi sự kiện được tạo ra phải tuyệt đối tuân thủ chủ đề của loại ô trên Thiên Mệnh Bàn (ví dụ: ô 'Tâm Ma' phải tạo ra thử thách về mặt tinh thần)." },
    { id: 'ai_10', text: "Quy tắc Trạng thái: Dựa vào diễn biến, thêm/bớt trạng thái cho nhân vật bằng `newStatusEffects` (gồm id và duration) và `removeStatusEffectIds`. ID phải lấy từ danh sách định nghĩa sẵn." },
    { id: 'ai_11', text: "Bản chất Thiên Mệnh Bàn: Bàn cờ là 'Thiên Mệnh Bàn', đại diện cho dòng chảy của số phận, không phải bản đồ địa lý. Lắc xúc xắc là một sự thay đổi của vận mệnh xảy ra tại bối cảnh hiện tại, KHÔNG phải di chuyển. Tên của mỗi ô là một biến cố vận mệnh (ví dụ: 'Linh Khí Bạo Động'), không phải địa danh." },
    { id: 'ai_12', text: "Luật Thép về Hệ Thống & Thiên Mệnh Bàn:\n1.  **Kích Hoạt Hệ Thống:** 'Hệ Thống' bắt đầu ở trạng thái 'inactive'. Bạn PHẢI chủ động tạo ra một sự kiện kỳ ngộ hợp lý để kích hoạt Hệ Thống (đặt `awakenHeThong = true`) trong khoảng từ lượt 3 đến lượt 10. Nếu đến lượt 9 mà Hệ Thống vẫn chưa được kích hoạt, BẮT BUỘC phải tạo sự kiện kích hoạt ở lượt 10. Nếu người chơi đã tắt Hệ Thống (`heThongStatus` = 'disabled'), TUYỆT ĐỐI không được kích hoạt.\n2.  **Kích Hoạt Thiên Mệnh Bàn (QUAN TRỌNG):** Ngay sau khi Hệ Thống được kích hoạt (`player.heThongStatus` = 'active'), bạn BẮT BUỘC phải tạo ra một nhiệm vụ Hệ Thống (`newHeThongQuest`) trong vòng 3 đến 5 lượt tiếp theo. Mục tiêu của nhiệm vụ này là để người chơi mở khóa chức năng 'Thiên Mệnh Bàn'. Khi người chơi hoàn thành nhiệm vụ này, bạn phải trả về `unlockSystemFeature: 'thienMenhBan'` trong `heThongQuestUpdates`. Đây là một bước CỐT LÕI trong tiến trình game.\n3.  **Bản Chất Hệ Thống:** Hệ Thống là một thực thể đồng hành, tự chủ ban phát nhiệm vụ, không theo yêu cầu người chơi. Nhiệm vụ có thể có mục tiêu ẩn." },
    { id: 'ai_13', text: "Luật Cấm Tuyệt Đối về Xúc Xắc: 'Lắc xúc xắc' là một hành động của người chơi để thay đổi vận mệnh trên Thiên Mệnh Bàn, do hệ thống game điều khiển. Bạn, với vai trò AI, TUYỆT ĐỐI KHÔNG BAO GIỜ được tạo ra bất kỳ gợi ý hành động (`options`) hoặc mục tiêu nhiệm vụ (cả thường và Hệ Thống) nào có chứa cụm từ 'lắc xúc xắc' hoặc yêu cầu người chơi thực hiện hành động này. Hành động này nằm ngoài tầm kiểm soát của bạn." },
    { id: 'ai_14', text: "Quy tắc thời gian nhiệm vụ Hệ Thống: Nhiệm vụ 'Bình thường' có giới hạn thời gian (timeLimit) PHẢI >= 3 lượt. 'Sự kiện đặc biệt' (rất hiếm) có timeLimit >= 20 lượt. 'Nhiệm vụ tối thượng' (cuối game) không có giới hạn thời gian." },
    { id: 'ai_15', text: "Phần thưởng của Nhiệm vụ Hệ Thống có thể là 'Mở khóa chức năng', nhưng PHẢI giới hạn trong các chức năng đã có trong game: 'Động Phủ', 'Luyện Chế', 'Gia nhập Môn Phái', 'Thiên Mệnh Bàn'. TUYỆT ĐỐI KHÔNG được bịa ra các chức năng mới không tồn tại (ví dụ: 'Thú Cưng', 'Song Tu', 'Bảng Xếp Hạng')." },
    { id: 'ai_16', text: "Quy tắc Phẩm Chất Cảnh Giới: Khi người chơi đột phá một Đại Cảnh Giới có phẩm chất (ví dụ Trúc Cơ, Kim Đan), bạn, AI, PHẢI dựa vào hành động của người chơi trong thiên kiếp và sự chuẩn bị của họ (vật phẩm, công pháp) để quyết định phẩm chất họ đạt được. Trả về ID của phẩm chất đó trong `achievedQualityId`." },
    { id: 'ai_17', text: "Quy tắc Vật Phẩm BẤT BIẾN: Khi trả về `newItem`, bạn chỉ có hai lựa chọn: 1. Chọn một vật phẩm TỒN TẠI trong danh sách Thiên Thư và sao chép chính xác thông tin của nó. 2. Tạo một vật phẩm CỐT TRUYỆN MỚI với category BẮT BUỘC là 'Nhiệm vụ'. TUYỆT ĐỐI KHÔNG được tự bịa ra bất kỳ vật phẩm, trang bị, pháp bảo, hay công pháp nào khác ngoài hai trường hợp này." },
    { id: 'ai_18', text: "Bối cảnh Địa Lý: Mọi sự kiện xảy ra PHẢI diễn ra tại địa điểm hiện tại của người chơi (`geographicalContext`). Bối cảnh này được cung cấp dưới dạng một đường dẫn phân cấp (ví dụ: 'Đại Vực > Châu Lục > Khu Vực'). Hãy sử dụng mô tả của tất cả các cấp trong đường dẫn để tạo ra các sự kiện và tường thuật phù hợp. Việc di chuyển đến một địa điểm khác là một hành động quan trọng và PHẢI được phản ánh trong `newLocationId`." },
    { id: 'ai_19', text: "Quan Hệ Thế Lực & Tính Cách NPC: Khi tạo sự kiện, nhiệm vụ, hoặc lời thoại, BẮT BUỘC phải dựa trên mối quan hệ đã được định nghĩa giữa các thế lực (Đồng minh, Thân thiện, Thù địch...). Đồng minh nên giúp đỡ, thù địch nên gây xung đột. Thái độ của NPC PHẢI phản ánh mối quan hệ của môn phái họ VÀ tính cách cá nhân của họ ('ôn hòa', 'hiếu chiến'...)." },
    { id: 'ai_20', text: "Thái Độ Cá Nhân Của NPC: Thông tin về các NPC có mặt tại hiện trường sẽ được cung cấp, bao gồm thái độ của họ đối với người chơi (`attitudeTowardsPC`). Con số này là thước đo tình cảm cá nhân, VƯỢT LÊN TRÊN quan hệ phe phái. Một NPC từ phe thù địch nhưng có `attitudeTowardsPC` > 0 (ví dụ, do được người chơi cứu) có thể hành động trung lập hoặc thậm chí giúp đỡ một cách kín đáo. Ngược lại, một NPC cùng phe nhưng có `attitudeTowardsPC` < 0 (ví dụ, do người chơi làm hại họ) có thể ngấm ngầm cản trở. Lời thoại và hành động của NPC PHẢI phản ánh sự phức tạp này. `attitudeTowardsPC` > 50 là rất thân thiện, < -50 là rất thù địch." },
    { id: 'ai_21', text: "QUẢN LÝ KHÁM PHÁ: Khi câu chuyện của bạn lần đầu tiên đề cập đến một địa điểm, môn phái, hoặc NPC mới mà chưa có trong danh sách 'discoveredEntityIds', bạn BẮT BUỘC phải thêm ID của chúng vào trường `newlyDiscoveredIds`. **QUAN TRỌNG VỀ ĐỊA ĐIỂM:** Nếu bạn khám phá một địa điểm (`locations`), bạn PHẢI khám phá cả chuỗi địa điểm cha của nó. Ví dụ: nếu câu chuyện đề cập đến 'Thôn A' (ID: thon_a, parentId: huyen_b), và 'Huyện B' chưa được khám phá, bạn phải trả về cả ID 'thon_a' VÀ ID 'huyen_b' trong `newlyDiscoveredIds.locations`. Luôn kiểm tra `worldStructure` để tìm `parentId` và đảm bảo toàn bộ cây phả hệ được khám phá. ID phải lấy từ `worldStructure`, `allSectsInWorld`, và `allNpcsInWorld` được cung cấp trong context." },
    { id: 'ai_22', text: "Khi người chơi trong môn phái yêu cầu một nhiệm vụ ('Xin nhận nhiệm vụ'), hãy tạo một nhiệm vụ mới thuộc loại 'Môn phái'. Độ khó, mục tiêu và phần thưởng của nhiệm vụ PHẢI phù hợp với chức vụ của người chơi (`player.sectRank`), các cơ sở vật chất hiện có của môn phái (`sect.facilities`), và mục tiêu chung/phe phái của môn phái. Ví dụ: một đệ tử cấp thấp trong môn phái có Dược Viên cấp 1 có thể được giao nhiệm vụ thu thập thảo dược thông thường." },
    { id: 'ai_23', text: "Khi người chơi quyên góp một vật phẩm ('Quyên góp [tên vật phẩm]'), hãy tính toán và trao thưởng điểm cống hiến (`sectContributionChange`). Giá trị điểm phải dựa trên phẩm chất (rank) và độ hiếm của vật phẩm. Vật phẩm thông thường (rank 1-2) cho ít điểm (1-10), trong khi vật phẩm hiếm (rank 4+) cho nhiều điểm (50+). Mô tả giao dịch này trong `outcomeDescription`." },
    { id: 'ai_24', text: "Liên tục theo dõi điểm cống hiến của người chơi (`sectContribution`). Khi nó vượt qua `contributionRequired` cho chức vụ tiếp theo trong hệ thống cấp bậc của môn phái, hãy tạo ra một `nextEvent` đặc biệt để kích hoạt một thử thách hoặc buổi lễ thăng chức. Nếu người chơi thành công trong sự kiện đó, `ActionOutcome` phải cập nhật `player.sectRank` thành tên chức vụ mới." }
];

export const FULL_CONTEXT_REFRESH_CYCLE = 5;

// FIX: Replaced `Sect` with `InitialSect` to align with updated type definitions.
export const SECTS: InitialSect[] = [
    {
        id: 'thanh_van_mon',
        name: 'Thanh Vân Môn',
        alignment: 'Chính Đạo',
        description: 'Một trong những chính đạo đứng đầu thiên hạ, lấy việc trảm yêu trừ ma làm nhiệm vụ. Công pháp chính trực, quang minh chính đại.',
        joinRequirement: 'Danh vọng Chính Đạo > 20 và không phải Ma tu.',
        benefits: ['Mở khóa nhiệm vụ và cửa hàng môn phái.', 'Tăng hiệu quả khi đối đầu với yêu ma.'],
        ranks: [],
        facilities: [],
        treasury: {}
    },
    {
        id: 'hop_hoan_phai',
        name: 'Hợp Hoan Phái',
        alignment: 'Ma Đạo',
        description: 'Môn phái ma đạo nổi tiếng với các công pháp song tu, hành sự không theo lẽ thường, vừa chính vừa tà.',
        joinRequirement: 'Danh vọng Ma Đạo > 20 hoặc vượt qua thử thách đặc biệt.',
        benefits: ['Mở khóa công pháp và nhiệm vụ độc quyền.', 'Có lợi thế trong giao tiếp và thuyết phục.'],
        ranks: [],
        facilities: [],
        treasury: {}
    },
    {
        id: 'thien_co_cac',
        name: 'Thiên Cơ Các',
        alignment: 'Trung Lập',
        description: 'Tổ chức thần bí nắm giữ tri thức và bí mật của thiên hạ. Họ không can dự vào tranh chấp Chính - Ma, chỉ theo đuổi Thiên Đạo.',
        joinRequirement: 'Cần có cơ duyên đặc biệt để tìm thấy và được chấp nhận.',
        benefits: ['Tiếp cận các công thức luyện đan, luyện khí hiếm.', 'Dễ dàng nhận biết các kỳ ngộ và bí cảnh.'],
        ranks: [],
        facilities: [],
        treasury: {}
    },
];

export const BOARD_SIZE = 36;

// Helper constants for Minor Realms
const STANDARD_3_MINOR_REALMS: Omit<MinorRealm, 'id'>[] = [
    { rank: 1, name: "Sơ Kỳ", description: "Vừa đột phá, cảnh giới chưa ổn định.", isHidden: false },
    { rank: 2, name: "Trung Kỳ", description: "Cảnh giới vững chắc, thực lực tăng tiến.", isHidden: false },
    { rank: 3, name: "Hậu Kỳ", description: "Tu vi hùng hậu, sắp chạm đến bình cảnh.", isHidden: false },
];

const STANDARD_4_MINOR_REALMS_DV: Omit<MinorRealm, 'id'>[] = [
    ...STANDARD_3_MINOR_REALMS,
    { rank: 4, name: "Đại Viên Mãn", description: "Cảnh giới hoàn mỹ, sẵn sàng cho lần đột phá tiếp theo.", isHidden: false },
];

const kimDanQualities: Omit<RealmQuality, 'id' | 'description' | 'condition' | 'statBonusMultiplier' | 'lifespanBonus'>[] = [
    { rank: 1, name: 'Cửu Phẩm' }, { rank: 2, name: 'Bát Phẩm' }, { rank: 3, name: 'Thất Phẩm' },
    { rank: 4, name: 'Lục Phẩm' }, { rank: 5, name: 'Ngũ Phẩm' }, { rank: 6, name: 'Tứ Phẩm' },
    { rank: 7, name: 'Tam Phẩm' }, { rank: 8, name: 'Nhị Phẩm' }, { rank: 9, name: 'Nhất Phẩm' }
];

// TIÊN NGHỊCH CULTIVATION SYSTEM
export const CULTIVATION_SYSTEM: CultivationTier[] = [
    {
        id: 'tiennghich_tier_1',
        name: 'Bước Thứ Nhất: Sơ Nhập Tiên Đồ',
        rank: 1,
        realms: [
            {
                id: 'tn_realm_1', rank: 1, name: "Ngưng Khí", baseLifespan: 100, description: "Hấp thụ linh khí trời đất, bước những bước đầu tiên trên con đường tu tiên.", hasQualities: false,
                minorRealms: Array.from({ length: 15 }, (_, i) => ({
                    id: `tn_realm_1_minor_${i + 1}`, rank: i + 1, name: `Tầng ${i + 1}`,
                    description: `Tầng ${i + 1} của Ngưng Khí Kỳ.`, isHidden: false
                })),
            },
            {
                id: 'tn_realm_2', rank: 2, name: "Trúc Cơ", baseLifespan: 200, description: "Linh khí hóa lỏng, thần thức mở rộng, chính thức thoát ly phàm tục.", hasQualities: true,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `tn_realm_2_minor_${i+1}` })),
                qualities: [
                    { id: 'trucco_q_1', rank: 1, name: 'Nhân Đạo Trúc Cơ', description: 'Trúc Cơ thành công nhưng nền tảng không vững, tiềm năng có hạn.', condition: 'Vượt qua thiên kiếp một cách miễn cưỡng.', statBonusMultiplier: 1.0, lifespanBonus: 0 },
                    { id: 'trucco_q_2', rank: 2, name: 'Địa Đạo Trúc Cơ', description: 'Trúc Cơ vững chắc, đạo cơ ổn định, tiềm năng khá.', condition: 'Có sự chuẩn bị tốt và vượt qua thiên kiếp một cách vững vàng.', statBonusMultiplier: 1.2, lifespanBonus: 50 },
                    { id: 'trucco_q_3', rank: 3, name: 'Thiên Đạo Trúc Cơ', description: 'Trúc Cơ hoàn mỹ, được thiên địa thừa nhận, tiềm năng vô hạn.', condition: 'Có đại cơ duyên, sự chuẩn bị hoàn hảo và vượt qua thiên kiếp một cách xuất sắc.', statBonusMultiplier: 1.5, lifespanBonus: 100 },
                ]
            },
            {
                id: 'tn_realm_3', rank: 3, name: "Kết Đan", baseLifespan: 400, description: "Linh khí hóa lỏng ngưng tụ thành kim đan, pháp lực hùng hậu.", hasQualities: true,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `tn_realm_3_minor_${i+1}` })),
                qualities: kimDanQualities.map(q => ({
                    id: `ketdan_q_${q.rank}`,
                    rank: q.rank,
                    name: `${q.name} Kim Đan`,
                    description: `Kim đan phẩm chất ${q.name}, phẩm chất càng cao, tiềm năng càng lớn.`,
                    condition: 'Chất lượng kim đan phụ thuộc vào công pháp, tài liệu và quá trình kết đan.',
                    statBonusMultiplier: 1.0 + ((q.rank - 1) * 0.125), // Scales from 1.0 to 2.0
                    lifespanBonus: (q.rank - 1) * 25, // Scales from 0 to 200
                }))
            },
            {
                id: 'tn_realm_4', rank: 4, name: "Nguyên Anh", baseLifespan: 800, description: "Kim đan vỡ, Nguyên Anh sinh. Từ đây có thể đoạt xá trùng sinh, thần thông quảng đại.", hasQualities: false,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `tn_realm_4_minor_${i+1}` })),
            },
            {
                id: 'tn_realm_5', rank: 5, name: "Hóa Thần", baseLifespan: 1500, description: "Nguyên Anh hòa cùng trời đất, cảm ngộ quy tắc, thần du thái hư.", hasQualities: false,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `tn_realm_5_minor_${i+1}` })),
            },
             {
                id: 'tn_realm_6', rank: 6, name: "Anh Biến", baseLifespan: 3000, description: "Nguyên Anh phát sinh biến dị, sức mạnh tăng vọt, bắt đầu chạm đến cánh cửa của thiên địa.", hasQualities: false,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `tn_realm_6_minor_${i+1}` })),
            },
             {
                id: 'tn_realm_7', rank: 7, name: "Vấn Đỉnh", baseLifespan: 5000, description: "Hỏi đỉnh thiên địa, tu vi đạt đến đỉnh cao của Bước Thứ Nhất, một bước có thể thành tiên.", hasQualities: false,
                minorRealms: STANDARD_4_MINOR_REALMS_DV.map((mr, i) => ({ ...mr, id: `tn_realm_7_minor_${i+1}` })),
            },
        ]
    },
    {
        id: 'tiennghich_tier_2',
        name: 'Bước Thứ Hai: Vấn Đạo Chân Tiên',
        rank: 2,
        realms: [
            {
                id: 'tn_realm_8', rank: 8, name: "Âm Hư & Dương Thực", baseLifespan: 10000, description: "Phá vỡ ranh giới hư và thực, bắt đầu lĩnh ngộ đạo của chính mình.", hasQualities: false,
                minorRealms: [
                     { id: 'tn_realm_8_minor_1', rank: 1, name: "Khuy Niết", description: "Sơ窥Niết槃, bắt đầu nhìn thấy bản chất của thiên địa.", isHidden: false },
                     { id: 'tn_realm_8_minor_2', rank: 2, name: "Tịnh Niết", description: "淨Niết槃, gột rửa bản thân, củng cố đạo tâm.", isHidden: false },
                     { id: 'tn_realm_8_minor_3', rank: 3, name: "Toái Niết", description: "碎Niết槃, phá vỡ tất cả để tái sinh, tìm kiếm con đường của riêng mình.", isHidden: false },
                ]
            },
            {
                id: 'tn_realm_9', rank: 9, name: "Toái Niết Đại Viên Mãn", baseLifespan: 20000, description: "Đỉnh cao của Bước Thứ Hai, chuẩn bị cho con đường hướng đến Đại Năng.", hasQualities: false,
                minorRealms: [
                    { id: 'tn_realm_9_minor_1', rank: 1, name: "Thiên Nhân Đệ Nhất Suy", description: "Đối mặt với sự suy vong đầu tiên của thiên địa.", isHidden: false },
                    { id: 'tn_realm_9_minor_2', rank: 2, name: "Thiên Nhân Đệ Nhị Suy", description: "Đối mặt với sự suy vong thứ hai của thiên địa.", isHidden: false },
                    { id: 'tn_realm_9_minor_3', rank: 3, name: "Thiên Nhân Đệ Tam Suy", description: "Đối mặt với sự suy vong thứ ba của thiên địa.", isHidden: false },
                    { id: 'tn_realm_9_minor_4', rank: 4, name: "Thiên Nhân Đệ Tứ Suy", description: "Đối mặt với sự suy vong thứ tư của thiên địa.", isHidden: false },
                    { id: 'tn_realm_9_minor_5', rank: 5, name: "Thiên Nhân Đệ Ngũ Suy", description: "Đối mặt với sự suy vong cuối cùng của thiên địa.", isHidden: false },
                ]
            },
        ]
    },
    {
        id: 'tiennghich_tier_3',
        name: 'Bước Thứ Ba: Siêu Thoát Thiên Địa',
        rank: 3,
        realms: [
            {
                id: 'tn_realm_10', rank: 10, name: "Không Cảnh", baseLifespan: 100000, description: "Lĩnh ngộ sức mạnh của không gian và thời gian, trở thành Đại Năng một phương.", hasQualities: false,
                minorRealms: [
                     { id: 'tn_realm_10_minor_1', rank: 1, name: "Không Niết", description: "Vượt qua Toái Niết, bước vào cảnh giới không gian.", isHidden: false },
                     { id: 'tn_realm_10_minor_2', rank: 2, name: "Không Linh", description: "Thấu hiểu linh hồn của không gian.", isHidden: false },
                     { id: 'tn_realm_10_minor_3', rank: 3, name: "Không Huyền", description: "Nắm giữ sự huyền ảo của không gian, có thể tự tạo ra tiểu thế giới.", isHidden: false },
                     { id: 'tn_realm_10_minor_4', rank: 4, name: "Không Kiếp", description: "Đối mặt với kiếp nạn của không gian, vượt qua sẽ là đỉnh cao.", isHidden: false },
                ]
            },
             {
                id: 'tn_realm_11', rank: 11, name: "Huyền Kiếp Cửu Biến", baseLifespan: 500000, description: "Mỗi một kiếp là một lần lột xác, một lần đến gần hơn với Đạo.", hasQualities: false,
                minorRealms: Array.from({ length: 9 }, (_, i) => ({
                    id: `tn_realm_11_minor_${i + 1}`, rank: i + 1, name: `Đệ ${['Nhất', 'Nhị', 'Tam', 'Tứ', 'Ngũ', 'Lục', 'Thất', 'Bát', 'Cửu'][i]} Kiếp`,
                    description: `Vượt qua kiếp nạn thứ ${i + 1}.`, isHidden: false
                })),
            },
        ]
    },
    {
        id: 'tiennghich_tier_4',
        name: 'Bước Thứ Tư: Đạp Thiên Chi Lộ',
        rank: 4,
        realms: [
            {
                id: 'tn_realm_12', rank: 12, name: "Đạp Thiên Cảnh", baseLifespan: -1, description: "Bước lên cây cầu Đạp Thiên, siêu thoát khỏi mọi quy tắc, trở thành tồn tại tối cao.", hasQualities: false,
                minorRealms: [
                    ...Array.from({ length: 9 }, (_, i) => ({
                        id: `tn_realm_12_minor_${i + 1}`, rank: i + 1, name: `Đạp Thiên Đệ ${['Nhất', 'Nhị', 'Tam', 'Tứ', 'Ngũ', 'Lục', 'Thất', 'Bát', 'Cửu'][i]} Kiều`,
                        description: `Bước lên cây cầu Đạp Thiên thứ ${i + 1}.`, isHidden: false
                    })),
                    { id: 'tn_realm_12_minor_10', rank: 10, name: "Đạp Thiên Cảnh", description: "Thành công bước qua 9 cây cầu, đạt đến cảnh giới trong truyền thuyết.", isHidden: false },
                ]
            }
        ]
    }
];

export const WORLD_PHASE_NAMES = [
    "Hồng Hoang Sơ Khai",
    "Thượng Cổ Tiên Chiến",
    "Thiên Địa Tịch Diệt",
    "Linh Khí Khô Kiệt",
    "Vạn Pháp Quy Tông",
];

export const INITIAL_RECIPES: Recipe[] = [
    {
        id: 'recipe_1',
        name: "Hồi Linh Tán",
        description: "Linh dược cơ bản, giúp phục hồi một lượng nhỏ linh lực.",
        required: [ { itemId: 'linh_thao_1', name: "Linh Tâm Thảo", quantity: 2 } ],
        result: { name: "Hồi Linh Tán", category: "Linh dược" }
    }
];

export const PLAYER_ATTRIBUTE_NAMES: Record<keyof PlayerAttributes, string> = {
    physicalStrength: 'Sức mạnh vật lý',
    magicPower: 'Sức mạnh phép thuật',
    bodyStrength: 'Sức mạnh nhục thân',
    defense: 'Phòng thủ',
    agility: 'Thân pháp',
    spiritualSense: 'Thần thức',
    aptitude: 'Căn cốt',
    critChance: 'Tỉ lệ bạo kích',
    critDamage: 'Sát thương bạo kích',
};

export const ALL_STAT_NAMES: Record<string, string> = {
    ...PLAYER_ATTRIBUTE_NAMES,
    maxHp: 'Sinh lực tối đa',
    maxSpiritPower: 'Linh lực tối đa',
    maxMentalState: 'Tâm cảnh tối đa',
    maxStamina: 'Thể lực tối đa',
    lifespan: 'Tuổi thọ',
};