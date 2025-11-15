const mongoose = require('mongoose');

// Define the schema for the Admin model with timestamps enabled
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    unique: true,
    trim: true,
   
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['hod', 'admin', 'student'],
    default: 'admin'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create the Admin model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
