<template>
  <div class="admin-report-page">
    <!-- Page Header -->
    <div class="page-header">
      <a-page-header
        title="Detailed Items Sales Report"
        sub-title="Comprehensive order-level sales data with item details"
      >
        <template #extra>
          <a-space>
            <a-button @click="exportData">
              <template #icon>
                <DownloadOutlined />
              </template>
              Export
            </a-button>
            <a-button type="primary" @click="refreshData">
              <template #icon>
                <ReloadOutlined />
              </template>
              Refresh
            </a-button>
          </a-space>
        </template>
      </a-page-header>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="loading-container">
      <a-spin size="large" tip="Loading detailed sales data...">
        <div class="loading-content"></div>
      </a-spin>
    </div>

    <!-- Error State -->
    <a-alert
      v-else-if="error"
      message="Failed to load detailed sales data"
      :description="error.message"
      type="error"
      show-icon
      closable
      class="error-alert"
    />

    <!-- Main Content -->
    <div v-else class="report-content">
      <!-- Summary Cards -->
      <a-row :gutter="[16, 16]" class="summary-cards">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic
              title="Total Orders"
              :value="summaryStats.totalOrders"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <ShoppingCartOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic
              title="Total Items Sold"
              :value="summaryStats.totalItemsSold"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <AppstoreOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic
              title="Total Revenue"
              :value="summaryStats.totalRevenue"
              :precision="2"
              prefix="$"
              :value-style="{ color: '#f5222d' }"
            >
              <template #prefix>
                <DollarCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic
              title="Avg Order Value"
              :value="summaryStats.avgOrderValue"
              :precision="2"
              prefix="$"
              :value-style="{ color: '#faad14' }"
            >
              <template #prefix>
                <LineChartOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>

      <!-- Filters and Search -->
      <a-card class="filters-card" title="Filters & Search">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-input
              v-model:value="searchText"
              placeholder="Search order number, item..."
              allow-clear
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-range-picker
              v-model:value="dateRange"
              format="YYYY-MM-DD"
              :placeholder="['Start Date', 'End Date']"
              style="width: 100%"
            />
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-select
              v-model:value="selectedColor"
              placeholder="Filter by Color"
              allow-clear
              style="width: 100%"
            >
              <a-select-option
                v-for="color in uniqueColors"
                :key="color"
                :value="color"
              >
                {{ color }}
              </a-select-option>
            </a-select>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-select
              v-model:value="selectedSize"
              placeholder="Filter by Size"
              allow-clear
              style="width: 100%"
            >
              <a-select-option
                v-for="size in uniqueSizes"
                :key="size"
                :value="size"
              >
                {{ size }}
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </a-card>

      <!-- Data Table -->
      <a-card class="table-card" title="Detailed Sales Data">
        <template #extra>
          <a-space>
            <span class="table-info">
              Showing {{ filteredData.length }} of {{ data?.meta?.total || 0 }} records
            </span>
            <a-button size="small" @click="toggleGrouping">
              <template #icon>
                <GroupOutlined />
              </template>
              {{ groupByOrder ? 'Ungroup' : 'Group by Order' }}
            </a-button>
          </a-space>
        </template>
        
        <a-table
          :data-source="displayData"
          :columns="tableColumns"
          :pagination="paginationConfig"
          :loading="pending"
          :scroll="{ x: 1400 }"
          :row-key="getRowKey"
          :expanded-row-keys="expandedRowKeys"
          @expand="onExpand"
        >
          <template #bodyCell="{ column, record }">
            <!-- Order Number -->
            <template v-if="column.key === 'order_number'">
              <a-typography-text copyable>
                {{ record.order_number }}
              </a-typography-text>
            </template>

            <!-- Date -->
            <template v-else-if="column.key === 'placed_at'">
              <a-space direction="vertical" size="small">
                <span>{{ formatDate(record.placed_at) }}</span>
                <a-typography-text type="secondary" style="font-size: 12px">
                  {{ formatTime(record.placed_at) }}
                </a-typography-text>
              </a-space>
            </template>

            <!-- Item Name -->
            <template v-else-if="column.key === 'item_name'">
              <a-space direction="vertical" size="small">
                <a-typography-text strong>{{ record.item_name }}</a-typography-text>
                <a-space>
                  <a-tag :color="getColorTag(record.color)">{{ record.color_name }}</a-tag>
                  <a-tag>{{ record.size_name }}</a-tag>
                </a-space>
              </a-space>
            </template>

            <!-- Price -->
            <template v-else-if="column.key === 'price'">
              ${{ parseFloat(record.price).toFixed(2) }}
            </template>

            <!-- Total -->
            <template v-else-if="column.key === 'total'">
              <a-typography-text strong>
                ${{ parseFloat(record.total).toFixed(2) }}
              </a-typography-text>
            </template>

            <!-- Customer ID -->
            <template v-else-if="column.key === 'customer_id'">
              <a-typography-text 
                code 
                copyable 
                style="font-size: 11px"
              >
                {{ record.customer_id.substring(0, 8) }}...
              </a-typography-text>
            </template>

            <!-- Actions -->
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button size="small" type="link">
                  <template #icon>
                    <EyeOutlined />
                  </template>
                  View Order
                </a-button>
                <a-dropdown>
                  <a-button size="small" type="link">
                    <template #icon>
                      <MoreOutlined />
                    </template>
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="customer">
                        <UserOutlined />
                        View Customer
                      </a-menu-item>
                      <a-menu-item key="item">
                        <ShopOutlined />
                        View Item Details
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </template>

          <!-- Expandable row content for grouped orders -->
          <template #expandedRowRender="{ record }" v-if="groupByOrder">
            <div class="expanded-content">
              <h4>Order Items ({{ record.items?.length || 0 }})</h4>
              <a-table
                :data-source="record.items || []"
                :columns="expandedColumns"
                :pagination="false"
                size="small"
              >
                <template #bodyCell="{ column, record: item }">
                  <template v-if="column.key === 'item_details'">
                    <a-space>
                      <span>{{ item.item_name }}</span>
                      <a-tag :color="getColorTag(item.color)">{{ item.color }}</a-tag>
                      <a-tag>{{ item.size }}</a-tag>
                    </a-space>
                  </template>
                  <template v-else-if="column.key === 'item_price'">
                    ${{ parseFloat(item.price).toFixed(2) }}
                  </template>
                  <template v-else-if="column.key === 'item_total'">
                    ${{ parseFloat(item.total).toFixed(2) }}
                  </template>
                </template>
              </a-table>
            </div>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ReloadOutlined,
  DownloadOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  DollarCircleOutlined,
  LineChartOutlined,
  SearchOutlined,
  GroupOutlined,
  EyeOutlined,
  MoreOutlined,
  UserOutlined,
  ShopOutlined,
} from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'

// Define types
interface DetailedSalesItem {
  order_number: string
  placed_at: string
  item_name: string
  size: string
  color: string
  full_item_name: string
  color_name: string
  size_name: string
  quantity: number
  price: string
  total: string
  customer_id: string
}

interface GroupedOrder {
  order_number: string
  placed_at: string
  customer_id: string
  items: DetailedSalesItem[]
  order_total: number
  items_count: number
}

interface DetailedSalesResponse {
  success: boolean
  data: DetailedSalesItem[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    filters: any[]
  }
}

// Reactive data
const searchText = ref('')
const selectedColor = ref<string>()
const selectedSize = ref<string>()
const dateRange = ref<[Dayjs, Dayjs]>()
const groupByOrder = ref(false)
const expandedRowKeys = ref<string[]>([])

// Data fetching
const data = ref<DetailedSalesResponse | null>(null)
const pending = ref(true)
const error = ref<Error | null>(null)

const fetchData = async () => {
  try {
    pending.value = true
    error.value = null
    
    const response = await useFetchDataApi<DetailedSalesResponse>('/sales-reports/detailed-items')
    
    if (response.data.value) {
      data.value = response.data.value
    }
    
  } catch (err: any) {
    console.error('❌ Detailed Items Fetch Error:', err)
    error.value = err
  } finally {
    pending.value = false
  }
}

const refreshData = () => {
  fetchData()
}

// Initial data fetch
onMounted(() => {
  fetchData()
})

// Computed properties
const summaryStats = computed(() => {
  if (!data.value?.data) return {
    totalOrders: 0,
    totalItemsSold: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  }
  
  const uniqueOrders = new Set(data.value.data.map(item => item.order_number))
  const totalRevenue = data.value.data.reduce((sum, item) => sum + Number(item.total), 0)
  const totalItemsSold = data.value.data.reduce((sum, item) => sum + item.quantity, 0)
  
  return {
    totalOrders: uniqueOrders.size,
    totalItemsSold,
    totalRevenue,
    avgOrderValue: uniqueOrders.size > 0 ? totalRevenue / uniqueOrders.size : 0
  }
})

const uniqueColors = computed(() => {
  if (!data.value?.data) return []
  return [...new Set(data.value.data.map(item => item.color_name))].sort()
})

const uniqueSizes = computed(() => {
  if (!data.value?.data) return []
  return [...new Set(data.value.data.map(item => item.size_name))].sort()
})

const filteredData = computed(() => {
  if (!data.value?.data) return []
  
  let filtered = data.value.data
  
  // Apply search filter
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.order_number.toLowerCase().includes(search) ||
      item.item_name.toLowerCase().includes(search) ||
      item.full_item_name.toLowerCase().includes(search)
    )
  }
  
  // Apply date range filter
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startDate = dateRange.value[0].startOf('day')
    const endDate = dateRange.value[1].endOf('day')
    
    filtered = filtered.filter(item => {
      const itemDate = dayjs(item.placed_at)
      return itemDate.isAfter(startDate) && itemDate.isBefore(endDate)
    })
  }
  
  // Apply color filter
  if (selectedColor.value) {
    filtered = filtered.filter(item => item.color_name === selectedColor.value)
  }
  
  // Apply size filter
  if (selectedSize.value) {
    filtered = filtered.filter(item => item.size_name === selectedSize.value)
  }
  
  return filtered
})

const groupedData = computed((): GroupedOrder[] => {
  const groups = new Map<string, GroupedOrder>()
  
  filteredData.value.forEach(item => {
    if (!groups.has(item.order_number)) {
      groups.set(item.order_number, {
        order_number: item.order_number,
        placed_at: item.placed_at,
        customer_id: item.customer_id,
        items: [],
        order_total: 0,
        items_count: 0
      })
    }
    
    const group = groups.get(item.order_number)!
    group.items.push(item)
    group.order_total += Number(item.total)
    group.items_count += item.quantity
  })
  
  return Array.from(groups.values()).sort((a, b) => 
    new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime()
  )
})

const displayData = computed(() => {
  return groupByOrder.value ? groupedData.value : filteredData.value
})

import type { TableColumnType } from 'ant-design-vue'

// Table configurations
const tableColumns = computed((): TableColumnType<any>[] => {
  if (groupByOrder.value) {
    return [
      {
        title: 'Order Number',
        dataIndex: 'order_number',
        key: 'order_number',
        fixed: 'left' as const,
        width: 180
      },
      {
        title: 'Date & Time',
        dataIndex: 'placed_at',
        key: 'placed_at',
        width: 160,
        sorter: (a: any, b: any) => new Date(a.placed_at).getTime() - new Date(b.placed_at).getTime()
      },
      {
        title: 'Items Count',
        dataIndex: 'items_count',
        key: 'items_count',
        width: 120,
        sorter: (a: any, b: any) => a.items_count - b.items_count
      },
      {
        title: 'Order Total',
        dataIndex: 'order_total',
        key: 'order_total',
        width: 140,
        sorter: (a: any, b: any) => a.order_total - b.order_total,
        customRender: ({ text }: { text: number }) => `$${text.toFixed(2)}`
      },
      {
        title: 'Customer',
        dataIndex: 'customer_id',
        key: 'customer_id',
        width: 120
      },
      {
        title: 'Actions',
        key: 'actions',
        fixed: 'right' as const,
        width: 150
      }
    ]
  } else {
    return [
      {
        title: 'Order Number',
        dataIndex: 'order_number',
        key: 'order_number',
        fixed: 'left' as const,
        width: 180
      },
      {
        title: 'Date & Time',
        dataIndex: 'placed_at',
        key: 'placed_at',
        width: 160,
        sorter: (a: any, b: any) => new Date(a.placed_at).getTime() - new Date(b.placed_at).getTime()
      },
      {
        title: 'Item Details',
        dataIndex: 'item_name',
        key: 'item_name',
        width: 250
      },
      {
        title: 'Qty',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 80,
        sorter: (a: any, b: any) => a.quantity - b.quantity
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        width: 100,
        sorter: (a: any, b: any) => Number(a.price) - Number(b.price)
      },
      {
        title: 'Total',
        dataIndex: 'total',
        key: 'total',
        width: 100,
        sorter: (a: any, b: any) => Number(a.total) - Number(b.total)
      },
      {
        title: 'Customer',
        dataIndex: 'customer_id',
        key: 'customer_id',
        width: 120
      },
      {
        title: 'Actions',
        key: 'actions',
        fixed: 'right' as const,
        width: 150
      }
    ]
  }
})

const expandedColumns: TableColumnType<DetailedSalesItem>[] = [
  {
    title: 'Item',
    key: 'item_details',
    width: 300
  },
  {
    title: 'Qty',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 80
  },
  {
    title: 'Price',
    key: 'item_price',
    width: 100
  },
  {
    title: 'Total',
    key: 'item_total',
    width: 100
  }
]

const paginationConfig = {
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} of ${total} items`,
  pageSizeOptions: ['10', '20', '50', '100']
}

// Helper methods
const getRowKey = (record: any) => {
  return groupByOrder.value ? record.order_number : `${record.order_number}-${record.item_name}-${record.color}-${record.size}`
}

const toggleGrouping = () => {
  groupByOrder.value = !groupByOrder.value
  expandedRowKeys.value = []
}

const onExpand = (expanded: boolean, record: any) => {
  if (expanded) {
    expandedRowKeys.value.push(record.order_number)
  } else {
    expandedRowKeys.value = expandedRowKeys.value.filter(key => key !== record.order_number)
  }
}

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('MMM DD, YYYY')
}

const formatTime = (dateString: string) => {
  return dayjs(dateString).format('HH:mm:ss')
}

const getColorTag = (color: string) => {
  const colorMap: Record<string, string> = {
    Black: 'default',
    White: 'default',
    Blue: 'blue',
    Red: 'red',
    Green: 'green',
    Yellow: 'gold',
    Pink: 'magenta',
    Gray: 'default',
    Brown: 'default'
  }
  return colorMap[color] || 'default'
}

const exportData = () => {
  // Implementation for data export
  console.log('Exporting data...', filteredData.value)
}
</script>

<style scoped>
.admin-report-page {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  margin-bottom: 24px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-content {
  width: 100%;
  height: 200px;
}

.error-alert {
  margin-bottom: 24px;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-cards {
  margin-bottom: 24px;
}

.filters-card {
  margin-bottom: 24px;
}

.table-card {
  flex: 1;
}

.table-info {
  color: #8c8c8c;
  font-size: 14px;
}

.expanded-content {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.expanded-content h4 {
  margin-bottom: 12px;
  color: #262626;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-report-page {
    padding: 16px;
  }
  
  .page-header {
    margin-bottom: 16px;
  }
  
  .report-content {
    gap: 16px;
  }
  
  .summary-cards {
    margin-bottom: 16px;
  }
  
  .filters-card {
    margin-bottom: 16px;
  }
}

/* Custom ant design overrides */
:deep(.ant-card-head-title) {
  font-weight: 600;
}

:deep(.ant-statistic-title) {
  color: #8c8c8c;
  font-size: 14px;
}

:deep(.ant-statistic-content) {
  font-size: 24px;
  font-weight: 600;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
}

:deep(.ant-pagination) {
  margin-top: 16px;
}

:deep(.ant-table-tbody > tr.ant-table-expanded-row > td) {
  padding: 0;
}

:deep(.ant-table-tbody > tr.ant-table-expanded-row:hover > td) {
  background: white;
}
</style>