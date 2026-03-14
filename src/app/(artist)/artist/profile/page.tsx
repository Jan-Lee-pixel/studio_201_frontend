'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/features/auth/services/authService';

export default function ArtistProfilePage() {
  const { session, profile, loading } = useAuth();
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setBio(profile?.bio || '');
    setProfileImageUrl(profile?.profileImageUrl || '');
    setSlug(profile?.slug || '');
  }, [profile]);

  const handleSave = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await authService.updateProfile(
        {
          bio: bio.trim() || undefined,
          profileImageUrl: profileImageUrl.trim() || undefined,
          slug: slug.trim() || undefined,
        },
        session.access_token
      );
      setMessage('Profile updated.');
      setBio(updated.bio || '');
      setProfileImageUrl(updated.profileImageUrl || '');
      setSlug(updated.slug || '');
    } catch (e) {
      console.error('Failed to update profile', e);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-500 font-dm-mono text-sm uppercase tracking-widest">
        Loading Profile...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-red-500 font-serif">Unauthorized. Please log in to view this page.</div>
    );
  }

  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Artist Profile</h1>
        <p className="page-subtitle text-gray-400">Update how you appear on the public artists page.</p>
      </div>

      <div className="max-w-2xl grid gap-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Email</div>
          <div className="text-lg font-body">{profile?.email}</div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-[var(--color-rule)] bg-white px-4 py-2 font-body text-sm"
            placeholder="your-name"
          />
          <p className="text-xs text-gray-400 mt-2">Used in your public URL: /artists/&lt;slug&gt;</p>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Profile Image URL</label>
          <input
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            className="w-full border border-[var(--color-rule)] bg-white px-4 py-2 font-body text-sm"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full min-h-[160px] border border-[var(--color-rule)] bg-white px-4 py-3 font-body text-sm"
            placeholder="Write a short bio..."
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--color-sienna)] text-white font-mono text-xs uppercase tracking-wider px-5 py-2 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {message && <span className="text-sm text-gray-500">{message}</span>}
        </div>
      </div>
    </div>
  );
}
