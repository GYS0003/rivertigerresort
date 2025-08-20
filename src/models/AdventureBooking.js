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
    paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    
    // Legacy payment field (you can remove this if not needed)
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
    paidAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.models.AdventureBooking ||
  mongoose.model('AdventureBooking', adventureBookingSchema);
