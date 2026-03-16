import { apiClient } from '@/lib/apiClient';
import { getCached, setCached } from '@/lib/cache';

export interface EventDto {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  timeLabel?: string;
  isExternal: boolean;
  hasDocumentation: boolean;
  isPublished: boolean;
  coverMediaId?: string | null;
  coverImageUrl?: string | null;
}

export const eventService = {
  /**
   * Public: Fetches published events
   */
  async getEvents(): Promise<EventDto[]> {
    const cached = getCached<EventDto[]>('events:published');
    if (cached) return cached;
    const data = await apiClient<EventDto[]>('/Events');
    setCached('events:published', data, 60_000);
    return data;
  },

  /**
   * Public: Fetches a single event by slug
   */
  async getEventBySlug(slug: string): Promise<EventDto> {
    return apiClient<EventDto>(`/Events/slug/${slug}`);
  },
  /**
   * Admin: Fetch all events (published + drafts)
   */
  async getAllEvents(): Promise<EventDto[]> {
    return apiClient<EventDto[]>('/Events/all');
  },
  /**
   * Admin: Create event
   */
  async createEvent(payload: Partial<EventDto>): Promise<EventDto> {
    return apiClient<EventDto>('/Events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  /**
   * Admin: Update event
   */
  async updateEvent(id: string, payload: Partial<EventDto>): Promise<EventDto> {
    return apiClient<EventDto>(`/Events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  /**
   * Admin: Delete event
   */
  async deleteEvent(id: string): Promise<void> {
    await apiClient(`/Events/${id}`, { method: 'DELETE' });
  },
};
