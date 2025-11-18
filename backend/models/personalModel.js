const mongoose = require('mongoose');

const personalSchema = new mongoose.Schema({
  file: {
    data: Buffer,          // file stored as binary
    contentType: String    // MIME type of the file
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Teacher'         // reference to Teacher model
  }
}, { timestamps: true });

const Personal = mongoose.model('Personal', personalSchema);

module.exports = Personal;
