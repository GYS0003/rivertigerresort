/* ── app/api/booking/refunds/route.js ──────────────────────
   GET  /api/booking/refunds
   Returns every booking that:
     • has a refund object, and
     • refund.status is either "pending" or "processed"

   Secured: requires a valid Bearer token whose payload includes
   an `isAdmin` boolean.  Modify the admin‐check to fit your auth.
──────────────────────────────────────────────────────────── */
import { NextResponse } from 'next/server';
import jwt              from 'jsonwebtoken';
import { connectDB }    from '@/lib/db';
import Booking          from '@/models/Booking';

export async function GET(req) {
  await connectDB();

  try {

    const bookings = await Booking.find({
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

    console.error('Fetch-refunds route error:', err);
    return NextResponse.json(
      { message: err.message || 'Failed to fetch refunds' },
      { status: 500 }
    );
  }
}
