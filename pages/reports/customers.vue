<template>
  <div class="sales-dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <a-page-header title="Top Selling Items">
        <template #extra>
          <a-button type="primary" :loading="pending" @click="fetchData">
            <template #icon>
              <ReloadOutlined />
            </template>
            Refresh
          </a-button>
        </template>
      </a-page-header>
    </div>

    <!-- Filters Section -->
    <a-card class="filters-card" >
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

      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="Sort By">
            <a-select
              v-model:value="sortBy"
              @change="handleSortChange"
            >
              <a-select-option value="total_quantity_sold">Quantity Sold</a-select-option>
              <a-select-option value="total_revenue">Revenue</a-select-option>
              <a-select-option value="average_price">Average Price</a-select-option>
              <a-select-option value="total_orders">Orders</a-select-option>
              <a-select-option value="full_item_name">Item Name</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="Order">
            <a-radio-group v-model:value="sortOrder" @change="handleSortChange">
              <a-radio-button value="desc">High to Low</a-radio-button>
              <a-radio-button value="asc">Low to High</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="24">
          <a-space>
            <a-button @click="clearFilters">Clear All Filters</a-button>
            <a-tag v-if="filteredItems.length !== items.length" color="blue">
              Showing {{ filteredItems.length }} of {{ items.length }} items
            </a-tag>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- Top Selling Items -->
    <a-card class="top-items-card" :loading="pending">
      <template #title>
        <span>Top Selling Items</span>
        <a-badge
          :count="filteredItems.length"
          :number-style="{ backgroundColor: '#52c41a' }"
          style="margin-left: 8px"
        />
      </template>
      
      <a-table
        :columns="topItemsColumns"
        :data-source="filteredItems"
        :pagination="tablePagination"
        size="middle"
        row-key="full_item_name"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'item'">
            <div class="item-info">
              <div class="item-name">{{ record.full_item_name }}</div>
              <div class="item-details">
                <a-tag :color="getColorTag(record.color)">{{ record.color }}</a-tag>
                <a-tag>{{ record.size }}</a-tag>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'revenue'">
            <a-statistic
              :value="parseFloat(record.total_revenue)"
              :precision="2"
              prefix="$"
              :value-style="{ fontSize: '14px' }"
            />
          </template>
          <template v-else-if="column.key === 'avg_price'">
            <a-statistic
              :value="parseFloat(record.average_price)"
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
import { ref, onMounted, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'

// Interfaces
export interface TopSellingItem {
  item_name: string
  size: string
  color: string
  full_item_name: string
  total_quantity_sold: number
  total_revenue: string
  average_price: string
  total_orders: number
}

export interface SalesReportMeta {
  limit: number
  period: {
    start_date: string
    end_date: string
  }
}

export interface TopSellingItemsResponse {
  success: boolean
  data: TopSellingItem[]
  meta: SalesReportMeta
}

definePageMeta({
  layout: 'default'
})

const data = ref<TopSellingItemsResponse | null>(null)
const pending = ref(true)
const error = ref<Error | null>(null)
const items = ref<TopSellingItem[]>([])

// Filter states
const filters = ref({
  itemName: '',
  color: undefined,
  size: undefined,
  minRevenue: undefined,
  quantityRange: [0, 1000] as [number, number]
})

const sortBy = ref('total_quantity_sold')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Computed properties for filter options
const uniqueColors = computed(() => {
  return [...new Set(items.value.map(item => item.color))].sort()
})

const uniqueSizes = computed(() => {
  return [...new Set(items.value.map(item => item.size))].sort()
})

const quantityBounds = computed(() => {
  if (items.value.length === 0) return { min: 0, max: 1000 }
  
  const quantities = items.value.map(item => item.total_quantity_sold)
  return {
    min: Math.min(...quantities),
    max: Math.max(...quantities)
  }
})

// Update quantity range when data changes
watch(quantityBounds, (newBounds) => {
  filters.value.quantityRange = [newBounds.min, newBounds.max]
}, { immediate: true })

// Filtered and sorted items
const filteredItems = computed(() => {
  let filtered = items.value.filter(item => {
    // Item name filter
    if (filters.value.itemName && 
        !item.full_item_name.toLowerCase().includes(filters.value.itemName.toLowerCase())) {
      return false
    }

    // Color filter
    if (filters.value.color && item.color !== filters.value.color) {
      return false
    }

    // Size filter
    if (filters.value.size && item.size !== filters.value.size) {
      return false
    }

    // Revenue filter
    if (filters.value.minRevenue && 
        parseFloat(item.total_revenue) < filters.value.minRevenue) {
      return false
    }

    // Quantity range filter
    const quantity = item.total_quantity_sold
    if (quantity < filters.value.quantityRange[0] || 
        quantity > filters.value.quantityRange[1]) {
      return false
    }

    return true
  })

  // Sort the filtered results
  filtered.sort((a, b) => {
    let aValue: any = a[sortBy.value as keyof TopSellingItem]
    let bValue: any = b[sortBy.value as keyof TopSellingItem]

    // Convert string numbers to actual numbers for comparison
    if (sortBy.value === 'total_revenue' || sortBy.value === 'average_price') {
      aValue = parseFloat(aValue as string)
      bValue = parseFloat(bValue as string)
    }

    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return filtered
})

// Table pagination
const tablePagination = ref({
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => 
    `${range[0]}-${range[1]} of ${total} items`
})

const fetchData = async () => {
  try {
    pending.value = true
    error.value = null

    const response = await useFetchDataApi<TopSellingItemsResponse>(
      '/sales-reports/top-selling-items?limit=50'
    )

    if (response.data.value) {
      data.value = response.data.value

      if (Array.isArray(response.data.value.data)) {
        items.value = response.data.value.data
      }
    }
  } catch (err: any) {
    console.error('❌ Top Selling Items Fetch Error:', err)
    message.error('Failed to fetch top selling items')
  } finally {
    pending.value = false
  }
}

// Filter handlers
const handleFilterChange = () => {
  // Filters are reactive, so filteredItems will update automatically
}

const handleSortChange = () => {
  // Sort is reactive, so filteredItems will update automatically
}

const clearFilters = () => {
  filters.value = {
    itemName: '',
    color: undefined,
    size: undefined,
    minRevenue: undefined,
    quantityRange: [quantityBounds.value.min, quantityBounds.value.max]
  }
  sortBy.value = 'total_quantity_sold'
  sortOrder.value = 'desc'
}

// Table configurations
const topItemsColumns = [
  {
    title: 'Item',
    key: 'item',
    width: 300,
  },
  {
    title: 'Quantity Sold',
    dataIndex: 'total_quantity_sold',
    key: 'quantity',
    align: 'center' as const,
  },
  {
    title: 'Revenue',
    key: 'revenue',
    align: 'right' as const,
  },
  {
    title: 'Avg Price',
    key: 'avg_price',
    align: 'right' as const,
  },
  {
    title: 'Orders',
    dataIndex: 'total_orders',
    key: 'orders',
    align: 'center' as const,
  },
]

// Utility: map color to AntD tag color
const getColorTag = (color: string) => {
  const colorMap: Record<string, string> = {
    'red': 'red',
    'blue': 'blue',
    'green': 'green',
    'yellow': 'gold',
    'purple': 'purple',
    'orange': 'orange',
    'pink': 'magenta',
    'black': 'default',
    'white': 'default',
    'gray': 'default',
    'grey': 'default'
  }
  return colorMap[color.toLowerCase()] || 'default'
}

onMounted(fetchData)
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

.filters-card {
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

.top-items-card {
  margin-bottom: 24px;
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