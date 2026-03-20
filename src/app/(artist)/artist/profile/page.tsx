'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/features/auth/services/authService';
import { createClient } from '@/lib/supabase/client';
import { DashboardContentSkeleton } from '@/components/ui/SkeletonPage';
import { StudioImagePlaceholder } from '@/components/ui/StudioImagePlaceholder';

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

function SaveStatusBadge({ status }: { status: SaveStatus }) {
  if (status === 'idle') return <div className="save-status" />;

  const content = {
    saving: { text: 'Saving...', className: 'status-saving' },
    saved: { text: 'Profile saved', className: 'status-saved' },
    error: {
      text: 'We could not save your changes. Please try again.',
      className: 'status-error',
    },
  }[status];

  return <p className={`save-status ${content.className}`}>{content.text}</p>;
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
        session.access_token
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
    return <div className="p-8 text-red-500 font-serif">Unauthorized. Please log in to view this page.</div>;
  }

  return (
    <>
      <style jsx>{`
        .profile-page {
          max-width: 560px;
          margin: 0 auto;
          padding: 2.5rem 1.25rem 4rem;
          font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
          color: #111;
        }

        .page-title {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.4px;
          margin: 0 0 2rem;
          color: #111;
        }

        .section {
          margin-bottom: 2rem;
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #999;
          margin: 0 0 1rem;
        }

        .card {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 1.25rem;
        }

        .photo-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .avatar-img {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #e8e8e8;
          flex-shrink: 0;
        }

        .avatar-initials {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #f0f0f0;
          border: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          color: #666;
          flex-shrink: 0;
        }

        .photo-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .btn-upload {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #111;
          background: #f4f4f4;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 6px 12px;
          cursor: pointer;
          line-height: 1;
          transition: background 0.15s;
        }

        .btn-upload:hover:not(:disabled) {
          background: #ececec;
        }

        .btn-upload:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .link-btn {
          font-size: 12px;
          color: #888;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-decoration: underline;
          text-align: left;
          font-family: inherit;
        }

        .link-btn:hover {
          color: #555;
        }

        .field {
          margin-bottom: 1rem;
        }

        .field:last-child {
          margin-bottom: 0;
        }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .field .hint {
          font-size: 12px;
          color: #aaa;
          margin-bottom: 6px;
        }

        .field input,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
          font-size: 14px;
          color: #111;
          background: #fafafa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 9px 12px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          resize: none;
          line-height: 1.5;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #aaa;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
          background: #fff;
        }

        .field textarea {
          height: 88px;
        }

        .divider {
          border: none;
          border-top: 1px solid #f0f0f0;
          margin: 1.5rem 0;
        }

        .save-area {
          margin-bottom: 0.5rem;
        }

        .btn-save {
          width: 100%;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: #111;
          border: none;
          border-radius: 10px;
          padding: 11px;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: -0.1px;
        }

        .btn-save:hover:not(:disabled) {
          opacity: 0.85;
        }

        .btn-save:active:not(:disabled) {
          transform: scale(0.99);
        }

        .btn-save:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .save-status {
          font-size: 13px;
          text-align: center;
          margin: 8px 0 0;
          min-height: 20px;
        }

        .status-saving {
          color: #aaa;
        }

        .status-saved {
          color: #22a069;
          font-weight: 500;
        }

        .status-error {
          color: #c0392b;
        }

        .optional-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .optional-badge {
          font-size: 11px;
          color: #aaa;
          background: #f5f5f5;
          border-radius: 6px;
          padding: 2px 7px;
          font-weight: 500;
        }

        .section-helper {
          font-size: 12px;
          color: #bbb;
          margin-bottom: 1rem;
        }

        .advanced-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #888;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
          margin-bottom: 6px;
        }

        .advanced-toggle:hover {
          color: #555;
        }

        .advanced-toggle .chevron {
          font-size: 10px;
          transition: transform 0.2s;
          display: inline-block;
        }

        .advanced-toggle .chevron.open {
          transform: rotate(90deg);
        }

        .advanced-helper {
          font-size: 12px;
          color: #ccc;
          margin-bottom: 10px;
        }

        .advanced-block {
          background: #fafafa;
          border: 1px solid #efefef;
          border-radius: 10px;
          padding: 1rem;
        }

        .url-input-wrap {
          margin-top: 8px;
        }

        input[type='file'] {
          display: none;
        }
      `}</style>

      <div className="content">
        <div className="profile-page">
          <h1 className="page-title">Your profile</h1>

          <section className="section">
            <p className="section-label">Basics</p>
            <div className="card">
              <div className="photo-row">
                {localProfilePreview || form.profileImageUrl ? (
                  <img
                    src={localProfilePreview || form.profileImageUrl}
                    alt="Profile photo"
                    className="avatar-img"
                  />
                ) : (
                  <StudioImagePlaceholder className="avatar-initials" markClassName="w-8" />
                )}

                <div className="photo-actions">
                  <button
                    type="button"
                    className="btn-upload"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingProfileImage}
                  >
                    {uploadingProfileImage ? 'Uploading photo...' : 'Upload photo'}
                  </button>

                  {!showUrlInput && (
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setShowUrlInput(true)}
                    >
                      Use an image from a website instead
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.currentTarget.value = '';
                  if (file) {
                    void handleProfileImageUpload(file);
                  }
                }}
              />

              {showUrlInput && (
                <div className="url-input-wrap field">
                  <label htmlFor="imageUrl">Image URL</label>
                  <div className="hint">Paste a link to an image from the web.</div>
                  <input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={form.profileImageUrl}
                    onChange={(event) => updateField('profileImageUrl', event.target.value)}
                  />
                </div>
              )}

              <hr className="divider" />

              <div className="field">
                <label htmlFor="fullName">Artist name</label>
                <div className="hint">This is how your name appears publicly.</div>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Your name"
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="bio">Short bio</label>
                <textarea
                  id="bio"
                  placeholder="A few sentences about your work."
                  value={form.bio}
                  onChange={(event) => updateField('bio', event.target.value)}
                />
              </div>

              <div className="save-area">
                <button
                  type="button"
                  className="btn-save"
                  onClick={() => void handleSave()}
                  disabled={!isDirty || saveStatus === 'saving' || uploadingProfileImage}
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save profile'}
                </button>
                <SaveStatusBadge status={saveStatus} />
              </div>
            </div>
          </section>

          <section className="section">
            <div className="optional-header">
              <p className="section-label" style={{ margin: 0 }}>
                Links
              </p>
              <span className="optional-badge">Optional</span>
            </div>
            <p className="section-helper">Add only the links you want visitors to see.</p>

            <div className="card">
              <div className="field">
                <label htmlFor="instagram">Instagram</label>
                <input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/yourname"
                  value={form.instagramUrl}
                  onChange={(event) => updateField('instagramUrl', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="facebook">Facebook</label>
                <input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/yourpage"
                  value={form.facebookUrl}
                  onChange={(event) => updateField('facebookUrl', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="youtube">YouTube</label>
                <input
                  id="youtube"
                  type="url"
                  placeholder="https://youtube.com/@yourchannel"
                  value={form.youtubeUrl}
                  onChange={(event) => updateField('youtubeUrl', event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="section">
            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setShowAdvanced((current) => !current)}
              aria-expanded={showAdvanced}
            >
              <span className={`chevron ${showAdvanced ? 'open' : ''}`}>▶</span>
              Change public page link
            </button>
            <p className="advanced-helper">Optional. Most artists can ignore this.</p>

            {showAdvanced && (
              <div className="advanced-block">
                <div className="field">
                  <label htmlFor="slug">Public page link</label>
                  <div className="hint">Your public page will appear at your chosen address.</div>
                  <input
                    id="slug"
                    type="text"
                    placeholder="your-name"
                    value={form.slug}
                    onChange={(event) => handleSlugChange(event.target.value)}
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
