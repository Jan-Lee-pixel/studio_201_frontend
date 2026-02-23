import { Metadata } from "next";
import EventsPageClient from "./EventsPageClient";

export const metadata: Metadata = {
  title: "Events - Studio 201",
  description: "Featured events in Studio 201",
};

export default function EventsPage() {
  return <EventsPageClient />;
}
