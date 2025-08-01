const FactoryQuotation = require('../models/factoryQuotationModel');
const PlanManagement = require('../models/planManagementModel');
const { 
  calculateBaseAmount, 
  calculateTotalAmount, 
  getHorsePowerOptions, 
  getNoOfWorkersOptions 
} = require('../utils/factoryQuotationCalculator');
const FactoryQuotationPDFGenerator = require('../utils/pdfGenerator');

// Get calculation options
exports.getCalculationOptions = async (req, res) => {
  try {
    const horsePowerOptions = getHorsePowerOptions();
    const noOfWorkersOptions = getNoOfWorkersOptions();
    
    res.json({ 
      success: true, 
      data: {
        horsePowerOptions,
        noOfWorkersOptions
      }
    });
  } catch (error) {
    console.error('Error getting calculation options:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Calculate amount based on horse power and number of workers
exports.calculateAmount = async (req, res) => {
  try {
    const { horsePower, noOfWorkers } = req.body;
    
    if (!horsePower || !noOfWorkers) {
      return res.status(400).json({ 
        success: false, 
        message: 'Horse power and number of workers are required' 
      });
    }
    
    const calculatedAmount = calculateBaseAmount(horsePower, noOfWorkers);
    
    res.json({ 
      success: true, 
      data: { calculatedAmount }
    });
  } catch (error) {
    console.error('Error calculating amount:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Create a new quotation
exports.createQuotation = async (req, res) => {
  try {
    const quotationData = {
      ...req.body,
      createdBy: req.user.user_id, // Add the user ID from the authenticated user
      assignedToRole: req.user.roles?.[0] || 'Admin' // Assign to the user's primary role
    };
    
    const quotation = await FactoryQuotation.create(quotationData);
    res.status(201).json({ success: true, data: quotation });
  } catch (error) {
    console.error('Error creating factory quotation:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get a quotation by ID
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await FactoryQuotation.findByPk(req.params.id, {
      include: [
        {
          model: PlanManagement,
          as: 'planManagement',
          include: [
            {
              model: require('../models/userModel'),
              as: 'planManager',
              attributes: ['user_id', 'username', 'email']
            },
            {
              model: require('../models/userModel'),
              as: 'reviewer',
              attributes: ['user_id', 'username', 'email']
            }
          ]
        },
        {
          model: require('../models/stabilityManagementModel'),
          as: 'stabilityManagement',
          include: [
            {
              model: require('../models/userModel'),
              as: 'stabilityManager',
              attributes: ['user_id', 'username', 'email']
            },
            {
              model: require('../models/userModel'),
              as: 'reviewer',
              attributes: ['user_id', 'username', 'email']
            }
          ]
        }
      ]
    });
    
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });
    res.json({ success: true, data: quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all quotations
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await FactoryQuotation.findAll({
      include: [
        {
          model: PlanManagement,
          as: 'planManagement',
          include: [
            {
              model: require('../models/userModel'),
              as: 'planManager',
              attributes: ['user_id', 'username', 'email']
            },
            {
              model: require('../models/userModel'),
              as: 'reviewer',
              attributes: ['user_id', 'username', 'email']
            }
          ]
        },
        {
          model: require('../models/stabilityManagementModel'),
          as: 'stabilityManagement',
          include: [
            {
              model: require('../models/userModel'),
              as: 'stabilityManager',
              attributes: ['user_id', 'username', 'email']
            },
            {
              model: require('../models/userModel'),
              as: 'reviewer',
              attributes: ['user_id', 'username', 'email']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']] // Order by creation date, newest first
    });
    res.json({ success: true, data: quotations });
  } catch (error) {
    console.error('Error fetching factory quotations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a quotation
exports.updateQuotation = async (req, res) => {
  try {
    const [updated] = await FactoryQuotation.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ success: false, message: 'Quotation not found' });
    
    const updatedQuotation = await FactoryQuotation.findByPk(req.params.id, {
      include: [
        {
          model: PlanManagement,
          as: 'planManagement',
          include: [
            {
              model: require('../models/userModel'),
              as: 'planManager',
              attributes: ['user_id', 'username', 'email']
            },
            {
              model: require('../models/userModel'),
              as: 'reviewer',
              attributes: ['user_id', 'username', 'email']
            }
          ]
        },
        {
          model: require('../models/stabilityManagementModel'),
          as: 'stabilityManagement',
          include: [
            {
              model: require('../models/userModel'),
              as: 'stabilityManager',
              attributes: ['user_id', 'username', 'email']
            },
            {
              model: require('../models/userModel'),
              as: 'reviewer',
              attributes: ['user_id', 'username', 'email']
            }
          ]
        }
      ]
    });
    
    res.json({ success: true, data: updatedQuotation });
  } catch (error) {
    console.error('Error updating factory quotation:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update quotation status
exports.updateStatus = async (req, res) => {
  try {
    console.log('updateStatus - req.body:', req.body);
    console.log('updateStatus - req.params:', req.params);
    
    const { status } = req.body;
    const quotationId = req.params.id;
    
    console.log('updateStatus - extracted status:', status);
    console.log('updateStatus - quotationId:', quotationId);
    
    const [updated] = await FactoryQuotation.update(
      { status },
      { where: { id: quotationId } }
    );
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }
    
    const updatedQuotation = await FactoryQuotation.findByPk(quotationId);
    res.json({ success: true, data: updatedQuotation });
  } catch (error) {
    console.error('Error updating quotation status:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a quotation
exports.deleteQuotation = async (req, res) => {
  try {
    const deleted = await FactoryQuotation.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ success: false, message: 'Quotation not found' });
    res.json({ success: true, message: 'Quotation deleted' });
  } catch (error) {
    console.error('Error deleting factory quotation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate PDF for a quotation
exports.generatePDF = async (req, res) => {
  try {
    const quotationId = req.params.id;
    
    // Get the quotation with all details
    const quotation = await FactoryQuotation.findByPk(quotationId);
    
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    console.log('Backend: Generating PDF for quotation:', {
      id: quotation.id,
      companyName: quotation.companyName,
      horsePower: quotation.horsePower,
      noOfWorkers: quotation.noOfWorkers,
      calculatedAmount: quotation.calculatedAmount,
      planCharge: quotation.planCharge,
      stabilityCertificateAmount: quotation.stabilityCertificateAmount,
      administrationCharge: quotation.administrationCharge,
      consultancyFees: quotation.consultancyFees,
      totalAmount: quotation.totalAmount,
      year: quotation.year,
      status: quotation.status,
      createdAt: quotation.createdAt
    });

    // Generate PDF
    const pdfGenerator = new FactoryQuotationPDFGenerator();
    const pdfResult = await pdfGenerator.generateFactoryQuotationPDF(quotation);

    // Update quotation with PDF path
    await FactoryQuotation.update(
      { pdfPath: pdfResult.relativePath },
      { where: { id: quotationId } }
    );

    res.json({
      success: true,
      message: 'PDF generated successfully',
      data: {
        filename: pdfResult.filename,
        downloadUrl: `/api/factory-quotations/${quotationId}/download-pdf`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download PDF for a quotation
exports.downloadPDF = async (req, res) => {
  try {
    const quotationId = req.params.id;
    
    // Get the quotation
    const quotation = await FactoryQuotation.findByPk(quotationId);
    
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (!quotation.pdfPath) {
      return res.status(404).json({ success: false, message: 'PDF not found. Please generate PDF first.' });
    }

    const path = require('path');
    const fs = require('fs');
    
    // Construct full file path
    const filePath = path.join(__dirname, '..', quotation.pdfPath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'PDF file not found on server' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="factory_quotation_${quotationId}.pdf"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 