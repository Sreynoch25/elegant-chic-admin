<template>
  <div class="admin-report-page">
    <!-- Page Header -->
    <div class="page-header">
      <a-page-header title="Inventory Sales Report"
        sub-title="Comprehensive overview of inventory status and sales performance">
        <template #extra>
          <a-button type="primary" @click="refreshData">
            <template #icon>
              <ReloadOutlined />
            </template>
            Refresh
          </a-button>
        </template>
      </a-page-header>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="loading-container">
      <a-spin size="large" tip="Loading inventory data...">
        <div class="loading-content"></div>
      </a-spin>
    </div>

    <!-- Error State -->
    <a-alert v-else-if="error" message="Failed to load inventory data" :description="error.message" type="error"
      show-icon closable class="error-alert" />

    <!-- Main Content -->
    <div v-else class="report-content">
      <!-- Summary Cards -->
      <a-row :gutter="[16, 16]" class="summary-cards">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic title="Total Variants" :value="data?.summary?.total_variants || 0"
              :value-style="{ color: '#1890ff' }">
              <template #prefix>
                <AppstoreOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic title="Low Stock Items" :value="data?.summary?.low_stock_items || 0"
              :value-style="{ color: '#faad14' }">
              <template #prefix>
                <ExclamationCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic title="Out of Stock" :value="data?.summary?.out_of_stock_items || 0"
              :value-style="{ color: '#f5222d' }">
              <template #prefix>
                <StopOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card>
            <a-statistic title="Total Inventory Value" :value="data?.summary?.total_inventory_value || 0" :precision="2"
              prefix="$" :value-style="{ color: '#52c41a' }">
              <template #prefix>
                <DollarCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>

      <!-- Filters and Search -->
      <a-card class="filters-card" title="Filters">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-input v-model:value="searchText" placeholder="Search items..." allow-clear>
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-select v-model:value="selectedStockStatus" placeholder="Stock Status" allow-clear style="width: 100%">
              <a-select-option value="in_stock">In Stock</a-select-option>
              <a-select-option value="low_stock">Low Stock</a-select-option>
              <a-select-option value="out_of_stock">Out of Stock</a-select-option>
            </a-select>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-select v-model:value="selectedColor" placeholder="Color" allow-clear style="width: 100%">
              <a-select-option v-for="color in uniqueColors" :key="color" :value="color">
                {{ color }}
              </a-select-option>
            </a-select>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-select v-model:value="selectedSize" placeholder="Size" allow-clear style="width: 100%">
              <a-select-option v-for="size in uniqueSizes" :key="size" :value="size">
                {{ size }}
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </a-card>

      <!-- Data Table -->
      <a-card class="table-card" title="Inventory Details">
        <a-table :data-source="filteredData" :columns="tableColumns" :pagination="paginationConfig" :loading="pending"
          :scroll="{ x: 1200 }" row-key="variant_id">
          <template #bodyCell="{ column, record }">
            <!-- Stock Status -->
            <template v-if="column.key === 'stock_status'">
              <a-tag :color="getStatusColor(record.stock_status)">
                {{ formatStockStatus(record.stock_status) }}
              </a-tag>
            </template>

            <!-- Current Stock -->
            <template v-else-if="column.key === 'current_stock'">
              <span :class="{ 'low-stock': record.is_low_stock }">
                {{ record.current_stock }}
              </span>
            </template>

            <!-- Price -->
            <template v-else-if="column.key === 'current_price'">
              ${{ parseFloat(record.current_price).toFixed(2) }}
            </template>

            <!-- Final Price -->
            <template v-else-if="column.key === 'final_price'">
              ${{ parseFloat(record.final_price).toFixed(2) }}
            </template>

            <!-- Color -->
            <template v-else-if="column.key === 'color'">
              <a-tag :color="getColorTag(record.color)">
                {{ record.color }}
              </a-tag>
            </template>

            <!-- Size -->
            <template v-else-if="column.key === 'size'">
              <a-tag>{{ record.size }}</a-tag>
            </template>

            <!-- Actions -->
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button size="small" type="link">
                  <template #icon>
                    <EyeOutlined />
                  </template>
                  View
                </a-button>
                <a-button size="small" type="link">
                  <template #icon>
                    <EditOutlined />
                  </template>
                  Edit
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ReloadOutlined,
  AppstoreOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  DollarCircleOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons-vue'

// Define types
interface InventoryItem {
  variant_id: string
  item_name: string
  color: string
  size: string
  current_stock: number
  total_sold: string | number
  current_price: string
  final_price: string
  is_low_stock: boolean
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

interface InventoryResponse {
  success: boolean
  data: InventoryItem[]
  summary: {
    total_variants: number
    low_stock_items: number
    out_of_stock_items: number
    total_inventory_value: number
  }
  meta: {
    period: {
      start_date: string | null
      end_date: string | null
    }
    low_stock_threshold: number
  }
}

// Page meta (remove if not needed or adjust according to your Nuxt config)
definePageMeta({
  layouts: 'default',
})

// Reactive data
const searchText = ref('')
const selectedStockStatus = ref<string>()
const selectedColor = ref<string>()
const selectedSize = ref<string>()

// Fetch data using $fetch with proper error handling
const data = ref<InventoryResponse | null>(null)
const pending = ref(true)
const error = ref<Error | null>(null)
const items = ref<InventoryItem[]>([])

const fetchData = async () => {
  try {
    pending.value = true
    error.value = null

    const response = await useFetchDataApi<InventoryResponse>('/sales-reports/inventory-sales')
    if (response.data.value) {
      // Update the main data ref
      data.value = response.data.value

      // Also update items if you're using it elsewhere
      if (response.data.value.data && Array.isArray(response.data.value.data)) {
        items.value = response.data.value.data
      }
    }
  } catch (err: any) {
    console.error('❌ Brands Fetch Error:', err)
    message.error('Failed to fetch brands')
  } finally {
    pending.value = false
  }
}


const refresh = () => {
  fetchData()
}

// Initial data fetch
onMounted(() => {
  fetchData()
})

// Computed properties
const uniqueColors = computed(() => {
  if (!data.value?.data) return []
  return [...new Set(data.value.data.map(item => item.color))].sort()
})

const uniqueSizes = computed(() => {
  if (!data.value?.data) return []
  return [...new Set(data.value.data.map(item => item.size))].sort()
})

const filteredData = computed(() => {
  if (!data.value?.data) return []

  let filtered = data.value.data

  // Apply search filter
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.item_name.toLowerCase().includes(search) ||
      item.color.toLowerCase().includes(search) ||
      item.size.toLowerCase().includes(search)
    )
  }

  // Apply stock status filter
  if (selectedStockStatus.value) {
    filtered = filtered.filter(item => item.stock_status === selectedStockStatus.value)
  }

  // Apply color filter
  if (selectedColor.value) {
    filtered = filtered.filter(item => item.color === selectedColor.value)
  }

  // Apply size filter
  if (selectedSize.value) {
    filtered = filtered.filter(item => item.size === selectedSize.value)
  }

  return filtered
})

import type { TableColumnType } from 'ant-design-vue'

// Table configuration
const tableColumns: TableColumnType<InventoryItem>[] = [
  {
    title: 'Item Name',
    dataIndex: 'item_name',
    key: 'item_name',
    sorter: (a: InventoryItem, b: InventoryItem) => a.item_name.localeCompare(b.item_name),
    width: 200,
    fixed: 'left' as const
  },
  {
    title: 'Color',
    dataIndex: 'color',
    key: 'color',
    width: 100
  },
  {
    title: 'Size',
    dataIndex: 'size',
    key: 'size',
    width: 80
  },
  {
    title: 'Stock',
    dataIndex: 'current_stock',
    key: 'current_stock',
    sorter: (a: InventoryItem, b: InventoryItem) => a.current_stock - b.current_stock,
    width: 100
  },
  {
    title: 'Sold',
    dataIndex: 'total_sold',
    key: 'total_sold',
    sorter: (a: InventoryItem, b: InventoryItem) => Number(a.total_sold) - Number(b.total_sold),
    width: 100
  },
  {
    title: 'Price',
    dataIndex: 'current_price',
    key: 'current_price',
    sorter: (a: InventoryItem, b: InventoryItem) => Number(a.current_price) - Number(b.current_price),
    width: 120
  },
  {
    title: 'Final Price',
    dataIndex: 'final_price',
    key: 'final_price',
    sorter: (a: InventoryItem, b: InventoryItem) => Number(a.final_price) - Number(b.final_price),
    width: 120
  },
  {
    title: 'Status',
    dataIndex: 'stock_status',
    key: 'stock_status',
    width: 120
  },
  {
    title: 'Actions',
    key: 'actions',
    fixed: 'right' as const,
    width: 120
  }
]

const paginationConfig = {
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} of ${total} items`,
  pageSizeOptions: ['10', '20', '50', '100']
}

// Methods
const refreshData = () => {
  refresh()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in_stock':
      return 'green'
    case 'low_stock':
      return 'orange'
    case 'out_of_stock':
      return 'red'
    default:
      return 'default'
  }
}

const formatStockStatus = (status: string) => {
  switch (status) {
    case 'in_stock':
      return 'In Stock'
    case 'low_stock':
      return 'Low Stock'
    case 'out_of_stock':
      return 'Out of Stock'
    default:
      return status
  }
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
    Brown: 'default',
    Beige: 'default'
  }
  return colorMap[color] || 'default'
}
</script>

<style scoped>
.admin-report-page {
  padding: 14px;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  margin-bottom: 14px;
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
  gap: 14px;
}


.table-card {
  flex: 1;
}

.low-stock {
  color: #faad14;
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-report-page {
    padding: 14px;
  }

  .page-header {
    margin-bottom: 14px;
  }

  .report-content {
    gap: 14px;
  }

  .summary-cards {
    margin-bottom: 14px;
  }

  .filters-card {
    margin-bottom: 14px;
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
</style>