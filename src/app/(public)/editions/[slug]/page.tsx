import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPublicMerchBySlug } from "../../merch/merchData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const edition = await getPublicMerchBySlug(slug);

  if (!edition) {
    return { title: "Merch | Studio 201" };
  }

  return {
    title: `${edition.title} | Studio 201`,
    description: edition.shortNote || edition.description || `Discover ${edition.title} in Studio 201.`,
  };
}

export default async function EditionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPublicMerchBySlug(slug);

  if (!item) {
    notFound();
  }

  redirect(item.channel === "backroom" ? `/backroom/${item.slug}` : `/merch/${item.slug}`);
}
