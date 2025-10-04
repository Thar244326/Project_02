import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password, studentId } = await request.json();

    // Validation
    if (!name || !email || !password || !studentId) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { studentId }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { message: 'Email already registered' },
          { status: 409 }
        );
      }
      if (existingUser.studentId === studentId) {
        return NextResponse.json(
          { message: 'Student ID already registered' },
          { status: 409 }
        );
      }
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      studentId,
      role: 'user',
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response with user data
    const userData = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      role: user.role,
    };

    const response = NextResponse.json({
      message: 'Registration successful',
      user: userData,
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
