// app/api/adventure/booking/route.js
import { connectDB } from '@/lib/db';
import AdventureBooking from '@/models/AdventureBooking';
import { getTokenData } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];

    let query = {};

    if (token) {
      try {
        const decoded = await getTokenData(token);
        query.userId = decoded.id;
      } catch (err) {
        // return NextResponse.json(
        //   { message: 'Invalid or expired token' },
        //   { status: 401 }
        // );
      }
    }

    // If no token, query remains empty — fetches all bookings
    const bookings = await AdventureBooking.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching adventure bookings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

