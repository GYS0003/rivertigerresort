// app/api/booking/refund/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';

/* ── helper: refund % from days before check-in ─────────── */
function getRefundPct(daysLeft) {
    if (daysLeft >= 7) return 100;   // 7 + days
    if (daysLeft === 6) return 75;   // 6 days
    if (daysLeft === 5) return 50;   // 5 days
    if (daysLeft === 4) return 25;   // 4 days
    return 0;                        // ≤ 3 days
}

export async function POST(req) {
    await connectDB();

    try {
        /* 1 ▪ body */
        const { bookingID, reason } = await req.json();
        if (!bookingID)
            return NextResponse.json({ message: 'bookingID required' }, { status: 400 });

        /* 2 ▪ auth */
        const auth = req.headers.get('authorization') || '';
        if (!auth.startsWith('Bearer '))
            return NextResponse.json({ message: 'Bearer token missing' }, { status: 401 });

        const token = auth.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        const payload = jwt.verify(token, secret);        // throws on bad token

        /* 3 ▪ booking lookup + ownership */
        const booking = await Booking.findById(bookingID);
        if (!booking)
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 });

        if (String(booking.userId) !== payload.id)
            return NextResponse.json({ message: 'Not your booking' }, { status: 403 });

        /* 4 ▪ compute days-left & percentage */
        const today = new Date();                 // local date, midnight
        today.setHours(0, 0, 0, 0);

        const checkDate =
            new Date(booking.checkIn);
        checkDate.setHours(0, 0, 0, 0);

        const msPerDay = 86_400_000;            // 24 * 60 * 60 * 1000
        const daysLeft = Math.ceil((checkDate - today) / msPerDay);
        const pct = getRefundPct(daysLeft);

        const payable = booking.totalPrice;
        const amount = Number(((pct / 100) * payable).toFixed(2));

        /* 5 ▪ write refund sub-doc */
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
            { message: 'Refund request logged', refund: booking.refund },
            { status: 200 }
        );

    } catch (err) {
        if (err.name === 'JsonWebTokenError')
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        if (err.name === 'TokenExpiredError')
            return NextResponse.json({ message: 'Token expired' }, { status: 401 });

        console.error('Refund route error:', err);
        return NextResponse.json(
            { message: err.message || 'Refund request failed' },
            { status: 500 }
        );
    }
}
