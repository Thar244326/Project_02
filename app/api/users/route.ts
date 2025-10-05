import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Note from '@/models/Note';
import Comment from '@/models/Comment';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };
    await connectDB();
    return await User.findById(decoded.userId);
  } catch {
    return null;
  }
}

// PATCH - Update user profile (own profile only)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { name, email, currentPassword, newPassword } = await request.json();

    // Users can only update their own profile
    const targetUser = await User.findById(user._id);

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update name if provided
    if (name && name.trim()) {
      targetUser.name = name.trim();
    }

    // Update email if provided
    if (email && email.trim()) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: email.trim(), _id: { $ne: user._id } });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 400 }
        );
      }
      targetUser.email = email.trim();
    }

    // Update password if provided
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: 'Current password is required to set a new password' },
          { status: 400 }
        );
      }

      const isPasswordValid = await targetUser.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { message: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }

      targetUser.password = newPassword;
    }

    await targetUser.save();

    const updatedUser = await User.findById(user._id).select('-password');

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete own account
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Delete user's notes
    await Note.deleteMany({ uploadedBy: user._id });

    // Delete user's comments
    await Comment.deleteMany({ userId: user._id });

    // Delete the user
    await User.findByIdAndDelete(user._id);

    // Clear the auth cookie
    const response = NextResponse.json({ 
      message: 'Account deleted successfully. All your notes and comments have been removed.' 
    });
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
