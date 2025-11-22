const { UserRoleWorkLog, User, Role } = require('../models');
const { Op } = require('sequelize');

const userRoleWorkLogController = {
  // Create a new log entry
  async createLog(req, res) {
    try {
      const { user_id, target_user_id, role_id, action, details } = req.body;
      if (!user_id || !action) {
        return res.status(400).json({ error: 'user_id and action are required.' });
      }
      const log = await UserRoleWorkLog.create({
        user_id,
        target_user_id,
        role_id,
        action,
        details
      });
      res.status(201).json(log);
    } catch (error) {
      console.error('Error creating user role work log:', error);
      res.status(500).json({ error: 'Failed to create log.' });
    }
  },

  // Get all logs (optionally filter by user or role)
  async getAllLogs(req, res) {
    try {
      const { user_id, role_id, page, pageSize, limit, search } = req.query;
      const where = {};
      if (user_id) where.user_id = user_id;
      if (role_id) where.role_id = role_id;
      
      // Pagination support
      const pageNum = parseInt(page) || 1;
      const pageLimit = parseInt(limit) || parseInt(pageSize) || 10;
      const offset = (pageNum - 1) * pageLimit;
      
      // Build search conditions if search query provided
      if (search && search.trim()) {
        where[Op.or] = [
          { action: { [Op.like]: `%${search.trim()}%` } },
          { details: { [Op.like]: `%${search.trim()}%` } }
        ];
      }
      
      // Check if pagination is requested
      const usePagination = page || pageSize || limit;
      
      if (usePagination) {
        // Use findAndCountAll for pagination
        const result = await UserRoleWorkLog.findAndCountAll({
          where,
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['user_id', 'username', 'email'],
              include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'role_name'],
                through: { attributes: ['is_primary'] }
              }]
            },
            { 
              model: User, 
              as: 'targetUser', 
              attributes: ['user_id', 'username', 'email'],
              include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'role_name'],
                through: { attributes: ['is_primary'] }
              }]
            },
            { model: Role, as: 'role', attributes: ['id', 'role_name'] }
          ],
          order: [['created_at', 'DESC']],
          limit: pageLimit,
          offset: offset,
          distinct: true // Important for correct count with includes
        });
        
        const totalPages = Math.ceil(result.count / pageLimit);
        
        // Transform user field to actor for frontend compatibility
        const logs = result.rows.map(log => ({
          ...log.toJSON(),
          actor: log.user || null
        }));
        
        return res.json({
          success: true,
          data: {
            logs: logs,
            totalPages: totalPages,
            totalCount: result.count,
            currentPage: pageNum,
            pageSize: pageLimit
          }
        });
      } else {
        // No pagination - return all logs as before
        const logs = await UserRoleWorkLog.findAll({
          where,
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['user_id', 'username', 'email'],
              include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'role_name'],
                through: { attributes: ['is_primary'] }
              }]
            },
            { 
              model: User, 
              as: 'targetUser', 
              attributes: ['user_id', 'username', 'email'],
              include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'role_name'],
                through: { attributes: ['is_primary'] }
              }]
            },
            { model: Role, as: 'role', attributes: ['id', 'role_name'] }
          ],
          order: [['created_at', 'DESC']]
        });
        
        return res.json(logs);
      }
    } catch (error) {
      console.error('Error fetching user role work logs:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch logs.',
        message: error.message 
      });
    }
  }
};

module.exports = userRoleWorkLogController; 