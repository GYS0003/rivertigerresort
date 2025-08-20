// File: app/api/stay/payment/failure/route.js

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingID,
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

    const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { message: 'Invalid token' },
          { status: 401 }
        );
      }
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json(
          { message: 'Token expired' },
          { status: 401 }
        );
      }
      throw error;
    }

    // Validate required fields
    if (!bookingID) {
      return NextResponse.json(
        { message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Find the booking to ensure it exists
    const booking = await Booking.findById(bookingID);
    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking with failure status and store all available Razorpay data
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingID,
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
    console.log(`Stay booking payment failed for booking ${bookingID}:`, {
      userId: decoded.id,
      userEmail: decoded.email,
      stayName: booking.stayName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalPrice: booking.totalPrice,
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
        stayName: updatedBooking.stayName,
        totalPrice: updatedBooking.totalPrice
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Stay booking payment failure API error:', error);
    
    return NextResponse.json({ 
      message: error.message || 'Failed to record payment failure' 
    }, { status: 500 });
  }
}
