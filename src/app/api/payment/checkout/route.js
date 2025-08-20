// File: app/api/payment/checkout/route.js
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  const { bookingPrice } = await req.json();

  const payment_capture = 1;
  const amount = bookingPrice * 100; // in paise
  const currency = 'INR';

  const options = {
    amount,
    currency,
    receipt: `receipt_order_${Date.now()}`,
    payment_capture,
  };
  const order = await razorpay.orders.create(options);

  return NextResponse.json({ order });
}
