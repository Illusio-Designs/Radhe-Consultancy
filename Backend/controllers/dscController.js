const { DSC, Company, Consumer, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all DSCs
exports.getAllDSCs = async (req, res) => {
    try {
        // Debug log: who is requesting
        if (req.user) {
            console.log('[getAllDSC] Requested by user:', req.user.user_id, 'roles:', req.user.roles || req.user.role_name);
        } else {
            console.log('[getAllDSC] Requested by unknown user');
        }

        const dscs = await DSC.findAll({
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
                },
                {
                    model: Consumer,
                    as: 'consumer',
                    attributes: ['consumer_id', 'name', 'email', 'phone_number']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        // Debug log: how many DSC records found
        console.log('[getAllDSC] Found DSC records:', dscs.length);
        res.json({ success: true, dscs });
    } catch (error) {
        console.error('Error in getAllDSCs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get active companies for DSC
exports.getActiveCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll({
            where: { status: 'Active' },
            attributes: [
                'company_id',
                'company_name',
                'company_email',
                'contact_number',
                'gst_number',
                'pan_number'
            ]
        });
        res.json(companies);
    } catch (error) {
        console.error('Error fetching active companies:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get active consumers for DSC
exports.getActiveConsumers = async (req, res) => {
    try {
        const consumers = await Consumer.findAll({
            where: { status: 'Active' },
            attributes: [
                'consumer_id',
                'name',
                'email',
                'phone_number',
                'contact_address'
            ]
        });
        res.json(consumers);
    } catch (error) {
        console.error('Error fetching active consumers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get DSC by ID
exports.getDSCById = async (req, res) => {
    try {
        const dsc = await DSC.findByPk(req.params.id, {
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
                },
                {
                    model: Consumer,
                    as: 'consumer',
                    attributes: ['consumer_id', 'consumer_name', 'email', 'phone_number']
                }
            ]
        });
        if (!dsc) {
            return res.status(404).json({ success: false, message: 'DSC not found' });
        }
        res.json({ success: true, dsc });
    } catch (error) {
        console.error('Error in getDSCById:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new DSC
exports.createDSC = async (req, res) => {
    try {
        const { company_id, consumer_id, certification_name, expiry_date, status, remarks } = req.body;
        
        // Validate required fields
        if (!certification_name || !expiry_date) {
            return res.status(400).json({ 
                success: false, 
                message: 'Certification name and expiry date are required' 
            });
        }

        // Validate that either company_id or consumer_id is provided
        if (!company_id && !consumer_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Either company_id or consumer_id must be provided' 
            });
        }

        const dsc = await DSC.create({
            company_id,
            consumer_id,
            certification_name,
            expiry_date,
            status: status || 'in',
            remarks
        });

        res.status(201).json({ success: true, dsc });
    } catch (error) {
        console.error('Error in createDSC:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update DSC
exports.updateDSC = async (req, res) => {
    try {
        const { certification_name, expiry_date, status, remarks } = req.body;
        const dsc = await DSC.findByPk(req.params.id);
        
        if (!dsc) {
            return res.status(404).json({ success: false, message: 'DSC not found' });
        }

        await dsc.update({
            certification_name,
            expiry_date,
            status,
            remarks
        });

        res.json({ success: true, dsc });
    } catch (error) {
        console.error('Error in updateDSC:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Change DSC status
exports.changeDSCStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const dsc = await DSC.findByPk(req.params.id);
        
        if (!dsc) {
            return res.status(404).json({ success: false, message: 'DSC not found' });
        }

        if (!['in', 'out'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Status must be either "in" or "out"' 
            });
        }

        await dsc.update({ status });
        res.json({ success: true, dsc });
    } catch (error) {
        console.error('Error in changeDSCStatus:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete DSC
exports.deleteDSC = async (req, res) => {
    try {
        const dsc = await DSC.findByPk(req.params.id);
        if (!dsc) {
            return res.status(404).json({ success: false, message: 'DSC not found' });
        }
        await dsc.destroy();
        res.json({ success: true, message: 'DSC deleted successfully' });
    } catch (error) {
        console.error('Error in deleteDSC:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get DSCs by company
exports.getDSCsByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        
        if (!companyId || companyId === 'undefined') {
            return res.status(400).json({ 
                success: false, 
                message: 'Valid company ID is required' 
            });
        }

        const dscs = await DSC.findAll({
            where: { company_id: companyId },
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
                },
                {
                    model: Consumer,
                    as: 'consumer',
                    attributes: ['consumer_id', 'consumer_name', 'email', 'phone_number']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, dscs });
    } catch (error) {
        console.error('Error in getDSCsByCompany:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get DSCs by consumer
exports.getDSCsByConsumer = async (req, res) => {
    try {
        const { consumerId } = req.params;
        
        if (!consumerId || consumerId === 'undefined') {
            return res.status(400).json({ 
                success: false, 
                message: 'Valid consumer ID is required' 
            });
        }

        const dscs = await DSC.findAll({
            where: { consumer_id: consumerId },
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
                },
                {
                    model: Consumer,
                    as: 'consumer',
                    attributes: ['consumer_id', 'consumer_name', 'email', 'phone_number']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, dscs });
    } catch (error) {
        console.error('Error in getDSCsByConsumer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Search DSCs
exports.searchDSCs = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Missing search query' });
        }

        console.log(`[DSCController] Searching DSCs with query: "${q}"`);

        // Search in main DSC fields
        const dscs = await DSC.findAll({
            where: {
                [Op.or]: [
                    sequelize.where(sequelize.fn('LOWER', sequelize.col('DSC.certification_name')), 'LIKE', `%${q.toLowerCase()}%`)
                ]
            },
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
                },
                {
                    model: Consumer,
                    as: 'consumer',
                    attributes: ['consumer_id', 'name', 'email', 'phone_number']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Search for DSCs where company name matches
        const dscsByCompany = await DSC.findAll({
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'company_name', 'company_email', 'contact_number'],
                    required: true,
                    where: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.company_name')), 'LIKE', `%${q.toLowerCase()}%`)
                },
                {
                    model: Consumer,
                    as: 'consumer',
                    attributes: ['consumer_id', 'name', 'email', 'phone_number']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Search for DSCs where consumer name matches
        const dscsByConsumer = await DSC.findAll({
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
                },
                {
                    model: Consumer,
                    as: 'consumer',
                    attributes: ['consumer_id', 'name', 'email', 'phone_number'],
                    required: true,
                    where: sequelize.where(sequelize.fn('LOWER', sequelize.col('consumer.name')), 'LIKE', `%${q.toLowerCase()}%`)
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Combine all results and remove duplicates
        const allDSCs = [...dscs, ...dscsByCompany, ...dscsByConsumer];
        const uniqueDSCs = allDSCs.filter((dsc, index, self) => 
            index === self.findIndex(d => d.dsc_id === dsc.dsc_id)
        );

        console.log(`[DSCController] Found ${uniqueDSCs.length} DSCs for query: "${q}"`);

        res.json({ success: true, dscs: uniqueDSCs });
    } catch (error) {
        console.error('Error in searchDSCs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};