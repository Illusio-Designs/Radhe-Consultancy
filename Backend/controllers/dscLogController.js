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
        console.error('[DSCLogController] Error:', error.message);
        if (error.name === 'SequelizeUniqueConstraintError') {
            const fields = error.errors ? error.errors.map(e => e.path).join(', ') : 'unknown';
            return res.status(400).json({ message: `Duplicate entry: ${fields} must be unique.` });
        } else if (error.name === 'SequelizeValidationError') {
            const details = error.errors ? error.errors.map(e => e.message).join('; ') : error.message;
            return res.status(400).json({ message: `Validation error: ${details}` });
        } else {
            return res.status(500).json({ message: `DSC log operation failed: ${error.message}` });
        }
    }
}; 