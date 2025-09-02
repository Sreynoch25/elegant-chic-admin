<template>
  <div class="sales-dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <a-page-header title="Sales Dashboard" sub-title="Track your sales performance and analytics">
        <template #extra>
          <a-range-picker v-model:value="dateRange" @change="onDateRangeChange" format="YYYY-MM-DD" />
          <a-button type="primary" :loading="refreshing" @click="refreshData">
            <template #icon>
              <ReloadOutlined />
            </template>
            Refresh
          </a-button>
        </template>
      </a-page-header>
    </div>

    <!-- Summary Cards -->
    <a-row :gutter="[16, 16]" class="summary-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <a-statistic title="Total Orders" :value="summary.total_orders" :loading="loading">
            <template #prefix>
              <ShoppingCartOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <a-statistic title="Total Revenue" :value="summary.total_revenue" :precision="2" prefix="$"
            :loading="loading">
            <template #prefix>
              <DollarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <a-statistic title="Average Order Value" :value="summary.average_order_value" :precision="2" prefix="$"
            :loading="loading">
            <template #prefix>
              <!-- <TrendingUpOutlined /> -->
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <a-statistic title="Delivery Fees" :value="summary.total_delivery_fees" :precision="2" prefix="$"
            :loading="loading">
            <template #prefix>
              <TruckOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- Charts Section -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <a-col :xs="24" :lg="16">
        <a-card title="Sales by Period" :loading="loading">
          <div class="chart-container" style="height: 300px;">
            <FashionSalesChart :period="currentPeriod" :sales-overview="salesOverview" :kpis="kpis" />
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="Order Status" :loading="loading">
          <div class="status-chart-container" style="height: 300px;">
            <canvas ref="statusChartCanvas" class="w-full h-full"></canvas>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <div class="data-sections">
      <!-- Top Selling Items with Modern Card Grid Style -->
      <div class="modern-section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="title-icon">🏆</span>
            Top Selling Items
          </h3>
          <div class="section-stats">
            <span class="stat-badge">{{ topSellingItems.length }} Items</span>
          </div>
        </div>

        <div class="top-items-grid" :class="{ 'loading': loading }">
          <div v-for="(item, index) in topSellingItems" :key="`${item.item_name}-${item.size}-${item.color}`"
            class="top-item-card" :style="{ animationDelay: `${index * 0.1}s` }">
            <div class="item-rank">{{ index + 1 }}</div>
            <div class="item-header">
              <div class="item-title">{{ item.full_item_name }}</div>
              <div class="item-attributes">
                <span class="color-badge" :style="getColorStyle(item.color)">{{ item.color }}</span>
                <span class="size-badge">{{ item.size }}</span>
              </div>
            </div>
            <div class="item-metrics">
              <div class="metric">
                <div class="metric-value">${{ parseFloat(item.total_revenue).toLocaleString() }}</div>
                <div class="metric-label">Total Revenue</div>
              </div>
              <div class="metric">
                <div class="metric-value">{{ item.total_quantity_sold }}</div>
                <div class="metric-label">Sold</div>
              </div>
              <div class="metric">
                <div class="metric-value">${{ parseFloat(item.average_price).toFixed(2) }}</div>
                <div class="metric-label">Avg Price</div>
              </div>
            </div>
            <div class="item-footer">
              <div class="orders-count">{{ item.total_orders }} orders</div>
              <div class="trend-indicator positive">↗ +12%</div>
            </div>
          </div>
        </div>

      </div>
              <!-- Quick Actions -->
        <div class="!mt-3">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Fashion Actions</h3>
          <a-row :gutter="[16, 16]">
            <a-col :xs="12" :sm="8" :md="6" v-for="action in quickActions" :key="action.key">
              <NuxtLink :to="action.link">
                <a-card :bordered="false" hoverable class="text-center quick-action-card">
                  <div class="action-icon !mb-3" :style="{ color: action.color }">
                    <component :is="action.icon" class="text-2xl" />
                  </div>
                  <p class="text-sm font-medium text-gray-800">{{ action.title }}</p>
                </a-card>
              </NuxtLink>
            </a-col>
          </a-row>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, defineComponent, h, watch, type PropType } from 'vue'
import { message } from 'ant-design-vue'
import Chart from 'chart.js/auto'
import type { Dayjs } from 'dayjs'
import {
    ShoppingCartOutlined,
    EyeOutlined,
    FileTextOutlined,
    GiftOutlined,
} from '@ant-design/icons-vue'
// Types
interface Order {
  order_number: string
  placed_at: string
  item_name: string
  size: string
  color: string
  full_item_name: string
  color_name: string
  size_name: string
  quantity: number
  final_price: string
  total_price: string
  customer_id: string
}

interface TopSellingItem {
  item_name: string
  size: string
  color: string
  full_item_name: string
  total_quantity_sold: string
  total_revenue: string
  average_price: string
  total_orders: number
}

interface SalesPeriod {
  period: string
  orders_count: number
  revenue: string
  week?: string
  dresses?: number
  tops__blouses?: number
  shoes?: number
}

interface StatusBreakdown {
  status: string
  count: number
  revenue: string
}

interface Summary {
  total_orders: number
  total_revenue: string
  average_order_value: string
  total_delivery_fees: string
}

interface SalesOverview {
  period?: string
  week?: string
  dresses?: number
  tops__blouses?: number
  shoes?: number
}

definePageMeta({
  layout: "default"
})

const quickActions = computed(() => [
    {
        key: 'view-orders',
        title: 'View Orders',
        icon: EyeOutlined,
        color: '#8b5cf6',
        link: '/orders'
    },
    {
        key: 'reports',
        title: 'Reports',
        icon: FileTextOutlined,
        color: '#f59e0b',
        link: '/reports/inventory'
    },
    {
        key: 'promotions',
        title: 'Promotions',
        icon: GiftOutlined,
        color: '#10b981',
        link: '/promotions/discounts'
    },
])
// Fashion Sales Chart Component
const FashionSalesChart = defineComponent({
  props: {
    period: String,
    salesOverview: Array as PropType<SalesOverview[]>,
    kpis: Object
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null)
    let chartInstance: Chart | null = null

    // Fashion-themed color palette
    const fashionColors = {
      dresses: '#ec4899', // pink
      tops: '#8b5cf6', // purple
      shoes: '#06b6d4', // cyan
      gradients: {
        dresses: 'rgba(236, 72, 153, 0.1)',
        tops: 'rgba(139, 92, 246, 0.1)',
        shoes: 'rgba(6, 182, 212, 0.1)'
      }
    }

    // Transform API data to Chart.js format
    const generateChartData = () => {
      if (!props.salesOverview?.length) return {
        labels: [],
        datasets: []
      }

      const labels = props.salesOverview.map(item => item.week || item.period || 'N/A')
      const dressesData = props.salesOverview.map(item => item.dresses || 0)
      const topsData = props.salesOverview.map(item => item.tops__blouses || 0)
      const shoesData = props.salesOverview.map(item => item.shoes || 0)

      return {
        labels,
        datasets: [
          {
            label: 'Dresses',
            data: dressesData,
            borderColor: fashionColors.dresses,
            backgroundColor: fashionColors.gradients.dresses,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Tops & Blouses',
            data: topsData,
            borderColor: fashionColors.tops,
            backgroundColor: fashionColors.gradients.tops,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Shoes',
            data: shoesData,
            borderColor: fashionColors.shoes,
            backgroundColor: fashionColors.gradients.shoes,
            fill: true,
            tension: 0.4
          }
        ]
      }
    }

    // Create chart
    const initChart = () => {
      if (chartInstance) chartInstance.destroy()

      const chartData = generateChartData()

      if (chartCanvas.value) {
        chartInstance = new Chart(chartCanvas.value, {
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
                  }
                }
              }
            },
            scales: {
              y: {
                ticks: {
                  callback: (value) => '$' + value
                }
              }
            }
          }
        })
      }
    }

    watch(() => [props.salesOverview, props.period], () => {
      nextTick(() => initChart())
    })

    onMounted(() => {
      nextTick(() => initChart())
    })

    onUnmounted(() => {
      if (chartInstance) chartInstance.destroy()
    })

    return () => h('div', { class: 'fashion-sales-chart' }, [
      h('canvas', {
        ref: chartCanvas,
        class: 'w-full h-full',
        style: 'border-radius: 8px;'
      })
    ])
  }
})

// Reactive data
const loading = ref(true)
const refreshing = ref(false)
const dateRange = ref<[Dayjs, Dayjs] | undefined>(undefined)
const searchText = ref('')
const currentPeriod = ref('weekly')
const viewMode = ref<'timeline' | 'table'>('timeline')

// Initialize with empty data to prevent errors
const orders = ref<Order[]>([])
const topSellingItems = ref<TopSellingItem[]>([])
const salesByPeriod = ref<SalesPeriod[]>([])
const statusBreakdown = ref<StatusBreakdown[]>([])
const summary = ref<Summary>({
  total_orders: 0,
  total_revenue: "0.00",
  average_order_value: "0.00",
  total_delivery_fees: "0.00"
})

// Chart refs
const statusChartCanvas = ref<HTMLCanvasElement>()
let statusChartInstance: Chart | null = null

// Transform sales data for the fashion chart
const salesOverview = computed((): SalesOverview[] => {
  return salesByPeriod.value.map(item => ({
    period: item.period,
    week: item.period,
    dresses: Math.floor(parseFloat(item.revenue) * 0.4), // Mock data transformation
    tops__blouses: Math.floor(parseFloat(item.revenue) * 0.35),
    shoes: Math.floor(parseFloat(item.revenue) * 0.25)
  }))
})

const kpis = computed(() => ({
  totalRevenue: summary.value.total_revenue,
  totalOrders: summary.value.total_orders,
  avgOrderValue: summary.value.average_order_value
}))

// Table configurations
const ordersColumns = [
  {
    title: 'Order Number',
    key: 'order_number',
    width: 180,
  },
  {
    title: 'Item',
    key: 'item',
    width: 250,
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center' as const,
    width: 80,
  },
  {
    title: 'Price',
    key: 'final_price',
    align: 'right' as const,
    width: 100,
  },
  {
    title: 'Date',
    key: 'placed_at',
    width: 150,
  },
]

// Computed
const filteredOrders = computed(() => {
  if (!searchText.value) return orders.value
  return orders.value.filter(order =>
    order.order_number.toLowerCase().includes(searchText.value.toLowerCase()) ||
    order.full_item_name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const paginationConfig = computed(() => ({
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} of ${total} items`,
}))

// Methods
const fetchData = async () => {
  try {
    loading.value = true

    // Build API URLs with date range if provided
    const baseParams = new URLSearchParams()
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      baseParams.set('start_date', dateRange.value[0].format('YYYY-MM-DD'))
      baseParams.set('end_date', dateRange.value[1].format('YYYY-MM-DD'))
    }

    // Mock API calls - replace with your actual API endpoints
    const [topItemsRes, detailedRes, periodRes, summaryRes] = await Promise.all([
      Promise.resolve({ data: { value: { success: true, data: mockTopItems } } }),
      Promise.resolve({ data: { value: { success: true, data: mockOrders } } }),
      Promise.resolve({ data: { value: { success: true, data: mockSalesByPeriod } } }),
      Promise.resolve({ data: { value: { success: true, data: { summary: mockSummary, status_breakdown: mockStatusBreakdown } } } })
    ])

    // Update reactive data with API responses
    if (topItemsRes.data.value?.success) {
      topSellingItems.value = topItemsRes.data.value.data || []
    }

    if (detailedRes.data.value?.success) {
      orders.value = detailedRes.data.value.data || []
    }

    if (periodRes.data.value?.success) {
      salesByPeriod.value = periodRes.data.value.data || []
    }

    if (summaryRes.data.value?.success) {
      const summaryData = summaryRes.data.value.data
      if (summaryData?.summary) {
        summary.value = summaryData.summary
      }
      if (summaryData?.status_breakdown) {
        statusBreakdown.value = summaryData.status_breakdown
      }
    }

    // Initialize status chart
    initStatusChart()

    message.success('Data loaded successfully')
  } catch (error) {
    console.error('Failed to fetch data:', error)
    message.error('Failed to load sales data')
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  refreshing.value = true
  await fetchData()
  refreshing.value = false
}

// Fixed date range change handler
const onDateRangeChange = async (dates: [string, string] | [Dayjs, Dayjs] | null) => {
  console.log('Date range changed:', dates)
  if (dates && dates.length === 2) {
    // Handle both string and Dayjs types
    if (typeof dates[0] === 'string') {
      dateRange.value = undefined // Handle string dates separately if needed
    } else {
      dateRange.value = dates as [Dayjs, Dayjs]
    }
  } else {
    dateRange.value = undefined
  }
  await fetchData()
}

const onSearch = (value: string) => {
  console.log('Search:', value)
}

const viewOrderDetails = (order: Order) => {
  message.info(`Viewing details for ${order.order_number}`)
}

const getColorTag = (color: string) => {
  const colorMap: { [key: string]: string } = {
    'Black': 'default',
    'White': 'default',
    'Red': 'red',
    'Blue': 'blue',
    'Green': 'green',
  }
  return colorMap[color] || 'default'
}

const getColorStyle = (color: string) => {
  const colorMap: { [key: string]: string } = {
    'Black': '#2c3e50',
    'White': '#ecf0f1',
    'Red': '#e74c3c',
    'Blue': '#3498db',
    'Navy Blue': '#2c3e50',
    'Green': '#27ae60',
    'Pink': '#e91e63',
    'Purple': '#9c27b0',
    'Gray': '#95a5a6',
  }
  return {
    backgroundColor: colorMap[color] || '#bdc3c7',
    border: color === 'White' ? '1px solid #ddd' : 'none'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const initStatusChart = () => {
  nextTick(() => {
    if (statusChartCanvas.value && statusBreakdown.value.length > 0) {
      statusChartInstance?.destroy()
      statusChartInstance = new Chart(statusChartCanvas.value, {
        type: 'doughnut',
        data: {
          labels: statusBreakdown.value.map(item => item.status),
          datasets: [{
            data: statusBreakdown.value.map(item => item.count),
            backgroundColor: ['#52c41a', '#1890ff', '#faad14', '#f5222d'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      })
    }
  })
}

// Enhanced mock data for demonstration
const mockTopItems = [
  {
    item_name: 'Floral Dress',
    size: 'M',
    color: 'Blue',
    full_item_name: 'Floral Summer Dress',
    total_quantity_sold: '125',
    total_revenue: '3750.00',
    average_price: '30.00',
    total_orders: 95
  },
  {
    item_name: 'Silk Blouse',
    size: 'L',
    color: 'White',
    full_item_name: 'Classic Silk Blouse',
    total_quantity_sold: '89',
    total_revenue: '2670.00',
    average_price: '30.00',
    total_orders: 72
  },
  {
    item_name: 'Ankle Boots',
    size: '8',
    color: 'Black',
    full_item_name: 'Leather Ankle Boots',
    total_quantity_sold: '65',
    total_revenue: '5850.00',
    average_price: '90.00',
    total_orders: 58
  }
]

const mockOrders = [
  {
    order_number: 'ORD001',
    placed_at: '2024-08-28T10:30:00Z',
    item_name: 'Dress',
    size: 'M',
    color: 'Blue',
    full_item_name: 'Floral Summer Dress',
    color_name: 'Navy Blue',
    size_name: 'Medium',
    quantity: 1,
    final_price: '29.99',
    total_price: '29.99',
    customer_id: 'CUST001'
  },
  {
    order_number: 'ORD002',
    placed_at: '2024-08-28T09:15:00Z',
    item_name: 'Blouse',
    size: 'S',
    color: 'White',
    full_item_name: 'Classic Silk Blouse',
    color_name: 'White',
    size_name: 'Small',
    quantity: 2,
    final_price: '59.98',
    total_price: '59.98',
    customer_id: 'CUST002'
  },
  {
    order_number: 'ORD003',
    placed_at: '2024-08-28T08:45:00Z',
    item_name: 'Boots',
    size: '7',
    color: 'Black',
    full_item_name: 'Leather Ankle Boots',
    color_name: 'Black',
    size_name: '7',
    quantity: 1,
    final_price: '89.99',
    total_price: '89.99',
    customer_id: 'CUST003'
  }
]

const mockSalesByPeriod = [
  { period: '2024-08-25', orders_count: 45, revenue: '1350.00' },
  { period: '2024-08-26', orders_count: 52, revenue: '1560.00' },
  { period: '2024-08-27', orders_count: 38, revenue: '1140.00' },
  { period: '2024-08-28', orders_count: 61, revenue: '1830.00' }
]

const mockSummary = {
  total_orders: 196,
  total_revenue: '5880.00',
  average_order_value: '30.00',
  total_delivery_fees: '392.00'
}

const mockStatusBreakdown = [
  { status: 'Completed', count: 150, revenue: '4500.00' },
  { status: 'Processing', count: 30, revenue: '900.00' },
  { status: 'Shipped', count: 16, revenue: '480.00' }
]

// Lifecycle
onMounted(async () => {
  await fetchData()
})

onUnmounted(() => {
  statusChartInstance?.destroy()
})
</script>

<style scoped>
.sales-dashboard {
  padding: 24px;
  min-height: 100vh;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  margin: -24px -24px 24px -24px;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0 0 16px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.summary-cards {
  margin-bottom: 24px;
}

.summary-cards .ant-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.charts-section {
  margin-bottom: 32px;
}

.charts-section .ant-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.chart-container,
.status-chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

.data-sections {
  display: flex;
  flex-direction: column;
  gap: px;
}

/* Modern Section Styling */
.modern-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 64px rgba(0, 0, 0, 0.15);
  padding: 28px;
  position: relative;
  overflow: hidden;
}

.modern-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
  border-radius: 24px 24px 0 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.title-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.section-stats {
  display: flex;
  gap: 8px;
}

.stat-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 280px;
}

.view-toggle .ant-btn-group {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

/* Top Items Grid Styling */
.top-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  opacity: 1;
  transition: all 0.3s ease;
}

.top-items-grid.loading {
  opacity: 0.6;
  pointer-events: none;
}

.top-item-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInUp 0.6s ease-out both;
  cursor: pointer;
}

.top-item-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent, rgba(102, 126, 234, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.top-item-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.top-item-card:hover::before {
  opacity: 1;
}

.item-rank {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.item-header {
  margin-bottom: 20px;
}

.item-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  line-height: 1.3;
}

.item-attributes {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.size-badge {
  padding: 4px 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.item-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.metric {
  text-align: center;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}

.metric:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 12px;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.orders-count {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.trend-indicator {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

.trend-indicator.positive {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

/* Timeline Styling */
.orders-timeline {
  position: relative;
  padding-left: 32px;
}

.orders-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #667eea, #764ba2, transparent);
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
  animation: slideInLeft 0.6s ease-out both;
}

.timeline-marker {
  position: absolute;
  left: -24px;
  top: 16px;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  z-index: 2;
}

.timeline-content {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.timeline-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.timeline-content:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.timeline-content:hover::before {
  transform: scaleX(1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.order-info .order-number {
  font-size: 16px;
  font-weight: 700;
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s ease;
}

.order-number:hover {
  color: #764ba2;
}

.order-time {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 4px;
}

.order-price {
  font-size: 20px;
  font-weight: 700;
  color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.item-preview {
  display: flex;
  gap: 16px;
  align-items: center;
}

.item-image-placeholder {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  border-radius: 12px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.item-image-placeholder::before {
  content: '👗';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  opacity: 0.8;
}

.item-info .item-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 6px;
}

.item-specs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #7f8c8d;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Table Styling */
.orders-table-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.modern-table {
  background: transparent;
}

.modern-table .ant-table-thead>tr>th {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-weight: 600;
  border: none;
  padding: 16px;
}

.modern-table .ant-table-tbody>tr>td {
  border: none;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modern-table .ant-table-tbody>tr:hover>td {
  background: rgba(102, 126, 234, 0.05);
}

/* Animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fashion-sales-chart {
  position: relative;
  height: 100%;
  width: 100%;
  animation: fadeInChart 0.8s ease-out;
}

@keyframes fadeInChart {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .top-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .sales-dashboard {
    padding: 16px;
  }

  .page-header {
    margin: -16px -16px 16px -16px;
    padding: 0 16px;
  }

  .modern-section {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .section-controls {
    width: 100%;
    justify-content: space-between;
  }

  .search-input {
    width: 200px;
  }

  .top-items-grid {
    grid-template-columns: 1fr;
  }

  .item-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .timeline-content {
    padding: 16px;
  }

  .item-preview {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 20px;
  }

  .item-metrics {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .order-header {
    flex-direction: column;
    gap: 12px;
  }

  .search-input {
    width: 100%;
  }
}
</style>