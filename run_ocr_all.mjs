import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log("Starting WebP OCR on all meta/whatsapp images...");
    const worker = await createWorker('eng');

    const dir = 'C:\\Users\\sserd\\.gemini\\antigravity\\brain\\d640d326-ed6e-42e2-af49-ce8ffe7f65c4';
    const files = fs.readdirSync(dir).filter(f =>
        (f.includes('whatsapp') || f.includes('meta') || f.includes('facebook') || f.includes('messenger')) &&
        (f.endsWith('.webp') || f.endsWith('.png'))
    );

    for (const f of files) {
        const file = path.join(dir, f);
        console.log(`\n--- Reading ${f} ---`);
        try {
            let buffer;
            if (file.endsWith('.webp')) {
                buffer = await sharp(file).png().toBuffer();
            } else {
                buffer = fs.readFileSync(file);
            }

            const ret = await worker.recognize(buffer);

            const lines = ret.data.text.split('\n');
            for (const line of lines) {
                const match = line.match(/\b\d{14,16}\b/);
                if (match || line.toLowerCase().includes('phone') || line.toLowerCase().includes('id:')) {
                    console.log(`[MATCH] > ${line.trim()}`);
                }
            }
        } catch (e) {
            console.error(`Error processing ${f}: ${e.message}`);
        }
    }

    await worker.terminate();
}

main();
