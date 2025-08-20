import { connectDB } from "@/lib/db";
import StayOfflineBooking from "@/models/StayOfflineBooking";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return Response.json({ success: false, message: "Invalid booking ID" }, { status: 400 });
      }
      const booking = await StayOfflineBooking.findById(id);
      if (!booking) {
        return Response.json({ success: false, message: "Booking not found" }, { status: 404 });
      }
      return Response.json({ success: true, booking });
    }

    const bookings = await StayOfflineBooking.find().sort({ createdAt: -1 });
    return Response.json({ success: true, bookings });
  } catch (error) {
    console.error("GET Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const booking = await StayOfflineBooking.create(body);
    return Response.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ success: false, message: "Invalid booking ID" }, { status: 400 });
    }

    const body = await req.json();
    const booking = await StayOfflineBooking.findByIdAndUpdate(id, body, { new: true });

    if (!booking) {
      return Response.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    return Response.json({ success: true, booking });
  } catch (error) {
    console.error("PUT Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ success: false, message: "Invalid booking ID" }, { status: 400 });
    }

    const booking = await StayOfflineBooking.findByIdAndDelete(id);
    if (!booking) {
      return Response.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
