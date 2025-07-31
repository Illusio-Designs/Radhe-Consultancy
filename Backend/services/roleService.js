const { Role, Permission, RolePermission, User, UserRole } = require('../models');

class RoleService {
  async assignRoleToUser(userId, roleId, isPrimary = false, assignedBy = null) {
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);
    
    if (!user || !role) {
      throw new Error('User or role not found');
    }

    // Check if role is already assigned
    const existingAssignment = await UserRole.findOne({
      where: { user_id: userId, role_id: roleId }
    });

    if (existingAssignment) {
      throw new Error('Role already assigned to user');
    }

    // If this is primary, unset other primary roles
    if (isPrimary) {
      await UserRole.update(
        { is_primary: false },
        { where: { user_id: userId, is_primary: true } }
      );
    }

    // Assign the role
    await user.addRole(role, {
      through: {
        is_primary: isPrimary,
        assigned_by: assignedBy
      }
    });

    return { user, role };
  }

  async removeRoleFromUser(userId, roleId) {
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);
    
    if (!user || !role) {
      throw new Error('User or role not found');
    }

    await user.removeRole(role);
    return { user, role };
  }

  async getUserRoles(userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: ['is_primary', 'assigned_at', 'assigned_by'] }
      }]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.Roles;
  }

  async setPrimaryRole(userId, roleId) {
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);
    
    if (!user || !role) {
      throw new Error('User or role not found');
    }

    // Check if user has this role
    const userRole = await UserRole.findOne({
      where: { user_id: userId, role_id: roleId }
    });

    if (!userRole) {
      throw new Error('User does not have this role');
    }

    // Unset all primary roles
    await UserRole.update(
      { is_primary: false },
      { where: { user_id: userId } }
    );

    // Set this role as primary
    await UserRole.update(
      { is_primary: true },
      { where: { user_id: userId, role_id: roleId } }
    );

    return { user, role };
  }
}

module.exports = new RoleService();
