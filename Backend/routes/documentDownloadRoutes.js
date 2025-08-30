const express = require('express');
const router = express.Router();
const documentDownloadController = require('../controllers/documentDownloadController');
const { auth } = require('../middleware/auth');

// Download document
router.get('/:system/:recordId/:documentType/:filename', auth, documentDownloadController.downloadDocument);

// Get document list for a record
router.get('/:system/:recordId', auth, documentDownloadController.getDocumentList);

module.exports = router;
