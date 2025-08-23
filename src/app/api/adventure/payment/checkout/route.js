import { connectDB } from '@/lib/db';
import Razorpay from 'razorpay';
import AdventureBooking from '@/models/AdventureBooking';

export async function POST(req) {
  try {
    await connectDB();
    const { bookingId } = await req.json();

    // Step 1: Fetch the booking by ID
    const existingBooking = await AdventureBooking.findById(bookingId);
    if (!existingBooking) {
      return Response.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Step 2: Calculate totalAmount from items
    const items = existingBooking.items || [];
    if (items.length === 0) {
      return Response.json({ message: 'No adventure items found in booking' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    // Step 3: Validate date format
    const adventureDate = existingBooking.adventureDate?.toISOString().split('T')[0];
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!adventureDate || !dateRegex.test(adventureDate)) {
      return Response.json({ message: 'Invalid adventure date format' }, { status: 400 });
    }

    // Step 4: Create Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `adv_receipt_${Date.now()}`,
    });

    // Step 5: Update the booking
    const updatedBooking = await AdventureBooking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          totalAmount,
          paymentStatus: 'pending',
          paymentId: order.id,
        },
      },
      { new: true }
    );

    return Response.json({ order, bookingId: updatedBooking._id });

  } catch (err) {
    console.error('Checkout Error:', err);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
