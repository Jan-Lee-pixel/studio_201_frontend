'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { exhibitionService } from '@/features/exhibitions/services/exhibitionService';
import { mediaAssetService } from '@/features/mediaAssets/services/mediaAssetService';
import {
  artworkSubmissionService,
  ArtworkSubmission,
} from '@/features/submissions/services/artworkSubmissionService';
import { artistService, PublicUserProfile } from '@/features/artists/services/artistService';
import { DashboardContentSkeleton } from "@/components/ui/SkeletonPage";

const COVER_BUCKET = 'studio201-public';
const MAX_FILE_SIZE_MB = 20;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const sortByDisplayOrder = (left: ArtworkSubmission, right: ArtworkSubmission) => {
  const leftOrder = left.displayOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.displayOrder ?? Number.MAX_SAFE_INTEGER;
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
};

const formatShortDate = (value?: string) => {
  if (!value) return 'Unknown date';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function ExhibitionEditPage() {
  const params = useParams();
  const exhibitionId = params.id as string;
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<ArtworkSubmission[]>([]);
  const [artists, setArtists] = useState<PublicUserProfile[]>([]);
  const [allExhibitions, setAllExhibitions] = useState<{ id: string; title: string }[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [curating, setCurating] = useState(false);
  const [selectedApprovedSubmissionId, setSelectedApprovedSubmissionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setSubmissionsLoading(true);
      setMessage(null);
      try {
        const [exhibition, allSubmissionData, allExhibitionData, allArtistData] = await Promise.all([
          exhibitionService.getExhibitionById(exhibitionId),
          artworkSubmissionService.getAllSubmissions().catch(() => []),
          exhibitionService.getAllExhibitions().catch(() => []),
          artistService.getArtists().catch(() => []),
        ]);
        if (!mounted) return;
        setTitle(exhibition.title || '');
        setSlug(exhibition.slug || '');
        setDescription(exhibition.description || '');
        setStartDate(exhibition.startDate || '');
        setEndDate(exhibition.endDate || '');
        setIsFeatured(!!exhibition.isFeatured);
        setCoverMediaId(exhibition.coverMediaId ?? null);
        setCoverImageUrl(exhibition.coverImageUrl ?? null);
        setSubmissions(allSubmissionData);
        setAllExhibitions(
          allExhibitionData.map((item) => ({
            id: item.id,
            title: item.title,
          }))
        );
        setArtists(allArtistData);
      } catch (e) {
        console.error('Failed to load exhibition', e);
        if (mounted) setMessage('Failed to load exhibition.');
      } finally {
        if (mounted) {
          setLoading(false);
          setSubmissionsLoading(false);
        }
      }
    };

    if (exhibitionId) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [exhibitionId]);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  useEffect(() => {
    if (!selectedFile) {
      setLocalPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const coverPreview = localPreview || coverImageUrl;

  const exhibitionTitleLookup = Object.fromEntries(allExhibitions.map((item) => [item.id, item.title]));
  const artistLookup = Object.fromEntries(artists.map((artist) => [artist.id, artist]));
  const approvedAssignedWorks = submissions
    .filter((item) => item.exhibitionId === exhibitionId && item.status === 'Approved')
    .sort(sortByDisplayOrder);
  const availableApprovedWorks = submissions
    .filter((item) => item.status === 'Approved' && item.exhibitionId !== exhibitionId)
    .sort((left, right) => left.title.localeCompare(right.title));
  const pendingAssignedCount = submissions.filter(
    (item) => item.exhibitionId === exhibitionId && item.status === 'Pending'
  ).length;
  const hiddenAssignedCount = approvedAssignedWorks.filter((item) => !item.isVisibleInExhibition).length;

  const applySubmissionUpdate = (updatedSubmission: ArtworkSubmission) => {
    setSubmissions((prev) =>
      prev.map((item) => (item.id === updatedSubmission.id ? updatedSubmission : item))
    );
  };

  const handleToggleVisibility = async (submission: ArtworkSubmission) => {
    setCurating(true);
    setMessage(null);
    try {
      const updated = await artworkSubmissionService.updateCuration(submission.id, {
        isVisibleInExhibition: !submission.isVisibleInExhibition,
      });
      applySubmissionUpdate(updated);
      setMessage(
        updated.isVisibleInExhibition
          ? `"${updated.title}" is now visible on the exhibition page.`
          : `"${updated.title}" is now hidden from the exhibition page.`
      );
    } catch (error) {
      console.error('Failed to update exhibition visibility', error);
      setMessage('Failed to update exhibition visibility.');
    } finally {
      setCurating(false);
    }
  };

  const handleMoveWork = async (submissionId: string, direction: -1 | 1) => {
    const ordered = approvedAssignedWorks.map((item, index) => ({
      ...item,
      displayOrder: item.displayOrder ?? index,
    }));
    const currentIndex = ordered.findIndex((item) => item.id === submissionId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
      return;
    }

    const currentItem = ordered[currentIndex];
    const targetItem = ordered[targetIndex];

    setCurating(true);
    setMessage(null);

    try {
      const updatedCurrent = await artworkSubmissionService.updateCuration(currentItem.id, {
        displayOrder: targetIndex,
      });
      const updatedTarget = await artworkSubmissionService.updateCuration(targetItem.id, {
        displayOrder: currentIndex,
      });
      setSubmissions((prev) =>
        prev.map((item) => {
          if (item.id === updatedCurrent.id) return updatedCurrent;
          if (item.id === updatedTarget.id) return updatedTarget;
          return item;
        })
      );
      setMessage(`Updated artwork order for "${updatedCurrent.title}".`);
    } catch (error) {
      console.error('Failed to reorder artworks', error);
      setMessage('Failed to reorder artworks.');
    } finally {
      setCurating(false);
    }
  };

  const handleAddApprovedWork = async () => {
    if (!selectedApprovedSubmissionId) {
      setMessage('Choose an approved artwork first.');
      return;
    }

    const nextOrder = approvedAssignedWorks.length;
    setCurating(true);
    setMessage(null);

    try {
      const updated = await artworkSubmissionService.updateCuration(selectedApprovedSubmissionId, {
        exhibitionId,
        isVisibleInExhibition: true,
        displayOrder: nextOrder,
      });
      applySubmissionUpdate(updated);
      setSelectedApprovedSubmissionId('');
      setMessage(`"${updated.title}" was moved into this exhibition.`);
    } catch (error) {
      console.error('Failed to add approved artwork to exhibition', error);
      setMessage('Failed to move artwork into this exhibition.');
    } finally {
      setCurating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      setMessage('Title and slug are required.');
      return;
    }
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setMessage('End date cannot be earlier than start date.');
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      let nextCoverMediaId = coverMediaId;
      let uploadedFilePath: string | null = null;

      if (selectedFile) {
        const fileSizeMb = selectedFile.size / (1024 * 1024);
        if (fileSizeMb > MAX_FILE_SIZE_MB) {
          setMessage(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
          setSaving(false);
          return;
        }

        const extensionFromName = selectedFile.name.split('.').pop();
        const extensionFromType = selectedFile.type?.split('/').pop();
        const extension = extensionFromName || extensionFromType || 'jpg';
        const uuid =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const filePath = `exhibitions/${exhibitionId}/${uuid}.${extension}`;
        const uploadResult = await supabase.storage.from(COVER_BUCKET).upload(filePath, selectedFile, {
          contentType: selectedFile.type || 'image/jpeg',
          upsert: false,
        });

        if (uploadResult.error) {
          console.error('Cover upload failed:', uploadResult.error);
          setMessage('Failed to upload cover image.');
          setSaving(false);
          return;
        }

        uploadedFilePath = filePath;
        const { data: publicData } = supabase.storage.from(COVER_BUCKET).getPublicUrl(filePath);
        const asset = await mediaAssetService
          .createAsset({
            fileName: selectedFile.name,
            filePath,
            publicUrl: publicData.publicUrl,
            mediaType: selectedFile.type || 'image/jpeg',
            altText: title.trim(),
          })
          .catch(async (error) => {
            if (uploadedFilePath) {
              await supabase.storage.from(COVER_BUCKET).remove([uploadedFilePath]);
            }
            throw error;
          });

        nextCoverMediaId = asset.id;
        setCoverImageUrl(asset.publicUrl);
      }

      await exhibitionService.updateExhibition(exhibitionId, {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        startDate: startDate || null,
        endDate: endDate || null,
        coverMediaId: nextCoverMediaId || null,
        isFeatured,
      });

      setCoverMediaId(nextCoverMediaId || null);
      setSelectedFile(null);
      setMessage('Exhibition updated.');
    } catch (e) {
      console.error('Failed to update exhibition', e);
      setMessage('Failed to update exhibition.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardContentSkeleton />;
  }

  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Edit Exhibition</h1>
        <p className="page-subtitle text-gray-400">Update exhibition details and cover image.</p>
      </div>

      {message && (
        <div className="p-3 mb-6 text-sm text-gray-600 bg-[var(--color-bone)] rounded font-dm-mono">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="border border-[var(--color-rule)] bg-white p-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Title</label>
              <input
                className="w-full border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Slug</label>
              <input
                className="w-full border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Description</label>
              <textarea
                className="w-full min-h-[160px] border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <label className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-gray-400">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Featured Exhibition
            </label>
          </div>
        </div>

        <div className="border border-[var(--color-rule)] bg-[var(--color-bone)] p-6">
          <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-4">Cover Image</div>
          <div className="aspect-[4/3] bg-gray-200 border border-[var(--color-rule)] mb-4 overflow-hidden">
            {coverPreview ? (
              <img src={coverPreview} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-mono uppercase">
                No cover image
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
          <p className="mt-2 text-xs text-gray-400 font-mono">Recommended: 1800px wide, JPEG or PNG.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--color-sienna)] text-white font-mono text-xs uppercase tracking-wider px-5 py-2 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <Link href="/admin/exhibitions" className="text-xs font-mono uppercase tracking-widest text-gray-400">
          Back to Exhibitions
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-8 mt-10">
        <section className="border border-[var(--color-rule)] bg-white p-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">
                Exhibition curation
              </div>
              <h2 className="font-display text-2xl text-[var(--color-near-black)]">
                Works in this exhibition
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Approved works can be shown, hidden, and ordered for the public exhibition page.
              </p>
            </div>
            <Link href="/admin/submissions" className="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-[var(--color-sienna)]">
              Review Queue
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex px-3 py-2 bg-[var(--color-bone)] text-xs font-mono uppercase tracking-widest text-gray-500">
              {approvedAssignedWorks.length} approved works
            </span>
            <span className="inline-flex px-3 py-2 bg-[var(--color-bone)] text-xs font-mono uppercase tracking-widest text-gray-500">
              {hiddenAssignedCount} hidden from public view
            </span>
            <span className="inline-flex px-3 py-2 bg-[var(--color-bone)] text-xs font-mono uppercase tracking-widest text-gray-500">
              {pendingAssignedCount} pending submissions assigned here
            </span>
          </div>

          {submissionsLoading ? (
            <div className="text-sm text-gray-500">Loading exhibition works...</div>
          ) : approvedAssignedWorks.length === 0 ? (
            <div className="border border-dashed border-[var(--color-rule)] p-6 text-sm text-gray-500 bg-[var(--color-bone)]">
              No approved artworks are curated into this exhibition yet.
            </div>
          ) : (
            <div className="space-y-4">
              {approvedAssignedWorks.map((submission, index) => {
                const artist = artistLookup[submission.artistId];
                const canMoveUp = index > 0;
                const canMoveDown = index < approvedAssignedWorks.length - 1;

                return (
                  <div key={submission.id} className="border border-[var(--color-rule)] bg-[var(--color-bone)] p-4">
                    <div className="grid grid-cols-1 md:grid-cols-[84px_minmax(0,1fr)_auto] gap-4 items-start">
                      <div className="w-[84px] h-[84px] bg-white border border-[var(--color-rule)] overflow-hidden flex items-center justify-center">
                        {submission.mediaAssetUrl ? (
                          <img src={submission.mediaAssetUrl} alt={submission.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-mono uppercase text-gray-400">Artwork</span>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <div className="font-medium text-[var(--color-near-black)]">{submission.title}</div>
                          <span className={`inline-flex px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm ${
                            submission.isVisibleInExhibition
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {submission.isVisibleInExhibition ? 'Visible' : 'Hidden'}
                          </span>
                          <span className="inline-flex px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm bg-white text-gray-500 border border-[var(--color-rule)]">
                            Order {submission.displayOrder ?? index}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 leading-6">
                          {artist?.fullName || 'Unknown artist'} · {submission.category || 'Uncategorized'}
                          {submission.artType ? ` · ${submission.artType}` : ''} · Approved {formatShortDate(submission.approvedAt || submission.createdAt)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() => void handleMoveWork(submission.id, -1)}
                          disabled={!canMoveUp || curating}
                          className="border border-[var(--color-rule)] bg-white px-3 py-2 text-xs font-mono uppercase tracking-widest text-gray-500 disabled:opacity-40"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleMoveWork(submission.id, 1)}
                          disabled={!canMoveDown || curating}
                          className="border border-[var(--color-rule)] bg-white px-3 py-2 text-xs font-mono uppercase tracking-widest text-gray-500 disabled:opacity-40"
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggleVisibility(submission)}
                          disabled={curating}
                          className="border border-[var(--color-rule)] bg-white px-3 py-2 text-xs font-mono uppercase tracking-widest text-gray-500 disabled:opacity-40"
                        >
                          {submission.isVisibleInExhibition ? 'Hide' : 'Show'}
                        </button>
                        {submission.mediaAssetUrl ? (
                          <a
                            href={submission.mediaAssetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="border border-[var(--color-rule)] bg-white px-3 py-2 text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-[var(--color-sienna)]"
                          >
                            Open Image
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="border border-[var(--color-rule)] bg-[var(--color-bone)] p-6">
          <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">
            Add approved artwork
          </div>
          <h2 className="font-display text-2xl text-[var(--color-near-black)] mb-3">
            Move approved works into this exhibition
          </h2>
          <p className="text-sm text-gray-500 leading-6 mb-5">
            This uses the current `ArtworkSubmission` system. Moving a work here changes its
            exhibition assignment and places it at the end of this exhibition&apos;s public order.
          </p>

          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-400">
              Approved artwork
            </label>
            <select
              value={selectedApprovedSubmissionId}
              onChange={(event) => setSelectedApprovedSubmissionId(event.target.value)}
              className="w-full border border-[var(--color-rule)] bg-white px-3 py-3 text-sm"
              disabled={curating || availableApprovedWorks.length === 0}
            >
              <option value="">Select an approved artwork</option>
              {availableApprovedWorks.map((submission) => {
                const artist = artistLookup[submission.artistId];
                const sourceExhibition = exhibitionTitleLookup[submission.exhibitionId] || 'Unknown exhibition';
                return (
                  <option key={submission.id} value={submission.id}>
                    {submission.title} · {artist?.fullName || 'Unknown artist'} · {sourceExhibition}
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={() => void handleAddApprovedWork()}
              disabled={curating || !selectedApprovedSubmissionId}
              className="w-full bg-[var(--color-sienna)] text-white font-mono text-xs uppercase tracking-wider px-5 py-3 disabled:opacity-60"
            >
              {curating ? 'Updating...' : 'Add To This Exhibition'}
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500 leading-6">
            {availableApprovedWorks.length > 0
              ? `${availableApprovedWorks.length} approved works are available to move here.`
              : 'No other approved works are currently available to move into this exhibition.'}
          </div>
        </section>
      </div>
    </div>
  );
}
