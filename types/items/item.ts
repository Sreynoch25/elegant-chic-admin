import type { UploadFile } from 'ant-design-vue';

export interface ItemVariant {
  id?: string; 
  item_id?: string;
  color_id: string;
  size_id: string;
  image?: string | File;
  imageFileList?: UploadFile[];
  quantity: number;
  price: number;
  final_price?: string;
  color?: {
    id: string;
    name: string;
    hex_code: string;
  };
  size?: {
    id: string;
    name: string;
    description: string;
  };
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category_id: string;
  season_id: string;
  brand_id: string;
  discount_id?: string;
  created_at: string;
  updated_at: string;
  variants: ItemVariant[];
  brand?: {
    id: string;
    name: string;
  };
}

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
  variants: ItemVariant[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  status_code: number;
  data?: any;
}