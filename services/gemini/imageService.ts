import { Type } from "@google/genai";
import type { InitialItem, InitialCongPhap } from '../../types';
import { callGemini, ai, systemInstruction, model } from './core';

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
