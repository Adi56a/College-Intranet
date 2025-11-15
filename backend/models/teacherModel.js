const mongoose = require('mongoose');

// Define the schema for the Teacher model
const teacherSchema = new mongoose.Schema({
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
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  post: {
    type: String,
    required: true
  },
  qualification: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  joiningDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create the Teacher model
const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
