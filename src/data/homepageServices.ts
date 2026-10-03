export interface HomepageServiceItem {
  key: string;
  label: string;
}

export interface HomepageServiceGroup {
  title: 'DESIGN' | 'PRINT' | 'CUSTOMIZE';
  to: string;
  cta: string;
  items: HomepageServiceItem[];
}

export const HOMEPAGE_SERVICE_GROUPS: HomepageServiceGroup[] = [
  {
    title: 'DESIGN',
    to: '/design-print',
    cta: 'Explore Design',
    items: [
      { key: 'design-graphic-design', label: 'Graphic Design' },
      { key: 'design-photo-editing', label: 'Photo Editing' },
      { key: 'design-wedding-card-design', label: 'Wedding Card Design' },
    ],
  },
  {
    title: 'PRINT',
    to: '/business-printing',
    cta: 'Explore Printing',
    items: [
      { key: 'print-banner', label: 'Banner' },
      { key: 'print-poster', label: 'Poster' },
      { key: 'print-visiting-card', label: 'Visiting Card' },
      { key: 'print-bill-book', label: 'Bill Book' },
      { key: 'print-pamphlet', label: 'Pamphlet' },
      { key: 'print-handbill', label: 'Handbill' },
      { key: 'print-letterhead', label: 'Letterhead' },
      { key: 'print-folder', label: 'Folder' },
      { key: 'print-wedding-card', label: 'Wedding Card' },
    ],
  },
  {
    title: 'CUSTOMIZE',
    to: '/custom-products',
    cta: 'Shop Custom Products',
    items: [
      { key: 'customize-t-shirt', label: 'T-Shirt' },
      { key: 'customize-mug', label: 'Mug' },
      { key: 'customize-keychain', label: 'Keychain' },
      { key: 'customize-cushion', label: 'Cushion' },
      { key: 'customize-photo-frame', label: 'Photo Frame' },
      { key: 'customize-sublimation', label: 'Sublimation' },
      { key: 'customize-customized-gifts', label: 'Customized Gifts' },
    ],
  },
];
