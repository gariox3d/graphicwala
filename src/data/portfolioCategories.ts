export const PORTFOLIO_CATEGORIES = [
  'Graphic Design',
  'Printing',
  'Wedding',
  'Photo Editing',
  'Sublimation',
  'Customized Gifts',
  'Business Branding',
] as const;

export interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  storage_path: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}
