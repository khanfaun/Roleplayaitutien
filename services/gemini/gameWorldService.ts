import { Type } from "@google/genai";
// FIX: Removed unused/non-existent types to resolve import errors.
import type { Player, BoardSquare, Quest, CurrentEvent, ActionOutcome, WorldPhase, GameState, ScenarioData, InitialItem, InitialCongPhap, InitialNpc, InitialSect, WorldLocation } from '../../types';
import { BOARD_SIZE } from "../../constants";
import { callGemini } from './core';
import {
    boardSquareSchema,
    currentEventSchema,
    worldPhaseSchema,
    questSchemaWithoutId,
    actionOutcomeSchema
} from './schemas';

interface ScenarioResponse {
    story: string;
    board: BoardSquare[];
    initialQuest: Omit<Quest, 'status' | 'id'>;
    initialEvent: CurrentEvent;
    worldPhase: WorldPhase;
    journalEntry: string;
}

// Helper function to format sect names correctly, especially for sub-sects.
const getSectDisplayName = (sect: InitialSect, allSects: InitialSect[]): string => {
    if (sect.parentSectId) {
        const parentSect = allSects.find(s => s.id === sect.parentSectId);
        if (parentSect) {
            return `${parentSect.name} (${sect.name})`;
        }
    }
    return sect.name;
};


const formatInitialElements = (data: ScenarioData) => {
    let result = "Dựa vào các yếu tố dưới đây để lồng ghép vào câu chuyện và trạng thái khởi đầu của người chơi.\n\n";

    const formatSection = (title: string, items: any[], formatter: (item: any) => string) => {
        if (items.length > 0) {
            result += `**${title}:**\n${items.map(item => `- ${formatter(item)}`).join('\n')}\n\n`;
        }
    };

    // TỐI ƯU: Xóa các vật phẩm, trang bị, công pháp khỏi prompt để giảm độ dài và tăng tốc độ xử lý của AI.
    // Các vật phẩm này sẽ được logic game tự thêm vào, AI không cần biết trong giai đoạn khởi tạo.

    formatSection("NPC", data.initialNpcs, (npc: InitialNpc) =>
        `Tên: ${npc.name}. Mô tả: ${npc.description}. ${npc.relationship ? `Quan hệ: ${npc.relationship}.` : ''}`
    );
    formatSection("Môn Phái", data.initialSects, (sect: InitialSect) => {
        let relStr = '';
        if (sect.relationships) {
            const relationshipMap: Record<string, string> = { allied: 'Đồng minh', friendly: 'Thân thiện', neutral: 'Trung lập', rival: 'Cạnh tranh', hostile: 'Thù địch' };
            const parts = Object.entries(relationshipMap).map(([key, label]) => {
                const ids = sect.relationships![key as keyof typeof relationshipMap];
                if (!ids || ids.length === 0) return null;
                const names = ids.map(id => data.initialSects.find(s => s.id === id)?.name).filter(Boolean).join(', ');
                return `${label}: ${names}`;
            }).filter(Boolean);
            if (parts.length > 0) {
                relStr = ` Quan hệ: ${parts.join('; ')}.`;
            }
        }
        return `Tên: ${getSectDisplayName(sect, data.initialSects)}, Phe phái: ${sect.alignment}. Mô tả: ${sect.description}.${relStr}`;
    });
    
    // FIX: Refactored world structure generation to correctly use the hierarchical `worldLocations` array.
    const allLocations = data.worldLocations;
    if (allLocations.length > 0) {
        result += `**Cấu trúc Thế Giới:**\n`;
        // FIX: Introduced a recursive type `TreeLocation` to correctly type the hierarchical structure, resolving a type error in the `traverseAndFormat` function.
        type TreeLocation = WorldLocation & { children: TreeLocation[] };
        const locationMap: Record<string, TreeLocation> = {};
        const roots: TreeLocation[] = [];

        allLocations.forEach(loc => {
            locationMap[loc.id] = { ...loc, children: [] };
        });

        allLocations.forEach(loc => {
            if (loc.parentId && locationMap[loc.parentId]) {
                locationMap[loc.parentId].children.push(locationMap[loc.id]);
            } else {
                roots.push(locationMap[loc.id]);
            }
        });
        
        const traverseAndFormat = (node: TreeLocation, depth: number) => {
            const controllingSects = (node.controllingSectIds || [])
                .map(id => data.initialSects.find(s => s.id === id))
                .filter((s): s is InitialSect => !!s)
                .map(s => getSectDisplayName(s, data.initialSects));
        
            let controlText = '';
            const sovereigntyType = node.sovereigntyType || 'autonomous';
            if (controllingSects.length > 0) {
                if (sovereigntyType === 'autonomous') {
                    controlText = ` (Thế lực đại diện: ${controllingSects.join(', ')})`;
                } else {
                    controlText = ` (Phụ thuộc vào: ${controllingSects.join(', ')})`;
                }
            } else {
                controlText = ' (Vô chủ)';
            }
        
            result += `${' '.repeat(depth * 2)}- ${node.name} (Cấp ${node.level}, ${sovereigntyType === 'autonomous' ? 'Tự chủ' : 'Phụ thuộc'})${controlText}: ${node.description}\n`;
            node.children.forEach(child => traverseAndFormat(child, depth + 1));
        };
        
        roots.forEach(root => traverseAndFormat(root, 0));
        result += '\n';
    }


    return result.trim() === "Dựa vào các yếu tố dưới đây để lồng ghép vào câu chuyện và trạng thái khởi đầu của người chơi." ? "Không có yếu tố khởi đầu nào được chỉ định." : result;
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

interface InitialStoryResponse {
    story: string;
    initialQuest: Omit<Quest, 'status' | 'id'>;
    initialEvent: CurrentEvent;
    journalEntry: string;
}

const generateInitialStory = async (commonPromptParts: string): Promise<InitialStoryResponse> => {
    const prompt = `${commonPromptParts}

**YÊU CẦU TẠO GAME (PHẦN 1 - CỐT TRUYỆN):**
1.  Dựa vào toàn bộ thông tin trên, viết một đoạn truyện giới thiệu ngắn gọn, hấp dẫn, lồng ghép các yếu tố khởi đầu một cách tự nhiên.
2.  Tạo một nhiệm vụ ban đầu thuộc loại 'Cốt truyện'. Nhiệm vụ này PHẢI là bước khởi đầu cho Giai đoạn 1 của cốt truyện đã cho.
3.  Tạo một sự kiện ban đầu để người chơi bắt đầu hành trình. Sự kiện này PHẢI tuân thủ quy tắc tạo 4 gợi ý chi tiết.
4.  Từ đoạn truyện giới thiệu bạn vừa viết, hãy tạo một chuỗi 'journalEntry' tóm tắt RẤT NGẮN GỌN (5-50 từ) để làm nhật ký khởi đầu cho người chơi.
`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            story: { type: Type.STRING },
            initialQuest: questSchemaWithoutId,
            initialEvent: currentEventSchema,
            journalEntry: { type: Type.STRING, description: "Tóm tắt RẤT NGẮN GỌN (5-50 từ) của 'story' để làm nhật ký đầu tiên." }
        },
        required: ['story', 'initialQuest', 'initialEvent', 'journalEntry']
    };

    return callGemini(prompt, schema);
}

const generateInitialBoard = async (setupData: ScenarioData): Promise<BoardSquare[]> => {
    const heThongRule = "Hệ thống (Bàn Tay Vàng) sẽ được kích hoạt bởi cơ chế game, không phải bởi một ô trên bàn cờ. Vì vậy, TUYỆT ĐỐI KHÔNG tạo ra ô 'Kỳ Ngộ' có tên 'Thiên Mệnh Thức Tỉnh' hoặc các sự kiện tương tự để kích hoạt Hệ Thống.";
    
    const prompt = `Dựa trên độ khó game là '${setupData.difficulty}', hãy tạo một **Thiên Mệnh Bàn** (Destiny Board) ${BOARD_SIZE} ô.
- Ô đầu tiên (ID 0) PHẢI là loại 'Khởi đầu' với mô tả như 'Vòng lặp nhân sinh mới'.
- ${heThongRule}
- Các ô còn lại hãy phân bố ngẫu nhiên.
- Độ khó '${setupData.difficulty}' nên được phản ánh trong việc phân bố các ô (ví dụ: độ khó cao có nhiều ô 'Tai Ương', 'Xui Xẻo' hơn).
- "description" của mỗi ô phải là tên của một biến cố vận mệnh, không phải tên một địa điểm.`;

    const schema = {
        type: Type.ARRAY,
        items: boardSquareSchema
    };

    return callGemini(prompt, schema);
}


export const generateScenario = async (setupData: ScenarioData): Promise<ScenarioResponse> => {
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
        case 'Cực dễ':
        case 'Dễ':
            difficultyInstruction = "Tạo ra một thế giới khởi đầu tương đối dễ dàng. Kẻ địch yếu hơn, tài nguyên phong phú hơn, các sự kiện may mắn xuất hiện thường xuyên hơn.";
            break;
        case 'Bình thường':
            difficultyInstruction = "Tạo ra một thế giới cân bằng về thử thách và cơ hội.";
            break;
        case 'Cực khó':
        case 'Khó':
            difficultyInstruction = "Tạo ra một thế giới khắc nghiệt. Kẻ địch mạnh và thông minh hơn, tài nguyên khan hiếm, các sự kiện tai ương và thử thách xuất hiện thường xuyên hơn. Kỳ ngộ hiếm và nguy hiểm hơn.";
            break;
    }

    const startingLocation = setupData.startingLocationId
        ? setupData.worldLocations.find(loc => loc.id === setupData.startingLocationId)
        : null;
    
    let startingGeographicalContext = "Chưa được chỉ định. Bạn có quyền tự do quyết định nơi bắt đầu câu chuyện dựa trên tiểu sử và bối cảnh chung.";
    if(startingLocation) {
        const path = buildLocationPath(startingLocation.id, setupData.worldLocations);
        const locationNames = path.map(p => p.name);
        startingGeographicalContext = `Câu chuyện PHẢI bắt đầu tại địa điểm sau: ${locationNames.join(' > ')}\nHãy mô tả bối cảnh ở đây một cách chi tiết trong đoạn truyện giới thiệu.`;
    }

    const commonPromptParts = `Tạo một kịch bản bắt đầu hoàn chỉnh cho người chơi, dựa trên các thông tin sau:

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
${startingGeographicalContext}`;

    const [storyResponse, board, worldPhase] = await Promise.all([
        generateInitialStory(commonPromptParts),
        generateInitialBoard(setupData),
        generateWorldPhase("Hồng Hoang Sơ Khai")
    ]);
    
    return {
        ...storyResponse,
        board,
        worldPhase,
    };
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
    // FIX: Rebuilt geographical context generation using the hierarchical `worldLocations`.
    const locationPath = buildLocationPath(player.currentLocationId, worldData.worldLocations);
    const currentLocation = locationPath.length > 0 ? locationPath[locationPath.length - 1] : null;
    const pathString = locationPath.map(l => l.name).join(' > ');

    const controllingSects = (currentLocation?.controllingSectIds || [])
        .map(id => worldData.initialSects.find(s => s.id === id))
        .filter((s): s is InitialSect => !!s)
        .map(s => getSectDisplayName(s, worldData.initialSects));
    
    const sovereigntyType = currentLocation?.sovereigntyType || 'autonomous';
    let controlText = '';
    if (controllingSects && controllingSects.length > 0) {
        if (sovereigntyType === 'autonomous') {
            controlText = ` Đây là một địa điểm tự chủ, với các thế lực đại diện là: ${controllingSects.join(', ')}.`;
        } else {
            controlText = ` Đây là một địa điểm phụ thuộc, bị kiểm soát bởi các thế lực từ nơi khác: ${controllingSects.join(', ')}.`;
        }
    } else {
        controlText = ' Đây là một vùng đất vô chủ.';
    }

    const geographicalContext = `Người chơi đang ở: ${pathString}. Chi tiết: ${currentLocation ? JSON.stringify({ name: currentLocation.name, description: currentLocation.description, type: currentLocation.type, level: currentLocation.level }) : 'Không xác định.'}${controlText}
QUY TẮC KHOẢNG CÁCH: Di chuyển giữa các địa điểm cùng cấp bậc (level) có khoảng cách tương đối. Cấp bậc càng thấp (ví dụ, level 1 - Đại Vực), khoảng cách thực tế càng XA, đòi hỏi phi hành pháp bảo hoặc tu vi rất cao. Cấp bậc càng cao (ví dụ, level 10 - Tiểu Thôn), khoảng cách càng GẦN, có thể đi bộ. Hãy phản ánh điều này trong mô tả và kết quả hành động. Nhân vật chính không thể di chuyển đến địa điểm cấp 1 khác một cách bình thường được vì khoảng cách rất lớn.`;
    
    const prompt = `Người chơi '${player.name}' (Tuổi ${player.age}/${player.lifespan}, Cảnh giới: ${player.cultivationStage}) đã lắc xúc xắc, và vận mệnh của họ đã ứng với một ô trên Thiên Mệnh Bàn.
*   **Bối cảnh Địa lý Hiện tại:** ${geographicalContext}
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