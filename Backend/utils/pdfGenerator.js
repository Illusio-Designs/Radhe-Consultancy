const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const companyConfig = require('../config/companyConfig');

class FactoryQuotationPDFGenerator {
  constructor() {
    try {
      this.doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        }
      });
      console.log('PDF Generator: PDFDocument created successfully');
    } catch (error) {
      console.error('PDF Generator: Error creating PDFDocument:', error);
      throw error;
    }
  }

  // Helper method to parse charge values - handle strings, numbers, and null values
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

  // Generate the complete quotation PDF
  async generateQuotationPDF(quotationData, outputPath) {
    try {
      this.quotationData = quotationData;
      console.log('PDF Generator: Starting PDF generation for quotation:', quotationData.id);

      // Create write stream
      const stream = fs.createWriteStream(outputPath);
      this.doc.pipe(stream);

      // Generate the main page
      this.generateMainPage();

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
  generateMainPage() {
    console.log('PDF Generator: Starting main page generation with data:', this.quotationData);
    
    const pageWidth = 595.28;
    let currentY = 20;

    // 1. Header Section (Logo on left, Our Details on right)
    currentY = this.drawHeaderSection(currentY);
    currentY += 30;

    // 2. Company and Quotation Details (Two-column box)
    currentY = this.drawCompanyAndQuotationDetails(currentY);
    currentY += 30;

    // 3. Table Summary
    currentY = this.drawTableSummary(currentY);
    currentY += 30;

    // 4. Final Amount
    currentY = this.drawFinalAmount(currentY);
    currentY += 30;

    // 5. Terms & Conditions
    currentY = this.drawTermsAndConditions(currentY);
    currentY += 30;

    // 6. Thank You Message
    this.drawThankYouMessage(currentY);
  }

  // Draw header section with RADHE ADVISORY branding
  drawHeaderSection(startY) {
    const pageWidth = 595.28;
    const margin = 20;
    
    // Main company branding
    this.doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fill('#1E40AF') // Blue color
      .text('RADHE ADVISORY', margin, startY)
      .fontSize(12)
      .font('Helvetica-Bold')
      .fill('#1E40AF')
      .text('LABOUR LAW CONSULTANT', margin, startY + 25)
      .fontSize(10)
      .font('Helvetica')
      .fill('#000000')
      .text('Compliance & Licensing Solutions', margin, startY + 45);

    // Right side - Contact Details
    const rightX = pageWidth - margin - 200;
    const rightY = startY + 10;
    
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fill('#1E40AF')
      .text('RADHE ADVISORY', rightX, rightY, { align: 'right' })
      .fontSize(10)
      .font('Helvetica-Bold')
      .fill('#1E40AF')
      .text('LABOUR LAW CONSULTANT', rightX, rightY + 15, { align: 'right' })
      .fontSize(9)
      .font('Helvetica')
      .fill('#000000')
      .text('Email: radheconsultancy17@yahoo.com', rightX, rightY + 35, { align: 'right' })
      .text('Phone: +91-9913014516 / +91-8511172645', rightX, rightY + 50, { align: 'right' });

    return startY + 80;
  }

  // Draw company and quotation details in two-column box
  drawCompanyAndQuotationDetails(startY) {
    const pageWidth = 595.28;
    const margin = 20;
    const boxWidth = pageWidth - (margin * 2);
    const columnWidth = (boxWidth - 20) / 2;

    // We'll calculate the actual height needed based on content
    let boxHeight = 120; // Default minimum height

    // Draw the main box
    this.doc
      .rect(margin, startY, boxWidth, boxHeight)
      .stroke('#000000', 1);

    // Left column - Company Details
    const leftX = margin + 10;
    const leftY = startY + 15;
    const maxAddressWidth = columnWidth - 20; // Leave some padding
    
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fill('#000000')
      .text('Company Details:', leftX, leftY)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`Name: ${this.quotationData.companyName || 'N/A'}`, leftX, leftY + 20);
    
    // Handle address with automatic wrapping
    const addressText = this.quotationData.companyAddress || 'Company Address';
    const addressLines = this.wrapText(addressText, maxAddressWidth, 10);
    
    let currentY = leftY + 40;
    addressLines.forEach((line, index) => {
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fill('#000000')
        .text(line, leftX, currentY);
      currentY += 12;
    });
    
    // Phone
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fill('#000000')
      .text(`Phone: ${this.quotationData.phone || 'Company Phone'}`, leftX, currentY + 10);
    
    // Calculate the actual height needed for this column
    const leftColumnHeight = currentY + 30 - leftY;

    // Right column - Quotation Details
    const rightX = margin + 10 + columnWidth + 10;
    const rightY = startY + 15;
    
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fill('#1E40AF')
      .text('QUOTATION DETAILS', rightX, rightY)
      .fontSize(11)
      .font('Helvetica-Bold')
      .fill('#000000')
      .text('Quotation Details:', rightX, rightY + 25)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`Quotation No.: ${this.quotationData.id || 'N/A'}`, rightX, rightY + 45)
      .text(`Date: ${this.quotationData.date || 'N/A'}`, rightX, rightY + 60)
      .fontSize(10)
      .font('Helvetica-Bold')
      .fill('#10B981') // Green color for status
      .text(`Status: ${this.quotationData.status || 'pending'}`, rightX, rightY + 75);

    // Calculate the actual height needed and redraw the box if necessary
    const rightColumnHeight = rightY + 95 - startY;
    const actualHeight = Math.max(boxHeight, leftColumnHeight, rightColumnHeight);
    
    // Redraw the box with the correct height
    if (actualHeight > boxHeight) {
      this.doc
        .rect(margin, startY, boxWidth, actualHeight)
        .stroke('#000000', 1);
    }

    return startY + actualHeight + 20;
  }

  // Draw table summary with specific columns
  drawTableSummary(startY) {
    const pageWidth = 595.28;
    const margin = 20;
    const tableWidth = pageWidth - (margin * 2);
    const headerHeight = 30;
    const rowHeight = 25;

    // Table headers
    const headers = ['SP No.', 'Particular', 'Work Details', 'Years', 'Am'];
    const columnWidths = [60, 200, 150, 80, 80];

    // Draw SERVICE BREAKDOWN header
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fill('#1E40AF')
      .text('SERVICE BREAKDOWN', margin + (tableWidth / 2) - 80, startY - 25, { align: 'center' });

    // Draw header row
    this.doc
      .rect(margin, startY, tableWidth, headerHeight)
      .fill('#F0F0F0')
      .stroke('#000000', 1);

    let currentX = margin + 5;
    headers.forEach((header, index) => {
    this.doc
        .fontSize(10)
      .font('Helvetica-Bold')
        .fill('#000000')
        .text(header, currentX, startY + 8);
      currentX += columnWidths[index];
    });

    // Use actual data from quotationData or fallback to sample data
    const tableData = this.quotationData.items || [
      {
        srNo: '',
        particular: 'Factory License Compliance',
        workDetails: '250 to 500 HP, 21 to 50 Workers',
        year: '5 Year(s)',
        total: ''
      }
    ];

    // Add additional charges row if charges exist
    console.log('PDF Generator: Checking additional charges:', {
      planCharge: this.quotationData.planCharge,
      stabilityCertificateAmount: this.quotationData.stabilityCertificateAmount,
      administrationCharge: this.quotationData.administrationCharge,
      consultancyFees: this.quotationData.consultancyFees
    });

    const additionalCharges = [
      this.parseCharge(this.quotationData.planCharge),
      this.parseCharge(this.quotationData.stabilityCertificateAmount),
      this.parseCharge(this.quotationData.administrationCharge),
      this.parseCharge(this.quotationData.consultancyFees)
    ].filter(charge => charge > 0);

    // Debug: Check if any charges exist even if they're 0
    const allCharges = [
      { name: 'Plan Charge', value: parseFloat(this.quotationData.planCharge) || 0 },
      { name: 'Stability Certificate', value: parseFloat(this.quotationData.stabilityCertificateAmount) || 0 },
      { name: 'Administration Charge', value: parseFloat(this.quotationData.administrationCharge) || 0 },
      { name: 'Consultancy Fees', value: parseFloat(this.quotationData.consultancyFees) || 0 }
    ];

    console.log('PDF Generator: All charges breakdown:', allCharges);
    console.log('PDF Generator: Charges with values > 0:', allCharges.filter(charge => charge.value > 0));

    console.log('PDF Generator: Filtered additional charges:', additionalCharges);

    if (additionalCharges.length > 0) {
      const additionalTotal = additionalCharges.reduce((sum, charge) => sum + charge, 0);
      console.log('PDF Generator: Adding additional charges row with total:', additionalTotal);
      tableData.push({
        srNo: '',
        particular: 'Additional Charges',
        workDetails: 'Additional Charges',
        year: '',
        total: additionalTotal.toString()
      });
    } else {
      console.log('PDF Generator: No additional charges found');
    }

    console.log('PDF Generator: Final table data:', tableData);

    let currentY = startY + headerHeight;
    
    tableData.forEach((row, index) => {
      // Draw row background
      this.doc
        .rect(margin, currentY, tableWidth, rowHeight)
        .stroke('#000000', 0.5);

      // Draw row content
      let colX = margin + 5;
      
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fill('#000000')
        .text(row.srNo, colX, currentY + 8);
      colX += columnWidths[0];

      this.doc.text(row.particular, colX, currentY + 8);
      colX += columnWidths[1];

      this.doc.text(row.workDetails, colX, currentY + 8);
      colX += columnWidths[2];

      this.doc.text(row.year, colX, currentY + 8);
      colX += columnWidths[4];

      this.doc.text(row.total, colX, currentY + 8);

      currentY += rowHeight;
    });

    return currentY + 20;
  }

  // Draw final amount section
  drawFinalAmount(startY) {
    const pageWidth = 595.28;
    const margin = 20;
    const boxWidth = 200;
    const boxHeight = 30;
    const x = pageWidth - margin - boxWidth;

    // Calculate grand total (Factory License + Additional Charges)
    try {
      // Use the calculated amount that already includes year multiplication from controller
      const factoryLicenseAmount = this.parseCharge(this.quotationData.calculatedAmount);
      const additionalCharges = [
        this.parseCharge(this.quotationData.planCharge),
        this.parseCharge(this.quotationData.stabilityCertificateAmount),
        this.parseCharge(this.quotationData.administrationCharge),
        this.parseCharge(this.quotationData.consultancyFees)
      ].filter(charge => charge > 0)
       .reduce((sum, charge) => sum + charge, 0);
      
      const grandTotal = factoryLicenseAmount + additionalCharges;
      
      console.log('PDF Generator: Final amount calculation:', {
        factoryLicenseAmount,
        additionalCharges,
        grandTotal,
        rawCalculatedAmount: this.quotationData.calculatedAmount
      });
      
      // Draw the total amount box
      this.doc
        .rect(x, startY, boxWidth, boxHeight)
        .stroke('#000000', 1);

      // Total amount text
      this.doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fill('#000000')
        .text('Total', x + 10, startY + 8)
        .text(grandTotal.toString(), x + 120, startY + 8);

      return startY + boxHeight + 20;
    } catch (error) {
      console.error('Error calculating grand total:', error);
      
      // Draw error message
      this.doc
        .rect(x, startY, boxWidth, boxHeight)
        .stroke('#000000', 1);

      this.doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fill('#000000')
        .text('Total', x + 10, startY + 8)
        .text('Error', x + 120, startY + 8);

      return startY + boxHeight + 20;
    }
  }

  // Draw terms and conditions
  drawTermsAndConditions(startY) {
    const pageWidth = 595.28;
    const margin = 20;

    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fill('#000000')
      .text('Terms & Conditions:', margin, startY)
      .fontSize(10)
      .font('Helvetica')
      .text('• GST will be charged as applicable', margin + 20, startY + 20);

    return startY + 50;
  }

  // Draw thank you message at page footer
  drawThankYouMessage(startY) {
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 20;

    // Calculate footer position (bottom of page with margin)
    const footerY = pageHeight - margin - 30;

    this.doc
      .fontSize(12)
      .font('Helvetica')
      .fill('#7F8C8D')
      .text('Thank you for business with us', margin, footerY, {
        align: 'center',
        width: pageWidth - (margin * 2)
      });

    return footerY + 30;
  }

  // Legacy method for backward compatibility
  async generatePDF(quotationData, outputPath) {
    return this.generateQuotationPDF(quotationData, outputPath);
  }
}

module.exports = FactoryQuotationPDFGenerator; 