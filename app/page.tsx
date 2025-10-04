'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Upload, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/notes');
    }
  }, [user, loading, router]);

  if (loading) {
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
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
            Study Notes Sharing App
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
            A public platform to share and discover study notes with fellow students. 
            Share your knowledge, learn together! 📚✨
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button className="text-lg px-8 py-6">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="text-lg px-8 py-6">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle className="text-pink-900">Upload Notes</CardTitle>
              <CardDescription>
                Share your summaries and study materials with the community
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-rose-200 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-rose-600" />
              </div>
              <CardTitle className="text-rose-900">Public Feed</CardTitle>
              <CardDescription>
                All notes are public and visible immediately - like a study Facebook!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle className="text-pink-900">Comment & Discuss</CardTitle>
              <CardDescription>
                Engage with the community through comments and discussions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="max-w-3xl mx-auto border-2 border-pink-200 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-pink-900">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-pink-900">Create an Account</h3>
                  <p className="text-muted-foreground">Sign up with your student ID and email</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-rose-900">Upload or Browse</h3>
                  <p className="text-muted-foreground">Share your notes or discover study materials</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-pink-900">Instant Sharing</h3>
                  <p className="text-gray-500">Notes appear immediately in the public feed</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-rose-900">Learn Together</h3>
                  <p className="text-gray-500">Comment, discuss, and excel as a community</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border/40 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Study Notes Sharing App. Made with 💖</p>
        </div>
      </footer>
    </div>
  );
}
