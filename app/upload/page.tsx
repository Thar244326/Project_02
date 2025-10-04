'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload as UploadIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    referenceLink: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiFetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Success!',
          description: 'Your note has been shared with the community!',
        });
        router.push('/notes');
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to upload note',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload note',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
            Upload Study Notes
          </h1>
          <p className="text-muted-foreground">
            Share your knowledge with fellow students
          </p>
        </div>

        <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-pink-900">Note Details</CardTitle>
            <CardDescription>
              Share your study notes with the community. Your notes will be visible to everyone immediately!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Calculus Final Exam Summary"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="border-pink-200 focus:border-pink-500 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, Physics, Computer Science"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="border-pink-200 focus:border-pink-500 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what these notes cover..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="border-pink-200 focus:border-pink-500 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceLink">Reference Link (Optional)</Label>
                <Input
                  id="referenceLink"
                  type="url"
                  placeholder="https://example.com/additional-resources"
                  value={formData.referenceLink}
                  onChange={(e) => setFormData({ ...formData, referenceLink: e.target.value })}
                  className="border-pink-200 focus:border-pink-500 placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-500">
                  Add a link to additional resources, related materials, or external references.
                </p>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-pink-900 mb-1">Note:</p>
                <ul className="list-disc list-inside text-pink-700 space-y-1">
                  <li>Your note will be visible to everyone immediately</li>
                  <li>Reference link is optional - share external resources if helpful</li>
                  <li>Students can view, discuss, and comment on your notes</li>
                  <li>Only educational content is allowed</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  'Sharing...'
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Share Note
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}