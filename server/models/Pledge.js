const mongoose = require('mongoose');

const pledgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  promise: {
    type: String,
    required: [true, 'Promise is required'],
    trim: true
  },
  reminderConsent: {
    type: Boolean,
    default: false
  },
  remindersProcessed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pledge', pledgeSchema); 