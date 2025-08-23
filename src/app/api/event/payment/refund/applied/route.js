/* ── app/api/event/payment/refund/applied/route.js ──────────
   POST /api/event/payment/refund/applied
   User requests a refund for an event booking.
   Auto-calculates % and amount from eventDate.
───────────────────────────────────────────────────────────── */
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import EventBooking from '@/models/EventBooking';

function getRefundPct(daysLeft) {
    if (daysLeft >= 7) return 100;
    if (daysLeft === 6) return 75;
    if (daysLeft === 5) return 50;
    if (daysLeft === 4) return 25;
    return 0;
}

export async function POST(req) {
    await connectDB();

    try {
        /* body */
        const { bookingID, reason = '' } = await req.json();
        if (!bookingID)
            return NextResponse.json({ message: 'bookingID required' }, { status: 400 });

        /* auth */
        const auth = req.headers.get('authorization') || '';
        if (!auth.startsWith('Bearer '))
            return NextResponse.json({ message: 'Bearer token missing' }, { status: 401 });

        const token = auth.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        const payload = jwt.verify(token, secret);          // throws if invalid

        /* lookup + ownership */
        const booking = await EventBooking.findById(bookingID);
        if (!booking)
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 });

        if (String(booking.userId) !== payload.id)
            return NextResponse.json({ message: 'Not your booking' }, { status: 403 });

        /* compute days-left, %, amount */
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(booking.eventDate);
        eventDate.setHours(0, 0, 0, 0);

        const msPerDay = 86_400_000;
        const daysLeft = Math.ceil((eventDate - today) / msPerDay);
        const pct = getRefundPct(daysLeft);
        const amount = Number(((pct / 100) * booking.totalAmount).toFixed(2));

        /* save */
        booking.refund = {
            requested: true,
            approved: false,
            status: 'pending',
            refundPercentage: pct,
            amount,
            reason,
            requestedAt: new Date(),
        };
        await booking.save();

        return NextResponse.json(
            { message: 'Refund requested', refund: booking.refund },
            { status: 200 }
        );

    } catch (err) {
        if (err.name === 'JsonWebTokenError')
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        if (err.name === 'TokenExpiredError')
            return NextResponse.json({ message: 'Token expired' }, { status: 401 });

        console.error('Event refund apply error:', err);
        return NextResponse.json(
            { message: err.message || 'Refund request failed' },
            { status: 500 }
        );
    }
}
