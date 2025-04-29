const { Company, User, Role, Vendor } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

const companyController = {
  // Create a new company
  async createCompany(req, res) {
    try {
      // Log the incoming request body and files
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);

      // Extract form data from request body
      const formData = req.body;

      // Validate required fields
      const requiredFields = [
        'company_name',
        'owner_name',
        'owner_address',
        'designation',
        'company_address',
        'contact_number',
        'company_email',
        'gst_number',
        'pan_number',
        'firm_type',
        'nature_of_work',
        'type_of_company'
      ];

      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Check if company with same GST number exists
      if (formData.gst_number) {
        const existingCompany = await Company.findOne({
          where: { gst_number: formData.gst_number }
        });

        if (existingCompany) {
          return res.status(400).json({
            success: false,
            error: 'Company with this GST number already exists'
          });
        }
      }

      // Check if user with same email exists
      let user = await User.findOne({
        where: {
          email: formData.company_email
        }
      });

      if (!user) {
        // Create new user with company role
        const randomPassword = Math.random().toString(36).slice(-8);
        user = await User.create({
          username: formData.owner_name,
          email: formData.company_email,
          password: randomPassword,
          role_id: 5 // company role
        });
      }

      // Create company with user_id
      const company = await Company.create({
        company_name: formData.company_name,
        owner_name: formData.owner_name,
        owner_address: formData.owner_address,
        designation: formData.designation,
        company_address: formData.company_address,
        contact_number: formData.contact_number,
        company_email: formData.company_email,
        gst_number: formData.gst_number,
        pan_number: formData.pan_number,
        firm_type: formData.firm_type,
        nature_of_work: formData.nature_of_work,
        factory_license_number: formData.factory_license_number,
        labour_license_number: formData.labour_license_number,
        type_of_company: formData.type_of_company,
        user_id: user.user_id
      });

      // Handle file uploads if present
      if (req.files) {
        if (req.files.gst_document && req.files.gst_document[0]) {
          const gstDocument = req.files.gst_document[0];
          await company.update({
            gst_document: gstDocument.filename
          });
        }
        if (req.files.pan_document && req.files.pan_document[0]) {
          const panDocument = req.files.pan_document[0];
          await company.update({
            pan_document: panDocument.filename
          });
        }
      }

      res.status(201).json({
        success: true,
        data: {
          company,
          user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role_id: user.role_id
          }
        }
      });
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all companies
  async getAllCompanies(req, res) {
    try {
      const companies = await Company.findAll({
        include: [{
          model: User,
          include: [{
            model: Role,
            attributes: ['role_name']
          }]
        }]
      });

      res.status(200).json({
        success: true,
        data: companies
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all company vendors
  async getAllCompanyVendors(req, res) {
    try {
      const vendors = await Vendor.findAll({
        include: [{
          model: Company,
          include: [{
            model: User,
            include: [{
              model: Role,
              attributes: ['role_name']
            }]
          }]
        }]
      });
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get company by ID
  async getCompanyById(req, res) {
    try {
      const company = await Company.findByPk(req.params.id, {
        include: [{
          model: User,
          include: [{
            model: Role,
            attributes: ['role_name']
          }]
        }]
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      res.status(200).json({
        success: true,
        data: company
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Update company
  async updateCompany(req, res) {
    try {
      const company = await Company.findByPk(req.params.id, {
        include: [{
          model: User,
          attributes: ['user_id', 'username', 'email']
        }]
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      const {
        company_name,
        owner_name,
        owner_address,
        designation,
        company_address,
        contact_number,
        company_email,
        gst_number,
        pan_number,
        firm_type,
        nature_of_work,
        factory_license_number,
        labour_license_number,
        type_of_company,
        company_website
      } = req.body;

      // Handle file uploads
      const uploadDir = path.join(__dirname, '../../uploads/company_documents');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      let gst_document_name = company.gst_document_name;
      let pan_document_name = company.pan_document_name;

      if (req.files) {
        if (req.files.gst_document) {
          // Delete old file if exists
          if (gst_document_name) {
            const oldFilePath = path.join(uploadDir, gst_document_name);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
          }

          const gstFile = req.files.gst_document;
          gst_document_name = `${Date.now()}-${gstFile.name}`;
          await gstFile.mv(path.join(uploadDir, gst_document_name));
        }

        if (req.files.pan_document) {
          // Delete old file if exists
          if (pan_document_name) {
            const oldFilePath = path.join(uploadDir, pan_document_name);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
          }

          const panFile = req.files.pan_document;
          pan_document_name = `${Date.now()}-${panFile.name}`;
          await panFile.mv(path.join(uploadDir, pan_document_name));
        }
      }

      // Start a transaction to ensure both updates succeed or fail together
      const transaction = await Company.sequelize.transaction();

      try {
        // Update company
        await company.update({
          company_name,
          owner_name,
          owner_address,
          designation,
          company_address,
          contact_number,
          company_email,
          gst_number,
          gst_document_name,
          pan_number,
          pan_document_name,
          firm_type,
          nature_of_work,
          factory_license_number,
          labour_license_number,
          type_of_company,
          company_website
        }, { transaction });

        // Update associated user if it exists
        if (company.User) {
          await company.User.update({
            username: company_name,
            email: company_email
          }, { transaction });
        }

        // Commit the transaction
        await transaction.commit();

        // Fetch the updated company with user details
        const updatedCompany = await Company.findByPk(req.params.id, {
          include: [{
            model: User,
            attributes: ['user_id', 'username', 'email']
          }]
        });

        res.status(200).json({
          success: true,
          data: updatedCompany
        });
      } catch (error) {
        // Rollback the transaction if there's an error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = companyController; 