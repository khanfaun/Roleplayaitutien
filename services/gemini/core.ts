import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

export let ai: GoogleGenAI | null = null;
export const model = 'gemini-2.5-flash';

// FIX: Replaced backticks around 'nextEvent' and 'responseSchema' with single quotes to avoid template literal parsing issues.
export const systemInstruction = `Bạn là một AI Quản Trò (Game Master) cho game tu tiên 'Phi Thăng Bí Sử'. Nhiệm vụ của bạn là dệt nên một câu chuyện liền mạch, logic và hấp dẫn dựa trên bối cảnh toàn diện của người chơi.

**NGUYÊN TẮC HOẠT ĐỘNG CỐT LÕI (BẤT BIẾN):**
1.  **ƯU TIÊN TUYỆT ĐỐI**: Các quy tắc ('coreMemoryRules', 'aiRules', 'thienDaoRules') được cung cấp trong từng prompt có độ ưu tiên cao nhất. Bạn PHẢI tuân thủ chúng trước mọi hướng dẫn khác trong đây.
2.  **LOGIC BỐI CẢNH**: Mọi kết quả bạn tạo ra PHẢI logic và phù hợp với 'context' được cung cấp.
3.  **NHẤT QUÁN & CẤU TRÚC**: Luôn tuân thủ nghiêm ngặt schema JSON được yêu cầu. Khi nhiệm vụ hoàn thành/thất bại, chỉ cần cập nhật trạng thái trong 'questUpdates' hoặc 'heThongQuestUpdates'.
4.  **THỜI GIAN**: Trường 'daysToAdvance' không còn được sử dụng. Luôn trả về giá trị 0.
5.  **ĐỊNH DẠNG ĐẦU RA (CỰC KỲ QUAN TRỌNG):** Toàn bộ phản hồi của bạn BẮT BUỘC phải là một chuỗi JSON hợp lệ, tuân thủ 'responseSchema' được cung cấp. KHÔNG được thêm bất kỳ văn bản nào khác ngoài khối JSON.
6.  **SỰ KIỆN KẾ TIẾP**: Trường 'nextEvent' trong JSON BẮT BUỘC phải chứa một đối tượng hợp lệ (description và options), không bao giờ được là null, trừ khi có yêu cầu đặc biệt trong prompt.
7.  **GỢI Ý HÀNH ĐỘNG**: Mảng 'nextEvent.options' BẮT BUỘC phải chứa ĐÚNG 4 chuỗi ký tự. Mỗi chuỗi là một gợi ý hành động rõ ràng cho người chơi, kèm theo một chú thích ngắn gọn về rủi ro/cơ hội trong dấu ngoặc đơn ().`;

export function initializeGeminiClient(apiKey: string) {
    if (!apiKey) {
        throw new Error("API key is required to initialize Gemini client.");
    }
    ai = new GoogleGenAI({ apiKey });
}

export function clearGeminiClient() {
    ai = null;
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) return false;
    try {
        const tempAi = new GoogleGenAI({ apiKey });
        // Make a simple, non-streaming call to validate the key.
        await tempAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Hi'
        });
        return true;
    } catch (e) {
        console.error("API Key validation failed", e);
        return false;
    }
}

// A robust function to call Gemini and handle responses.
export async function callGemini<T>(prompt: string, responseSchema: any): Promise<T> {
    if (!ai) {
        throw new Error("Lỗi Cấu Hình API: Gemini client chưa được khởi tạo. Vui lòng cung cấp API Key.");
    }
    
    try {
        console.log("Calling Gemini with prompt:", prompt.substring(0, 200) + '...');
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const jsonText = response.text.trim();
        
        // Sometimes the model might still wrap the JSON in ```json ... ``` despite the MIME type instruction.
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
        const parsableText = jsonMatch ? jsonMatch[1] : jsonText;

        return JSON.parse(parsableText) as T;
    } catch (e: any) {
        console.error("Gemini API call failed:", e);
        const errorMessage = e.message || "Unknown error";
        if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('permission denied')) {
             throw new Error("Lỗi Xác Thực: API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.");
        }
        if (errorMessage.includes('quota')) {
            throw new Error("Lỗi Giới Hạn: Đã đạt đến giới hạn sử dụng API. Vui lòng thử lại sau.");
        }
        throw new Error(`Lỗi giao tiếp với Thiên Đạo. Xin hãy thử lại. Chi tiết: ${errorMessage}`);
    }
}