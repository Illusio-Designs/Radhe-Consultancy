const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  getAllInsuranceCompanies,
  getInsuranceCompany,
  createInsuranceCompany,
  updateInsuranceCompany,
  deleteInsuranceCompany,
  searchInsuranceCompanies
} = require('../controllers/insuranceCompanyController');
const { auth } = require('../middleware/auth');

// Validation middleware
const validateInsuranceCompany = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s&-]+$/)
    .withMessage('Name can only contain letters, numbers, spaces, &, and -')
];

// Routes with role-based access control
router.get('/', auth, getAllInsuranceCompanies);
router.get('/search', auth, searchInsuranceCompanies);
router.get('/:id', auth, getInsuranceCompany);
router.post('/', auth, validateInsuranceCompany, createInsuranceCompany);
router.put('/:id', auth, validateInsuranceCompany, updateInsuranceCompany);
router.delete('/:id', auth, deleteInsuranceCompany);

module.exports = router; 