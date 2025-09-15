import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Booking from '@/models/Booking';
import { connectDB } from "@/lib/db";
import { getTokenData } from "@/lib/jwt";
import Stay from "@/models/Stay";

// **ADDED: Missing calculateNights function**
const calculateNights = (checkIn, checkOut) => {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diffTime = Math.abs(outDate - inDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export async function POST(req) {
  try {
    // **FIXED: Remove optional chaining**
    await connectDB();

    const body = await req.json();
    const {
      stayId,
      stayName,
      checkIn,
      checkOut,
      addons = [],
      adults,
      children,
      phone,
      selectedMeals = {},
    } = body;

    // **ADDED: Validation logging**
    console.log('Received data:', { stayId, stayName, checkIn, checkOut, adults, children, selectedMeals });

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
      // **FIXED: Use consistent NextResponse**
      return NextResponse.json({ error: 'Unauthorized: Token missing' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await getTokenData(token);
    } catch (tokenError) {
      console.error('Token error:', tokenError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    const userEmail = decoded.email;

    // **FIXED: Better validation**
    if (!stayId || !stayName || !checkIn || !checkOut || adults == null || children == null) {
      console.log('Missing fields:', { stayId, stayName, checkIn, checkOut, adults, children });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // **ADDED: Validate ObjectId format**
    if (!mongoose.Types.ObjectId.isValid(stayId)) {
      console.log('Invalid stayId format:', stayId);
      return NextResponse.json({ error: 'Invalid stay ID format' }, { status: 400 });
    }

    const numNights = calculateNights(checkIn, checkOut);
    console.log('Calculated nights:', numNights);
    
    if (numNights <= 0) {
      return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 });
    }

    // **ADDED: Better stay lookup with error handling**
    let stay;
    try {
      stay = await Stay.findById(stayId);
      console.log('Stay found:', stay ? 'Yes' : 'No');
    } catch (stayError) {
      console.error('Stay lookup error:', stayError);
      return NextResponse.json({ error: 'Error finding stay' }, { status: 500 });
    }

    if (!stay) {
      console.log('Stay not found for ID:', stayId);
      return NextResponse.json({ error: 'Stay not found' }, { status: 404 });
    }

    // **IMPROVED: Better addon processing**
    let totalAddonPrice = 0;
    const formattedAddons = [];
    
    try {
      for (const addon of addons) {
        // **ADDED: Validate addon ObjectId**
        if (!mongoose.Types.ObjectId.isValid(addon.id)) {
          console.log('Invalid addon ID:', addon.id);
          return NextResponse.json({ error: 'Invalid addon ID format' }, { status: 400 });
        }
        
        const total = addon.pricePerPerson * addon.participants;
        totalAddonPrice += total;
        
        formattedAddons.push({
          id: new mongoose.Types.ObjectId(addon.id),
          title: addon.title,
          description: addon.description,
          pricePerPerson: addon.pricePerPerson,
          participants: addon.participants,
          totalPrice: total,
        });
      }
      console.log('Addons processed successfully, total price:', totalAddonPrice);
    } catch (addonError) {
      console.error('Addon processing error:', addonError);
      return NextResponse.json({ error: 'Error processing addons' }, { status: 500 });
    }

    // Calculate meal prices based on user selection
    const breakfastPrice = selectedMeals.breakfast ? (stay.breakfastPrice || 0) : 0;
    const lunchPrice = selectedMeals.lunch ? (stay.lunchPrice || 0) : 0;
    const dinnerPrice = selectedMeals.dinner ? (stay.dinnerPrice || 0) : 0;

    const totalGuests = adults + children;
    const totalMealPrice = (breakfastPrice + lunchPrice + dinnerPrice) * totalGuests * numNights;
    const totalPrice = (stay.price * numNights) + totalAddonPrice + totalMealPrice;

    console.log('Price breakdown:', {
      stayPrice: stay.price * numNights,
      totalAddonPrice,
      totalMealPrice,
      totalPrice
    });

    // **FIXED: Ensure proper data types for booking creation**
    const bookingData = {
      stayId: new mongoose.Types.ObjectId(stayId),
      stayName,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      addons: formattedAddons,
      breakfastPrice: Number(breakfastPrice) || 0,
      lunchPrice: Number(lunchPrice) || 0,
      dinnerPrice: Number(dinnerPrice) || 0,
      totalPrice,
      numNights,
      adults,
      children,
      userId: new mongoose.Types.ObjectId(userId), // **FIXED: Ensure ObjectId**
      userEmail,
      phone: phone || '', // **FIXED: Handle undefined phone**
      paymentStatus: 'pending',
    };

    console.log('Creating booking with data:', bookingData);

    // **IMPROVED: Better booking creation with error handling**
    let newBooking;
    try {
      newBooking = await Booking.create(bookingData);
      console.log('Booking created successfully:', newBooking._id);
    } catch (bookingError) {
      console.error('Booking creation error:', bookingError);
      
      if (bookingError.name === 'ValidationError') {
        const validationErrors = Object.values(bookingError.errors).map(err => err.message);
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationErrors 
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create booking',
        details: bookingError.message
      }, { status: 500 });
    }

    return NextResponse.json({ booking: newBooking }, { status: 201 });

  } catch (error) {
    console.error('Booking Error (Outer catch):', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID format" }, { status: 400 });
    }

    // Use findById instead of find to return a single booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking }, { status: 200 });

  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking", details: error.message },
      { status: 500 }
    );
  }
}
