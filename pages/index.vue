<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Fashion Store Dashboard</h1>
      <p class="dashboard-subtitle">Welcome back, here's your fashion store performance today.</p>
    </div>

    <a-spin :spinning="loading" size="large">
      <!-- KPI Cards -->
      <a-row :gutter="[16, 16]" class="kpi-section">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="kpi-card" :class="`kpi-${dashboardData.kpis?.total_revenue?.color}`">
            <div class="kpi-content">
              <div class="kpi-icon">
                <component :is="getIcon(dashboardData.kpis?.total_revenue?.icon)" />
              </div>
              <div class="kpi-details">
                <div class="kpi-label">{{ dashboardData.kpis?.total_revenue?.label }}</div>
                <div class="kpi-value">${{ dashboardData.kpis?.total_revenue?.value }}</div>
                <!-- <div class="kpi-change" :class="`trend-${dashboardData.kpis?.total_revenue?.trend}`">
                  <component :is="getTrendIcon(dashboardData.kpis?.total_revenue?.trend)" />
                  {{ Math.abs(dashboardData.kpis?.total_revenue?.change) }}% last month
                </div> -->
              </div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="kpi-card" :class="`kpi-${dashboardData.kpis?.fashion_orders?.color}`">
            <div class="kpi-content">
              <div class="kpi-icon">
                <component :is="getIcon(dashboardData.kpis?.fashion_orders?.icon)" />
              </div>
              <div class="kpi-details">
                <div class="kpi-label">{{ dashboardData.kpis?.fashion_orders?.label }}</div>
                <div class="kpi-value">{{ dashboardData.kpis?.fashion_orders?.value }}</div>
                <!-- <div class="kpi-change" :class="`trend-${dashboardData.kpis?.fashion_orders?.trend}`">
                  <component :is="getTrendIcon(dashboardData.kpis?.fashion_orders?.trend)" />
                  {{ Math.abs(dashboardData.kpis?.fashion_orders?.change) }}% last month
                </div> -->
              </div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="kpi-card" :class="`kpi-${dashboardData.kpis?.style_enthusiasts?.color}`">
            <div class="kpi-content">
              <div class="kpi-icon">
                <component :is="getIcon(dashboardData.kpis?.style_enthusiasts?.icon)" />
              </div>
              <div class="kpi-details">
                <div class="kpi-label">{{ dashboardData.kpis?.style_enthusiasts?.label }}</div>
                <div class="kpi-value">{{ dashboardData.kpis?.style_enthusiasts?.value }}</div>
              </div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="kpi-card" :class="`kpi-${dashboardData.kpis?.fashion_items?.color}`">
            <div class="kpi-content">
              <div class="kpi-icon">
                <component :is="getIcon(dashboardData.kpis?.fashion_items?.icon)" />
              </div>
              <div class="kpi-details">
                <div class="kpi-label">{{ dashboardData.kpis?.fashion_items?.label }}</div>
                <div class="kpi-value">{{ dashboardData.kpis?.fashion_items?.value }}</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Sales Overview -->
      <a-row :gutter="[16, 16]" class="charts-section">
        <a-col :xs="24" :lg="16">
          <a-card title="Sales Overview" class="chart-card">
            <template #extra>
              <a-radio-group v-model:value="chartView" button-style="solid" size="small">
                <a-radio-button value="7d">7D</a-radio-button>
                <a-radio-button value="1m">1M</a-radio-button>
                <a-radio-button value="1y">1Y</a-radio-button>
              </a-radio-group>
            </template>
            <div class="chart-container">
              <canvas ref="salesChart"></canvas>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="8">
          <a-card title="Top Fashion Categories" class="chart-card">
            <!-- <template #extra>
              <a-button type="link" size="small">View All</a-button>
            </template> -->
            <div class="categories-list">
              <div v-for="cat in dashboardData.top_categories" :key="cat.id" class="category-item">
                <div class="category-info flex justify-between items-center">
                  <div class="category-name">{{ cat.name }}</div>
                  <div class="category-revenue">${{ formatNumber(cat.revenue) }}</div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Recent Orders and Low Stock -->
      <a-row :gutter="[16, 16]" class="tables-section">
        <a-col :xs="24" :lg="12">
          <a-card title="Recent Fashion Orders" class="table-card">
            <template #extra>
              <router-link to="/orders">
                <a-button type="link" size="small">View All</a-button>
              </router-link>
            </template>
            <div class="orders-list">
              <div v-for="order in dashboardData.recent_orders?.slice(0, 4)" :key="order.id" class="order-item">
                <div class="order-avatar">
                  <UserOutlined />
                </div>
                <div class="order-info">
                  <div class="order-customer">{{ order.customer_name }}</div>
                  <div class="order-details">{{ order.order_number }}</div>
                </div>
                <div class="order-amount">${{ order.amount }}</div>
                <a-tag :color="order.status_color">{{ order.status_label }}</a-tag>
              </div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="12">
          <a-card title="Low Stock Fashion Items" class="table-card">
            <div class="stock-list">
              <div v-for="item in dashboardData.low_stock_items?.slice(0, 4)" :key="item.id" class="stock-item">
                <div class="stock-avatar">
                  <TagOutlined />
                </div>
                <div class="stock-info">
                  <div class="stock-name">{{ item.item_name }}</div>
                  <div class="stock-variant">One Size - {{ item.color }}</div>
                </div>
                <div class="stock-quantity">
                  <span class="quantity-badge">{{ item.quantity }} left</span>
                  <div class="stock-date">Mon, 15</div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Quick Actions -->
      <!-- <a-row :gutter="[16, 16]" class="actions-section">
        <a-col :xs="24">
          <a-card title="Quick Fashion Actions" class="actions-card">
            <a-row :gutter="[16, 16]">
              <a-col :xs="12" :sm="6">
                <div class="action-item">
                  <PlusOutlined class="action-icon" />
                  <div class="action-label">Add Fashion Item</div>
                </div>
              </a-col>
              <a-col :xs="12" :sm="6">
                <div class="action-item">
                  <EyeOutlined class="action-icon" />
                  <div class="action-label">View Orders</div>
                </div>
              </a-col>
              <a-col :xs="12" :sm="6">
                <div class="action-item">
                  <HeartOutlined class="action-icon" />
                  <div class="action-label">Collections</div>
                </div>
              </a-col>
              <a-col :xs="12" :sm="6">
                <div class="action-item">
                  <BookOutlined class="action-icon" />
                  <div class="action-label">Lookbook</div>
                </div>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row> -->
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import Chart from 'chart.js/auto'
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  TagOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  PlusOutlined,
  EyeOutlined,
  HeartOutlined,
  BookOutlined
} from '@ant-design/icons-vue'

// --- 1. INTERFACES ---
interface KPI {
  value: string
  label: string
  change: number
  trend: string
  icon: string
  color: string
}

interface SalesData {
  period_label: string // e.g., 'Oct 23', 'Day 10', 'Jan'
  dresses_skirts: number // Corresponds to 'Dresses & Skirts'
  tops_blouses: number // Corresponds to 'Tops & Blouses'
  footwear: number // Corresponds to 'Footwear'
  accessories: number // 🎉 NEW: Corresponds to 'Accessories'
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  amount: string
  status: string
  status_label: string
  status_color: string
}

interface StockItem {
  id: string
  item_name: string
  color: string
  size: string
  quantity: number
  price: string
}

interface Category {
  id: string
  name: string
  revenue: string
  orders: number
}

interface DashboardResponse {
  kpis: {
    total_revenue: KPI
    fashion_orders: KPI
    style_enthusiasts: KPI
    fashion_items: KPI
  }
  sales_overview_7d: SalesData[] // Weekly data (7 days back)
  sales_overview_1m: SalesData[] // Monthly data (Day 1 to Current Day)
  sales_overview_1y: SalesData[] // Yearly data (Month 1 to Current Month)
  recent_orders: Order[]
  low_stock_items: StockItem[]
  top_categories: Category[]
  last_updated: string
}

// --- 2. STATE (REFS) ---
const loading = ref(false)
const error = ref<string | null>(null)
const chartView = ref('1m') // Default view set to Monthly (1M)
const salesChart = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Initial structure for dashboard data
const dashboardData = ref<DashboardResponse>({
  kpis: {} as any,
  sales_overview_7d: [],
  sales_overview_1m: [],
  sales_overview_1y: [],
  recent_orders: [],
  low_stock_items: [],
  top_categories: [],
  last_updated: ''
})

// --- 3. COMPUTED & HELPER FUNCTIONS ---

// **Computed property to select the chart data based on the filter**
const currentSalesData = computed(() => {
  switch (chartView.value) {
    case '7d':
      return dashboardData.value.sales_overview_7d
    case '1m':
      return dashboardData.value.sales_overview_1m
    case '1y':
      return dashboardData.value.sales_overview_1y
    default:
      return dashboardData.value.sales_overview_1m // Fallback
  }
})

// Function to calculate KPI totals for the current range
const kpiAggregator = (data: SalesData[]) => {
  let totalRevenue = 0;
  let totalOrders = 0;

  data.forEach(item => {
    // Summing up all four category revenues
    totalRevenue += item.dresses_skirts + item.tops_blouses + item.footwear + item.accessories;
    // Mocking orders based on a simple ratio of revenue (e.g., 1 order per $50 revenue)
    totalOrders += Math.floor((item.dresses_skirts + item.tops_blouses + item.footwear + item.accessories) / 50);
  });

  return {
    total_revenue: totalRevenue,
    fashion_orders: totalOrders
  }
}

// Function to update the KPI card values and labels
const updateKpis = () => {
  const aggregatedData = kpiAggregator(currentSalesData.value);
  const rangeLabel = chartView.value.toUpperCase();

  if (dashboardData.value.kpis.total_revenue) {
    dashboardData.value.kpis.total_revenue.value = formatNumber(aggregatedData.total_revenue.toFixed(2));
    dashboardData.value.kpis.total_revenue.label = `Total Revenue (${rangeLabel})`;
  }
  if (dashboardData.value.kpis.fashion_orders) {
    dashboardData.value.kpis.fashion_orders.value = formatNumber(aggregatedData.fashion_orders);
    dashboardData.value.kpis.fashion_orders.label = `Fashion Orders (${rangeLabel})`;
  }

  // Note: Style Enthusiasts and Fashion Items are left static 
}


const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    'dollar-sign': DollarOutlined,
    'shopping-bag': ShoppingOutlined,
    'users': UserOutlined,
    'package': TagOutlined
  }
  return icons[iconName] || TagOutlined
}

const getTrendIcon = (trend: string) => {
  if (trend === 'up') return ArrowUpOutlined
  if (trend === 'down') return ArrowDownOutlined
  return MinusOutlined
}

const formatNumber = (value: string | number) => {
  // Removes commas and converts to float if string, then formats
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

// --- 4. DATA FETCH & MOCK ---

const MOCK_DASHBOARD_DATA: DashboardResponse = {
  "last_updated": "2025-10-30 10:00:00",
  "kpis": {
    "total_revenue": { "value": "24,567.89", "label": "Total Revenue (1M)", "change": 12.5, "trend": "up", "icon": "dollar-sign", "color": "pink" },
    "fashion_orders": { "value": "4,120", "label": "Fashion Orders (1M)", "change": 4.2, "trend": "up", "icon": "shopping-bag", "color": "purple" },
    "style_enthusiasts": { "value": "1,580", "label": "Style Enthusiasts", "change": 1.1, "trend": "up", "icon": "users", "color": "cyan" },
    "fashion_items": { "value": "890", "label": "Fashion Items (Stock)", "change": -0.5, "trend": "down", "icon": "package", "color": "orange" }
  },

  // **UPDATED Sales Data Structures with Accessories**
  "sales_overview_7d": [
    // { "period_label": "24 Oct", "dresses_skirts": 500, "tops_blouses": 300, "footwear": 150, "accessories": 50 },
    { "period_label": "25 Oct", "dresses_skirts": 620, "tops_blouses": 350, "footwear": 200, "accessories": 60 },
    { "period_label": "26 Oct", "dresses_skirts": 710, "tops_blouses": 420, "footwear": 250, "accessories": 75 },
    { "period_label": "27 Oct", "dresses_skirts": 450, "tops_blouses": 280, "footwear": 180, "accessories": 40 },
    { "period_label": "28 Oct", "dresses_skirts": 800, "tops_blouses": 510, "footwear": 320, "accessories": 90 },
    { "period_label": "29 Oct", "dresses_skirts": 950, "tops_blouses": 600, "footwear": 400, "accessories": 110 },
    { "period_label": "30 Oct", "dresses_skirts": 1100, "tops_blouses": 700, "footwear": 450, "accessories": 130 },
    { "period_label": "31 Oct", "dresses_skirts": 500, "tops_blouses": 300, "footwear": 150, "accessories": 50 },
  ],

  "sales_overview_1m": [
    { "period_label": "1 Oct", "dresses_skirts": 120, "tops_blouses": 80, "footwear": 40, "accessories": 15 },
    { "period_label": "2 Oct", "dresses_skirts": 130, "tops_blouses": 85, "footwear": 45, "accessories": 17 },
    { "period_label": "3 Oct", "dresses_skirts": 140, "tops_blouses": 90, "footwear": 50, "accessories": 20 },
    { "period_label": "4 Oct", "dresses_skirts": 150, "tops_blouses": 95, "footwear": 55, "accessories": 22 },
    { "period_label": "5 Oct", "dresses_skirts": 160, "tops_blouses": 100, "footwear": 60, "accessories": 25 },
    { "period_label": "6 Oct", "dresses_skirts": 170, "tops_blouses": 110, "footwear": 65, "accessories": 28 },
    { "period_label": "7 Oct", "dresses_skirts": 185, "tops_blouses": 115, "footwear": 70, "accessories": 30 },
    { "period_label": "8 Oct", "dresses_skirts": 200, "tops_blouses": 125, "footwear": 75, "accessories": 35 },
    { "period_label": "9 Oct", "dresses_skirts": 215, "tops_blouses": 130, "footwear": 80, "accessories": 38 },
    { "period_label": "10 Oct", "dresses_skirts": 230, "tops_blouses": 140, "footwear": 85, "accessories": 40 },
    { "period_label": "11 Oct", "dresses_skirts": 250, "tops_blouses": 150, "footwear": 90, "accessories": 45 },
    { "period_label": "12 Oct", "dresses_skirts": 270, "tops_blouses": 160, "footwear": 95, "accessories": 48 },
    { "period_label": "13 Oct", "dresses_skirts": 290, "tops_blouses": 175, "footwear": 100, "accessories": 50 },
    { "period_label": "14 Oct", "dresses_skirts": 310, "tops_blouses": 185, "footwear": 110, "accessories": 55 },
    { "period_label": "15 Oct", "dresses_skirts": 330, "tops_blouses": 195, "footwear": 120, "accessories": 60 },
    { "period_label": "16 Oct", "dresses_skirts": 350, "tops_blouses": 210, "footwear": 130, "accessories": 65 },
    { "period_label": "17 Oct", "dresses_skirts": 370, "tops_blouses": 220, "footwear": 140, "accessories": 70 },
    { "period_label": "18 Oct", "dresses_skirts": 390, "tops_blouses": 235, "footwear": 150, "accessories": 75 },
    { "period_label": "19 Oct", "dresses_skirts": 410, "tops_blouses": 250, "footwear": 160, "accessories": 80 },
    { "period_label": "20 Oct", "dresses_skirts": 430, "tops_blouses": 260, "footwear": 170, "accessories": 85 },
    { "period_label": "21 Oct", "dresses_skirts": 460, "tops_blouses": 280, "footwear": 180, "accessories": 90 },
    { "period_label": "22 Oct", "dresses_skirts": 490, "tops_blouses": 300, "footwear": 190, "accessories": 95 },
    { "period_label": "23 Oct", "dresses_skirts": 520, "tops_blouses": 320, "footwear": 200, "accessories": 100 },
    { "period_label": "24 Oct", "dresses_skirts": 550, "tops_blouses": 340, "footwear": 210, "accessories": 105 },
    { "period_label": "25 Oct", "dresses_skirts": 580, "tops_blouses": 360, "footwear": 220, "accessories": 110 },
    { "period_label": "26 Oct", "dresses_skirts": 620, "tops_blouses": 380, "footwear": 230, "accessories": 115 },
    { "period_label": "27 Oct", "dresses_skirts": 660, "tops_blouses": 400, "footwear": 240, "accessories": 120 },
    { "period_label": "28 Oct", "dresses_skirts": 700, "tops_blouses": 420, "footwear": 260, "accessories": 125 },
    { "period_label": "29 Oct", "dresses_skirts": 740, "tops_blouses": 450, "footwear": 280, "accessories": 130 },
    { "period_label": "30 Oct", "dresses_skirts": 780, "tops_blouses": 480, "footwear": 300, "accessories": 135 },
    { "period_label": "31 Oct", "dresses_skirts": 820, "tops_blouses": 500, "footwear": 310, "accessories": 140 }
  ],


  "sales_overview_1y": [
    { "period_label": "Jan", "dresses_skirts": 1500, "tops_blouses": 800, "footwear": 400, "accessories": 150 },
    { "period_label": "Feb", "dresses_skirts": 1600, "tops_blouses": 850, "footwear": 450, "accessories": 160 },
    { "period_label": "Mar", "dresses_skirts": 1800, "tops_blouses": 900, "footwear": 500, "accessories": 180 },
    { "period_label": "Apr", "dresses_skirts": 1700, "tops_blouses": 880, "footwear": 480, "accessories": 170 },
    { "period_label": "May", "dresses_skirts": 2000, "tops_blouses": 1000, "footwear": 550, "accessories": 200 },
    { "period_label": "Jun", "dresses_skirts": 2200, "tops_blouses": 1100, "footwear": 600, "accessories": 220 },
    { "period_label": "Jul", "dresses_skirts": 2100, "tops_blouses": 1050, "footwear": 580, "accessories": 210 },
    { "period_label": "Aug", "dresses_skirts": 2400, "tops_blouses": 1200, "footwear": 650, "accessories": 240 },
    { "period_label": "Sep", "dresses_skirts": 2600, "tops_blouses": 1300, "footwear": 700, "accessories": 260 },
    { "period_label": "Oct", "dresses_skirts": 2800, "tops_blouses": 1400, "footwear": 750, "accessories": 280 }
  ],

  "top_categories": [
    { "id": "cat1", "name": "Dresses & Skirts", "revenue": "9,500.50", "orders": 850 },
    { "id": "cat2", "name": "Tops & Blouses", "revenue": "7,120.90", "orders": 780 },
    { "id": "cat3", "name": "Footwear", "revenue": "4,500.00", "orders": 520 },
    { "id": "cat4", "name": "Accessories", "revenue": "3,000.49", "orders": 900 }
  ],

  "recent_orders": [
    { "id": "ord1005", "order_number": "#ORD1005", "customer_name": "Sophea Sok", "amount": "150.99", "status": "completed", "status_label": "Completed", "status_color": "green" },
    { "id": "ord1004", "order_number": "#ORD1004", "customer_name": "Dara Roth", "amount": "99.50", "status": "pending", "status_label": "Pending", "status_color": "gold" },
    { "id": "ord1003", "order_number": "#ORD1003", "customer_name": "Malis K.", "amount": "240.00", "status": "shipped", "status_label": "Shipped", "status_color": "blue" },
    { "id": "ord1002", "order_number": "#ORD1002", "customer_name": "Vanna L.", "amount": "65.75", "status": "cancelled", "status_label": "Cancelled", "status_color": "red" }
  ],

  "low_stock_items": [
    { "id": "item1", "item_name": "Black Knit Dress", "color": "Black", "size": "One Size", "quantity": 5, "price": "45.00" },
    { "id": "item2", "item_name": "Slim Fit Jeans", "color": "Dark Blue", "size": "S", "quantity": 8, "price": "75.00" },
    { "id": "item3", "item_name": "White Summer Blouse", "color": "White", "size": "M", "quantity": 10, "price": "30.50" },
    { "id": "item4", "item_name": "Leather Ankle Boots", "color": "Brown", "size": "EU 38", "quantity": 6, "price": "120.00" }
  ]
}

const fetchDashboard = async () => {
  loading.value = true
  error.value = null

  // Using Mock Data:
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  dashboardData.value = MOCK_DASHBOARD_DATA;

  // Set initial KPIs based on the default chart view ('1m')
  updateKpis();

  loading.value = false
}

// --- 5. CHART INITIALIZATION ---

const initChart = () => {
  const dataToUse = currentSalesData.value;

  if (!salesChart.value || !dataToUse || dataToUse.length === 0) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = salesChart.value.getContext('2d')
  if (!ctx) return

  const labels = dataToUse.map(d => d.period_label) // Using dynamic period_label

  // **UPDATED Chart Datasets with Accessories**
  const datasets = [
    {
      label: 'Dresses & Skirts', // Matching category name
      data: dataToUse.map(d => d.dresses_skirts),
      borderColor: '#ec4899', // Pink
      backgroundColor: 'rgba(236, 72, 153, 0.1)',
      tension: 0.4
    },
    {
      label: 'Tops & Blouses', // Matching category name
      data: dataToUse.map(d => d.tops_blouses),
      borderColor: '#8b5cf6', // Purple
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4
    },
    {
      label: 'Footwear', // Matching category name
      data: dataToUse.map(d => d.footwear),
      borderColor: '#06b6d4', // Cyan
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      tension: 0.4
    },
    {
      label: 'Accessories', // 🎉 NEW: Matching category name
      data: dataToUse.map(d => d.accessories),
      borderColor: '#f59e0b', // Amber/Orange
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      tension: 0.4
    }
  ]

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top', align: 'end' }
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (value: any) => '$' + formatNumber(value) } }
      }
    }
  })
}

// --- 6. LIFECYCLE & WATCHERS ---

onMounted(() => {
  fetchDashboard()
})

// 1. Watch the chart filter (7D/1M/1Y)
watch(chartView, () => {
  updateKpis(); // **Crucial: Recalculate and update KPIs first**
  nextTick(() => {
    initChart(); // Then redraw the chart with the new data set
  })
})

// 2. Watch the initial data load to draw the first chart
watch(() => dashboardData.value.sales_overview_1m, () => {
  if (chartView.value === '1m' && dashboardData.value.sales_overview_1m.length > 0) {
    nextTick(() => {
      initChart()
    })
  }
}, { deep: true, immediate: true }) // immediate: true ensures it runs on initial load

</script>
<style scoped>
.dashboard-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.dashboard-subtitle {
  color: #6b7280;
  margin: 0;
}

.kpi-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kpi-content {
  display: flex;
  gap: 16px;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.kpi-pink .kpi-icon {
  background: #fce7f3;
  color: #ec4899;
}

.kpi-purple .kpi-icon {
  background: #ede9fe;
  color: #8b5cf6;
}

.kpi-cyan .kpi-icon {
  background: #cffafe;
  color: #06b6d4;
}

.kpi-orange .kpi-icon {
  background: #fed7aa;
  color: #f97316;
}

.kpi-details {
  flex: 1;
}

.kpi-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.kpi-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #10b981;
}

.trend-down {
  color: #ef4444;
}

.trend-neutral {
  color: #6b7280;
}

.chart-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-container {
  height: 300px;
  padding: 16px 0;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  padding: 6px;
  background: #f9fafb;
  border-radius: 8px;
}

.category-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.category-revenue {
  font-size: 18px;
  font-weight: 700;
  color: #6366f1;
}

.table-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.orders-list,
.stock-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item,
.stock-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.order-avatar,
.stock-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.order-info,
.stock-info {
  flex: 1;
}

.order-customer,
.stock-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.order-details,
.stock-variant {
  font-size: 12px;
  color: #6b7280;
}

.order-amount {
  font-weight: 600;
  color: #1f2937;
  margin-right: 12px;
}

.stock-quantity {
  text-align: right;
}

.quantity-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #fef3c7;
  color: #f59e0b;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stock-date {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.actions-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  background: #e0e7ff;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 32px;
  color: #6366f1;
}

.action-label {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  text-align: center;
}

.kpi-section,
.charts-section,
.tables-section,
.actions-section {
  margin-bottom: 16px;
}
</style>