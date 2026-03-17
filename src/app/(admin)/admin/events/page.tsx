'use client';

import { useEffect, useState } from 'react';
import { eventService, EventDto } from '@/features/events/services/eventService';
import { DashboardTableSkeleton } from "@/components/ui/SkeletonPage";

const emptyDraft: Partial<EventDto> = {
  title: '',
  slug: '',
  type: 'Event',
  isExternal: false,
  hasDocumentation: false,
  isPublished: true,
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Partial<EventDto>>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (e) {
      console.error('Failed to load events', e);
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!draft.title || !draft.slug) {
      setError('Title and slug are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await eventService.createEvent(draft);
      setEvents((prev) => [created, ...prev]);
      resetDraft();
    } catch (e) {
      console.error('Failed to create event', e);
      setError('Failed to create event.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (event: EventDto) => {
    setEditingId(event.id);
    setDraft({
      title: event.title,
      slug: event.slug,
      subtitle: event.subtitle,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      venue: event.venue,
      timeLabel: event.timeLabel,
      isExternal: event.isExternal,
      hasDocumentation: event.hasDocumentation,
      isPublished: event.isPublished,
      coverMediaId: event.coverMediaId,
    });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await eventService.updateEvent(id, draft);
      setEvents((prev) => prev.map((ev) => (ev.id === id ? updated : ev)));
      resetDraft();
    } catch (e) {
      console.error('Failed to update event', e);
      setError('Failed to update event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    setSaving(true);
    setError(null);
    try {
      await eventService.deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (e) {
      console.error('Failed to delete event', e);
      setError('Failed to delete event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Events Manager</h1>
        <p className="page-subtitle text-gray-400">Create, update, publish, and archive events.</p>
      </div>

      <div className="border border-[var(--color-rule)] bg-[var(--color-bone)] p-6 mb-10">
        <h2 className="font-display text-xl mb-4">Create Event</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
            placeholder="Title"
            value={draft.title || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
            placeholder="Slug"
            value={draft.slug || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, slug: e.target.value }))}
          />
          <input
            className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
            placeholder="Type"
            value={draft.type || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value }))}
          />
          <input
            className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
            placeholder="Venue"
            value={draft.venue || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, venue: e.target.value }))}
          />
          <input
            className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
            type="datetime-local"
            value={draft.startDate ? draft.startDate.slice(0, 16) : ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, startDate: e.target.value }))}
          />
          <input
            className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
            type="datetime-local"
            value={draft.endDate ? draft.endDate.slice(0, 16) : ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
        <div className="flex items-center gap-6 mt-4">
          <label className="flex items-center gap-2 text-xs font-mono uppercase">
            <input
              type="checkbox"
              checked={!!draft.isPublished}
              onChange={(e) => setDraft((prev) => ({ ...prev, isPublished: e.target.checked }))}
            />
            Published
          </label>
          <label className="flex items-center gap-2 text-xs font-mono uppercase">
            <input
              type="checkbox"
              checked={!!draft.isExternal}
              onChange={(e) => setDraft((prev) => ({ ...prev, isExternal: e.target.checked }))}
            />
            External
          </label>
        </div>
        <div className="mt-4">
          <button
            className="btn btn-terracotta"
            onClick={handleCreate}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Create Event'}
          </button>
        </div>
        {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
      </div>

      {loading ? (
        <DashboardTableSkeleton rows={6} columns={5} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-mono text-xs uppercase tracking-widest">
                <th className="pb-3 pr-4 font-normal">Title</th>
                <th className="pb-3 px-4 font-normal">Status</th>
                <th className="pb-3 px-4 font-normal">Date</th>
                <th className="pb-3 px-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-4 pr-4">
                    {editingId === event.id ? (
                      <div className="grid gap-2">
                        <input
                          className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
                          value={draft.title || ''}
                          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                        />
                        <input
                          className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
                          value={draft.slug || ''}
                          onChange={(e) => setDraft((prev) => ({ ...prev, slug: e.target.value }))}
                        />
                        <input
                          className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
                          value={draft.venue || ''}
                          onChange={(e) => setDraft((prev) => ({ ...prev, venue: e.target.value }))}
                        />
                        <input
                          className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
                          type="datetime-local"
                          value={draft.startDate ? draft.startDate.slice(0, 16) : ''}
                          onChange={(e) => setDraft((prev) => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-[var(--color-near-black)]">{event.title}</div>
                        <div className="text-xs text-gray-400">{event.slug}</div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-xs font-mono uppercase text-gray-500">
                        <input
                          type="checkbox"
                          checked={event.isPublished}
                          onChange={() =>
                            eventService
                              .updateEvent(event.id, { isPublished: !event.isPublished })
                              .then((updated) =>
                                setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)))
                              )
                          }
                        />
                        Published
                      </label>
                      <label className="flex items-center gap-2 text-xs font-mono uppercase text-gray-500">
                        <input
                          type="checkbox"
                          checked={event.isExternal}
                          onChange={() =>
                            eventService
                              .updateEvent(event.id, { isExternal: !event.isExternal })
                              .then((updated) =>
                                setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)))
                              )
                          }
                        />
                        External
                      </label>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-500">
                    {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBA'}
                  </td>
                  <td className="py-4 px-4">
                    {editingId === event.id ? (
                      <div className="flex gap-2">
                        <button
                          className="btn btn-terracotta btn-sm"
                          disabled={saving}
                          onClick={() => handleSave(event.id)}
                        >
                          Save
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={resetDraft}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button className="btn btn-outline btn-sm" onClick={() => startEdit(event)}>
                          Edit
                        </button>
                        <button className="btn btn-outline btn-sm text-red-500" onClick={() => handleDelete(event.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
