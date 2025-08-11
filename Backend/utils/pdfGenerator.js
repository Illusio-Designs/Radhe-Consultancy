const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class FactoryQuotationPDFGenerator {
  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 30
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
    console.log('🔄 Generating PDF with professional letterhead design');
    
    // A4 dimensions: 595.28 x 841.89 points
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 30;
    const contentWidth = pageWidth - (margin * 2);
    
    // Header Section with Logo
    this.drawLetterheadHeader();
    
    // Main content starts after header
    let currentY = 140;
    
    // Company Details and Quotation Details Section
    currentY = this.drawDetailsSection(quotationData, currentY);
    
    // Itemized Table Section
    currentY = this.drawItemizedTable(quotationData, currentY);
    
    // Total Amount Section
    currentY = this.drawTotalSection(quotationData, currentY);
    
    // Footer
    this.drawFooter(currentY);
  }

  drawLetterheadHeader() {
    const pageWidth = 595.28;
    const margin = 30;
    
    // Draw header background
    this.doc
      .rect(margin, margin, pageWidth - (margin * 2), 100)
      .fill('#f8f9fa')
      .stroke('#dee2e6');
    
    // Try to add logo if exists
    const logoPath = path.join(__dirname, '../assest/@RADHE ADVISORY LOGO (1).png');
    if (fs.existsSync(logoPath)) {
      try {
                 this.doc.image(logoPath, margin + 15, margin + 15, {
           width: 100,
           height: 70
         });
      } catch (error) {
        console.log('Could not load logo, using text instead');
      }
    }
    
    // Company name and details (right side of header) - moved further right to avoid overlap
    this.doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .fill('#2c3e50')
      .text('RADHE ADVISORY', pageWidth - margin - 250, margin + 20)
      .fontSize(14)
      .font('Helvetica')
      .text('LABOUR LAW CONSULTANT', pageWidth - margin - 250, margin + 45)
      .fontSize(11)
      .text('Compliance & Licensing Solutions', pageWidth - margin - 250, margin + 62)
      .fontSize(9)
      .text('Email: info@radheadvisory.com', pageWidth - margin - 250, margin + 78)
      .text('Phone: +91-XXXXXXXXXX', pageWidth - margin - 250, margin + 90);
    
    // Reset fill color
    this.doc.fill('#000000');
  }

  drawDetailsSection(quotationData, startY) {
    const pageWidth = 595.28;
    const margin = 30;
    const contentWidth = pageWidth - (margin * 2);
    const sectionHeight = 80;
    
    // Draw section background
    this.doc
      .rect(margin, startY, contentWidth, sectionHeight)
      .fill('#ffffff')
      .stroke('#dee2e6');
    
    // Section title
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fill('#2c3e50')
      .text('QUOTATION DETAILS', margin + 10, startY + 10);
    
    // Left column - Company Details
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Company Details:', margin + 10, startY + 30)
      .fontSize(10)
      .font('Helvetica')
      .text(`Name: ${quotationData.companyName || 'N/A'}`, margin + 10, startY + 45)
      .text(`Address: ${quotationData.companyAddress || 'N/A'}`, margin + 10, startY + 58)
      .text(`Phone: ${quotationData.phone || 'N/A'}`, margin + 10, startY + 71);
    
    // Right column - Quotation Details
    const rightColX = margin + (contentWidth / 2);
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Quotation Details:', rightColX, startY + 30)
      .fontSize(10)
      .font('Helvetica')
      .text(`Quotation No.: FQ-${quotationData.id.toString().padStart(6, '0')}`, rightColX, startY + 45)
      .text(`Date: ${new Date(quotationData.createdAt || quotationData.created_at).toLocaleDateString('en-GB')}`, rightColX, startY + 58)
      .text(`Status: ${quotationData.status.toUpperCase()}`, rightColX, startY + 71);
    
    // Reset fill color
    this.doc.fill('#000000');
    
    return startY + sectionHeight + 20;
  }

  drawItemizedTable(quotationData, startY) {
    const pageWidth = 595.28;
    const margin = 30;
    const contentWidth = pageWidth - (margin * 2);
    
    // Table header
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fill('#2c3e50')
      .text('SERVICE BREAKDOWN', margin, startY);
    
    const tableStartY = startY + 20;
    const rowHeight = 30; // Increased row height for better spacing
    const colWidths = [35, 180, 130, 90, 100]; // Adjusted column widths to prevent overlap
    
    // Draw table header
    this.doc
      .rect(margin, tableStartY, colWidths[0], rowHeight)
      .rect(margin + colWidths[0], tableStartY, colWidths[1], rowHeight)
      .rect(margin + colWidths[0] + colWidths[1], tableStartY, colWidths[2], rowHeight)
      .rect(margin + colWidths[0] + colWidths[1] + colWidths[2], tableStartY, colWidths[3], rowHeight)
      .rect(margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableStartY, colWidths[4], rowHeight)
      .fill('#e9ecef')
      .stroke('#dee2e6');
    
    // Header text
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fill('#495057')
      .text('SP No.', margin + 3, tableStartY + 10)
      .text('Particular', margin + colWidths[0] + 3, tableStartY + 10)
      .text('Work Details', margin + colWidths[0] + colWidths[1] + 3, tableStartY + 10)
      .text('Years', margin + colWidths[0] + colWidths[1] + colWidths[2] + 3, tableStartY + 10)
      .text('Amount', margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 3, tableStartY + 10);
    
    // Calculate amounts
    const baseAmount = (quotationData.calculatedAmount || 0) * (quotationData.year || 1);
    const planCharge = quotationData.planCharge || 0;
    const stabilityCharge = quotationData.stabilityCertificateAmount || 0;
    const adminCharge = quotationData.administrationCharge || 0;
    const consultancyFees = quotationData.consultancyFees || 0;
    
    // Calculate total additional charges
    const totalAdditionalCharges = planCharge + stabilityCharge + adminCharge + consultancyFees;
    
    // Table rows - simplified to show main charge and additional charges
    const rows = [
      {
        spNo: '1',
        particular: 'Factory License Compliance',
        workDetails: `${quotationData.horsePower} HP, ${quotationData.noOfWorkers || quotationData.numberOfWorkers} Workers`,
        hoursYears: `${quotationData.year} Year(s)`,
                 amount: `Rs. ${baseAmount.toLocaleString()}`
      },
      {
        spNo: '2',
        particular: 'Additional Charges',
        workDetails: 'Additional Charges',
        hoursYears: 'Service',
                 amount: `Rs. ${totalAdditionalCharges.toLocaleString()}`
      }
    ];
    
    // Draw table rows
    rows.forEach((row, index) => {
      const rowY = tableStartY + rowHeight + (index * rowHeight);
      
      // Draw cell borders
      this.doc
        .rect(margin, rowY, colWidths[0], rowHeight)
        .rect(margin + colWidths[0], rowY, colWidths[1], rowHeight)
        .rect(margin + colWidths[0] + colWidths[1], rowY, colWidths[2], rowHeight)
        .rect(margin + colWidths[0] + colWidths[1] + colWidths[2], rowY, colWidths[3], rowHeight)
        .rect(margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], rowY, colWidths[4], rowHeight)
        .fill('#ffffff')
        .stroke('#dee2e6');
      
      // Add text with better positioning
      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fill('#000000')
        .text(row.spNo, margin + 3, rowY + 10)
        .text(row.particular, margin + colWidths[0] + 3, rowY + 10, { width: colWidths[1] - 6 })
        .text(row.workDetails, margin + colWidths[0] + colWidths[1] + 3, rowY + 10, { width: colWidths[2] - 6 })
        .text(row.hoursYears, margin + colWidths[0] + colWidths[1] + colWidths[2] + 3, rowY + 10, { width: colWidths[3] - 6 })
        .text(row.amount, margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 3, rowY + 10, { width: colWidths[4] - 6 });
    });
    
    return tableStartY + rowHeight + (rows.length * rowHeight) + 20;
  }

  drawTotalSection(quotationData, startY) {
    const pageWidth = 595.28;
    const margin = 30;
    const contentWidth = pageWidth - (margin * 2);
    const sectionHeight = 70;
    
    // Draw total section background
    this.doc
      .rect(margin, startY, contentWidth, sectionHeight)
      .fill('#f8f9fa')
      .stroke('#dee2e6');
    
    // Total amount - more prominent
    const totalAmount = quotationData.totalAmount || 0;
    
    this.doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fill('#2c3e50')
      .text('Total Amount:', margin + 15, startY + 20)
      .fontSize(22)
             .text(`Rs. ${totalAmount.toLocaleString()}`, margin + 180, startY + 18);
    
    // Terms and conditions
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fill('#6c757d')
      .text('Terms: Payment due within 30 days of invoice date', margin + 15, startY + 45)
      .text('Validity: This quotation is valid for 30 days from the date of issue', margin + 15, startY + 58);
    
    // Reset fill color
    this.doc.fill('#000000');
    
    return startY + sectionHeight + 20;
  }

  drawFooter(currentY) {
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 30;
    
    // Calculate footer position - ensure it's at the bottom of the page
    const footerY = Math.max(currentY + 40, pageHeight - 80); // At least 40px below content, or 80px from bottom
    
    // Footer line
    this.doc
      .moveTo(margin, footerY)
      .lineTo(pageWidth - margin, footerY)
      .stroke('#dee2e6');
    
    // Footer text - positioned below the line
    this.doc
      .fontSize(8)
      .font('Helvetica')
      .fill('#6c757d')
      .text('Thank you for choosing RADHE ADVISORY', pageWidth / 2, footerY + 15, { align: 'center' })
      .text(`Generated on: ${new Date().toLocaleString('en-GB')}`, pageWidth / 2, footerY + 30, { align: 'center' });
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