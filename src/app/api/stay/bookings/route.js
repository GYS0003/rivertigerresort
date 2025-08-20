import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import { getTokenData } from '@/lib/jwt';

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
        // return Response.json({ message: 'Invalid or expired token' }, { status: 401 });
      }
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    return Response.json({ bookings });
  } catch (err) {
    console.error('Error fetching stay bookings:', err);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
