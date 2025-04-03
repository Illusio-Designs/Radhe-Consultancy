const { sequelize } = require('../models');
const { Vendor, ConsumerVendor } = require('../models');

async function fixConsumerVendors() {
  try {
    console.log('Starting to fix ConsumerVendor records...');
    
    // Find all Consumer type vendors without ConsumerVendor records
    const vendors = await Vendor.findAll({
      where: { vendor_type: 'Consumer' },
      include: [{
        model: ConsumerVendor,
        required: false
      }]
    });

    console.log(`Found ${vendors.length} Consumer vendors`);

    for (const vendor of vendors) {
      if (!vendor.ConsumerVendor) {
        console.log(`Creating ConsumerVendor record for vendor ${vendor.vendor_id}`);
        
        // Create ConsumerVendor record with default values
        await ConsumerVendor.create({
          vendor_id: vendor.vendor_id,
          email: 'Not provided',
          name: 'Not provided',
          profile_image: null,
          phone_number: 'Not provided',
          dob: new Date(),
          gender: 'Not Specified',
          national_id: `VENDOR_${vendor.vendor_id}`,
          contact_address: 'Address not provided'
        });
        
        console.log(`Created ConsumerVendor record for vendor ${vendor.vendor_id}`);
      }
    }

    console.log('Finished fixing ConsumerVendor records');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing ConsumerVendor records:', error);
    process.exit(1);
  }
}

fixConsumerVendors(); 