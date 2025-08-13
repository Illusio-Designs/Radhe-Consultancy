const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class FactoryQuotationPDFGenerator {
  constructor() {
    try {
      this.doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 30,
          bottom: 30,
          left: 30,
          right: 30
        }
      });
      console.log('PDF Generator: PDFDocument created successfully');
    } catch (error) {
      console.error('PDF Generator: Error creating PDFDocument:', error);
      throw error;
    }
  }

  // Helper method to center text on page
  centerText(text, y, fontSize = 12, fontFamily = 'Helvetica') {
    const pageWidth = 595.28;
    const textWidth = this.doc.fontSize(fontSize).font(fontFamily).widthOfString(text);
    const x = (pageWidth - textWidth) / 2;
    this.doc.fontSize(fontSize).font(fontFamily).text(text, x, y);
    return x;
  }

  // Helper method to center image on page
  centerImage(imagePath, y, width, height) {
    const pageWidth = 595.28;
    const x = (pageWidth - width) / 2;
    try {
      this.doc.image(imagePath, x, y, { width, height });
      return x;
    } catch (error) {
      console.error('PDF Generator: Could not load image:', error);
      return null;
    }
  }

  // Helper method to create centered table
  createCenteredTable(data, startY, tableWidth = 500) {
    const pageWidth = 595.28;
    const x = (pageWidth - tableWidth) / 2;
    
    // Table header
    this.doc
      .rect(x, startY, tableWidth, 30)
      .fill('#2C3E50')
      .stroke('#2C3E50', 1);

    // Header text
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fill('#FFFFFF')
      .text('Service', x + 10, startY + 8)
      .text('Details', x + 200, startY + 8)
      .text('Amount', x + 400, startY + 8);

    let currentY = startY + 30;
    
    // Table rows
    data.forEach((row, index) => {
      const rowHeight = 25;
      const fillColor = index % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
      
      this.doc
        .rect(x, currentY, tableWidth, rowHeight)
        .fill(fillColor)
        .stroke('#E9ECEF', 0.5);

      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fill('#2C3E50')
        .text(row.service || '', x + 10, currentY + 8)
        .text(row.details || '', x + 200, currentY + 8)
        .text(`₹${row.amount || 0}`, x + 400, currentY + 8);

      currentY += rowHeight;
    });

    return currentY;
  }

  // Generate the complete quotation PDF
  async generateQuotationPDF(quotationData, outputPath) {
    try {
      this.quotationData = quotationData;
      console.log('PDF Generator: Starting PDF generation for quotation:', quotationData.id);

      // Create write stream
      const stream = fs.createWriteStream(outputPath);
      this.doc.pipe(stream);

      // Page 1: Main Quotation
      await this.generateMainPage();

      // Finalize PDF
      this.doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          console.log('PDF Generator: PDF generated successfully at:', outputPath);
          resolve(outputPath);
        });
        stream.on('error', reject);
      });

    } catch (error) {
      console.error('PDF Generator: Error generating PDF:', error);
      throw error;
    }
  }

  // Generate the main quotation page
  async generateMainPage() {
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    let currentY = 30;

    // 1. Header with Logo and Company Details (Centered)
    currentY = await this.drawCenteredHeader(currentY);
    currentY += 20;

    // 2. Quotation Title (Centered)
    currentY = this.drawQuotationTitle(currentY);
    currentY += 20;

    // 3. Quotation Details (Centered)
    currentY = this.drawQuotationDetails(currentY);
    currentY += 20;

    // 4. Company Details (Centered)
    currentY = this.drawCompanyDetailsSection(currentY);
    currentY += 20;

    // 5. Service Table (Centered)
    currentY = this.drawServiceTable(currentY);
    currentY += 20;

    // 6. Total Amount (Centered)
    currentY = this.drawTotalAmount(currentY);
    currentY += 20;

    // 7. Terms and Conditions (Centered)
    currentY = this.drawTermsAndConditions(currentY);
    currentY += 20;

    // 8. Thank You Message (Centered)
    this.drawThankYouMessage(currentY);
  }

  // Draw centered header with logo and company details
  async drawCenteredHeader(startY) {
    let currentY = startY;

    // Company Logo (Centered)
    const logoPath = path.join(__dirname, '../assest/@RADHE ADVISORY LOGO (1).png');
    if (fs.existsSync(logoPath)) {
      this.centerImage(logoPath, currentY, 100, 75);
      currentY += 85;
    }

    // Company Name (Centered)
    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fill('#2C3E50');
    this.centerText('RADHE ADVISORY', currentY);
    currentY += 30;

    // Company Tagline (Centered)
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fill('#34495E');
    this.centerText('LABOUR LAW CONSULTANT', currentY);
    currentY += 25;

    // Company Description (Centered)
    this.doc
      .fontSize(12)
      .font('Helvetica')
      .fill('#7F8C8D');
    this.centerText('Compliance & Licensing Solutions', currentY);
    currentY += 20;

    // Contact Information (Centered)
    this.doc.fontSize(10);
    this.centerText('Email: radheconsultancy17@yahoo.com', currentY);
    currentY += 15;
    this.centerText('Phone: +91-XXXXXXXXXX', currentY);
    currentY += 15;
    this.centerText('Address: Your Company Address Here', currentY);

    return currentY + 20;
  }

  // Draw quotation title
  drawQuotationTitle(startY) {
    this.doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fill('#2C3E50');
    this.centerText('QUOTATION', startY);
    return startY + 35;
  }

  // Draw quotation details
  drawQuotationDetails(startY) {
    const pageWidth = 595.28;
    const boxWidth = 400;
    const x = (pageWidth - boxWidth) / 2;

    // Background box
    this.doc
      .rect(x, startY, boxWidth, 60)
      .fill('#F8F9FA')
      .stroke('#E9ECEF', 1);

    // Quotation details content
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fill('#2C3E50')
      .text(`Quotation No.: ${this.quotationData.id || 'N/A'}`, x + 20, startY + 15)
      .text(`Date: ${this.quotationData.date || new Date().toLocaleDateString()}`, x + 20, startY + 35)
      .text(`Valid Until: ${this.quotationData.validUntil || '30 days'}`, x + 20, startY + 55);

    return startY + 80;
  }

  // Draw company details section
  drawCompanyDetailsSection(startY) {
    const pageWidth = 595.28;
    const boxWidth = 500;
    const x = (pageWidth - boxWidth) / 2;

    // Background box
    this.doc
      .rect(x, startY, boxWidth, 80)
      .fill('#F8F9FA')
      .stroke('#E9ECEF', 1);

    // Section title
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fill('#2C3E50')
      .text('Company Details:', x + 20, startY + 15);

    // Company information
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fill('#34495E')
      .text(this.quotationData.companyName || 'Company Name', x + 20, startY + 35);

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fill('#7F8C8D')
      .text(this.quotationData.companyAddress || 'Company Address', x + 20, startY + 55);

    return startY + 100;
  }

  // Draw service table
  drawServiceTable(startY) {
    // Sample service data - replace with actual data from quotationData
    const services = [
      { service: 'Factory License', details: 'Complete processing and documentation', amount: this.quotationData.calculatedAmount || 5000 },
      { service: 'Compliance Check', details: 'Regulatory compliance verification', amount: 2000 },
      { service: 'Documentation', details: 'All required forms and certificates', amount: 1500 }
    ];

    const tableEndY = this.createCenteredTable(services, startY, 500);
    return tableEndY + 20;
  }

  // Draw total amount
  drawTotalAmount(startY) {
    const pageWidth = 595.28;
    const boxWidth = 300;
    const x = (pageWidth - boxWidth) / 2;

    // Background box
    this.doc
      .rect(x, startY, boxWidth, 50)
      .fill('#2C3E50')
      .stroke('#2C3E50', 1);

    // Total amount text
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fill('#FFFFFF')
      .text('Total Amount:', x + 20, startY + 15)
      .text(`₹${this.quotationData.calculatedAmount || 8500}`, x + 200, startY + 15);

    return startY + 70;
  }

  // Draw terms and conditions
  drawTermsAndConditions(startY) {
    const pageWidth = 595.28;
    const boxWidth = 500;
    const x = (pageWidth - boxWidth) / 2;

    // Background box
    this.doc
      .rect(x, startY, boxWidth, 80)
      .fill('#F8F9FA')
      .stroke('#E9ECEF', 1);

    // Section title
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fill('#2C3E50')
      .text('Terms & Conditions:', x + 20, startY + 15);

    // Terms content
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fill('#7F8C8D')
      .text('• Payment: 50% advance, 50% on completion', x + 20, startY + 35)
      .text('• Validity: 30 days from quotation date', x + 20, startY + 50)
      .text('• Timeline: 15-20 working days for completion', x + 20, startY + 65);

    return startY + 100;
  }

  // Draw thank you message
  drawThankYouMessage(startY) {
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fill('#2C3E50');
    this.centerText('Thank You for Choosing RADHE ADVISORY!', startY);
    
    startY += 25;
    
    this.doc
      .fontSize(12)
      .font('Helvetica')
      .fill('#7F8C8D');
    this.centerText('We look forward to serving your compliance needs', startY);
    
    startY += 20;
    
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fill('#34495E');
    this.centerText('For any queries, please contact us at radheconsultancy17@yahoo.com', startY);
  }

  // Legacy method for backward compatibility
  async generatePDF(quotationData, outputPath) {
    return this.generateQuotationPDF(quotationData, outputPath);
  }
}

module.exports = FactoryQuotationPDFGenerator; 