'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, CreditCard, Calendar, FileText, Upload as UploadIcon, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';

interface MyNote {
  _id: string;
  title: string;
  subject: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [myNotes, setMyNotes] = useState<MyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setEditedProfile({
        name: user.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, authLoading, router]);

  const fetchMyNotes = useCallback(async () => {
    try {
      const res = await apiFetch('/api/notes');
      const data = await res.json();
      if (res.ok) {
        // Filter notes uploaded by current user
        const userNotes = data.notes.filter(
          (note: { uploadedBy: { _id: string } }) => note.uploadedBy._id === user?._id
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
  }, [user, toast]);

  useEffect(() => {
    fetchMyNotes();
  }, [fetchMyNotes]);

  const handleEditProfile = () => {
    setEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setEditingProfile(false);
    if (user) {
      setEditedProfile({
        name: user.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!editedProfile.name.trim() || !editedProfile.email.trim()) {
      toast({
        title: 'Error',
        description: 'Name and email are required',
        variant: 'destructive',
      });
      return;
    }

    if (editedProfile.newPassword && editedProfile.newPassword !== editedProfile.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await apiFetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editedProfile.name,
          email: editedProfile.email,
          currentPassword: editedProfile.currentPassword || undefined,
          newPassword: editedProfile.newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Success',
          description: data.message,
        });
        setEditingProfile(false);
        // Refresh the page to get updated user data
        window.location.reload();
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This will permanently delete all your notes and comments. This action cannot be undone.')) {
      return;
    }

    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      toast({
        title: 'Cancelled',
        description: 'Account deletion cancelled',
      });
      return;
    }

    try {
      const res = await apiFetch('/api/users', {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Success',
          description: data.message,
        });
        logout();
        router.push('/');
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const res = await apiFetch(`/api/notes?noteId=${noteId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        setMyNotes(myNotes.filter(n => n._id !== noteId));
        toast({
          title: 'Success',
          description: data.message,
        });
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-pink-900">Account Information</CardTitle>
              {!editingProfile ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleEditProfile}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Profile
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Account
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingProfile ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className="placeholder:text-gray-400"
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Change Password (Optional)</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={editedProfile.currentPassword}
                        onChange={(e) => setEditedProfile({ ...editedProfile, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        className="placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={editedProfile.newPassword}
                        onChange={(e) => setEditedProfile({ ...editedProfile, newPassword: e.target.value })}
                        placeholder="Enter new password (min 6 characters)"
                        className="placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={editedProfile.confirmPassword}
                        onChange={(e) => setEditedProfile({ ...editedProfile, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* My Uploads */}
        <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-pink-900">My Uploads</CardTitle>
                <CardDescription>
                  Notes you&apos;ve shared with the community
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
                <p className="text-gray-500">You haven&apos;t created any notes yet.</p>
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
                    className="border border-pink-200 rounded-lg p-4 hover:bg-pink-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 cursor-pointer" onClick={() => router.push(`/notes/${note._id}`)}>
                        <h3 className="font-semibold text-pink-900">{note.title}</h3>
                        <div className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium mt-1">
                          {note.subject}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-pink-500" />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note._id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
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
