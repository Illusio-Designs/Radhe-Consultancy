const { Company, EmployeeCompensationPolicy, Consumer, User, Role, VehiclePolicy, HealthPolicy, FirePolicy, LifePolicy, DSC, UserRole } = require('../models');
const { Op } = require('sequelize');

const getCompanyStatistics = async (req, res) => {
  try {
    console.log('Backend: Starting to fetch company statistics');
    
    // Get total companies count
    const totalCompanies = await Company.count();
    console.log('Backend: Total companies:', totalCompanies);

    // Get active companies count (where status is 'Active' or status field doesn't exist)
    const activeCompanies = await Company.count({
      where: {
        [Op.or]: [
          { status: 'Active' },
          { status: null }
        ]
      }
    });
    console.log('Backend: Active companies:', activeCompanies);

    // Get inactive companies count (where status is 'Inactive')
    const inactiveCompanies = await Company.count({
      where: {
        status: 'Inactive'
      }
    });
    console.log('Backend: Inactive companies:', inactiveCompanies);

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
    console.log('Backend: Recent companies:', recentCompanies);

    // --- Consumer Stats ---
    const totalConsumers = await Consumer.count();
    console.log('Backend: Total consumers:', totalConsumers);
    
    const activeConsumers = totalConsumers; // All are active
    const inactiveConsumers = 0;
    
    const recentConsumers = await Consumer.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('Backend: Recent consumers:', recentConsumers);
    const percent = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;

    // --- User Role Stats ---
    const roles = await Role.findAll();
    const userRoleStats = {};
    for (const role of roles) {
      // Count users with this role using the UserRole junction table
      const count = await UserRole.count({ 
        where: { role_id: role.id } 
      });
      userRoleStats[role.role_name] = count;
    }

    // --- DSC Stats ---
    const dscTotal = await DSC.count();
    const dscIn = await DSC.count({ where: { status: 'in' } });
    const dscOut = await DSC.count({ where: { status: 'out' } });
    const dscRecent = await DSC.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Calculate percentages for DSC stats
    const dscPercentIn = dscTotal > 0 ? Math.round((dscIn / dscTotal) * 100) : 0;
    const dscPercentOut = dscTotal > 0 ? Math.round((dscOut / dscTotal) * 100) : 0;
    const dscPercentRecent = dscTotal > 0 ? Math.round((dscRecent / dscTotal) * 100) : 0;

    console.log('Backend: DSC stats:', { 
      total: dscTotal, 
      in: dscIn, 
      out: dscOut, 
      recent: dscRecent,
      percentIn: dscPercentIn,
      percentOut: dscPercentOut,
      percentRecent: dscPercentRecent
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
    console.log('Backend: ECP stats:', { total: ecpTotal, recent: ecpRecent });

    // Real data for Vehicle Policies
    const vehicleTotal = await VehiclePolicy.count();
    const vehicleRecent = await VehiclePolicy.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('Backend: Vehicle stats:', { total: vehicleTotal, recent: vehicleRecent });

    // Real data for Health Policies
    const healthTotal = await HealthPolicy.count();
    const healthRecent = await HealthPolicy.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('Backend: Health stats:', { total: healthTotal, recent: healthRecent });

    // Real data for Fire Policies
    const fireTotal = await FirePolicy.count();
    const fireRecent = await FirePolicy.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('Backend: Fire stats:', { total: fireTotal, recent: fireRecent });

    // Real data for Life Policies
    const lifeTotal = await LifePolicy.count();
    const lifeRecent = await LifePolicy.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('Backend: Life stats:', { total: lifeTotal, recent: lifeRecent });

    // Combined totals (dynamic, no marine)
    const allTotal = ecpTotal + vehicleTotal + fireTotal + healthTotal + lifeTotal;
    const allRecent = ecpRecent + vehicleRecent + fireRecent + healthRecent + lifeRecent;

    // Helper for percent
    const percentInsurance = (recent, total) => total > 0 ? Math.round((recent / total) * 100) : 0;

    const responseData = {
      total_companies: totalCompanies,
      active_companies: activeCompanies,
      inactive_companies: inactiveCompanies,
      recent_companies: recentCompanies,
      consumer_stats: {
        total: totalConsumers,
        active: activeConsumers,
        inactive: inactiveConsumers,
        recent: recentConsumers,
        percent_active: percent(activeConsumers, totalConsumers),
        percent_inactive: percent(inactiveConsumers, totalConsumers),
        percent_recent: percent(recentConsumers, totalConsumers)
      },
      user_role_stats: userRoleStats,
      dsc_stats: {
        total: dscTotal,
        in: dscIn,
        out: dscOut,
        recent: dscRecent,
        percent_in: dscPercentIn,
        percent_out: dscPercentOut,
        percent_recent: dscPercentRecent
      },
      insurance_stats: {
        all: {
          total: allTotal,
          recent: allRecent,
          percent: percentInsurance(allRecent, allTotal)
        },
        ecp: {
          total: ecpTotal,
          recent: ecpRecent,
          percent: percentInsurance(ecpRecent, ecpTotal)
        },
        vehicle: {
          total: vehicleTotal,
          recent: vehicleRecent,
          percent: percentInsurance(vehicleRecent, vehicleTotal)
        },
        fire: {
          total: fireTotal,
          recent: fireRecent,
          percent: percentInsurance(fireRecent, fireTotal)
        },
        health: {
          total: healthTotal,
          recent: healthRecent,
          percent: percentInsurance(healthRecent, healthTotal)
        },
        life: {
          total: lifeTotal,
          recent: lifeRecent,
          percent: percentInsurance(lifeRecent, lifeTotal)
        }
      }
    };

    console.log('Backend: Sending response:', responseData);
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Backend: Error fetching company statistics:', error.message);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch company statistics: ${error.message}`
    });
  }
};

// Company-specific stats
const getCompanyStats = async (req, res) => {
  try {
    const { companyId } = req.params;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Policies for this company
    const ecpTotal = await EmployeeCompensationPolicy.count({ where: { company_id: companyId } });
    const ecpRecent = await EmployeeCompensationPolicy.count({ where: { company_id: companyId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    const vehicleTotal = await VehiclePolicy.count({ where: { company_id: companyId } });
    const vehicleRecent = await VehiclePolicy.count({ where: { company_id: companyId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    const fireTotal = await FirePolicy.count({ where: { company_id: companyId } });
    const fireRecent = await FirePolicy.count({ where: { company_id: companyId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    const healthTotal = await HealthPolicy.count({ where: { company_id: companyId } });
    const healthRecent = await HealthPolicy.count({ where: { company_id: companyId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    const lifeTotal = await LifePolicy.count({ where: { company_id: companyId } });
    const lifeRecent = await LifePolicy.count({ where: { company_id: companyId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    // DSCs for this company
    const dscTotal = await DSC.count({ where: { company_id: companyId } });
    const dscIn = await DSC.count({ where: { company_id: companyId, status: 'in' } });
    const dscOut = await DSC.count({ where: { company_id: companyId, status: 'out' } });
    const dscRecent = await DSC.count({ where: { company_id: companyId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    // Helper for percent
    const percent = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;
    const percentInsurance = (recent, total) => total > 0 ? Math.round((recent / total) * 100) : 0;
    const allTotal = ecpTotal + vehicleTotal + fireTotal + healthTotal + lifeTotal;
    const allRecent = ecpRecent + vehicleRecent + fireRecent + healthRecent + lifeRecent;
    res.json({
      success: true,
      data: {
        insurance_stats: {
          all: { total: allTotal, recent: allRecent, percent: percentInsurance(allRecent, allTotal) },
          ecp: { total: ecpTotal, recent: ecpRecent, percent: percentInsurance(ecpRecent, ecpTotal) },
          vehicle: { total: vehicleTotal, recent: vehicleRecent, percent: percentInsurance(vehicleRecent, vehicleTotal) },
          fire: { total: fireTotal, recent: fireRecent, percent: percentInsurance(fireRecent, fireTotal) },
          health: { total: healthTotal, recent: healthRecent, percent: percentInsurance(healthRecent, healthTotal) },
          life: { total: lifeTotal, recent: lifeRecent, percent: percentInsurance(lifeRecent, lifeTotal) },
        },
        dsc_stats: {
          total: dscTotal,
          in: dscIn,
          out: dscOut,
          recent: dscRecent,
          percent_in: percent(dscIn, dscTotal),
          percent_out: percent(dscOut, dscTotal),
          percent_recent: percent(dscRecent, dscTotal)
        }
      }
    });
  } catch (error) {
    console.error('Backend: Error fetching company stats:', error.message);
    return res.status(500).json({ success: false, error: `Failed to fetch company stats: ${error.message}` });
  }
};

// Consumer-specific stats
const getConsumerStats = async (req, res) => {
  try {
    const { consumerId } = req.params;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // Policies for this consumer
    const ecpTotal = await EmployeeCompensationPolicy.count({ where: { consumer_id: consumerId } });
    const ecpRecent = await EmployeeCompensationPolicy.count({ where: { consumer_id: consumerId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    const vehicleTotal = await VehiclePolicy.count({ where: { consumer_id: consumerId } });
    const vehicleRecent = await VehiclePolicy.count({ where: { consumer_id: consumerId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    const fireTotal = await FirePolicy.count({ where: { consumer_id: consumerId } });
    const fireRecent = await FirePolicy.count({ where: { consumer_id: consumerId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    const healthTotal = await HealthPolicy.count({ where: { consumer_id: consumerId } });
    const healthRecent = await HealthPolicy.count({ where: { consumer_id: consumerId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    const lifeTotal = await LifePolicy.count({ where: { consumer_id: consumerId } });
    const lifeRecent = await LifePolicy.count({ where: { consumer_id: consumerId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    // DSCs for this consumer
    const dscTotal = await DSC.count({ where: { consumer_id: consumerId } });
    const dscIn = await DSC.count({ where: { consumer_id: consumerId, status: 'in' } });
    const dscOut = await DSC.count({ where: { consumer_id: consumerId, status: 'out' } });
    const dscRecent = await DSC.count({ where: { consumer_id: consumerId, created_at: { [Op.gte]: thirtyDaysAgo } } });
    // Helper for percent
    const percent = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;
    const percentInsurance = (recent, total) => total > 0 ? Math.round((recent / total) * 100) : 0;
    const allTotal = ecpTotal + vehicleTotal + fireTotal + healthTotal + lifeTotal;
    const allRecent = ecpRecent + vehicleRecent + fireRecent + healthRecent + lifeRecent;
    res.json({
      success: true,
      data: {
        insurance_stats: {
          all: { total: allTotal, recent: allRecent, percent: percentInsurance(allRecent, allTotal) },
          ecp: { total: ecpTotal, recent: ecpRecent, percent: percentInsurance(ecpRecent, ecpTotal) },
          vehicle: { total: vehicleTotal, recent: vehicleRecent, percent: percentInsurance(vehicleRecent, vehicleTotal) },
          fire: { total: fireTotal, recent: fireRecent, percent: percentInsurance(fireRecent, fireTotal) },
          health: { total: healthTotal, recent: healthRecent, percent: percentInsurance(healthRecent, healthTotal) },
          life: { total: lifeTotal, recent: lifeRecent, percent: percentInsurance(lifeRecent, lifeTotal) },
        },
        dsc_stats: {
          total: dscTotal,
          in: dscIn,
          out: dscOut,
          recent: dscRecent,
          percent_in: percent(dscIn, dscTotal),
          percent_out: percent(dscOut, dscTotal),
          percent_recent: percent(dscRecent, dscTotal)
        }
      }
    });
  } catch (error) {
    console.error('Backend: Error fetching consumer stats:', error.message);
    return res.status(500).json({ success: false, error: `Failed to fetch consumer stats: ${error.message}` });
  }
};

module.exports = {
  getCompanyStatistics,
  getCompanyStats,
  getConsumerStats
}; 