

export interface ItemResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: Item[];
  page?: number;
  per_page?: number;
  total?: number;
}

export interface ItemFormState {
  name: string;
  description: string;
  category_id: string;
  brand_id: string;
  season_id: string;
  discount_id?: string 
  variants: ItemVariant[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  status_code: number;
  data?: any;
}

// Define the UploadFileStatus type for the imageFileList
export type UploadFileStatus = 'done' | 'uploading' | 'error' | 'removed';

// Color interface
export interface Color {
  id: string;
  name: string;
  hex_code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Size interface
export interface Size {
  id: string;
  name: string;
  order: number;
  description: string;
  size_group_id: string;
  created_at: string;
  updated_at: string;
}

// Discount interface
export interface Discount {
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

// Variant interface (used in the JSON data)
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
  color: Color;
  size: Size;
  item: Item;
}

// Item interface (updated to include variants)
export interface Item {
  id: string;
  name: string;
  description: string;
  total_sold: number;
  last_sale_at: string | null;
  is_featured_new_arrival: boolean;
  is_featured_trending: boolean;
  featured_trending_at: string | null;
  featured_new_arrival_at: string | null;
  category_id: string;
  season_id: string;
  brand_id: string;
  discount_id: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  variants: Variant[]; 
  discount?: Discount | null;
}

// ItemVariant interface for the mapped output
export interface ItemVariant {
  id: string;
  color_id: string;
  size_id: string;
  quantity: number;
  price: string;
  image: string;
  imageFileList: {
    uid: string;
    name: string;
    status: UploadFileStatus;
    url: string;
  }[];
}

// Brand interface
export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  is_featured: number;
  created_at: string;
  updated_at: string;
}

// Category interface
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_group_id: string;
  created_at: string;
  updated_at: string;
}

// ItemData interface for the full item structure
export interface ItemData {
  id: string;
  name: string;
  description: string;
  total_sold: number;
  last_sale_at: string | null;
  is_featured_new_arrival: boolean;
  is_featured_trending: boolean;
  featured_trending_at: string | null;
  featured_new_arrival_at: string | null;
  category_id: string;
  season_id: string;
  brand_id: string;
  discount_id: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  variants: Variant[];
  brand: Brand;
  category: Category;
}

// ResponseData interface for the API response
export interface ResponseData {
  status: string;
  message: string;
  data: ItemData[];
}