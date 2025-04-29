const { Company, User, Role, Vendor } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

const companyController = {
  // Create a new company
  async createCompany(req, res) {
    try {
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

      let gst_document_name = null;
      let pan_document_name = null;

      if (req.files) {
        if (req.files.gst_document) {
          const gstFile = req.files.gst_document;
          gst_document_name = `${Date.now()}-${gstFile.name}`;
          await gstFile.mv(path.join(uploadDir, gst_document_name));
        }

        if (req.files.pan_document) {
          const panFile = req.files.pan_document;
          pan_document_name = `${Date.now()}-${panFile.name}`;
          await panFile.mv(path.join(uploadDir, pan_document_name));
        }
      }

      // Create user with company role
      const user = await User.create({
        username: company_name,
        email: company_email,
        role_id: 5 // company role
      });

      // Create company
      const company = await Company.create({
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
        company_website,
        user_id: user.user_id
      });

      res.status(201).json({
        success: true,
        data: { company, user }
      });
    } catch (error) {
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