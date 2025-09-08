const path = require('path');
const fs = require('fs');

// Download documents for different systems
exports.downloadDocument = async (req, res) => {
  try {
    const { system, recordId, documentType, filename } = req.params;
    
    if (!system || !recordId || !documentType || !filename) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Define upload directories for different systems
    const uploadDirs = {
      'employee-compensation': 'uploads/employee_policies',
      'vehicle-policies': 'uploads/vehicle_policies',
      'health-policies': 'uploads/health_policies',
      'fire-policies': 'uploads/fire_policies',
      'life-policies': 'uploads/life_policies',
      'dsc': 'uploads/dsc',
      'plan-management': 'uploads/plan',
      'stability-management': 'uploads/stability',
      'application-management': 'uploads/application',
      'renewal-status': 'uploads/renewal',
      'labour-inspection': 'uploads/labour_inspection',
      'labour-license': 'uploads/labour_license',
      'factory-quotations': 'uploads/pdfs'
    };

    const uploadDir = uploadDirs[system];
    if (!uploadDir) {
      return res.status(400).json({
        success: false,
        message: 'Invalid system type'
      });
    }

    // Construct file path - handle both directory structures
    let filePath = path.join(__dirname, '..', uploadDir, recordId, filename);
    
    // If file doesn't exist in recordId subdirectory, try direct directory
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, '..', uploadDir, filename);
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Get file stats
    const stat = fs.statSync(filePath);
    
    // Set headers for download
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
};

// Get list of available documents for a record
exports.getDocumentList = async (req, res) => {
  try {
    const { system, recordId } = req.params;
    
    if (!system || !recordId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const uploadDirs = {
      'employee-compensation': 'uploads/employee_policies',
      'vehicle-policies': 'uploads/vehicle_policies',
      'health-policies': 'uploads/health_policies',
      'fire-policies': 'uploads/fire_policies',
      'life-policies': 'uploads/life_policies',
      'dsc': 'uploads/dsc',
      'plan-management': 'uploads/plan',
      'stability-management': 'uploads/stability',
      'application-management': 'uploads/application',
      'renewal-status': 'uploads/renewal',
      'labour-inspection': 'uploads/labour_inspection',
      'labour-license': 'uploads/labour_license',
      'factory-quotations': 'uploads/pdfs'
    };

    const uploadDir = uploadDirs[system];
    if (!uploadDir) {
      return res.status(400).json({
        success: false,
        message: 'Invalid system type'
      });
    }

    // Try both directory structures
    let recordPath = path.join(__dirname, '..', uploadDir, recordId);
    let files = [];
    
    if (fs.existsSync(recordPath)) {
      // Documents stored in recordId subdirectory
      files = fs.readdirSync(recordPath);
    } else {
      // Documents stored directly in upload directory
      recordPath = path.join(__dirname, '..', uploadDir);
      if (fs.existsSync(recordPath)) {
        files = fs.readdirSync(recordPath);
        // Filter files that might belong to this record (you can customize this logic)
        // For now, we'll return all files in the directory
      }
    }
    
    if (files.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const documents = files.map(filename => ({
      filename,
      size: fs.statSync(path.join(recordPath, filename)).size,
      uploadDate: fs.statSync(path.join(recordPath, filename)).mtime
    }));

    res.json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error('Error getting document list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document list',
      error: error.message
    });
  }
};
