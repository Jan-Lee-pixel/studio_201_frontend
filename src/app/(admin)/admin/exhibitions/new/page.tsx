'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { exhibitionService } from '@/features/exhibitions/services/exhibitionService';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function NewExhibitionPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

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
      await exhibitionService.createExhibition({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
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

      <form onSubmit={handleSubmit} className="border border-[var(--color-rule)] bg-white p-6 max-w-3xl">
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
