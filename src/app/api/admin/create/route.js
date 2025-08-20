import { NextResponse } from 'next/server';
import Admin from '@/models/Admin';
import { connectDB } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  await connectDB();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 409 });
    }

    const newAdmin = new Admin({ email, password });
    await newAdmin.save();

    const token = jwt.sign({ id: newAdmin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({
      message: 'Admin registered successfully',
      token,
    });
  } catch (err) {
    console.error('Admin register error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
