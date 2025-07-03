const express = require('express');
const router = express.Router();
const dscController = require('../controllers/dscController');
const { auth, checkRole } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Apply role check middleware to all routes
router.use(checkRole(['Admin', 'DSC_manager']));

// Get active companies and consumers for dropdown
router.get('/companies', dscController.getActiveCompanies);
router.get('/consumers', dscController.getActiveConsumers);

// DSC routes
router.get('/', dscController.getAllDSCs);
router.get('/:id', dscController.getDSCById);
router.post('/', dscController.createDSC);
router.put('/:id', dscController.updateDSC);
router.patch('/:id/status', dscController.changeDSCStatus);
router.delete('/:id', dscController.deleteDSC);

// Get DSCs by company or consumer
router.get('/company/:companyId', dscController.getDSCsByCompany);
router.get('/consumer/:consumerId', dscController.getDSCsByConsumer);

// Search DSCs
router.get('/search', dscController.searchDSCs);

module.exports = router; 