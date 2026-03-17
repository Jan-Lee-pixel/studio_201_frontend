'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/features/auth/services/authService';
import { DashboardContentSkeleton } from "@/components/ui/SkeletonPage";

export default function AdminSettingsPage() {
  const { session, profile, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugEditable, setSlugEditable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  useEffect(() => {
    const initialName = profile?.fullName || '';
    const initialSlug = profile?.slug || '';
    setDisplayName(initialName);
    setBio(profile?.bio || '');
    setProfileImageUrl(profile?.profileImageUrl || '');
    setSlug(initialSlug);
    setSlugTouched(false);
    setSlugEditable(false);
  }, [profile]);

  useEffect(() => {
    if (!slugTouched && displayName) {
      setSlug(slugify(displayName));
    }
  }, [displayName, slugTouched]);

  const handleSave = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await authService.updateProfile(
        {
          fullName: displayName.trim() || undefined,
          bio: bio.trim() || undefined,
          profileImageUrl: profileImageUrl.trim() || undefined,
          ...(slugTouched ? { slug: slug.trim() || undefined } : {}),
        },
        session.access_token
      );
      setMessage('Settings saved.');
      setDisplayName(updated.fullName || '');
      setBio(updated.bio || '');
      setProfileImageUrl(updated.profileImageUrl || '');
      setSlug(updated.slug || '');
    } catch (e) {
      console.error('Failed to update profile', e);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardContentSkeleton />;
  }

  if (!session) {
    return (
      <div className="p-8 text-red-500 font-serif">Unauthorized. Please log in to view this page.</div>
    );
  }

  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle text-gray-400">Update your admin profile details.</p>
      </div>

      <div className="max-w-2xl grid gap-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Email</div>
          <div className="text-lg font-body">{profile?.email}</div>
        </div>

        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Role</div>
          <div className="text-lg font-body" style={{ textTransform: 'capitalize' }}>
            {profile?.role ?? profile?.accountStatus}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Display Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-[var(--color-rule)] bg-white px-4 py-2 font-body text-sm"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Public Link</label>
          <div className="flex items-center gap-3">
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="w-full border border-[var(--color-rule)] bg-white px-4 py-2 font-body text-sm disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="admin-name"
              disabled={!slugEditable}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSlugEditable((prev) => !prev);
                setSlugTouched(true);
              }}
            >
              {slugEditable ? "Done" : "Customize (optional)"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            This link is auto-generated from your display name. You can ignore this unless you want a custom link.
          </p>
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
