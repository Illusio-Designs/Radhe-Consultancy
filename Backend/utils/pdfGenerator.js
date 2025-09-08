const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

class FactoryQuotationPDFGenerator {
  constructor() {
    console.log('PDF Generator: FactoryQuotationPDFGenerator initialized');
  }

  // Helper method to parse charge values
  parseCharge(value) {
    try {
    if (value === null || value === undefined || value === '') return 0;
      if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
    } catch (error) {
      console.error('Error parsing charge value:', value, error);
      return 0;
    }
  }

  // Helper method to split address into multiple lines
  splitAddressIntoLines(address, maxLength) {
    if (!address || address === 'N/A') return ['N/A'];
    
    const words = address.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
          // If single word is longer than maxLength, split it
          lines.push(word.substring(0, maxLength));
          currentLine = word.substring(maxLength);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.slice(0, 5); // Maximum 5 lines
  }

  // Generate quotation PDF matching the template format
  async generateQuotationPDF(quotationData, outputPath) {
    try {
      console.log('PDF Generator: Starting template-matching PDF generation for quotation:', quotationData.id);
      
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        layout: 'portrait'
      });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Calculate amounts
      const factoryLicenseAmount = this.parseCharge(quotationData.calculatedAmount);
      const additionalCharges = [
        this.parseCharge(quotationData.planCharge),
        this.parseCharge(quotationData.stabilityCertificateAmount),
        this.parseCharge(quotationData.administrationCharge),
        this.parseCharge(quotationData.consultancyFees)
      ].filter(charge => charge > 0)
       .reduce((sum, charge) => sum + charge, 0);
      const grandTotal = factoryLicenseAmount + additionalCharges;

      // Add logo from assets folder
      try {
        const logoPath = path.join(__dirname, '../assest/@RADHE ADVISORY LOGO (1).png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 50, { width: 100,height: 60 });
        }
      } catch (logoError) {
        console.log('Logo not found, using text header');
      }

      // Header - "Our Details" on right with full details (shifted left to avoid overlap)
      doc.fontSize(14).fillColor('#000').font('Helvetica-Bold')
         .text('Our Details', 360, 50);
      
      // Our Details content
      doc.fontSize(10).fillColor('#000').font('Helvetica')
         .text('RADHE ADVISORY', 360, 70);
      doc.text('LABOUR LAW CONSULTANT', 360, 85);
      doc.text('Email: radheconsultancy17@yahoo.com', 360, 100);
      doc.text('Phone: +91-9913014516', 360, 115);
      doc.text('Phone: +91-8511172645', 360, 130);

      // Calculate dynamic box height based on address length
      const address = quotationData.companyAddress || 'N/A';
      const addressLines = this.splitAddressIntoLines(address, 40);
      const dynamicHeight = Math.max(120, 60 + (addressLines.length * 15));
      
      // Main content box with border - positioned below logo
      const contentY = 160;
      const contentWidth = 500;
      const contentHeight = dynamicHeight;
      
      // Draw main content box
      doc.rect(50, contentY, contentWidth, contentHeight).stroke('#000');

      // Left side - Company Details (full width, left-aligned only)
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold')
         .text('Company Name', 60, contentY + 10);
      doc.fontSize(10).fillColor('#000').font('Helvetica')
         .text(quotationData.companyName || 'N/A', 60, contentY + 30);
      
      // Horizontal line
      doc.moveTo(60, contentY + 45).lineTo(250, contentY + 45).stroke('#000');
      
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold')
         .text('Company Address', 60, contentY + 55);
      
      // Split address into multiple lines (4-5 lines) - using already calculated addressLines
      
      let addressY = contentY + 75;
      addressLines.forEach((line, index) => {
        doc.fontSize(10).fillColor('#000').font('Helvetica')
           .text(line, 60, addressY + (index * 12));
      });

      // Right side - Quotation Details
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold')
         .text('Quotation Date', 300, contentY + 10);
      doc.fontSize(10).fillColor('#000').font('Helvetica')
         .text(quotationData.date || 'N/A', 300, contentY + 30);
      
      // Horizontal line
      doc.moveTo(300, contentY + 45).lineTo(490, contentY + 45).stroke('#000');
      
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold')
         .text('Quotation Number', 300, contentY + 55);
      doc.fontSize(10).fillColor('#000').font('Helvetica')
         .text(quotationData.id || 'N/A', 300, contentY + 75);

      // Service Breakdown Table
      const tableY = contentY + contentHeight + 30;
      doc.fontSize(14).fillColor('#000').font('Helvetica-Bold')
         .text('Service Breakdown', 50, tableY);

      // Table headers
      const tableStartY = tableY + 25;
      const col1 = 50;
      const col2 = 90;
      const col3 = 180;
      const col4 = 280;
      const col5 = 380;
      const col6 = 450;
      const rowHeight = 25;

      // Table Header Row
      doc.rect(col1, tableStartY, 500, rowHeight).stroke('#000');
      doc.fontSize(10).fillColor('#000').font('Helvetica-Bold')
         .text('Sr. No.', col1 + 5, tableStartY + 8);
      doc.text('Particular', col2 + 5, tableStartY + 8);
      doc.text('No of Workers', col3 + 5, tableStartY + 8);
      doc.text('Hours Power', col4 + 5, tableStartY + 8);
      doc.text('Year', col5 + 5, tableStartY + 8);
      doc.text('Total', col6 + 5, tableStartY + 8);

      // Table Row 1 - Factory License
      const row1Y = tableStartY + rowHeight;
      doc.rect(col1, row1Y, 500, rowHeight).stroke('#000');
      doc.fontSize(10).fillColor('#000').font('Helvetica')
         .text('1', col1 + 5, row1Y + 8);
      doc.text('Factory License', col2 + 5, row1Y + 8);
      
      // Parse work details properly
      const workDetails = quotationData.items?.[0]?.workDetails || '250 to 500 HP, Up To 20 Workers';
      const workers = workDetails.includes('Workers') ? workDetails.split(',')[1]?.trim() || 'Up To 20 Workers' : 'Up To 20 Workers';
      const power = workDetails.includes('HP') ? workDetails.split(',')[0]?.trim() || '250 to 500 HP' : '250 to 500 HP';
      
      doc.text(workers, col3 + 5, row1Y + 8);
      doc.text(power, col4 + 5, row1Y + 8);
      doc.text(quotationData.items?.[0]?.year || '5 Year(s)', col5 + 5, row1Y + 8);
      doc.text(factoryLicenseAmount.toString(), col6 + 5, row1Y + 8);

      // Additional charges row
      if (additionalCharges > 0) {
        const row2Y = row1Y + rowHeight;
        doc.rect(col1, row2Y, 500, rowHeight).stroke('#000');
        doc.fontSize(10).fillColor('#000').font('Helvetica')
           .text('2', col1 + 5, row2Y + 8);
        doc.text('Additional Charge', col2 + 5, row2Y + 8);
        doc.text('', col3 + 5, row2Y + 8);
        doc.text('', col4 + 5, row2Y + 8);
        doc.text('', col5 + 5, row2Y + 8);
        doc.text(additionalCharges.toString(), col6 + 5, row2Y + 8);
      }

      // Total row
      const totalRowY = additionalCharges > 0 ? row1Y + (rowHeight * 2) : row1Y + rowHeight;
      doc.rect(col1, totalRowY, 500, rowHeight).stroke('#000');
      doc.fontSize(10).fillColor('#000').font('Helvetica-Bold')
         .text('Total', col1 + 5, totalRowY + 8, { width: col6 - col1 - 10 });
      doc.text(grandTotal.toString(), col6 + 5, totalRowY + 8);

      // Terms & Conditions
      const termsY = totalRowY + rowHeight + 30;
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold')
         .text('Terms & Conditions:', 50, termsY);
      doc.fontSize(10).fillColor('#000').font('Helvetica')
         .text('• GST will be charged as applicable', 50, termsY + 20);

      // Footer
      const footerY = termsY + 50;
      doc.fontSize(12).fillColor('#000').font('Helvetica-Bold')
         .text('Thankyou Massage', 50, footerY, { align: 'center' });

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          console.log('PDF Generator: Template-matching PDF generated successfully at:', outputPath);
          resolve(outputPath);
        });
        stream.on('error', reject);
      });

    } catch (error) {
      console.error('PDF Generator: Error generating PDF:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async generatePDF(quotationData, outputPath) {
    return this.generateQuotationPDF(quotationData, outputPath);
  }
}

module.exports = FactoryQuotationPDFGenerator; 