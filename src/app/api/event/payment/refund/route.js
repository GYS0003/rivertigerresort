/* ── app/api/event/payment/refund/route.js ──────────────────
   GET  /api/event/payment/refund
   Returns every event booking with a refund that is
   either "pending" or "processed" (admin-only).
───────────────────────────────────────────────────────────── */
import { NextResponse } from 'next/server';
import jwt              from 'jsonwebtoken';
import { connectDB }    from '@/lib/db';
import EventBooking     from '@/models/EventBooking';

export async function GET(req) {
  await connectDB();

  try {
    /* query */
    const bookings = await EventBooking.find({
      'refund.requested': true,
      'refund.status'  : { $in: ['pending', 'processed'] },
    })
      .lean()                 // plain objects
      .sort({ 'refund.requestedAt': -1 });   // newest first

    return NextResponse.json({ bookings }, { status: 200 });

  } catch (err) {
    if (err.name === 'JsonWebTokenError')
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    if (err.name === 'TokenExpiredError')
      return NextResponse.json({ message: 'Token expired' }, { status: 401 });

    console.error('Fetch event refunds error:', err);
    return NextResponse.json(
      { message: err.message || 'Failed to fetch refunds' },
      { status: 500 }
    );
  }
}
