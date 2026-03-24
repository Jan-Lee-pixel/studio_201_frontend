import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicCatalogDetailPage } from "@/features/merch/components/PublicCatalogDetailPage";
import { getPublicMerchBySlug } from "../../merch/merchData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicMerchBySlug(slug);
  if (!item || item.channel !== "backroom") {
    return { title: "Backroom | Studio 201" };
  }
  return {
    title: `${item.title} | Studio 201 Backroom`,
    description: item.shortNote || item.description || `Discover ${item.title} in Studio 201 Backroom.`,
  };
}

export default async function BackroomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getPublicMerchBySlug(slug);

  if (!item || item.channel !== "backroom") {
    notFound();
  }

  return (
    <PublicCatalogDetailPage
      item={item}
      channelLabel="Studio 201 Backroom"
      backHref="/backroom"
      backLabel="Back to backroom"
      collectionLabel="Backroom release"
      introTitle="Inquire before anything else."
      introCopy="Backroom stays inquiry-led so the release can keep its quieter, more conversational character."
      alternateHref="/merch"
      alternateLabel="View merch"
    />
  );
}
