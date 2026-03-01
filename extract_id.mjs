import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

// Using the verified API key from knowledge context
const ai = new GoogleGenAI({ apiKey: 'AIzaSyC6ApKPTkvPZJ35eN6gjSDfPe89QO93sEA' });

async function analyze() {
    try {
        const imagePath = 'C:\\Users\\sserd\\.gemini\\antigravity\\brain\\d640d326-ed6e-42e2-af49-ce8ffe7f65c4\\get_phone_id_1772135184037.webp';

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: 'Look very closely at this screenshot of the Meta Developer Console for WhatsApp. Look for the "Phone number ID" (Telefon numarası kimliği). It is usually a 15-digit number. Return ONLY the numeric ID.' },
                        {
                            inlineData: {
                                data: fs.readFileSync(imagePath).toString("base64"),
                                mimeType: "image/webp"
                            }
                        }
                    ]
                }
            ]
        });

        console.log("Phone ID:", response.text);
    } catch (e) {
        console.error("Error analyzing get_phone_id:", e.message);
    }

    try {
        const imagePath2 = 'C:\\Users\\sserd\\.gemini\\antigravity\\brain\\d640d326-ed6e-42e2-af49-ce8ffe7f65c4\\whatsapp_config_1772134601808.webp';

        const response2 = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: 'Look very closely at this screenshot. Is the WhatsApp Phone number ID or Instagram Account ID visible? If so, what is it? Return ONLY the explicit numeric ID.' },
                        {
                            inlineData: {
                                data: fs.readFileSync(imagePath2).toString("base64"),
                                mimeType: "image/webp"
                            }
                        }
                    ]
                }
            ]
        });

        console.log("Config Image:", response2.text);
    } catch (e) {
        console.error("Error analyzing config image:", e.message);
    }
}
analyze();
