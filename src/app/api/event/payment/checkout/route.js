import { connectDB } from '@/lib/db';
import Razorpay from 'razorpay';
import EventBooking from '@/models/EventBooking';
import { getTokenData } from '@/lib/jwt';

export async function POST(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
      return Response.json({ message: 'Unauthorized: Token missing' }, { status: 401 });
    }

    const decoded = await getTokenData(token);
    const userId = decoded.id;
    const userEmail = decoded.email;

    const { totalAmount, bookingId } = await req.json();

    // Validate fields
    if (!bookingId) {
      return Response.json({ message: 'bookingId is required' }, { status: 400 });
    }
    // Create Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `event_receipt_${Date.now()}`,
    });

    // Update existing booking
    const updatedBooking = await EventBooking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          userId,
          userEmail,
          paymentStatus: 'pending',
          paymentId: order.id,
        },
      },
      { new: true }
    );

    if (!updatedBooking) {
      return Response.json({ message: 'Booking not found' }, { status: 404 });
    }

    return Response.json({ order, bookingId: updatedBooking._id });

  } catch (err) {
    console.error('Checkout Error:', err);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
