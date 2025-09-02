<template>
  <div class="admin-customers-page">
    <!-- Page Header -->
    <div class="page-header">
      <a-page-header
        title="Customer Management"
        sub-title="Manage all customers in the system"
      >
        <template #extra>
          <a-button 
            type="primary" 
            @click="refreshData"
            :loading="loading"
          >
            <ReloadOutlined />
            Refresh
          </a-button>
        </template>
      </a-page-header>
    </div>

    <!-- Filters Section -->
    <a-card :bordered="false" class="filters-card">
      <a-row :gutter="16" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <a-input-search
            v-model:value="searchQuery"
            placeholder="Search customers..."
            allow-clear
            @search="handleSearch"
            @change="handleSearchChange"
            class="search-input"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input-search>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <a-select
            v-model:value="selectedDateFilter"
            placeholder="Filter by date"
            allow-clear
            style="width: 100%"
            @change="handleDateFilterChange"
          >
            <a-select-option value="today">Today</a-select-option>
            <a-select-option value="week">This Week</a-select-option>
            <a-select-option value="month">This Month</a-select-option>
            <a-select-option value="year">This Year</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <a-select
            v-model:value="selectedPhoneFilter"
            placeholder="Phone status"
            allow-clear
            style="width: 100%"
            @change="applyFilters"
          >
            <a-select-option value="has_phone">Has Phone</a-select-option>
            <a-select-option value="no_phone">No Phone</a-select-option>
          </a-select>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <a-space>
            <a-button @click="clearAllFilters" :disabled="!hasActiveFilters">
              <ClearOutlined />
              Clear Filters
            </a-button>
            <!-- <a-button @click="exportCustomers" :loading="exporting">
              <DownloadOutlined />
              Export
            </a-button> -->
          </a-space>
        </a-col>
      </a-row>
      
      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="active-filters">
        <a-space wrap>
          <span class="filter-label">Active filters:</span>
          <a-tag v-if="searchQuery" closable @close="clearSearchFilter" color="blue">
            Search: "{{ searchQuery }}"
          </a-tag>
          <a-tag v-if="selectedDateFilter" closable @close="clearDateFilter" color="green">
            Date: {{ getDateFilterLabel(selectedDateFilter) }}
          </a-tag>
          <a-tag v-if="selectedPhoneFilter" closable @close="clearPhoneFilter" color="orange">
            Phone: {{ getPhoneFilterLabel(selectedPhoneFilter) }}
          </a-tag>
        </a-space>
      </div>
    </a-card>

    <!-- Results Summary -->
    <div class="results-summary" v-if="filteredCustomers.length !== customers.length">
      <a-alert
        :message="`Showing ${filteredCustomers.length} of ${customers.length} customers`"
        type="info"
        show-icon
        closable
      />
    </div>

    <!-- Customers Table -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="filteredCustomers"
        :loading="loading"
        :pagination="paginationConfig"
        row-key="id"
        @change="handleTableChange"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar 
              :src="record.profile_image" 
              :size="40"
              style="background-color: #1890ff"
            >
              {{ getCustomerInitialsTyped(record) }}
            </a-avatar>
          </template>
          
          <template v-else-if="column.key === 'name'">
            <div>
              <div class="customer-name">
                <span v-html="highlightSearchTerm(record.full_name || `${record.first_name} ${record.last_name}`.trim())"></span>
              </div>
              <div class="customer-email">
                <span v-html="highlightSearchTerm(record.email)"></span>
              </div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'phone'">
            <span v-if="record.phone_number" v-html="highlightSearchTerm(record.phone_number)"></span>
            <a-tag v-else color="default">No Phone</a-tag>
          </template>
          
          <template v-else-if="column.key === 'created_at'">
            <span>{{ formatDate(record.created_at) }}</span>
          </template>
          
          <template v-else-if="column.key === 'updated_at'">
            <span>{{ formatDate(record.updated_at) }}</span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { ReloadOutlined, SearchOutlined, ClearOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType, FormInstance } from 'ant-design-vue'

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface CustomersData {
  customers: Customer[];
  pagination: Pagination;
}

export interface CustomersResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: CustomersData;
}

// Reactive variables
const customers = ref<Customer[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const exporting = ref(false)
const paginationData = ref<Pagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1
})

// Filter states
const searchQuery = ref('')
const selectedDateFilter = ref<string>('')
const selectedPhoneFilter = ref<string>('')

const fetchCustomer = async () => {
  loading.value = true
  error.value = null

  try {
    const { data } = await useFetchDataApi<CustomersResponse>('/customers')

    if (data.value?.success && Array.isArray(data.value.data.customers)) {
      customers.value = data.value.data.customers
      paginationData.value = data.value.data.pagination
    } else {
      error.value = data.value?.message || 'Failed to fetch customers'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch customers'
    message.error(error.value)
  } finally {
    loading.value = false
  }
}

// Filtering logic
const filteredCustomers = computed(() => {
  let filtered = [...customers.value]

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(customer => {
      const fullName = customer.full_name || `${customer.first_name} ${customer.last_name}`.trim()
      return (
        fullName.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.phone_number && customer.phone_number.toLowerCase().includes(query)) ||
        customer.first_name.toLowerCase().includes(query) ||
        customer.last_name.toLowerCase().includes(query)
      )
    })
  }

  // Date filter
  if (selectedDateFilter.value) {
    const now = new Date()
    const filterDate = getDateFilterRange(selectedDateFilter.value)
    
    filtered = filtered.filter(customer => {
      const customerDate = new Date(customer.created_at)
      return customerDate >= filterDate.start && customerDate <= filterDate.end
    })
  }

  // Phone filter
  if (selectedPhoneFilter.value) {
    filtered = filtered.filter(customer => {
      if (selectedPhoneFilter.value === 'has_phone') {
        return customer.phone_number && customer.phone_number.trim() !== ''
      } else if (selectedPhoneFilter.value === 'no_phone') {
        return !customer.phone_number || customer.phone_number.trim() === ''
      }
      return true
    })
  }

  return filtered
})

// Computed properties for filters
const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || selectedDateFilter.value || selectedPhoneFilter.value)
})

// Table columns
const columns: TableColumnsType = [
  {
    title: 'Avatar',
    key: 'avatar',
    width: 80,
    align: 'center'
  },
  {
    title: 'Customer Info',
    key: 'name',
    sorter: (a: Customer, b: Customer) => {
      const aName = a.full_name || `${a.first_name} ${a.last_name}`.trim()
      const bName = b.full_name || `${b.first_name} ${b.last_name}`.trim()
      return aName.localeCompare(bName)
    },
    width: 250
  },
  {
    title: 'Phone Number',
    key: 'phone',
    sorter: (a: Customer, b: Customer) => {
      const aPhone = a.phone_number || ''
      const bPhone = b.phone_number || ''
      return aPhone.localeCompare(bPhone)
    },
    width: 150
  },
  {
    title: 'Created Date',
    key: 'created_at',
    sorter: (a: Customer, b: Customer) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    },
    width: 130
  },
  {
    title: 'Updated Date',
    key: 'updated_at',
    sorter: (a: Customer, b: Customer) => {
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    },
    width: 130
  },
]

// Pagination - updated to work with filtered data
const paginationConfig = computed(() => ({
  current: paginationData.value.current_page,
  pageSize: paginationData.value.per_page,
  total: filteredCustomers.value.length, // Use filtered count
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => 
    `${range[0]}-${range[1]} of ${total} customers`
}))

// Filter methods
const handleSearch = (value: string) => {
  searchQuery.value = value
}

const handleSearchChange = (e: any) => {
  searchQuery.value = e.target.value
}

const handleDateFilterChange = (value: string) => {
  selectedDateFilter.value = value
}

const applyFilters = () => {
  // Filters are automatically applied through computed property
  message.success('Filters applied successfully')
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedDateFilter.value = ''
  selectedPhoneFilter.value = ''
  message.success('All filters cleared')
}

const clearSearchFilter = () => {
  searchQuery.value = ''
}

const clearDateFilter = () => {
  selectedDateFilter.value = ''
}

const clearPhoneFilter = () => {
  selectedPhoneFilter.value = ''
}

// Utility methods
const getDateFilterRange = (filter: string) => {
  const now = new Date()
  const start = new Date()
  
  switch (filter) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(now.getDate() - 7)
      break
    case 'month':
      start.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      start.setMonth(now.getMonth() - 3)
      break
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      break
    default:
      start.setTime(0) // Beginning of time
  }
  
  return { start, end: now }
}

const getDateFilterLabel = (filter: string): string => {
  const labels: Record<string, string> = {
    'today': 'Today',
    'week': 'This Week',
    'month': 'This Month',
    'year': 'This Year'
  }
  return labels[filter] || filter
}

const getPhoneFilterLabel = (filter: string): string => {
  const labels: Record<string, string> = {
    'has_phone': 'Has Phone',
    'no_phone': 'No Phone'
  }
  return labels[filter] || filter
}

const highlightSearchTerm = (text: string): string => {
  if (!searchQuery.value.trim() || !text) return text
  
  const query = searchQuery.value.trim()
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark style="background-color: #fff2b8; padding: 0 2px;">$1</mark>')
}

const exportCustomers = async () => {
  exporting.value = true
  try {
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create CSV content
    const csvContent = generateCSV(filteredCustomers.value)
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    
    message.success('Customers exported successfully')
  } catch (err) {
    message.error('Failed to export customers')
  } finally {
    exporting.value = false
  }
}

const generateCSV = (data: Customer[]): string => {
  const headers = ['ID', 'First Name', 'Last Name', 'Full Name', 'Email', 'Phone Number', 'Created At', 'Updated At']
  const csvRows = [headers.join(',')]
  
  data.forEach(customer => {
    const row = [
      customer.id,
      customer.first_name || '',
      customer.last_name || '',
      customer.full_name || '',
      customer.email,
      customer.phone_number || '',
      customer.created_at,
      customer.updated_at
    ].map(field => `"${field}"`) // Wrap in quotes to handle commas
    
    csvRows.push(row.join(','))
  })
  
  return csvRows.join('\n')
}

// Existing methods
const refreshData = async () => {
  await fetchCustomer()
}

const handleTableChange = (pagination: any, filters: any, sorter: any) => {
  console.log('Table changed:', { pagination, filters, sorter })
}

const getCustomerInitials = (customer: Customer) => {
  if (customer.full_name) {
    return customer.full_name.charAt(0).toUpperCase()
  }
  const firstInitial = customer.first_name?.charAt(0)?.toUpperCase() || ''
  const lastInitial = customer.last_name?.charAt(0)?.toUpperCase() || ''
  return firstInitial + lastInitial || '?'
}

const getCustomerInitialsTyped = (record: Record<string, any>) => {
  return getCustomerInitials(record as Customer)
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  await fetchCustomer()
})
</script>

<style scoped>
.admin-customers-page {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filters-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.search-input {
  width: 100%;
}

.active-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.filter-label {
  font-weight: 600;
  color: #595959;
}

.results-summary {
  margin-bottom: 16px;
}

.customer-name {
  font-weight: 600;
  color: #262626;
  margin-bottom: 2px;
}

.customer-email {
  font-size: 12px;
  color: #8c8c8c;
}

.customer-details {
  margin-top: 16px;
}

.menu-danger {
  color: #ff4d4f !important;
}

.menu-danger:hover {
  background-color: #fff2f0 !important;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-card) {
  border-radius: 8px;
}

:deep(.ant-modal-header) {
  border-radius: 8px 8px 0 0;
}

:deep(.ant-page-header) {
  padding: 16px 24px;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 600;
}

:deep(mark) {
  background-color: #fff2b8 !important;
  padding: 0 2px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .admin-customers-page {
    padding: 16px;
  }
  
  .filters-card .ant-col {
    margin-bottom: 8px;
  }
}
</style>