const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  driveUrl: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
