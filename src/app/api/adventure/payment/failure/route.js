// File: app/api/adventure/payment/failure/route.js

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AdventureBooking from '@/models/AdventureBooking'; // or EventBooking
import { getTokenData } from '@/lib/jwt';
 // Your token utility

export async function POST(req) {
  try {
    await connectDB();

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId,
      failureReason,
      errorCode,
      errorDescription 
    } = await req.json();

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    const decoded = await getTokenData(token);
    const userEmail = decoded.email;

    // Validate required fields
    if (!bookingId) {
      return Response.json({ message: 'Booking ID is required' }, { status: 400 });
    }

    // Find the booking to ensure it exists
    const booking = await AdventureBooking.findById(bookingId);
    if (!booking) {
      return Response.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Update booking with failure status and store all available Razorpay data
    const updated = await AdventureBooking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'failed',
        razorpay_orderId: razorpay_order_id || null,
        razorpay_payment_id: razorpay_payment_id || null,
        razorpay_signature: razorpay_signature || null,
        failureReason: failureReason || 'Payment failed',
        errorCode: errorCode || null,
        errorDescription: errorDescription || null,
        failedAt: new Date()
      },
      { new: true }
    );

    // Log the failure for monitoring
    console.log(`Payment failed for booking ${bookingId}:`, {
      userEmail,
      amount: booking.totalAmount,
      failureReason,
      errorCode,
      razorpay_order_id,
      timestamp: new Date().toISOString()
    });

    return Response.json({ 
      message: 'Payment failure recorded successfully',
      booking: {
        id: updated._id,
        paymentStatus: updated.paymentStatus,
        failureReason: updated.failureReason,
        errorCode: updated.errorCode,
        failedAt: updated.failedAt
      }
    });

  } catch (err) {
    console.error('Payment failure API error:', err);
    return Response.json({ message: 'Failed to record payment failure' }, { status: 500 });
  }
}
