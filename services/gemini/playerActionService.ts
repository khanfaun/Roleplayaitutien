import type { Player, CombatState, CombatTurnOutcome, ActionOutcome, GameState, ThienThuData, MajorRealm, MinorRealm, InitialItem, InitialCongPhap, WorldPhase, WorldLocation, InitialSect } from '../../types';
import { callGemini } from './core';
import { actionOutcomeSchema, combatTurnOutcomeSchema } from './schemas';

const formatThienThuDataForPrompt = (thienThu: ThienThuData): string => {
    const formatItem = (item: any) => `- Tên: ${item.name}, Mô tả: ${item.description}`;

    const vatPham = thienThu.vatPhamTieuHao.map(formatItem).join('\n');
    const trangBi = thienThu.trangBi.map(formatItem).join('\n');
    const phapBao = thienThu.phapBao.map(formatItem).join('\n');
    const congPhap = thienThu.congPhap.map(formatItem).join('\n');

    return `\n**Vật phẩm Tiêu hao:**\n${vatPham}\n\n**Trang bị:**\n${trangBi}\n\n**Pháp bảo:**\n${phapBao}\n\n**Công pháp:**\n${congPhap}\n`;
};

// FIX: Added helper to build location hierarchy from flat list.
const buildLocationPath = (locationId: string | null, allLocations: WorldLocation[]): WorldLocation[] => {
    if (!locationId) return [];
    const path: WorldLocation[] = [];
    let current = allLocations.find(l => l.id === locationId);
    while (current) {
        path.unshift(current);
        current = allLocations.find(l => l.id === current.parentId);
    }
    return path;
};

const getSectDisplayName = (sect: InitialSect, allSects: InitialSect[]): string => {
    if (sect.parentSectId) {
        const parentSect = allSects.find(s => s.id === sect.parentSectId);
        if (parentSect) {
            return `${parentSect.name} (${sect.name})`;
        }
    }
    return sect.name;
};

export const processPlayerAction = async (gameState: GameState, action: string, isFullContextTurn: boolean): Promise<ActionOutcome> => {
    // FIX: Removed `isThienMenhBanActive` from destructuring as it does not exist on GameState.
    const { player, quests, inventory, currentEvent, tribulationEvent, thienDaoRules, aiRules, coreMemoryRules, journal, shortTermMemory, heThong, turnCounter, scenarioSummary, scenarioStages, cultivationSystem, thienThu, worldData, inGameNpcs } = gameState;
    // FIX: Derived `isThienMenhBanActive` from the correct state property.
    const isThienMenhBanActive = heThong.unlockedFeatures.includes('thienMenhBan');
    
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
    
    const locationPath = buildLocationPath(player.currentLocationId, worldData.worldLocations);
    const currentLocation = locationPath.length > 0 ? locationPath[locationPath.length - 1] : null;
    const pathString = locationPath.map(l => l.name).join(' > ');

    const geographicalContext = `Người chơi đang ở: ${pathString}. Chi tiết về vị trí hiện tại: ${currentLocation ? JSON.stringify({ name: currentLocation.name, description: currentLocation.description, type: currentLocation.type, safetyLevel: currentLocation.safetyLevel, level: currentLocation.level }) : 'Vị trí không xác định.'}.
QUY TẮC KHOẢNG CÁCH: Di chuyển giữa các địa điểm cùng cấp bậc (level) có khoảng cách tương đối. Cấp bậc càng thấp (ví dụ, level 1 - Đại Vực), khoảng cách thực tế càng XA, đòi hỏi phi hành pháp bảo hoặc tu vi rất cao. Cấp bậc càng cao (ví dụ, level 10 - Tiểu Thôn), khoảng cách càng GẦN, có thể đi bộ. Hãy phản ánh điều này trong mô tả và kết quả hành động. Nhân vật chính không thể di chuyển đến địa điểm cấp 1 khác một cách bình thường được vì khoảng cách rất lớn.`;

    
    const formatRelationships = (sects: InitialSect[]): string => {
        const relationshipMap: Record<string, string> = { allied: 'Đồng minh', friendly: 'Thân thiện', neutral: 'Trung lập', rival: 'Cạnh tranh', hostile: 'Thù địch' };
        
        return sects.map(sect => {
            if (!sect.relationships || Object.values(sect.relationships).every(arr => !arr || arr.length === 0)) {
                return null;
            }
            const parts = Object.entries(relationshipMap).map(([key, label]) => {
                const ids = sect.relationships![key as keyof typeof relationshipMap];
                if (!ids || ids.length === 0) return null;
                const names = ids.map(id => sects.find(s => s.id === id)?.name).filter(Boolean).join(', ');
                return `${label} với ${names}`;
            }).filter(Boolean);

            if (parts.length > 0) {
                return `${getSectDisplayName(sect, sects)}: ${parts.join('; ')}.`;
            }
            return null;
        }).filter(Boolean).join('\n');
    };

    const factionRelationshipsContext = formatRelationships(worldData.initialSects);

    const npcsAtLocation = inGameNpcs.filter(npc => 
        npc.currentLocationId === player.currentLocationId && npc.id !== player.name // Assuming player name is not an NPC id
    );
    
    const npcsInSceneContext = npcsAtLocation.map(npc => ({
        id: npc.id,
        name: npc.name,
        sect: npc.sect,
        sectRank: npc.sectRank,
        attitudeTowardsPC: npc.attitudeTowardsPC,
        personality: npc.personality,
        personalHistory: npc.personalHistory,
        cultivationStage: npc.cultivationStage,
        hp: npc.hp,
        maxHp: npc.maxHp,
        spiritPower: npc.spiritPower,
        maxSpiritPower: npc.maxSpiritPower,
        stamina: npc.stamina,
        maxStamina: npc.maxStamina,
        mentalState: npc.mentalState,
        maxMentalState: npc.maxMentalState,
        statusEffects: npc.statusEffects.map(s => s.name),
        attributes: npc.attributes
    }));

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
        worldStructure: worldData.worldLocations.map(l => ({ id: l.id, name: l.name, parentId: l.parentId, description: l.description })),
        allSectsInWorld: worldData.initialSects.map(s => ({ id: s.id, name: getSectDisplayName(s, worldData.initialSects), alignment: s.alignment, description: s.description })),
        allNpcsInWorld: worldData.initialNpcs.map(n => ({id: n.id, name: n.name, description: n.description })),
        discoveredEntityIds: gameState.discoveredEntityIds,
        factionRelationships: factionRelationshipsContext,
        npcsInScene: npcsInSceneContext,
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
        scenarioStages: scenarioStages.map(s => ({ id: s.id, text: s.text, completed: s.completed })),
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
4.  **QUAN TRỌNG NHẤT: SỰ KIỆN KẾ TIẾP (\`nextEvent\` và các gợi ý)**
    -   **NẾU ĐỘT PHÁ THÀNH CÔNG, BẠN BẮT BUỘC PHẢI TẠO RA MỘT \`nextEvent.description\` MỚI và 4 gợi ý hành động mới.**
    -   **VIỆC ĐỂ \`nextEvent\` LÀ \`null\` SAU KHI THÀNH CÔNG LÀ MỘT LỖI NGHIÊM TRỌNG VÀ KHÔNG ĐƯỢỢC PHÉP XẢY RA.**
    -   Sự kiện này phải tiếp nối câu chuyện, liên quan đến cảnh giới mới. Các ví dụ tốt: "Năng lượng đột phá của ngươi làm kinh động một yêu thú cường đại gần đó, nó đang lao tới!", "Cảnh giới mới giúp ngươi cảm nhận được một bí cảnh vừa mở ra ở phía xa."
5.  \`outcomeDescription\` phải mô tả diễn biến thiên kiếp một cách kịch tính.
`;
    }

    const commonPromptEnding = `**YÊU CẦU ĐẦU RA:**
Dựa vào toàn bộ bối cảnh và hành động của người chơi, hãy tạo ra một phản hồi JSON duy nhất tuân thủ schema đã cung cấp.
- **\`outcomeDescription\`**: Viết một đoạn văn chi tiết, hấp dẫn để mô tả kết quả hành động.
- **\`nextEvent\`**: Mô tả bối cảnh cho sự kiện tiếp theo và cung cấp chính xác 4 lựa chọn hành động trong mảng 'options'.
- **\`journalEntry\`**: Tóm tắt \`outcomeDescription\` thành một câu RẤT NGẮN GỌN (5-50 từ).
- **Cập nhật trạng thái:** Cập nhật các nhiệm vụ, chỉ số, trạng thái của người chơi và NPC một cách logic.
- **Cập nhật Giai đoạn Kịch bản:** Phân tích diễn biến câu chuyện. Nếu hành động của người chơi đã hoàn thành mục tiêu của một giai đoạn kịch bản chưa hoàn thành (completed: false), hãy trả về ID và trạng thái mới (completed: true) trong mảng \`scenarioStageUpdates\`.`;

    const formattedThienThuData = formatThienThuDataForPrompt(thienThu);

    if (isFullContextTurn) {
        const recentJournalEntries = journal.slice(-10).map(j => `Lượt ${j.turn}: ${j.text}`);
        const historicalJournalEntries = journal.slice(0, -10).reverse().map(j => `Lượt ${j.turn}: ${j.text}`);
        const prompt = `${tribulationInstructions}
Bạn là Quản Trò AI. Đây là một lượt có BỐI CẢNH ĐẦY ĐỦ.
**BƯỚC 1: ĐỌC LUẬT LỆ**
*   **Thiên Đạo:** ${JSON.stringify(thienDaoRules.map(r => r.text))}
*   **BỘ NHỚ CỐT LÕI (BẤT BIẾN):** ${JSON.stringify(coreMemoryRules.map(r => r.text))}
*   **Quy Tắc AI:** ${JSON.stringify(aiRules.map(r => r.text))}

**BƯỚC 2: ĐỌC DỮ LIỆU THIÊN THƯ (VẬT PHẨM TỒN TẠI TRONG THẾ GIỚI)**
*   **Danh sách vật phẩm, trang bị, pháp bảo, công pháp có sẵn:** ${formattedThienThuData}
*   **QUY TẮC:** Khi tạo \`newItem\`, bạn PHẢI chọn một vật phẩm có sẵn từ danh sách này.

**BƯỚC 3: PHÂN TÍCH CỐT TRUYỆN**
*   **Tóm Tắt Kịch Bản:** ${scenarioSummary}
*   **Các Giai Đoạn Cốt Truyện:** ${JSON.stringify(scenarioStages.slice(0, 15).map(s => s.text))}

**BƯỚC 4: PHÂN TÍCH LỊCH SỬ**
*   **10 Diễn Biến Gần Nhất:** ${JSON.stringify(recentJournalEntries)}
*   **Lịch sử xa hơn:** ${JSON.stringify(historicalJournalEntries)}

**BƯỚC 5: PHÂN TÍCH BỐI CẢNH HIỆN TẠI**
*   **Toàn Bộ Trạng Thái Game:** ${JSON.stringify(context)}

**BƯỚC 6: XỬ LÝ HÀNH ĐỘNG**
*   **Hành Động Người Chơi:** "${action}"

${commonPromptEnding}`;
        return callGemini(prompt, actionOutcomeSchema);
    } else {
        const shortTermHistory = shortTermMemory.map(j => `Lượt ${j.turn}: ${j.text}`);
        const prompt = `${tribulationInstructions}
Bạn là Quản Trò AI. Đây là một lượt có BỐI CẢNH RÚT GỌN.
**BƯỚC 1: ĐỌC LUẬT LỆ**
*   **Thiên Đạo:** ${JSON.stringify(thienDaoRules.map(r => r.text))}
*   **BỘ NHỚ CỐT LÕI (BẤT BIẾN):** ${JSON.stringify(coreMemoryRules.map(r => r.text))}
*   **Quy Tắc AI:** ${JSON.stringify(aiRules.map(r => r.text))}

**BƯỚC 2: ĐỌC DỮ LIỆU THIÊN THƯ (VẬT PHẨM TỒN TẠI TRONG THẾ GIỚI)**
*   **Danh sách vật phẩm, trang bị, pháp bảo, công pháp có sẵn:** ${formattedThienThuData}
*   **QUY TẮC:** Khi tạo \`newItem\`, bạn PHẢI chọn một vật phẩm có sẵn từ danh sách này.

**BƯỚC 3: PHÂN TÍCH CỐT TRUYỆN**
*   **Tóm Tắt Kịch Bản:** ${scenarioSummary}
*   **Các Giai Đoạn Cốt Truyện:** ${JSON.stringify(scenarioStages.slice(0, 15).map(s => s.text))}

**BƯỚC 4: PHÂN TÍCH BỐI CẢNH HIỆN TẠI VÀ TRÍ NHỚ NGẮN HẠN**
*   **Toàn Bộ Trạng Thái Game Hiện Tại:** ${JSON.stringify(context)}
*   **Diễn Biến Gần Đây:** ${JSON.stringify(shortTermHistory)}

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