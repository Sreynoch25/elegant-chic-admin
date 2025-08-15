export interface DashboardResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: DashboardData;
}

export interface DashboardData {
  kpis: {
    total_revenue: KPI;
    fashion_orders: KPI;
    style_enthusiasts: KPI & { new_this_month: number };
    fashion_items: KPI & { variants: number };
  };
  sales_overview: SalesOverview[];
  recent_orders: RecentOrder[];
  low_stock_items: LowStockItem[];
  top_categories: TopCategory[];
  last_updated: string;
}

export interface KPI {
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  label: string;
  icon: string;
  color: string;
}

export interface SalesOverview {
  week: string;
  period: string;
  dresses: number;
  tops__blouses: number;
  shoes: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  amount: string;
  status: string;
  status_label: string;
  status_color: string;
  date: string;
  time: string;
}

export interface LowStockItem {
  id: string;
  item_name: string;
  color: string;
  size: string;
  quantity: number;
  price: string;
  status: string;
  status_color: string;
}

export interface TopCategory {
  id: string;
  name: string;
  revenue: string;
  orders: number;
  percentage: number;
}
