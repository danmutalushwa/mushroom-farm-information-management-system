const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
    async generateReport(report) {
        const reportsDir = path.join(__dirname, '../../uploads/reports');

        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const fileName = `${report.reportNumber}.pdf`;
        const filePath = path.join(reportsDir, fileName);

        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });

        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        doc.fontSize(22).text(report.title, {
            align: 'center'
        });

        doc.moveDown();

        doc.fontSize(12).text(`Report Number: ${report.reportNumber}`);
        doc.text(`Report Type: ${report.reportType}`);
        doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);

        doc.moveDown();

        doc.fontSize(16).text('Summary');

        doc.moveDown();

        doc.fontSize(11).text(
            JSON.stringify(report.summary || {}, null, 2)
        );

        doc.moveDown();

        doc.fontSize(16).text('Data');

        doc.moveDown();

        doc.fontSize(10).text(
            JSON.stringify(report.data, null, 2)
        );

        doc.end();

        return new Promise((resolve) => {
            stream.on('finish', () => {
                resolve({
                    fileName,
                    filePath,
                    fileUrl: `/uploads/reports/${fileName}`,
                    fileSize: fs.statSync(filePath).size
                });
            });
        });
    }
}

module.exports = new PDFService();