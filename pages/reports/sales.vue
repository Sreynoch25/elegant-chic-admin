<template>
  <div class="sales-dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <a-page-header title="Recent Orders">
        <template #extra>
          <a-button type="primary" :loading="pending" @click="fetchDetailedItems">
            <template #icon>
              <ReloadOutlined />
            </template>
            Refresh
          </a-button>
        </template>
      </a-page-header>
    </div>

    <!-- Advanced Filters -->
    <a-card class="filters-card">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="6">
          <a-form-item label="Item Name">
            <a-input
              v-model:value="filters.itemName"
              placeholder="Search by item name"
              allow-clear
              @input="handleFilterChange"
            />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-form-item label="Color">
            <a-select
              v-model:value="filters.color"
              placeholder="Select color"
              allow-clear
              @change="handleFilterChange"
            >
              <a-select-option v-for="color in uniqueColors" :key="color" :value="color">
                <a-tag :color="getColorTag(color)" style="margin: 0;">{{ color }}</a-tag>
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="6">
          <a-form-item label="Size">
            <a-select
              v-model:value="filters.size"
              placeholder="Select size"
              allow-clear
              @change="handleFilterChange"
            >
              <a-select-option v-for="size in uniqueSizes" :key="size" :value="size">
                {{ size }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="Order Status">
            <a-select
              v-model:value="filters.status"
              placeholder="All orders"
              allow-clear
              @change="handleFilterChange"
            >
              <a-select-option value="recent">Recent (Last 7 days)</a-select-option>
              <a-select-option value="this_month">This Month</a-select-option>
              <a-select-option value="last_month">Last Month</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="Sort By">
            <a-select v-model:value="sortBy" @change="handleSortChange">
              <a-select-option value="placed_at">Date</a-select-option>
              <a-select-option value="order_number">Order Number</a-select-option>
              <a-select-option value="total">Price</a-select-option>
              <a-select-option value="quantity">Quantity</a-select-option>
              <a-select-option value="full_item_name">Item Name</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="24">
          <a-space>
            <a-button @click="clearFilters">Clear All Filters</a-button>
            <a-button type="primary" @click="applyFilters">Apply Filters</a-button>
            <a-tag v-if="filteredOrders.length !== items.length" color="blue">
              Showing {{ filteredOrders.length }} of {{ items.length }} orders
            </a-tag>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- Orders Table -->
    <a-card class="orders-card">
      <template #title>
        <span>Recent Orders</span>
        <a-badge
          :count="filteredOrders.length"
          :number-style="{ backgroundColor: '#52c41a' }"
          style="margin-left: 8px"
        />
      </template>
      <template #extra>
        <a-input-search
          v-model:value="searchText"
          placeholder="Search orders..."
          style="width: 250px"
          @search="onSearch"
        />
      </template>

      <a-table
        :columns="ordersColumns"
        :data-source="filteredOrders"
        :loading="pending"
        :pagination="paginationConfig"
        size="middle"
        :scroll="{ x: 800 }"
        row-key="order_number"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'order_number'">
            <a-button type="link" @click="viewOrderDetails(record)">
              {{ record.order_number }}
            </a-button>
          </template>
          <template v-else-if="column.key === 'item'">
            <div class="item-info">
              <div class="item-name">{{ record.full_item_name }}</div>
              <div class="item-details">
                <a-tag :color="getColorTag(record.color)">{{ record.color_name }}</a-tag>
                <a-tag>{{ record.size_name }}</a-tag>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'placed_at'">
            {{ formatDate(record.placed_at) }}
          </template>
          <template v-else-if="column.key === 'final_price'">
            <a-statistic
              :value="parseFloat(record.total)"
              :precision="2"
              prefix="$"
              :value-style="{ fontSize: '14px' }"
            />
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'

// TypeScript Interfaces
interface DetailedItem {
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

interface DetailedItemsFilters {
  start_date?: string | null
  end_date?: string | null
  item_name?: string | null
  size?: string | null
  color?: string | null
}

interface DetailedItemsMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  filters: DetailedItemsFilters
}

interface DetailedItemsResponse {
  success: boolean
  data: DetailedItem[]
  meta: DetailedItemsMeta
}

interface Filters {
  itemName: string
  color: string | undefined
  size: string | undefined
  status: string | undefined
  priceRange: [number, number]
}

definePageMeta({ layout: 'default' })

// Reactive State
const pending = ref(true)
const searchText = ref('')
const data = ref<DetailedItemsResponse | null>(null)
const items = ref<DetailedItem[]>([])
const sortBy = ref('placed_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Filter State
const filters = ref<Filters>({
  itemName: '',
  color: undefined,
  size: undefined,
  status: undefined,
  priceRange: [0, 1000]
})

// Computed Properties
const uniqueColors = computed(() => 
  [...new Set(items.value.map(item => item.color_name))].sort()
)

const uniqueSizes = computed(() => 
  [...new Set(items.value.map(item => item.size_name))].sort()
)

const priceBounds = computed(() => {
  if (items.value.length === 0) return { min: 0, max: 1000 }
  
  const prices = items.value.map(item => parseFloat(item.total))
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  }
})

const filteredOrders = computed(() => {
  let filtered = items.value.filter(item => {
    // Search filter
    if (searchText.value) {
      const searchLower = searchText.value.toLowerCase()
      if (!item.order_number.toLowerCase().includes(searchLower) &&
          !item.full_item_name.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Item name filter
    if (filters.value.itemName && 
        !item.full_item_name.toLowerCase().includes(filters.value.itemName.toLowerCase())) {
      return false
    }

    // Color filter
    if (filters.value.color && item.color_name !== filters.value.color) {
      return false
    }

    // Size filter
    if (filters.value.size && item.size_name !== filters.value.size) {
      return false
    }

    // Price range filter
    const price = parseFloat(item.total)
    if (price < filters.value.priceRange[0] || price > filters.value.priceRange[1]) {
      return false
    }

    // Status filter (date-based)
    if (filters.value.status) {
      const orderDate = new Date(item.placed_at)
      const now = new Date()
      
      switch (filters.value.status) {
        case 'recent':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return orderDate >= weekAgo
        case 'this_month':
          return orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear()
        case 'last_month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
          return orderDate.getMonth() === lastMonth.getMonth() && 
                 orderDate.getFullYear() === lastMonth.getFullYear()
        default:
          return true
      }
    }

    return true
  })

  // Sort results
  return filtered.sort((a, b) => {
    let aValue: any = a[sortBy.value as keyof DetailedItem]
    let bValue: any = b[sortBy.value as keyof DetailedItem]

    // Handle different data types
    if (sortBy.value === 'total' || sortBy.value === 'price') {
      aValue = parseFloat(String(aValue))
      bValue = parseFloat(String(bValue))
    } else if (sortBy.value === 'placed_at') {
      aValue = new Date(String(aValue)).getTime()
      bValue = new Date(String(bValue)).getTime()
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = String(bValue).toLowerCase()
    }

    const result = aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    return sortOrder.value === 'asc' ? result : -result
  })
})

const paginationConfig = computed(() => ({
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `${range[0]}-${range[1]} of ${total} items`,
}))

// Table Configuration
const ordersColumns = [
  { title: 'Order Number', key: 'order_number', width: 180 },
  { title: 'Item', key: 'item', width: 250 },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', align: 'center' as const, width: 80 },
  { title: 'Price', key: 'final_price', align: 'right' as const, width: 100 },
  { title: 'Date', key: 'placed_at', width: 150 },
]

// API Functions
const fetchDetailedItems = async (params: Record<string, any> = {}) => {
  try {
    pending.value = true
    const query = new URLSearchParams(params).toString()
    const response = await useFetchDataApi<DetailedItemsResponse>(
      `/sales-reports/detailed-items?${query}`
    )

    if (response.data.value) {
      data.value = response.data.value
      items.value = response.data.value.data || []
    }
  } catch (err: any) {
    console.error('❌ Detailed Items Fetch Error:', err)
    message.error('Failed to fetch detailed items')
  } finally {
    pending.value = false
  }
}

// Event Handlers
const handleFilterChange = () => {
  // Reactive updates handled automatically
}

const handleSortChange = () => {
  // Reactive updates handled automatically
}

const applyFilters = () => {
  const params: Record<string, any> = {}
  
  if (filters.value.itemName) params.item_name = filters.value.itemName
  if (filters.value.color) params.color = filters.value.color
  if (filters.value.size) params.size = filters.value.size
  
  fetchDetailedItems(params)
}

const clearFilters = () => {
  filters.value = {
    itemName: '',
    color: undefined,
    size: undefined,
    status: undefined,
    priceRange: [priceBounds.value.min, priceBounds.value.max]
  }
  searchText.value = ''
  sortBy.value = 'placed_at'
  sortOrder.value = 'desc'
}

const onSearch = (value: string) => {
  console.log('Search:', value)
}

const viewOrderDetails = (record: DetailedItem): void => {
  console.log('View Order:', record)
  message.info(`Viewing details for order: ${record.order_number}`)
}

// Utility Functions
const formatDate = (date: string): string => {
  return new Date(date).toLocaleString()
}

const getColorTag = (color: string): string => {
  const colorMap: Record<string, string> = {
    red: 'red',
    blue: 'blue',
    green: 'green',
    yellow: 'gold',
    purple: 'purple',
    orange: 'orange',
    pink: 'magenta',
    black: 'default',
    white: 'default',
    gray: 'default',
    grey: 'default'
  }
  return colorMap[color?.toLowerCase()] || 'default'
}

// Watchers
watch(priceBounds, (newBounds) => {
  filters.value.priceRange = [newBounds.min, newBounds.max]
}, { immediate: true })

// Lifecycle
onMounted(() => {
  fetchDetailedItems()
})
</script>

<style scoped>
.sales-dashboard {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  margin: -24px -24px 24px -24px;
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
}

.filters-card,
.orders-card {
  margin-bottom: 24px;
}

.filters-card .ant-form-item {
  margin-bottom: 16px;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.item-info .item-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.item-info .item-details {
  display: flex;
  gap: 4px;
}

.item-info .item-details .ant-tag {
  margin: 0;
  font-size: 12px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sales-dashboard {
    padding: 16px;
  }

  .page-header {
    margin: -16px -16px 16px -16px;
    padding: 0 16px;
  }

  .filters-card .ant-col {
    margin-bottom: 8px;
  }
}
</style>