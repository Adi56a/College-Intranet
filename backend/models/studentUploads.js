const mongoose = require('mongoose');

// Define the StudentUpload schema
const studentUploadSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'Student',  
    required: true
  },
  description: {
    type: String,
    trim: true,
  },
  file: {
    data: {
      type: Buffer,
      required: true
    },
    contentType: {
      type: String,
      required: true
    }
  },
  subject: {
    type: String,
    trim: true,
    required: true // Set to true if mandatory
  },
  ipAddress: {
    type: String,
    trim: true
    // Do not set required if you want to accept uploads without IP (fallback possible)
  }
}, { timestamps: true });

const StudentUpload = mongoose.model('StudentUpload', studentUploadSchema);

module.exports = StudentUpload;
