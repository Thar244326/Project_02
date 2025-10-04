import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper to get user from token
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

// GET - Fetch all public notes
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');

    // Replace let query with const
    const query: { subject?: string } = {};

    if (subject) {
      query.subject = subject;
    }

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name studentId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Fetch notes error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fix type annotations for any
type NoteData = {
  title: string;
  description: string;
  subject: string;
  referenceLink?: string;
};

// Update the handler signature
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const data: NoteData = await request.json();
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { title, description, subject, referenceLink } = data;

    if (!title || !description || !subject) {
      return NextResponse.json(
        { message: 'Title, description, and subject are required' },
        { status: 400 }
      );
    }

    const note = await Note.create({
      title,
      description,
      subject,
      referenceLink: referenceLink || '',
      uploadedBy: user._id,
    });

    return NextResponse.json({
      message: 'Note shared successfully!',
      note,
    });
  } catch (error) {
    console.error('Upload note error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update note status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { noteId, status, rejectionReason } = await request.json();

    if (!noteId || !status) {
      return NextResponse.json(
        { message: 'Note ID and status are required' },
        { status: 400 }
      );
    }

    const updateData: { status: string; rejectionReason?: string } = { status };
    
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const note = await Note.findByIdAndUpdate(noteId, updateData, {
      new: true,
    }).populate('uploadedBy', 'name studentId');

    if (!note) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: `Note ${status} successfully`,
      note,
    });
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a note (admin or uploader)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');

    if (!noteId) {
      return NextResponse.json(
        { message: 'Note ID is required' },
        { status: 400 }
      );
    }

    const note = await Note.findById(noteId);

    if (!note) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    // Check if user is admin or the uploader
    if (user.role !== 'admin' && note.uploadedBy.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await Note.findByIdAndDelete(noteId);

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
