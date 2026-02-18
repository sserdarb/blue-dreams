const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfPath = 'C:\\Users\\sserd\\OneDrive\\Belgeler\\Antigravity\\15FEB REV.pdf';

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    console.log('\n--- PDF CONTENT (15FEB REV.pdf) ---\n');
    console.log(pdfParser.getRawTextContent());
    console.log('\n--- END PDF CONTENT ---\n');
});

try {
    if (fs.existsSync(pdfPath)) {
        pdfParser.loadPDF(pdfPath);
    } else {
        console.log('PDF file not found at:', pdfPath);
    }
} catch (e) {
    console.error('Error loading PDF:', e);
}
