// File: app/api/user/send-otp/route.js

import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import nodemailer from 'nodemailer';

const OTP_EXPIRY_MINUTES = 5;

// Fix: should be createTransport, not createTransporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function POST(req) {
  try {
    await connectDB();
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    let user;
    let isNewUser = false;

    // SCENARIO 1: User exists - Update with new OTP
    if (existingUser) {
      console.log(`Existing user found: ${email}. Updating OTP.`);
      user = await User.findOneAndUpdate(
        { email },
        { 
          name, 
          verifyOtp: otp, 
          otpExpiresAt,
          isVerified: false
        },
        { new: true }
      );
      console.log(`OTP updated for existing user: ${email}`);
    } 
    // SCENARIO 2: New user - Create with OTP
    else {
      console.log(`New user registration: ${email}. Creating user with OTP.`);
      user = await User.create({ 
        name, 
        email, 
        verifyOtp: otp, 
        otpExpiresAt,
        isVerified: false
      });
      isNewUser = true;
      console.log(`New user created with OTP: ${email}`);
    }

    // SEND OTP EMAIL FOR BOTH SCENARIOS
    console.log(`Sending OTP email to: ${email} (${isNewUser ? 'New User' : 'Existing User'})`);
    
    await transporter.sendMail({
      from: `"River Tiger Resort" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `${isNewUser ? 'Verify Your Email Address' : 'Email Verification Required'} – River Tiger Resort`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #047857;">${isNewUser ? 'Welcome to River Tiger Resort' : 'Email Verification'}, ${name}!</h2>
          
          <p style="font-size: 16px; color: #374151;">
            ${isNewUser 
              ? 'Thank you for signing up with River Tiger Resort!' 
              : 'You have requested email verification for your account.'
            }
          </p>
          
          <p style="font-size: 16px; color: #374151;">
            To ${isNewUser ? 'complete your registration' : 'verify your email address'}, please use the One-Time Password (OTP) below:
          </p>
          
          <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border: 1px dashed #047857; border-radius: 6px; text-align: center;">
            <p style="font-size: 24px; color: #047857; font-weight: bold; letter-spacing: 4px;">${otp}</p>
          </div>
    
          <p style="font-size: 14px; color: #6b7280;">This OTP is valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong>. Please do not share it with anyone.</p>
          <p style="font-size: 14px; color: #6b7280;">If you did not request this email, please ignore it or contact us immediately.</p>
    
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #9ca3af;">Need help? Reach out to us at info.rivertigerresort@gmail.com</p>
        </div>
      `
    });

    

    // Return success response with different messages for each scenario
    return NextResponse.json({ 
      message: isNewUser 
        ? 'Registration successful! OTP sent to your email.' 
        : 'OTP sent to your email for verification.',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        isNewUser: isNewUser
      },
      otpSent: true
    }, { status: isNewUser ? 201 : 200 });

  } catch (error) {
    
    
    // Handle specific email sending errors
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      return NextResponse.json({ 
        error: 'Email service configuration error. Please contact support.' 
      }, { status: 500 });
    }
    
    // Handle nodemailer specific errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNECTION') {
      return NextResponse.json({ 
        error: 'Unable to connect to email service. Please try again later.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error. Please try again later.' 
    }, { status: 500 });
  }
}
