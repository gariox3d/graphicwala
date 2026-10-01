import type { LucideIcon } from 'lucide-react';
import {
  PenTool, Image as ImageIcon, Megaphone, FileText, CreditCard, Heart, Share2, BadgeIndianRupee,
  Wand2, History, Printer, Mail, Folder, Sticker, Briefcase, BookOpen, Flag, Camera, Shirt, Coffee,
  KeyRound, Gift, Frame, IdCard, Users, Video, Smartphone, Building2, Sparkles, Package,
} from 'lucide-react';

export interface Service {
  name: string;
  description: string;
  icon: LucideIcon;
  price?: string;
}

export interface ServiceGroup {
  id: string;
  title: string;
  intro: string;
  items: Service[];
}

export const GRAPHIC_DESIGN: ServiceGroup = {
  id: 'graphic-design',
  title: 'Graphic Design',
  intro: 'Print-ready artwork made by our designers. You approve the design before anything is printed.',
  items: [
    { name: 'Logo Design', icon: PenTool, description: 'A simple, memorable logo for your shop or brand, delivered in print and digital formats.' },
    { name: 'Banner Design', icon: Flag, description: 'Flex and vinyl banner layouts sized correctly for shop fronts, events and promotions.' },
    { name: 'Poster Design', icon: ImageIcon, description: 'Eye-catching posters for offers, events, coaching classes and announcements.' },
    { name: 'Pamphlet Design', icon: FileText, description: 'Single or double-sided pamphlets with clear offers and contact details.' },
    { name: 'Handbill Design', icon: Megaphone, description: 'Low-cost handbills designed for bulk distribution and quick reading.' },
    { name: 'Visiting Card Design', icon: CreditCard, description: 'Clean, professional card layouts with your logo, services and contact info.' },
    { name: 'Wedding Card Design', icon: Heart, description: 'Traditional and modern wedding card designs in Hindi, Urdu or English.' },
    { name: 'Social Media Post Design', icon: Share2, description: 'Posts and stories for Instagram, Facebook and WhatsApp status.' },
    { name: 'Business Advertisement Design', icon: BadgeIndianRupee, description: 'Newspaper, hoarding and digital ad creatives for your business.' },
    { name: 'Photo Editing', icon: Wand2, description: 'Background change, colour correction, retouching and photo cleanup.' },
    { name: 'Photo Restoration', icon: History, description: 'Repair old, torn or faded family photos and make them print-ready.' },
  ],
};

export const BUSINESS_PRINTING: ServiceGroup = {
  id: 'business-printing',
  title: 'Business Printing',
  intro: 'Stationery and promotional print that makes a local business look established.',
  items: [
    { name: 'Visiting Cards', icon: CreditCard, description: 'Matte or glossy laminated cards on thick art card stock.' },
    { name: 'Letterheads', icon: FileText, description: 'Branded letterheads for quotations, invoices and official letters.' },
    { name: 'Bill Books', icon: BookOpen, description: 'Numbered bill and receipt books in duplicate or triplicate.' },
    { name: 'Envelopes', icon: Mail, description: 'Printed envelopes in standard office sizes with your logo.' },
    { name: 'Folder Files', icon: Folder, description: 'Presentation folders for documents, certificates and proposals.' },
    { name: 'Pamphlets', icon: FileText, description: 'Colour pamphlets printed in bulk for promotions.' },
    { name: 'Handbills', icon: Megaphone, description: 'Economical handbills for local marketing.' },
    { name: 'Posters', icon: ImageIcon, description: 'Posters in A4, A3 and larger sizes.' },
    { name: 'Banners', icon: Flag, description: 'Flex and vinyl banners for shops, events and political or social use.' },
    { name: 'Stickers', icon: Sticker, description: 'Product labels, logo stickers and custom-shape stickers.' },
    { name: 'Business Collaterals', icon: Briefcase, description: 'Any other branded print material your business needs.' },
  ],
};

export const WEDDING_PRINTING: ServiceGroup = {
  id: 'wedding-printing',
  title: 'Wedding Printing',
  intro: 'Cards, posters and keepsakes for every function, designed and printed in one place.',
  items: [
    { name: 'Wedding Cards', icon: Heart, description: 'Printed wedding cards with envelopes, in traditional and modern styles.' },
    { name: 'Invitation Cards', icon: Mail, description: 'Cards for engagement, mehndi, walima, birthday and other functions.' },
    { name: 'Wedding Posters', icon: ImageIcon, description: 'Welcome and couple posters for the venue entrance.' },
    { name: 'Wedding Banners', icon: Flag, description: 'Large banners for venues, stages and decoration.' },
    { name: 'Wedding Photo Products', icon: Camera, description: 'Couple frames and photo gifts for the family.' },
  ],
};

export const WEDDING_EXTRAS: Service[] = [
  { name: 'Digital Wedding Invitations', icon: Smartphone, description: 'Shareable invitation pages for WhatsApp — made on Graphic Wala Invites.' },
  { name: 'Video Wedding Invitations', icon: Video, description: 'Short animated invitation videos for WhatsApp and Instagram.' },
  { name: 'Photo Frames', icon: Frame, description: 'Couple and family frames printed on premium media.' },
  { name: 'Customized Wedding Gifts', icon: Gift, description: 'Personalised mugs, cushions and keepsakes for the couple.' },
];

export const PHOTO_PRODUCTS: ServiceGroup = {
  id: 'photo-products',
  title: 'Photo Products',
  intro: 'Your photos printed sharp and framed to last.',
  items: [
    { name: 'Photo Frames', icon: Frame, description: 'Wall and table frames in many sizes.' },
    { name: 'Photo Prints', icon: Camera, description: 'High-quality prints from your phone photos.' },
    { name: 'Personalized Frames', icon: Sparkles, description: 'Frames with names, dates and messages added.' },
    { name: 'Couple Frames', icon: Heart, description: 'Romantic frames for anniversaries and gifts.' },
    { name: 'Family Frames', icon: Users, description: 'Collage frames for family memories.' },
  ],
};

export const SUBLIMATION: ServiceGroup = {
  id: 'sublimation',
  title: 'Sublimation',
  intro: 'Full-colour printing that becomes part of the product — it does not peel off.',
  items: [
    { name: 'T-Shirts', icon: Shirt, description: 'Custom printed t-shirts for individuals, teams and events.' },
    { name: 'Mugs', icon: Coffee, description: 'Photo and name mugs, white and magic colour-changing.' },
    { name: 'Keychains', icon: KeyRound, description: 'Photo keychains in acrylic, metal and MDF.' },
    { name: 'Heart Cushions', icon: Heart, description: 'Soft heart-shaped cushions with your photo.' },
    { name: 'Customized Gifts', icon: Gift, description: 'Personalised gifts for birthdays and festivals.' },
    { name: 'Other Sublimation Products', icon: Package, description: 'Tiles, plates, bottles and more on request.' },
  ],
};

export const PVC_ID: ServiceGroup = {
  id: 'pvc-id',
  title: 'PVC / ID Products',
  intro: 'Durable waterproof cards for offices, schools and personal use.',
  items: [
    { name: 'PVC Cards', icon: CreditCard, description: 'Waterproof PVC copies of Aadhaar, PAN and other cards.' },
    { name: 'ID Cards', icon: IdCard, description: 'Employee and student ID cards with photo.' },
    { name: 'ID Card Printing', icon: Printer, description: 'Bulk ID card printing for schools and companies.' },
    { name: 'Lanyards', icon: KeyRound, description: 'Printed lanyards with your organisation name.' },
    { name: 'Holders', icon: Briefcase, description: 'ID card holders and pouches.' },
  ],
};

export const CORPORATE_ITEMS: Service[] = [
  { name: 'Corporate Gift Sets', icon: Gift, description: 'Branded combo sets for clients and partners.' },
  { name: 'Customized Mugs', icon: Coffee, description: 'Mugs with your company logo.' },
  { name: 'Customized T-Shirts', icon: Shirt, description: 'Team and event t-shirts in bulk.' },
  { name: 'Keychains', icon: KeyRound, description: 'Logo keychains for promotions.' },
  { name: 'Photo Frames', icon: Frame, description: 'Award and recognition frames.' },
  { name: 'Office Gifts', icon: Briefcase, description: 'Useful desk gifts with your branding.' },
  { name: 'Employee Gifts', icon: Users, description: 'Welcome kits and appreciation gifts.' },
  { name: 'Festival & Diwali Gifts', icon: Sparkles, description: 'Festive hampers for staff and clients.' },
  { name: 'Promotional Gifts', icon: Megaphone, description: 'Giveaways for events and launches.' },
  { name: 'Customized Merchandise', icon: Building2, description: 'Any branded merchandise you need.' },
];

export const INVITES_URL = 'https://invites.graphicwala.com/';

/** Product filter chips → keywords matched against category / product names. */
export const PRODUCT_FILTERS: { label: string; keywords: string[] }[] = [
  { label: 'All', keywords: [] },
  { label: 'Printing', keywords: ['visiting', 'card', 'poster', 'banner', 'print'] },
  { label: 'Business Printing', keywords: ['visiting', 'letter', 'bill', 'sticker'] },
  { label: 'Wedding', keywords: ['wedding', 'couple', 'invitation'] },
  { label: 'Photo Products', keywords: ['frame', 'photo', 'mirror'] },
  { label: 'Sublimation', keywords: ['mug', 't-shirt', 'tshirt', 'shirt', 'cushion', 'keychain', 'key chain'] },
  { label: 'Customized Gifts', keywords: ['gift', 'mug', 'cushion', 'keychain', 'frame', 'mirror'] },
  { label: 'PVC / ID', keywords: ['pvc', 'id card', 'id-card', 'lanyard'] },
  { label: 'Corporate Gifts', keywords: ['mug', 'shirt', 'keychain', 'id card', 'gift'] },
];
