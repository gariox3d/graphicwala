import { HOMEPAGE_SERVICE_GROUPS, type HomepageServiceItem } from '@/data/homepageServices';
import { GRAPHIC_DESIGN, BUSINESS_PRINTING, WEDDING_PRINTING, PHOTO_PRODUCTS, SUBLIMATION } from '@/data/services';
import type { Product } from '@/lib/types';

const aliases: Record<string, string[]> = {
  'design-graphic-design': ['graphic design', 'logo design', 'banner design', 'poster design', 'pamphlet design', 'handbill design', 'visiting card design', 'social media post design', 'business advertisement design'],
  'design-photo-editing': ['photo editing', 'photo restoration', 'photo retouching'],
  'design-wedding-card-design': ['wedding card design'],
  'print-banner': ['banner', 'flex'],
  'print-poster': ['poster'],
  'print-visiting-card': ['visiting card', 'business card'],
  'print-bill-book': ['bill book', 'receipt book'],
  'print-pamphlet': ['pamphlet', 'flyer'],
  'print-handbill': ['handbill', 'hand bill'],
  'print-letterhead': ['letterhead', 'letter head'],
  'print-folder': ['folder', 'folder file'],
  'print-wedding-card': ['wedding card', 'invitation card'],
  'customize-t-shirt': ['t shirt', 'tshirt'],
  'customize-mug': ['mug'],
  'customize-keychain': ['keychain', 'key chain'],
  'customize-cushion': ['cushion'],
  'customize-photo-frame': ['frame', 'magic mirror', 'photo mirror'],
  'customize-sublimation': ['sublimation', 'photo tile', 'photo plate', 'custom bottle', 'personalized bottle', 'personalised bottle'],
  'customize-customized-gifts': ['gift', 'personalized gift', 'personalised gift'],
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const matches = (value: string, key: string) => (aliases[key] ?? []).some((alias) =>
  new RegExp(`(?:^| )${normalize(alias)}(?:s|es)?(?: |$)`).test(normalize(value))
);

export function getHomepageProductGroup(product: Pick<Product, 'name'>, categoryName = '') {
  // Explicit design names take precedence over printing/gift words in a category.
  const namedGroup = HOMEPAGE_SERVICE_GROUPS.find((g) => g.items.some((item) => matches(product.name, item.key)));
  if (namedGroup) return namedGroup.title;
  // A broad admin category must not pull unrelated catalogue items into these lists.
  const excluded = /(?:^| )(?:photo prints?|pvc cards?|id cards?|lanyards?|holders?|stickers?|envelopes?)(?: |$)/;
  if (excluded.test(normalize(product.name))) return undefined;
  return HOMEPAGE_SERVICE_GROUPS.find((g) => g.items.some((item) => matches(categoryName, item.key)))?.title;
}

export function getHomepageServiceDescription(item: HomepageServiceItem) {
  const services = [GRAPHIC_DESIGN, BUSINESS_PRINTING, WEDDING_PRINTING, PHOTO_PRODUCTS, SUBLIMATION];
  if (item.key === 'design-graphic-design') return GRAPHIC_DESIGN.intro;
  if (item.key === 'customize-sublimation') return SUBLIMATION.intro;
  const group = item.key.startsWith('design-') ? [GRAPHIC_DESIGN]
    : item.key.startsWith('print-') ? [BUSINESS_PRINTING, WEDDING_PRINTING]
    : services.slice(3);
  return group.flatMap((g) => g.items).find((s) => matches(s.name, item.key))?.description ?? '';
}