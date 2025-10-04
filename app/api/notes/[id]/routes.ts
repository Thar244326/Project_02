import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);

    await connectDB();

    const note = await Note.findById(params.id);

    if (!note) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    // Just return the note reference link if available
    return NextResponse.json({
      message: 'Note accessed',
      referenceLink: note.referenceLink || null,
    });
  } catch (error) {
    console.error('Access error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
