<template>
  <div>
    <a-page-header title="Discounts" subtitle="Manage product discounts">
      <template #extra>
        <div style="display: flex;">
          <a-button>
            <NuxtLink to="/products">
              <left-outlined /> Back to Products
            </NuxtLink>
          </a-button>
          <a-button type="primary" @click="showModal" style="margin-left: 0.5rem;">
            <plus-outlined /> Add Discount
          </a-button>
        </div>
      </template>
    </a-page-header>

    <a-card>
      <a-table 
        :columns="columns" 
        :data-source="discounts" 
        :loading="loading" 
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="record.type === 'percent' ? 'blue' : 'green'">
              {{ record.type === 'percent' ? 'Percentage' : 'Fixed Amount' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'value'">
            <span>
              {{ record.type === 'percent' ? record.value + '%' : '$' + record.value }}
            </span>
          </template>
          <template v-if="column.key === 'is_active'">
            <a-tag :color="record.is_active ? 'green' : 'red'">
              {{ record.is_active ? 'Active' : 'Inactive' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'starts_at'">
            <span>{{ formatDate(record.starts_at) }}</span>
          </template>
          <template v-if="column.key === 'expires_at'">
            <span>{{ formatDate(record.expires_at) }}</span>
          </template>
          <template v-if="column.key === 'created_at'">
            <span>{{ formatDate(record.created_at) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="space-x-2" style="display: flex;">
              <a-button type="primary" size="small" @click="editDiscount(record)">
                Edit
              </a-button>
              <a-popconfirm 
                title="Are you sure you want to delete this discount?" 
                ok-text="Yes"
                cancel-text="No" 
                @confirm="deleteDiscount(record.id)"
              >
                <a-button size="small" style="margin-left: 0.5rem;">
                  Delete
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Discount Modal -->
    <a-modal 
      :title="modalMode === 'add' ? 'Add New Discount' : 'Edit Discount'" 
      v-model:open="modalVisible"
      :confirm-loading="confirmLoading" 
      @ok="handleSubmit" 
      @cancel="handleCancel"
      width="600px"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item 
          label="Discount Name" 
          name="name"
        >
          <a-input 
            v-model:value="formState.name" 
            placeholder="Enter discount name"
          />
        </a-form-item>
        
        <a-form-item 
          label="Description" 
          name="description"
        >
          <a-textarea 
            v-model:value="formState.description" 
            :rows="3"
            placeholder="Enter discount description" 
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item 
              label="Discount Type" 
              name="type"
            >
              <a-select 
                v-model:value="formState.type" 
                placeholder="Select discount type"
                @change="onTypeChange"
              >
                <a-select-option value="percent">Percentage</a-select-option>
                <a-select-option value="fixed">Fixed Amount</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item 
              label="Value" 
              name="value"
            >
              <a-input-number 
                v-model:value="formState.value" 
                :min="0"
                :max="formState.type === 'percent' ? 100 : undefined"
                :precision="2"
                :addon-before="formState.type === 'fixed' ? '$' : ''"
                :addon-after="formState.type === 'percent' ? '%' : ''"
                placeholder="Enter value"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item 
              label="Start Date" 
              name="starts_at"
            >
              <a-date-picker 
                v-model:value="formState.starts_at"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="Select start date"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item 
              label="End Date" 
              name="expires_at"
            >
              <a-date-picker 
                v-model:value="formState.expires_at"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="Select end date"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item 
          label="Status" 
          name="is_active"
        >
          <a-switch 
            v-model:checked="formState.is_active"
            checked-children="Active"
            un-checked-children="Inactive"
          />
          <div class="text-gray-500 text-sm">
            Active discounts can be applied to orders.
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs'

// Types
interface Discount {
  id: string
  name: string
  description: string
  type: 'percent' | 'fixed'
  value: string
  is_active: boolean
  starts_at: string
  expires_at: string
  created_at: string
  updated_at: string
  items?: any[]
}

interface DiscountResponse {
  status: number
  message: string
  data: Discount[]
}

interface DiscountFormState {
  name: string
  description: string
  type: 'percent' | 'fixed'
  value: number | undefined
  starts_at: Dayjs | undefined
  expires_at: Dayjs | undefined
  is_active: boolean
}

interface ApiResponse {
  status?: number
  message: string
  data?: any
  discount?: Discount
}

definePageMeta({
  layout: 'default',
})

// Reactive variables
const discounts = ref<Discount[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Modal state
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const confirmLoading = ref(false)
const editingDiscountId = ref<string | null>(null)

// Form state and reference
const formRef = ref<any>()
const formState = ref<DiscountFormState>({
  name: '',
  description: '',
  type: 'percent',
  value: undefined,
  starts_at: undefined,
  expires_at: undefined,
  is_active: true
})

// Form validation rules
const formRules = {
  name: [
    { required: true, message: 'Please enter discount name' },
    { min: 2, message: 'Discount name must be at least 2 characters' }
  ],
  description: [
    { required: true, message: 'Please enter discount description' }
  ],
  type: [
    { required: true, message: 'Please select discount type' }
  ],
  value: [
    { required: true, message: 'Please enter discount value' },
    { type: 'number' as const, min: 0, message: 'Value must be greater than 0' }
  ],
  starts_at: [
    { required: true, message: 'Please select start date' }
  ],
  expires_at: [
    { required: true, message: 'Please select end date' }
  ]
}

// Table columns
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Type',
    key: 'type',
    width: 120,
  },
  {
    title: 'Value',
    key: 'value',
    width: 100,
  },
  {
    title: 'Status',
    key: 'is_active',
    width: 100,
  },
  {
    title: 'Start Date',
    key: 'starts_at',
    width: 150,
  },
  {
    title: 'End Date',
    key: 'expires_at',
    width: 150,
  },
  {
    title: 'Created At',
    key: 'created_at',
    width: 150,
  },
  {
    title: 'Action',
    key: 'action',
    width: 150,
  },
]

// Fetch discounts
const fetchDiscounts = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await useFetchDataApi<DiscountResponse>('/discounts')
    if (data.value?.status === 200 && Array.isArray(data.value.data)) {
      discounts.value = data.value.data
    } else {
      error.value = data.value?.message || 'No discounts returned'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch discounts'
    message.error(error.value)
  } finally {
    loading.value = false
  }
}

// Modal functions
const showModal = () => {
  modalMode.value = 'add'
  modalVisible.value = true
  resetForm()
}

const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

const resetForm = () => {
  formState.value = {
    name: '',
    description: '',
    type: 'percent',
    value: undefined,
    starts_at: undefined,
    expires_at: undefined,
    is_active: true
  }
  editingDiscountId.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Edit discount function
const editDiscount = (record: Record<string, any>): void => {
  const discount = record as Discount
  modalMode.value = 'edit'
  modalVisible.value = true
  editingDiscountId.value = discount.id
  
  // Populate form with existing data
  formState.value = {
    name: discount.name,
    description: discount.description || '',
    type: discount.type,
    value: parseFloat(discount.value),
    starts_at: dayjs(discount.starts_at),
    expires_at: dayjs(discount.expires_at),
    is_active: discount.is_active
  }
}

// Handle discount type change
const onTypeChange = () => {
  // Reset value when type changes to ensure proper validation
  formState.value.value = undefined
}

// Handle form submission
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // Additional validation for date range
    if (formState.value.starts_at && formState.value.expires_at) {
      if (formState.value.starts_at.isAfter(formState.value.expires_at)) {
        message.error('Start date must be before end date')
        return
      }
    }
    
    // Additional validation for percentage
    if (formState.value.type === 'percent' && formState.value.value && formState.value.value > 100) {
      message.error('Percentage cannot exceed 100%')
      return
    }
    
    confirmLoading.value = true
    
    if (modalMode.value === 'add') {
      await createDiscount()
    } else {
      await updateDiscount()
    }
    
    modalVisible.value = false
    resetForm()
    await fetchDiscounts()
    
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    confirmLoading.value = false
  }
}

// Create discount function
const createDiscount = async () => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>('/discounts', {
      method: 'POST',
      body: {
        name: formState.value.name,
        description: formState.value.description,
        type: formState.value.type,
        value: formState.value.value,
        starts_at: formState.value.starts_at?.format('YYYY-MM-DD HH:mm:ss'),
        expires_at: formState.value.expires_at?.format('YYYY-MM-DD HH:mm:ss'),
        is_active: formState.value.is_active
      }
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Discount created successfully')
    }
  } catch (error: any) {
    console.error('❌ Create Error:', error)
    message.error(error.message || 'Failed to create discount')
    throw error
  }
}

// Update discount function
const updateDiscount = async () => {
  if (!editingDiscountId.value) return
  
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/discounts/${editingDiscountId.value}`, {
      method: 'PUT',
      body: {
        name: formState.value.name,
        description: formState.value.description,
        type: formState.value.type,
        value: formState.value.value,
        starts_at: formState.value.starts_at?.format('YYYY-MM-DD HH:mm:ss'),
        expires_at: formState.value.expires_at?.format('YYYY-MM-DD HH:mm:ss'),
        is_active: formState.value.is_active
      }
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Discount updated successfully')
    }
  } catch (error: any) {
    console.error('❌ Update Error:', error)
    message.error(error.message || 'Failed to update discount')
    throw error
  }
}

// Delete discount function
const deleteDiscount = async (discountId: string) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/discounts/${discountId}`, {
      method: 'DELETE'
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Discount deleted successfully')
    }
    await fetchDiscounts()
  } catch (error: any) {
    console.error('❌ Delete Error:', error)
    message.error(error.message || 'Failed to delete discount')
  }
}

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Initialize
onMounted(async () => {
  await fetchDiscounts()
})
</script>

<style scoped>
.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.text-gray-500 {
  color: #6b7280;
}

.text-sm {
  font-size: 0.875rem;
}
</style>