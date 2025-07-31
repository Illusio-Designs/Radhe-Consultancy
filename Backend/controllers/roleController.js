const { Op } = require('sequelize');
const { Role, User, UserType } = require('../models');

class RoleController {
  // Create new role
  async createRole(req, res) {
    try {
      const { role_name, description } = req.body;
      
      // Check if role already exists
      const existingRole = await Role.findOne({ where: { role_name } });
      if (existingRole) {
        return res.status(400).json({ 
          error: 'Role already exists',
          existingRole: {
            role_id: existingRole.role_id,
            role_name: existingRole.role_name,
            description: existingRole.description
          }
        });
      }

      // Create new role
      const role = await Role.create({
        role_name,
        description
      });

      res.status(201).json(role);
    } catch (error) {
      console.error('[RoleController] Error:', error.message);
      if (error.name === 'SequelizeUniqueConstraintError') {
        const fields = error.errors ? error.errors.map(e => e.path).join(', ') : 'unknown';
        return res.status(400).json({ error: `Duplicate entry: ${fields} must be unique.` });
      } else if (error.name === 'SequelizeValidationError') {
        const details = error.errors ? error.errors.map(e => e.message).join('; ') : error.message;
        return res.status(400).json({ error: `Validation error: ${details}` });
      } else {
        return res.status(500).json({ error: `Role operation failed: ${error.message}` });
      }
    }
  }

  // Get all roles
  async getAllRoles(req, res) {
    try {
      const roles = await Role.findAll();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get role by ID
  async getRoleById(req, res) {
    try {
      const role = await Role.findByPk(req.params.id);

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update role
  async updateRole(req, res) {
    try {
      const { role_id } = req.params;
      const { role_name, description } = req.body;

      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Check if new role_name already exists for a different role
      if (role_name && role_name !== role.role_name) {
        const existingRole = await Role.findOne({ 
          where: { 
            role_name,
            role_id: { [Op.ne]: role_id }
          } 
        });
        if (existingRole) {
          return res.status(400).json({ error: 'Role name already exists' });
        }
      }

      // Update role details
      await role.update({
        role_name,
        description
      });

      res.json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete role
  async deleteRole(req, res) {
    try {
      const { role_id } = req.params;

      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Check if role is being used by any users
      const usersWithRole = await role.countUsers();
      if (usersWithRole > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete role. It is assigned to users.',
          usersCount: usersWithRole
        });
      }

      await role.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async assignRole(req, res) {
    try {
      const { user_id, role_id, is_primary = false } = req.body;
      
      // Verify user exists
      const user = await User.findOne({
        where: { user_id },
        include: [UserType]
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Verify role exists
      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
  
      // Use role service to assign role
      const roleService = require('../services/roleService');
      const result = await roleService.assignRoleToUser(user_id, role_id, is_primary, req.user.user_id);
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeRole(req, res) {
    try {
      const { user_id, role_id } = req.params;
      
      // Use role service to remove role
      const roleService = require('../services/roleService');
      const result = await roleService.removeRoleFromUser(user_id, role_id);
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserRoles(req, res) {
    try {
      const { user_id } = req.params;
      
      // Use role service to get user roles
      const roleService = require('../services/roleService');
      const roles = await roleService.getUserRoles(user_id);
      
      res.json(roles);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async setPrimaryRole(req, res) {
    try {
      const { user_id, role_id } = req.body;
      
      // Use role service to set primary role
      const roleService = require('../services/roleService');
      const result = await roleService.setPrimaryRole(user_id, role_id);
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new RoleController();
