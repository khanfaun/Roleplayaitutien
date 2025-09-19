import { GoogleGenAI } from "@google/genai";

export let ai: GoogleGenAI | null = null;
export const model = 'gemini-2.5-flash';

export const systemInstruction = `Bạn là một AI Quản Trò (Game Master) cho game tu tiên 'Phi Thăng Bí Sử'. Nhiệm vụ của bạn là dệt nên một câu chuyện liền mạch, logic và hấp dẫn dựa trên bối cảnh toàn diện của người chơi.

**NGUYÊN TẮC HOẠT ĐỘNG CỐT LÕI (BẤT BIẾN):**
1.  **ƯU TIÊN TUYỆT ĐỐI**: Các quy tắc ('coreMemoryRules', 'aiRules', 'thienDaoRules') được cung cấp trong từng prompt có độ ưu tiên cao nhất. Bạn PHẢI tuân thủ chúng trước mọi hướng dẫn khác trong đây.
2.  **LOGIC BỐI CẢNH**: Mọi kết quả bạn tạo ra PHẢI logic và phù hợp với 'context' được cung cấp.
3.  **NHẤT QUÁN & CẤU TRÚC**: Luôn tuân thủ nghiêm ngặt schema JSON được yêu cầu. Khi nhiệm vụ hoàn thành/thất bại, chỉ cần cập nhật trạng thái trong 'questUpdates' hoặc 'heThongQuestUpdates'.
4.  **THỜI GIAN**: Trường 'daysToAdvance' không còn được sử dụng. Luôn trả về giá trị 0.`;

export function initializeGeminiClient(apiKey: string) {
    ai = new GoogleGenAI({ apiKey });
}

export function clearGeminiClient() {
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


export const callGemini = async (prompt: string, schema: any, options: { forceStringOutput?: boolean } = {}) => {
    if (!ai) {
        throw new Error("Lỗi Cấu Hình API: Gemini client chưa được khởi tạo. Vui lòng cung cấp API Key.");
    }
    let jsonText = '';
    try {
        const config: any = {
            systemInstruction,
        };

        if (options.forceStringOutput) {
            // No responseMimeType or responseSchema needed. The prompt will handle the structure.
        } else {
            config.responseMimeType = "application/json";
            config.responseSchema = schema;
        }

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config,
        });

        jsonText = response.text.trim();

        // If the output is expected to be a string that IS a JSON, we need to parse it.
        if (options.forceStringOutput) {
            // Sometimes the model might wrap the JSON in markdown, remove it.
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.substring(7, jsonText.length - 3).trim();
            }
        }
        
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