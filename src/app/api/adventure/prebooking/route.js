import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import AdventureBooking from '@/models/AdventureBooking';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      items,
      totalAmount,
      adventureDate
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'At least one adventure item is required' }, { status: 400 });
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ message: 'Total amount must be greater than zero' }, { status: 400 });
    }

    if (!adventureDate) {
      return NextResponse.json({ message: 'Adventure date is required' }, { status: 400 });
    }

    // Create the booking document
    const newBooking = await AdventureBooking.create({
      items,
      totalAmount,
      adventureDate: new Date(adventureDate),
      paymentStatus: 'pending',
    });

    return NextResponse.json({ bookingId: newBooking._id }, { status: 201 });

  } catch (error) {
    console.error('Adventure Pre-booking Error:', error);
    return NextResponse.json({ message: 'Failed to create adventure booking' }, { status: 500 });
  }
}
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid or missing booking ID' }, { status: 400 });
    }

    const booking = await AdventureBooking.findById(id);
    if (!booking) {
      return NextResponse.json({ message: 'Adventure booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    console.error('Adventure Booking Fetch Error:', error);
    return NextResponse.json({ message: 'Error fetching adventure booking' }, { status: 500 });
  }
}