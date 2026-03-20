export const ARTWORK_CATEGORY_OPTIONS = [
  "Painting",
  "Drawing",
  "Digital Art",
  "Mixed Media",
  "Printmaking",
  "Handmade / Craft",
  "Photography",
  "Other",
] as const;

export type ArtworkCategoryOption = (typeof ARTWORK_CATEGORY_OPTIONS)[number];

export const ARTWORK_TYPE_OPTIONS_BY_CATEGORY: Record<ArtworkCategoryOption, readonly string[]> = {
  Painting: ["Oil", "Acrylic", "Watercolor", "Gouache", "Ink", "Pastel", "Other"],
  Drawing: [
    "Graphite",
    "Charcoal",
    "Pen and Ink",
    "Colored Pencil",
    "Marker",
    "Pastel",
    "Other",
  ],
  "Digital Art": [
    "Digital Painting",
    "Vector Art",
    "Pixel Art",
    "3D Render",
    "Photo Manipulation",
    "Other",
  ],
  "Mixed Media": [
    "Collage",
    "Mixed Media on Paper",
    "Mixed Media on Canvas",
    "Found Materials",
    "Other",
  ],
  Printmaking: ["Screen Print", "Linocut", "Etching", "Monoprint", "Other"],
  "Handmade / Craft": ["Embroidery", "Crochet", "Textile", "Paper Craft", "Beadwork", "Other"],
  Photography: ["Portrait", "Landscape", "Documentary", "Conceptual", "Other"],
  Other: [],
};

export function getArtTypeOptions(category?: string | null): readonly string[] {
  if (!category || !(category in ARTWORK_TYPE_OPTIONS_BY_CATEGORY)) {
    return [];
  }
  return ARTWORK_TYPE_OPTIONS_BY_CATEGORY[category as ArtworkCategoryOption];
}

export function getArtTypeDraft(category?: string | null, artType?: string | null) {
  const normalizedArtType = artType?.trim() || "";
  if (!normalizedArtType) {
    return { artType: "", artTypeCustom: "" };
  }

  if (!category || category === "Other") {
    return { artType: "", artTypeCustom: normalizedArtType };
  }

  const options = getArtTypeOptions(category);
  if (options.includes(normalizedArtType)) {
    return { artType: normalizedArtType, artTypeCustom: "" };
  }

  return { artType: "Other", artTypeCustom: normalizedArtType };
}

export function resolveArtTypeValue(
  category?: string | null,
  artType?: string | null,
  artTypeCustom?: string | null
) {
  if (category === "Other" || artType === "Other") {
    return artTypeCustom?.trim() || undefined;
  }

  return artType?.trim() || undefined;
}
