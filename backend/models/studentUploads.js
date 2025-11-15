const mongoose = require('mongoose');

// Define the StudentUpload schema
const studentUploadSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'Student',  
    
  },
  description: {
    type: String,
    trim: true,  
  },
  file: {
    data: Buffer,  
    contentType: String,  
   
  },
}, { timestamps: true });


const StudentUpload = mongoose.model('StudentUpload', studentUploadSchema);

module.exports = StudentUpload;
