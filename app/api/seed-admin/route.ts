import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API route to create an admin user
 * Call this once: POST /api/seed-admin
 * For development/setup only - remove in production!
 */

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const adminEmail = 'admin@studynotes.com';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin user already exists!', email: existingAdmin.email },
        { status: 200 }
      );
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'admin123', // Change this in production!
      studentId: 'ADMIN001',
      role: 'admin',
    });

    return NextResponse.json({
      message: 'Admin user created successfully!',
      email: admin.email,
      note: 'Default password is "admin123" - please change after first login!',
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
