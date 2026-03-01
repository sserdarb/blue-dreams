import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

async function main() {
    console.log("Starting WebP OCR...");
    const worker = await createWorker('eng');

    const files = [
        'C:\\Users\\sserd\\.gemini\\antigravity\\brain\\d640d326-ed6e-42e2-af49-ce8ffe7f65c4\\get_phone_id_1772135184037.webp',
        'C:\\Users\\sserd\\.gemini\\antigravity\\brain\\d640d326-ed6e-42e2-af49-ce8ffe7f65c4\\whatsapp_config_1772134601808.webp'
    ];

    for (const file of files) {
        console.log(`\n--- Reading ${file} ---`);
        try {
            const pngBuffer = await sharp(file).png().toBuffer();

            const ret = await worker.recognize(pngBuffer);

            const lines = ret.data.text.split('\n');
            for (const line of lines) {
                const match = line.match(/\b\d{10,20}\b/);
                // Specifically look for the 15 digit phone ID
                if (match) {
                    console.log(`[MATCH] > ${line.trim()}`);
                } else if (line.toLowerCase().includes('id')) {
                    console.log(`[ID] > ${line.trim()}`);
                }
            }

        } catch (e) {
            console.error(`Error processing ${file}: ${e.message}`);
        }
    }

    await worker.terminate();
}

main();
