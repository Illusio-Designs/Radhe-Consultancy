const { Company, EmployeeCompensationPolicy } = require('../models');
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

    // --- Insurance Policy Stats ---
    // Real data for ECP
    const ecpTotal = await EmployeeCompensationPolicy.count();
    const ecpRecent = await EmployeeCompensationPolicy.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    // Static data for other types
    const vehicleTotal = 12;
    const vehicleRecent = 2;
    const fireTotal = 8;
    const fireRecent = 1;
    const marineTotal = 5;
    const marineRecent = 0;
    const healthTotal = 20;
    const healthRecent = 3;
    // Combined totals
    const allTotal = ecpTotal + vehicleTotal + fireTotal + marineTotal + healthTotal;
    const allRecent = ecpRecent + vehicleRecent + fireRecent + marineRecent + healthRecent;
    // Helper for percent
    const percent = (recent, total) => total > 0 ? Math.round((recent / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        total_companies: totalCompanies,
        active_companies: activeCompanies,
        inactive_companies: inactiveCompanies,
        recent_companies: recentCompanies,
        insurance_stats: {
          all: {
            total: allTotal,
            recent: allRecent,
            percent: percent(allRecent, allTotal)
          },
          ecp: {
            total: ecpTotal,
            recent: ecpRecent,
            percent: percent(ecpRecent, ecpTotal)
          },
          vehicle: {
            total: vehicleTotal,
            recent: vehicleRecent,
            percent: percent(vehicleRecent, vehicleTotal)
          },
          fire: {
            total: fireTotal,
            recent: fireRecent,
            percent: percent(fireRecent, fireTotal)
          },
          marine: {
            total: marineTotal,
            recent: marineRecent,
            percent: percent(marineRecent, marineTotal)
          },
          health: {
            total: healthTotal,
            recent: healthRecent,
            percent: percent(healthRecent, healthTotal)
          }
        }
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