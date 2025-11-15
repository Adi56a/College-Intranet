const mongoose = require('mongoose');

// Define the schema for the Student model
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: String,
    
    unique: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // uploadID is now an array to store multiple ObjectIds
  uploadID: [{
    type: mongoose.Schema.Types.ObjectId,  // Array of ObjectIds referencing StudentUpload model
    ref: 'StudentUpload',  // This links to the 'StudentUpload' model
    default: []  // Default is an empty array if no uploads exist for the student
  }]
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create the Student model
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
