# ECP & Vehicle Policy Renewal System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Architecture](#database-architecture)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Renewal Process Workflow](#renewal-process-workflow)
6. [API Endpoints](#api-endpoints)
7. [File Upload & Management](#file-upload--management)
8. [Validation & Error Handling](#validation--error-handling)
9. [Audit & Logging](#audit--logging)
10. [Deployment Scripts](#deployment-scripts)

## System Overview

The system manages two main insurance policy types with complete CRUD operations and renewal workflows:

### ECP (Employee Compensation Policy)
- **Purpose**: Organizations covering employee compensation insurance
- **Customer Type**: Organization only
- **Key Features**: Medical cover options, GST calculations, company-based policies

### Vehicle Policy
- **Purpose**: Vehicle insurance for organizations and individuals
- **Customer Types**: Organization and Individual
- **Key Features**: Vehicle-specific details, dual customer support, comprehensive coverage options

## Database Architecture

### Active Policy Tables

#### EmployeeCompensationPolicy
```sql
CREATE TABLE EmployeeCompensationPolicies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_type VARCHAR(50) NOT NULL,
    customer_type VARCHAR(50) NOT NULL,
    insurance_company_id INT NOT NULL,
    company_id INT NOT NULL,
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    policy_start_date DATE NOT NULL,
    policy_end_date DATE NOT NULL,
    medical_cover VARCHAR(50),
    gst_number VARCHAR(50),
    pan_number VARCHAR(50),
    net_premium DECIMAL(10,2) NOT NULL,
    gst DECIMAL(10,2) NOT NULL,
    gross_premium DECIMAL(10,2) NOT NULL,
    policy_document_path VARCHAR(500),
    remarks TEXT,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    previous_policy_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (insurance_company_id) REFERENCES InsuranceCompanies(id),
    FOREIGN KEY (company_id) REFERENCES Companies(id),
    FOREIGN KEY (previous_policy_id) REFERENCES PreviousEmployeeCompensationPolicies(id),
    
    INDEX idx_policy_number (policy_number),
    INDEX idx_company_id (company_id),
    INDEX idx_insurance_company_id (insurance_company_id),
    INDEX idx_policy_end_date (policy_end_date)
);
```

#### VehiclePolicy
```sql
CREATE TABLE VehiclePolicies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_type VARCHAR(50) NOT NULL,
    customer_type ENUM('Organisation', 'Individual') NOT NULL,
    insurance_company_id INT NOT NULL,
    company_id INT NULL,
    consumer_id INT NULL,
    organisation_or_holder_name VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    policy_start_date DATE NOT NULL,
    policy_end_date DATE NOT NULL,
    sub_product VARCHAR(100),
    vehicle_number VARCHAR(50) NOT NULL,
    segment VARCHAR(50),
    manufacturing_company VARCHAR(100),
    model VARCHAR(100),
    manufacturing_year INT,
    idv DECIMAL(10,2),
    net_premium DECIMAL(10,2) NOT NULL,
    gst DECIMAL(10,2) NOT NULL,
    gross_premium DECIMAL(10,2) NOT NULL,
    policy_document_path VARCHAR(500),
    remarks TEXT,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    previous_policy_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (insurance_company_id) REFERENCES InsuranceCompanies(id),
    FOREIGN KEY (company_id) REFERENCES Companies(id),
    FOREIGN KEY (consumer_id) REFERENCES Consumers(id),
    FOREIGN KEY (previous_policy_id) REFERENCES PreviousVehiclePolicies(id),
    
    CHECK ((customer_type = 'Organisation' AND company_id IS NOT NULL AND consumer_id IS NULL) OR 
           (customer_type = 'Individual' AND consumer_id IS NOT NULL AND company_id IS NULL)),
    
    INDEX idx_policy_number (policy_number),
    INDEX idx_company_id (company_id),
    INDEX idx_consumer_id (consumer_id),
    INDEX idx_vehicle_number (vehicle_number),
    INDEX idx_policy_end_date (policy_end_date)
);
```

### Historical Policy Tables

#### PreviousEmployeeCompensationPolicy
- **Purpose**: Stores expired/renewed ECP policies
- **Structure**: Identical to EmployeeCompensationPolicy
- **Additional Fields**: `original_policy_id`, `renewed_at`

#### PreviousVehiclePolicy
- **Purpose**: Stores expired/renewed Vehicle policies
- **Structure**: Identical to VehiclePolicy
- **Additional Fields**: `original_policy_id`, `renewed_at`

## Backend Implementation

### Controllers

#### employeeCompensationController.js

**Key Methods:**

1. **getActiveCompanies()**
   ```javascript
   // Fetches active companies for dropdown selection
   const companies = await Company.findAll({
     where: { status: 'active' },
     attributes: ['id', 'company_name', 'email', 'phone_number', 'gst_number', 'pan_number']
   });
   ```

2. **createPolicy()**
   ```javascript
   // Creates new ECP policy with file upload and validation
   const policy = await EmployeeCompensationPolicy.create({
     business_type,
     customer_type: 'Organisation',
     insurance_company_id,
     company_id,
     policy_number,
     // ... other fields
     policy_document_path: req.file ? req.file.filename : null
   });
   
   // Log action for audit trail
   await UserRoleWorkLog.create({
     user_id: req.user.id,
     target_user_id: company.user_id,
     action: 'created_ecp_policy',
     details: JSON.stringify({ policy_id: policy.id, policy_number })
   });
   ```

3. **renewPolicy()**
   ```javascript
   // Transactional renewal process
   const transaction = await sequelize.transaction();
   
   try {
     // Step 1: Move current policy to previous policies table
     const previousPolicy = await PreviousEmployeeCompensationPolicy.create({
       ...currentPolicy.dataValues,
       original_policy_id: currentPolicy.id,
       renewed_at: new Date(),
       status: 'expired'
     }, { transaction });
     
     // Step 2: Create new policy with renewal data
     const newPolicy = await EmployeeCompensationPolicy.create({
       ...renewalData,
       business_type: 'Renewal/Rollover',
       previous_policy_id: previousPolicy.id,
       policy_document_path: req.file ? req.file.filename : null
     }, { transaction });
     
     // Step 3: Delete old policy
     await currentPolicy.destroy({ transaction });
     
     // Step 4: Log renewal action
     await UserRoleWorkLog.create({
       user_id: req.user.id,
       target_user_id: company.user_id,
       action: 'renewed_ecp_policy',
       details: JSON.stringify({
         old_policy_id: currentPolicy.id,
         new_policy_id: newPolicy.id,
         policy_number: newPolicy.policy_number
       })
     }, { transaction });
     
     await transaction.commit();
     return { previousPolicy, newPolicy };
   } catch (error) {
     await transaction.rollback();
     throw error;
   }
   ```

#### vehiclePolicyController.js

**Key Differences from ECP:**

1. **Dual Customer Type Support**
   ```javascript
   // Validates customer type and sets appropriate ID
   if (customer_type === 'Organisation') {
     if (!company_id) throw new Error('Company ID required for Organisation');
     consumer_id = null;
   } else if (customer_type === 'Individual') {
     if (!consumer_id) throw new Error('Consumer ID required for Individual');
     company_id = null;
   }
   ```

2. **Enhanced Search**
   ```javascript
   // Multi-field search across vehicle-specific fields
   const searchConditions = {
     [Op.or]: [
       { policy_number: { [Op.like]: `%${search}%` } },
       { organisation_or_holder_name: { [Op.like]: `%${search}%` } },
       { email: { [Op.like]: `%${search}%` } },
       { vehicle_number: { [Op.like]: `%${search}%` } },
       { manufacturing_company: { [Op.like]: `%${search}%` } },
       { model: { [Op.like]: `%${search}%` } }
     ]
   };
   ```

### Routes Configuration

#### employeeCompensationRoutes.js
```javascript
const router = express.Router();
const upload = multer({ dest: 'uploads/employee_policies/' });

// CRUD Operations
router.get('/companies', getActiveCompanies);
router.get('/statistics', getECPStatistics);
router.get('/all-grouped', getAllPoliciesGrouped);
router.get('/', getAllPolicies);
router.get('/search', searchPolicies);
router.get('/:id', getPolicy);
router.post('/', upload.single('policyDocument'), validatePolicy, createPolicy);
router.put('/:id', upload.single('policyDocument'), validatePolicy, updatePolicy);
router.delete('/:id', deletePolicy);

// Renewal
router.post('/:id/renew', upload.single('policyDocument'), validateRenewal, renewPolicy);
```

#### vehiclePolicyRoutes.js
```javascript
const router = express.Router();
const upload = multer({ dest: 'uploads/vehicle_policies/' });

// Additional endpoints for dual customer support
router.get('/companies', getActiveCompanies);
router.get('/consumers', getActiveConsumers);
router.get('/statistics', getVehicleStatistics);

// Same CRUD pattern as ECP
router.post('/', upload.single('policyDocument'), validateVehiclePolicy, createPolicy);
router.post('/:id/renew', upload.single('policyDocument'), validateVehicleRenewal, renewPolicy);
```

## Frontend Implementation

### ECP Component (ECP.jsx)

**Key Features:**

1. **PolicyForm Component**
   ```jsx
   const PolicyForm = ({ policy, onSubmit, onCancel, companies, insuranceCompanies }) => {
     const [formData, setFormData] = useState({
       business_type: policy?.business_type || '',
       customer_type: 'Organisation',
       insurance_company_id: policy?.insurance_company_id || '',
       company_id: policy?.company_id || '',
       policy_number: policy?.policy_number || '',
       // ... other fields
     });
     
     // Auto-fill company details when company selected
     const handleCompanyChange = (selectedCompany) => {
       if (selectedCompany) {
         setFormData(prev => ({
           ...prev,
           company_id: selectedCompany.id,
           email: selectedCompany.email,
           mobile_number: selectedCompany.phone_number,
           gst_number: selectedCompany.gst_number,
           pan_number: selectedCompany.pan_number
         }));
       }
     };
     
     // Auto-calculate GST and gross premium
     const handleNetPremiumChange = (value) => {
       const netPremium = parseFloat(value) || 0;
       const gst = netPremium * 0.18;
       const grossPremium = netPremium + gst;
       
       setFormData(prev => ({
         ...prev,
         net_premium: netPremium,
         gst: gst.toFixed(2),
         gross_premium: grossPremium.toFixed(2)
       }));
     };
   };
   ```

2. **RenewalForm Component**
   ```jsx
   const RenewalForm = ({ policy, onSubmit, onCancel, insuranceCompanies }) => {
     const [formData, setFormData] = useState({
       // Pre-fill from existing policy
       business_type: 'Renewal/Rollover',
       customer_type: policy.customer_type,
       insurance_company_id: policy.insurance_company_id,
       company_id: policy.company_id,
       email: policy.email,
       mobile_number: policy.mobile_number,
       gst_number: policy.gst_number,
       pan_number: policy.pan_number,
       medical_cover: policy.medical_cover,
       
       // Clear fields that need new values
       policy_number: '',
       policy_start_date: '',
       policy_end_date: '',
       net_premium: '',
       gst: '',
       gross_premium: '',
       remarks: ''
     });
     
     // File upload is mandatory for renewals
     const [policyDocument, setPolicyDocument] = useState(null);
     const [documentError, setDocumentError] = useState('');
     
     const handleSubmit = async (e) => {
       e.preventDefault();
       
       if (!policyDocument) {
         setDocumentError('Policy document is required for renewal');
         return;
       }
       
       const formDataToSend = new FormData();
       Object.keys(formData).forEach(key => {
         formDataToSend.append(key, formData[key]);
       });
       formDataToSend.append('policyDocument', policyDocument);
       
       await onSubmit(formDataToSend);
     };
   };
   ```

### Vehicle Component (Vehicle.jsx)

**Key Differences:**

1. **Dual Customer Type Support**
   ```jsx
   const [customerOptions, setCustomerOptions] = useState([]);
   
   useEffect(() => {
     const loadCustomerOptions = async () => {
       const [companiesRes, consumersRes] = await Promise.all([
         api.get('/vehicle-policies/companies'),
         api.get('/vehicle-policies/consumers')
       ]);
       
       const options = [
         {
           label: 'Companies',
           options: companiesRes.data.map(company => ({
             value: company.id,
             label: company.company_name,
             type: 'Organisation',
             ...company
           }))
         },
         {
           label: 'Consumers',
           options: consumersRes.data.map(consumer => ({
             value: consumer.id,
             label: consumer.name,
             type: 'Individual',
             ...consumer
           }))
         }
       ];
       
       setCustomerOptions(options);
     };
     
     loadCustomerOptions();
   }, []);
   ```

2. **Vehicle-Specific Fields**
   ```jsx
   // Additional form fields for vehicle policies
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <div>
       <label>Vehicle Number *</label>
       <input
         type="text"
         value={formData.vehicle_number}
         onChange={(e) => setFormData(prev => ({
           ...prev,
           vehicle_number: e.target.value.toUpperCase()
         }))}
         placeholder="Enter vehicle number"
         required
       />
     </div>
     
     <div>
       <label>Sub Product</label>
       <select
         value={formData.sub_product}
         onChange={(e) => setFormData(prev => ({
           ...prev,
           sub_product: e.target.value
         }))}
       >
         <option value="">Select Sub Product</option>
         <option value="Two Wheeler">Two Wheeler</option>
         <option value="Private car">Private Car</option>
         <option value="Passenger Vehicle">Passenger Vehicle</option>
         <option value="Goods Carrying Vehicle">Goods Carrying Vehicle</option>
         <option value="Miscellaneous Vehicle">Miscellaneous Vehicle</option>
       </select>
     </div>
     
     <div>
       <label>Segment</label>
       <select
         value={formData.segment}
         onChange={(e) => setFormData(prev => ({
           ...prev,
           segment: e.target.value
         }))}
       >
         <option value="">Select Segment</option>
         <option value="Comprehensive">Comprehensive</option>
         <option value="TP Only">TP Only</option>
         <option value="SAOD">SAOD</option>
       </select>
     </div>
     
     <div>
       <label>IDV (Insured Declared Value)</label>
       <input
         type="number"
         step="0.01"
         value={formData.idv}
         onChange={(e) => setFormData(prev => ({
           ...prev,
           idv: e.target.value
         }))}
         placeholder="Enter IDV amount"
       />
     </div>
   </div>
   ```

## Renewal Process Workflow

### Step-by-Step Process

1. **Initiation**
   - User clicks "Renew" button on active policy
   - System opens RenewalForm modal
   - Form pre-populated with existing policy data

2. **Form Preparation**
   ```javascript
   // Pre-fill company/customer and insurance company
   const prepareRenewalForm = (policy) => ({
     business_type: 'Renewal/Rollover',
     customer_type: policy.customer_type,
     insurance_company_id: policy.insurance_company_id,
     company_id: policy.company_id,
     consumer_id: policy.consumer_id,
     
     // Copy contact and business details
     email: policy.email,
     mobile_number: policy.mobile_number,
     gst_number: policy.gst_number,
     pan_number: policy.pan_number,
     
     // Vehicle-specific (for vehicle policies)
     vehicle_number: policy.vehicle_number,
     manufacturing_company: policy.manufacturing_company,
     model: policy.model,
     manufacturing_year: policy.manufacturing_year,
     
     // Clear fields requiring new values
     policy_number: '',
     policy_start_date: '',
     policy_end_date: '',
     net_premium: '',
     gst: '',
     gross_premium: '',
     remarks: ''
   });
   ```

3. **User Input**
   - Enter new policy number
   - Set new policy start and end dates
   - Update premium amounts
   - Upload new policy document (mandatory)
   - Add renewal remarks if needed

4. **Validation**
   ```javascript
   const validateRenewal = (formData, file) => {
     const errors = [];
     
     if (!formData.policy_number) errors.push('Policy number is required');
     if (!formData.policy_start_date) errors.push('Policy start date is required');
     if (!formData.policy_end_date) errors.push('Policy end date is required');
     if (!formData.net_premium || formData.net_premium <= 0) errors.push('Valid net premium is required');
     if (!file) errors.push('Policy document is required for renewal');
     
     // Date validation
     const startDate = new Date(formData.policy_start_date);
     const endDate = new Date(formData.policy_end_date);
     if (endDate <= startDate) errors.push('End date must be after start date');
     
     // Premium calculation validation
     const netPremium = parseFloat(formData.net_premium);
     const expectedGst = netPremium * 0.18;
     const expectedGross = netPremium + expectedGst;
     
     if (Math.abs(parseFloat(formData.gst) - expectedGst) > 0.01) {
       errors.push('GST calculation is incorrect');
     }
     
     if (Math.abs(parseFloat(formData.gross_premium) - expectedGross) > 0.01) {
       errors.push('Gross premium calculation is incorrect');
     }
     
     return errors;
   };
   ```

5. **Backend Processing**
   ```javascript
   const renewPolicy = async (policyId, renewalData, file) => {
     const transaction = await sequelize.transaction();
     
     try {
       // Get current policy
       const currentPolicy = await PolicyModel.findByPk(policyId, {
         include: [{ model: Company }, { model: InsuranceCompany }]
       });
       
       if (!currentPolicy) {
         throw new Error('Policy not found');
       }
       
       // Step 1: Archive current policy
       const archivedPolicy = await PreviousPolicyModel.create({
         ...currentPolicy.dataValues,
         original_policy_id: currentPolicy.id,
         renewed_at: new Date(),
         status: 'expired'
       }, { transaction });
       
       // Step 2: Create new policy
       const newPolicy = await PolicyModel.create({
         ...renewalData,
         business_type: 'Renewal/Rollover',
         previous_policy_id: archivedPolicy.id,
         policy_document_path: file ? file.filename : null,
         status: 'active'
       }, { transaction });
       
       // Step 3: Remove old policy
       await currentPolicy.destroy({ transaction });
       
       // Step 4: Log action
       await UserRoleWorkLog.create({
         user_id: req.user.id,
         target_user_id: currentPolicy.Company?.user_id || currentPolicy.Consumer?.user_id,
         action: `renewed_${policyType}_policy`,
         details: JSON.stringify({
           old_policy_id: currentPolicy.id,
           new_policy_id: newPolicy.id,
           policy_number: newPolicy.policy_number,
           renewal_date: new Date()
         })
       }, { transaction });
       
       await transaction.commit();
       
       return {
         success: true,
         previousPolicy: archivedPolicy,
         newPolicy: await PolicyModel.findByPk(newPolicy.id, {
           include: [{ model: Company }, { model: Consumer }, { model: InsuranceCompany }]
         })
       };
     } catch (error) {
       await transaction.rollback();
       throw error;
     }
   };
   ```

6. **Response Handling**
   ```javascript
   // Frontend renewal submission
   const handleRenewal = async (formData) => {
     try {
       setLoading(true);
       
       const response = await api.post(`/employee-compensation/${selectedPolicy.id}/renew`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
       });
       
       // Update policies list
       await fetchPolicies();
       
       // Show success message
       toast.success(`Policy renewed successfully! New policy number: ${response.data.newPolicy.policy_number}`);
       
       // Close modal
       setShowRenewalModal(false);
       setSelectedPolicy(null);
       
     } catch (error) {
       console.error('Renewal error:', error);
       toast.error(error.response?.data?.message || 'Failed to renew policy');
     } finally {
       setLoading(false);
     }
   };
   ```

## API Endpoints

### ECP Policy Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/employee-compensation/companies` | Get active companies | - | Array of companies |
| GET | `/employee-compensation/statistics` | Get ECP statistics | - | Statistics object |
| GET | `/employee-compensation` | Get all policies (paginated) | Query: page, limit, search | Paginated policies |
| GET | `/employee-compensation/:id` | Get single policy | - | Policy with associations |
| POST | `/employee-compensation` | Create new policy | FormData with policy fields + file | Created policy |
| PUT | `/employee-compensation/:id` | Update policy | FormData with updated fields + file | Updated policy |
| DELETE | `/employee-compensation/:id` | Delete policy | - | Success message |
| POST | `/employee-compensation/:id/renew` | Renew policy | FormData with renewal data + file | Previous and new policy |

### Vehicle Policy Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/vehicle-policies/companies` | Get active companies | - | Array of companies |
| GET | `/vehicle-policies/consumers` | Get active consumers | - | Array of consumers |
| GET | `/vehicle-policies/statistics` | Get vehicle statistics | - | Statistics object |
| GET | `/vehicle-policies` | Get all policies (paginated) | Query: page, limit, search | Paginated policies |
| GET | `/vehicle-policies/:id` | Get single policy | - | Policy with associations |
| POST | `/vehicle-policies` | Create new policy | FormData with policy fields + file | Created policy |
| PUT | `/vehicle-policies/:id` | Update policy | FormData with updated fields + file | Updated policy |
| DELETE | `/vehicle-policies/:id` | Delete policy | - | Success message |
| POST | `/vehicle-policies/:id/renew` | Renew policy | FormData with renewal data + file | Previous and new policy |

### Request/Response Examples

#### Create ECP Policy
```javascript
// Request
POST /employee-compensation
Content-Type: multipart/form-data

{
  business_type: "New Business",
  customer_type: "Organisation",
  insurance_company_id: "1",
  company_id: "5",
  policy_number: "ECP2024001",
  email: "company@example.com",
  mobile_number: "+91-9876543210",
  policy_start_date: "2024-01-01",
  policy_end_date: "2024-12-31",
  medical_cover: "5 lac",
  gst_number: "27ABCDE1234F1Z5",
  pan_number: "ABCDE1234F",
  net_premium: "50000.00",
  gst: "9000.00",
  gross_premium: "59000.00",
  remarks: "Annual policy",
  policyDocument: [File]
}

// Response
{
  "success": true,
  "message": "ECP policy created successfully",
  "policy": {
    "id": 123,
    "policy_number": "ECP2024001",
    "business_type": "New Business",
    "status": "active",
    "Company": {
      "id": 5,
      "company_name": "ABC Corp",
      "email": "company@example.com"
    },
    "InsuranceCompany": {
      "id": 1,
      "company_name": "XYZ Insurance"
    },
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

#### Renew Policy
```javascript
// Request
POST /employee-compensation/123/renew
Content-Type: multipart/form-data

{
  business_type: "Renewal/Rollover",
  policy_number: "ECP2025001",
  policy_start_date: "2025-01-01",
  policy_end_date: "2025-12-31",
  net_premium: "55000.00",
  gst: "9900.00",
  gross_premium: "64900.00",
  remarks: "Renewed with increased coverage",
  policyDocument: [File]
}

// Response
{
  "success": true,
  "message": "Policy renewed successfully",
  "previousPolicy": {
    "id": 456,
    "original_policy_id": 123,
    "policy_number": "ECP2024001",
    "status": "expired",
    "renewed_at": "2025-01-01T10:00:00.000Z"
  },
  "newPolicy": {
    "id": 789,
    "policy_number": "ECP2025001",
    "business_type": "Renewal/Rollover",
    "previous_policy_id": 456,
    "status": "active",
    "created_at": "2025-01-01T10:00:00.000Z"
  }
}
```

## File Upload & Management

### Multer Configuration

```javascript
// Backend/config/multerConfig.js
const multer = require('multer');
const path = require('path');

const createStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
  }
};

const ecpUpload = multer({
  storage: createStorage('uploads/employee_policies/'),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const vehicleUpload = multer({
  storage: createStorage('uploads/vehicle_policies/'),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = { ecpUpload, vehicleUpload };
```

### File Handling in Controllers

```javascript
// File upload handling in create/update/renew operations
const handleFileUpload = async (req, existingPolicy = null) => {
  let policyDocumentPath = existingPolicy?.policy_document_path || null;
  
  if (req.file) {
    // Delete old file if updating/renewing
    if (existingPolicy?.policy_document_path) {
      const oldFilePath = path.join(__dirname, '../uploads/employee_policies/', existingPolicy.policy_document_path);
      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.log('Old file not found or already deleted:', error.message);
      }
    }
    
    policyDocumentPath = req.file.filename;
  }
  
  return policyDocumentPath;
};
```

### Frontend File Upload

```jsx
// File upload component with validation
const FileUpload = ({ onFileSelect, error, required = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a PDF or Word document');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${error ? 'border-red-500' : ''}`}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        className="hidden"
        id="file-upload"
      />
      
      <label htmlFor="file-upload" className="cursor-pointer">
        {selectedFile ? (
          <div className="text-green-600">
            <CheckCircleIcon className="w-8 h-8 mx-auto mb-2" />
            <p>{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="text-gray-500">
            <DocumentIcon className="w-8 h-8 mx-auto mb-2" />
            <p>Click to upload or drag and drop</p>
            <p className="text-sm">PDF or Word documents (max 10MB)</p>
            {required && <p className="text-red-500 text-sm mt-1">* Required</p>}
          </div>
        )}
      </label>
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
```

## Validation & Error Handling

### Backend Validation

```javascript
// Express-validator rules for ECP policy
const validateECPPolicy = [
  body('business_type').notEmpty().withMessage('Business type is required'),
  body('customer_type').equals('Organisation').withMessage('Customer type must be Organisation for ECP'),
  body('insurance_company_id').isInt().withMessage('Valid insurance company is required'),
  body('company_id').isInt().withMessage('Valid company is required'),
  body('policy_number').notEmpty().withMessage('Policy number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobile_number').isMobilePhone().withMessage('Valid mobile number is required'),
  body('policy_start_date').isDate().withMessage('Valid start date is required'),
  body('policy_end_date').isDate().withMessage('Valid end date is required'),
  body('net_premium').isFloat({ min: 0.01 }).withMessage('Net premium must be greater than 0'),
  body('gst').isFloat({ min: 0 }).withMessage('GST must be a valid amount'),
  body('gross_premium').isFloat({ min: 0.01 }).withMessage('Gross premium must be greater than 0'),
  
  // Custom validation for premium calculations
  body('gross_premium').custom((value, { req }) => {
    const netPremium = parseFloat(req.body.net_premium);
    const gst = parseFloat(req.body.gst);
    const grossPremium = parseFloat(value);
    
    const expectedGst = netPremium * 0.18;
    const expectedGross = netPremium + expectedGst;
    
    if (Math.abs(gst - expectedGst) > 0.01) {
      throw new Error('GST calculation is incorrect (should be 18% of net premium)');
    }
    
    if (Math.abs(grossPremium - expectedGross) > 0.01) {
      throw new Error('Gross premium calculation is incorrect (should be net premium + GST)');
    }
    
    return true;
  }),
  
  // Date validation
  body('policy_end_date').custom((value, { req }) => {
    const startDate = new Date(req.body.policy_start_date);
    const endDate = new Date(value);
    
    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
    
    return true;
  })
];

// Vehicle policy validation (additional fields)
const validateVehiclePolicy = [
  ...validateECPPolicy.filter(rule => rule.builder.fields[0] !== 'customer_type'),
  
  body('customer_type').isIn(['Organisation', 'Individual']).withMessage('Customer type must be Organisation or Individual'),
  body('vehicle_number').notEmpty().withMessage('Vehicle number is required'),
  body('organisation_or_holder_name').notEmpty().withMessage('Holder name is required'),
  
  // Conditional validation based on customer type
  body('company_id').custom((value, { req }) => {
    if (req.body.customer_type === 'Organisation' && !value) {
      throw new Error('Company is required for Organisation customer type');
    }
    if (req.body.customer_type === 'Individual' && value) {
      throw new Error('Company should not be set for Individual customer type');
    }
    return true;
  }),
  
  body('consumer_id').custom((value, { req }) => {
    if (req.body.customer_type === 'Individual' && !value) {
      throw new Error('Consumer is required for Individual customer type');
    }
    if (req.body.customer_type === 'Organisation' && value) {
      throw new Error('Consumer should not be set for Organisation customer type');
    }
    return true;
  })
];
```

### Frontend Validation

```jsx
// Form validation hook
const useFormValidation = (initialData, validationRules) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';
    
    for (const rule of rules) {
      const error = rule(value, formData);
      if (error) return error;
    }
    
    return '';
  };
  
  const validateForm = () => {
    const newErrors = {};
    let formIsValid = true;
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        formIsValid = false;
      }
    });
    
    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  };
  
  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  return {
    formData,
    errors,
    isValid,
    updateField,
    validateForm,
    setFormData
  };
};

// Validation rules for ECP
const ecpValidationRules = {
  policy_number: [
    (value) => !value ? 'Policy number is required' : '',
    (value) => value && value.length < 3 ? 'Policy number must be at least 3 characters' : ''
  ],
  
  email: [
    (value) => !value ? 'Email is required' : '',
    (value) => value && !/\S+@\S+\.\S+/.test(value) ? 'Invalid email format' : ''
  ],
  
  mobile_number: [
    (value) => !value ? 'Mobile number is required' : '',
    (value) => value && !/^\+?[\d\s\-\(\)]{10,}$/.test(value) ? 'Invalid mobile number' : ''
  ],
  
  policy_start_date: [
    (value) => !value ? 'Start date is required' : ''
  ],
  
  policy_end_date: [
    (value) => !value ? 'End date is required' : '',
    (value, formData) => {
      if (value && formData.policy_start_date) {
        const start = new Date(formData.policy_start_date);
        const end = new Date(value);
        return end <= start ? 'End date must be after start date' : '';
      }
      return '';
    }
  ],
  
  net_premium: [
    (value) => !value ? 'Net premium is required' : '',
    (value) => value && (isNaN(value) || parseFloat(value) <= 0) ? 'Net premium must be greater than 0' : ''
  ],
  
  gross_premium: [
    (value, formData) => {
      if (value && formData.net_premium && formData.gst) {
        const expected = parseFloat(formData.net_premium) + parseFloat(formData.gst);
        const actual = parseFloat(value);
        return Math.abs(actual - expected) > 0.01 ? 'Gross premium calculation is incorrect' : '';
      }
      return '';
    }
  ]
};
```

### Error Response Handling

```javascript
// Centralized error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  
  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      errors: err.errors.map(e => ({
        field: e.path,
        message: `${e.path} already exists`
      }))
    });
  }
  
  // File upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large',
        error: 'File size must be less than 10MB'
      });
    }
  }
  
  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};
```

## Audit & Logging

### UserRoleWorkLog Integration

```javascript
// Logging service for policy actions
class PolicyAuditLogger {
  static async logAction(userId, targetUserId, action, details) {
    try {
      await UserRoleWorkLog.create({
        user_id: userId,
        target_user_id: targetUserId,
        action,
        details: JSON.stringify(details),
        created_at: new Date()
      });
    } catch (error) {
      console.error('Failed to log action:', error);
      // Don't throw error to avoid breaking main operation
    }
  }
  
  static async logPolicyCreation(userId, policy, policyType) {
    const targetUserId = policy.Company?.user_id || policy.Consumer?.user_id;
    
    await this.logAction(userId, targetUserId, `created_${policyType}_policy`, {
      policy_id: policy.id,
      policy_number: policy.policy_number,
      business_type: policy.business_type,
      customer_type: policy.customer_type,
      net_premium: policy.net_premium,
      gross_premium: policy.gross_premium,
      policy_start_date: policy.policy_start_date,
      policy_end_date: policy.policy_end_date
    });
  }
  
  static async logPolicyUpdate(userId, oldPolicy, newPolicy, policyType) {
    const targetUserId = newPolicy.Company?.user_id || newPolicy.Consumer?.user_id;
    
    // Track what changed
    const changes = {};
    const fieldsToTrack = [
      'policy_number', 'policy_start_date', 'policy_end_date',
      'net_premium', 'gst', 'gross_premium', 'remarks'
    ];
    
    fieldsToTrack.forEach(field => {
      if (oldPolicy[field] !== newPolicy[field]) {
        changes[field] = {
          from: oldPolicy[field],
          to: newPolicy[field]
        };
      }
    });
    
    await this.logAction(userId, targetUserId, `updated_${policyType}_policy`, {
      policy_id: newPolicy.id,
      policy_number: newPolicy.policy_number,
      changes
    });
  }
  
  static async logPolicyRenewal(userId, oldPolicy, newPolicy, policyType) {
    const targetUserId = newPolicy.Company?.user_id || newPolicy.Consumer?.user_id;
    
    await this.logAction(userId, targetUserId, `renewed_${policyType}_policy`, {
      old_policy_id: oldPolicy.id,
      old_policy_number: oldPolicy.policy_number,
      new_policy_id: newPolicy.id,
      new_policy_number: newPolicy.policy_number,
      renewal_date: new Date(),
      premium_change: {
        old_premium: oldPolicy.gross_premium,
        new_premium: newPolicy.gross_premium,
        difference: newPolicy.gross_premium - oldPolicy.gross_premium
      }
    });
  }
  
  static async logPolicyDeletion(userId, policy, policyType) {
    const targetUserId = policy.Company?.user_id || policy.Consumer?.user_id;
    
    await this.logAction(userId, targetUserId, `cancelled_${policyType}_policy`, {
      policy_id: policy.id,
      policy_number: policy.policy_number,
      cancellation_date: new Date(),
      remaining_days: Math.ceil((new Date(policy.policy_end_date) - new Date()) / (1000 * 60 * 60 * 24))
    });
  }
}
```

### Audit Trail Queries

```javascript
// Get audit trail for a specific policy
const getPolicyAuditTrail = async (policyId, policyType) => {
  const actions = [`created_${policyType}_policy`, `updated_${policyType}_policy`, 
                  `renewed_${policyType}_policy`, `cancelled_${policyType}_policy`];
  
  const logs = await UserRoleWorkLog.findAll({
    where: {
      action: { [Op.in]: actions },
      details: { [Op.like]: `%"policy_id":${policyId}%` }
    },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'email']
    }],
    order: [['created_at', 'DESC']]
  });
  
  return logs.map(log => ({
    id: log.id,
    action: log.action,
    user: log.user,
    details: JSON.parse(log.details),
    timestamp: log.created_at
  }));
};

// Get renewal statistics
const getRenewalStatistics = async (startDate, endDate) => {
  const renewalActions = ['renewed_ecp_policy', 'renewed_vehicle_policy'];
  
  const stats = await UserRoleWorkLog.findAll({
    where: {
      action: { [Op.in]: renewalActions },
      created_at: {
        [Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'action',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('DATE', sequelize.col('created_at')), 'date']
    ],
    group: ['action', sequelize.fn('DATE', sequelize.col('created_at'))],
    order: [['date', 'ASC']]
  });
  
  return stats;
};
```

## Deployment Scripts

Now I'll check for existing scripts and create/update them for policy creation on server restart.

## Deployment Scripts

### Available Scripts

The system includes several scripts for setting up and managing the policy renewal system:

#### 1. Main Server Setup Script
```bash
# Run complete server setup (includes policy tables)
npm run setup

# Unix/Linux systems
npm run setup:unix
```

**What it does:**
- Sets up database structure
- Creates roles and permissions
- Sets up user accounts
- **NEW: Sets up policy tables and renewal system**
- Configures renewal management system

#### 2. Policy Tables Setup Script (NEW)
```bash
# Run only policy tables setup
npm run setup:policies
```

**What it does:**
- Creates `PreviousEmployeeCompensationPolicies` table
- Creates `PreviousVehiclePolicies` table
- Adds `previous_policy_id` columns to main policy tables
- Sets up upload directories for policy documents
- Creates performance indexes
- Verifies table structures
- Sets up document cleanup configuration

#### 3. Renewal System Setup Script
```bash
# Run only renewal system setup
npm run setup:renewal
```

**What it does:**
- Sets up renewal configuration tables
- Creates renewal reminder system
- Configures automatic renewal notifications

#### 4. Send Renewal Reminders Script
```bash
# Manually trigger renewal reminders
npm run send:reminders
```

**What it does:**
- Sends renewal reminder emails
- Updates reminder logs
- Processes pending renewals

### Script Integration in Server Startup

The policy tables setup is now automatically integrated into the main server startup process:

```javascript
// In server.js - startServer() function
const startServer = async () => {
  try {
    // ... other setup code ...
    
    // Step 1: Database Setup (now includes policy tables)
    console.log("📊 Setting up database structure...");
    const dbSetup = await setupDatabase(); // This now includes policy tables setup
    
    // ... rest of setup ...
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};
```

### Manual Script Execution

You can also run the policy setup scripts manually:

#### Direct Script Execution
```bash
# Navigate to Backend directory
cd Backend

# Run policy setup directly
node scripts/runPolicySetup.js

# Run individual table creation scripts
node scripts/createPreviousEmployeeCompensationTable.js
node scripts/createPreviousVehiclePolicyTable.js
```

#### Using NPM Scripts
```bash
# From Backend directory
npm run setup:policies
```

### Script Output Examples

#### Successful Policy Setup Output
```
==============================================================
🚀 STANDALONE POLICY SETUP SCRIPT
==============================================================
📋 This script will set up:
   • ECP Previous Policy Tables
   • Vehicle Previous Policy Tables
   • Upload Directories
   • Performance Indexes
   • Renewal System Verification
==============================================================

============================================================
🏗️  POLICY TABLES SETUP
============================================================
✅ Database connection established

📋 Step 1: Setting up ECP Previous Policy Table...
📝 Creating PreviousEmployeeCompensationPolicies table...
✅ PreviousEmployeeCompensationPolicies table created successfully
📝 Adding previous_policy_id column to EmployeeCompensationPolicies...
✅ previous_policy_id column added successfully
✅ ECP Previous Policy Table setup completed

📋 Step 2: Setting up Vehicle Previous Policy Table...
📝 Creating PreviousVehiclePolicies table...
✅ PreviousVehiclePolicies table created successfully
📝 Adding previous_policy_id column to VehiclePolicies...
✅ previous_policy_id column added successfully
✅ Vehicle Previous Policy Table setup completed

📁 Step 3: Setting up upload directories...
   📁 Directory exists: uploads
   📁 Directory exists: uploads/employee_policies
   📁 Directory exists: uploads/vehicle_policies
   📁 Directory created: uploads/health_policies
   📁 Directory created: uploads/fire_policies
   📁 Directory created: uploads/life_policies
✅ Upload directories setup completed

🔍 Step 4: Verifying policy table structures...
   ✅ Table verified: EmployeeCompensationPolicies
   ✅ Required columns verified: EmployeeCompensationPolicies
   ✅ Table verified: PreviousEmployeeCompensationPolicies
   ✅ Required columns verified: PreviousEmployeeCompensationPolicies
   ✅ Table verified: VehiclePolicies
   ✅ Required columns verified: VehiclePolicies
   ✅ Table verified: PreviousVehiclePolicies
   ✅ Required columns verified: PreviousVehiclePolicies
✅ Policy table structures verified

⚡ Step 5: Setting up performance indexes...
   ⚡ Setting up indexes for EmployeeCompensationPolicies...
   ✅ Indexes setup completed for EmployeeCompensationPolicies
   ⚡ Setting up indexes for VehiclePolicies...
   ✅ Indexes setup completed for VehiclePolicies
   ⚡ Setting up indexes for PreviousEmployeeCompensationPolicies...
   ✅ Indexes setup completed for PreviousEmployeeCompensationPolicies
   ⚡ Setting up indexes for PreviousVehiclePolicies...
   ✅ Indexes setup completed for PreviousVehiclePolicies
✅ Performance indexes setup completed

============================================================
🎉 POLICY TABLES SETUP COMPLETED SUCCESSFULLY!
============================================================
📊 Summary:
   ✅ ECP Previous Policy Table: Ready
   ✅ Vehicle Previous Policy Table: Ready
   ✅ Upload Directories: Created
   ✅ Table Structures: Verified
   ✅ Performance Indexes: Optimized
============================================================

🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
✅ POLICY SETUP COMPLETED SUCCESSFULLY!
🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉

📋 Next Steps:
   1. Restart your server to apply changes
   2. Test policy creation and renewal functionality
   3. Verify upload directories are accessible
   4. Check database indexes for performance
```

### Error Handling in Scripts

The scripts include comprehensive error handling:

#### Connection Errors
```
❌ Database connection failed: ECONNREFUSED
Please check:
   1. MySQL server is running
   2. Database credentials in config.js
   3. Database exists and is accessible
```

#### Permission Errors
```
❌ Error creating table: Access denied for user 'username'@'host'
Please ensure the database user has:
   1. CREATE privileges
   2. ALTER privileges
   3. INDEX privileges
```

#### Table Already Exists
```
ℹ️  PreviousEmployeeCompensationPolicies table already exists
ℹ️  previous_policy_id column already exists
✅ Policy tables setup completed (no changes needed)
```

### Production Deployment Considerations

#### Environment Variables
```bash
# Set to skip setup in production
SKIP_SETUP=true
CURRENT_ENV=production

# Or run setup once during deployment
SKIP_SETUP=false
CURRENT_ENV=development
```

#### Deployment Workflow
1. **Initial Deployment:**
   ```bash
   # Run complete setup
   npm run setup
   
   # Or run policy setup separately
   npm run setup:policies
   ```

2. **Updates/Migrations:**
   ```bash
   # Run only policy setup for updates
   npm run setup:policies
   ```

3. **Production Restart:**
   ```bash
   # Set environment to skip setup
   SKIP_SETUP=true npm start
   ```

### Monitoring and Maintenance

#### Log Files
The scripts create log files in `Backend/logs/`:
- `server.log` - General server setup logs
- Policy setup logs are included in server.log

#### Health Checks
```bash
# Check if tables exist
curl http://localhost:5000/api/health

# Response includes database status
{
  "status": "UP",
  "services": {
    "database": "UP",
    "api": "UP"
  }
}
```

#### Database Verification Queries
```sql
-- Check if policy tables exist
SHOW TABLES LIKE '%Policy%';

-- Verify previous policy tables structure
DESCRIBE PreviousEmployeeCompensationPolicies;
DESCRIBE PreviousVehiclePolicies;

-- Check indexes
SHOW INDEX FROM EmployeeCompensationPolicies;
SHOW INDEX FROM VehiclePolicies;

-- Verify foreign key relationships
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('EmployeeCompensationPolicies', 'VehiclePolicies');
```

### Troubleshooting Common Issues

#### Issue 1: Script Fails with "Table doesn't exist"
**Solution:**
```bash
# Run complete setup first
npm run setup

# Then run policy setup
npm run setup:policies
```

#### Issue 2: Permission Denied Errors
**Solution:**
```sql
-- Grant necessary privileges to database user
GRANT CREATE, ALTER, INDEX, SELECT, INSERT, UPDATE, DELETE 
ON database_name.* TO 'username'@'host';
FLUSH PRIVILEGES;
```

#### Issue 3: Upload Directories Not Created
**Solution:**
```bash
# Manually create directories
mkdir -p Backend/uploads/employee_policies
mkdir -p Backend/uploads/vehicle_policies
chmod 755 Backend/uploads/*
```

#### Issue 4: Foreign Key Constraint Errors
**Solution:**
```bash
# Run scripts in correct order
node scripts/createPreviousEmployeeCompensationTable.js
node scripts/createPreviousVehiclePolicyTable.js

# Or use the master script
npm run setup:policies
```

### Performance Optimization

The scripts automatically create performance indexes:

#### ECP Policy Indexes
- `idx_ecp_status` - For filtering by policy status
- `idx_ecp_policy_dates` - For date range queries
- `idx_ecp_company_status` - For company-specific queries
- `idx_ecp_insurance_company` - For insurance company lookups
- `idx_ecp_created_at` - For chronological sorting

#### Vehicle Policy Indexes
- `idx_vp_status` - For filtering by policy status
- `idx_vp_policy_dates` - For date range queries
- `idx_vp_customer_type` - For customer type filtering
- `idx_vp_vehicle_number` - For vehicle number searches
- `idx_vp_company_status` - For company-specific queries
- `idx_vp_consumer_status` - For consumer-specific queries

#### Previous Policy Indexes
- `idx_pecp_original_policy` - Links to original policies
- `idx_pecp_renewed_at` - For renewal date queries
- `idx_pvp_original_policy` - Links to original policies
- `idx_pvp_renewed_at` - For renewal date queries

### Backup and Recovery

#### Before Running Scripts
```bash
# Backup database before major changes
mysqldump -u username -p database_name > backup_before_policy_setup.sql
```

#### After Successful Setup
```bash
# Create backup with new structure
mysqldump -u username -p database_name > backup_after_policy_setup.sql
```

#### Recovery Process
```bash
# If something goes wrong, restore from backup
mysql -u username -p database_name < backup_before_policy_setup.sql

# Then re-run setup
npm run setup:policies
```

---

## Summary

This documentation covers the complete ECP and Vehicle Policy renewal system implementation, including:

1. **Comprehensive Database Architecture** - Complete table structures with relationships
2. **Backend Implementation** - Controllers, routes, and business logic
3. **Frontend Implementation** - React components and user interfaces
4. **Renewal Process Workflow** - Step-by-step renewal process
5. **API Endpoints** - Complete API documentation with examples
6. **File Upload & Management** - Document handling and storage
7. **Validation & Error Handling** - Comprehensive validation rules
8. **Audit & Logging** - Complete audit trail system
9. **Deployment Scripts** - Automated setup and maintenance scripts

The system now includes automated setup scripts that run on server restart, ensuring that all policy tables and renewal functionality are properly configured. The scripts are integrated into the main server startup process but can also be run independently for maintenance and updates.

### Key Features Implemented:

✅ **ECP Policy Management** - Complete CRUD operations with renewal support
✅ **Vehicle Policy Management** - Dual customer type support with renewal
✅ **Renewal System** - Transactional renewal process with audit trail
✅ **File Management** - Document upload, storage, and cleanup
✅ **Performance Optimization** - Database indexes and query optimization
✅ **Automated Setup** - Scripts for deployment and maintenance
✅ **Error Handling** - Comprehensive validation and error management
✅ **Audit Trail** - Complete logging of all policy actions
✅ **Frontend Integration** - User-friendly interfaces for all operations

The system is production-ready and includes all necessary components for managing ECP and Vehicle policy renewals in a professional insurance management system.