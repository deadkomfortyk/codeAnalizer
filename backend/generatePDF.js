const fs = require('fs');
const PDFDocument = require('pdfkit');

function generatePDF(analysisResult, outputPath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        doc.font('Helvetica');
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        doc.fontSize(16).text('Analysis Result', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text('Code:', { align: 'left' });
        doc.moveDown();

        const lines = analysisResult.fileContent.split('\n');
        const issueLines = new Set(analysisResult.issues.map(issue => issue.line));

        lines.forEach((line, index) => {
            const lineNumber = `${index + 1}: `.padStart(5, ' ');
            if (issueLines.has(index + 1)) {
                doc.fillColor('red').text(lineNumber + line, { continued: false });
            } else {
                doc.fillColor('black').text(lineNumber + line, { continued: false });
            }
        });

        doc.moveDown();
        doc.fillColor('black').fontSize(12).text('Issues:', { align: 'left' });
        doc.moveDown();

        if (analysisResult.issues.length > 0) {
            analysisResult.issues.forEach(issue => {
                doc.fillColor('red').text(`Line ${issue.line}: ${issue.issue}`, { align: 'left' });
            });
        } else {
            doc.text('No issues found', { align: 'left' });
        }

        doc.end();

        stream.on('finish', () => {
            resolve();
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = { generatePDF };
