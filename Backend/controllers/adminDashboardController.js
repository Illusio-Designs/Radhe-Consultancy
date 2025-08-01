const { Company, EmployeeCompensationPolicy, Consumer, User, Role, VehiclePolicy, HealthPolicy, FirePolicy, LifePolicy, DSC, UserRole } = require('../models');
const { Op } = require('sequelize');

// Import the new models
const FactoryQuotation = require('../models/factoryQuotationModel');
const PlanManagement = require('../models/planManagementModel');
const StabilityManagement = require('../models/stabilityManagementModel');

// Import sequelize directly from database config
const sequelize = require('../config/db');

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

    // --- Compliance Management Stats ---
    // Factory Quotation Stats
    console.log('Backend: Starting compliance management stats...');
    
    const factoryQuotationTotal = await FactoryQuotation.count();
    console.log('Backend: Factory quotation total:', factoryQuotationTotal);
    
    const factoryQuotationRecent = await FactoryQuotation.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('Backend: Factory quotation recent:', factoryQuotationRecent);

    // Get factory quotations by status
    const factoryQuotationStatusCounts = await FactoryQuotation.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    console.log('Backend: Factory quotation status counts:', factoryQuotationStatusCounts);

    const factoryQuotationStatusStats = {};
    factoryQuotationStatusCounts.forEach(item => {
      factoryQuotationStatusStats[item.status] = parseInt(item.count);
    });
    console.log('Backend: Factory quotation status stats:', factoryQuotationStatusStats);

    // Plan Management Stats
    const planManagementTotal = await PlanManagement.count();
    console.log('Backend: Plan management total:', planManagementTotal);
    
    const planManagementRecent = await PlanManagement.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('Backend: Plan management recent:', planManagementRecent);

    // Get plan management by status
    const planManagementStatusCounts = await PlanManagement.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    console.log('Backend: Plan management status counts:', planManagementStatusCounts);

    const planManagementStatusStats = {};
    planManagementStatusCounts.forEach(item => {
      planManagementStatusStats[item.status] = parseInt(item.count);
    });
    console.log('Backend: Plan management status stats:', planManagementStatusStats);

    // Stability Management Stats
    const stabilityManagementTotal = await StabilityManagement.count();
    console.log('Backend: Stability management total:', stabilityManagementTotal);
    
    const stabilityManagementRecent = await StabilityManagement.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('Backend: Stability management recent:', stabilityManagementRecent);

    // Get stability management by status
    const stabilityManagementStatusCounts = await StabilityManagement.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    console.log('Backend: Stability management status counts:', stabilityManagementStatusCounts);

    const stabilityManagementStatusStats = {};
    stabilityManagementStatusCounts.forEach(item => {
      stabilityManagementStatusStats[item.status] = parseInt(item.count);
    });
    console.log('Backend: Stability management status stats:', stabilityManagementStatusStats);

    // Get stability management by load type
    const stabilityManagementLoadTypeCounts = await StabilityManagement.findAll({
      attributes: [
        'load_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['load_type'],
      raw: true
    });
    console.log('Backend: Stability management load type counts:', stabilityManagementLoadTypeCounts);

    const stabilityManagementLoadTypeStats = {};
    stabilityManagementLoadTypeCounts.forEach(item => {
      stabilityManagementLoadTypeStats[item.load_type] = parseInt(item.count);
    });
    console.log('Backend: Stability management load type stats:', stabilityManagementLoadTypeStats);

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
      },
      // Add compliance management stats
      factory_quotation_stats: {
        total: factoryQuotationTotal,
        recent: factoryQuotationRecent,
        percent_recent: percent(factoryQuotationRecent, factoryQuotationTotal),
        status_stats: factoryQuotationStatusStats
      },
      plan_management_stats: {
        total: planManagementTotal,
        recent: planManagementRecent,
        percent_recent: percent(planManagementRecent, planManagementTotal),
        status_stats: planManagementStatusStats
      },
      stability_management_stats: {
        total: stabilityManagementTotal,
        recent: stabilityManagementRecent,
        percent_recent: percent(stabilityManagementRecent, stabilityManagementTotal),
        status_stats: stabilityManagementStatusStats,
        load_type_stats: stabilityManagementLoadTypeStats
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

// Plan Manager Statistics
const getPlanManagerStats = async (req, res) => {
  try {
    const userId = req.user.user_id;
    console.log('Backend: Plan Manager Stats - User ID:', userId);
    console.log('Backend: Plan Manager Stats - User object:', req.user);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total plans assigned to this manager
    const totalPlans = await PlanManagement.count({
      where: { plan_manager_id: userId }
    });
    console.log('Backend: Plan Manager Stats - Total plans:', totalPlans);

    // Get recent plans (last 30 days)
    const recentPlans = await PlanManagement.count({
      where: {
        plan_manager_id: userId,
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('Backend: Plan Manager Stats - Recent plans:', recentPlans);

    // Get plans by status for this manager
    const statusCounts = await PlanManagement.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { plan_manager_id: userId },
      group: ['status'],
      raw: true
    });

    // Convert to object format
    const statusStats = {};
    statusCounts.forEach(item => {
      statusStats[item.status] = parseInt(item.count);
    });
    console.log('Backend: Plan Manager Stats - Status stats:', statusStats);

    const percentRecent = totalPlans > 0 ? Math.round((recentPlans / totalPlans) * 100) : 0;

    res.json({
      success: true,
      data: {
        total: totalPlans,
        recent: recentPlans,
        percent_recent: percentRecent,
        status_stats: statusStats
      }
    });
  } catch (error) {
    console.error('Backend: Error fetching plan manager stats:', error.message);
    return res.status(500).json({ success: false, error: `Failed to fetch plan manager stats: ${error.message}` });
  }
};

// Stability Manager Statistics
const getStabilityManagerStats = async (req, res) => {
  try {
    const userId = req.user.user_id;
    console.log('Backend: Stability Manager Stats - User ID:', userId);
    console.log('Backend: Stability Manager Stats - User object:', req.user);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total stability records assigned to this manager
    const totalStability = await StabilityManagement.count({
      where: { stability_manager_id: userId }
    });
    console.log('Backend: Stability Manager Stats - Total stability:', totalStability);

    // Get recent stability records (last 30 days)
    const recentStability = await StabilityManagement.count({
      where: {
        stability_manager_id: userId,
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('Backend: Stability Manager Stats - Recent stability:', recentStability);

    // Get stability records by status for this manager
    const statusCounts = await StabilityManagement.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { stability_manager_id: userId },
      group: ['status'],
      raw: true
    });

    // Convert to object format
    const statusStats = {};
    statusCounts.forEach(item => {
      statusStats[item.status] = parseInt(item.count);
    });
    console.log('Backend: Stability Manager Stats - Status stats:', statusStats);

    // Get stability records by load type for this manager
    const loadTypeCounts = await StabilityManagement.findAll({
      attributes: [
        'load_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { stability_manager_id: userId },
      group: ['load_type'],
      raw: true
    });

    // Convert to object format
    const loadTypeStats = {};
    loadTypeCounts.forEach(item => {
      loadTypeStats[item.load_type] = parseInt(item.count);
    });
    console.log('Backend: Stability Manager Stats - Load type stats:', loadTypeStats);

    const percentRecent = totalStability > 0 ? Math.round((recentStability / totalStability) * 100) : 0;

    res.json({
      success: true,
      data: {
        total: totalStability,
        recent: recentStability,
        percent_recent: percentRecent,
        status_stats: statusStats,
        load_type_stats: loadTypeStats
      }
    });
  } catch (error) {
    console.error('Backend: Error fetching stability manager stats:', error.message);
    return res.status(500).json({ success: false, error: `Failed to fetch stability manager stats: ${error.message}` });
  }
};

module.exports = {
  getCompanyStatistics,
  getCompanyStats,
  getConsumerStats,
  getPlanManagerStats,
  getStabilityManagerStats
}; 