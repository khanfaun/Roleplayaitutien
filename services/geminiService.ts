import { GoogleGenAI, Type } from "@google/genai";
import type { Player, BoardSquare, Quest, Item, CurrentEvent, ActionOutcome, CombatState, CombatTurnOutcome, CombatLoot, WorldPhase, Recipe, DongPhuState, GameState, HeThongQuest, ScenarioData, InitialItem, InitialCongPhap, InitialNpc, InitialSect, InitialLocation, PlayerAttributes, NguHanhType, ScenarioStage, MajorRealm, MinorRealm, RealmQuality, CultivationTier, ThienThuData, InitialProvince, InitialWorldRegion } from '../types';
import { BOARD_SIZE, PLAYER_ATTRIBUTE_NAMES } from "../constants";

let ai: GoogleGenAI | null = null;
const model = 'gemini-2.5-flash';

export function initializeGemini(apiKey: string) {
    ai = new GoogleGenAI({ apiKey });
}

export function clearGemini() {
    ai = null;
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) return false;
    const tempAi = new GoogleGenAI({ apiKey });
    try {
        // Thực hiện một cuộc gọi API rất nhẹ để xác thực key
        await tempAi.models.generateContent({
            model: model,
            contents: 'validate', // Một prompt ngắn gọn, không quan trọng nội dung
             config: {
                thinkingConfig: { thinkingBudget: 0 } // Tắt thinking để có kết quả nhanh nhất và rẻ nhất
            },
        });
        return true;
    } catch (error) {
        console.error("API Key validation failed:", error);
        // Lỗi thường là 400 hoặc 403 nếu key không hợp lệ
        return false;
    }
}


const systemInstruction = `Bạn là một AI Quản Trò (Game Master) cho game tu tiên 'Tiên Lộ Mênh Mông'. Nhiệm vụ của bạn là dệt nên một câu chuyện liền mạch, logic và hấp dẫn dựa trên bối cảnh toàn diện của người chơi.

**NGUYÊN TẮC HOẠT ĐỘNG CỐT LÕI (BẤT BIẾN):**
1.  **ƯU TIÊN TUYỆT ĐỐI**: Các quy tắc ('coreMemoryRules', 'aiRules', 'thienDaoRules') được cung cấp trong từng prompt có độ ưu tiên cao nhất. Bạn PHẢI tuân thủ chúng trước mọi hướng dẫn khác trong đây.
2.  **LOGIC BỐI CẢNH**: Mọi kết quả bạn tạo ra PHẢI logic và phù hợp với 'context' được cung cấp.
3.  **NHẤT QUÁN & CẤU TRÚC**: Luôn tuân thủ nghiêm ngặt schema JSON được yêu cầu. Khi nhiệm vụ hoàn thành/thất bại, chỉ cần cập nhật trạng thái trong 'questUpdates' hoặc 'heThongQuestUpdates'.
4.  **THỜI GIAN**: Trường 'daysToAdvance' không còn được sử dụng. Luôn trả về giá trị 0.`;

const boardSquareSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.INTEGER },
        type: { type: Type.STRING, enum: ['Sự kiện', 'May mắn', 'Xui xẻo', 'Cột mốc', 'Kỳ Ngộ', 'Tâm Ma', 'Nhân Quả', 'Thiên Cơ', 'Thử Luyện', 'Bế Quan', 'Hồng Trần', 'Linh Mạch', 'Pháp Bảo', 'Giao Dịch', 'Ô Trống', 'Tai Ương', 'Khởi đầu'] },
        description: { type: Type.STRING, description: "Tên của sự kiện định mệnh, ví dụ: 'Kỳ Duyên Hiếm Có', 'Tâm Ma Thí Luyện', 'Nhân Quả Tái Ngộ', 'Vận Rủi Bất Chợt'." },
    },
    required: ['id', 'type', 'description']
};

const itemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID độc nhất, ví dụ: 'linh_thach_ha_pham'" },
        name: { type: Type.STRING, description: "Tên vật phẩm, ví dụ: 'Linh Thạch Hạ Phẩm'" },
        description: { type: Type.STRING },
        category: { type: Type.STRING, enum: ['Vật phẩm', 'Trang bị', 'Nhiệm vụ', 'Công pháp', 'Pháp bảo', 'Linh dược', 'Khoáng thạch', 'Vật phẩm Hệ thống'] }
    },
    required: ['id', 'name', 'description', 'category']
};

const reputationChangeSchema = {
    type: Type.ARRAY,
    nullable: true,
    items: {
        type: Type.OBJECT,
        properties: {
            faction: { type: Type.STRING },
            change: { type: Type.NUMBER }
        },
        required: ['faction', 'change']
    }
};

const questRewardSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "Mô tả phần thưởng nhận được." },
        expChange: { type: Type.NUMBER, nullable: true },
        items: { type: Type.ARRAY, items: itemSchema, nullable: true },
        reputationChange: reputationChangeSchema,
        sectContributionChange: { type: Type.NUMBER, nullable: true }
    },
    required: ['description']
};

const questPenaltySchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "Mô tả hình phạt phải chịu." },
        hpChange: { type: Type.NUMBER, nullable: true, description: "Lượng HP mất, phải là số âm." },
        mentalStateChange: { type: Type.NUMBER, nullable: true, description: "Lượng Tâm Cảnh mất, phải là số âm." },
        reputationChange: reputationChangeSchema
    },
    required: ['description']
};


const questSchemaWithId = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['Cốt truyện', 'Phụ', 'Môn phái'] },
        timeLimit: { type: Type.INTEGER, nullable: true, description: "Số lượt để hoàn thành. Null nếu không có giới hạn. Nếu có giá trị, PHẢI >= 3." },
        progress: { type: Type.INTEGER, nullable: true },
        target: { type: Type.INTEGER, nullable: true },
        completionCondition: { type: Type.STRING, description: "Điều kiện hoàn thành bằng ngôn ngữ tự nhiên. Ví dụ: 'Thu thập 5 Linh Tâm Thảo'."},
        rewards: { ...questRewardSchema, nullable: false, description: "Phần thưởng khi hoàn thành. Bắt buộc phải có." },
        penalties: { ...questPenaltySchema, nullable: true, description: "Hình phạt khi thất bại. Có thể có, đặc biệt với nhiệm vụ có thời gian." }
    },
    required: ['id', 'title', 'description', 'type', 'completionCondition', 'rewards']
};

const { id, ...questPropertiesWithoutId } = questSchemaWithId.properties;

const questSchemaWithoutId = {
    type: questSchemaWithId.type,
    properties: questPropertiesWithoutId,
    required: questSchemaWithId.required.filter(p => p !== 'id'),
};

const heThongQuestRewardSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING },
        heThongPoints: { type: Type.INTEGER, nullable: true },
        items: { type: Type.ARRAY, items: itemSchema, nullable: true }
    },
    required: ['description']
};

const heThongQuestPenaltySchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING },
        hpChange: { type: Type.INTEGER, nullable: true, description: "Phải là số âm" },
        heThongPointsChange: { type: Type.INTEGER, nullable: true, description: "Phải là số âm" }
    },
    required: ['description']
};

const heThongQuestSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['Bình thường', 'Sự kiện đặc biệt', 'Nhiệm vụ tối thượng'], description: "Phân loại nhiệm vụ." },
        rewards: { ...heThongQuestRewardSchema, nullable: false },
        penalties: { ...heThongQuestPenaltySchema, nullable: true },
        timeLimit: { type: Type.INTEGER, nullable: true, description: "Số lượt. Nếu là 'Bình thường', PHẢI >= 3. Nếu là 'Sự kiện đặc biệt', PHẢI >= 20. Nếu là 'Nhiệm vụ tối thượng', PHẢI là null." },
        hiddenObjective: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
                description: { type: Type.STRING, description: "Mô tả mục tiêu ẩn." },
                condition: { type: Type.STRING, description: "Điều kiện hoàn thành mục tiêu ẩn bằng ngôn ngữ tự nhiên." },
                rewards: { ...heThongQuestRewardSchema, nullable: false, description: "Phần thưởng khi hoàn thành mục tiêu ẩn." },
            },
            required: ['description', 'condition', 'rewards']
        },
    },
    required: ['title', 'description', 'type', 'rewards']
};


const recipeSchema = {
     type: Type.OBJECT,
     properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        required: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    itemId: { type: Type.STRING },
                    name: { type: Type.STRING },
                    quantity: { type: Type.INTEGER }
                },
                required: ['itemId', 'name', 'quantity']
            }
        },
        result: {
             type: Type.OBJECT,
             properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING, enum: ['Vật phẩm', 'Trang bị', 'Nhiệm vụ', 'Công pháp', 'Pháp bảo', 'Linh dược', 'Khoáng thạch', 'Vật phẩm Hệ thống'] }
             },
             required: ['name', 'category']
        }
     },
     required: ['id', 'name', 'description', 'required', 'result']
};

const currentEventSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "Mô tả sự kiện hiện tại." },
        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mảng chứa chính xác 4 lựa chọn cho người chơi. Mỗi lựa chọn PHẢI có mô tả rủi ro/cơ hội trong ngoặc đơn `()`." }
    },
    required: ['description', 'options']
};

const playerAttributeChangesSchema = {
    type: Type.OBJECT,
    nullable: true,
    properties: {
        physicalStrength: { type: Type.NUMBER, nullable: true },
        magicPower: { type: Type.NUMBER, nullable: true },
        bodyStrength: { type: Type.NUMBER, nullable: true },
        defense: { type: Type.NUMBER, nullable: true },
        agility: { type: Type.NUMBER, nullable: true },
        spiritualSense: { type: Type.NUMBER, nullable: true },
        aptitude: { type: Type.NUMBER, nullable: true },
        critChance: { type: Type.NUMBER, nullable: true },
        critDamage: { type: Type.NUMBER, nullable: true },
    }
};

const actionOutcomeSchema = {
    type: Type.OBJECT,
    properties: {
        outcomeDescription: { type: Type.STRING, description: "BẮT BUỘC. Viết một đoạn văn tường thuật chi tiết, hấp dẫn để mô tả kết quả hành động của người chơi. Đây là phần CỐT LÕI của câu chuyện." },
        hpChange: { type: Type.NUMBER, description: "Lượng HP thay đổi." },
        expChange: { type: Type.NUMBER, description: "Lượng kinh nghiệm nhận được." },
        spiritPowerChange: { type: Type.NUMBER, description: "Lượng linh lực thay đổi." },
        staminaChange: { type: Type.NUMBER, description: "Số Thể Lực thay đổi (bắt buộc). Âm khi tiêu hao, dương khi phục hồi." },
        mentalStateChange: { type: Type.NUMBER, description: "Số Tâm Cảnh thay đổi (bắt buộc, âm hoặc dương)." },
        daysToAdvance: { type: Type.INTEGER, description: "Giá trị này không còn được sử dụng. Luôn trả về 0." },
        journalEntry: { type: Type.STRING, nullable: false, description: "BẮT BUỘC. Từ 'outcomeDescription' bạn vừa viết, hãy tạo một chuỗi tóm tắt RẤT NGẮN GỌN (5-50 từ). CHỈ ghi nhận sự kiện chính, không mô tả cảnh vật hay cảm xúc lan man." },
        newItem: { ...itemSchema, nullable: true },
        newRecipe: { ...recipeSchema, nullable: true },
        newQuest: { ...questSchemaWithoutId, nullable: true },
        questUpdates: {
            type: Type.ARRAY,
            nullable: true,
            description: "Cập nhật cho các nhiệm vụ đang tiến hành.",
            items: {
                type: Type.OBJECT,
                properties: {
                    questId: { type: Type.STRING, description: "ID của nhiệm vụ cần cập nhật." },
                    newStatus: { type: Type.STRING, enum: ['Hoàn thành', 'Thất bại'], nullable: true, description: "Thay đổi trạng thái của nhiệm vụ." },
                    progressChange: { type: Type.INTEGER, nullable: true, description: "Số lượng tiến trình tăng thêm (ví dụ: +1 khi giết quái)." }
                },
                required: ['questId']
            }
        },
        reputationChange: {
            ...reputationChangeSchema,
            description: "Một mảng chứa các đối tượng thay đổi danh vọng. Ví dụ: [{'faction': 'Chính Đạo', 'change': 10}]",
        },
        attributeChanges: playerAttributeChangesSchema,
        sectContributionChange: { type: Type.NUMBER, nullable: true },
        diceRollsChange: { type: Type.NUMBER, nullable: true },
        joinSect: { type: Type.STRING, nullable: true, description: "Tên môn phái người chơi gia nhập." },
        combatTrigger: {
            type: Type.OBJECT,
            properties: {
                enemyName: { type: Type.STRING },
                enemyHp: { type: Type.NUMBER },
                enemyDescription: { type: Type.STRING },
            },
            required: ['enemyName', 'enemyHp', 'enemyDescription'],
            nullable: true
        },
        nextEvent: {
            ...currentEventSchema,
            nullable: true,
            description: "Sự kiện tiếp theo. BẮT BUỘC phải có, nó phải tuân theo quy tắc tạo gợi ý (4 lựa chọn chi tiết)."
        },
        // He Thong fields
        awakenHeThong: { type: Type.BOOLEAN, nullable: true },
        heThongPointsChange: { type: Type.INTEGER, nullable: true },
        newHeThongQuest: { ...heThongQuestSchema, nullable: true },
        heThongQuestUpdates: {
            type: Type.ARRAY,
            nullable: true,
            items: {
                type: Type.OBJECT,
                properties: {
                    questId: { type: Type.STRING },
                    newStatus: { type: Type.STRING, enum: ['Hoàn thành', 'Thất bại'], nullable: true },
                    hiddenObjectiveCompleted: { type: Type.BOOLEAN, nullable: true, description: "True nếu hành động này hoàn thành mục tiêu ẩn." },
                },
                required: ['questId']
            }
        },
        tribulationOutcome: {
            type: Type.OBJECT,
            nullable: true,
            description: "Kết quả của một sự kiện Thiên Kiếp. Chỉ điền vào nếu đang ở trong sự kiện Thiên Kiếp.",
            properties: {
                success: { type: Type.BOOLEAN, description: "True nếu đột phá thành công, false nếu thất bại." },
                nextStageId: { type: Type.STRING, nullable: true, description: "ID của tiểu cảnh giới mới nếu đột phá thành công. Phải là null nếu thất bại." },
                achievedQualityId: { type: Type.STRING, nullable: true, description: "ID của Phẩm chất đạt được (nếu có)." }
            },
            required: ['success']
        },
        activateThienMenhBan: { type: Type.BOOLEAN, nullable: true, description: "Đặt là true để kích hoạt và hiển thị Thiên Mệnh Bàn cho người chơi." },
        newStatusEffects: {
            type: Type.ARRAY,
            nullable: true,
            description: "Thêm các trạng thái mới cho người chơi.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "ID của trạng thái từ danh sách định nghĩa sẵn. Ví dụ: 'poisoned'." },
                    duration: { type: Type.INTEGER, description: "Thời gian hiệu lực (số lượt)." }
                },
                required: ['id', 'duration']
            }
        },
        removeStatusEffectIds: {
            type: Type.ARRAY,
            nullable: true,
            description: "Gỡ bỏ các trạng thái đang có bằng ID của chúng.",
            items: { type: Type.STRING }
        },
        newLocationId: { type: Type.STRING, nullable: true, description: "ID của địa điểm mới mà người chơi di chuyển tới. Chỉ thay đổi khi có sự kiện di chuyển rõ ràng. Nếu không di chuyển, để là null." },
    },
    required: ['outcomeDescription', 'hpChange', 'expChange', 'spiritPowerChange', 'staminaChange', 'mentalStateChange', 'daysToAdvance', 'journalEntry']
};

const combatLootSchema = {
    type: Type.OBJECT,
    properties: {
        lootDescription: { type: Type.STRING },
        expChange: { type: Type.NUMBER },
        newItem: { ...itemSchema, nullable: true }
    },
    required: ['lootDescription', 'expChange']
};

const combatTurnOutcomeSchema = {
    type: Type.OBJECT,
    properties: {
        turnDescription: { type: Type.STRING },
        playerHpChange: { type: Type.NUMBER },
        enemyHpChange: { type: Type.NUMBER },
        playerStaminaChange: { type: Type.NUMBER, description: "Lượng thể lực người chơi thay đổi trong chiến đấu (thường là số âm)." },
        playerMentalStateChange: { type: Type.NUMBER, description: "Lượng tâm cảnh người chơi thay đổi trong chiến đấu." },
        isFleeSuccessful: { type: Type.BOOLEAN, nullable: true },
        loot: { ...combatLootSchema, nullable: true, description: "Phần thưởng nếu kẻ địch bị đánh bại trong lượt này." },
    },
    required: ['turnDescription', 'playerHpChange', 'enemyHpChange', 'playerStaminaChange', 'playerMentalStateChange']
};

const worldPhaseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        effects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['buff', 'debuff'] },
                    target: { type: Type.STRING, enum: ['world', 'board'], description: "'world' ảnh hưởng toàn cục, 'board' ảnh hưởng Thiên Mệnh Bàn." }
                },
                required: ['description', 'type', 'target']
            }
        }
    },
    required: ['name', 'description', 'effects']
};


const callGemini = async (prompt: string, schema: any) => {
    if (!ai) {
        throw new Error("Lỗi Cấu Hình API: Gemini client chưa được khởi tạo. Vui lòng cung cấp API Key.");
    }
    let jsonText = '';
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson;
    } catch (e) {
        console.error("Gemini API call failed or JSON parsing failed", e);
        if (jsonText) {
             console.error("--- RAW TEXT THAT FAILED PARSING ---");
             console.error(jsonText);
             console.error("------------------------------------");
        }
        throw new Error("Lỗi giao tiếp với Thiên Đạo. Xin hãy thử lại.");
    }
};

interface ScenarioResponse {
    story: string;
    board: BoardSquare[];
    initialQuest: Omit<Quest, 'status'>;
    initialEvent: CurrentEvent;
    worldPhase: WorldPhase;
    journalEntry: string;
}

const formatInitialElements = (data: ScenarioData) => {
    let result = "Dựa vào các yếu tố dưới đây để lồng ghép vào câu chuyện và trạng thái khởi đầu của người chơi.\n\n";

    const formatAttributes = (attributes?: Partial<PlayerAttributes>) => {
        if (!attributes || Object.keys(attributes).length === 0) return '';
        const parts = Object.entries(attributes)
            .map(([key, value]) => {
                const name = PLAYER_ATTRIBUTE_NAMES[key as keyof PlayerAttributes];
                return name ? `${name} +${value}` : null;
            })
            .filter(Boolean);
        return parts.length > 0 ? `Thuộc tính: ${parts.join(', ')}.` : '';
    };

    const formatSection = (title: string, items: any[], formatter: (item: any) => string) => {
        if (items.length > 0) {
            result += `**${title}:**\n${items.map(item => `- ${formatter(item)}`).join('\n')}\n\n`;
        }
    };

    formatSection("Vật Phẩm", data.initialItems, (item: InitialItem) =>
        `Tên: ${item.name}, Số lượng: ${item.quantity}, Loại: ${item.itemType}${item.consumableType ? ` (${item.consumableType})` : ''}. Mô tả: ${item.description}. ${formatAttributes(item.attributes)} ${item.effectIds?.length ? `Hiệu ứng: ${item.effectIds.join(', ')}.` : ''}`
    );
     formatSection("Trang Bị", data.initialTrangBi, (item: InitialItem) =>
        `Tên: ${item.name}, Số lượng: ${item.quantity}. Mô tả: ${item.description}. ${formatAttributes(item.attributes)} ${item.effectIds?.length ? `Hiệu ứng: ${item.effectIds.join(', ')}.` : ''}`
    );
    formatSection("Pháp Bảo", data.initialPhapBao, (item: InitialItem) =>
        `Tên: ${item.name}, Số lượng: ${item.quantity}. Mô tả: ${item.description}. ${formatAttributes(item.attributes)} ${item.effectIds?.length ? `Hiệu ứng: ${item.effectIds.join(', ')}.` : ''}`
    );
    formatSection("Công Pháp", data.initialCongPhap, (skill: InitialCongPhap) =>
        `Tên: ${skill.name}. Mô tả: ${skill.description}. ${formatAttributes(skill.attributes)} ${skill.effectIds?.length ? `Hiệu ứng: ${skill.effectIds.join(', ')}.` : ''}`
    );
    formatSection("NPC", data.initialNpcs, (npc: InitialNpc) =>
        `Tên: ${npc.name}. Mô tả: ${npc.description}. ${npc.relationship ? `Quan hệ: ${npc.relationship}.` : ''}`
    );
    formatSection("Môn Phái", data.initialSects, (sect: InitialSect) =>
        `Tên: ${sect.name}, Phe phái: ${sect.alignment}. Mô tả: ${sect.description}.`
    );
    
    // Updated to include world structure information
    const allLocations = [...data.initialLocations];
    const allProvinces = [...data.initialProvinces];
    const allWorldRegions = [...data.initialWorldRegions];
    
    if (allWorldRegions.length > 0) {
        result += `**Các Đại Vực:**\n${allWorldRegions.map(wr => `- ${wr.name}: ${wr.description}`).join('\n')}\n\n`;
    }
    if (allProvinces.length > 0) {
        result += `**Các Châu Lục:**\n${allProvinces.map(p => {
            const parentRegion = allWorldRegions.find(wr => wr.id === p.worldRegionId);
            return `- ${p.name} (thuộc ${parentRegion?.name || 'Đại Vực không xác định'}): ${p.description}`;
        }).join('\n')}\n\n`;
    }
     if (allLocations.length > 0) {
        result += `**Các Khu Vực:**\n${allLocations.map(l => {
            const parentProvince = allProvinces.find(p => p.id === l.provinceId);
            return `- ${l.name} (thuộc ${parentProvince?.name || 'Châu Lục không xác định'}): ${l.description}`;
        }).join('\n')}\n\n`;
    }


    return result.trim() === "Dựa vào các yếu tố dưới đây để lồng ghép vào câu chuyện và trạng thái khởi đầu của người chơi." ? "Không có yếu tố khởi đầu nào được chỉ định." : result;
};


export const generateScenario = async (setupData: ScenarioData): Promise<ScenarioResponse> => {
    const heThongRule = "Hệ thống (Bàn Tay Vàng) sẽ được kích hoạt bởi cơ chế game, không phải bởi một ô trên bàn cờ. Vì vậy, TUYỆT ĐỐI KHÔNG tạo ra ô 'Kỳ Ngộ' có tên 'Thiên Mệnh Thức Tỉnh' hoặc các sự kiện tương tự để kích hoạt Hệ Thống.";
    
    const adultContentRule = setupData.enableAdultContent
        ? "Bối cảnh có thể bao gồm các yếu tố trưởng thành, bạo lực và các quyết định đạo đức phức tạp."
        : "Giữ cho câu chuyện phù hợp với mọi lứa tuổi, tập trung vào yếu tố phiêu lưu và tu luyện.";

    const linhCanString = `${setupData.linhCanQuality} linh căn`;
    const nguHanhStrings = (Object.keys(setupData.nguHanh) as NguHanhType[])
        .filter(key => setupData.nguHanh[key] > 0)
        .map(key => `${key.charAt(0).toUpperCase() + key.slice(1)} (${setupData.nguHanh[key] * 20}%)`);
    const nguHanhString = nguHanhStrings.length > 0 ? nguHanhStrings.join(', ') : 'Không có';

    let difficultyInstruction = '';
    switch (setupData.difficulty) {
        case 'Dễ':
            difficultyInstruction = "Tạo ra một thế giới khởi đầu tương đối dễ dàng. Kẻ địch yếu hơn, tài nguyên phong phú hơn, các sự kiện may mắn xuất hiện thường xuyên hơn.";
            break;
        case 'Bình thường':
            difficultyInstruction = "Tạo ra một thế giới cân bằng về thử thách và cơ hội.";
            break;
        case 'Khó':
            difficultyInstruction = "Tạo ra một thế giới khắc nghiệt. Kẻ địch mạnh và thông minh hơn, tài nguyên khan hiếm, các sự kiện tai ương và thử thách xuất hiện thường xuyên hơn. Kỳ ngộ hiếm và nguy hiểm hơn.";
            break;
    }

    const startingLocation = setupData.startingLocationId
        ? setupData.initialLocations.find(loc => loc.id === setupData.startingLocationId)
        : null;
    
    let startingGeographicalContext = "Chưa được chỉ định. Bạn có quyền tự do quyết định nơi bắt đầu câu chuyện dựa trên tiểu sử và bối cảnh chung.";
    if(startingLocation) {
        const province = setupData.initialProvinces.find(p => p.id === startingLocation.provinceId);
        const worldRegion = province ? setupData.initialWorldRegions.find(wr => wr.id === province.worldRegionId) : null;
        startingGeographicalContext = `Câu chuyện PHẢI bắt đầu tại địa điểm sau:\n- **Đại Vực:** ${worldRegion?.name || 'Không xác định'}\n- **Châu Lục:** ${province?.name || 'Không xác định'}\n- **Khu Vực:** ${startingLocation.name}\nHãy mô tả bối cảnh ở đây một cách chi tiết trong đoạn truyện giới thiệu.`;
    }


    const prompt = `Tạo một kịch bản bắt đầu hoàn chỉnh cho người chơi, dựa trên các thông tin sau:

**THÔNG TIN NHÂN VẬT:**
- Tên: ${setupData.playerName}
- Tiểu sử: ${setupData.playerBiography}
- Mục tiêu: ${setupData.playerGoals}
- Linh Căn: ${linhCanString}
- Ngũ Hành: ${nguHanhString}
- Tùy chọn 18+: ${adultContentRule}
- Độ Khó Game: ${setupData.difficulty}. (${difficultyInstruction})
- Hệ Thống Cảnh Giới: ${JSON.stringify(setupData.cultivationSystem.flatMap(t => t.realms).map(r => r.name))}

**KỊCH BẢN:**
- Tóm tắt: ${setupData.scenarioSummary}
- 5 Giai Đoạn Cốt Truyện ĐẦU TIÊN (PHẢI tuân thủ trình tự):
${setupData.scenarioStages.slice(0, 5).map((stage, index) => `  - Giai đoạn ${index + 1}: ${stage.text}`).join('\n')}

**YẾU TỐ KHỞI ĐẦU:**
${formatInitialElements(setupData)}

**ĐỊA ĐIỂM KHỞI ĐẦU CỐT TRUYỆN:**
${startingGeographicalContext}

**YÊU CẦU TẠO GAME:**
1.  Dựa vào toàn bộ thông tin trên, viết một đoạn truyện giới thiệu ngắn gọn, hấp dẫn, lồng ghép các yếu tố khởi đầu một cách tự nhiên.
2.  Tạo một **Thiên Mệnh Bàn** (Destiny Board) ${BOARD_SIZE} ô. Ô đầu tiên (ID 0) PHẢI là loại 'Khởi đầu' với mô tả như 'Vòng lặp nhân sinh mới'. ${heThongRule} Các ô còn lại hãy phân bố ngẫu nhiên, tạo một bàn cờ khó khăn và đa dạng với nhiều ô 'Ô Trống' và 'Tai Ương', hạn chế lặp lại các ô đặc biệt khác. Đặt các ô Cột mốc ở các vị trí quan trọng. Lưu ý quan trọng: "description" của mỗi ô phải là tên của một biến cố vận mệnh, không phải tên một địa điểm.
3.  Tạo một nhiệm vụ ban đầu thuộc loại 'Cốt truyện'. Nhiệm vụ này **PHẢI** là bước khởi đầu cho **Giai đoạn 1** của cốt truyện đã cho. Phần thưởng và mô tả phải dựa trên các Yếu tố khởi đầu nếu có liên quan.
4.  Tạo một sự kiện ban đầu để người chơi bắt đầu hành trình. Sự kiện này PHẢI tuân thủ quy tắc tạo 4 gợi ý chi tiết.
5.  Tạo ra Giai Đoạn Thế Giới (World Phase) đầu tiên, tên là 'Hồng Hoang Sơ Khai', bao gồm mô tả và hiệu ứng của nó.
6.  Lưu ý: Thiên Mệnh Bàn sẽ bắt đầu ở trạng thái bị ẩn. Sự kiện và nhiệm vụ ban đầu không nên đề cập đến việc người chơi đang đứng trên bàn cờ hoặc lắc xúc xắc. AI sẽ kích hoạt nó sau thông qua diễn biến câu chuyện.
7.  **QUAN TRỌNG:** Từ đoạn truyện giới thiệu bạn vừa viết, hãy tạo một chuỗi 'journalEntry' tóm tắt RẤT NGẮN GỌN (5-50 từ) để làm nhật ký khởi đầu cho người chơi.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            story: { type: Type.STRING },
            board: { type: Type.ARRAY, items: boardSquareSchema },
            initialQuest: questSchemaWithId,
            initialEvent: currentEventSchema,
            worldPhase: worldPhaseSchema,
            journalEntry: { type: Type.STRING, description: "Tóm tắt RẤT NGẮN GỌN (5-50 từ) của 'story' để làm nhật ký đầu tiên." }
        },
        required: ['story', 'board', 'initialQuest', 'initialEvent', 'worldPhase', 'journalEntry']
    };

    return callGemini(prompt, schema);
};

export const generateNewBoard = async (player: Player, mapLevel: number): Promise<{story: string, board: BoardSquare[], newQuest: Omit<Quest, 'status' | 'id'>, initialEvent: CurrentEvent}> => {
    const prompt = `Người chơi '${player.name}' (tuổi ${player.age}, cấp ${player.level}, cảnh giới ${player.cultivationStage}) đã hoàn thành một vòng Thiên Mệnh Bàn và tiến vào một giai đoạn vận mệnh mới (cấp ${mapLevel}).
    Tạo một **Thiên Mệnh Bàn** mới với ${BOARD_SIZE} ô. Ô đầu tiên (ID 0) PHẢI là loại 'Khởi đầu' với mô tả như 'Vòng lặp nhân sinh mới' hoặc 'Điểm bắt đầu của vận mệnh'. Hãy tạo một bàn cờ **khó khăn và đa dạng hơn**. Sử dụng nhiều ô 'Ô Trống' (vô sự, không có gì xảy ra) và 'Tai Ương' (sự kiện tiêu cực nhỏ) để lấp đầy bàn cờ. Hạn chế lặp lại các loại ô đặc biệt như 'Kỳ Ngộ' hoặc 'Pháp Bảo' quá nhiều. Phân bố các ô một cách ngẫu nhiên. Đặt một ô 'Cột mốc' ở gần cuối bàn cờ. Lưu ý quan trọng: "description" của mỗi ô phải là tên của một biến cố vận mệnh, không phải tên một địa điểm.
    Tạo một nhiệm vụ chính mới (loại 'Cốt truyện') phù hợp với cấp độ và một sự kiện khởi đầu. Nhiệm vụ mới PHẢI có phần thưởng và KHÔNG cần ID. Nếu nhiệm vụ có thời hạn, thời hạn phải ít nhất là 3 lượt.
    Sự kiện khởi đầu PHẢI tuân thủ quy tắc tạo 4 gợi ý chi tiết.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            story: { type: Type.STRING },
            board: { type: Type.ARRAY, items: boardSquareSchema },
            newQuest: questSchemaWithoutId,
            initialEvent: currentEventSchema
        },
        required: ['story', 'board', 'newQuest', 'initialEvent']
    };
    return callGemini(prompt, schema);
};

export const generateEventForSquare = async (player: Player, square: BoardSquare, activeQuests: Quest[], worldPhase: WorldPhase | null, worldData: GameState['worldData']): Promise<CurrentEvent> => {
    const currentLocation = worldData.locations.find(l => l.id === player.currentLocationId);
    const currentProvince = currentLocation ? worldData.provinces.find(p => p.id === currentLocation.provinceId) : null;
    const currentWorldRegion = currentProvince ? worldData.worldRegions.find(wr => wr.id === currentProvince.worldRegionId) : null;

    const geographicalContext = {
        worldRegion: currentWorldRegion ? { name: currentWorldRegion.name, description: currentWorldRegion.description } : null,
        province: currentProvince ? { name: currentProvince.name, description: currentProvince.description } : null,
        location: currentLocation 
            ? { name: currentLocation.name, description: currentLocation.description, type: currentLocation.type, safetyLevel: currentLocation.safetyLevel } 
            : { name: "Hư Không Vô Định", description: "Người chơi đang ở một nơi không xác định, có thể là một không gian đặc biệt hoặc vừa mới di chuyển đến đây." },
    };
    
    const prompt = `Người chơi '${player.name}' (Tuổi ${player.age}/${player.lifespan}, Cảnh giới: ${player.cultivationStage}) đã lắc xúc xắc, và vận mệnh của họ đã ứng với một ô trên Thiên Mệnh Bàn.
*   **Bối cảnh Địa lý Hiện tại:** ${JSON.stringify(geographicalContext)}
*   **Loại ô (Theme):** '${square.type}'
*   **Tên ô (Description):** '${square.description}'
*   **Giai đoạn thế giới:** ${worldPhase?.name || 'Bình thường'}
*   **Các nhiệm vụ đang hoạt động:** ${JSON.stringify(activeQuests.map(q => q.title))}
*   **Trạng thái Hệ Thống:** ${player.heThongStatus}

**QUAN TRỌNG**: Người chơi **KHÔNG** di chuyển tới một nơi mới. Thay vào đó, hãy tạo ra một sự kiện xảy ra **ngay tại bối cảnh hiện tại** của họ, dựa trên chủ đề của loại ô và bối cảnh địa lý.
Sự kiện này PHẢI tuân thủ quy tắc tạo 4 gợi ý chi tiết.

**Gợi ý diễn giải các loại ô:**
- **Khởi đầu:** Ô xuất phát, thường là yên bình. Tạo sự kiện mô tả sự chuẩn bị cho một hành trình mới.
- **Kỳ Ngộ:** Một cơ duyên hiếm có. **Nếu Hệ Thống chưa được kích hoạt, đây là cơ hội VÀNG để kích hoạt nó (trả về \`awakenHeThong: true\`)! Đặc biệt nếu tên ô là 'Thiên Mệnh Thức Tỉnh', BẮT BUỘC phải kích hoạt Hệ Thống.**
- **Tâm Ma:** Một thử thách nội tâm, ảo ảnh, đối mặt với quá khứ hoặc ham muốn.
- **Nhân Quả:** Kết quả của hành động trong quá khứ, danh vọng Chính/Ma phát huy tác dụng.
- **Thiên Cơ:** Hé lộ một thông tin, một bí mật của thế giới.
- **Thử Luyện:** Một trận chiến nhỏ, một câu đố, một thử thách kỹ năng.
- **Bế Quan:** Một cơ hội để yên tĩnh hồi phục hoặc tu luyện.
- **Hồng Trần:** Vướng vào chuyện của thế giới phàm tục, ảnh hưởng tâm cảnh.
- **Linh Mạch:** Phát hiện một luồng linh khí dồi dào gần đó, tốt cho việc hồi phục linh lực.
- **Pháp Bảo:** Sự kiện liên quan đến việc tìm kiếm, sửa chữa, hoặc sử dụng pháp bảo.
- **Giao Dịch:** Cơ hội mua bán, trao đổi vật phẩm xuất hiện một cách tình cờ.
- **May mắn/Xui xẻo:** Một sự kiện may/rủi ngẫu nhiên nhưng vẫn logic.
- **Tai Ương:** Một sự kiện xui xẻo nhỏ, ví dụ: tu luyện bị gián đoạn, bị thương nhẹ.
- **Ô Trống:** Không có gì xảy ra cả. Vận mệnh lần này thật yên ắng.
- **Cột mốc:** Một sự kiện quan trọng, thường liên quan đến nhiệm vụ chính hoặc đột phá cảnh giới.`;
    return callGemini(prompt, currentEventSchema);
};

const formatThienThuDataForPrompt = (thienThu: ThienThuData): string => {
    const formatItem = (item: any) => `- Tên: ${item.name}, Mô tả: ${item.description}`;

    const vatPham = thienThu.vatPhamTieuHao.map(formatItem).join('\n');
    const trangBi = thienThu.trangBi.map(formatItem).join('\n');
    const phapBao = thienThu.phapBao.map(formatItem).join('\n');
    const congPhap = thienThu.congPhap.map(formatItem).join('\n');

    return `\n**Vật phẩm Tiêu hao:**\n${vatPham}\n\n**Trang bị:**\n${trangBi}\n\n**Pháp bảo:**\n${phapBao}\n\n**Công pháp:**\n${congPhap}\n`;
};


export const processPlayerAction = async (gameState: GameState, action: string, isFullContextTurn: boolean): Promise<ActionOutcome> => {
    const { player, quests, inventory, currentEvent, tribulationEvent, thienDaoRules, aiRules, coreMemoryRules, journal, shortTermMemory, heThong, turnCounter, scenarioSummary, scenarioStages, isThienMenhBanActive, cultivationSystem, thienThu, worldData } = gameState;
    
    const allRealms = cultivationSystem.flatMap(tier => tier.realms).sort((a, b) => a.rank - b.rank);

    const getStageInfo = (stageId: string): { majorRealm: MajorRealm, minorRealm: MinorRealm } | null => {
        for (const major of allRealms) {
            const minor = major.minorRealms.find(m => m.id === stageId);
            if (minor) {
                return { majorRealm: major, minorRealm: minor };
            }
        }
        return null;
    };

    const getNextStageInfo = (currentStageId: string): { nextStageId: string, isMajorBreakthrough: boolean } | null => {
        const currentInfo = getStageInfo(currentStageId);
        if (!currentInfo) return null;
    
        const { majorRealm, minorRealm } = currentInfo;
        const currentIndexInMinor = majorRealm.minorRealms.findIndex(m => m.id === minorRealm.id);
    
        // Find next non-hidden minor realm in current major realm
        for (let i = currentIndexInMinor + 1; i < majorRealm.minorRealms.length; i++) {
            if (!majorRealm.minorRealms[i].isHidden) {
                return { nextStageId: majorRealm.minorRealms[i].id, isMajorBreakthrough: false };
            }
        }
    
        // If no more in current major realm, find next major realm
        const currentMajorIndex = allRealms.findIndex(r => r.id === majorRealm.id);
        if(currentMajorIndex > -1 && currentMajorIndex + 1 < allRealms.length) {
            const nextMajorRealm = allRealms[currentMajorIndex + 1];
            if (nextMajorRealm && nextMajorRealm.minorRealms.length > 0) {
                const firstMinorOfNext = nextMajorRealm.minorRealms.find(m => !m.isHidden);
                if (firstMinorOfNext) {
                    return { nextStageId: firstMinorOfNext.id, isMajorBreakthrough: true };
                }
            }
        }
    
        return null;
    };
    
    // Geographical Context
    const currentLocation = worldData.locations.find(l => l.id === player.currentLocationId);
    const currentProvince = currentLocation ? worldData.provinces.find(p => p.id === currentLocation.provinceId) : null;
    const currentWorldRegion = currentProvince ? worldData.worldRegions.find(wr => wr.id === currentProvince.worldRegionId) : null;

    const geographicalContext = {
        worldRegion: currentWorldRegion ? { name: currentWorldRegion.name, description: currentWorldRegion.description } : null,
        province: currentProvince ? { name: currentProvince.name, description: currentProvince.description } : null,
        location: currentLocation 
            ? { name: currentLocation.name, description: currentLocation.description, type: currentLocation.type, safetyLevel: currentLocation.safetyLevel } 
            : { name: "Hư Không Vô Định", description: "Người chơi đang ở một nơi không xác định, có thể là một không gian đặc biệt hoặc vừa mới di chuyển đến đây." },
    };

    // The context object contains all player/world state information for the AI.
    const context = {
        player: {
            name: player.name,
            age: player.age,
            lifespan: player.lifespan,
            cultivationStage: player.cultivationStage,
            level: player.level,
            exp: player.exp,
            maxExp: player.maxExp,
            hp: player.hp,
            maxHp: player.maxHp,
            spiritPower: player.spiritPower,
            maxSpiritPower: player.maxSpiritPower,
            stamina: player.stamina,
            maxStamina: player.maxStamina,
            mentalState: player.mentalState,
            maxMentalState: player.maxMentalState,
            sect: player.sect,
            sectContribution: player.sectContribution,
            reputation: player.reputation,
            linhCan: player.linhCan,
            nguHanh: player.nguHanh,
            attributes: player.attributes,
            statusEffects: player.statusEffects.map(s => ({ name: s.name, duration: s.duration })),
            difficulty: player.difficulty,
            heThongStatus: player.heThongStatus,
            heThongPoints: player.heThongPoints,
        },
        time: `Năm ${player.year}, Tháng ${player.month}, Ngày ${player.day}`,
        turn: turnCounter,
        isThienMenhBanActive,
        geographicalContext,
        activeQuests: quests.filter(q => q.status === 'Đang tiến hành').map(q => ({ id: q.id, title: q.title, description: q.description, completionCondition: q.completionCondition })),
        activeHeThongQuests: heThong.quests.filter(q => q.status === 'Đang tiến hành').map(q => ({ id: q.id, title: q.title, type: q.type, description: q.description, hiddenObjective: q.hiddenObjective ? { condition: q.hiddenObjective.condition, completed: q.hiddenObjective.completed } : null})),
        inventorySummary: inventory.reduce((acc, item) => {
            acc[item.name] = (acc[item.name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        equippedItems: {
            technique: player.equippedTechniqueId ? inventory.find(i => i.id === player.equippedTechniqueId)?.name : 'Không có',
            treasure: player.equippedTreasureId ? inventory.find(i => i.id === player.equippedTreasureId)?.name : 'Không có',
        },
        dongPhu: {
            buildings: gameState.dongPhu.buildings.map(b => ({ name: b.name, level: b.level }))
        },
        currentEventDescription: currentEvent?.description,
        tribulationEventDescription: tribulationEvent?.description,
    };

    let tribulationInstructions = '';
    if (gameState.tribulationEvent) {
        const nextStageData = getNextStageInfo(player.cultivationStageId);
        const nextStageId = nextStageData?.nextStageId;
        const nextStageInfo = nextStageId ? getStageInfo(nextStageId) : null;
        const nextStageName = nextStageInfo ? `${nextStageInfo.majorRealm.name} ${nextStageInfo.minorRealm.name}` : 'Cảnh Giới Mới';
        
        let qualityInstructions = '';
        if (nextStageInfo?.majorRealm.hasQualities && nextStageInfo.majorRealm.qualities) {
            const qualitiesList = nextStageInfo.majorRealm.qualities
                .sort((a, b) => a.rank - b.rank)
                .map(q => ({ id: q.id, name: q.name, condition: q.condition }));
            qualityInstructions = `
- **Phân định Phẩm chất:** Cảnh giới ${nextStageInfo.majorRealm.name} có thể đạt được các phẩm chất khác nhau. Dựa vào hành động và sự chuẩn bị của người chơi, hãy quyết định phẩm chất họ đạt được. Trả về ID của phẩm chất đó trong \`achievedQualityId\`.
- **Danh sách Phẩm chất (từ thấp đến cao):** ${JSON.stringify(qualitiesList)}`;
        }

        tribulationInstructions = `
**YÊU CẦU TUYỆT ĐỐI - XỬ LÝ ĐỘT PHÁ CẢNH GIỚI (ƯU TIÊN CAO NHẤT):**
Người chơi đang trong quá trình đột phá sinh tử từ ${player.cultivationStage} lên ${nextStageName}. Sự kiện Thiên Kiếp đang diễn ra là: "${gameState.tribulationEvent.description}".
Hành động của người chơi là: "${action}".

**QUY TẮC XỬ LÝ (BẮT BUỘC):**
1.  **Phán quyết:** Dựa vào hành động và chỉ số của người chơi để quyết định thành bại.
2.  **Phân tích Vật phẩm:** Nếu hành động là 'Dùng' một vật phẩm, hãy kiểm tra mô tả và loại của nó. CHỈ những vật phẩm có mô tả rõ ràng liên quan đến 'hỗ trợ đột phá', 'chống lại thiên kiếp', 'củng cố đạo cơ', 'hồi phục thần hồn' hoặc thuộc loại 'Linh dược' cực kỳ cao cấp mới có tác dụng tích cực. Dùng vật phẩm không liên quan (ví dụ: một viên đá, thức ăn, công pháp cấp thấp) sẽ KHÔNG có tác dụng, hoặc thậm chí gây phản tác dụng và dẫn đến thất bại.
3.  **Trả về \`tribulationOutcome\` và các thay đổi chỉ số:**
    -   **Thành công:** Trả về \`"success": true, "nextStageId": "${nextStageId}"\`.
    -   **Thất bại:**
        -   Trả về \`"success": false\`.
        -   **Trọng thương:** PHẢI trả về các giá trị \`hpChange\` và \`mentalStateChange\` **âm** đáng kể. Đồng thời, thêm trạng thái 'heavily_wounded' với duration hợp lý.
        -   **Tụt giảm tu vi:** PHẢI trả về một giá trị \`expChange\` **âm**. Mức kinh nghiệm mất đi phải tương ứng với mức độ thất bại (thất bại càng thảm, mất càng nhiều).
${qualityInstructions}
4.  **QUAN TRỌNG NHẤT: SỰ KIỆN KẾ TIẾP (\`nextEvent\`)**
    -   **NẾU ĐỘT PHÁ THÀNH CÔNG, BẠN BẮT BUỘC PHẢI TẠO RA MỘT \`nextEvent\` MỚI.**
    -   **VIỆC ĐỂ \`nextEvent\` LÀ \`null\` SAU KHI THÀNH CÔNG LÀ MỘT LỖI NGHIÊM TRỌNG VÀ KHÔNG ĐƯỢC PHÉP XẢY RA.**
    -   Sự kiện này phải tiếp nối câu chuyện, liên quan đến cảnh giới mới. Các ví dụ tốt: "Năng lượng đột phá của ngươi làm kinh động một yêu thú cường đại gần đó, nó đang lao tới!", "Cảnh giới mới giúp ngươi cảm nhận được một bí cảnh vừa mở ra ở phía xa."
    -   \`nextEvent\` PHẢI tuân thủ quy tắc tạo 4 gợi ý chi tiết.
5.  \`outcomeDescription\` phải mô tả diễn biến thiên kiếp một cách kịch tính.
`;
    }

    const commonPromptEnding = `**QUY TẮC XỬ LÝ:**
1.  **QUAN TRỌNG NHẤT:** Trường \`outcomeDescription\` là phần tường thuật CỐT LÕI của trò chơi. Bạn BẮT BUỘC phải viết một đoạn văn chi tiết, hấp dẫn để mô tả kết quả hành động của người chơi. Đoạn văn này PHẢI có sự liên kết chặt chẽ với các sự kiện trong bối cảnh. Nếu trường này trống, câu chuyện sẽ không thể tiếp diễn.
2.  Kết quả phải tuân thủ tuyệt đối **Thiên Đạo**, **Bộ Nhớ Cốt Lõi** và **Quy Tắc AI**.
3.  **LUÔN LUÔN tạo ra một sự kiện tiếp theo (\`nextEvent\`).** Sự kiện này PHẢI tuân thủ quy tắc tạo 4 gợi ý chi tiết. Nếu không có hành động nào đặc biệt, hãy tạo ra các gợi ý chung chung như 'Thiền định tại chỗ (Hồi phục thể lực)', 'Quan sát xung quanh (Có thể phát hiện điều gì đó)', 'Tiếp tục tu luyện công pháp (Tăng kinh nghiệm)', và 'Kiểm tra túi đồ (Sắp xếp lại vật phẩm)'.
4.  **\`journalEntry\`**: **BẮT BUỘC:** Sau khi viết xong \`outcomeDescription\`, hãy tóm tắt nó thành một câu RẤT NGẮN GỌN (5-50 từ) trong \`journalEntry\`. **CHỈ ghi nhận sự kiện chính**, không mô tả cảnh vật hay cảm xúc lan man. Ví dụ: "Đánh bại Hắc Hùng, nhận được Hắc Hùng Đảm và 50 kinh nghiệm." hoặc "Gia nhập Thanh Vân Môn sau khi hoàn thành thử thách của trưởng lão."
5.  **Kiểm tra Nhiệm vụ Hệ thống:** Kiểm tra xem hành động của người chơi có hoàn thành điều kiện của bất kỳ Nhiệm vụ Hệ Thống nào không, bao gồm cả nhiệm vụ chính và mục tiêu ẩn (nếu có và chưa hoàn thành). Cập nhật trạng thái trong \`heThongQuestUpdates\` nếu cần.
6.  **Quản lý Trạng thái:** Dựa vào diễn biến, thêm hoặc bớt trạng thái cho nhân vật. Ví dụ: bị trúng độc sau khi chiến đấu, hãy thêm \`{ "id": "poisoned", "duration": 5 }\` vào \`newStatusEffects\`. Nếu một trạng thái được chữa khỏi, thêm ID của nó vào \`removeStatusEffectIds\`.`;

    const formattedThienThuData = formatThienThuDataForPrompt(thienThu);

    if (isFullContextTurn) {
        const recentJournalEntries = journal.slice(-10).map(j => `Lượt ${j.turn}: ${j.text}`);
        const historicalJournalEntries = journal.slice(0, -10).reverse().map(j => `Lượt ${j.turn}: ${j.text}`);
        const prompt = `${tribulationInstructions}
Bạn là Quản Trò AI. Đây là một lượt có BỐI CẢNH ĐẦY ĐỦ. Bạn có thể thấy toàn bộ lịch sử.
**YÊU CẦU TUYỆT ĐỐI: BẠN PHẢI TUÂN THỦ QUY TRÌNH ĐỌC VÀ XỬ LÝ SAU ĐÂY THEO ĐÚNG THỨ TỰ:**

**BƯỚC 1: ĐỌC LUẬT LỆ**
*   **Thiên Đạo (Luật Trời):** ${JSON.stringify(thienDaoRules.map(r => r.text))}
*   **BỘ NHỚ CỐT LÕI (SỰ THẬT BẤT BIẾN - TUYỆT ĐỐI TUÂN THỦ):** ${JSON.stringify(coreMemoryRules.map(r => r.text))}
*   **Quy Tắc AI (Luật GM):** ${JSON.stringify(aiRules.map(r => r.text))}

**BƯỚC 2: ĐỌC DỮ LIỆU THIÊN THƯ (VẬT PHẨM TỒN TẠI TRONG THẾ GIỚI)**
*   **Danh sách vật phẩm, trang bị, pháp bảo, công pháp có sẵn:** ${formattedThienThuData}
*   **QUY TẮC BẮT BUỘC:** Khi tạo \`newItem\`, bạn PHẢI chọn một vật phẩm có sẵn từ danh sách này bằng cách sao chép chính xác 'name', 'description', và các thuộc tính khác của nó. TUYỆT ĐỐI KHÔNG được tự bịa ra vật phẩm mới. Ngoại lệ duy nhất là 'Vật phẩm Nhiệm vụ' (category: 'Nhiệm vụ') có thể được tạo ra khi cần thiết cho cốt truyện.

**BƯỚC 3: PHÂN TÍCH BỐI CẢNH CỐT TRUYỆN**
*   **Tóm Tắt Kịch Bản Chính:** ${scenarioSummary}
*   **Các Giai Đoạn Cốt Truyện (Tối đa 15 giai đoạn đầu):** ${JSON.stringify(scenarioStages.slice(0, 15).map(s => s.text))}
*   **Yêu cầu:** Bạn phải xác định câu chuyện đang ở giai đoạn nào dựa trên nhật ký và các sự kiện đã xảy ra, sau đó đảm bảo các sự kiện bạn tạo ra phải phù hợp với giai đoạn hiện tại hoặc dẫn dắt hợp lý đến giai đoạn tiếp theo. TUYỆT ĐỐI KHÔNG quay ngược giai đoạn (ví dụ: đang ở giai đoạn 3 lại tạo sự kiện của giai đoạn 1).

**BƯỚC 4: PHÂN TÍCH BỐI CẢNH LỊCH SỬ**
*   **10 Diễn Biến Gần Nhất (Nhật Ký):** ${JSON.stringify(recentJournalEntries)}
*   **Lịch sử xa hơn (từ mới đến cũ, không bao gồm 10 diễn biến gần nhất):** ${JSON.stringify(historicalJournalEntries)}

**BƯỚC 5: PHÂN TÍCH BỐI CẢNH HIỆN TẠI**
*   **Toàn Bộ Trạng Thái Game (Đạo hữu, động phủ, túi đồ, môn phái, nhiệm vụ, v.v.):** ${JSON.stringify(context)}

**BƯỚC 6: XỬ LÝ HÀNH ĐỘNG**
*   **Hành Động Người Chơi:** "${action}"

${commonPromptEnding}`;
        return callGemini(prompt, actionOutcomeSchema);
    } else {
        const shortTermHistory = shortTermMemory.map(j => `Lượt ${j.turn}: ${j.text}`);
        const prompt = `${tribulationInstructions}
Bạn là Quản Trò AI. Đây là một lượt có BỐI CẢNH RÚT GỌN. Bạn chỉ có trí nhớ ngắn hạn về vài sự kiện gần nhất.
**YÊU CẦU TUYỆT ĐỐI: BẠN PHẢI TUÂN THỦ QUY TRÌNH ĐỌC VÀ XỬ LÝ SAU ĐÂY THEO ĐÚNG THỨ TỰ:**

**BƯỚC 1: ĐỌC LUẬT LỆ (LUÔN ĐỌC)**
*   **Thiên Đạo (Luật Trời):** ${JSON.stringify(thienDaoRules.map(r => r.text))}
*   **BỘ NHỚ CỐT LÕI (SỰ THẬT BẤT BIẾN - TUYỆT ĐỐI TUÂN THỦ):** ${JSON.stringify(coreMemoryRules.map(r => r.text))}
*   **Quy Tắc AI (Luật GM):** ${JSON.stringify(aiRules.map(r => r.text))}

**BƯỚC 2: ĐỌC DỮ LIỆU THIÊN THƯ (VẬT PHẨM TỒN TẠI TRONG THẾ GIỚI)**
*   **Danh sách vật phẩm, trang bị, pháp bảo, công pháp có sẵn:** ${formattedThienThuData}
*   **QUY TẮC BẮT BUỘC:** Khi tạo \`newItem\`, bạn PHẢI chọn một vật phẩm có sẵn từ danh sách này bằng cách sao chép chính xác 'name', 'description', và các thuộc tính khác của nó. TUYỆT ĐỐI KHÔNG được tự bịa ra vật phẩm mới. Ngoại lệ duy nhất là 'Vật phẩm Nhiệm vụ' (category: 'Nhiệm vụ') có thể được tạo ra khi cần thiết cho cốt truyện.

**BƯỚC 3: PHÂN TÍCH BỐI CẢNH CỐT TRUYỆN**
*   **Tóm Tắt Kịch Bản Chính:** ${scenarioSummary}
*   **Các Giai Đoạn Cốt Truyện (Tối đa 15 giai đoạn đầu):** ${JSON.stringify(scenarioStages.slice(0, 15).map(s => s.text))}
*   **Yêu cầu:** Bạn phải xác định câu chuyện đang ở giai đoạn nào dựa trên nhật ký và các sự kiện đã xảy ra, sau đó đảm bảo các sự kiện bạn tạo ra phải phù hợp với giai đoạn hiện tại hoặc dẫn dắt hợp lý đến giai đoạn tiếp theo. TUYỆT ĐỐI KHÔNG quay ngược giai đoạn (ví dụ: đang ở giai đoạn 3 lại tạo sự kiện của giai đoạn 1).

**BƯỚC 4: PHÂN TÍCH BỐI CẢNH HIỆN TẠI VÀ TRÍ NHỚ NGẮN HẠN**
*   **Toàn Bộ Trạng Thái Game Hiện Tại (Đạo hữu, túi đồ, nhiệm vụ, v.v.):** ${JSON.stringify(context)}
*   **Diễn Biến Gần Đây (Trí nhớ ngắn hạn):** ${JSON.stringify(shortTermHistory)}

**BƯỚC 5: XỬ LÝ HÀNH ĐỘNG**
*   **Hành Động Người Chơi:** "${action}"

${commonPromptEnding}`;
        return callGemini(prompt, actionOutcomeSchema);
    }
};

export const processCombatTurn = async (player: Player, combatState: CombatState, worldPhase: WorldPhase | null, action: string): Promise<CombatTurnOutcome> => {
    const prompt = `Trong trận chiến, người chơi '${player.name}' (Tuổi ${player.age}, HP: ${player.hp}/${player.maxHp}, Thể lực: ${player.stamina}, Tâm cảnh: ${player.mentalState}) đối đầu với '${combatState.enemyName}' (HP: ${combatState.enemyHp}/${combatState.enemyMaxHp}).
    Người chơi chọn hành động: "${action}".
    Thiên địa đang ở giai đoạn: ${worldPhase?.name || 'Bình thường'}.
    Hãy tạo ra kết quả cho lượt đánh này.
    QUAN TRỌNG: Nếu hành động này khiến HP của kẻ địch giảm xuống 0 hoặc thấp hơn, hãy KẾT THÚC trận chiến và điền thông tin phần thưởng (loot) vào trường 'loot'. Nếu không, để 'loot' là null.
    Chiến đấu cũng làm giảm thể lực và tâm cảnh.`;
    return callGemini(prompt, combatTurnOutcomeSchema);
};

export const generateTribulationEvent = async (player: Player, nextStage: string): Promise<CurrentEvent> => {
    const prompt = `Người chơi '${player.name}' (Tuổi ${player.age}, cấp ${player.level}) sắp đột phá cảnh giới ${nextStage}. Hãy tạo một sự kiện Thiên Kiếp đầy thử thách.
    Sự kiện này PHẢI tuân thủ quy tắc tạo 4 gợi ý chi tiết.`;
    return callGemini(prompt, currentEventSchema);
};

export const generateWorldPhase = async (phaseName: string): Promise<WorldPhase> => {
    const prompt = `Tạo chi tiết cho giai đoạn thế giới: '${phaseName}'.
Mô tả nó và tạo ra các hiệu ứng. Bắt buộc phải có **CHÍNH XÁC 4 HIỆU ỨNG** theo quy tắc sau, không hơn không kém:
1.  **Một (1) buff có target 'world'**: Ảnh hưởng toàn cục đến người chơi, NPC, thế lực. Ví dụ: "Linh khí dồi dào, tốc độ tu luyện của mọi sinh linh tăng 10%."
2.  **Một (1) nerf có target 'world'**: Ảnh hưởng toàn cục đến người chơi, NPC, thế lực. Ví dụ: "Thiên địa bất ổn, tâm ma dễ dàng quấy nhiễu, tất cả nhân vật dễ bị giảm Tâm Cảnh hơn khi gặp trắc trở."
3.  **Một (1) buff có target 'board'**: Ảnh hưởng đến các sự kiện trên Thiên Mệnh Bàn. Ví dụ: "Phúc duyên tràn đầy, tỉ lệ xuất hiện ô 'Kỳ Ngộ' và 'May Mắn' tăng lên." HOẶC "Vận may mỉm cười, có 30% tỉ lệ nhận thêm 1 lượt lắc xúc xắc sau mỗi lần lắc."
4.  **Một (1) nerf có target 'board'**: Ảnh hưởng đến các sự kiện trên Thiên Mệnh Bàn. Ví dụ: "Tai ương liên miên, tỉ lệ xuất hiện ô 'Xui Xẻo' và 'Tai Ương' tăng lên." HOẶC "Vận rủi đeo bám, có 40% tỉ lệ bị dịch chuyển ngẫu nhiên đến một ô 'Tai Ương' hoặc 'Xui xẻo' gần nhất sau khi di chuyển."

Hãy đảm bảo rằng có đủ 4 hiệu ứng, mỗi loại một.`;
    return callGemini(prompt, worldPhaseSchema);
};

export const generateLapCompletionOutcome = async (player: Player): Promise<ActionOutcome> => {
    const prompt = `Người chơi '${player.name}' (Cấp ${player.level}, Cảnh giới ${player.cultivationStage}) đã hoàn thành một vòng trên Thiên Mệnh Bàn. Đây là một cột mốc quan trọng.
    Hãy tạo ra một kết quả (ActionOutcome) tổng kết lại thành quả của họ.
    - outcomeDescription: Một đoạn văn mô tả cảm ngộ của người chơi khi hoàn thành một vòng nhân sinh, những gì họ đã trải qua và thu hoạch được.
    - expChange: Một lượng kinh nghiệm đáng kể để thưởng cho người chơi.
    - daysToAdvance: 0.
    - hpChange, spiritPowerChange, staminaChange, mentalStateChange: Một chút hồi phục để chuẩn bị cho vòng mới (ví dụ: +10% hoặc +20% chỉ số tối đa).
    - newItem: Có thể cho một vật phẩm thưởng nhỏ (ví dụ: vài viên Linh Thạch Hạ Phẩm).
    - Các trường khác: Giữ ở mức thay đổi nhỏ hoặc 0.
    - KHÔNG tạo combatTrigger hay nextEvent.`;
    return callGemini(prompt, actionOutcomeSchema);
};

export const generateHeThongActivation = async (player: Player): Promise<ActionOutcome> => {
    const prompt = `Người chơi '${player.name}' (Tuổi ${player.age}, Cảnh giới: ${player.cultivationStage}) đã bước vào ô "Thiên Mệnh Thức Tỉnh". Đây là một kỳ ngộ định mệnh.
Hãy tạo ra một sự kiện (ActionOutcome) hoành tráng để kích hoạt "Hệ Thống" (Bàn Tay Vàng) cho người chơi.

**YÊU CẦU:**
1.  **outcomeDescription**: Mô tả một cách sống động, kỳ vĩ, và bí ẩn về việc Hệ Thống thức tỉnh và liên kết với người chơi. Mô tả cảm giác, âm thanh, và những gì người chơi nhìn thấy.
2.  **awakenHeThong**: PHẢI là \`true\`.
3.  **newHeThongQuest**: TẠO một nhiệm vụ Hệ Thống đầu tiên cho người chơi. Nhiệm vụ này nên đơn giản, mang tính giới thiệu, loại 'Bình thường'. Ví dụ: "Làm quen với Hệ thống: Nói 'Xin chào Hệ thống' trong ô nhập liệu." hoặc "Thử nghiệm chức năng: Lắc xúc xắc thêm một lần nữa."
4.  **nextEvent**: TẠO một sự kiện tiếp theo để người chơi có thể tiếp tục. Sự kiện này PHẢI tuân thủ quy tắc tạo 4 gợi ý chi tiết. Ví dụ: "Kiểm tra giao diện Hệ Thống (An toàn)", "Hỏi Hệ Thống về chức năng (Có thể nhận thông tin)", "Phớt lờ và quan sát xung quanh (An toàn)", "Thử nghiệm sức mạnh mới (Tốn thể lực)".
5.  **journalEntry**: Tạo một tóm tắt RẤT NGẮN GỌN (5-15 từ) về sự kiện này. Ví dụ: "Kích hoạt thành công Hệ Thống Bàn Tay Vàng."
6.  Các trường thay đổi chỉ số khác (\`hpChange\`, \`expChange\`, \`spiritPowerChange\`) nên để giá trị 0.
7.  **staminaChange** và **mentalStateChange** BẮT BUỘC phải có giá trị. Ví dụ: staminaChange: -10 (do quá trình kích hoạt mệt mỏi), mentalStateChange: +20 (do phấn khích, chấn động).
8.  **daysToAdvance**: Phải là 0.
`;
    return callGemini(prompt, actionOutcomeSchema);
};

export const generateTagsFromItems = async (allItems: (InitialItem | InitialCongPhap)[]): Promise<string[]> => {
    const formattedItems = allItems.map(item => `- Tên: ${item.name}, Mô tả: ${item.description}, Loại: ${'techniqueType' in item ? item.techniqueType : item.itemType}`).join('\n');
    
    const prompt = `Phân tích danh sách vật phẩm và công pháp từ một game tu tiên sau đây:\n\n${formattedItems}\n\nDựa trên danh sách này, hãy tạo ra một danh sách các nhãn (tags) ngắn gọn (1-2 từ) bằng tiếng Việt để phân loại hình ảnh liên quan đến chúng. Tập trung vào các từ khóa về loại (ví dụ: đan dược, kiếm, giáp), thuộc tính (ví dụ: hỏa, băng, độc), khái niệm (ví dụ: hồi phục, phòng ngự, tu luyện), và thẩm mỹ (ví dụ: cổ xưa, ma quái, tiên khí). Không sử dụng tên riêng của vật phẩm làm nhãn. Tất cả các nhãn phải viết thường.`;

    const schema = {
        type: Type.ARRAY,
        items: { type: Type.STRING, description: "Một nhãn ngắn gọn bằng tiếng Việt viết thường." },
    };

    return callGemini(prompt, schema);
};

export const analyzeImageForTags = async (base64ImageDataUrl: string, allTags: string[]): Promise<string[]> => {
    if (!ai) {
        throw new Error("Lỗi Cấu Hình API: Gemini client chưa được khởi tạo. Vui lòng cung cấp API Key.");
    }
    const match = base64ImageDataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) throw new Error("Invalid base64 image format");
    const mimeType = match[1];
    const data = match[2];

    const imagePart = {
        inlineData: { mimeType, data },
    };

    const textPart = {
        text: `Phân tích hình ảnh được cung cấp. Dựa trên nội dung, phong cách và không khí của nó, hãy chọn các nhãn (tags) phù hợp nhất từ danh sách sau đây. Chỉ trả về các nhãn đã chọn dưới dạng một mảng JSON chứa các chuỗi. Danh sách nhãn hiện có: ${JSON.stringify(allTags)}`,
    };

    const schema = {
        type: Type.ARRAY,
        items: { type: Type.STRING },
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Gemini API call failed for image analysis", e);
        throw new Error("Lỗi giao tiếp với Thiên Đạo khi phân tích hình ảnh. Xin hãy thử lại.");
    }
};

export const optimizeTags = async (tags: string[]): Promise<{ optimizedTags: string[], changes: { old: string, new: string }[] }> => {
    const prompt = `Bạn là một chuyên gia về thuật ngữ game tu tiên tiếng Việt.
Nhiệm vụ của bạn là phân tích danh sách các nhãn (tags) sau đây và hợp nhất những nhãn có cùng ý nghĩa nhưng khác cách diễn đạt.

Ví dụ: nếu có các nhãn ["hồi máu", "hồi sinh lực", "hồi HP", "vũ khí", "kiếm"], bạn nên hợp nhất chúng thành ["hồi phục", "vũ khí", "kiếm"].

Danh sách nhãn cần phân tích:
${JSON.stringify(tags)}

QUY TẮC:
1. Xác định các nhóm nhãn đồng nghĩa.
2. Với mỗi nhóm, chọn ra một nhãn chính, tổng quát nhất (ví dụ: "hồi phục" là nhãn chính cho "hồi máu", "hồi HP").
3. Chỉ trả về kết quả dưới dạng JSON.

YÊU CẦU ĐẦU RA (JSON):
Trả về một đối tượng JSON có hai trường:
- \`optimizedTags\`: Một mảng chứa các nhãn DUY NHẤT sau khi đã được tối ưu và hợp nhất.
- \`changes\`: Một mảng các đối tượng, mỗi đối tượng có dạng \`{ "old": "nhãn_cũ", "new": "nhãn_mới_được_hợp_nhất" }\`. CHỈ bao gồm những nhãn đã thực sự bị thay đổi. Nếu một nhãn được giữ lại làm nhãn chính, đừng đưa nó vào mảng này.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            optimizedTags: {
                type: Type.ARRAY,
                description: "Danh sách các nhãn duy nhất sau khi đã được tối ưu và hợp nhất.",
                items: { type: Type.STRING }
            },
            changes: {
                type: Type.ARRAY,
                description: "Danh sách các thay đổi, chỉ bao gồm những nhãn đã bị hợp nhất vào một nhãn khác.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        old: { type: Type.STRING, description: "Tên nhãn cũ đã bị thay thế." },
                        new: { type: Type.STRING, description: "Tên nhãn mới được hợp nhất vào." }
                    },
                    required: ["old", "new"]
                }
            }
        },
        required: ["optimizedTags", "changes"]
    };

    return callGemini(prompt, schema);
};

export const assignSingleImage = async (
    item: { name: string, description: string, category: string },
    images: { fileName: string, tags: string[] }[]
): Promise<string> => {
    const imagesWithTags = images.filter(img => img.tags.length > 0);
    if (imagesWithTags.length === 0) {
        throw new Error("Không có hình ảnh nào có nhãn để AI lựa chọn.");
    }

    const prompt = `Bạn là một AI trợ lý cho game. Nhiệm vụ của bạn là chọn một hình ảnh phù hợp nhất cho một vật phẩm trong game từ một thư viện cho trước.
    
    Vật phẩm cần gán ảnh:
    - Tên: ${item.name}
    - Mô tả: ${item.description}
    - Loại: ${item.category}

    Thư viện ảnh (chỉ sử dụng những ảnh này):
    ${JSON.stringify(imagesWithTags.map(img => ({ fileName: img.fileName, tags: img.tags })))}

    Dựa vào thông tin vật phẩm, hãy chọn ra một 'fileName' DUY NHẤT từ thư viện phù hợp nhất. Ưu tiên các ảnh có nhãn (tags) liên quan đến tên, loại, và mô tả của vật phẩm.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            bestImageFileName: { type: Type.STRING, description: "Tên file của hình ảnh phù hợp nhất." }
        },
        required: ["bestImageFileName"]
    };
    
    const result = await callGemini(prompt, schema);
    return result.bestImageFileName;
};

export const assignImagesInBulk = async (
    items: { id: string, name: string, description: string, category: string }[],
    images: { fileName: string, tags: string[] }[]
): Promise<{ itemId: string, imageId: string }[]> => {
    const imagesWithTags = images.filter(img => img.tags.length > 0);
     if (imagesWithTags.length === 0) {
        throw new Error("Không có hình ảnh nào có nhãn để AI lựa chọn.");
    }
    
    const prompt = `Bạn là một AI trợ lý cho game. Nhiệm vụ của bạn là gán hình ảnh phù hợp nhất cho một danh sách các vật phẩm trong game từ một thư viện cho trước.

    Danh sách vật phẩm cần gán ảnh:
    ${JSON.stringify(items)}

    Thư viện ảnh (chỉ sử dụng những ảnh này):
    ${JSON.stringify(imagesWithTags.map(img => ({ fileName: img.fileName, tags: img.tags })))}

    Với MỖI vật phẩm trong danh sách, hãy tìm ra 'fileName' phù hợp nhất từ thư viện dựa trên tên, mô tả, và loại của vật phẩm đó. Ưu tiên các ảnh có nhãn (tags) liên quan. Trả về kết quả dưới dạng một mảng JSON, mỗi đối tượng chứa 'itemId' của vật phẩm và 'imageId' (chính là fileName) được chọn.`;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                itemId: { type: Type.STRING },
                imageId: { type: Type.STRING, description: "Tên file của hình ảnh được chọn." }
            },
            required: ["itemId", "imageId"]
        }
    };
    
    return callGemini(prompt, schema);
};