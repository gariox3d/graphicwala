export interface UploadField {
  id: string;
  label: string;
  required: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category_id?: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category;
  // Customization fields
  customization_enabled?: boolean;
  front_upload_required?: boolean;
  back_upload_enabled?: boolean;
  upload_config?: UploadField[];
  // Delivery fields
  cutoff_time?: string | null;
  delivery_days?: number | null;
  enable_delivery?: boolean | null;
  delivery_charge?: number | null;
  // Display order
  display_order?: number;
  // Sale / Flash sale fields
  sale_price?: number | null;
  sale_start?: string | null;
  sale_end?: string | null;
  // Extra image urls
  image_urls?: string[] | null;
  // Weight/dimensions
  weight_kg?: number | null;
  length_cm?: number | null;
  breadth_cm?: number | null;
  height_cm?: number | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products?: Product;
  // Local state for design uploads (not stored in cart_items)
  front_design_url?: string;
  back_design_url?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_phone: string;
  payment_id?: string | null;
  payment_status?: string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  // Enhanced customer details
  customer_name?: string | null;
  email?: string | null;
  landmark?: string | null;
  order_notes?: string | null;
  // Delivery info
  delivery_charge?: number | null;
  delivery_method?: string | null;
  delivery_days_used?: number | null;
  estimated_delivery_date?: string | null;
  // Coupon info
  coupon_code?: string | null;
  coupon_discount?: number | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  created_at: string;
  // Design upload fields
  front_design_url?: string | null;
  back_design_url?: string | null;
  design_approval_status?: string;
  admin_preview_url?: string | null;
  design_urls?: Record<string, string>;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

// Constants
export const WHATSAPP_NUMBER = '+916207142994';
export const PHONE_NUMBER = '+916207142994';
export const BUSINESS_NAME = 'Graphic Wala';

// Order status options for admin
export const ORDER_STATUSES = [
  'pending',
  'designing',
  'approved',
  'printing',
  'shipped',
  'completed',
  'cancelled',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];
