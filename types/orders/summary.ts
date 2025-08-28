export interface Summary {
  total_orders: number;
  total_revenue: string;
  average_order_value: string;
  total_delivery_fees: string;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  revenue: string;
}

export interface Period {
  start_date: string;
  end_date: string;
}

export interface SummaryData {
  summary: Summary;
  status_breakdown: StatusBreakdown[];
  period: Period;
}

export interface SummaryResponse {
  success: boolean;
  data: SummaryData;
}
