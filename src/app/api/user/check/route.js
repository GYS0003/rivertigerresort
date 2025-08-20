// File: app/api/user/check/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  const { token } = await req.json();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ valid: true, userId: decoded.id });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
