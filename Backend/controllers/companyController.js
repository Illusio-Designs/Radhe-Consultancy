const { Company, User, Role, Vendor, sequelize, UserRoleWorkLog } = require('../models');
const userService = require('../services/userService');
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

      // Extract form data from request body
      const formData = req.body;
      console.log('[Company] Form data:', JSON.stringify(formData, null, 2));

      // Validate required fields
      const requiredFields = [
        'company_name',
        'owner_name',
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

      // Start transaction
      transaction = await Company.sequelize.transaction();
      console.log('[Company] Transaction started');

      // Check if company with same GST number exists
      if (formData.gst_number) {
        const existingCompany = await Company.findOne({
          where: { gst_number: formData.gst_number }
        });
        if (existingCompany) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Company with this GST number already exists'
          });
        }
      }

      // Check if user with same email exists
      let user = await User.findOne({ where: { email: formData.company_email } });
      if (!user) {
        // Create new user with company role
        const randomPassword = Math.random().toString(36).slice(-8);
        const companyRole = await Role.findOne({ where: { role_name: 'Company' } });
        if (!companyRole) {
          await transaction.rollback();
          return res.status(500).json({
            success: false,
            error: 'Company role not found in database'
          });
        }
        try {
          user = await userService.createUser({
            username: formData.owner_name,
            email: formData.company_email,
            password: randomPassword,
            role_ids: [companyRole.id]
          }, { transaction });
        } catch (err) {
          await transaction.rollback();
          return res.status(500).json({
            success: false,
            error: 'Failed to create user',
            details: err.message
          });
        }
      } else {
        // Ensure user has the Company role
        const companyRole = await Role.findOne({ where: { role_name: 'Company' } });
        if (companyRole) {
          const hasRole = await user.hasRole(companyRole);
          if (!hasRole) {
            await user.addRole(companyRole, { through: { is_primary: true, assigned_by: user.user_id }, transaction });
          }
        }
      }
      if (!user || !user.user_id) {
        await transaction.rollback();
        return res.status(500).json({
          success: false,
          error: 'Failed to create or find user',
          userObject: user
        });
      }

      // Validate company code if provided
      if (formData.company_code && formData.company_code.trim() !== '') {
        // Check if company code already exists
        const existingCompanyWithCode = await Company.findOne({
          where: { company_code: formData.company_code }
        });
        if (existingCompanyWithCode) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Company code already exists. Please use a different code.'
          });
        }
      }

      // Create new company
      let company;
      try {
        company = await Company.create({
          company_name: formData.company_name,
          company_code: formData.company_code || null,
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
      } catch (err) {
        await transaction.rollback();
        return res.status(500).json({
          success: false,
          error: 'Failed to create company',
          details: err.message
        });
      }
      if (!company || !company.company_id) {
        await transaction.rollback();
        return res.status(500).json({
          success: false,
          error: 'Failed to create company',
          companyObject: company
        });
      }

      // Handle file uploads if present
      if (req.files) {
        const updateData = {};
        if (req.files.gst_document && req.files.gst_document[0]) {
          updateData.gst_document_name = req.files.gst_document[0].filename;
        }
        if (req.files.pan_document && req.files.pan_document[0]) {
          updateData.pan_document_name = req.files.pan_document[0].filename;
        }
        if (Object.keys(updateData).length > 0) {
          await company.update(updateData, { transaction });
        }
      }

      // Commit the transaction
      await transaction.commit();
      console.log('[Company] Transaction committed');

      // Fetch the created company with user details
      const createdCompany = await Company.findByPk(company.company_id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'email']
        }]
      });

      try {
        await UserRoleWorkLog.create({
          user_id: req.user?.user_id || null,
          target_user_id: user.user_id,
          role_id: null,
          action: 'created_company',
          details: JSON.stringify({ company_id: company.company_id, company_name: company.company_name })
        });
      } catch (logErr) { console.error('Log error:', logErr); }

      res.status(201).json({
        success: true,
        data: createdCompany
      });
    } catch (error) {
      console.error('[Company] Error creating company:', error.message);
      if (transaction && !transaction.finished) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('[Company] Error rolling back transaction:', rollbackError.message);
        }
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        const fields = error.errors ? error.errors.map(e => e.path).join(', ') : 'unknown';
        return res.status(400).json({
          success: false,
          error: `Duplicate entry: ${fields} must be unique.`
        });
      } else if (error.name === 'SequelizeValidationError') {
        const details = error.errors ? error.errors.map(e => e.message).join('; ') : error.message;
        return res.status(400).json({
          success: false,
          error: `Validation error: ${details}`
        });
      } else {
        return res.status(500).json({
          success: false,
          error: `Company creation failed: ${error.message}`
        });
      }
    }
  },

  // Get all companies
  async getAllCompanies(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || parseInt(req.query.pageSize) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Company.findAndCountAll({
        include: [{
          model: User,
          as: 'user',
          include: [{
            model: Role,
            as: 'roles',
            attributes: ['role_name'],
            through: { attributes: ['is_primary'] }
          }]
        }],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        companies: rows,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(count / limit),
        totalItems: count
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
              as: 'roles',
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
          as: 'user',
          include: [{
            model: Role,
            as: 'roles',
            attributes: ['role_name'],
            through: { attributes: ['is_primary'] }
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

        // Handle company code validation if provided
        if (req.body.company_code && req.body.company_code.trim() !== '') {
            // Check if the new company code is different from the current one
            if (req.body.company_code !== company.company_code) {
                // Check if the new company code already exists
                const existingCompanyWithCode = await Company.findOne({
                    where: { company_code: req.body.company_code }
                });
                if (existingCompanyWithCode) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Company code already exists. Please use a different code.'
                    });
                }
            }
        }

        // Prepare update data
        const updateData = {
            company_name: req.body.company_name,
            company_code: req.body.company_code || company.company_code, // Keep existing if not provided
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

        // Log the action
        try {
          await UserRoleWorkLog.create({
            user_id: req.user?.user_id || null,
            target_user_id: null,
            role_id: null,
            action: 'updated_company',
            details: JSON.stringify({
              company_id: company.company_id,
              company_name: company.company_name,
              changes: updateData
            })
          });
        } catch (logErr) { console.error('Log error:', logErr); }

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
            sequelize.where(sequelize.fn('LOWER', sequelize.col('company_name')), 'LIKE', `%${q.toLowerCase()}%`),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('company_email')), 'LIKE', `%${q.toLowerCase()}%`),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('owner_name')), 'LIKE', `%${q.toLowerCase()}%`)
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
    },

    // Get company statistics for CompanyList page
    async getCompanyStatistics(req, res) {
      try {
        console.log('[CompanyController] getCompanyStatistics called');
        
        // Get total companies count
        const totalCompanies = await Company.count();
        
        // Get active companies (assuming all are active for now)
        const activeCompanies = totalCompanies;
        
        // Get recent companies (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentCompanies = await Company.count({
          where: {
            created_at: {
              [Op.gte]: thirtyDaysAgo
            }
          }
        });
        
        // Format the statistics - only essential data
        const statistics = {
          total_companies: totalCompanies,
          active_companies: activeCompanies,
          recent_companies: recentCompanies
        };
        
        console.log('[CompanyController] Company statistics retrieved successfully');
        res.json({
          success: true,
          data: statistics
        });
        
      } catch (error) {
        console.error('[CompanyController] Error getting company statistics:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to get company statistics',
          error: error.message
        });
      }
    }
  };

module.exports = companyController; 