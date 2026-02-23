export type EditionCategory = 'Publication' | 'Object & Multiple' | 'Apparel' | 'Collaboration';

export interface EditionSpecs {
  medium?: string;
  dimensions?: string;
  editionSize?: string;
  year?: string;
  printerOrFabricator?: string;
}

export interface Edition {
  id: string;
  slug: string;
  title: string;
  artist: string;
  category: EditionCategory;
  availability: 'Available in-gallery' | 'Sold Out';
  isFeatured?: boolean;
  coverImage: string; // Background gradient class or Image URL
  shortDescription?: string;
  longDescription?: string;
  specs?: EditionSpecs;
}

// Temporary Mock Data bridging the HTML template into the Frontend
export const MOCK_EDITIONS: Edition[] = [
  {
    id: 'slow-hours',
    slug: 'slow-hours',
    title: 'Slow Hours: A Zine on Gallery Time',
    artist: 'Studio 201 × Tao Printshop — Open edition',
    category: 'Collaboration',
    availability: 'Available in-gallery',
    isFeatured: true,
    coverImage: 'bg-gradient-to-br from-[#c8b8a0] to-[#a89070]',
  },
  {
    id: 'cartographies-of-forgetting',
    slug: 'cartographies-of-forgetting',
    title: 'Cartographies of Forgetting',
    artist: 'Leila Nasser — Edition of 200',
    category: 'Publication',
    availability: 'Available in-gallery',
    coverImage: 'bg-gradient-to-br from-[#d4c5b0] to-[#b0a090]',
  },
  {
    id: 'vessel-no-7',
    slug: 'vessel-no-7',
    title: 'Vessel No. 7',
    artist: 'Marco Villaruel — Edition of 25',
    category: 'Object & Multiple',
    availability: 'Available in-gallery',
    coverImage: 'bg-gradient-to-br from-[#c8bfb0] to-[#9a8a78]',
  },
  {
    id: 'gallery-tee-autumn-wash',
    slug: 'gallery-tee-autumn-wash',
    title: 'Gallery Tee — Autumn Wash',
    artist: 'Studio 201 × Blank Canvas',
    category: 'Apparel',
    availability: 'Available in-gallery',
    coverImage: 'bg-gradient-to-br from-[#c0b8b0] to-[#888070]',
  },
  {
    id: 'on-looking-essays',
    slug: 'on-looking-essays',
    title: 'On Looking: Exhibition Essays',
    artist: 'Various Authors — Open edition',
    category: 'Publication',
    availability: 'Available in-gallery',
    coverImage: 'bg-gradient-to-br from-[#d0c0a8] to-[#a09080]',
  },
  {
    id: 'pressed-botanicals-no-3',
    slug: 'pressed-botanicals-no-3',
    title: 'Pressed Botanicals No. 3',
    artist: 'Soo-Yeon Park — Edition of 50',
    category: 'Object & Multiple',
    availability: 'Available in-gallery',
    coverImage: 'bg-gradient-to-br from-[#bac0b0] to-[#809080]',
  }
];
