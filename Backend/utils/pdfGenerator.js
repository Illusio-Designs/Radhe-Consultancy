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

  // Draw header section with logo on left and "Our Details" on right
  drawHeaderSection(startY) {
    const pageWidth = 595.28;
    const margin = 20;
    
    // Left side - Company Logo
    const logoPath = path.join(__dirname, companyConfig.company.logoPath);
    if (fs.existsSync(logoPath)) {
      try {
        // Load and display actual company logo
        this.doc.image(logoPath, margin, startY, {
          width: 80,
          height: 60,
          fit: [80, 60]
        });
        console.log('PDF Generator: Company logo loaded successfully');
      } catch (error) {
        console.error('PDF Generator: Could not load logo:', error);
        // Fallback to company name if logo fails
        this.doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .fill('#000000')
          .text(companyConfig.company.name, margin, startY);
      }
    } else {
      // Fallback to company name if logo file doesn't exist
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fill('#000000')
        .text(companyConfig.company.name, margin, startY);
    }

    // Right side - Company Details (only email and phone)
    const rightX = pageWidth - margin - 200;
    const rightY = startY + 10;
    
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fill('#000000')
      .text('Our Details', rightX, rightY, { align: 'right' })
      .fontSize(10)
      .font('Helvetica')
      .fill('#7F8C8D')
      .text(companyConfig.company.email, rightX, rightY + 20, { align: 'right' })
      .text(companyConfig.company.phone, rightX, rightY + 35, { align: 'right' });

    return startY + 80; // Increased height to accommodate logo/details
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
      .text(this.quotationData.companyName || 'Quotation Company Name', leftX, leftY);
    
    // Handle address with automatic wrapping
    const addressText = this.quotationData.companyAddress || 'Company Address';
    const addressLines = this.wrapText(addressText, maxAddressWidth, 10);
    
    let currentY = leftY + 20;
    addressLines.forEach((line, index) => {
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fill('#000000')
        .text(line, leftX, currentY);
      currentY += 15;
    });
    
    // Email and phone
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fill('#000000')
      .text(this.quotationData.email || 'Company Email', leftX, currentY)
      .text(this.quotationData.phone || 'Company Phone number', leftX, currentY + 20);
    
    // Calculate the actual height needed for this column
    const leftColumnHeight = currentY + 20 - leftY;

    // Right column - Quotation Details
    const rightX = margin + 10 + columnWidth + 10;
    const rightY = startY + 15;
    
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fill('#000000')
      .text(`Quotation Date: ${this.quotationData.date || 'N/A'}`, rightX, rightY)
      .fontSize(10)
      .font('Helvetica')
      .text(`Quotation Number: ${this.quotationData.id || 'N/A'}`, rightX, rightY + 20);

    // Calculate the actual height needed and redraw the box if necessary
    const rightColumnHeight = rightY + 40 - startY;
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
    const headers = ['Sr. No.', 'Particular', 'No of Workers', 'Hours Power', 'Year', 'Total'];
    const columnWidths = [60, 150, 100, 100, 60, 80];

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
        srNo: '1',
        particular: 'Factory License',
        workers: '50 to 100',
        hoursPower: '51 to 100',
        year: '2',
        total: '10000'
      }
    ];

    // Add additional charges row if charges exist
    console.log('PDF Generator: Checking additional charges:', {
      planCharge: this.quotationData.planCharge,
      stabilityCertificateAmount: this.quotationData.stabilityCertificateAmount,
      administrationCharge: this.quotationData.administrationCharge,
      consultancyFees: this.quotationData.consultancyFees
    });

    // More robust parsing of charges - handle strings, numbers, and null values
    const parseCharge = (value) => {
      if (value === null || value === undefined || value === '') return 0;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    const additionalCharges = [
      parseCharge(this.quotationData.planCharge),
      parseCharge(this.quotationData.stabilityCertificateAmount),
      parseCharge(this.quotationData.administrationCharge),
      parseCharge(this.quotationData.consultancyFees)
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
        srNo: '2',
        particular: 'Additional Charges',
        workers: '',
        hoursPower: '',
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

      this.doc.text(row.workers, colX, currentY + 8);
      colX += columnWidths[2];

      this.doc.text(row.hoursPower, colX, currentY + 8);
      colX += columnWidths[3];

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
    const factoryLicenseAmount = parseFloat(this.quotationData.calculatedAmount) || 0;
    const additionalCharges = [
      parseCharge(this.quotationData.planCharge),
      parseCharge(this.quotationData.stabilityCertificateAmount),
      parseCharge(this.quotationData.administrationCharge),
      parseCharge(this.quotationData.consultancyFees)
    ].filter(charge => charge > 0)
     .reduce((sum, charge) => sum + charge, 0);
    
    const grandTotal = factoryLicenseAmount + additionalCharges;

    console.log('PDF Generator: Final amount calculation:', {
      factoryLicenseAmount,
      additionalCharges,
      grandTotal
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