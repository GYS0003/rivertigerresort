import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Booking from '@/models/Booking';
import { connectDB } from '@/lib/db'; // Your DB connection utility
import Stay from '@/models/Stay';



// POST: Save a complete booking
const calculateNights = (checkIn, checkOut) => {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diffTime = Math.abs(outDate - inDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export async function POST(req) {
  try {
    await connectDB?.();

    const body = await req.json();
    const {
      stayId,
      stayName,
      checkIn,
      checkOut,
      addons = [],
      adults,
      children,
      userId,
      userEmail,
      phone,
    } = body;

    // Validation
    if (!stayId || !stayName || !checkIn || !checkOut || adults == null || children == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numNights = calculateNights(checkIn, checkOut);
    if (numNights <= 0) {
      return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 });
    }

    // Fetch stay price
    const stay = await Stay.findById(stayId);
    if (!stay) {
      return NextResponse.json({ error: 'Stay not found' }, { status: 404 });
    }

    // Process addons
    let totalAddonPrice = 0;
    const formattedAddons = addons.map((addon) => {
      const total = addon.pricePerPerson * addon.participants;
      totalAddonPrice += total;
      return {
        id: new mongoose.Types.ObjectId(addon.id),
        title: addon.title,
        description: addon.description,
        pricePerPerson: addon.pricePerPerson,
        participants: addon.participants,
        totalPrice: total,
      };
    });

    // Calculate total price
    const totalPrice = (stay.price * numNights) + totalAddonPrice;

    // Create booking
    const newBooking = await Booking.create({
      stayId: new mongoose.Types.ObjectId(stayId),
      stayName,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      addons: formattedAddons,
      totalPrice,
      numNights,
      adults,
      children,
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      userEmail,
      phone,
      paymentStatus: 'pending',
    });

    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

// GET: Retrieve all bookings

export async function GET(req) {
  try {
    await connectDB?.();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
      }

      // Fetch booking
      const booking = await Booking.findById(id);
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      // Fetch stay to get price
      const stay = await Stay.findById(booking.stayId);
      if (!stay) {
        return NextResponse.json({ error: 'Stay not found for this booking' }, { status: 404 });
      }

      // Add stay price to response
      const response = {
        ...booking.toObject(),
        stayPrice: stay.price,
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Fetch all bookings (optional enhancement: include stay price for each if needed)
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return NextResponse.json({ bookings }, { status: 200 });

  } catch (error) {
    console.error('Get Bookings Error:', error);
    return NextResponse.json({ error: 'Error fetching bookings' }, { status: 500 });
  }
}


