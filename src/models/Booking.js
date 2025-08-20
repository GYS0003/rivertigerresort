const mongoose = require('mongoose');

const AddonSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: String,
  description: String,
  pricePerPerson: Number,
  participants: Number,
  totalPrice: Number, 
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  stayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stay',
    required: true,
  },
  stayName: {
    type: String,
    required: true,
  },
  numNights: {
    type: Number,
    required: true,
  },
  adults: {
    type: Number,
    required: true,
  },
  children: {
    type: Number,
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  addons: [AddonSchema],
  totalPrice: {
    type: Number,
    required: true,
  },

  // Payment & user details
  userEmail: { type: String },
  phone: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  
  // Legacy payment field (keep for backward compatibility)
  paymentId: { type: String },
  
  // Razorpay payment fields
  razorpay_orderId: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  
  // Payment failure fields
  failureReason: { type: String },
  errorCode: { type: String },
  errorDescription: { type: String },
  failedAt: { type: Date },
  
  // Payment success timestamp
  paidAt: { type: Date },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
