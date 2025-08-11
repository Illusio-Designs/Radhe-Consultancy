const { UserRoleWorkLog, User, Role } = require('../models');

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
      const { user_id, role_id } = req.query;
      const where = {};
      if (user_id) where.user_id = user_id;
      if (role_id) where.role_id = role_id;
      const logs = await UserRoleWorkLog.findAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['user_id', 'username', 'email'] },
          { model: User, as: 'targetUser', attributes: ['user_id', 'username', 'email'] },
          { model: Role, as: 'role', attributes: ['id', 'role_name'] }
        ],
        order: [['created_at', 'DESC']]
      });
      res.json(logs);
    } catch (error) {
      console.error('Error fetching user role work logs:', error);
      res.status(500).json({ error: 'Failed to fetch logs.' });
    }
  }
};

module.exports = userRoleWorkLogController; 