const { EmployeeCompensationPolicy, VehiclePolicy, HealthPolicy, FirePolicy, LifePolicy, DSC, Company, Consumer, ReminderLog, FactoryQuotation } = require('../models');
const { Op } = require('sequelize');

// Ensure FactoryQuotation is associated to a Company when possible (one-time best-effort association)
const associateCompanyForFactoryQuotations = async (quotations) => {
  if (!Array.isArray(quotations) || quotations.length === 0) return quotations;

  for (const quotation of quotations) {
    try {
      // Skip if already associated
      if (quotation.company_id || quotation.company) continue;

      // Try to find a matching company by email first, then by company name
      let matchedCompany = null;
      if (quotation.email) {
        matchedCompany = await Company.findOne({ where: { company_email: quotation.email } });
      }
      if (!matchedCompany && quotation.companyName) {
        matchedCompany = await Company.findOne({ where: { company_name: quotation.companyName } });
      }

      // If found, persist the association and reflect it on the instance for the response
      if (matchedCompany) {
        await quotation.update({ company_id: matchedCompany.id });
        quotation.setDataValue('company', matchedCompany);
      }
    } catch (err) {
      // Non-fatal: log and continue; we don't want to block renewal listing
      console.warn('[RenewalController] Failed to auto-associate FactoryQuotation to Company:', err.message);
    }
  }

  return quotations;
};

// Helper to get date range
const getDateRange = (days) => {
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + days);
  return { now, future };
};

// Fetch renewals for a given model and date field
const fetchRenewals = async (Model, dateField, days, include) => {
  const { now, future } = getDateRange(days);
  return await Model.findAll({
    where: {
      [dateField]: {
        [Op.gte]: now,
        [Op.lte]: future
      }
    },
    include
  });
};

const getRenewals = async (req, res) => {
  try {
    const { period } = req.params;
    
    // Validate period
    if (!['week', 'month', 'year'].includes(period)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid period. Must be one of: week, month, year'
      });
    }

    let days = 7;
    if (period === 'month') days = 30;
    if (period === 'year') days = 730;

    // Fetch all renewals (excluding LifePolicy)
    const [ecp, fire, health, vehicle, dsc, factoryActRaw] = await Promise.all([
      EmployeeCompensationPolicy.findAll({
        where: { policy_end_date: { [Op.between]: [now, future] } },
        include: [{ model: Company, as: 'policyHolder' }]
      }),
      FirePolicy.findAll({
        where: { policy_end_date: { [Op.between]: [now, future] } },
        include: [
          { model: Company, as: 'companyPolicyHolder' },
          { model: Consumer, as: 'consumerPolicyHolder' }
        ]
      }),
      HealthPolicy.findAll({
        where: { policy_end_date: { [Op.between]: [now, future] } },
        include: [
          { model: Company, as: 'companyPolicyHolder' },
          { model: Consumer, as: 'consumerPolicyHolder' }
        ]
      }),
      VehiclePolicy.findAll({
        where: { policy_end_date: { [Op.between]: [now, future] } },
        include: [
          { model: Company, as: 'companyPolicyHolder' },
          { model: Consumer, as: 'consumerPolicyHolder' }
        ]
      }),
      DSC.findAll({
        where: { expiry_date: { [Op.between]: [now, future] } },
        include: [
          { model: Company, as: 'company' },
          { model: Consumer, as: 'consumer' }
        ]
      }),
      FactoryQuotation.findAll({
        where: { 
          status: 'renewal',
          renewal_date: { [Op.between]: [now, future] }
        },
        include: [
          { model: Company, as: 'company' }
        ]
      })
    ]);

    // Best-effort association of missing companies for factory quotations
    const factoryAct = await associateCompanyForFactoryQuotations(factoryActRaw);

    res.status(200).json({
      success: true,
      data: {
        ecp,
        fire,
        health,
        vehicle,
        dsc,
        factory_act: factoryAct
      }
    });
  } catch (error) {
    console.error('[RenewalController] Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: `Failed to fetch renewals: ${error.message}`,
      details: error.message 
    });
  }
};

// Get renewal counts for each policy type
const getRenewalCounts = async (req, res) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of current day

    // Calculate start and end of each period using `setHours` to ensure day boundaries
    const weekStart = new Date(now);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 6); // End of 7th day (0-indexed: today + 6 days)
    weekEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(now);
    monthStart.setDate(monthStart.getDate() + 7); // Start of 8th day
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(now);
    monthEnd.setDate(monthEnd.getDate() + 29); // End of 30th day (0-indexed: today + 29 days)
    monthEnd.setHours(23, 59, 59, 999);

    const yearStart = new Date(now);
    yearStart.setDate(yearStart.getDate() + 30); // Start of 31st day
    yearStart.setHours(0, 0, 0, 0);
    const yearEnd = new Date(now);
    yearEnd.setDate(yearEnd.getDate() + 364); // End of 365th day (0-indexed: today + 364 days)
    yearEnd.setHours(23, 59, 59, 999);

    // Helper function to get counts for a specific date range
    const getCountsForRange = async (startDate, endDate) => {
      const [ecp, fire, health, vehicle, dsc, factoryAct] = await Promise.all([
        EmployeeCompensationPolicy.count({ 
          where: { policy_end_date: { [Op.between]: [startDate, endDate] } } 
        }),
        FirePolicy.count({ 
          where: { policy_end_date: { [Op.between]: [startDate, endDate] } } 
        }),
        HealthPolicy.count({ 
          where: { policy_end_date: { [Op.between]: [startDate, endDate] } } 
        }),
        VehiclePolicy.count({ 
          where: { policy_end_date: { [Op.between]: [startDate, endDate] } } 
        }),
        DSC.count({ 
          where: { expiry_date: { [Op.between]: [startDate, endDate] } } 
        }),
        FactoryQuotation.count({ 
          where: { 
            status: 'renewal',
            renewal_date: { [Op.between]: [startDate, endDate] }
          } 
        })
      ]);
      return { ecp, fire, health, vehicle, dsc, factory_act: factoryAct };
    };

    // Calculate counts for each exclusive period
    const weekCounts = await getCountsForRange(weekStart, weekEnd);
    const monthCounts = await getCountsForRange(monthStart, monthEnd);
    const yearCounts = await getCountsForRange(yearStart, yearEnd);

    res.status(200).json({ 
      success: true, 
      data: {
        week: weekCounts,
        month: monthCounts,
        year: yearCounts
      }
    });
  } catch (error) {
    console.error('[RenewalController] Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: `Failed to fetch renewal counts: ${error.message}`,
      details: error.message
    });
  }
};

// Get renewal list for a given policy type
const getRenewalList = async (req, res) => {
  try {
    const { type } = req.params;
    const now = new Date();
    const year = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);

    let Model, dateField, include;
    switch (type.toLowerCase()) {
      case 'ecp':
        Model = EmployeeCompensationPolicy;
        dateField = 'end_date';
        include = [{ model: Company, as: 'policyHolder' }];
        break;
      case 'fire':
        Model = FirePolicy;
        dateField = 'end_date';
        include = [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }];
        break;
      case 'health':
        Model = HealthPolicy;
        dateField = 'end_date';
        include = [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }];
        break;
      case 'vehicle':
        Model = VehiclePolicy;
        dateField = 'end_date';
        include = [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }];
        break;
      case 'life':
        Model = LifePolicy;
        dateField = 'end_date';
        include = [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }];
        break;
      case 'dsc':
        Model = DSC;
        dateField = 'expiry_date';
        include = [{ model: Company, as: 'company' }, { model: Consumer, as: 'consumer' }];
        break;
      case 'factory_act':
        Model = FactoryQuotation;
        dateField = 'renewal_date';
        include = [{ model: Company, as: 'company' }];
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid policy type'
        });
    }

    let policies = await Model.findAll({
      where: {
        [dateField]: {
          [Op.between]: [now, year]
        }
      },
      include,
      order: [[dateField, 'ASC']]
    });

    // If factory_act, attempt auto-association
    if (Model === FactoryQuotation) {
      policies = await associateCompanyForFactoryQuotations(policies);
    }

    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error('[RenewalController] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch renewal list: ${error.message}`,
      details: error.message
    });
  }
};

// Get renewal reminder log
const getRenewalLog = async (req, res) => {
  try {
    const logs = await ReminderLog.findAll({
      order: [['sent_at', 'DESC']],
      limit: 100 // Limit to last 100 reminders
    });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('[RenewalController] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch renewal log: ${error.message}`,
      details: error.message
    });
  }
};

// Send renewal reminder
const sendRenewalReminder = async (req, res) => {
  try {
    const { policy_id, policy_type } = req.body;

    // Validate input
    if (!policy_id || !policy_type) {
      return res.status(400).json({
        success: false,
        error: 'Policy ID and type are required'
      });
    }

    // Find the policy
    let Model, dateField, include;
    switch (policy_type.toLowerCase()) {
      case 'ecp':
        Model = EmployeeCompensationPolicy;
        dateField = 'end_date';
        include = [{ model: Company, as: 'policyHolder' }];
        break;
      case 'fire':
        Model = FirePolicy;
        dateField = 'end_date';
        include = [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }];
        break;
      case 'health':
        Model = HealthPolicy;
        dateField = 'end_date';
        include = [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }];
        break;
      case 'vehicle':
        Model = VehiclePolicy;
        dateField = 'end_date';
        include = [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }];
        break;
      case 'life':
        Model = LifePolicy;
        dateField = 'end_date';
        include = [{ model: Company, as: 'companyPolicyHolder' }, { model: Consumer, as: 'consumerPolicyHolder' }];
        break;
      case 'dsc':
        Model = DSC;
        dateField = 'expiry_date';
        include = [{ model: Company, as: 'company' }, { model: Consumer, as: 'consumer' }];
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid policy type'
        });
    }

    const policy = await Model.findOne({
      where: { id: policy_id },
      include
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }

    // Get email address
    let email = null;
    if (policy.policyHolder?.email) email = policy.policyHolder.email;
    if (policy.companyPolicyHolder?.email) email = policy.companyPolicyHolder.email;
    if (policy.consumerPolicyHolder?.email) email = policy.consumerPolicyHolder.email;
    if (policy.company?.email) email = policy.company.email;
    if (policy.consumer?.email) email = policy.consumer.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'No email address found for policy holder'
      });
    }

    // TODO: Send email using your email service
    // For now, just log the reminder
    await ReminderLog.create({
      policy_id,
      policy_type,
      email,
      sent_at: new Date(),
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Reminder sent successfully'
    });
  } catch (error) {
    console.error('[RenewalController] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: `Failed to send reminder: ${error.message}`,
      details: error.message
    });
  }
};

// Get renewal list by type and period
const getRenewalListByTypeAndPeriod = async (req, res) => {
  try {
    const { type, period } = req.params;

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of current day

    const weekStart = new Date(now);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(now);
    monthStart.setDate(monthStart.getDate() + 7);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(now);
    monthEnd.setDate(monthEnd.getDate() + 29);
    monthEnd.setHours(23, 59, 59, 999);

    const yearStart = new Date(now);
    yearStart.setDate(yearStart.getDate() + 30);
    yearStart.setHours(0, 0, 0, 0);
    const yearEnd = new Date(now);
    yearEnd.setDate(yearEnd.getDate() + 364);
    yearEnd.setHours(23, 59, 59, 999);

    let startDate, endDate;
    switch (period) {
      case 'week':
        startDate = weekStart;
        endDate = weekEnd;
        break;
      case 'month':
        startDate = monthStart;
        endDate = monthEnd;
        break;
      case 'year':
        startDate = yearStart;
        endDate = yearEnd;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid period. Must be one of: week, month, year'
        });
    }

    // Helper to fetch for a single type
    const fetchType = async (typeKey, start, end) => {
      let Model, dateField, include;
      switch (typeKey) {
        case 'ecp':
          Model = EmployeeCompensationPolicy;
          dateField = 'policy_end_date';
          include = [{ model: Company, as: 'policyHolder' }];
          break;
        case 'fire':
          Model = FirePolicy;
          dateField = 'policy_end_date';
          include = [
            { model: Company, as: 'companyPolicyHolder' },
            { model: Consumer, as: 'consumerPolicyHolder' }
          ];
          break;
        case 'health':
          Model = HealthPolicy;
          dateField = 'policy_end_date';
          include = [
            { model: Company, as: 'companyPolicyHolder' },
            { model: Consumer, as: 'consumerPolicyHolder' }
          ];
          break;
        case 'vehicles':
        case 'vehicle':
          Model = VehiclePolicy;
          dateField = 'policy_end_date';
          include = [
            { model: Company, as: 'companyPolicyHolder' },
            { model: Consumer, as: 'consumerPolicyHolder' }
          ];
          break;
        case 'dsc':
          Model = DSC;
          dateField = 'expiry_date';
          include = [
            { model: Company, as: 'company' },
            { model: Consumer, as: 'consumer' }
          ];
          break;
        case 'factory_act':
          Model = FactoryQuotation;
          dateField = 'renewal_date';
          include = [{ model: Company, as: 'company' }];
          break;
        default:
          return [];
      }
      let items = await Model.findAll({
        where: {
          [dateField]: {
            [Op.between]: [start, end]
          }
        },
        include,
        order: [[dateField, 'ASC']]
      });
      if (Model === FactoryQuotation) {
        items = await associateCompanyForFactoryQuotations(items);
      }
      return items;
    };

    const data = {};
    if (type === 'all') {
      for (const t of ['ecp', 'health', 'fire', 'vehicles', 'dsc', 'factory_act']) {
        data[t] = await fetchType(t, startDate, endDate);
      }
    } else {
      data[type] = await fetchType(type.toLowerCase(), startDate, endDate);
    }

    const result = [];
    if (type === 'all') {
      for (const t of ['ecp', 'health', 'fire', 'vehicles', 'dsc', 'factory_act']) {
        (data[t] || []).forEach(item => {
          let holderName = null, email = null;
          if (item.policyHolder) {
            holderName = item.policyHolder.company_name || null;
            email = item.policyHolder.company_email || null;
          } else if (item.companyPolicyHolder) {
            holderName = item.companyPolicyHolder.company_name || null;
            email = item.companyPolicyHolder.company_email || null;
          } else if (item.consumerPolicyHolder) {
            holderName = item.consumerPolicyHolder.name || null;
            email = item.consumerPolicyHolder.email || null;
          } else if (item.company) {
            holderName = item.company.company_name || null;
            email = item.company.company_email || null;
          } else if (item.consumer) {
            holderName = item.consumer.name || null;
            email = item.consumer.email || null;
          } else if (item.companyName) {
            // Fallback for FactoryQuotation which has companyName and email directly
            holderName = item.companyName || null;
            email = item.email || null;
          }

          result.push({
            type: t,
            holderName,
            email,
            policy_end_date: item.policy_end_date,
            expiry_date: item.expiry_date,
            renewal_date: item.renewal_date,
            id: item.id
          });
        });
      }
    } else {
      (data[type] || []).forEach(item => {
        let holderName = null, email = null;
        if (item.policyHolder) {
          holderName = item.policyHolder.company_name || null;
          email = item.policyHolder.company_email || null;
        } else if (item.companyPolicyHolder) {
          holderName = item.companyPolicyHolder.company_name || null;
          email = item.companyPolicyHolder.company_email || null;
        } else if (item.consumerPolicyHolder) {
          holderName = item.consumerPolicyHolder.name || null;
          email = item.consumerPolicyHolder.email || null;
        } else if (item.company) {
          holderName = item.company.company_name || null;
          email = item.company.company_email || null;
        } else if (item.consumer) {
          holderName = item.consumer.name || null;
          email = item.consumer.email || null;
        } else if (item.companyName) {
          // Fallback for FactoryQuotation which has companyName and email directly
          holderName = item.companyName || null;
          email = item.email || null;
        }

        result.push({
          type,
          holderName,
          email,
          policy_end_date: item.policy_end_date,
          expiry_date: item.expiry_date,
          renewal_date: item.renewal_date,
          id: item.id
        });
      });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('[RenewalController] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch renewal list by type and period: ${error.message}`,
      details: error.message,
      data: []
    });
  }
};

module.exports = {
  getRenewals,
  getRenewalCounts,
  getRenewalList,
  getRenewalLog,
  sendRenewalReminder,
  getRenewalListByTypeAndPeriod
}; 