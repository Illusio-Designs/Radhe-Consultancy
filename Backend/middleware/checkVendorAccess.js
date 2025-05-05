const checkVendorAccess = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Normalize role names
    const normalizedRoleName = user.Role.role_name.charAt(0).toUpperCase() + user.Role.role_name.slice(1).toLowerCase();

    // Admin and Vendor_manager have full access
    if (normalizedRoleName === 'Admin' || normalizedRoleName === 'Vendor_manager') {
      return next();
    }

    // For other roles, check if they are associated with the vendor
    const vendorId = req.params.vendorId || req.body.vendor_id;
    if (!vendorId) {
      return res.status(400).json({ error: 'Vendor ID is required' });
    }

    const vendor = await Vendor.findByPk(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check if user is associated with the vendor
    const hasAccess = await VendorUser.findOne({
      where: {
        vendor_id: vendorId,
        user_id: user.user_id
      }
    });

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied: insufficient vendor permissions' });
    }

    next();
  } catch (error) {
    console.error('Vendor access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 