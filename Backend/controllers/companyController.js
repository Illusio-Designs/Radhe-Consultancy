const { Company, User, Role, Vendor, sequelize } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const fsSync = require('fs');

const companyController = {
  // Create a new company
  async createCompany(req, res) {
    let transaction;
    try {
      console.log('[Company] ===== Starting company creation process =====');
      console.log('[Company] Request body:', JSON.stringify(req.body, null, 2));
      console.log('[Company] Request files:', req.files ? JSON.stringify(req.files, null, 2) : 'No files');
      
      if (req.files) {
        console.log('[Company] File details:');
        if (req.files.gst_document) {
          console.log('[Company] GST Document:', {
            fieldname: req.files.gst_document[0].fieldname,
            originalname: req.files.gst_document[0].originalname,
            encoding: req.files.gst_document[0].encoding,
            mimetype: req.files.gst_document[0].mimetype,
            filename: req.files.gst_document[0].filename,
            size: req.files.gst_document[0].size
          });
        } else {
          console.log('[Company] No GST document uploaded');
        }

        if (req.files.pan_document) {
          console.log('[Company] PAN Document:', {
            fieldname: req.files.pan_document[0].fieldname,
            originalname: req.files.pan_document[0].originalname,
            encoding: req.files.pan_document[0].encoding,
            mimetype: req.files.pan_document[0].mimetype,
            filename: req.files.pan_document[0].filename,
            size: req.files.pan_document[0].size
          });
        } else {
          console.log('[Company] No PAN document uploaded');
        }
      }

      // Extract form data from request body
      const formData = req.body;
      console.log('[Company] Form data:', JSON.stringify(formData, null, 2));

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
        console.log('[Company] Missing required fields:', missingFields);
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Start transaction
      transaction = await Company.sequelize.transaction();
      console.log('[Company] Transaction started');

      // Check if company with same GST number exists
      if (formData.gst_number) {
        const existingCompany = await Company.findOne({
          where: { gst_number: formData.gst_number }
        });

        if (existingCompany) {
          console.log('[Company] Company with GST number already exists:', formData.gst_number);
          await transaction.rollback();
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
        console.log('[Company] Creating new user for email:', formData.company_email);
        // Create new user with company role
        const randomPassword = Math.random().toString(36).slice(-8);
        user = await User.create({
          username: formData.owner_name,
          email: formData.company_email,
          password: randomPassword,
          role_id: 5 // company role
        }, { transaction });
        console.log('[Company] New user created:', user.user_id);
      } else {
        console.log('[Company] Existing user found:', user.user_id);
      }

      if (!user || !user.user_id) {
        throw new Error('Failed to create or find user');
      }

      // Create new company
      console.log('[Company] Creating new company record');
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
        company_website: formData.company_website,
        user_id: user.user_id
      }, { transaction });

      if (!company || !company.company_id) {
        throw new Error('Failed to create company');
      }

      console.log('[Company] Company record created:', company.company_id);

      // Handle file uploads if present
      if (req.files) {
        console.log('[Company] Processing file uploads');
        const updateData = {};
        
        if (req.files.gst_document && req.files.gst_document[0]) {
          updateData.gst_document_name = req.files.gst_document[0].filename;
          console.log('[Company] GST document filename saved:', updateData.gst_document_name);
        }
        
        if (req.files.pan_document && req.files.pan_document[0]) {
          updateData.pan_document_name = req.files.pan_document[0].filename;
          console.log('[Company] PAN document filename saved:', updateData.pan_document_name);
        }

        if (Object.keys(updateData).length > 0) {
          console.log('[Company] Updating company with document names:', updateData);
          await company.update(updateData, { transaction });
          console.log('[Company] Company updated with document names');
        }
      }

      // Commit the transaction
      await transaction.commit();
      console.log('[Company] Transaction committed');

      // Fetch the created company with user details
      const createdCompany = await Company.findByPk(company.company_id, {
        include: [{
          model: User,
          attributes: ['user_id', 'username', 'email']
        }]
      });

      console.log('[Company] Final company data:', {
        id: createdCompany.company_id,
        gstDocument: createdCompany.gst_document_name,
        panDocument: createdCompany.pan_document_name,
        user: createdCompany.User ? {
          id: createdCompany.User.user_id,
          username: createdCompany.User.username,
          email: createdCompany.User.email
        } : null
      });

      res.status(201).json({
        success: true,
        data: createdCompany
      });
    } catch (error) {
      console.error('[Company] Error creating company:', error);
      
      // Only attempt rollback if transaction exists and hasn't been committed
      if (transaction && !transaction.finished) {
        try {
          await transaction.rollback();
          console.log('[Company] Transaction rolled back');
        } catch (rollbackError) {
          console.error('[Company] Error rolling back transaction:', rollbackError);
        }
      }

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
    console.log('[CompanyController] Starting company update process');
    console.log('[CompanyController] Request body:', req.body);
    console.log('[CompanyController] Request files:', req.files);

    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        console.log('[CompanyController] Updating company with ID:', id);

        // Check if company exists
        const company = await Company.findByPk(id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        // Handle file uploads
        const uploadedFiles = req.files || {};
        console.log('[CompanyController] Uploaded files:', uploadedFiles);

        // Prepare update data
        const updateData = {
            company_name: req.body.company_name,
            owner_name: req.body.owner_name,
            owner_address: req.body.owner_address,
            designation: req.body.designation,
            company_address: req.body.company_address,
            contact_number: req.body.contact_number,
            company_email: req.body.company_email,
            gst_number: req.body.gst_number,
            pan_number: req.body.pan_number,
            firm_type: req.body.firm_type,
            nature_of_work: req.body.nature_of_work,
            factory_license_number: req.body.factory_license_number,
            labour_license_number: req.body.labour_license_number,
            type_of_company: req.body.type_of_company
        };

        // Handle GST document
        if (uploadedFiles.gst_document && uploadedFiles.gst_document[0]) {
            // Delete old file if exists
            if (company.gst_document) {
                const oldFilePath = path.join(__dirname, '..', 'uploads', 'company_documents', company.gst_document);
                try {
                    await fs.unlink(oldFilePath);
                    console.log('[CompanyController] Deleted old GST document:', oldFilePath);
                } catch (error) {
                    console.error('[CompanyController] Error deleting old GST document:', error);
                }
            }
            updateData.gst_document = uploadedFiles.gst_document[0].filename;
            updateData.gst_document_name = uploadedFiles.gst_document[0].originalname;
            console.log('[CompanyController] Updated GST document:', {
                filename: updateData.gst_document,
                originalname: updateData.gst_document_name
            });
        } else if (req.body.existing_gst_document) {
            // Keep existing file
            updateData.gst_document = req.body.existing_gst_document;
            updateData.gst_document_name = req.body.gst_document_name;
            console.log('[CompanyController] Kept existing GST document:', {
                filename: updateData.gst_document,
                originalname: updateData.gst_document_name
            });
        }

        // Handle PAN document
        if (uploadedFiles.pan_document && uploadedFiles.pan_document[0]) {
            // Delete old file if exists
            if (company.pan_document) {
                const oldFilePath = path.join(__dirname, '..', 'uploads', 'company_documents', company.pan_document);
                try {
                    await fs.unlink(oldFilePath);
                    console.log('[CompanyController] Deleted old PAN document:', oldFilePath);
                } catch (error) {
                    console.error('[CompanyController] Error deleting old PAN document:', error);
                }
            }
            updateData.pan_document = uploadedFiles.pan_document[0].filename;
            updateData.pan_document_name = uploadedFiles.pan_document[0].originalname;
            console.log('[CompanyController] Updated PAN document:', {
                filename: updateData.pan_document,
                originalname: updateData.pan_document_name
            });
        } else if (req.body.existing_pan_document) {
            // Keep existing file
            updateData.pan_document = req.body.existing_pan_document;
            updateData.pan_document_name = req.body.pan_document_name;
            console.log('[CompanyController] Kept existing PAN document:', {
                filename: updateData.pan_document,
                originalname: updateData.pan_document_name
            });
        }

        console.log('[CompanyController] Updating company with data:', updateData);

        // Update company
        await company.update(updateData, { transaction });

        // Update user email if changed
        if (company.user_id) {
            const user = await User.findByPk(company.user_id);
            if (user && user.email !== req.body.company_email) {
                console.log('[CompanyController] Updating user email from', user.email, 'to', req.body.company_email);
                await user.update({ email: req.body.company_email }, { transaction });
            }
        }

        await transaction.commit();
        console.log('[CompanyController] Transaction committed successfully');

        // Get updated company with user details
        const updatedCompany = await Company.findByPk(id, {
        include: [{
          model: User,
                include: [{
                    model: Role,
                    attributes: ['role_name']
                }]
        }]
      });

        console.log('[CompanyController] Final company data:', {
            id: updatedCompany.company_id,
            company_name: updatedCompany.company_name,
            gstDocument: {
                filename: updatedCompany.gst_document,
                originalname: updatedCompany.gst_document_name
            },
            panDocument: {
                filename: updatedCompany.pan_document,
                originalname: updatedCompany.pan_document_name
            },
            user: {
                id: updatedCompany.User?.user_id,
                username: updatedCompany.User?.username,
                email: updatedCompany.User?.email,
                role: updatedCompany.User?.Role?.role_name
            }
        });

        res.json({
            success: true,
            message: 'Company updated successfully',
            data: updatedCompany
        });
    } catch (error) {
        await transaction.rollback();
        console.error('[CompanyController] Error updating company:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating company',
            error: error.message
        });
    }
  },

  // Delete company
  async deleteCompany(req, res) {
    try {
      console.log('[Company] Starting company deletion process');
      console.log('[Company] Company ID:', req.params.id);

      const company = await Company.findByPk(req.params.id);

      if (!company) {
        console.log('[Company] Company not found:', req.params.id);
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      // Delete associated files if they exist
      const uploadDir = path.join(__dirname, '..', 'uploads', 'company_documents');
      
      if (company.gst_document_name) {
        const gstFilePath = path.join(uploadDir, company.gst_document_name);
        console.log('[Company] Attempting to delete GST document:', gstFilePath);
        if (fs.existsSync(gstFilePath)) {
          fs.unlinkSync(gstFilePath);
          console.log('[Company] GST document deleted successfully');
        }
      }

      if (company.pan_document_name) {
        const panFilePath = path.join(uploadDir, company.pan_document_name);
        console.log('[Company] Attempting to delete PAN document:', panFilePath);
        if (fs.existsSync(panFilePath)) {
          fs.unlinkSync(panFilePath);
          console.log('[Company] PAN document deleted successfully');
        }
      }

      // Start a transaction to ensure both company and user deletion succeed or fail together
      const transaction = await Company.sequelize.transaction();

      try {
        // Delete associated user if it exists
        if (company.user_id) {
          console.log('[Company] Deleting associated user:', company.user_id);
          await User.destroy({
            where: { user_id: company.user_id },
            transaction
          });
        }

        // Delete the company
        console.log('[Company] Deleting company:', company.id);
        await company.destroy({ transaction });

        // Commit the transaction
        await transaction.commit();

        console.log('[Company] Company deleted successfully');
        res.status(200).json({
          success: true,
          message: 'Company deleted successfully'
        });
      } catch (error) {
        // Rollback the transaction if there's an error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('[Company] Error deleting company:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Search companies by company_name, company_email, or owner_name
  async searchCompanies(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, error: 'Missing search query' });
      }

      console.log(`[CompanyController] Searching companies with query: "${q}"`);

      const companies = await Company.findAll({
        where: {
          [Op.or]: [
            { company_name: { [Op.iLike]: `%${q}%` } },
            { company_email: { [Op.iLike]: `%${q}%` } },
            { owner_name: { [Op.iLike]: `%${q}%` } }
          ]
        }
      });

      console.log(`[CompanyController] Found ${companies.length} companies for query: "${q}"`);

      return res.json({
        success: true,
        count: companies.length,
        data: companies
      });
    } catch (error) {
      console.error('[CompanyController] Error searching companies:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = companyController; 