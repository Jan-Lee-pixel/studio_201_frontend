import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicCatalogDetailPage } from "@/features/merch/components/PublicCatalogDetailPage";
import { getPublicMerchBySlug } from "../merchData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicMerchBySlug(slug);
  if (!item || item.channel !== "merch") {
    return { title: "Merch | Studio 201" };
  }
  return {
    title: `${item.title} | Studio 201`,
    description: item.shortNote || item.description || `Discover ${item.title} in the Studio 201 merch collection.`,
  };
}

export default async function MerchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getPublicMerchBySlug(slug);

  if (!item || item.channel !== "merch") {
    notFound();
  }

  return (
    <PublicCatalogDetailPage
      item={item}
      channelLabel="Studio 201 Merch"
      backHref="/merch"
      backLabel="Back to merch"
      collectionLabel="Public merch catalog"
      introTitle="Inquire instead of checking out."
      introCopy="Studio 201 keeps merch inquiry-based so availability, pickup, shipping, and artist context can stay part of the conversation."
    />
  );
}
