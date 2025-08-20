// File: app/api/user/login-verify-otp/route.js

import { NextResponse } from 'next/server';
import User from '@/models/User';
import {connectDB} from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  await connectDB();
  const { email, otp } = await req.json();

  const user = await User.findOne({ email, isVerified: true });
  if (!user || user.verifyOtp !== otp || new Date() > user.otpExpiresAt) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
  }

  user.verifyOtp = null;
  user.otpExpiresAt = null;
  await user.save();

  const token = jwt.sign({ id: user._id, email: user.email  }, JWT_SECRET, { expiresIn: '7d' });
  return NextResponse.json({ token, user: { id: user._id, name: user.name, email: user.email } });
}
