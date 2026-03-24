'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/features/auth/services/authService';
import { createClient } from '@/lib/supabase/client';
import { DashboardContentSkeleton } from '@/components/ui/SkeletonPage';
import { StudioImagePlaceholder } from '@/components/ui/StudioImagePlaceholder';
import {
  WorkspaceCard,
  WorkspaceEmptyState,
  WorkspaceField,
  WorkspaceMetric,
  WorkspacePageHeader,
  WorkspaceStatusPill,
} from '@/components/ui/WorkspacePrimitives';

type ArtistProfileForm = {
  fullName: string;
  bio: string;
  profileImageUrl: string;
  slug: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const EMPTY_FORM: ArtistProfileForm = {
  fullName: '',
  bio: '',
  profileImageUrl: '',
  slug: '',
  instagramUrl: '',
  facebookUrl: '',
  youtubeUrl: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function ArtistProfilePage() {
  const { session, profile, loading } = useAuth();
  const [form, setForm] = useState<ArtistProfileForm>(EMPTY_FORM);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [localProfilePreview, setLocalProfilePreview] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveStatusTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const initialName = profile?.fullName || '';
    const initialSlug = profile?.slug || slugify(initialName);

    setForm({
      fullName: initialName,
      bio: profile?.bio || '',
      profileImageUrl: profile?.profileImageUrl || '',
      slug: initialSlug,
      instagramUrl: profile?.instagramUrl || '',
      facebookUrl: profile?.facebookUrl || '',
      youtubeUrl: profile?.youtubeUrl || '',
    });
    setShowUrlInput(false);
    setShowAdvanced(false);
    setUploadingProfileImage(false);
    setLocalProfilePreview(null);
    setSaveStatus('idle');
    setIsDirty(false);
    setSlugTouched(Boolean(initialSlug && initialSlug !== slugify(initialName)));
  }, [profile]);

  useEffect(() => {
    if (!slugTouched) {
      const nextSlug = slugify(form.fullName);
      setForm((prev) => (prev.slug === nextSlug ? prev : { ...prev, slug: nextSlug }));
    }
  }, [form.fullName, slugTouched]);

  useEffect(() => {
    return () => {
      if (localProfilePreview) {
        URL.revokeObjectURL(localProfilePreview);
      }
    };
  }, [localProfilePreview]);

  useEffect(() => {
    return () => {
      if (saveStatusTimeoutRef.current) {
        window.clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  const resetTransientStatus = () => {
    if (saveStatusTimeoutRef.current) {
      window.clearTimeout(saveStatusTimeoutRef.current);
      saveStatusTimeoutRef.current = null;
    }
    if (saveStatus !== 'saving') {
      setSaveStatus('idle');
    }
  };

  const scheduleSavedReset = () => {
    if (saveStatusTimeoutRef.current) {
      window.clearTimeout(saveStatusTimeoutRef.current);
    }
    saveStatusTimeoutRef.current = window.setTimeout(() => {
      setSaveStatus('idle');
      saveStatusTimeoutRef.current = null;
    }, 4000);
  };

  const updateField = (field: keyof ArtistProfileForm, value: string) => {
    resetTransientStatus();
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSlugChange = (value: string) => {
    const nextSlug = slugify(value);
    resetTransientStatus();
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: nextSlug }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!session?.access_token || saveStatus === 'saving' || uploadingProfileImage) return;

    if (saveStatusTimeoutRef.current) {
      window.clearTimeout(saveStatusTimeoutRef.current);
      saveStatusTimeoutRef.current = null;
    }

    setSaveStatus('saving');

    try {
      const updated = await authService.updateProfile(
        {
          fullName: form.fullName.trim() || undefined,
          bio: form.bio.trim() || undefined,
          profileImageUrl: form.profileImageUrl.trim() || undefined,
          instagramUrl: form.instagramUrl.trim() || null,
          facebookUrl: form.facebookUrl.trim() || null,
          youtubeUrl: form.youtubeUrl.trim() || null,
          ...(slugTouched ? { slug: form.slug.trim() || undefined } : {}),
        },
        session.access_token,
      );

      const savedName = updated.fullName || '';
      const savedSlug = updated.slug || slugify(savedName);

      setForm({
        fullName: savedName,
        bio: updated.bio || '',
        profileImageUrl: updated.profileImageUrl || '',
        slug: savedSlug,
        instagramUrl: updated.instagramUrl || '',
        facebookUrl: updated.facebookUrl || '',
        youtubeUrl: updated.youtubeUrl || '',
      });
      setSlugTouched(Boolean(savedSlug && savedSlug !== slugify(savedName)));
      setIsDirty(false);
      setSaveStatus('saved');
      scheduleSavedReset();
    } catch (error) {
      console.error('Failed to update artist profile', error);
      setSaveStatus('error');
    }
  };

  const handleProfileImageUpload = async (file: File) => {
    if (!session?.user?.id) return;
    if (!file.type.startsWith('image/')) {
      setSaveStatus('error');
      return;
    }

    resetTransientStatus();
    setUploadingProfileImage(true);
    setShowUrlInput(false);
    setLocalProfilePreview(URL.createObjectURL(file));

    try {
      const supabase = createClient();
      const filePath = `artists/profile/${session.user.id}/avatar`;
      const { error } = await supabase.storage.from('studio201-public').upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

      if (error) throw error;

      const { data } = supabase.storage.from('studio201-public').getPublicUrl(filePath);
      updateField('profileImageUrl', `${data.publicUrl}?v=${Date.now()}`);
      setLocalProfilePreview(null);
    } catch (error) {
      console.error('Failed to upload artist profile image', error);
      setLocalProfilePreview(null);
      setSaveStatus('error');
    } finally {
      setUploadingProfileImage(false);
    }
  };

  if (loading) {
    return <DashboardContentSkeleton />;
  }

  if (!session) {
    return <div className="p-8 font-serif text-red-500">Unauthorized. Please log in to view this page.</div>;
  }

  if (!profile) {
    return (
      <div className="content">
        <WorkspaceEmptyState
          title="Profile data is missing"
          description="The session is active, but the artist profile could not be loaded. Sign in again before editing."
        />
      </div>
    );
  }

  const previewImage = localProfilePreview || form.profileImageUrl;
  const currentSlug = form.slug || slugify(form.fullName);
  const publicProfileHref = currentSlug ? `/artists/${currentSlug}` : '/artists';
  const visibleLinksCount = [form.instagramUrl, form.facebookUrl, form.youtubeUrl].filter(Boolean).length;
  const readinessCount = [form.fullName.trim(), form.bio.trim(), previewImage].filter(Boolean).length;
  const isProfileReady = Boolean(form.fullName.trim() && form.bio.trim());
  const inputClassName =
    'w-full rounded-[18px] border border-[var(--color-rule)] bg-[var(--color-bone)] px-4 py-3.5 text-sm leading-6 text-[var(--color-near-black)] outline-none transition-colors duration-200 placeholder:text-[var(--color-dust)] focus:border-[var(--color-sienna)] focus:bg-white';
  const saveTone =
    saveStatus === 'saved'
      ? 'success'
      : saveStatus === 'saving'
        ? 'warning'
        : saveStatus === 'error'
          ? 'danger'
          : 'neutral';
  const saveCopy =
    saveStatus === 'saved'
      ? 'Profile saved'
      : saveStatus === 'saving'
        ? 'Saving changes'
        : saveStatus === 'error'
          ? 'We could not save your changes'
          : isDirty
            ? 'Unsaved changes'
            : 'All changes saved';

  return (
    <div className="content">
      <WorkspacePageHeader
        eyebrow="Artist Profile"
        title="Shape how visitors meet your practice."
        description="Update the profile, biography, and public links that power your Studio 201 artist page."
        actions={
          <Link
            href={publicProfileHref}
            className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-[var(--color-bone)]"
          >
            View Public Page
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <WorkspaceCard tone="charcoal">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)]">
                  {previewImage ? (
                    <img src={previewImage} alt={form.fullName || 'Profile photo'} className="h-full w-full object-cover" />
                  ) : (
                    <StudioImagePlaceholder className="h-full w-full rounded-full" markClassName="w-8" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-[32px] leading-none tracking-[-0.04em] text-[var(--color-cream)]">
                    {form.fullName || 'Your profile'}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.56)]">
                    {currentSlug ? `studio201 / artists / ${currentSlug}` : 'Public page not ready'}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <WorkspaceMetric label="Ready" value={`${readinessCount}/3`} note="Name, bio, and image are the minimum signals for a credible public page." />
                <WorkspaceMetric label="Links" value={visibleLinksCount} note="Only publish the channels you want visitors to use." />
              </div>

              <div className="mt-6">
                <WorkspaceStatusPill tone={isProfileReady ? 'success' : 'warning'}>
                  {isProfileReady ? 'Public page has enough core content' : 'Add a bio to complete the profile'}
                </WorkspaceStatusPill>
              </div>
            </div>
          </WorkspaceCard>

        </div>

        <div className="space-y-6">
          <WorkspaceCard>
            <div className="border-b border-[var(--color-rule)] px-6 py-5">
              <div className="font-display text-[32px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                Identity
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-warm-slate)]">
                Start with the essentials: image, name, and a short bio.
              </p>
            </div>

            <div className="space-y-6 p-6">
              <WorkspaceField
                label="Profile image"
                hint="Upload a square portrait or use an external image URL. This appears on your public artist page."
              >
                <div className="rounded-[22px] border border-[var(--color-rule)] bg-[var(--color-bone)] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="h-20 w-20 overflow-hidden rounded-full border border-[var(--color-rule)] bg-white">
                      {previewImage ? (
                        <img src={previewImage} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        <StudioImagePlaceholder className="h-full w-full rounded-full" markClassName="w-8" />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--color-near-black)] px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-cream)] transition-colors duration-200 hover:bg-[var(--color-charcoal)] disabled:cursor-not-allowed disabled:opacity-55"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingProfileImage}
                        >
                          {uploadingProfileImage ? 'Uploading Photo...' : 'Upload Photo'}
                        </button>
                        {!showUrlInput ? (
                          <button
                            type="button"
                            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-[var(--color-bone)]"
                            onClick={() => setShowUrlInput(true)}
                          >
                            Use Image URL
                          </button>
                        ) : null}
                      </div>
                      <p className="text-xs leading-5 text-[var(--color-dust)]">
                        Large uploads are allowed, but compressed images will keep the workspace faster and cheaper to
                        serve.
                      </p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.currentTarget.value = '';
                      if (file) {
                        void handleProfileImageUpload(file);
                      }
                    }}
                  />

                  {showUrlInput ? (
                    <div className="mt-4">
                      <input
                        id="imageUrl"
                        type="url"
                        className={inputClassName}
                        placeholder="https://example.com/photo.jpg"
                        value={form.profileImageUrl}
                        onChange={(event) => updateField('profileImageUrl', event.target.value)}
                      />
                    </div>
                  ) : null}
                </div>
              </WorkspaceField>

              <WorkspaceField label="Artist name" hint="This is how your name appears publicly.">
                <input
                  id="fullName"
                  type="text"
                  className={inputClassName}
                  placeholder="Your name"
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                />
              </WorkspaceField>

              <WorkspaceField label="Short bio" hint="A few sentences about your work, practice, or current focus.">
                <textarea
                  id="bio"
                  className={`${inputClassName} min-h-[140px] resize-y`}
                  placeholder="A few sentences about your work."
                  value={form.bio}
                  onChange={(event) => updateField('bio', event.target.value)}
                />
              </WorkspaceField>
            </div>
          </WorkspaceCard>

          <WorkspaceCard>
            <div className="border-b border-[var(--color-rule)] px-6 py-5">
              <div className="font-display text-[32px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                Public Links
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-warm-slate)]">
                Add only the channels you want visitors to see. Empty fields stay hidden from the public page.
              </p>
            </div>
            <div className="space-y-5 p-6">
              <WorkspaceField label="Instagram" optional="Optional">
                <input
                  id="instagram"
                  type="url"
                  className={inputClassName}
                  placeholder="https://instagram.com/yourname"
                  value={form.instagramUrl}
                  onChange={(event) => updateField('instagramUrl', event.target.value)}
                />
              </WorkspaceField>

              <WorkspaceField label="Facebook" optional="Optional">
                <input
                  id="facebook"
                  type="url"
                  className={inputClassName}
                  placeholder="https://facebook.com/yourpage"
                  value={form.facebookUrl}
                  onChange={(event) => updateField('facebookUrl', event.target.value)}
                />
              </WorkspaceField>

              <WorkspaceField label="YouTube" optional="Optional">
                <input
                  id="youtube"
                  type="url"
                  className={inputClassName}
                  placeholder="https://youtube.com/@yourchannel"
                  value={form.youtubeUrl}
                  onChange={(event) => updateField('youtubeUrl', event.target.value)}
                />
              </WorkspaceField>
            </div>
          </WorkspaceCard>

          <WorkspaceCard tone="muted">
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-display text-[28px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                    Public Page Link
                  </div>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-warm-slate)]">
                    Most artists can keep the automatic link. Only change this if you want a different public slug.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white px-4 text-xs uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-[var(--color-bone)]"
                  onClick={() => setShowAdvanced((current) => !current)}
                  aria-expanded={showAdvanced}
                >
                  {showAdvanced ? 'Hide Advanced' : 'Edit Link'}
                </button>
              </div>

              {showAdvanced ? (
                <div className="mt-5">
                  <WorkspaceField
                    label="Public slug"
                    hint="Studio 201 will use this at the end of your public URL. It updates automatically until you change it yourself."
                  >
                    <input
                      id="slug"
                      type="text"
                      className={inputClassName}
                      placeholder="your-name"
                      value={form.slug}
                      onChange={(event) => handleSlugChange(event.target.value)}
                    />
                  </WorkspaceField>
                </div>
              ) : null}
            </div>
          </WorkspaceCard>

          <div className="sticky bottom-4 z-10">
            <WorkspaceCard className="border-[rgba(26,24,20,0.14)] bg-[rgba(255,255,255,0.92)] backdrop-blur-md">
              <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                  <WorkspaceStatusPill tone={saveTone}>{saveCopy}</WorkspaceStatusPill>
                  <p className="text-xs leading-5 text-[var(--color-dust)]">
                    Saving updates your public artist page data without changing the underlying workflow.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--color-near-black)] px-6 text-xs uppercase tracking-[0.12em] text-[var(--color-cream)] transition-colors duration-200 hover:bg-[var(--color-charcoal)] disabled:cursor-not-allowed disabled:opacity-45"
                  onClick={() => void handleSave()}
                  disabled={!isDirty || saveStatus === 'saving' || uploadingProfileImage}
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </WorkspaceCard>
          </div>
        </div>
      </div>

    </div>
  );
}
