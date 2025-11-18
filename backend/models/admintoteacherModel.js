const mongoose = require('mongoose');

const adminToTeacherSchema = new mongoose.Schema({
  description: {
    type: String,
    trim: true,
    required: true,
  },
  file: {
    data: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    }
  },
  notice_type: {
    type: String,
    enum: ['attendance', 'holiday', 'exam', 'placement', 'general'],
    default: 'general',
    required: true
  },
}, { timestamps: true });

const AdminToTeacher = mongoose.model('AdminToTeacher', adminToTeacherSchema);

module.exports = AdminToTeacher;
