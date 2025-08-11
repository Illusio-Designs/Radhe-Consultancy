// This file is now FactoryQuotation.jsx
import React, { useState, useEffect } from "react";
import { BiPlus, BiEdit, BiErrorCircle, BiFile, BiUpload } from "react-icons/bi";
import { factoryQuotationAPI, planManagementAPI, userAPI, stabilityManagementAPI, applicationManagementAPI, companyAPI } from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import Dropdown from "../../../components/common/Dropdown/Dropdown";
import PhoneInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';
import "../../../styles/pages/dashboard/compliance/Compliance.css";
import "../../../styles/pages/dashboard/companies/Vendor.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../contexts/AuthContext";

// Plan Manager Selection Modal
const PlanManagerSelectionModal = ({ isOpen, onClose, onSelect, quotation }) => {
  const [selectedPlanManager, setSelectedPlanManager] = useState('');
  const [loading, setLoading] = useState(false);
  const [planManagers, setPlanManagers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchPlanManagers();
    }
  }, [isOpen]);

  const fetchPlanManagers = async () => {
    try {
      setLoading(true);
      console.log('Fetching plan managers...');
      
      // Fetch users with Plan_manager role
      const response = await planManagementAPI.getPlanManagers();
      console.log('Plan managers API response:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        setPlanManagers(response.data);
        console.log('Plan managers loaded successfully:', response.data);
      } else {
        console.error('Invalid response format:', response);
        toast.error('Failed to load plan managers - invalid response');
        setPlanManagers([]);
      }
    } catch (error) {
      console.error('Error fetching plan managers:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to load plan managers: ${error.message}`);
      setPlanManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPlanManager) {
      toast.error('Please select a plan manager');
      return;
    }

    setLoading(true);
    try {
      const response = await planManagementAPI.createPlanManagement({
        factory_quotation_id: quotation.id,
        plan_manager_id: selectedPlanManager
      });
      
      if (response.success) {
        toast.success('Plan manager assigned successfully');
        onSelect(selectedPlanManager);
        onClose();
      }
    } catch (error) {
      toast.error('Failed to assign plan manager');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Plan Manager">
      <div className="plan-manager-selection-modal">
        <div className="form-group">
          <label>Select Plan Manager:</label>
          <select
            value={selectedPlanManager}
            onChange={(e) => setSelectedPlanManager(e.target.value)}
            className="form-control"
            disabled={loading}
          >
            <option value="">
              {loading ? 'Loading plan managers...' : 'Select Plan Manager'}
            </option>
            {planManagers.map(manager => (
              <option key={manager.user_id} value={manager.user_id}>
                {manager.username} ({manager.email})
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleAssign} variant="contained" disabled={loading}>
            Assign
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const StabilityManagerSelectionModal = ({ isOpen, onClose, onSelect, quotation }) => {
  const [selectedStabilityManager, setSelectedStabilityManager] = useState('');
  const [loading, setLoading] = useState(false);
  const [stabilityManagers, setStabilityManagers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchStabilityManagers();
    }
  }, [isOpen]);

  const fetchStabilityManagers = async () => {
    try {
      const response = await stabilityManagementAPI.getStabilityManagers();
      if (response.success) {
        setStabilityManagers(response.data);
      }
    } catch (error) {
      console.error('Error fetching stability managers:', error);
      toast.error('Failed to fetch stability managers');
    }
  };

  const handleAssign = async () => {
    if (!selectedStabilityManager) {
      toast.error('Please select a stability manager');
      return;
    }
    setLoading(true);
    try {
      // Use the existing stabilityCertificateType from the quotation
      const loadType = quotation.stabilityCertificateType || 'with_load';
      onSelect(selectedStabilityManager, loadType);
      onClose();
    } catch (error) {
      toast.error('Failed to assign stability manager');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Stability Manager">
      <div className="stability-manager-selection-modal">
        <div className="form-group">
          <label>Select Stability Manager:</label>
          <select
            value={selectedStabilityManager}
            onChange={(e) => setSelectedStabilityManager(e.target.value)}
            className="form-control"
            disabled={loading}
          >
            <option value="">
              {loading ? 'Loading stability managers...' : 'Select Stability Manager'}
            </option>
            {stabilityManagers.map(manager => (
              <option key={manager.user_id} value={manager.user_id}>
                {manager.username} ({manager.email})
              </option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleAssign} variant="contained" disabled={loading}>
            Assign
          </Button>
        </div>
      </div>
    </Modal>
  );
};



// Application Approval Modal
const ApplicationApprovalModal = ({ isOpen, onClose, onApprove, currentApplication }) => {
  const [applicationDate, setApplicationDate] = useState(currentApplication?.application_date || '');
  const [expiryDate, setExpiryDate] = useState(currentApplication?.expiry_date || '');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleApprove = async () => {
    if (!applicationDate) {
      toast.error('Please select an application date');
      return;
    }

    setLoading(true);
    try {
      await onApprove(files, applicationDate, expiryDate);
      toast.success('Application approved successfully');
    } catch (error) {
      toast.error('Failed to approve application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Application">
      <div className="application-approval-modal">
        <div className="form-group">
          <label>Application Date (Required):</label>
          <input
            type="date"
            value={applicationDate}
            onChange={(e) => setApplicationDate(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>Expiry Date (Optional):</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="form-control"
          />
          <small className="text-gray-500">
            Leave empty if no specific expiry date
          </small>
        </div>

        <div className="form-group">
          <label>Upload Files (Optional):</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="form-control"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
          />
          <small className="text-gray-500">
            Allowed file types: PDF, Word, Excel, Images, Text (Max 10MB each, up to 10 files)
          </small>
        </div>

        {files.length > 0 && (
          <div className="selected-files">
            <h4>Selected Files:</h4>
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <BiFile /> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleApprove} variant="contained" disabled={loading}>
            {loading ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Application Reject Modal
const ApplicationRejectModal = ({ isOpen, onClose, onReject }) => {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error('Please enter remarks for rejection');
      return;
    }

    setLoading(true);
    try {
      await onReject(remarks);
      toast.success('Application rejected successfully');
    } catch (error) {
      toast.error('Failed to reject application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Application">
      <div className="application-reject-modal">
        <div className="form-group">
          <label>Remarks (Required):</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="form-control"
            rows="4"
            placeholder="Enter rejection remarks..."
            required
          />
        </div>

        <div className="modal-actions">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleReject} variant="contained" disabled={loading}>
            {loading ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Renewal Modal for Vendor Creation - Same as Company Registration
const RenewalModal = ({ isOpen, onClose, quotation, onRenewalCreated }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    company_code: '',
    owner_name: '',
    owner_address: '',
    designation: '',
    company_address: '',
    contact_number: '',
    company_email: '',
    gst_number: '',
    pan_number: '',
    firm_type: '',
    nature_of_work: '',
    factory_license_number: '',
    labour_license_number: '',
    type_of_company: '',
    company_website: ''
  });

  const [files, setFiles] = useState({
    gst_document: null,
    pan_document: null
  });

  const [fileNames, setFileNames] = useState({
    gst_document: '',
    pan_document: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quotation && isOpen) {
      // Pre-fill form data from factory quotation
      setFormData({
        company_name: quotation.companyName || '',
        company_code: '',
        owner_name: quotation.companyName || '', // Using company name as owner name
        owner_address: quotation.companyAddress || '',
        designation: '',
        company_address: quotation.companyAddress || '',
        contact_number: quotation.phone || '',
        company_email: quotation.email || '',
        gst_number: '',
        pan_number: '',
        firm_type: '',
        nature_of_work: '',
        factory_license_number: '',
        labour_license_number: '',
        type_of_company: '',
        company_website: ''
      });
    }
  }, [quotation, isOpen]);

  const validateGST = (gst) => {
    // Remove any spaces and convert to uppercase
    gst = gst.replace(/\s/g, "").toUpperCase();
    console.log('Validating GST:', gst);

    // Check length
    if (gst.length !== 15) {
      console.log('GST length invalid:', gst.length);
      return false;
    }

    // Check state code (first 2 digits)
    const stateCode = gst.substring(0, 2);
    if (!/^\d{2}$/.test(stateCode)) {
      console.log('Invalid state code:', stateCode);
      return false;
    }

    // Check PAN number (next 10 characters)
    const panNumber = gst.substring(2, 12);
    if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(panNumber)) {
      console.log('Invalid PAN number:', panNumber);
      return false;
    }

    // Check entity number (13th character)
    const entityNumber = gst.charAt(12);
    if (!/^[0-9A-Z]$/.test(entityNumber)) {
      console.log('Invalid entity number:', entityNumber);
      return false;
    }

    // Check check digit (14th character)
    const checkDigit = gst.charAt(13);
    if (!/^[0-9A-Z]$/.test(checkDigit)) {
      console.log('Invalid check digit:', checkDigit);
      return false;
    }

    // Check last character (must be alphanumeric)
    const lastChar = gst.charAt(14);
    if (!/^[0-9A-Z]$/.test(lastChar)) {
      console.log('Invalid last character:', lastChar);
      return false;
    }

    console.log('GST validation successful');
    return true;
  };

  const handleGSTChange = (e) => {
    let value = e.target.value;
    
    // Remove any non-alphanumeric characters
    value = value.replace(/[^0-9A-Za-z]/g, '');
    
    // Convert to uppercase
    value = value.toUpperCase();
    
    // Limit to 15 characters
    if (value.length > 15) {
      value = value.substring(0, 15);
    }
    
    // Auto-extract PAN from GST (positions 3-12)
    if (value.length >= 12) {
      const panNumber = value.substring(2, 12);
      setFormData(prev => ({
        ...prev,
        gst_number: value,
        pan_number: panNumber
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        gst_number: value
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
        console.log(`[Renewal] File selected for ${type}:`, {
            name: file.name,
            type: file.type,
            size: file.size
        });
        setFiles(prev => ({
            ...prev,
            [type]: file
        }));
        setFileNames(prev => ({
            ...prev,
            [type]: file.name
        }));
    }
  };

  const handlePhoneChange = (value) => {
    console.log('Phone number changed:', value);
    setFormData((prev) => ({
      ...prev,
      contact_number: value || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[RenewalForm] Starting form submission');
    console.log('[RenewalForm] Form data:', formData);

    // Validate required fields
    const requiredFields = [
      'company_name',
      'owner_name',
      'company_address',
      'contact_number',
      'company_email',
      'gst_number',
      'pan_number',
      'firm_type',
      'nature_of_work',
      'type_of_company'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate GST number format
    if (!validateGST(formData.gst_number)) {
      toast.error('Invalid GST number format. Please enter a valid 15-character GST number.');
      return;
    }

    try {
      setLoading(true);

      // First, check if company already exists with this GST number
      let existingCompany = null;
      try {
        const companiesResponse = await companyAPI.getAllCompanies();
        if (companiesResponse.success && companiesResponse.data) {
          existingCompany = companiesResponse.data.find(
            company => company.gst_number === formData.gst_number
          );
          if (existingCompany) {
            console.log('Found existing company with GST:', existingCompany.gst_number);
          }
        }
      } catch (error) {
        console.log('Error checking existing companies:', error);
        // Continue with creating new company if we can't check existing ones
      }

      let companyResponse;

      if (existingCompany) {
        // Company exists, update it instead of creating new one
        console.log('Company with GST number already exists, updating...');
        
        // Create FormData for update
        const updateData = new FormData();
        
        // Append all form fields
        Object.keys(formData).forEach(key => {
          if (key !== 'gst_document' && key !== 'pan_document') {
            const value = formData[key] || '';
            updateData.append(key, value);
            console.log(`Appending ${key}:`, value);
          }
        });

        // Handle file uploads for update
        if (files.gst_document instanceof File) {
          console.log('Appending GST document for update:', {
            name: files.gst_document.name,
            type: files.gst_document.type,
            size: files.gst_document.size
          });
          updateData.append('gst_document', files.gst_document);
        }

        if (files.pan_document instanceof File) {
          console.log('Appending PAN document for update:', {
            name: files.pan_document.name,
            type: files.pan_document.type,
            size: files.pan_document.size
          });
          updateData.append('pan_document', files.pan_document);
        }

        companyResponse = await companyAPI.updateCompany(existingCompany.id, updateData);
        console.log('Company updated:', companyResponse);
      } else {
        // Company doesn't exist, create new one
        console.log('Creating new company...');
        
        // Create FormData for new company
        const submitData = new FormData();

        // Append all form fields
        Object.keys(formData).forEach(key => {
          if (key !== 'gst_document' && key !== 'pan_document') {
            const value = formData[key] || '';
            submitData.append(key, value);
            console.log(`Appending ${key}:`, value);
          }
        });

        // Handle file uploads
        if (files.gst_document instanceof File) {
          console.log('Appending GST document:', {
            name: files.gst_document.name,
            type: files.gst_document.type,
            size: files.gst_document.size
          });
          submitData.append('gst_document', files.gst_document);
        }

        if (files.pan_document instanceof File) {
          console.log('Appending PAN document:', {
            name: files.pan_document.name,
            type: files.pan_document.type,
            size: files.pan_document.size
          });
          submitData.append('pan_document', files.pan_document);
        }

        companyResponse = await companyAPI.createCompany(submitData);
        console.log('Company/Vendor created:', companyResponse);
      }

      if (companyResponse.success) {
        console.log('Form submission successful');
        
        // Update factory quotation status to renewal and link company
        const companyId = existingCompany ? existingCompany.id : companyResponse.data.company_id;
        await factoryQuotationAPI.updateStatus(quotation.id, { 
          status: 'renewal',
          company_id: companyId,
          renewal_date: new Date().toISOString()
        });
        
        const message = existingCompany 
          ? 'Renewal created successfully! Existing company has been updated.'
          : 'Renewal created successfully! New company/Vendor account has been created.';
        
        toast.success(message);
        onRenewalCreated();
        onClose();
      } else {
        throw new Error(companyResponse.message || 'Failed to save company');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('GST number already exists')) {
        toast.error('A company with this GST number already exists. Please use a different GST number or contact support.');
      } else if (error.message && error.message !== 'An error occurred') {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while creating the renewal. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "gst_number") {
      handleGSTChange(e);
    } else if (name === "contact_number") {
      // Ensure contact number is properly formatted
      const formattedNumber = value.replace(/\D/g, ''); // Remove non-digit characters
      setFormData((prev) => ({
        ...prev,
        [name]: formattedNumber,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Renewal - Company Registration">
      <div className="renewal-modal">


        <form onSubmit={handleSubmit} className="vendor-management-form">
          <div className="vendor-management-form-grid">
            <div className="vendor-management-form-group">
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Company Name"
                required
                className="vendor-management-form-input"
              />
            </div>

            <div className="vendor-management-form-group">
              <input
                type="text"
                name="company_code"
                value={formData.company_code}
                onChange={handleChange}
                placeholder="Company Code (e.g., COMP0001)"
                className="vendor-management-form-input"
              />
            </div>

            <div className="vendor-management-form-group">
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                placeholder="Owner Name"
                required
                className="vendor-management-form-input"
              />
            </div>

            <div className="vendor-management-form-group">
              <textarea
                name="owner_address"
                value={formData.owner_address}
                onChange={handleChange}
                placeholder="Owner Address"
                required
                className="vendor-management-form-input"
                rows="3"
              />
            </div>

            <div className="vendor-management-form-group">
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Designation"
                required
                className="vendor-management-form-input"
              />
            </div>

            <div className="vendor-management-form-group">
              <textarea
                name="company_address"
                value={formData.company_address}
                onChange={handleChange}
                placeholder="Company Address"
                required
                className="vendor-management-form-input"
                rows="3"
              />
            </div>

            <div className="vendor-management-form-group">
              <PhoneInput
                international
                defaultCountry="IN"
                value={formData.contact_number}
                onChange={handlePhoneChange}
                placeholder="Enter phone number"
                required
                className="vendor-management-form-input phone-input-custom"
                flags={flags}
                countrySelectProps={{
                  className: "phone-input-country-select"
                }}
              />
            </div>

            <div className="vendor-management-form-group">
              <input
                type="email"
                name="company_email"
                value={formData.company_email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="vendor-management-form-input"
              />
            </div>

            <div className="vendor-management-form-group">
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                placeholder="GST Number (15 digits)"
                required
                className="vendor-management-form-input"
                maxLength={15}
              />
            </div>

            <div className="vendor-management-form-group file-upload-group">
              <label className="file-upload-label">
                <span>GST Certificate</span>
                <div className="file-upload-container">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'gst_document')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="file-upload-input"
                  />
                  <div className="file-upload-button">
                    <BiUpload /> {fileNames.gst_document || 'Upload GST Certificate'}
                  </div>
                </div>
              </label>
            </div>

            <div className="vendor-management-form-group">
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number}
                onChange={handleChange}
                placeholder="PAN Number"
                required
                className="vendor-management-form-input"
                readOnly
              />
            </div>

            <div className="vendor-management-form-group file-upload-group">
              <label className="file-upload-label">
                <span>PAN Card</span>
                <div className="file-upload-container">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'pan_document')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="file-upload-input"
                  />
                  <div className="file-upload-button">
                    <BiUpload /> {fileNames.pan_document || 'Upload PAN Card'}
                  </div>
                </div>
              </label>
            </div>

            <div className="vendor-management-form-group">
              <select
                name="firm_type"
                value={formData.firm_type}
                onChange={handleChange}
                required
                className="vendor-management-form-input"
              >
                <option value="">Select Firm Type</option>
                <option value="Proprietorship">Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="LLP">LLP</option>
                <option value="Private Limited">Private Limited</option>
                <option value="Limited">Limited</option>
                <option value="Trust">Trust</option>
              </select>
            </div>

            <div className="vendor-management-form-group">
              <input
                type="text"
                name="nature_of_work"
                value={formData.nature_of_work}
                onChange={handleChange}
                placeholder="Nature of Work"
                required
                className="vendor-management-form-input"
              />
            </div>

            <div className="vendor-management-form-group">
              <input
                type="text"
                name="factory_license_number"
                value={formData.factory_license_number}
                onChange={handleChange}
                placeholder="Factory License Number"
                className="vendor-management-form-input"
              />
            </div>

            <div className="vendor-management-form-group">
              <input
                type="text"
                name="labour_license_number"
                value={formData.labour_license_number}
                onChange={handleChange}
                placeholder="Labour License Number"
                className="vendor-management-form-input"
              />
            </div>

            <div className="vendor-management-form-group">
              <select
                name="type_of_company"
                value={formData.type_of_company}
                onChange={handleChange}
                required
                className="vendor-management-form-input"
              >
                <option value="">Select Type of Company</option>
                <option value="Industries">Industries</option>
                <option value="Contractor">Contractor</option>
                <option value="School">School</option>
                <option value="Hospital">Hospital</option>
                <option value="Service">Service</option>
              </select>
            </div>

            <div className="vendor-management-form-group">
              <input
                type="url"
                name="company_website"
                value={formData.company_website}
                onChange={handleChange}
                placeholder="Company Website (Optional)"
                className="vendor-management-form-input"
              />
            </div>
          </div>

          <div className="vendor-management-form-actions">
            <Button type="button" variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const FactoryQuotationForm = ({ quotation, onClose, onQuotationUpdated }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    phone: "",
    email: "",
    noOfWorkers: "",
    horsePower: "",
    calculatedAmount: "",
    year: 1,
    stabilityCertificateType: "with load",
    stabilityCertificateAmount: "",
    administrationCharge: "",
    consultancyFees: "",
    planCharge: "",
    totalAmount: "",
    status: "maked",
  });

  const [calculationOptions, setCalculationOptions] = useState({
    horsePowerOptions: [],
    noOfWorkersOptions: []
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load calculation options when component mounts
    const loadCalculationOptions = async () => {
      try {
        const response = await factoryQuotationAPI.getCalculationOptions();
        if (response && response.data) {
          setCalculationOptions(response.data);
        }
      } catch (err) {
        console.error('Error loading calculation options:', err);
      }
    };
    
    loadCalculationOptions();
  }, []);

  useEffect(() => {
    if (quotation) {
      setFormData({
        companyName: quotation.companyName || "",
        companyAddress: quotation.companyAddress || "",
        phone: quotation.phone || "",
        email: quotation.email || "",
        noOfWorkers: quotation.noOfWorkers || "",
        horsePower: quotation.horsePower || "",
        calculatedAmount: quotation.calculatedAmount || "",
        year: quotation.year || 1,
        stabilityCertificateType: quotation.stabilityCertificateType || "with load",
        stabilityCertificateAmount: quotation.stabilityCertificateAmount || "",
        administrationCharge: quotation.administrationCharge || "",
        consultancyFees: quotation.consultancyFees || "",
        planCharge: quotation.planCharge || "",
        totalAmount: quotation.totalAmount || "",
        status: quotation.status || "maked",
      });
    }
  }, [quotation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-calculate when horse power or number of workers changes
    if (name === 'horsePower' || name === 'noOfWorkers') {
      const newHorsePower = name === 'horsePower' ? value : formData.horsePower;
      const newNoOfWorkers = name === 'noOfWorkers' ? value : formData.noOfWorkers;
      
      if (newHorsePower && newNoOfWorkers) {
        calculateAmount(newHorsePower, newNoOfWorkers);
      }
    }
  };

  const calculateAmount = async (horsePower, noOfWorkers) => {
    try {
      const response = await factoryQuotationAPI.calculateAmount(horsePower, noOfWorkers);
      if (response && response.data && response.data.calculatedAmount) {
        setFormData(prev => ({
          ...prev,
          calculatedAmount: response.data.calculatedAmount
        }));
      }
    } catch (err) {
      console.error('Error calculating amount:', err);
    }
  };

  const calculateTotal = () => {
    const calculated = parseFloat(formData.calculatedAmount) || 0;
    const yearMultiplier = parseFloat(formData.year) || 1;
    const stability = parseFloat(formData.stabilityCertificateAmount) || 0;
    const admin = parseFloat(formData.administrationCharge) || 0;
    const consultancy = parseFloat(formData.consultancyFees) || 0;
    const plan = parseFloat(formData.planCharge) || 0;
    
    // Calculate: (calculated amount × year multiplier) + other charges
    return (calculated * yearMultiplier) + stability + admin + consultancy + plan;
  };

  useEffect(() => {
    const total = calculateTotal();
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [formData.calculatedAmount, formData.year, formData.stabilityCertificateAmount, formData.administrationCharge, formData.consultancyFees, formData.planCharge]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("\n=== [Factory Quotation] Form Submit Started ===");
    console.log("Form Values:", formData);

    setLoading(true);
    setError("");

    // Validate required fields
    const requiredFields = {
      companyName: "Company Name",
      companyAddress: "Company Address",
      phone: "Phone",
      email: "Email",
      noOfWorkers: "Number of Workers",
      horsePower: "Horse Power",
      calculatedAmount: "Calculated Amount",
      year: "Year",
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      console.error("[Factory Quotation] Missing required fields:", missingFields);
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      let response;
      if (quotation) {
        console.log("\n[Factory Quotation] Updating quotation:", quotation.id);
        response = await factoryQuotationAPI.updateQuotation(quotation.id, formData);
        toast.success("Factory quotation updated successfully!");
      } else {
        console.log("\n[Factory Quotation] Creating new quotation");
        response = await factoryQuotationAPI.createQuotation(formData);
        toast.success("Factory quotation created successfully!");
      }

      // Generate PDF automatically after creation/update
      if (response && response.data && response.data.id) {
        try {
          await factoryQuotationAPI.generatePDF(response.data.id);
          toast.info("PDF generated successfully!");
        } catch (pdfError) {
          console.error("Error generating PDF:", pdfError);
          toast.warning("Quotation saved but PDF generation failed. You can generate it manually.");
        }
      }

      onQuotationUpdated();
    } catch (err) {
      console.error("\n[Factory Quotation] Error submitting form:", err);
      const errorMessage = err.response?.data?.message || "Failed to save factory quotation";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.log("=== [Factory Quotation] Form Submit Ended ===\n");
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="compliance-form">
        <div className="compliance-form-grid">
          <div className="compliance-form-group">
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Company Name"
              className="compliance-form-input"
              required
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="text"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              placeholder="Company Address"
              className="compliance-form-input"
              required
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="compliance-form-input"
              required
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="compliance-form-input"
              required
            />
          </div>

                    <div className="compliance-form-group">
            <select
              name="noOfWorkers"
              value={formData.noOfWorkers}
              onChange={handleChange}
              className="compliance-form-input"
              required
            >
        <option value="">Select No. of Workers</option>
              {calculationOptions.noOfWorkersOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
          </div>

          <div className="compliance-form-group">
            <select
              name="horsePower"
              value={formData.horsePower}
              onChange={handleChange}
              className="compliance-form-input"
              required
            >
        <option value="">Select Horse Power</option>
              {calculationOptions.horsePowerOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="calculatedAmount"
              value={formData.calculatedAmount}
              onChange={handleChange}
              placeholder="Calculated Amount (Auto-calculated)"
              className="compliance-form-input"
              required
              min="0"
              step="0.01"
              readOnly
            />
            <small className="text-gray-600 text-xs mt-1">
              Auto-calculated based on Horse Power and Number of Workers
            </small>
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="Number of Years (1, 2, 3...)"
              className="compliance-form-input"
              required
              min="1"
              max="10"
            />
            <small className="text-gray-600 text-xs mt-1">
              Number of years to multiply with calculated amount
            </small>
          </div>

          <div className="compliance-form-group">
            <select
              name="stabilityCertificateType"
              value={formData.stabilityCertificateType}
              onChange={handleChange}
              className="compliance-form-input"
              required
            >
        <option value="with load">With Load</option>
        <option value="without load">Without Load</option>
      </select>
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="stabilityCertificateAmount"
              value={formData.stabilityCertificateAmount}
              onChange={handleChange}
              placeholder="Stability Certificate Amount"
              className="compliance-form-input"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="administrationCharge"
              value={formData.administrationCharge}
              onChange={handleChange}
              placeholder="Administration Charge"
              className="compliance-form-input"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="consultancyFees"
              value={formData.consultancyFees}
              onChange={handleChange}
              placeholder="Consultancy Fees"
              className="compliance-form-input"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="planCharge"
              value={formData.planCharge}
              onChange={handleChange}
              placeholder="Plan Charge"
              className="compliance-form-input"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              className="compliance-form-input"
              placeholder="Total Amount"
              readOnly
            />
          </div>

          <div className="compliance-form-group">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="compliance-form-input"
              required
            >
        {["maked", "approved", "plan", "stability", "application", "renewal"].map((opt) => (
          <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
        ))}
      </select>
          </div>
        </div>

        {error && (
          <div className="compliance-form-error">
            <BiErrorCircle className="inline mr-2" /> {error}
          </div>
        )}

        <div className="compliance-form-actions">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {quotation ? "Update" : "Create"}
          </Button>
      </div>
    </form>
    </>
  );
};

function FactoryQuotation({ searchQuery = "" }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [showPlanManagerModal, setShowPlanManagerModal] = useState(false);
  const [showStabilityManagerModal, setShowStabilityManagerModal] = useState(false);
  const [showStabilityModal, setShowStabilityModal] = useState(false);
  const [showStabilityRejectModal, setShowStabilityRejectModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showApplicationRejectModal, setShowApplicationRejectModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);

  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const { user, userRoles } = useAuth();
  const isAdmin = userRoles.includes("admin");
  const isComplianceManager = userRoles.includes("compliance_manager");
  const canEdit = isAdmin || isComplianceManager;

  useEffect(() => {
    console.log("Factory Quotation component mounted");
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await factoryQuotationAPI.getAllQuotations();
        console.log("Factory Quotation API response:", response);

        if (response && response.data && Array.isArray(response.data)) {
          setQuotations(response.data);
          setError(null);
        } else if (response && Array.isArray(response)) {
          setQuotations(response);
          setError(null);
        } else {
          setError("Invalid data format received from server");
          setQuotations([]);
        }
      } catch (err) {
        console.error("Error fetching factory quotations:", err);
        setError("Failed to fetch factory quotations");
        setQuotations([]);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    if (searchQuery && searchQuery.trim() !== "") {
      handleSearchQuotations(searchQuery);
    } else {
      fetchData();
    }
  }, [searchQuery]);

  const handleSearchQuotations = async (query) => {
    try {
      console.log("Searching factory quotations with query:", query);
      setLoading(true);
      // Note: Backend doesn't have search endpoint yet, so we'll filter client-side
      const response = await factoryQuotationAPI.getAllQuotations();
      
      if (response && response.data && Array.isArray(response.data)) {
        const filtered = response.data.filter(quotation => 
          quotation.companyName?.toLowerCase().includes(query.toLowerCase()) ||
          quotation.email?.toLowerCase().includes(query.toLowerCase()) ||
          quotation.phone?.includes(query)
        );
        setQuotations(filtered);
        setError(null);
      } else {
        setError("Invalid data format received from server");
        setQuotations([]);
      }
    } catch (err) {
      console.error("Error searching factory quotations:", err);
      setError("Failed to search factory quotations");
      setQuotations([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const fetchQuotations = async () => {
    try {
      console.log("Fetching factory quotations...");
      setLoading(true);
      const response = await factoryQuotationAPI.getAllQuotations();
      console.log("Factory Quotation API response:", response);

      if (response && response.data && Array.isArray(response.data)) {
        setQuotations(response.data);
      setError(null);
      } else {
        console.error("Invalid response format:", response);
        setError("Invalid data format received from server");
        setQuotations([]);
      }
    } catch (err) {
      console.error("Error fetching factory quotations:", err);
      setError("Failed to fetch factory quotations");
      setQuotations([]);
    } finally {
      setTimeout(() => {
      setLoading(false);
      }, 2000);
    }
  };



  const handleEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setShowModal(true);
  };

  const handleModalClose = () => {
    console.log("Modal closing");
    setSelectedQuotation(null);
    setShowModal(false);
  };

  const handleQuotationUpdated = async () => {
    console.log("Factory quotation updated, refreshing list");
    await fetchQuotations();
    handleModalClose();
  };

  const handleStatusChange = async (quotationId, newStatus) => {
    try {
      if (newStatus === 'plan') {
        // Show plan manager selection modal
        const quotation = quotations.find(q => q.id === quotationId);
        setSelectedQuotation(quotation);
        setShowPlanManagerModal(true);
        return;
      }

      if (newStatus === 'stability') {
        // Show stability manager selection modal
        const quotation = quotations.find(q => q.id === quotationId);
        setSelectedQuotation(quotation);
        setShowStabilityManagerModal(true);
        return;
      }

      if (newStatus === 'application') {
        // Application status is handled automatically in the backend
        // No need to show manual selection modal
        const response = await factoryQuotationAPI.updateStatus(quotationId, { status: newStatus });
        if (response.success) {
          toast.success(`Status updated to ${newStatus} successfully`);
          await fetchQuotations();
        }
        return;
      }

      if (newStatus === 'renewal') {
        // Show renewal modal
        const quotation = quotations.find(q => q.id === quotationId);
        setSelectedQuotation(quotation);
        setShowRenewalModal(true);
        return;
      }

      const response = await factoryQuotationAPI.updateStatus(quotationId, { status: newStatus });
      if (response.success) {
        toast.success(`Status updated to ${newStatus} successfully`);
        await fetchQuotations();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handlePlanManagerSelect = async (planManagerId) => {
    try {
      const response = await planManagementAPI.createPlanManagement({
        factory_quotation_id: selectedQuotation.id,
        plan_manager_id: planManagerId
      });
      
      if (response.success) {
        toast.success('Plan manager assigned successfully');
        await fetchQuotations();
      }
    } catch (error) {
      toast.error('Failed to assign plan manager');
    }
  };

  const handleStabilityManagerSelect = async (stabilityManagerId, loadType) => {
    try {
      const response = await stabilityManagementAPI.createStabilityManagement({
        factory_quotation_id: selectedQuotation.id,
        stability_manager_id: stabilityManagerId,
        load_type: loadType
      });
      
      if (response.success) {
        toast.success('Stability manager assigned successfully');
        await fetchQuotations();
      }
    } catch (error) {
      toast.error('Failed to assign stability manager');
    }
  };

  // Handle stability status change
  const handleStabilityStatusChange = async (stabilityId, newStatus, stabilityDate) => {
    try {
      const updateData = { status: newStatus };
      
      if (newStatus === 'Approved' && stabilityDate) {
        updateData.stability_date = stabilityDate;
      }

      const response = await stabilityManagementAPI.updateStabilityStatus(stabilityId, updateData);
      if (response.success) {
        toast.success('Stability status updated successfully');
        await fetchQuotations();
      }
    } catch (error) {
      toast.error('Failed to update stability status');
    }
  };

  // Handle stability file upload
  const handleStabilityFileUpload = async (stabilityId, files, stabilityDate) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // First update status with date
      await stabilityManagementAPI.updateStabilityStatus(stabilityId, {
        status: 'Approved',
        stability_date: stabilityDate
      });

      // Then upload files
      const response = await stabilityManagementAPI.uploadStabilityFiles(stabilityId, formData);
      if (response.success) {
        toast.success('Files uploaded and stability approved successfully');
        await fetchQuotations();
      }
    } catch (error) {
      toast.error('Failed to upload stability files');
    }
  };



  // Handle application status change
  const handleApplicationStatusChange = async (applicationId, newStatus, applicationDate, expiryDate, remarks) => {
    try {
      const updateData = { status: newStatus };
      
      if (newStatus === 'Approved' && applicationDate) {
        updateData.application_date = applicationDate;
        if (expiryDate) {
          updateData.expiry_date = expiryDate;
        }
      }
      
      if (newStatus === 'Reject' && remarks) {
        updateData.remarks = remarks;
      }

      const response = await applicationManagementAPI.updateApplicationStatus(applicationId, updateData);
      if (response.success) {
        toast.success('Application status updated successfully');
        await fetchQuotations();
      }
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  // Handle application file upload
  const handleApplicationFileUpload = async (applicationId, files, applicationDate, expiryDate) => {
    try {
      // First update status with dates
      await applicationManagementAPI.updateApplicationStatus(applicationId, {
        status: 'Approved',
        application_date: applicationDate,
        expiry_date: expiryDate
      });

      // Then upload files if any were selected
      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });

        const response = await applicationManagementAPI.uploadApplicationFiles(applicationId, formData);
        if (response.success) {
          toast.success('Files uploaded and application approved successfully');
          await fetchQuotations();
        }
      } else {
        // No files selected, just approve the application
        toast.success('Application approved successfully');
        await fetchQuotations();
      }
    } catch (error) {
      console.error('Error in application file upload:', error);
      toast.error('Failed to process application approval');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'maked':
        return 'status-badge-maked';
      case 'approved':
      case 'Approved':
        return 'status-badge-approved';
      case 'plan':
        return 'status-badge-plan';
      case 'stability':
        return 'status-badge-stability';
      case 'application':
        return 'status-badge-application';
      case 'renewal':
        return 'status-badge-renewal';
      case 'submit':
        return 'status-badge-submit';
      case 'reject':
      case 'Reject':
        return 'status-badge-reject';
      default:
        return 'status-badge-maked';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const columns = [
    {
      key: "sr_no",
      label: "Sr No.",
      sortable: true,
      render: (_, __, index) => index + 1,
    },
    {
      key: "companyName",
      label: "Company Name",
      sortable: true,
      render: (_, quotation) => quotation.companyName || "-",
    },
    {
      key: "companyAddress",
      label: "Address",
      sortable: true,
      render: (_, quotation) => quotation.companyAddress || "-",
    },
    {
      key: "contact",
      label: "Contact Details",
      sortable: true,
      render: (_, quotation) => (
        <div>
          <div>{quotation.phone || "-"}</div>
          <div className="text-sm text-gray-600">{quotation.email || "-"}</div>
        </div>
      ),
    },
    {
      key: "workers",
      label: "Workers",
      sortable: true,
      render: (_, quotation) => quotation.noOfWorkers || "-",
    },
    {
      key: "horsePower",
      label: "Horse Power",
      sortable: true,
      render: (_, quotation) => quotation.horsePower || "-",
    },
    {
      key: "calculatedAmount",
      label: "Base Amount",
      sortable: true,
      render: (_, quotation) => `₹${quotation.calculatedAmount?.toLocaleString() || "0"}`,
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      sortable: true,
      render: (_, quotation) => `₹${quotation.totalAmount?.toLocaleString() || "0"}`,
    },
    {
      key: "year",
      label: "Years",
      sortable: true,
      render: (_, quotation) => `${quotation.year || 1} year${quotation.year > 1 ? 's' : ''}`,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_, quotation) => {
        const statusClass =
          quotation.status === "approved"
            ? "status-badge-approved"
            : quotation.status === "maked"
            ? "status-badge-maked"
            : quotation.status === "plan"
            ? "status-badge-plan"
            : quotation.status === "stability"
            ? "status-badge-stability"
            : quotation.status === "application"
            ? "status-badge-application"
            : quotation.status === "renewal"
            ? "status-badge-renewal"
            : "status-badge-maked";
        return canEdit ? (
          <select
            value={quotation.status || "maked"}
            onChange={(e) => handleStatusChange(quotation.id, e.target.value)}
            className={`status-badge-dropdown ${statusClass}`}
          >
            <option value="maked">Maked</option>
            <option value="approved">Approved</option>
            <option value="plan">Plan</option>
            <option value="stability">Stability</option>
            <option value="application">Application</option>
            <option value="renewal">Renewal</option>
          </select>
        ) : (
          <span className={`status-badge-dropdown ${statusClass}`}>{
            quotation.status?.charAt(0).toUpperCase() + quotation.status?.slice(1) || "-"
          }</span>
        );
      },
    },
    {
      key: "planStatus",
      label: "Plan Status",
      sortable: true,
      render: (_, quotation) => {
        const planStatus = quotation.planManagement?.status;
        if (!planStatus) {
          return "-";
        }
        
        const planStatusClass = 
          planStatus === 'plan' ? 'status-badge-plan' :
          planStatus === 'submit' ? 'status-badge-submit' :
          planStatus === 'Approved' ? 'status-badge-approved' :
          planStatus === 'Reject' ? 'status-badge-reject' :
          'status-badge-maked';
        
        return (
          <span className={`status-badge-dropdown ${planStatusClass}`}>
            {planStatus}
          </span>
        );
      },
    },
    {
      key: "stabilityStatus",
      label: "Stability Status",
      sortable: true,
      render: (_, quotation) => {
        const stabilityStatus = quotation.stabilityManagement?.status;
        if (!stabilityStatus) {
          return "-";
        }
        
        const stabilityStatusClass = 
          stabilityStatus === 'stability' ? 'status-badge-stability' :
          stabilityStatus === 'submit' ? 'status-badge-submit' :
          stabilityStatus === 'Approved' ? 'status-badge-approved' :
          stabilityStatus === 'Reject' ? 'status-badge-reject' :
          'status-badge-maked';
        
        return (
          <span className={`status-badge-dropdown ${stabilityStatusClass}`}>
            {stabilityStatus}
          </span>
        );
      },
    },
    {
      key: "applicationStatus",
      label: "Application Status",
      sortable: true,
      render: (_, quotation) => {
        const applicationRecord = quotation.applicationManagement;
        if (!applicationRecord) {
          return <span className="status-badge status-badge-not-assigned">Not Assigned</span>;
        }
        
        // If user is compliance manager, show interactive dropdown
        if (userRoles.includes("compliance_manager") || userRoles.includes("admin")) {
          return (
            <div className="application-status-container">
              <select
                value={applicationRecord.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  if (newStatus === 'Approved') {
                    // Show modal for dates and files
                    setSelectedQuotation(quotation);
                    setShowApplicationModal(true);
                  } else if (newStatus === 'Reject') {
                    // Show reject modal
                    setSelectedQuotation(quotation);
                    setShowApplicationRejectModal(true);
                  } else {
                    // Direct status update
                    handleApplicationStatusChange(applicationRecord.id, newStatus);
                  }
                }}
                className={`status-badge-dropdown ${getStatusBadgeClass(applicationRecord.status)}`}
              >
                <option value="application">Application</option>
                <option value="submit">Submit</option>
                <option value="Approved">Approved</option>
                <option value="Reject">Reject</option>
              </select>
              
              {/* Dates removed as requested */}
              

            </div>
          );
        }
        
        // For other users, show read-only status
        return (
          <div>
            <span className={`status-badge ${getStatusBadgeClass(applicationRecord.status)}`}>
              {applicationRecord.status}
            </span>
            {/* Dates removed as requested */}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, quotation) => (
        <div className="insurance-actions">
          <ActionButton
            onClick={() => handleEdit(quotation)}
            variant="secondary"
            size="small"
            disabled={!canEdit}
          >
            <BiEdit />
          </ActionButton>
          <ActionButton
            onClick={() => handleDownloadQuotation(quotation)}
            variant="secondary"
            size="small"
            title="Download PDF"
          >
            <BiFile />
          </ActionButton>

          

        </div>
      ),
    },
  ];

  const filteredQuotations = React.useMemo(() => {
    let filtered = quotations;
    
    // Filter out renewal records (they will be managed in separate page)
    filtered = filtered.filter((q) => q.status !== 'renewal');
    
    // Apply status filtering
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }
    
    return filtered;
  }, [quotations, statusFilter]);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "maked", label: "Maked" },
    { value: "approved", label: "Approved" },
    { value: "plan", label: "Plan" },
    { value: "stability", label: "Stability" },
    { value: "application", label: "Application" },
  ];

  const handleDownloadQuotation = async (quotation) => {
    try {
      // Always generate a new PDF
      toast.info('Generating PDF...');
      await factoryQuotationAPI.generatePDF(quotation.id);
      
      // Download the PDF
      const blob = await factoryQuotationAPI.downloadPDF(quotation.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factory_quotation_${quotation.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Factory quotation downloaded successfully!');
    } catch (error) {
      console.error('Error downloading quotation:', error);
      toast.error('Failed to download factory quotation. Please try again.');
    }
  };

  return (
    <div className="compliance-container">
      <div className="compliance-content">
      <div className="compliance-header">
        <h1 className="compliance-title">Factory Quotation</h1>
          <div className="list-container">
        {canEdit && (
              <Button
                variant="contained"
                onClick={() => setShowModal(true)}
                icon={<BiPlus />}
              >
            Add Quotation
          </Button>
        )}
            <div className="dashboard-header-dropdown-container">
              <Dropdown
                options={statusOptions}
                value={statusOptions.find((opt) => opt.value === statusFilter)}
                onChange={(option) =>
                  setStatusFilter(option ? option.value : "all")
                }
                placeholder="Filter by Status"
              />
            </div>
          </div>
      </div>

      {error && (
        <div className="compliance-error">
          <BiErrorCircle className="inline mr-2" /> {error}
        </div>
      )}

      {loading ? (
        <Loader size="large" color="primary" />
      ) : (
          <TableWithControl
            data={filteredQuotations}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedQuotation ? "Edit Factory Quotation" : "Add New Factory Quotation"}
      >
        <FactoryQuotationForm
          quotation={selectedQuotation}
          onClose={handleModalClose}
          onQuotationUpdated={handleQuotationUpdated}
        />
      </Modal>
      <PlanManagerSelectionModal
        isOpen={showPlanManagerModal}
        onClose={() => setShowPlanManagerModal(false)}
        onSelect={handlePlanManagerSelect}
        quotation={selectedQuotation}
      />
      <StabilityManagerSelectionModal
        isOpen={showStabilityManagerModal}
        onClose={() => setShowStabilityManagerModal(false)}
        onSelect={handleStabilityManagerSelect}
        quotation={selectedQuotation}
      />

      {/* Application Modals */}
      <ApplicationApprovalModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onApprove={(files, applicationDate, expiryDate) => 
          handleApplicationFileUpload(selectedQuotation?.applicationManagement?.id, files, applicationDate, expiryDate)
        }
        currentApplication={selectedQuotation?.applicationManagement}
      />
      
      <ApplicationRejectModal
        isOpen={showApplicationRejectModal}
        onClose={() => setShowApplicationRejectModal(false)}
        onReject={(remarks) => 
          handleApplicationStatusChange(selectedQuotation?.applicationManagement?.id, 'Reject', null, null, remarks)
        }
      />

      {/* Renewal Modal */}
      <RenewalModal
        isOpen={showRenewalModal}
        onClose={() => setShowRenewalModal(false)}
        quotation={selectedQuotation}
        onRenewalCreated={handleQuotationUpdated}
      />

    </div>
  );
}

export default FactoryQuotation;
