'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/features/auth/services/authService';
import { createClient } from '@/lib/supabase/client';
import { DashboardContentSkeleton } from "@/components/ui/SkeletonPage";

export default function ArtistProfilePage() {
  const { session, profile, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [localProfilePreview, setLocalProfilePreview] = useState<string | null>(null);
  const [profileImageMode, setProfileImageMode] = useState<'url' | 'upload'>('url');
  const [profileImageFileName, setProfileImageFileName] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
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
    setLocalProfilePreview(null);
    setProfileImageMode(profile?.profileImageUrl ? 'url' : 'upload');
    setProfileImageFileName('');
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

  useEffect(() => {
    return () => {
      if (localProfilePreview) {
        URL.revokeObjectURL(localProfilePreview);
      }
    };
  }, [localProfilePreview]);

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
      setLocalProfilePreview(null);
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
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Profile Image</label>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              className={`px-3 py-1 border text-[11px] font-mono uppercase tracking-[0.12em] transition-colors ${
                profileImageMode === 'url'
                  ? "bg-[var(--color-near-black)] text-[var(--color-cream)] border-[var(--color-near-black)]"
                  : "bg-white text-[var(--color-near-black)] border-[var(--color-rule)]"
              }`}
              onClick={() => {
                setProfileImageMode('url');
                if (localProfilePreview) {
                  URL.revokeObjectURL(localProfilePreview);
                  setLocalProfilePreview(null);
                }
              }}
            >
              Image URL
            </button>
            <button
              type="button"
              className={`px-3 py-1 border text-[11px] font-mono uppercase tracking-[0.12em] transition-colors ${
                profileImageMode === 'upload'
                  ? "bg-[var(--color-near-black)] text-[var(--color-cream)] border-[var(--color-near-black)]"
                  : "bg-white text-[var(--color-near-black)] border-[var(--color-rule)]"
              }`}
              onClick={() => setProfileImageMode('upload')}
            >
              Upload Image
            </button>
          </div>

          {profileImageMode === 'url' ? (
            <div className="grid gap-3">
              <input
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                className="w-full border border-[var(--color-rule)] bg-white px-4 py-2 font-body text-sm"
                placeholder="https://..."
              />
              <p className="text-xs text-gray-400">
                Paste a direct image URL to use on your public profile.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (localProfilePreview) {
                      URL.revokeObjectURL(localProfilePreview);
                    }
                    const previewUrl = URL.createObjectURL(file);
                    setLocalProfilePreview(previewUrl);
                    setProfileImageFileName(file.name);
                    handleProfileImageUpload(file);
                  } else {
                    setProfileImageFileName('');
                  }
                  e.currentTarget.value = '';
                }}
                className="sr-only"
                disabled={uploadingProfileImage}
              />
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="profile-image-upload"
                  className="inline-flex items-center justify-center px-4 py-2 border border-[var(--color-near-black)] bg-[var(--color-near-black)] text-[var(--color-cream)] font-mono text-[11px] uppercase tracking-[0.12em] cursor-pointer transition-colors hover:bg-[var(--color-sienna)] hover:border-[var(--color-sienna)]"
                >
                  Choose Image
                </label>
                <span className="text-xs text-gray-500 font-body">
                  {profileImageFileName || "No file selected"}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Upload an image to replace the current profile photo.
              </p>
            </div>
          )}

          <div className="mt-4 w-full max-w-[240px]">
            <div className="aspect-square w-full overflow-hidden border border-[var(--color-rule)] bg-[var(--color-bone)]">
              <img
                src={
                  localProfilePreview ||
                  profileImageUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                }
                alt={displayName || "Artist profile"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 font-mono">
              {uploadingProfileImage ? "Uploading..." : "Preview"}
            </div>
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
