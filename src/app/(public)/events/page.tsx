import { Metadata } from "next";
import EventsPageClient from "./EventsPageClient";
import type { EventDto } from "@/features/events/services/eventService";
import type { Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { getArchiveExhibitions, getProgramExhibitions, getPublicEvents } from "@/lib/publicData";

export const metadata: Metadata = {
  title: "Events - Studio 201",
  description: "Featured events in Studio 201",
};

export default async function EventsPage() {
  const [events, openExhibitions, archiveExhibitions] = await Promise.all([
    getPublicEvents(),
    getProgramExhibitions(),
    getArchiveExhibitions(),
  ]);

  return (
    <EventsPageClient
      initialEvents={events}
      initialOpenExhibitions={openExhibitions}
      initialArchiveExhibitions={archiveExhibitions}
    />
  );
}
