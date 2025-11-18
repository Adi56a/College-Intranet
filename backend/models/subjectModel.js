const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subject: {
    type: [String],      // Array of strings
    required: true,      // At least one subject required
    validate: arr => arr.length > 0 // Ensure array is not empty
  }
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
