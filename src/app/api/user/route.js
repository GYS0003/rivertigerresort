// File: app/api/user/send-otp/route.js

import { NextResponse } from 'next/server';
import User from '@/models/User';
import {connectDB} from '@/lib/db';
import nodemailer from 'nodemailer';

const OTP_EXPIRY_MINUTES = 5;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function POST(req) {
  await connectDB();
  const { name, email } = await req.json();

  if (!name || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  let user = await User.findOne({ email });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  if (!user) {
    user = await User.create({ name, email, verifyOtp: otp, otpExpiresAt });
  } else {
    user.name = name;
    user.verifyOtp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();
  }

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Verify your email',
    text: `Your OTP is ${otp}`,
  });

  return NextResponse.json({ message: 'OTP sent to email' });
}