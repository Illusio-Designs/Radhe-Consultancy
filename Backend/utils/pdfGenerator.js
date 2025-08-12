const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class FactoryQuotationPDFGenerator {
  constructor() {
    try {
      this.doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 40,
          right: 40
        }
      });
      console.log('PDF Generator: PDFDocument created successfully');
    } catch (error) {
      console.error('PDF Generator: Error creating PDFDocument:', error);
      throw error;
    }
  }

  // Helper method to wrap text to fit within a specified width
  wrapText(text, maxWidth, fontSize = 10) {
    if (!text) return [];
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const testWidth = this.doc.fontSize(fontSize).widthOfString(testLine);
      
      if (testWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  // Draw modern header with company information
  drawModernHeader() {
    const pageWidth = 595.28;
    const margin = 40;
    const headerHeight = 140;

    // Company logo and information (left side)
    const logoPath = path.join(__dirname, '../assest/@RADHE ADVISORY LOGO (1).png');
    console.log('PDF Generator: Logo path:', logoPath);
    console.log('PDF Generator: Logo exists:', fs.existsSync(logoPath));
    
    if (fs.existsSync(logoPath)) {
      try {
        // Fixed logo dimensions to prevent stretching
        const logoWidth = 80;
        const logoHeight = 60;
        const logoX = margin;
        const logoY = margin;
        
        console.log('PDF Generator: Loading logo with dimensions:', { logoWidth, logoHeight, logoX, logoY });
        this.doc.image(logoPath, logoX, logoY, {
          width: logoWidth,
          height: logoHeight,
          fit: [logoWidth, logoHeight] // Maintain aspect ratio
        });
        console.log('PDF Generator: Logo loaded successfully');
      } catch (error) {
        console.error('PDF Generator: Could not load logo:', error);
        console.log('PDF Generator: Using text instead of logo');
      }
    } else {
      console.log('PDF Generator: Logo file not found, using text instead');
    }

    // Company information below logo with proper spacing
    const companyInfoX = margin;
    const companyInfoY = margin + 80;
    
    this.doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .fill('#2C3E50')
      .text('RADHE ADVISORY', companyInfoX, companyInfoY)
      .fontSize(14)
      .font('Helvetica-Bold')
      .fill('#34495E')
      .text('LABOUR LAW CONSULTANT', companyInfoX, companyInfoY + 30)
      .fontSize(12)
      .font('Helvetica')
      .fill('#7F8C8D')
      .text('Compliance & Licensing Solutions', companyInfoX, companyInfoY + 50)
      .fontSize(10)
      .fill('#7F8C8D')
      .text('Email: radheconsultancy17@yahoo.com', companyInfoX, companyInfoY + 70);

    // Quotation title and details (right side)
    const rightX = pageWidth - margin - 200;
    const rightY = margin + 30;
    
    this.doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fill('#2C3E50')
      .text('QUOTATION', rightX, rightY, { align: 'right' })
      .fontSize(12)
      .font('Helvetica')
      .fill('#7F8C8D')
      .text(`Quotation No.: ${this.quotationData.id}`, rightX, rightY + 35, { align: 'right' })
      .text(`Date: ${this.quotationData.date}`, rightX, rightY + 50, { align: 'right' });

    // Reset fill color
    this.doc.fill('#2C3E50');
  }

  // Draw company details section
  drawCompanyDetails(startY) {
    const pageWidth = 595.28;
    const margin = 40;
    const minSectionHeight = 90;

    // Company details box - we'll calculate height dynamically
    this.doc
      .rect(margin, startY, pageWidth - (margin * 2), minSectionHeight)
      .fill('#F8F9FA')
      .stroke('#E9ECEF', 1);

    // Company details content with proper alignment
    this.doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fill('#2C3E50')
      .text('Company Details:', margin + 15, startY + 15)
      .fontSize(11)
      .font('Helvetica-Bold')
      .fill('#34495E')
      .text(this.quotationData.companyName, margin + 15, startY + 35);
    
    // Handle long addresses with proper wrapping and alignment
    const addressText = this.quotationData.companyAddress;
    const maxAddressWidth = pageWidth - (margin * 2) - 30;
    const addressLines = this.wrapText(addressText, maxAddressWidth, 10);
    
    let currentY = startY + 55;
    addressLines.forEach((line, index) => {
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fill('#7F8C8D')
        .text(line, margin + 15, currentY);
      currentY += 14;
    });
    
    // Phone number with proper alignment - ensure it's visible
    const phoneY = currentY + 10;
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fill('#7F8C8D')
      .text(`Phone: ${this.quotationData.phone}`, margin + 15, phoneY);

    // Calculate actual section height needed
    const actualSectionHeight = Math.max(minSectionHeight, phoneY + 20 - startY);
    
    // Redraw the box with correct height if needed
    if (actualSectionHeight > minSectionHeight) {
      this.doc
        .rect(margin, startY, pageWidth - (margin * 2), actualSectionHeight)
        .fill('#F8F9FA')
        .stroke('#E9ECEF', 1);
    }

    return startY + actualSectionHeight + 20;
  }

  // Draw modern service breakdown table
  drawModernServiceTable(startY) {
    const pageWidth = 595.28;
    const margin = 40;
    const tableWidth = pageWidth - (margin * 2);
    const headerHeight = 35;
    const rowHeight = 30;

    // Table header with proper column alignment
    this.doc
      .rect(margin, startY, tableWidth, headerHeight)
      .fill('#2C3E50')
      .stroke('#2C3E50', 1);

    // Header text with proper column separation
    this.doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fill('#FFFFFF')
      .text('SP No.', margin + 15, startY + 10)
      .text('Particular', margin + 80, startY + 10)
      .text('Work Details', margin + 280, startY + 10)
      .text('Years', margin + 420, startY + 10)
      .text('Amount', margin + 490, startY + 10);

    // Table rows
    let currentY = startY + headerHeight;
    
    this.quotationData.items.forEach((item, index) => {
      // Row background
      this.doc
        .rect(margin, currentY, tableWidth, rowHeight)
        .fill(index % 2 === 0 ? '#FFFFFF' : '#F8F9FA')
        .stroke('#E9ECEF', 0.5);

      // Row content with proper alignment
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fill('#2C3E50');

      // SP No.
      this.doc.text(`${index + 1}`, margin + 15, currentY + 10);
      
      // Particular
      this.doc.text(item.particular, margin + 80, currentY + 10);
      
      // Work Details - handle long text with wrapping and proper alignment
      const workDetailsLines = this.wrapText(item.workDetails, 140, 10);
      workDetailsLines.forEach((line, lineIndex) => {
        this.doc.text(line, margin + 280, currentY + 10 + (lineIndex * 12));
      });
      
      // Years
      this.doc.text(item.hoursYears, margin + 420, currentY + 10);
      
      // Amount - ensure it doesn't break into multiple lines
      const amountText = `Rs. ${item.amount.toLocaleString()}`;
      this.doc.text(amountText, margin + 490, currentY + 10);

      currentY += rowHeight;
    });

    // Additional charges - show only total, not individual items
    if (this.quotationData.additionalCharges && this.quotationData.additionalCharges.length > 0) {
      this.doc
        .rect(margin, currentY, tableWidth, rowHeight)
        .fill('#F8F9FA')
        .stroke('#E9ECEF', 0.5);

      // Calculate total additional charges
      const totalAdditionalCharges = this.quotationData.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);

      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fill('#2C3E50')
        .text('', margin + 15, currentY + 10)
        .text('Additional Charges Total', margin + 80, currentY + 10)
        .text('', margin + 280, currentY + 10)
        .text('', margin + 420, currentY + 10)
        .text(`Rs. ${totalAdditionalCharges.toLocaleString()}`, margin + 490, currentY + 10);

      currentY += rowHeight;
    }

    return currentY + 20;
  }

  // Draw modern total section
  drawModernTotalSection(startY) {
    const pageWidth = 595.28;
    const margin = 40;
    const sectionHeight = 130;

    // Total amount box (right side) - made smaller and more proportionate
    const totalBoxWidth = 180;
    const totalBoxX = pageWidth - margin - totalBoxWidth;
    const totalBoxY = startY;

    this.doc
      .rect(totalBoxX, totalBoxY, totalBoxWidth, sectionHeight)
      .fill('#2C3E50')
      .stroke('#2C3E50', 1);

    // Total amount text
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fill('#FFFFFF')
      .text('TOTAL AMOUNT', totalBoxX + 15, totalBoxY + 20)
      .fontSize(20)
      .text(`Rs. ${this.quotationData.totalAmount.toLocaleString()}`, totalBoxX + 15, totalBoxY + 45);

    // Terms and conditions (left side)
    const termsX = margin;
    const termsY = startY + 20;

    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fill('#2C3E50')
      .text('Terms & Conditions:', termsX, termsY)
      .fontSize(10)
      .font('Helvetica')
      .fill('#7F8C8D')
      .text('• Payment due within 30 days of invoice date', termsX, termsY + 25)
      .text('• This quotation is valid for 30 days from the date of issue', termsX, termsY + 40)
      .text('• All prices are subject to change without prior notice', termsX, termsY + 55)
      .text('• GST will be charged as applicable', termsX, termsY + 70);

    return startY + sectionHeight + 20;
  }

  // Draw modern footer
  drawModernFooter(currentY) {
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 40;

    // Calculate footer position
    const footerY = Math.max(currentY + 40, pageHeight - 100);

    // "This is a computer generated quotation" text
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fill('#7F8C8D')
      .text('This is a computer generated quotation', pageWidth / 2, footerY, { align: 'center' });

    // Thank you message - properly centered
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fill('#2C3E50')
      .text('Thank you for choosing RADHE ADVISORY', pageWidth / 2, footerY + 25, { align: 'center' });

    // Divider line
    this.doc
      .moveTo(margin, footerY + 45)
      .lineTo(pageWidth - margin, footerY + 45)
      .stroke('#E9ECEF', 1);

    // Note: Removed "Generated on" timestamp as requested
  }

  // Generate the complete PDF
  async generatePDF(quotationData, outputPath) {
    try {
      console.log('PDF Generator: Starting PDF generation for quotation:', quotationData.id);
      
      // Store quotation data for use in methods
      this.quotationData = quotationData;
      
      // Create uploads/pdfs directory if it doesn't exist
      if (!fs.existsSync(outputPath)) {
        console.log('PDF Generator: Creating uploads/pdfs directory:', outputPath);
        fs.mkdirSync(outputPath, { recursive: true });
      }

      // Generate unique filename with timestamp in CAPITAL LETTERS
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      const filename = `FACTORY_QUOTATION_${quotationData.id}_${timestamp}_${randomString}.pdf`;
      const filepath = path.join(outputPath, filename);
      console.log('PDF Generator: Generated filepath:', filepath);

      // Create write stream
      console.log('PDF Generator: Creating write stream for:', filepath);
      const writeStream = fs.createWriteStream(filepath);
      
      // Handle write stream errors
      writeStream.on('error', (error) => {
        console.error('PDF Generator: Write stream error:', error);
      });
      
      // Pipe the document to the write stream
      this.doc.pipe(writeStream);
      
      // Add error handling for the document
      this.doc.on('error', (error) => {
        console.error('PDF Generator: Document error:', error);
        writeStream.destroy();
      });

      // Draw modern header
      console.log('PDF Generator: Drawing modern header');
      this.drawModernHeader();

      // Draw company details
      console.log('PDF Generator: Drawing company details');
      const detailsY = 180;
      const detailsEndY = this.drawCompanyDetails(detailsY);

      // Draw service breakdown table
      console.log('PDF Generator: Drawing service breakdown table');
      const tableEndY = this.drawModernServiceTable(detailsEndY);

      // Draw total section
      console.log('PDF Generator: Drawing total section');
      const totalEndY = this.drawModernTotalSection(tableEndY);

      // Draw modern footer
      console.log('PDF Generator: Drawing footer');
      this.drawModernFooter(totalEndY);

      // Finalize PDF
      console.log('PDF Generator: Finalizing PDF');
      this.doc.end();

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          console.log(`✅ Professional PDF generated successfully: ${filepath}`);
          clearTimeout(timeout);
          resolve(filepath);
        });

        writeStream.on('error', (error) => {
          console.error('❌ Error writing PDF file:', error);
          clearTimeout(timeout);
          reject(error);
        });

        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
          reject(new Error('PDF generation timed out'));
        }, 30000); // 30 second timeout
      });
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      throw error;
    }
  }
}

module.exports = FactoryQuotationPDFGenerator; 