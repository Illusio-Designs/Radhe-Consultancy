const { Company } = require('../models');
const { Op } = require('sequelize');

const getCompanyStatistics = async (req, res) => {
  try {
    // Get total companies count
    const totalCompanies = await Company.count();

    // Get active companies count (where status is 'Active' or status field doesn't exist)
    const activeCompanies = await Company.count({
      where: {
        [Op.or]: [
          { status: 'Active' },
          { status: null }
        ]
      }
    });

    // Get inactive companies count (where status is 'Inactive')
    const inactiveCompanies = await Company.count({
      where: {
        status: 'Inactive'
      }
    });

    // Get companies created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCompanies = await Company.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Return the statistics
    res.status(200).json({
      success: true,
      data: {
        total_companies: totalCompanies,
        active_companies: activeCompanies,
        inactive_companies: inactiveCompanies,
        recent_companies: recentCompanies
      }
    });
  } catch (error) {
    console.error('Error fetching company statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company statistics'
    });
  }
};

module.exports = {
  getCompanyStatistics
}; 