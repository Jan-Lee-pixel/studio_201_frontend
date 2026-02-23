'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { authService, UserProfile } from '@/features/auth/services/authService';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading && !user) setProfileLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user profile.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center h-64 font-dm-mono text-gray-500 uppercase tracking-widest text-sm">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 border border-red-200">
        Error: {error}
      </div>
    );
  }

  if (!profile) {
    return <div>User profile not found. Please log in again.</div>;
  }

  return (
    <div className="font-karla">
      <h1 className="text-3xl font-playfair font-medium text-gray-900 mb-2">
        Welcome, {profile.fullName}
      </h1>
      <p className="text-gray-600 mb-8 border-b pb-4">
        You are signed in as an <span className="font-dm-mono font-medium text-black uppercase tracking-wider text-xs">{profile.role}</span>.
      </p>

      {profile.role === 'Admin' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-gray-100 shadow-sm">
            <h2 className="text-xl font-playfair font-medium mb-2">Manage Exhibitions</h2>
            <p className="text-sm text-gray-600 mb-4">Create and curate upcoming gallery exhibitions.</p>
            <button className="uppercase tracking-widest text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors font-dm-mono">
              View All
            </button>
          </div>
          <div className="p-6 bg-white border border-gray-100 shadow-sm">
            <h2 className="text-xl font-playfair font-medium mb-2">Artwork Submissions</h2>
            <p className="text-sm text-gray-600 mb-4">Review and approve artworks submitted by artists.</p>
            <button className="uppercase tracking-widest text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors font-dm-mono">
              Pending (0)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 bg-white border border-gray-100 shadow-sm md:w-1/2">
            <h2 className="text-xl font-playfair font-medium mb-2">Submit Artwork</h2>
            <p className="text-sm text-gray-600 mb-4">Upload a new piece of artwork for review in an upcoming exhibition.</p>
            <button className="uppercase tracking-widest text-xs border border-transparent bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors font-dm-mono">
              New Submission
            </button>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-playfair font-medium mb-4">My Submissions</h2>
            <div className="text-sm text-gray-500 italic">
              You haven't submitted any artworks yet.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
