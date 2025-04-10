const vendorService = require('../services/vendorService');
const { Vendor, CompanyVendor, ConsumerVendor, Role } = require('../models');

class VendorController {
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