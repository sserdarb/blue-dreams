import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
    try {
        const { text, targetLang = 'tr' } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text required' }, { status: 400 });
        }

        const prompt = `Translate the following text into ${targetLang === 'tr' ? 'Turkish' : 'English'}. Return ONLY the translated text without any explanation, quotes, or markdown formatting.\n\nText: ${text}`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
        });

        const translatedText = response.text?.trim() || '';

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error('[Translation Error]', error);
        return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }
}
