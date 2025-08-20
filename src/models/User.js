const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyOtp: {
    type: String, // store as string (hashed or plain depending on use)
  },
  otpExpiresAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
