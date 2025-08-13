<template>
  <div class="dashboard-container">
    <!-- Page Header -->
    <a-page-header
      title="Fashion Dashboard"
      sub-title="Admin Overview"
      class="dashboard-header"
    >
      <template #extra>
        <a-space>
          <a-button @click="refreshData" :loading="pending">
            <template #icon>
              <ReloadOutlined />
            </template>
            Refresh
          </a-button>
          <a-tag color="green" v-if="data?.last_updated">
            Last updated: {{ formatDateTime(data.last_updated) }}
          </a-tag>
        </a-space>
      </template>
    </a-page-header>

    <!-- Loading State -->
    <div v-if="pending && !data" class="loading-container">
      <a-spin size="large" />
      <p>Loading dashboard data...</p>
    </div>

    <!-- Error State -->
    <a-alert
      v-else-if="error"
      type="error"
      :message="error.message || 'Failed to load dashboard data'"
      show-icon
      closable
      class="error-alert"
    />

    <!-- Dashboard Content -->
    <div v-else-if="data" class="dashboard-content">
      <!-- KPI Cards -->
      <a-row :gutter="[16, 16]" class="kpi-section">
        <a-col :xs="24" :sm="12" :md="6" v-for="(kpi, key) in data.kpis" :key="key">
          <a-card class="kpi-card" :class="`kpi-${kpi.color}`">
            <div class="kpi-content">
              <div class="kpi-icon">
                <component :is="getIcon(kpi.icon)" />
              </div>
              <div class="kpi-info">
                <div class="kpi-value">{{ formatKpiValue(kpi.value, key) }}</div>
                <div class="kpi-label">{{ kpi.label }}</div>
                <div class="kpi-meta" v-if="kpi.variants">
                  {{ kpi.variants }} variants
                </div>
                <div class="kpi-meta" v-if="kpi.new_this_month">
                  +{{ kpi.new_this_month }} this month
                </div>
              </div>
              <div class="kpi-trend" :class="`trend-${kpi.trend}`">
                <ArrowUpOutlined v-if="kpi.trend === 'up'" />
                <ArrowDownOutlined v-else-if="kpi.trend === 'down'" />
                <MinusOutlined v-else />
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Charts and Tables Row -->
      <a-row :gutter="[16, 16]" class="charts-section">
        <!-- Sales Overview Chart -->
        <a-col :xs="24" :lg="16">
          <a-card title="Sales Overview" class="chart-card">
            <div class="sales-chart">
              <a-empty v-if="!hasSalesData" description="No sales data available" />
              <div v-else ref="salesChart" class="chart-container"></div>
            </div>
          </a-card>
        </a-col>

        <!-- Top Categories -->
        <a-col :xs="24" :lg="8">
          <a-card title="Top Categories" class="categories-card">
            <div class="category-list">
              <div 
                v-for="category in data.top_categories" 
                :key="category.id"
                class="category-item"
              >
                <div class="category-info">
                  <div class="category-name">{{ category.name }}</div>
                  <div class="category-stats">
                    <span class="revenue">${{ parseFloat(category.revenue).toFixed(2) }}</span>
                    <span class="orders">{{ category.orders }} orders</span>
                  </div>
                </div>
                <div class="category-progress">
                  <a-progress 
                    :percent="getCategoryPercentage(category.revenue)" 
                    :show-info="false"
                    size="small"
                  />
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Tables Row -->
      <a-row :gutter="[16, 16]" class="tables-section">
        <!-- Recent Orders -->
        <a-col :xs="24" :lg="14">
          <a-card title="Recent Orders" class="orders-card">
            <a-table 
              :dataSource="data.recent_orders" 
              :columns="orderColumns"
              :pagination="{ pageSize: 5 }"
              size="small"
              :scroll="{ x: 800 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status_color">
                    {{ record.status_label }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'amount'">
                  ${{ parseFloat(record.amount).toFixed(2) }}
                </template>
                <template v-else-if="column.key === 'datetime'">
                  <div class="datetime-cell">
                    <div>{{ record.date }}</div>
                    <small class="time">{{ record.time }}</small>
                  </div>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>

        <!-- Low Stock Items -->
        <a-col :xs="24" :lg="10">
          <a-card title="Low Stock Alert" class="stock-card">
            <a-table 
              :dataSource="data.low_stock_items" 
              :columns="stockColumns"
              :pagination="{ pageSize: 5 }"
              size="small"
              :scroll="{ x: 600 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status_color">
                    {{ record.status }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'quantity'">
                  <span :class="record.status === 'critical' ? 'critical-stock' : ''">
                    {{ record.quantity }}
                  </span>
                </template>
                <template v-else-if="column.key === 'price'">
                  ${{ parseFloat(record.price).toFixed(2) }}
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { 
  DollarOutlined, 
  ShoppingOutlined, 
  UserOutlined, 
  PackageOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined
} from '@ant-design/icons-vue'

// Meta
definePageMeta({
  layouts: 'default'
})

// Fetch dashboard data
const { data, pending, error, refresh } = await useFetch('/dashboard/overview', {
  key: 'dashboard-overview',
  server: false
})

// Reactive refs
const salesChart = ref(null)

// Table columns
const orderColumns = [
  {
    title: 'Order #',
    dataIndex: 'order_number',
    key: 'order_number',
    width: 150,
    ellipsis: true
  },
  {
    title: 'Customer',
    dataIndex: 'customer_name',
    key: 'customer_name',
    ellipsis: true
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
    align: 'right'
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: 'Date & Time',
    key: 'datetime',
    width: 140
  }
]

const stockColumns = [
  {
    title: 'Item',
    dataIndex: 'item_name',
    key: 'item_name',
    ellipsis: true
  },
  {
    title: 'Color/Size',
    key: 'variant',
    width: 80,
    customRender: ({ record }) => `${record.color}/${record.size}`
  },
  {
    title: 'Qty',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 60,
    align: 'center'
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 80
  }
]

// Computed properties
const hasSalesData = computed(() => {
  return data.value?.sales_overview?.some(week => 
    week.dresses > 0 || week.tops__blouses > 0 || week.shoes > 0
  )
})

// Methods
const getIcon = (iconName) => {
  const iconMap = {
    'dollar-sign': DollarOutlined,
    'shopping-bag': ShoppingOutlined,
    'users': UserOutlined,
    'package': PackageOutlined
  }
  return iconMap[iconName] || PackageOutlined
}

const formatKpiValue = (value, key) => {
  if (key === 'total_revenue') {
    return `$${parseFloat(value).toFixed(2)}`
  }
  return value
}

const formatDateTime = (datetime) => {
  return new Date(datetime).toLocaleString()
}

const getCategoryPercentage = (revenue) => {
  if (!data.value?.top_categories) return 0
  const maxRevenue = Math.max(...data.value.top_categories.map(c => parseFloat(c.revenue)))
  return Math.round((parseFloat(revenue) / maxRevenue) * 100)
}

const refreshData = () => {
  refresh()
}

// Sales chart rendering (using a simple CSS-based chart for demo)
watch(data, (newData) => {
  if (newData && hasSalesData.value) {
    nextTick(() => {
      renderSalesChart()
    })
  }
}, { immediate: true })

const renderSalesChart = () => {
  // This is a placeholder for chart rendering
  // In a real application, you would use a charting library like Chart.js or ECharts
  console.log('Rendering sales chart with data:', data.value?.sales_overview)
}
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.dashboard-header {
  background: white;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: white;
  border-radius: 8px;
}

.error-alert {
  margin-bottom: 24px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* KPI Cards */
.kpi-card {
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  border: none;
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.kpi-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0;
}

.kpi-icon {
  font-size: 32px;
  margin-right: 16px;
  opacity: 0.8;
}

.kpi-info {
  flex: 1;
}

.kpi-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 4px;
}

.kpi-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
}

.kpi-meta {
  font-size: 12px;
  color: #999;
}

.kpi-trend {
  font-size: 18px;
  margin-left: 12px;
}

.trend-up { color: #52c41a; }
.trend-down { color: #ff4d4f; }
.trend-neutral { color: #999; }

/* KPI Color Themes */
.kpi-pink { 
  background: linear-gradient(135deg, #ff6b9d, #c44569);
  color: white;
}

.kpi-purple { 
  background: linear-gradient(135deg, #a55eea, #8e44ad);
  color: white;
}

.kpi-cyan { 
  background: linear-gradient(135deg, #26d0ce, #1abc9c);
  color: white;
}

.kpi-orange { 
  background: linear-gradient(135deg, #ffa726, #ff7043);
  color: white;
}

/* Chart Card */
.chart-card .ant-card-body {
  padding: 24px;
}

.sales-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  width: 100%;
  height: 100%;
}

/* Categories Card */
.categories-card .ant-card-body {
  padding: 16px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.category-info {
  margin-bottom: 8px;
}

.category-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.category-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.revenue {
  font-weight: 600;
  color: #52c41a;
}

.orders {
  color: #1890ff;
}

/* Table Styles */
.orders-card, .stock-card {
  height: fit-content;
}

.datetime-cell {
  line-height: 1.2;
}

.time {
  color: #999;
  font-size: 11px;
}

.critical-stock {
  color: #ff4d4f;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .kpi-value {
    font-size: 24px;
  }
  
  .kpi-icon {
    font-size: 28px;
    margin-right: 12px;
  }
  
  .sales-chart {
    height: 250px;
  }
}

/* Dark mode support */
.dark .dashboard-container {
  background: #141414;
}

.dark .kpi-card {
  background: #1f1f1f;
  border: 1px solid #303030;
}

.dark .category-item {
  background: #262626;
  border-color: #303030;
}
</style>