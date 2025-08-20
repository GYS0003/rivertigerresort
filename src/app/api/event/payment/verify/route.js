import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import EventBooking from '@/models/EventBooking';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { getTokenData } from '@/lib/jwt';

export async function POST(req) {
  try {
    await connectDB();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await req.json();

    // Verify auth token
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
      return Response.json({ message: 'Unauthorized: Token missing' }, { status: 401 });
    }

    const decodedToken = await getTokenData(token); // Get user data from token
    const userEmail = decodedToken.email; // Extract user email

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      // Update booking with failure details and Razorpay fields
      await EventBooking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'failed',
        razorpay_orderId: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        failureReason: 'Invalid payment signature',
        errorDescription: 'Payment signature verification failed',
        failedAt: new Date(),
        userId: decodedToken.id,
        userEmail: userEmail,
      });
      return Response.json({ message: 'Invalid signature' }, { status: 400 });
    }

    // Update booking with success status and all Razorpay fields
    const updatedBooking = await EventBooking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          // Payment status
          paymentStatus: 'success',
          paidAt: new Date(),
          
          // Legacy payment field (keep for backward compatibility)
          paymentId: razorpay_payment_id,
          
          // Complete Razorpay payment fields
          razorpay_orderId: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
          
          // User information
          userId: decodedToken.id,
          userEmail: userEmail,
        }
      },
      { new: true }
    );

    if (!updatedBooking) {
      return Response.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Send confirmation email
    await sendEventBookingConfirmationEmail(updatedBooking, userEmail);

    return Response.json({
      message: 'Payment verified and confirmation email sent',
      booking: updatedBooking,
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    return Response.json({ message: 'Payment verification failed' }, { status: 500 });
  }
}

// Email sending function for event bookings
async function sendEventBookingConfirmationEmail(booking, userEmail) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Format dates
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    // Event-specific email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* Same styling as previous example */
          body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #0d9488, #0f766e); color: white; padding: 30px; text-align: center; }
          .booking-details { background: #f0fdf4; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; }
          .detail-row { display: flex; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: 600; width: 40%; color: #0f766e; }
          .detail-value { width: 60%; }
          .btn { background: #0d9488; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Booking Confirmation</h1>
          </div>
          
          <div class="content" style="padding: 30px;">
            <p>Dear ${booking.userName || 'Guest'},</p>
            <p>Your event booking has been successfully confirmed!</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <div class="detail-label">Booking ID:</div>
                <div class="detail-value">${booking._id.toString()}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Event:</div>
                <div class="detail-value">${booking.items.title || 'Adventure Event'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Event Date:</div>
                <div class="detail-value">${formatDate(booking.eventDate)}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Total Amount:</div>
                <div class="detail-value">₹${booking.totalAmount?.toFixed(2) || '0.00'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Payment ID:</div>
                <div class="detail-value">${booking.paymentId}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value" style="color: #10b981; font-weight: bold;">Confirmed</div>
              </div>
            </div>
            
            <p>We're excited to host you at the event! For any queries, contact support@rivertigerresort.com</p>
            
          </div>
          
          <div style="text-align: center; padding: 20px; background: #f1f5f9; color: #64748b;">
            <p>© ${new Date().getFullYear()} River Tiger Resort. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `Event Booking Confirmation - River Tiger Resort

Dear ${booking.userName || 'Guest'},

Your event booking has been confirmed!

Booking Details:
- Booking ID: ${booking._id.toString()}
- Event: ${booking.eventName || 'Adventure Event'}
- Event Date: ${formatDate(booking.eventDate)}
- Participants: ${booking.numParticipants || booking.numGuests}
- Total Amount: ₹${booking.totalPrice?.toFixed(2) || '0.00'}
- Payment ID: ${booking.paymentId}
- Status: Confirmed

View your bookings: ${process.env.BASE_URL}/my-events

© ${new Date().getFullYear()} River Tiger Resort`;

    await transporter.sendMail({
      from: `"River Tiger Events" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: 'Event Booking Confirmation - River Tiger Resort',
      text: textContent,
      html: htmlContent
    });

    console.log('Event confirmation email sent to:', userEmail);
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
  }
}