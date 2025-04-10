const vendorService = require('../services/vendorService');
const { Vendor, Company, Consumer, User, UserType } = require('../models');

class VendorController {
  async createCompany(req, res) {
    try {
      const { email, companyData } = req.body;
      
      // Verify user exists and is Office type
      const user = await User.findOne({ 
        where: { email },
        include: [UserType]
      });

      if (!user || user.UserType.type_name !== 'Office') {
        return res.status(403).json({ error: 'Only Office users can create companies' });
      }

      // Create vendor and company
      const vendor = await Vendor.create({ vendor_type: 'Company' });
      const company = await Company.create({
        vendor_id: vendor.vendor_id,
        ...companyData
      });

      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createConsumer(req, res) {
    try {
      const { email, consumerData } = req.body;
      
      // Verify user exists and is Office type
      const user = await User.findOne({ 
        where: { email },
        include: [UserType]
      });

      if (!user || user.UserType.type_name !== 'Office') {
        return res.status(403).json({ error: 'Only Office users can create consumers' });
      }

      // Create vendor and consumer
      const vendor = await Vendor.create({ vendor_type: 'Consumer' });
      const consumer = await Consumer.create({
        vendor_id: vendor.vendor_id,
        ...consumerData
      });

      res.status(201).json(consumer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  // Create new vendor (company or consumer)
  async createVendor(req, res) {
    try {
      const vendor = await vendorService.createVendor(req.body);
      res.status(201).json(vendor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get vendor by ID
  async getVendorById(req, res) {
    try {
      const vendor = await vendorService.getVendorById(req.params.vendorId);
      res.json(vendor);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Get all vendors
  async getAllVendors(req, res) {
    try {
      const vendors = await vendorService.getAllVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update vendor
  async updateVendor(req, res) {
    try {
      const vendor = await vendorService.updateVendor(req.params.vendorId, req.body);
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete vendor
  async deleteVendor(req, res) {
    try {
      await vendorService.deleteVendor(req.params.vendorId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Google login for vendors
  async googleLogin(req, res) {
    try {
      const { token } = req.body;
      const vendor = await vendorService.googleLogin(token);
      res.json(vendor);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  // Create new company vendor
  async createCompanyVendor(req, res) {
    try {
      const { vendor_id, company_name, owner_name, company_address, gst_number, pan_number, company_email, company_website, contact_number, firm_type } = req.body;

      // Check if the role exists
      const role = await Role.findOne({ where: { role_name: 'Vendor Manager' } });
      if (!role) {
        return res.status(400).json({ error: 'Role not found' });
      }

      // Create the vendor
      const vendor = await Vendor.create({ vendor_type: 'Company', google_id: vendor_id });
      const companyVendor = await CompanyVendor.create({
        vendor_id: vendor.vendor_id,
        company_name,
        owner_name,
        company_address,
        gst_number,
        pan_number,
        company_email,
        company_website,
        contact_number,
        firm_type
      });

      res.status(201).json(companyVendor);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new consumer vendor
  async createConsumerVendor(req, res) {
    try {
      const { vendor_id, email, name, profile_image, phone_number, dob, gender, national_id, contact_address } = req.body;

      // Check if the role exists
      const role = await Role.findOne({ where: { role_name: 'Vendor Manager' } });
      if (!role) {
        return res.status(400).json({ error: 'Role not found' });
      }

      // Create the vendor
      const vendor = await Vendor.create({ vendor_type: 'Consumer', google_id: vendor_id });
      const consumerVendor = await ConsumerVendor.create({
        vendor_id: vendor.vendor_id,
        email,
        name,
        profile_image,
        phone_number,
        dob,
        gender,
        national_id,
        contact_address
      });

      res.status(201).json(consumerVendor);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new VendorController();