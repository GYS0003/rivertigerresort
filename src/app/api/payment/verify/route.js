import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingID  // Receive booking ID instead of full booking object
    } = body;

    // Verify Razorpay signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest('hex');

    if (digest !== razorpay_signature) {
      return NextResponse.json(
        { message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

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
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find and update the existing booking with all Razorpay fields
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingID,
      {
        $set: {
          // Legacy payment field (keep for backward compatibility)
          paymentId: razorpay_payment_id,
          
          // New Razorpay payment fields
          razorpay_orderId: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
          
          // Payment status and timing
          paymentStatus: 'success',
          paidAt: new Date(),
          
          // User information
          userId: decoded.id,
          userEmail: decoded.email || '',
        }
      },
      { new: true }  // Return the updated document
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Send confirmation email
    await sendBookingConfirmationEmail(updatedBooking, decoded.email);

    return NextResponse.json({
      message: 'Payment successful and confirmation email sent',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Payment verification error:', error);

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

    return NextResponse.json(
      { message: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}


async function sendBookingConfirmationEmail(booking, userEmail) {
  try {
    // Validate email configuration
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.error('Email configuration missing');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Format dates for display
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    // Calculate total guests
    const totalGuests = (booking.adults || 0) + (booking.children || 0);

    // Format addons if they exist
    const formatAddons = () => {
      if (!booking.addons || booking.addons.length === 0) {
        return '<tr><td colspan="4" style="text-align: center;">No add-ons selected</td></tr>';
      }
      return booking.addons.map(addon => `
        <tr>
          <td>${addon.title || 'Add-on'}</td>
          <td>₹${addon.pricePerPerson?.toFixed(2) || '0.00'}</td>
          <td>${addon.participants || 0}</td>
          <td>₹${addon.totalPrice?.toFixed(2) || '0.00'}</td>
        </tr>
      `).join('');
    };

    // Calculate addons total
    const addonsTotal = booking.addons?.reduce((sum, addon) => sum + (addon.totalPrice || 0), 0) || 0;

    // HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 650px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #0d9488, #0f766e);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .booking-summary {
            background: #f0fdf4;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            border-left: 4px solid #10b981;
          }
          .summary-row {
            display: flex;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
          }
          .summary-label {
            font-weight: 600;
            width: 40%;
            color: #0f766e;
          }
          .summary-value {
            width: 60%;
          }
          .activities-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.05);
          }
          .activities-table th {
            background: #0d9488;
            color: white;
            text-align: left;
            padding: 12px 15px;
            font-weight: 600;
          }
          .activities-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
          }
          .activities-table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .total-row {
            background-color: #e2e8f0;
            font-weight: 700;
          }
          .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(to right, #0f766e, #0d9488);
            color: white;
            font-size: 14px;
          }
              .activities-table-wrapper {
  width: 100%;
  overflow-x: auto;
}
          .highlight {
            color: #0f766e;
            font-weight: 600;
          }
          .btn {
            display: inline-block;
            background: #0d9488;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
            font-weight: 600;
          }
          .info-box {
            background: #e0f2fe;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #0ea5e9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
            <p>River Tiger Resort & Camping Adventure</p>
          </div>
          
          <div class="content">
            <p>Dear ${booking.userName || 'Guest'},</p>
            <p>Thank you for your booking! Here are your reservation details:</p>
            
            <div class="booking-summary">
              <div class="summary-row">
                <div class="summary-label">Booking ID:</div>
                <div class="summary-value">${booking._id.toString()}</div>
              </div>
              <div class="summary-row">
                <div class="summary-label">Stay:</div>
                <div class="summary-value">${booking.stayName}</div>
              </div>
              <div class="summary-row">
                <div class="summary-label">Check-in:</div>
                <div class="summary-value">${formatDate(booking.checkIn)}</div>
              </div>
              <div class="summary-row">
                <div class="summary-label">Check-out:</div>
                <div class="summary-value">${formatDate(booking.checkOut)}</div>
              </div>
              <div class="summary-row">
                <div class="summary-label">Nights:</div>
                <div class="summary-value">${booking.numNights}</div>
              </div>
              <div class="summary-row">
                <div class="summary-label">Guests:</div>
                <div class="summary-value">${booking.adults} adult${booking.adults !== 1 ? 's' : ''} ${booking.children > 0 ? `& ${booking.children} child${booking.children !== 1 ? 'ren' : ''}` : ''}</div>
              </div>
              <div class="summary-row">
                <div class="summary-label">Payment Status:</div>
                <div class="summary-value highlight">${booking.paymentStatus === 'success' ? 'Paid' : 'Pending'}</div>
              </div>
            </div>
            
            <h3 style="color: #0f766e; margin-bottom: 15px;">Booking Breakdown</h3>
              <div class="activities-table-wrapper">
            <table class="activities-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${booking.stayName} (${booking.numNights} night${booking.numNights !== 1 ? 's' : ''})</td>
                  <td>₹${(booking.totalPrice / booking.numNights).toFixed(2)}/night</td>
                  <td>${booking.numNights}</td>
                  <td>₹${booking.totalPrice.toFixed(2)}</td>
                </tr>
                ${formatAddons()}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Grand Total:</td>
                  <td>₹${(booking.totalPrice + addonsTotal).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            </div>
            <div class="info-box">
              <h3 style="margin-top: 0; color: #0c4a6e;">Important Information</h3>
              <ul style="margin-left: 20px; padding-left: 0;">
                <li style="margin-bottom: 8px;">Check-in time: 2:00 PM</li>
                <li style="margin-bottom: 8px;">Check-out time: 11:00 AM</li>
                <li style="margin-bottom: 8px;">Please bring valid ID matching your booking</li>
                <li>Contact us for any special requests or questions</li>
              </ul>
            </div>
            
            <p>We look forward to welcoming you to River Tiger Resort! If you have any questions about your reservation, please contact us at:</p>
            <p style="margin: 15px 0;">
              <strong>Email:</strong> support@rivertigerresort.com<br>
              <strong>Phone:</strong> +91 98765 43210
            </p>
            
            <p>Safe travels!</p>
            <p><strong>The River Tiger Resort Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} River Tiger Resort & Camping Adventure</p>
            <p>123 Adventure Road, Chakrata, Uttarakhand 248123, India</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textContent = `
      Booking Confirmation - River Tiger Resort
      ========================================

      Dear ${booking.userName || 'Guest'},

      Thank you for your booking! Here are your reservation details:

      Booking Summary:
      - Booking ID: ${booking._id.toString()}
      - Stay: ${booking.stayName}
      - Check-in: ${formatDate(booking.checkIn)}
      - Check-out: ${formatDate(booking.checkOut)}
      - Nights: ${booking.numNights}
      - Guests: ${booking.adults} adult${booking.adults !== 1 ? 's' : ''} ${booking.children > 0 ? `and ${booking.children} child${booking.children !== 1 ? 'ren' : ''}` : ''}
      - Payment Status: ${booking.paymentStatus === 'success' ? 'Paid' : 'Pending'}

      Booking Breakdown:
      - ${booking.stayName} (${booking.numNights} night${booking.numNights !== 1 ? 's' : ''})
        Price: ₹${(booking.totalPrice / booking.numNights).toFixed(2)} per night
        Total: ₹${booking.totalPrice.toFixed(2)}
      
      ${booking.addons?.length > 0 ? 'Add-ons:\n' + booking.addons.map(addon => `
      - ${addon.title}
        Price: ₹${addon.pricePerPerson?.toFixed(2) || '0.00'} per person
        Participants: ${addon.participants || 0}
        Total: ₹${addon.totalPrice?.toFixed(2) || '0.00'}
      `).join('') : 'No add-ons selected'}

      Grand Total: ₹${(booking.totalPrice + addonsTotal).toFixed(2)}

      Important Information:
      - Check-in time: 2:00 PM
      - Check-out time: 11:00 AM
      - Please bring valid ID matching your booking
      - Contact us for any special requests or questions

      We look forward to welcoming you! If you have any questions about your reservation, please contact us at:
      Email: support@rivertigerresort.com
      Phone: +91 98765 43210

      Safe travels!
      The River Tiger Resort Team

      © ${new Date().getFullYear()} River Tiger Resort & Camping Adventure
      123 Adventure Road, Chakrata, Uttarakhand 248123, India
    `;

    await transporter.sendMail({
      from: `"River Tiger Resort" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: 'Booking Confirmation - River Tiger Resort',
      text: textContent,
      html: htmlContent
    });

    console.log('Booking confirmation email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    throw error;
  }
}