const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class FactoryQuotationPDFGenerator {
  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
  }

  // Static method to clean up old PDF files
  static cleanupOldPDFs(maxAgeHours = 24) {
    try {
      const uploadsDir = path.join(__dirname, '../uploads');
      const pdfsDir = path.join(uploadsDir, 'pdfs');
      
      if (!fs.existsSync(pdfsDir)) {
        return;
      }

      const now = new Date();
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds
      
      const files = fs.readdirSync(pdfsDir);
      let cleanedCount = 0;

      files.forEach(file => {
        if (file.endsWith('.pdf')) {
          const filePath = path.join(pdfsDir, file);
          const stats = fs.statSync(filePath);
          const fileAge = now.getTime() - stats.mtime.getTime();

          if (fileAge > maxAgeMs) {
            try {
              fs.unlinkSync(filePath);
              console.log(`Cleaned up old PDF: ${file}`);
              cleanedCount++;
            } catch (error) {
              console.error(`Error removing old PDF ${file}:`, error);
            }
          }
        }
      });

      console.log(`PDF cleanup completed. Removed ${cleanedCount} old files.`);
    } catch (error) {
      console.error('Error during PDF cleanup:', error);
    }
  }

  generateFactoryQuotationPDF(quotationData) {
    return new Promise((resolve, reject) => {
      try {
        // Clean up old PDF files first
        FactoryQuotationPDFGenerator.cleanupOldPDFs(24); // Remove files older than 24 hours

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../uploads');
        const pdfsDir = path.join(uploadsDir, 'pdfs');
        
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        if (!fs.existsSync(pdfsDir)) {
          fs.mkdirSync(pdfsDir, { recursive: true });
        }

        // Remove old PDF files for this quotation
        const oldPdfPattern = `factory_quotation_${quotationData.id}_*.pdf`;
        const oldPdfFiles = fs.readdirSync(pdfsDir).filter(file => 
          file.startsWith(`factory_quotation_${quotationData.id}_`)
        );
        
        oldPdfFiles.forEach(oldFile => {
          const oldFilePath = path.join(pdfsDir, oldFile);
          try {
            fs.unlinkSync(oldFilePath);
            console.log(`Removed old PDF: ${oldFile}`);
          } catch (error) {
            console.error(`Error removing old PDF ${oldFile}:`, error);
          }
        });

        // Generate unique filename with timestamp
        const timestamp = new Date().getTime();
        const filename = `factory_quotation_${quotationData.id}_${timestamp}.pdf`;
        const filepath = path.join(pdfsDir, filename);

        // Create write stream
        const stream = fs.createWriteStream(filepath);
        this.doc.pipe(stream);

        // Generate PDF content
        this.generatePDFContent(quotationData);

        // Finalize PDF
        this.doc.end();

        stream.on('finish', () => {
          console.log(`Generated new PDF: ${filename}`);
          resolve({
            filename: filename,
            filepath: filepath,
            relativePath: `uploads/pdfs/${filename}`
          });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  generatePDFContent(quotationData) {
    console.log('🔄 Generating PDF with updated content (no terms/calculation breakdown)');
    
    // Header
    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('FACTORY QUOTATION', { align: 'center' })
      .moveDown(0.5);

    // Company Logo/Header Section
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Radhe Consultancy', { align: 'center' })
      .fontSize(12)
      .font('Helvetica')
      .text('Compliance & Licensing Solutions', { align: 'center' })
      .moveDown(1);

    // Quotation Details
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Quotation Details')
      .moveDown(0.5);

    // Create a table-like structure for quotation details
    const details = [
      ['Quotation ID:', `FQ-${quotationData.id.toString().padStart(6, '0')}`],
      ['Date:', new Date(quotationData.createdAt || quotationData.created_at).toLocaleDateString('en-GB')],
      ['Status:', quotationData.status.toUpperCase()],
      ['Company Name:', quotationData.companyName || 'N/A'],
      ['Phone:', quotationData.phone || 'N/A'],
      ['Email:', quotationData.email || 'N/A'],
      ['Address:', quotationData.companyAddress || 'N/A']
    ];

    this.drawTable(details, 50, this.doc.y);
    this.doc.moveDown(2);

    // Technical Specifications
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Technical Specifications')
      .moveDown(0.5);

    const additionalCharges = (quotationData.planCharge || 0) + 
                             (quotationData.stabilityCertificateAmount || 0) + 
                             (quotationData.administrationCharge || 0) + 
                             (quotationData.consultancyFees || 0);

    // Calculate base amount as horsePower × noOfWorkers × years
    const baseAmount = (quotationData.calculatedAmount || 0) * (quotationData.year || 1);

    const technicalSpecs = [
      ['Horse Power:', `${quotationData.horsePower} HP`],
      ['Number of Workers:', quotationData.noOfWorkers || quotationData.numberOfWorkers || 'N/A'],
      ['Years:', quotationData.year],
      ['Load Type:', quotationData.stabilityCertificateType || 'N/A'],
      ['Base Amount:', `₹${baseAmount.toLocaleString()}`],
      ['Additional Charges:', `₹${additionalCharges.toLocaleString()}`],
      ['Total Amount:', `₹${(quotationData.totalAmount || 0).toLocaleString()}`]
    ];

    this.drawTable(technicalSpecs, 50, this.doc.y);
    this.doc.moveDown(2);

    // Generated timestamp
    this.doc
      .fontSize(8)
      .font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleString('en-GB')}`, { align: 'center' });
  }

  drawTable(data, x, y) {
    const colWidth = 200;
    const rowHeight = 20;
    const fontSize = 10;

    data.forEach((row, index) => {
      const currentY = y + (index * rowHeight);

      // Draw cell borders
      this.doc
        .rect(x, currentY, colWidth, rowHeight)
        .rect(x + colWidth, currentY, colWidth, rowHeight)
        .stroke();

      // Add text
      this.doc
        .fontSize(fontSize)
        .font('Helvetica-Bold')
        .text(row[0], x + 5, currentY + 5, { width: colWidth - 10 })
        .font('Helvetica')
        .text(row[1], x + colWidth + 5, currentY + 5, { width: colWidth - 10 });
    });

    // Update document Y position
    this.doc.y = y + (data.length * rowHeight) + 10;
  }
}

module.exports = FactoryQuotationPDFGenerator; 