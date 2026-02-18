const fs = require('fs');
const XLSX = require('xlsx');

const excelPath = 'C:\\Users\\sserd\\OneDrive\\Belgeler\\Antigravity\\2026 Yönetim Raporu.xlsx';

function readExcel() {
    try {
        if (fs.existsSync(excelPath)) {
            const workbook = XLSX.readFile(excelPath);
            console.log('\n--- EXCEL CONTENT (2026 Yönetim Raporu.xlsx) ---\n');
            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                console.log(`\n--- Sheet: ${sheetName} ---\n`);
                // Limit to first 20 rows to avoid console overflow
                data.slice(0, 20).forEach(row => console.log(JSON.stringify(row)));
            });
            console.log('\n--- END EXCEL CONTENT ---\n');
        } else {
            console.log('Excel file not found at:', excelPath);
        }
    } catch (e) {
        console.error('Error reading Excel:', e);
    }
}

readExcel();
