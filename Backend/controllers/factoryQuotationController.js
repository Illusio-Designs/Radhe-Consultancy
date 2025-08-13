const FactoryQuotation = require('../models/factoryQuotationModel');
const PlanManagement = require('../models/planManagementModel');
const StabilityManagement = require('../models/stabilityManagementModel');
const ApplicationManagement = require('../models/applicationManagementModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const UserRole = require('../models/userRoleModel');
const path = require('path');
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
          model: StabilityManagement,
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
        },
        {
          model: ApplicationManagement,
          as: 'applicationManagement',
          include: [
            {
              model: require('../models/userModel'),
              as: 'applicationManager',
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
          model: StabilityManagement,
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
        },
        {
          model: ApplicationManagement,
          as: 'applicationManagement',
          include: [
            {
              model: require('../models/userModel'),
              as: 'complianceManager',
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
          model: require('../models/companyModel'),
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_code', 'gst_number']
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
          model: StabilityManagement,
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
        },
        {
          model: ApplicationManagement,
          as: 'applicationManagement',
          include: [
            {
              model: require('../models/userModel'),
              as: 'complianceManager',
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

    // If status is changed to 'application', automatically create application management record
    if (status === 'application') {
      try {
        // Check if application management record already exists
        const existingApplication = await ApplicationManagement.findOne({
          where: { factory_quotation_id: quotationId }
        });

        if (!existingApplication) {
          // Get the first available compliance manager
          const complianceManager = await User.findOne({
            include: [
              {
                model: Role,
                through: UserRole,
                where: { role_name: 'Compliance_manager' }
              }
            ],
            attributes: ['user_id', 'username', 'email']
          });

          if (complianceManager) {
            // Create application management record
            await ApplicationManagement.create({
              factory_quotation_id: quotationId,
              compliance_manager_id: complianceManager.user_id,
              status: 'application'
            });
            console.log('✅ Application management record created automatically for quotation:', quotationId);
          } else {
            console.log('⚠️ No compliance manager found for automatic assignment');
          }
        } else {
          console.log('✅ Application management record already exists for quotation:', quotationId);
        }
      } catch (appError) {
        console.error('Error creating application management record:', appError);
        // Don't fail the status update if application creation fails
      }
    }
    
    const updatedQuotation = await FactoryQuotation.findByPk(quotationId, {
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
          model: StabilityManagement,
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
        },
        {
          model: ApplicationManagement,
          as: 'applicationManagement',
          include: [
            {
              model: require('../models/userModel'),
              as: 'complianceManager',
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
    
    // Prepare data for the new PDF generator
    const pdfData = {
      id: quotation.id,
      companyName: quotation.companyName,
      companyAddress: quotation.companyAddress,
      phone: quotation.phone,
      date: new Date(quotation.createdAt).toLocaleDateString('en-GB'),
      totalAmount: quotation.totalAmount,
      items: [
        {
          particular: 'Factory License Compliance',
          workDetails: `${quotation.horsePower} HP, ${quotation.noOfWorkers || quotation.numberOfWorkers} Workers`,
          hoursYears: `${quotation.year} Year(s)`,
          amount: quotation.calculatedAmount * (quotation.year || 1)
        }
      ],
      additionalCharges: [
        { amount: quotation.planCharge || 0 },
        { amount: quotation.stabilityCertificateAmount || 0 },
        { amount: quotation.administrationCharge || 0 },
        { amount: quotation.consultancyFees || 0 }
      ]
    };

    // Generate PDF using new method
    console.log('Starting PDF generation for quotation:', quotationId);
    const outputDir = path.join(__dirname, '../uploads/pdfs');
    console.log('Output directory:', outputDir);
    console.log('Current __dirname:', __dirname);
    
    let pdfPath, filename;
    try {
      pdfPath = await pdfGenerator.generatePDF(pdfData, outputDir);
      console.log('PDF generated successfully at:', pdfPath);
      
      // Extract filename from path
      filename = path.basename(pdfPath);
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      throw new Error(`PDF generation failed: ${pdfError.message}`);
    }
    
    const relativePath = `uploads/pdfs/${filename}`;
    console.log('Relative path for database:', relativePath);

    // Update quotation with PDF path
    console.log('Updating database with pdfPath:', relativePath);
    const updateResult = await FactoryQuotation.update(
      { pdfPath: relativePath },
      { where: { id: quotationId } }
    );
    console.log('Database update result:', updateResult);
    
    // Verify the update by fetching the quotation again
    const updatedQuotation = await FactoryQuotation.findByPk(quotationId);
    console.log('Updated quotation pdfPath:', updatedQuotation?.pdfPath);

    res.json({
      success: true,
      message: 'Professional PDF generated successfully',
      data: {
        filename: filename,
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

    const fs = require('fs');
    
    // Construct full file path
    const filePath = path.join(__dirname, '..', quotation.pdfPath);
    console.log('Download - quotation.pdfPath:', quotation.pdfPath);
    console.log('Download - constructed filePath:', filePath);
    console.log('Download - __dirname:', __dirname);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('Download - File does not exist at:', filePath);
      return res.status(404).json({ success: false, message: 'PDF file not found on server' });
    }
    console.log('Download - File exists at:', filePath);

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

exports.getStatistics = async (req, res) => {
  try {
    // Get total quotations count
    const total = await FactoryQuotation.count();

    // Get count by status
    const pending = await FactoryQuotation.count({
      where: { status: 'maked' }
    });

    const approved = await FactoryQuotation.count({
      where: { status: 'approved' }
    });

    const rejected = await FactoryQuotation.count({
      where: { status: 'reject' }
    });

    const plan = await FactoryQuotation.count({
      where: { status: 'plan' }
    });

    const stability = await FactoryQuotation.count({
      where: { status: 'stability' }
    });

    const application = await FactoryQuotation.count({
      where: { status: 'application' }
    });

    const renewal = await FactoryQuotation.count({
      where: { status: 'renewal' }
    });

    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        plan,
        stability,
        application,
        renewal
      }
    });
  } catch (error) {
    console.error('Error fetching factory quotation statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get factory quotation statistics',
      error: error.message 
    });
  }
}; 