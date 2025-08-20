import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import jwt from 'jsonwebtoken';
import Reception from '@/models/Reception';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  await connectDB();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingAdmin = await Reception.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ error: 'Receptionist already exists' }, { status: 409 });
    }

    const newAdmin = new Reception({ email, password });
    await newAdmin.save();

    const token = jwt.sign({ id: newAdmin._id, role: 'reception' }, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({
      message: 'Receptionist registered successfully',
      token,
    });
  } catch (err) {
    console.error('Receptionist register error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
