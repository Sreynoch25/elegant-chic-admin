interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  cart_id: string | null;
  total_amount: string;
  payment_method: string;
  placed_at: string;
  ordered_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  khqr_string: string;
  delivery_id: string | null;
  delivery_fee: string;
  shipping_address: string | null;
  admin_notes: string | null;
  payment_notes: string | null;
  address_name: string;
  phone: string;
  note: string | null;
  khqr_md5: string;
  status: string;
  order_status: string;
  paid_at: string | null;
  paid_amount: string | null;
  created_at: string;
  updated_at: string;
  customer: Customer;
  order_items: OrderItem[];
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_image: string | null;
  is_verified: boolean;
  phone_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  otp_expires_at: string | null;
  created_at: string;
  updated_at: string;
  otp_verified_for_reset: number;
  full_name: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  item_variant_id: string;
  item_name: string;
  size: string;
  color: string;
  quantity: number;
  price: string;
  total: string;
  created_at: string;
  updated_at: string;
  variant: Variant;
}

interface Variant {
  id: string;
  item_id: string;
  color_id: string;
  size_id: string;
  image: string;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  final_price: string | number;
  color: Color;
  size: Size;
}

interface Item {
  id: string;
  name: string;
  description: string;
  total_sold: number;
  popularity_score: string;
  last_sale_at: string | null;
  recent_sales_count: number;
  views_count: number;
  trending_updated_at: string | null;
  category_id: string;
  season_id: string;
  brand_id: string;
  discount_id: string | null;
  created_at: string;
  updated_at: string;
  discount: Discount | null;
}

interface Color {
  id: string;
  name: string;
  hex_code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Size {
  id: string;
  name: string;
  order: number;
  description: string;
  size_group_id: string;
  created_at: string;
  updated_at: string;
}

interface Discount {
  id: string;
  name: string;
  description: string;
  type: string;
  value: string;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}