const { Company, User, Role } = require('../models');
const { Op } = require('sequelize');

const companyController = {
  // Create a new company
  async createCompany(req, res) {
    try {
      const {
        company_name,
        owner_name,
        company_address,
        contact_number,
        company_email,
        gst_number,
        pan_number,
        firm_type,
        company_website
      } = req.body;

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
        company_address,
        contact_number,
        company_email,
        gst_number,
        pan_number,
        firm_type,
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
          include: [Role]
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

  // Get company by ID
  async getCompanyById(req, res) {
    try {
      const company = await Company.findByPk(req.params.id, {
        include: [{
          model: User,
          include: [Role]
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
      const company = await Company.findByPk(req.params.id);

      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      await company.update(req.body);

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

  // Delete company
  async deleteCompany(req, res) {
    try {
      const company = await Company.findByPk(req.params.id);

      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }

      await company.destroy();

      res.status(200).json({
        success: true,
        message: 'Company deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = companyController; 