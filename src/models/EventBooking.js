// File: models/EventBooking.js

import mongoose from 'mongoose';

const EventBookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        userEmail: {
            type: String,
        },
        
        items: {
            id: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            total: {
                type: Number,
                required: true,
            },
        },

        eventDate: {
            type: Date,
            required: true,
        },

        totalAmount: {
            type: Number,
            required: true,
        },
        
        paymentStatus: {
            type: String,
            enum: ['pending', 'success', 'failed'],
            default: 'pending',
        },
        
        // Razorpay payment fields
        razorpay_orderId: {
            type: String,
        },
        razorpay_payment_id: {
            type: String,
        },
        razorpay_signature: {
            type: String,
        },
        
        // Payment failure fields
        failureReason: {
            type: String,
        },
        errorCode: {
            type: String,
        },
        errorDescription: {
            type: String,
        },
        failedAt: {
            type: Date,
        },
        
        // Payment success timestamp
        paidAt: {
            type: Date,
        }
    },
    { timestamps: true }
);

// Avoid recompilation during dev
export default mongoose.models.EventBooking ||
    mongoose.model('EventBooking', EventBookingSchema);
