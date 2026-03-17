'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/features/auth/services/authService';
import { createClient } from '@/lib/supabase/client';
import { mediaAssetService } from '@/features/mediaAssets/services/mediaAssetService';
import { DashboardContentSkeleton } from "@/components/ui/SkeletonPage";

export default function ArtistProfilePage() {
  const { session, profile, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [cvMediaId, setCvMediaId] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);
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
    setCvMediaId(profile?.cvMediaId ?? null);
    setCvUrl(profile?.cvUrl || '');
    setInstagramUrl(profile?.instagramUrl || '');
    setFacebookUrl(profile?.facebookUrl || '');
    setYoutubeUrl(profile?.youtubeUrl || '');
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
          cvMediaId: cvMediaId || null,
          instagramUrl: instagramUrl.trim() || null,
          facebookUrl: facebookUrl.trim() || null,
          youtubeUrl: youtubeUrl.trim() || null,
          ...(slugTouched ? { slug: slug.trim() || undefined } : {}),
        },
        session.access_token
      );
      setMessage('Profile updated.');
      setDisplayName(updated.fullName || '');
      setBio(updated.bio || '');
      setProfileImageUrl(updated.profileImageUrl || '');
      setCvMediaId(updated.cvMediaId ?? null);
      setCvUrl(updated.cvUrl || '');
      setInstagramUrl(updated.instagramUrl || '');
      setFacebookUrl(updated.facebookUrl || '');
      setYoutubeUrl(updated.youtubeUrl || '');
      setSlug(updated.slug || '');
    } catch (e) {
      console.error('Failed to update profile', e);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCvUpload = async (file: File) => {
    if (!session?.access_token || !session?.user?.id) return;
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setMessage('Please upload a PDF file.');
      return;
    }
    setUploadingCv(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const filePath = `artists/cv/${session.user.id}/cv.pdf`;
      const { error } = await supabase.storage.from('studio201-public').upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;

      const { data } = supabase.storage.from('studio201-public').getPublicUrl(filePath);
      const asset = await mediaAssetService.createAsset(
        {
          fileName: file.name,
          filePath,
          publicUrl: data.publicUrl,
          mediaType: file.type,
          altText: `${displayName || 'Artist'} CV`,
        },
        session.access_token
      );

      setCvMediaId(asset.id);
      setCvUrl(`${asset.publicUrl}?v=${Date.now()}`);
      setMessage('CV uploaded. Click "Save Changes" to publish it.');
    } catch (e) {
      console.error('Failed to upload CV', e);
      setMessage('Failed to upload CV.');
    } finally {
      setUploadingCv(false);
    }
  };

  const handleProfileImageUpload = async (file: File) => {
    if (!session?.access_token || !session?.user?.id) return;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file.');
      return;
    }
    setUploadingProfileImage(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const filePath = `artists/profile/${session.user.id}/avatar`;
      const { error } = await supabase.storage.from('studio201-public').upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;

      const { data } = supabase.storage.from('studio201-public').getPublicUrl(filePath);
      setProfileImageUrl(`${data.publicUrl}?v=${Date.now()}`);
      setMessage('Profile image uploaded. Click "Save Changes" to update your profile.');
    } catch (e) {
      console.error('Failed to upload profile image', e);
      setMessage('Failed to upload profile image.');
    } finally {
      setUploadingProfileImage(false);
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
        <h1 className="page-title">Artist Profile</h1>
        <p className="page-subtitle text-gray-400">Update how you appear on the public artists page.</p>
      </div>

      <div className="max-w-2xl grid gap-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Email</div>
          <div className="text-lg font-body">{profile?.email}</div>
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
              placeholder="your-name"
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
          <div className="mt-3 grid gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProfileImageUpload(file);
                e.currentTarget.value = '';
              }}
              className="w-full border border-[var(--color-rule)] bg-white px-4 py-2 font-body text-sm"
              disabled={uploadingProfileImage}
            />
            <p className="text-xs text-gray-400">
              Upload an image to replace the URL above.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">CV (PDF)</label>
          <div className="flex flex-col gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCvUpload(file);
                e.currentTarget.value = '';
              }}
              className="w-full border border-[var(--color-rule)] bg-white px-4 py-2 font-body text-sm"
              disabled={uploadingCv}
            />
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[var(--color-sienna)] font-mono"
              >
                View current CV
              </a>
            )}
            <p className="text-xs text-gray-400">
              Upload a PDF to show the “Download CV” button on your public profile.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Social Links</label>
          <div className="grid gap-3">
            <input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full border border-[var(--color-rule)] bg-white px-4 py-2 font-body text-sm"
              placeholder="Instagram URL"
            />
            <input
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              className="w-full border border-[var(--color-rule)] bg-white px-4 py-2 font-body text-sm"
              placeholder="Facebook URL"
            />
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full border border-[var(--color-rule)] bg-white px-4 py-2 font-body text-sm"
              placeholder="YouTube URL"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Only the links you fill in will appear on your public profile.
          </p>
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
