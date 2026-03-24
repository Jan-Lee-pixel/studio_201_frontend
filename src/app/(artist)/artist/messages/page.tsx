"use client";

import Link from "next/link";
import {
  WorkspaceCard,
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspaceStatusPill,
} from "@/components/ui/WorkspacePrimitives";

export default function ArtistMessagesPage() {
  return (
    <div className="content">
      <WorkspacePageHeader
        eyebrow="Artist Messages"
        title="Curator messaging will live here."
        description="This route is reserved for future curator communication."
        actions={<WorkspaceStatusPill tone="warning">Coming soon</WorkspaceStatusPill>}
      />

      <WorkspaceCard className="p-8 md:p-10">
        <WorkspaceEmptyState
          title="No messages yet"
          description="Studio 201 has not opened curator messaging in the portal yet. Until then, keep your profile, artworks, and merch submissions up to date so the review flow remains complete."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/artist/profile" className="btn btn-secondary">
                Review profile
              </Link>
              <Link href="/artist/dashboard" className="btn btn-primary">
                Return to dashboard
              </Link>
            </div>
          }
        />
      </WorkspaceCard>
    </div>
  );
}
