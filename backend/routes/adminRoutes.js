const express = require('express');
const router = express.Router();
const Admin = require('../models/adminModel');
const { route } = require('./testRoute');


router.get('/', (req, res) => {
  res.json({ message: 'Admin Route is running ' });
});

router.post('/create-admin', async (req, res) => {
  const { name, email, mobileNumber, password, role } = req.body;

  try {
    // Check if the required fields are provided
    if (!name || !email || !password || !mobileNumber) {
      return res.status(400).json({ message: 'Name, email, mobile number, and password are required' });
    }

    // Check if the email is already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    // Check if the mobile number is already registered
    const existingMobile = await Admin.findOne({ mobileNumber });
    if (existingMobile) {
      return res.status(400).json({ message: 'Mobile number is already taken' });
    }

    // Validate mobile number format (optional, based on your requirements)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(mobileNumber)) {
      return res.status(400).json({ message: 'Mobile number must be 10 digits' });
    }

    // Create a new admin
    const newAdmin = new Admin({
      name,
      email,
      mobileNumber,
      password, // Store the password as is
      role: role || 'admin', // Default to 'admin' if no role is provided
    });

    // Save the admin to the database
    await newAdmin.save();

    // Respond with success
    return res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        name: newAdmin.name,
        email: newAdmin.email,
        mobileNumber: newAdmin.mobileNumber,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt,
        updatedAt: newAdmin.updatedAt,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});



// Export the router
module.exports = router;
