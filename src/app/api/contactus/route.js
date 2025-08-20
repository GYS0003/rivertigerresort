import { NextResponse } from 'next/server';
import ContactUs from '@/models/ContactUs';
import { connectDB } from '@/lib/db';
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// POST: Handle contact form submission
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { firstName, lastName, phone, email, message } = body;

    if (!firstName || !lastName || !phone || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await ContactUs.create({ firstName, lastName, phone, email, message });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Thanks for contacting us!',
      html: `
        <p>Hi ${firstName},</p>
        <p>Thanks for reaching out. We've received your message and will get back to you shortly.</p>
        <hr/>
        <p><strong>Your Message:</strong></p>
        <p>${message}</p>
        <br/>
        <p>Regards,<br/>Support Team</p>
      `
    });

    return NextResponse.json({ success: true, message: 'Message received and email sent.' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 });
  }
}

// GET: Return all contact messages (Admin access suggested)
export async function GET() {
  try {
    await connectDB();

    const messages = await ContactUs.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
