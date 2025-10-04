'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, CreditCard, Calendar, FileText, Upload as UploadIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MyNote {
  _id: string;
  title: string;
  subject: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [myNotes, setMyNotes] = useState<MyNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchMyNotes();
    }
  }, [user]);

  const fetchMyNotes = async () => {
    try {
      const res = await fetch('/api/notes', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        // Filter notes uploaded by current user
        const userNotes = data.notes.filter(
          (note: any) => note.uploadedBy._id === user?._id
        );
        setMyNotes(userNotes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your notes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account and uploads
          </p>
        </div>

        {/* User Info Card */}
        <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur mb-8">
          <CardHeader>
            <CardTitle className="text-pink-900">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Student ID</p>
                  <p className="font-medium">{user.studentId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Uploads */}
        <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-pink-900">My Uploads</CardTitle>
                <CardDescription>
                  Notes you've shared with the community
                </CardDescription>
              </div>
              <Button onClick={() => router.push('/upload')}>
                <UploadIcon className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myNotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">You haven't uploaded any notes yet</p>
                <Button className="mt-4" onClick={() => router.push('/upload')}>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Share Your First Note
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myNotes.map((note) => (
                  <div
                    key={note._id}
                    className="border border-pink-200 rounded-lg p-4 hover:bg-pink-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/notes/${note._id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-pink-900">{note.title}</h3>
                        <div className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium mt-1">
                          {note.subject}
                        </div>
                      </div>
                      <FileText className="h-5 w-5 text-pink-500" />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
