'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Check, X, FileText, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Note {
  _id: string;
  title: string;
  description: string;
  subject: string;
  fileName: string;
  fileSize: number;
  uploadedBy: {
    name: string;
    studentId: string;
  };
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/notes');
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges',
          variant: 'destructive',
        });
      }
    }
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchPendingNotes();
    }
  }, [user, isAdmin]);

  const fetchPendingNotes = async () => {
    try {
      const res = await fetch('/api/notes?status=pending', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending notes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (noteId: string) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          noteId,
          status: 'approved',
        }),
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Note approved successfully',
        });
        fetchPendingNotes();
      } else {
        const data = await res.json();
        toast({
          title: 'Error',
          description: data.message || 'Failed to approve note',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve note',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (noteId: string) => {
    const reason = rejectionReason[noteId];
    if (!reason) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('/api/notes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          noteId,
          status: 'rejected',
          rejectionReason: reason,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Note rejected',
        });
        setRejectionReason({ ...rejectionReason, [noteId]: '' });
        fetchPendingNotes();
      } else {
        const data = await res.json();
        toast({
          title: 'Error',
          description: data.message || 'Failed to reject note',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject note',
        variant: 'destructive',
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Review and approve pending note uploads
            </p>
          </div>
        </div>

        {notes.length === 0 ? (
          <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur">
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                No pending notes to review
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {notes.map((note) => (
              <Card key={note._id} className="border-2 border-pink-200 bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-pink-900">{note.title}</CardTitle>
                      <div className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium mt-2">
                        Pending Review
                      </div>
                    </div>
                    <FileText className="h-6 w-6 text-pink-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{note.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-muted-foreground mb-1">Subject</p>
                        <p className="text-pink-700 font-medium">{note.subject}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground mb-1">Uploaded By</p>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <p>{note.uploadedBy.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{note.uploadedBy.studentId}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground mb-1">File Info</p>
                        <p>{note.fileName}</p>
                        <p className="text-xs text-muted-foreground">{(note.fileSize / 1024).toFixed(1)} KB</p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground mb-1">Upload Date</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <p className="text-xs">{new Date(note.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold text-sm text-muted-foreground">Rejection Reason (optional)</p>
                      <Textarea
                        placeholder="If rejecting, provide a reason..."
                        value={rejectionReason[note._id] || ''}
                        onChange={(e) =>
                          setRejectionReason({
                            ...rejectionReason,
                            [note._id]: e.target.value,
                          })
                        }
                        rows={2}
                        className="border-pink-200 focus:border-pink-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(note._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(note._id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
