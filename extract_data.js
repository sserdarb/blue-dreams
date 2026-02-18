const fs = require('fs');
const pdf = require('pdf-parse');
const XLSX = require('xlsx');

const pdfPath = 'C:\\Users\\sserd\\OneDrive\\Belgeler\\Antigravity\\15FEB REV.pdf';
const excelPath = 'C:\\Users\\sserd\\OneDrive\\Belgeler\\Antigravity\\2026 Yönetim Raporu.xlsx';

async function readPdf() {
    try {
        if (fs.existsSync(pdfPath)) {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);
            console.log('\n--- PDF CONTENT (15FEB REV.pdf) ---\n');
            console.log(data.text);
            console.log('\n--- END PDF CONTENT ---\n');
        } else {
            console.log('PDF file not found at:', pdfPath);
        }
    } catch (e) {
        console.error('Error reading PDF:', e);
    }
}

function readExcel() {
    try {
        if (fs.existsSync(excelPath)) {
            const workbook = XLSX.readFile(excelPath);
            console.log('\n--- EXCEL CONTENT (2026 Yönetim Raporu.xlsx) ---\n');
            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                console.log(`\n--- Sheet: ${sheetName} ---\n`);
                // Limit to first 50 rows to avoid console overflow if huge
                data.slice(0, 50).forEach(row => console.log(JSON.stringify(row)));
            });
            console.log('\n--- END EXCEL CONTENT ---\n');
        } else {
            console.log('Excel file not found at:', excelPath);
        }
    } catch (e) {
        console.error('Error reading Excel:', e);
    }
}

(async () => {
    await readPdf();
    readExcel();
})();
