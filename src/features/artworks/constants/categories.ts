export const ARTWORK_CATEGORY_OPTIONS = [
  "Painting",
  "Drawing",
  "Sculpture",
  "Photography",
  "Printmaking",
  "Ceramics",
  "Textile / Fiber",
  "Mixed Media",
  "Digital Art",
  "Installation",
  "Video / Film",
  "Performance",
  "Sound",
  "Other",
] as const;

export type ArtworkCategoryOption = (typeof ARTWORK_CATEGORY_OPTIONS)[number];
