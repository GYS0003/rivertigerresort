// app/api/payment/refund/approved/route.js
import { NextResponse } from 'next/server';
import Razorpay         from 'razorpay';
import jwt              from 'jsonwebtoken';
import { connectDB }    from '@/lib/db';
import Booking          from '@/models/Booking';

const rzp = new Razorpay({
  key_id    : process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  await connectDB();

  try {
    /* body & auth -------------------------------------------------- */
    const { bookingID } = await req.json();
    if (!bookingID)
      return NextResponse.json({ message: 'bookingID required' }, { status: 400 });

    /* booking ------------------------------------------------------ */
    const booking = await Booking.findById(bookingID);
    if (!booking)      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    if (!booking.refund?.requested)
      return NextResponse.json({ message: 'No refund request' }, { status: 400 });
    if (booking.refund.status === 'processed')
      return NextResponse.json({ message: 'Already refunded' }, { status: 400 });
    if (!booking.razorpay_payment_id)
      return NextResponse.json({ message: 'payment_id missing' }, { status: 400 });

    /* call Razorpay ------------------------------------------------ */
    const paise = Math.round((booking.refund.amount || 0) * 100);   // ₹→paise
    const rzpRes = await rzp.payments.refund(
      booking.razorpay_payment_id,
      paise ? { amount: paise, notes: { bookingID } } : { notes: { bookingID } }
    );

    /* persist ------------------------------------------------------ */
    booking.refund.approved          = true;
    booking.refund.status            = 'processed';
    booking.refund.razorpay_refund_id = rzpRes.id;
    booking.refund.processedAt       = new Date();
    await booking.save();

    return NextResponse.json(
      { message: 'Refund processed', refund: booking.refund },
      { status: 200 }
    );

  } catch (err) {
    if (['JsonWebTokenError', 'TokenExpiredError'].includes(err.name))
      return NextResponse.json({ message: err.message }, { status: 401 });

    console.error('Refund approve error:', err);
    return NextResponse.json(
      { message: err.message || 'Refund processing failed' },
      { status: 500 }
    );
  }
}
