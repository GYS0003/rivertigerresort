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
    totalPrice: { type: Number, required: true },
    userEmail: { type: String },
    phone: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    },
    paymentId: { type: String },
    razorpay_orderId: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    failureReason: { type: String },
    errorCode: { type: String },
    errorDescription: { type: String },
    failedAt: { type: Date },
    paidAt: { type: Date },
    refund: {
      approved: { type: Boolean, default: false },                 // admin toggle
      requested: { type: Boolean, default: false },                 // user raised?
      status: {                                                  // lifecycle
        type: String,
        enum: ['pending', 'approved', 'rejected', 'processed'],
        default: 'pending',
      },
      amount: { type: Number, min: 0 },                      // ₹ value
      refundPercentage: { type: Number, min: 0, max: 100 },           // e.g. 80 = 80 %
      reason: { type: String },
      razorpay_refund_id: String,                                    // once issued
      requestedAt: Date,
      processedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
