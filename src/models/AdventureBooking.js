import mongoose from 'mongoose';

const adventureBookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        pricePerPerson: { type: Number, required: true },
        count: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    adventureDate: { type: Date, required: true },
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

export default mongoose.models.AdventureBooking
  || mongoose.model('AdventureBooking', adventureBookingSchema);
