export interface OrdersResponse {
  status: string;
  message: string;
  data: OrdersPagination;
}

export interface OrdersPagination {
  current_page: number;
  data: Order[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  cart_id: string | null;
  payment_status: string;
  total_amount: string;
  payment_method: string;
  placed_at: string;
  ordered_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  khqr_string: string;
  delivery_id: string;
  delivery_fee: string;
  shipping_address: string | null;
  admin_notes: string | null;
  payment_notes: string | null;
  address_name: string;
  phone: string;
  note: string;
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

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_image_url: string | null;
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

export interface OrderItem {
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

export interface Variant {
  id: string;
  item_id: string;
  color_id: string;
  size_id: string;
  image: string;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  final_price: string;
  item: Item;
  color: Color;
  size: Size;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category_id: string;
  season_id: string;
  brand_id: string;
  discount_id: string | null;
  created_at: string;
  updated_at: string;
  discount: string | null;
}

export interface Color {
  id: string;
  name: string;
  hex_code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Size {
  id: string;
  name: string;
  order: number;
  description: string;
  size_group_id: string;
  created_at: string;
  updated_at: string;
}
