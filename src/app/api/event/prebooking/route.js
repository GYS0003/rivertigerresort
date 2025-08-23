import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import EventBooking from '@/models/EventBooking';
import { getTokenData } from '@/lib/jwt';

// Create a new event booking
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      items,
      eventDate,
      totalAmount,
    } = body;
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
      return Response.json({ message: 'Unauthorized: Token missing' }, { status: 401 });
    }

    const decoded = await getTokenData(token);
    const userId = decoded.id;
    const userEmail = decoded.email;

    if (!items || !items.id || !items.title || !items.price || !items.total) {
      return NextResponse.json({ message: 'Incomplete event item details' }, { status: 400 });
    }

    if (!eventDate || !totalAmount) {
      return NextResponse.json({ message: 'Event date and total amount are required' }, { status: 400 });
    }

    const newBooking = await EventBooking.create({
      items,
      eventDate: new Date(eventDate),
      totalAmount,
      userId,
      userEmail,
      paymentStatus: 'pending',
    });

    return NextResponse.json({ bookingId: newBooking._id }, { status: 201 });

  } catch (error) {
    console.error('Event Booking POST Error:', error);
    return NextResponse.json({ message: 'Failed to create event booking' }, { status: 500 });
  }
}

// Fetch a single booking by ID (GET /api/event-booking?id=BOOKING_ID)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json({ message: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await EventBooking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking }, { status: 200 });

  } catch (error) {
    console.error('Event Booking GET Error:', error);
    return NextResponse.json({ message: 'Failed to fetch booking' }, { status: 500 });
  }
}
