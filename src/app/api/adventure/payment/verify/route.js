import { connectDB } from '@/lib/db';
import AdventureBooking from '@/models/AdventureBooking';
import crypto from 'crypto';
import { getTokenData } from '@/lib/jwt';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    await connectDB();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await req.json();

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    const decoded = await getTokenData(token);
    const userEmail = decoded.email;

    // Verify Razorpay Signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      await AdventureBooking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'failed',
        razorpay_orderId: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        failureReason: 'Invalid signature verification',
        failedAt: new Date()
      });
      return Response.json({ message: 'Invalid signature' }, { status: 400 });
    }

    // Mark booking as successful and store all Razorpay payment details
    const updated = await AdventureBooking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'success',
        razorpay_orderId: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        paidAt: new Date()
      },
      { new: true }
    );

    // Send confirmation email
    await sendAdventureBookingConfirmationEmail(updated, userEmail);

    // Return COMPLETE booking data
    return Response.json({ 
      message: 'Payment verified successfully', 
      booking: {
        _id: updated._id,
        items: updated.items || [], // Include items array
        totalAmount: updated.totalAmount,
        adventureDate: updated.adventureDate,
        paymentStatus: updated.paymentStatus,
        razorpay_orderId: updated.razorpay_orderId,
        razorpay_payment_id: updated.razorpay_payment_id,
        razorpay_signature: updated.razorpay_signature,
        paidAt: updated.paidAt,
        userEmail: updated.userEmail
      }
    });
  } catch (err) {
    console.error('Verify Error:', err);
    return Response.json({ message: 'Payment verification failed' }, { status: 500 });
  }
}



// Email sending function for adventure bookings
async function sendAdventureBookingConfirmationEmail(booking, userEmail) { // Remove extra parameters
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

    // Extract adventure items from booking
    const adventures = booking.items || []; // Get adventures from booking.booking array

    // Calculate grand total
    const grandTotal = adventures.reduce((sum, activity) => sum + (activity.total || 0), 0);

    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Adventure Booking Confirmation</title>
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
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
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
            font-weight: 500;
          }
            .activities-table-wrapper {
  width: 100%;
  overflow-x: auto;
}
          .activities-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            border-radius: 8px;
            overflow: auto;
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
          .activities-table tr:hover {
            background-color: #f0fdf4;
          }
          .total-row {
            background-color: #e2e8f0;
            font-weight: 700;
          }
          .total-row td {
            padding-top: 15px;
            padding-bottom: 15px;
          }
          .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(to right, #0f766e, #0d9488);
            color: white;
            font-size: 14px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          .logo-icon {
            font-size: 28px;
          }
          .highlight {
            color: #0f766e;
            font-weight: 600;
          }
          .btn {
            display: inline-block;
            background: #0d9488;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 30px;
            margin-top: 15px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(13, 148, 136, 0.2);
          }
          .btn:hover {
            background: #0b8377;
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(13, 148, 136, 0.3);
          }
          .info-box {
            background: #e0f2fe;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #0ea5e9;
          }
          .info-title {
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .contact-info {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span>River Tiger Resort & Camping Adventure</span>
            </div>
            <h1>Adventure Booking Confirmation</h1>
          </div>
          
          <div class="content">
            <p>Dear ${booking.userName || 'Adventure Seeker'},</p>
            <p>Your adventure booking has been successfully confirmed!</p>
            
            <div class="booking-summary">
              <div class="summary-row">
                <div class="summary-label">Booking ID:</div>
                <div class="summary-value">${booking._id.toString()}</div>
              </div>
              <div class="summary-row">
                <div class="summary-label">Adventure Date:</div>
                <div class="summary-value">${formatDate(booking.adventureDate)}</div>
              </div>
              <div class="summary-row">
                <div class="summary-label">Payment ID:</div>
                <div class="summary-value">${booking.paymentId}</div>
              </div>
              <div class="summary-row">
                <div class="summary-label">Payment Status:</div>
                <div class="summary-value" style="color: #10b981; font-weight: bold;">Successfully Paid</div>
              </div>
            </div>
            
            <h3 style="color: #0f766e; margin-bottom: 15px;">Your Adventure Activities</h3>
            <div class="activities-table-wrapper">
            <table class="activities-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Price Per Person</th>
                  <th>Participants</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${adventures.map(activity => `
                  <tr>
                    <td>${activity.name}</td>
                    <td>₹${activity.pricePerPerson.toFixed(2)}</td>
                    <td>${activity.count}</td>
                    <td>₹${activity.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding-right: 20px;">Grand Total:</td>
                  <td>₹${grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            </div>
            <div class="info-box">
              <div class="info-title">
                <span>📌</span>
                Important Information
              </div>
              <ul style="margin-left: 20px; padding-left: 0;">
                <li style="margin-bottom: 8px;">Please arrive at least 30 minutes before your first scheduled activity</li>
                <li style="margin-bottom: 8px;">Wear comfortable clothing and appropriate footwear for outdoor activities</li>
                <li style="margin-bottom: 8px;">Bring a valid ID matching your booking information</li>
                <li>All activities are subject to weather conditions</li>
              </ul>
            </div>
            
            <p>We're excited to provide you with an unforgettable adventure experience! If you have any questions or need to make changes to your reservation, our adventure team is here to help.</p>
            
            <div class="contact-info">
              <span>✉️</span>
              <span>support@rivertigerresort.com</span>
              <span style="margin-left: 20px;">📞</span>
              <span>+91 98765 43210</span>
            </div>
            
       
            
            <p style="margin-top: 30px;">Get ready for an amazing adventure at River Tiger Resort!</p>
            <p>Best regards,<br><strong>The River Tiger Adventure Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} River Tiger Resort & Camping Adventure. All rights reserved.</p>
            <p>123 Adventure Road, Chakrata, Uttarakhand 248123, India</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textContent = `Adventure Booking Confirmation - River Tiger Resort
===========================================================

Dear ${booking.userName || 'Adventure Seeker'},

Your adventure booking has been successfully confirmed!

Booking Summary:
- Booking ID: ${booking._id.toString()}
- Adventure Date: ${formatDate(booking.adventureDate)}
- Payment ID: ${booking.paymentId}
- Payment Status: Successfully Paid

Your Adventure Activities:
${adventures.map(activity => `
- ${activity.name}
  Price per person: ₹${activity.pricePerPerson.toFixed(2)}
  Participants: ${activity.count}
  Total: ₹${activity.total.toFixed(2)}
`).join('')}
Grand Total: ₹${grandTotal.toFixed(2)}

Important Information:
- Please arrive at least 30 minutes before your first scheduled activity
- Wear comfortable clothing and appropriate footwear for outdoor activities
- Bring a valid ID matching your booking information
- All activities are subject to weather conditions

For any questions or changes to your reservation:
Email: support@rivertigerresort.com
Phone: +91 98765 43210

View your adventure bookings: ${process.env.BASE_URL || 'https://rivertigerresort.com'}/my-adventures

Get ready for an amazing adventure at River Tiger Resort!

Best regards,
The River Tiger Adventure Team

© ${new Date().getFullYear()} River Tiger Resort & Camping Adventure. All rights reserved.
123 Adventure Road, Chakrata, Uttarakhand 248123, India`;

    await transporter.sendMail({
      from: `"River Tiger Adventures" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: 'Adventure Booking Confirmation - River Tiger Resort',
      text: textContent,
      html: htmlContent
    });

    console.log('Adventure confirmation email sent to:', userEmail);
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
  }
}