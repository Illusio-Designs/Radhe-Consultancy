'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('LifePolicies', 'policy_end_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Calculated as policy_start_date + ppt years'
    });

    await queryInterface.addColumn('LifePolicies', 'status', {
      type: Sequelize.ENUM('active', 'expired', 'cancelled'),
      defaultValue: 'active',
      allowNull: false
    });

    // Update existing records to calculate policy_end_date and set status
    const policies = await queryInterface.sequelize.query(
      'SELECT id, policy_start_date, ppt FROM LifePolicies WHERE policy_start_date IS NOT NULL AND ppt IS NOT NULL',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const policy of policies) {
      if (policy.policy_start_date && policy.ppt) {
        const startDate = new Date(policy.policy_start_date);
        const endDate = new Date(startDate);
        endDate.setFullYear(startDate.getFullYear() + parseInt(policy.ppt));
        
        const now = new Date();
        let status = 'active';
        if (endDate < now) {
          status = 'expired';
        }

        await queryInterface.sequelize.query(
          'UPDATE LifePolicies SET policy_end_date = ?, status = ? WHERE id = ?',
          {
            replacements: [endDate, status, policy.id],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('LifePolicies', 'status');
    await queryInterface.removeColumn('LifePolicies', 'policy_end_date');
  }
};
