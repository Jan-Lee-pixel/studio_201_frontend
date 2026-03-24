import { Metadata } from "next";
import EventsPageClient from "./EventsPageClient";
import type { EventDto } from "@/features/events/services/eventService";
import type { Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { getPublicCollection } from "@/lib/publicApi";

export const metadata: Metadata = {
  title: "Events - Studio 201",
  description: "Featured events in Studio 201",
};

export default async function EventsPage() {
  const [events, openExhibitions, archiveExhibitions] = await Promise.all([
    getPublicCollection<EventDto>("/Events", {
      revalidate: 300,
      tags: ["public-events"],
    }),
    getPublicCollection<Exhibition>("/Exhibitions", {
      revalidate: 60,
      tags: ["public-exhibitions"],
    }),
    getPublicCollection<Exhibition>("/Exhibitions/archive", {
      revalidate: 300,
      tags: ["public-archive"],
    }),
  ]);

  return (
    <EventsPageClient
      initialEvents={events}
      initialOpenExhibitions={openExhibitions}
      initialArchiveExhibitions={archiveExhibitions}
    />
  );
}
