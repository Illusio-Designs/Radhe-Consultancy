const { Vendor, CompanyVendor, ConsumerVendor } = require('../models');
const { OAuth2Client } = require('google-auth-library');
const { isValidEmail, isValidPhoneNumber } = require('../utils/helperFunctions');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class VendorService {
  // Create new vendor (company or consumer)
  async createVendor(vendorData) {
    const { vendor_type, ...details } = vendorData;

    // Create base vendor record
    const vendor = await Vendor.create({ vendor_type });

    // Create specific vendor type record
    if (vendor_type === 'Company') {
      if (!isValidEmail(details.company_email)) {
        throw new Error('Invalid company email');
      }
      if (!isValidPhoneNumber(details.contact_number)) {
        throw new Error('Invalid contact number');
      }
      await CompanyVendor.create({
        ...details,
        vendor_id: vendor.vendor_id
      });
    } else if (vendor_type === 'Consumer') {
      await ConsumerVendor.create({
        ...details,
        vendor_id: vendor.vendor_id
      });
    }

    return this.getVendorById(vendor.vendor_id);
  }

  // Get vendor by ID
  async getVendorById(vendorId) {
    const vendor = await Vendor.findByPk(vendorId, {
      include: [
        {
          model: CompanyVendor,
          required: false
        },
        {
          model: ConsumerVendor,
          required: false
        }
      ]
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    return vendor;
  }

  // Get all vendors
  async getAllVendors() {
    return Vendor.findAll({
      include: [
        { model: CompanyVendor },
        { model: ConsumerVendor }
      ]
    });
  }

  // Update vendor
  async updateVendor(vendorId, vendorData) {
    const vendor = await Vendor.findByPk(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const { vendor_type, ...details } = vendorData;

    if (vendor_type && vendor_type !== vendor.vendor_type) {
      throw new Error('Cannot change vendor type');
    }

    if (vendor.vendor_type === 'Company') {
      if (details.company_email && !isValidEmail(details.company_email)) {
        throw new Error('Invalid company email');
      }
      if (details.contact_number && !isValidPhoneNumber(details.contact_number)) {
        throw new Error('Invalid contact number');
      }
      await CompanyVendor.update(details, {
        where: { vendor_id: vendorId }
      });
    } else {
      await ConsumerVendor.update(details, {
        where: { vendor_id: vendorId }
      });
    }

    return this.getVendorById(vendorId);
  }

  // Delete vendor
  async deleteVendor(vendorId) {
    const vendor = await Vendor.findByPk(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    if (vendor.vendor_type === 'Company') {
      await CompanyVendor.destroy({
        where: { vendor_id: vendorId }
      });
    } else {
      await ConsumerVendor.destroy({
        where: { vendor_id: vendorId }
      });
    }

    await vendor.destroy();
  }

  // Google login for vendors
  async googleLogin(token) {
    try {
      console.log('Verifying Google token...');
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      console.log('Google payload:', payload);

      let vendor = await Vendor.findOne({
        where: { google_id: payload.sub }
      });

      if (!vendor) {
        console.log('Creating new vendor...');
        // Create new vendor
        vendor = await Vendor.create({
          vendor_type: 'Consumer',
          google_id: payload.sub
        });
        console.log('Created vendor:', vendor.toJSON());

        console.log('Creating consumer vendor details...');
        // Create consumer vendor details with Google information
        const consumerVendor = await ConsumerVendor.create({
          vendor_id: vendor.vendor_id,
          email: payload.email,
          name: payload.name,
          profile_image: payload.picture,
          phone_number: payload.phone_number || 'Not provided',
          dob: new Date(), // Default to current date
          gender: 'Not Specified',
          national_id: `GOOGLE_${payload.sub}`,
          contact_address: 'Address not provided'
        });
        console.log('Created consumer vendor:', consumerVendor.toJSON());
      } else {
        console.log('Found existing vendor:', vendor.toJSON());
        
        // Update ConsumerVendor with Google information
        const consumerVendor = await ConsumerVendor.findOne({
          where: { vendor_id: vendor.vendor_id }
        });
        
        if (consumerVendor) {
          console.log('Updating consumer vendor with Google information...');
          await consumerVendor.update({
            email: payload.email,
            name: payload.name,
            profile_image: payload.picture,
            phone_number: payload.phone_number || consumerVendor.phone_number
          });
          console.log('Updated consumer vendor:', consumerVendor.toJSON());
        }
      }

      // Fetch the complete vendor with associations
      const completeVendor = await Vendor.findByPk(vendor.vendor_id, {
        include: [
          {
            model: CompanyVendor,
            required: false
          },
          {
            model: ConsumerVendor,
            required: false
          }
        ]
      });
      console.log('Complete vendor data:', completeVendor.toJSON());

      return completeVendor;
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Invalid Google token');
    }
  }
}

module.exports = new VendorService(); 