// File: app/api/event/payment/failure/route.js

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import EventBooking from '@/models/EventBooking';
import { getTokenData } from '@/lib/jwt';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId,
      failureReason,
      errorCode,
      errorDescription 
    } = body;

    // Get JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization token missing' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    let decoded;
    try {
      decoded = await getTokenData(token);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json(
        { message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Find the booking to ensure it exists
    const booking = await EventBooking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking with failure status and store all available Razorpay data
    const updatedBooking = await EventBooking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          paymentStatus: 'failed',
          razorpay_orderId: razorpay_order_id || null,
          razorpay_payment_id: razorpay_payment_id || null,
          razorpay_signature: razorpay_signature || null,
          failureReason: failureReason || 'Payment failed',
          errorCode: errorCode || null,
          errorDescription: errorDescription || null,
          failedAt: new Date(),
          userId: decoded.id,
          userEmail: decoded.email || '',
        }
      },
      { new: true }
    );

    // Log the failure for monitoring
    console.log(`Event booking payment failed for booking ${bookingId}:`, {
      userId: decoded.id,
      userEmail: decoded.email,
      eventTitle: booking.items.title,
      eventDate: booking.eventDate,
      totalAmount: booking.totalAmount,
      failureReason,
      errorCode,
      razorpay_order_id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      message: 'Payment failure recorded successfully',
      booking: {
        id: updatedBooking._id,
        paymentStatus: updatedBooking.paymentStatus,
        failureReason: updatedBooking.failureReason,
        errorCode: updatedBooking.errorCode,
        failedAt: updatedBooking.failedAt,
        eventTitle: updatedBooking.items.title,
        totalAmount: updatedBooking.totalAmount
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Event booking payment failure API error:', error);
    
    return NextResponse.json({ 
      message: error.message || 'Failed to record payment failure' 
    }, { status: 500 });
  }
}
