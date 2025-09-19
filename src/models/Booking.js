const mongoose = require('mongoose');

const AddonSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: String,
    description: String,
    pricePerPerson: Number,
    participants: Number,
    totalPrice: Number,
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stay', required: true },
    stayName: { type: String, required: true },
    numNights: { type: Number, required: true },
    adults: { type: Number, required: true },
    children: { type: Number, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    addons: [AddonSchema],
    breakfastPrice: { type: Number, default: 0 },
    lunchPrice: { type: Number, default: 0 },
    dinnerPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    userEmail: { type: String },
    phone: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    },
    paymentId: { type: String }, // Keep for backward compatibility
    razorpay_orderId: { type: String },
    razorpay_payment_id: { type: String}, // **ADDED: Index for faster queries**
    razorpay_signature: { type: String },
    failureReason: { type: String },
    errorCode: { type: String },
    errorDescription: { type: String },
    failedAt: { type: Date },
    paidAt: { type: Date },
    refund: {
      approved: { type: Boolean, default: false },
      requested: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'processed'],
        default: 'pending',
      },
      amount: { 
        type: Number, 
        min: 0,
      },
      refundPercentage: { type: Number, min: 0, max: 100 },
      reason: { type: String },
      razorpay_refund_id: { type: String}, // **ADDED: Index for refund tracking**
      requestedAt: { type: Date },
      processedAt: { type: Date },
      // **ADDED: Additional tracking fields**
      rejectedAt: { type: Date },
      rejectionReason: { type: String }
    },
  },
  { timestamps: true }
);

// **ADDED: Compound index for better query performance**
BookingSchema.index({ razorpay_payment_id: 1, 'refund.status': 1 });

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
