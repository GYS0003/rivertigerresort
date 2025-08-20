// File: app/api/user/login-send-otp/route.js

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
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: 'No user found with this email. Please register first.' }, { status: 404 });
  }

  if (!user.isVerified) {
    return NextResponse.json({ error: 'User not verified. Please verify your account before logging in.' }, { status: 403 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  user.verifyOtp = otp;
  user.otpExpiresAt = otpExpiresAt;
  await user.save();

  await transporter.sendMail({
    from: `"River Tiger Resort" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Your Login OTP – River Tiger Resort',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #047857;">Login to River Tiger Resort</h2>
        <p style="font-size: 16px; color: #374151;">Use the OTP below to log into your account:</p>
        <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border: 1px dashed #047857; border-radius: 6px; text-align: center;">
          <p style="font-size: 24px; color: #047857; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This OTP is valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  });

  return NextResponse.json({ message: 'OTP sent to your email' });
}

