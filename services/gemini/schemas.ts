import { Type } from "@google/genai";

export const boardSquareSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.INTEGER },
        type: { type: Type.STRING, enum: ['Sự kiện', 'May mắn', 'Xui xẻo', 'Cột mốc', 'Kỳ Ngộ', 'Tâm Ma', 'Nhân Quả', 'Thiên Cơ', 'Thử Luyện', 'Bế Quan', 'Hồng Trần', 'Linh Mạch', 'Pháp Bảo', 'Giao Dịch', 'Ô Trống', 'Tai Ưng', 'Khởi đầu'] },
        description: { type: Type.STRING, description: "Tên của sự kiện định mệnh. Ví dụ: 'Kỳ Duyên Hiếm Có'." },
    },
    required: ['id', 'type', 'description']
};

export const itemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID độc nhất, ví dụ: 'linh_thach_ha_pham'" },
        name: { type: Type.STRING, description: "Tên vật phẩm, ví dụ: 'Linh Thạch Hạ Phẩm'" },
        description: { type: Type.STRING },
        category: { type: Type.STRING, enum: ['Vật phẩm', 'Trang bị', 'Nhiệm vụ', 'Công pháp', 'Pháp bảo', 'Linh dược', 'Khoáng thạch', 'Vật phẩm Hệ thống'] }
    },
    required: ['id', 'name', 'description', 'category']
};

export const reputationChangeSchema = {
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
        description: { type: Type.STRING, description: "Mô tả phần thưởng." },
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
        description: { type: Type.STRING, description: "Mô tả hình phạt." },
        hpChange: { type: Type.NUMBER, nullable: true },
        mentalStateChange: { type: Type.NUMBER, nullable: true },
        reputationChange: reputationChangeSchema
    },
    required: ['description']
};


export const questSchemaWithId = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['Cốt truyện', 'Phụ', 'Môn phái'] },
        timeLimit: { type: Type.INTEGER, nullable: true, description: "Số lượt để hoàn thành." },
        progress: { type: Type.INTEGER, nullable: true },
        target: { type: Type.INTEGER, nullable: true },
        completionCondition: { type: Type.STRING, description: "Điều kiện hoàn thành."},
        rewards: { ...questRewardSchema, nullable: false, description: "Phần thưởng khi hoàn thành." },
        penalties: { ...questPenaltySchema, nullable: true, description: "Hình phạt khi thất bại." }
    },
    required: ['id', 'title', 'description', 'type', 'completionCondition', 'rewards']
};

const { id, ...questPropertiesWithoutId } = questSchemaWithId.properties;

export const questSchemaWithoutId = {
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
        hpChange: { type: Type.INTEGER, nullable: true },
        heThongPointsChange: { type: Type.INTEGER, nullable: true }
    },
    required: ['description']
};

export const heThongQuestSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['Bình thường', 'Sự kiện đặc biệt', 'Nhiệm vụ tối thượng'] },
        rewards: { ...heThongQuestRewardSchema, nullable: false },
        penalties: { ...heThongQuestPenaltySchema, nullable: true },
        timeLimit: { type: Type.INTEGER, nullable: true, description: "Số lượt để hoàn thành." },
        hiddenObjective: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
                description: { type: Type.STRING, description: "Mô tả mục tiêu ẩn." },
                condition: { type: Type.STRING, description: "Điều kiện hoàn thành mục tiêu ẩn." },
                rewards: { ...heThongQuestRewardSchema, nullable: false, description: "Phần thưởng mục tiêu ẩn." },
            },
            required: ['description', 'condition', 'rewards']
        },
    },
    required: ['title', 'description', 'type', 'rewards']
};


export const recipeSchema = {
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

export const currentEventSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "Mô tả sự kiện hiện tại." },
        options: {
            type: Type.ARRAY,
            description: "Chính xác 4 gợi ý hành động cho người chơi. Mỗi gợi ý là một chuỗi có kèm chú thích trong ngoặc đơn.",
            minItems: 4,
            maxItems: 4,
            items: { type: Type.STRING }
        }
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

export const actionOutcomeSchema = {
    type: Type.OBJECT,
    properties: {
        outcomeDescription: { type: Type.STRING, description: "Mô tả tường thuật kết quả hành động." },
        hpChange: { type: Type.NUMBER, description: "Lượng HP thay đổi (root-level)." },
        expChange: { type: Type.NUMBER, description: "Lượng kinh nghiệm nhận được (root-level)." },
        spiritPowerChange: { type: Type.NUMBER, description: "Lượng linh lực thay đổi (root-level)." },
        staminaChange: { type: Type.NUMBER, description: "Số Thể Lực thay đổi (bắt buộc, root-level)." },
        mentalStateChange: { type: Type.NUMBER, description: "Số Tâm Cảnh thay đổi (bắt buộc, root-level)." },
        daysToAdvance: { type: Type.INTEGER, description: "Luôn trả về 0." },
        journalEntry: { type: Type.STRING, nullable: false, description: "Tóm tắt RẤT NGẮN GỌN (5-50 từ) của 'outcomeDescription'." },
        newItem: { ...itemSchema, nullable: true },
        newRecipe: { ...recipeSchema, nullable: true },
        newQuest: { ...questSchemaWithoutId, nullable: true },
        questUpdates: {
            type: Type.ARRAY,
            nullable: true,
            description: "Cập nhật nhiệm vụ.",
            items: {
                type: Type.OBJECT,
                properties: {
                    questId: { type: Type.STRING, description: "ID của nhiệm vụ." },
                    newStatus: { type: Type.STRING, enum: ['Hoàn thành', 'Thất bại'], nullable: true },
                    progressChange: { type: Type.INTEGER, nullable: true }
                },
                required: ['questId']
            }
        },
        reputationChange: {
            ...reputationChangeSchema,
            description: "Thay đổi danh vọng.",
        },
        attributeChanges: playerAttributeChangesSchema,
        sectContributionChange: { type: Type.NUMBER, nullable: true },
        diceRollsChange: { type: Type.NUMBER, nullable: true },
        joinSect: { type: Type.STRING, nullable: true, description: "Tên môn phái gia nhập." },
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
            nullable: false,
            description: "Sự kiện tiếp theo. BẮT BUỘC phải có."
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
                    hiddenObjectiveCompleted: { type: Type.BOOLEAN, nullable: true },
                },
                required: ['questId']
            }
        },
        scenarioStageUpdates: {
            type: Type.ARRAY,
            nullable: true,
            description: "Cập nhật trạng thái hoàn thành của các giai đoạn kịch bản.",
            items: {
                type: Type.OBJECT,
                properties: {
                    stageId: { type: Type.STRING },
                    completed: { type: Type.BOOLEAN }
                },
                required: ['stageId', 'completed']
            }
        },
        tribulationOutcome: {
            type: Type.OBJECT,
            nullable: true,
            description: "Kết quả của Thiên Kiếp.",
            properties: {
                success: { type: Type.BOOLEAN },
                nextStageId: { type: Type.STRING, nullable: true },
                achievedQualityId: { type: Type.STRING, nullable: true }
            },
            required: ['success']
        },
        activateThienMenhBan: { type: Type.BOOLEAN, nullable: true, description: "Đặt là true để kích hoạt Thiên Mệnh Bàn." },
        newStatusEffects: {
            type: Type.ARRAY,
            nullable: true,
            description: "Thêm trạng thái mới cho người chơi.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "ID của trạng thái. Ví dụ: 'poisoned'." },
                    duration: { type: Type.INTEGER, description: "Thời gian hiệu lực (số lượt)." }
                },
                required: ['id', 'duration']
            }
        },
        removeStatusEffectIds: {
            type: Type.ARRAY,
            nullable: true,
            description: "Gỡ bỏ trạng thái bằng ID.",
            items: { type: Type.STRING }
        },
        newLocationId: { type: Type.STRING, nullable: true, description: "ID của địa điểm mới mà người chơi di chuyển tới." },
        newlyDiscoveredIds: {
            type: Type.OBJECT,
            nullable: true,
            description: "Các ID của địa điểm, môn phái, hoặc NPC lần đầu tiên được đề cập trong câu chuyện.",
            properties: {
                locations: { type: Type.ARRAY, nullable: true, items: { type: Type.STRING } },
                sects: { type: Type.ARRAY, nullable: true, items: { type: Type.STRING } },
                npcs: { type: Type.ARRAY, nullable: true, items: { type: Type.STRING } }
            }
        },
    },
    required: ['outcomeDescription', 'hpChange', 'expChange', 'spiritPowerChange', 'staminaChange', 'mentalStateChange', 'daysToAdvance', 'journalEntry', 'nextEvent']
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

export const combatTurnOutcomeSchema = {
    type: Type.OBJECT,
    properties: {
        turnDescription: { type: Type.STRING },
        playerHpChange: { type: Type.NUMBER },
        enemyHpChange: { type: Type.NUMBER },
        playerStaminaChange: { type: Type.NUMBER },
        playerMentalStateChange: { type: Type.NUMBER },
        isFleeSuccessful: { type: Type.BOOLEAN, nullable: true },
        loot: { ...combatLootSchema, nullable: true, description: "Phần thưởng nếu kẻ địch bị đánh bại." },
    },
    required: ['turnDescription', 'playerHpChange', 'enemyHpChange', 'playerStaminaChange', 'playerMentalStateChange']
};

export const worldPhaseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        effects: {
            type: Type.ARRAY,
            minItems: 4,
            maxItems: 4,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['buff', 'debuff'] },
                    target: { type: Type.STRING, enum: ['world', 'board'] }
                },
                required: ['description', 'type', 'target']
            }
        }
    },
    required: ['name', 'description', 'effects']
};