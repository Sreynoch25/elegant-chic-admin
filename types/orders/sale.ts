export interface Order {
  order_number: string;
  placed_at: string; // ISO timestamp
  item_name: string;
  size: string;
  color: string;
  full_item_name: string;
  color_name: string;
  size_name: string;
  quantity: number;
  price: string; 
  total: string; 
  customer_id: string;
}

export interface Filters {
  start_date: string | null;
  end_date: string | null;
  item_name: string | null;
  size: string | null;
  color: string | null;
}

export interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  filters: Filters;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  meta: Meta;
}