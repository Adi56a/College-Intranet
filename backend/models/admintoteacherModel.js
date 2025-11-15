const mongoose = require('mongoose');

// Define the AdminToTeacher schema
const adminToTeacherSchema = new mongoose.Schema({
  description: {
    type: String,
      // Ensures that description is always provided
    trim: true,      // Removes extra spaces
  },
  file: {
    data: Buffer,  // The file data will be stored as a binary buffer
    contentType: String,  // The type of the file (e.g., 'application/pdf', 'image/jpeg', etc.)
      // The file is mandatory
  },
}, { timestamps: true });  // Adds createdAt and updatedAt fields automatically

// Create the model using the schema
const AdminToTeacher = mongoose.model('AdminToTeacher', adminToTeacherSchema);

module.exports = AdminToTeacher;
