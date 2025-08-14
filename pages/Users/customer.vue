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

    <!-- Customers Table -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="customers"
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
              <div class="customer-name">{{ record.full_name || `${record.first_name} ${record.last_name}`.trim() }}</div>
              <div class="customer-email">{{ record.email }}</div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'phone'">
            <span>{{ record.phone_number || 'N/A' }}</span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
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
const paginationData = ref<Pagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1
})

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

// Table columns - updated to match actual data structure
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
    sorter: true,
    width: 250
  },
  {
    title: 'Phone Number',
    key: 'phone',
    width: 150
  },
  {
    title: 'Created Date',
    key: 'created_at',
    sorter: true,
    width: 130
  },
  {
    title: 'Updated Date',
    key: 'updated_at',
    sorter: true,
    width: 130
  },

]

// Pagination - using actual pagination data from API
const paginationConfig = computed(() => ({
  current: paginationData.value.current_page,
  pageSize: paginationData.value.per_page,
  total: paginationData.value.total,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => 
    `${range[0]}-${range[1]} of ${total} customers`
}))

// Methods
const refreshData = async () => {
  await fetchCustomer()
}

const handleTableChange = (pagination: any, filters: any, sorter: any) => {
  console.log('Table changed:', { pagination, filters, sorter })
  // You can implement pagination, filtering, and sorting logic here
  // For now, just log the changes
}

// Utility functions
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
</style>