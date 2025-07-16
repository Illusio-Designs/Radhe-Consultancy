const { DSCLog, User } = require('../models');

// Get DSC logs
exports.getDSCLogs = async (req, res) => {
    try {
        const { dsc_id } = req.query;
        const where = dsc_id ? { dsc_id } : {};
        const logs = await DSCLog.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'user', attributes: ['user_id', 'username', 'email'] }]
        });
        res.json({ success: true, logs });
    } catch (error) {
        console.error('Error fetching DSC logs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}; 