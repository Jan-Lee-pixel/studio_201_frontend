'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { exhibitionService } from '@/features/exhibitions/services/exhibitionService';
import { createClient } from '@/lib/supabase/client';
import { mediaAssetService } from '@/features/mediaAssets/services/mediaAssetService';

const COVER_BUCKET = 'studio201-public';
const MAX_FILE_SIZE_MB = 20;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function NewExhibitionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

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
      let coverMediaId: string | undefined;
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

        const filePath = `exhibitions/${slug || 'untitled'}/${uuid}.${extension}`;
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

        coverMediaId = asset.id;
      }

      await exhibitionService.createExhibition({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        coverMediaId,
      });
      router.push('/admin/exhibitions');
    } catch (e) {
      console.error('Failed to create exhibition', e);
      setMessage('Failed to create exhibition.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">New Exhibition</h1>
        <p className="page-subtitle text-gray-400">Create a new exhibition and open it for submissions.</p>
      </div>

      <form onSubmit={handleSubmit} className="border border-[var(--color-rule)] bg-white p-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Title</label>
            <input
              className="w-full border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Exhibition Title"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Slug</label>
            <input
              className="w-full border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="exhibition-title"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Description</label>
            <textarea
              className="w-full min-h-[140px] border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the exhibition focus and curatorial vision."
            />
          </div>
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

          <div className="border border-[var(--color-rule)] bg-[var(--color-bone)] p-6">
            <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-4">Cover Image (Optional)</div>
            <div className="aspect-[4/3] bg-gray-200 border border-[var(--color-rule)] mb-4 overflow-hidden">
              {localPreview ? (
                <img src={localPreview} alt={title || 'Exhibition cover preview'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-mono uppercase">
                  No cover selected
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

        <div className="flex items-center gap-4 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-sienna)] text-white font-mono text-xs uppercase tracking-wider px-5 py-2 disabled:opacity-60"
          >
            {saving ? 'Creating...' : 'Create Exhibition'}
          </button>
          <Link href="/admin/exhibitions" className="text-xs font-mono uppercase tracking-widest text-gray-400">
            Cancel
          </Link>
          {message && <span className="text-sm text-gray-500">{message}</span>}
        </div>
      </form>
    </div>
  );
}
