const { Op } = require('sequelize');
const InsuranceCompany = require('../models/InsuranceCompany');
const { validationResult } = require('express-validator');

// Get all insurance companies
const getAllInsuranceCompanies = async (req, res) => {
  try {
    const companies = await InsuranceCompany.findAll({
      order: [['name', 'ASC']]
    });
    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('Error fetching insurance companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance companies',
      error: error.message
    });
  }
};

// Get single insurance company
const getInsuranceCompany = async (req, res) => {
  try {
    const company = await InsuranceCompany.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Insurance company not found'
      });
    }
    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error fetching insurance company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance company',
      error: error.message
    });
  }
};

// Create insurance company
const createInsuranceCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name } = req.body;

    // Check if company with same name exists
    const existingCompany = await InsuranceCompany.findOne({ where: { name } });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Insurance company with this name already exists'
      });
    }

    const company = await InsuranceCompany.create({ name });
    res.status(201).json({
      success: true,
      message: 'Insurance company created successfully',
      data: company
    });
  } catch (error) {
    console.error('Error creating insurance company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create insurance company',
      error: error.message
    });
  }
};

// Update insurance company
const updateInsuranceCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name } = req.body;
    const company = await InsuranceCompany.findByPk(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Insurance company not found'
      });
    }

    // Check if another company with the same name exists
    if (name !== company.name) {
      const existingCompany = await InsuranceCompany.findOne({ 
        where: { 
          name,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'Insurance company with this name already exists'
        });
      }
    }

    await company.update({ name });
    res.json({
      success: true,
      message: 'Insurance company updated successfully',
      data: company
    });
  } catch (error) {
    console.error('Error updating insurance company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update insurance company',
      error: error.message
    });
  }
};

// Delete insurance company
const deleteInsuranceCompany = async (req, res) => {
  try {
    const company = await InsuranceCompany.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Insurance company not found'
      });
    }

    // Check if the company has any associated policies
    const hasAssociatedPolicies = await company.countEmployeeCompensationPolicies();
    if (hasAssociatedPolicies > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete insurance company with associated policies'
      });
    }

    await company.destroy();
    res.json({
      success: true,
      message: 'Insurance company deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting insurance company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete insurance company',
      error: error.message
    });
  }
};

module.exports = {
  getAllInsuranceCompanies,
  getInsuranceCompany,
  createInsuranceCompany,
  updateInsuranceCompany,
  deleteInsuranceCompany
}; 