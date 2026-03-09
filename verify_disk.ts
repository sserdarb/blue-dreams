import * as fs from 'fs';
import * as path from 'path';

const file = fs.readFileSync(path.join(__dirname, 'lib/services/elektra.ts'), 'utf8');

if (file.includes("[DEBUG] resolveCountry")) {
    console.log("YES, the file on disk HAS the new resolveCountry.");
} else {
    console.log("NO, the file on disk does NOT have the new resolveCountry!");
}

const match = file.match(/function resolveCountry[\s\S]*?\n\}/);
if (match) {
    console.log("Current resolveCountry implementation on disk:");
    console.log(match[0]);
}
