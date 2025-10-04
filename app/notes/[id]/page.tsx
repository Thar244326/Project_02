'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, User, ExternalLink, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Note {
  _id: string;
  title: string;
  description: string;
  subject: string;
  referenceLink?: string;
  uploadedBy: {
    _id: string;
    name: string;
    studentId: string;
  };
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  userId: {
    _id: string;
    name: string;
    studentId: string;
  };
  createdAt: string;
}

export default function NoteDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [note, setNote] = useState<Note | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchNoteDetails();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNoteDetails = async () => {
    try {
      const res = await fetch('/api/notes', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        const foundNote = data.notes.find((n: Note) => n._id === params.id);
        if (foundNote) {
          setNote(foundNote);
        } else {
          toast({
            title: 'Error',
            description: 'Note not found',
            variant: 'destructive',
          });
          router.push('/notes');
        }
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      toast({
        title: 'Error',
        description: 'Failed to load note',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?noteId=${params.id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          noteId: params.id,
          content: newComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments([data.comment, ...comments]);
        setNewComment('');
        toast({
          title: 'Success',
          description: 'Comment posted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to post comment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
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

  if (!note) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/notes')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notes
        </Button>

        {/* Note Details */}
        <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl text-pink-900 mb-2">{note.title}</CardTitle>
                <CardDescription className="text-lg">{note.subject}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{note.description}</p>
            </div>

            {note.referenceLink && (
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <h4 className="font-semibold text-pink-900 mb-2 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Reference Link
                </h4>
                <a
                  href={note.referenceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 underline break-all"
                >
                  {note.referenceLink}
                </a>
              </div>
            )}

            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{note.uploadedBy.name} ({note.uploadedBy.studentId})</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-900">
              <MessageCircle className="h-5 w-5" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <Textarea
                placeholder="Share your thoughts or ask a question..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2 border-pink-200 focus:border-pink-500"
                rows={3}
              />
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="border border-pink-100 rounded-lg p-4 bg-white/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-pink-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-pink-900">
                            {comment.userId.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comment.userId.studentId}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap ml-10">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
