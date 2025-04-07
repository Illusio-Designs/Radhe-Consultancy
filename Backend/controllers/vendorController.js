const vendorService = require('../services/vendorService');

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
      const vendor = await vendorService.createCompanyVendor(req.body);
      res.status(201).json(vendor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new VendorController(); 