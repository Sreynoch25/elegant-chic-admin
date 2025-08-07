<template>
  <div>
    <a-page-header title="Deliveries" subtitle="Manage delivery methods">
      <template #extra>
        <div style="display: flex;">
          <a-button type="primary" @click="showModal" style="margin-left: 0.5rem;">
            <plus-outlined /> Add Delivery
          </a-button>
        </div>
      </template>
    </a-page-header>

    <a-card>
      <a-table :columns="columns" :data-source="deliveries" :loading="loading" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'logo'">
            <a-image :src="record.logo" :width="50" :height="50" style="object-fit: cover; border-radius: 4px;"
              :preview="true" />
          </template>
          <template v-if="column.key === 'delivery_fee'">
            <span>${{ record.delivery_fee }}</span>
          </template>
          <template v-if="column.key === 'is_active'">
            <a-tag :color="record.is_active ? 'green' : 'red'">
              {{ record.is_active ? 'Active' : 'Inactive' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'created_at'">
            <span>{{ formatDate(record.created_at) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="space-x-2" style="display: flex;">
              <a-button type="primary" size="small" @click="editDelivery(record)">
                Edit
              </a-button>
              <a-popconfirm title="Are you sure you want to delete this delivery method?" ok-text="Yes" cancel-text="No"
                @confirm="deleteDelivery(record.id)">
                <a-button size="small" style="margin-left: 0.5rem;">
                  Delete
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Delivery Modal -->
    <a-modal :title="modalMode === 'add' ? 'Add New Delivery Method' : 'Edit Delivery Method'"
      v-model:open="modalVisible" :confirm-loading="confirmLoading" @ok="handleSubmit" @cancel="handleCancel"
      width="600px">
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item label="Delivery Method Name" name="name">
          <a-input v-model:value="formState.name" placeholder="Enter delivery method name" />
        </a-form-item>

        <a-form-item label="Description" name="description">
          <a-textarea v-model:value="formState.description" :rows="3" placeholder="Enter delivery method description" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Delivery Fee ($)" name="delivery_fee">
              <a-input-number v-model:value="formState.delivery_fee" :min="0" :precision="2"
                placeholder="Enter delivery fee" style="width: 100%" :addon-before="'$'" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Status" name="is_active">
              <a-switch v-model:checked="formState.is_active" checked-children="Active"
                un-checked-children="Inactive" />
              <div class="text-gray-500 text-sm" style="margin-top: 8px;">
                Active delivery methods are available for customers.
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Logo Upload" name="logo">
          <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" :max-count="1"
            accept="image/jpeg,image/png,image/jpg,image/webp" list-type="picture">
            <a-button>
              <upload-outlined />
              Upload Logo
            </a-button>
          </a-upload>
          <div class="text-gray-500 text-sm" style="margin-top: 8px;">
            Upload a logo image (JPG, PNG, WEBP, max 5MB)
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { UploadOutlined } from '@ant-design/icons-vue';
import type { UploadFile } from 'ant-design-vue';

// Types
interface Delivery {
  id: string
  name: string
  logo: string
  delivery_fee: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface DeliveryResponse {
  message: string
  data: Delivery[]
}

interface DeliveryFormState {
  name: string
  description: string
  delivery_fee: number | undefined
  logo: File | string
  is_active: boolean
}

interface ApiResponse {
  message: string
  data?: any
  delivery?: Delivery
}

definePageMeta({
  layout: 'default',
})

// Reactive variables
const deliveries = ref<Delivery[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const fileList = ref<UploadFile[]>([])

// Modal state
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const confirmLoading = ref(false)
const editingDeliveryId = ref<string | null>(null)

// Form state and reference
const formRef = ref<any>()
const formState = ref<DeliveryFormState>({
  name: '',
  description: '',
  delivery_fee: undefined,
  logo: '',
  is_active: true
})

// Form validation rules
const formRules = {
  name: [
    { required: true, message: 'Please enter delivery method name' },
    { min: 2, message: 'Delivery method name must be at least 2 characters' }
  ],
  description: [
    { required: true, message: 'Please enter description' }
  ],
  delivery_fee: [
    { required: true, message: 'Please enter delivery fee' },
    { type: 'number' as const, min: 0, message: 'Delivery fee must be greater than or equal to 0' }
  ],
  logo: [
    {
      validator: async (_: any, value: File | string) => {
        if (modalMode.value === 'add' && !value) {
          return Promise.reject('Please upload a logo image');
        }
        if (value instanceof File) {
          const isImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(value.type);
          if (!isImage) {
            return Promise.reject('The logo must be a JPEG, PNG, JPG, or WEBP file');
          }
        }
        return Promise.resolve();
      },
    }
  ]
}

// Table columns
const columns = [
  {
    title: 'Logo',
    key: 'logo',
    width: 80,
  },
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
    title: 'Delivery Fee',
    key: 'delivery_fee',
    width: 120,
  },
  {
    title: 'Status',
    key: 'is_active',
    width: 100,
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

// File upload handling
const beforeUpload = (file: File) => {
  const isImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type);
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    message.error('You can only upload JPEG, PNG, JPG, or WEBP files!');
    return false;
  }
  if (!isLt5M) {
    message.error('Image must be smaller than 5MB!');
    return false;
  }

  // Store the file in formState
  formState.value.logo = file;
  return false; // Prevent auto-upload
}

// Fetch deliveries
const fetchDeliveries = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await useFetchDataApi<DeliveryResponse>('/deliveries')
    if (data.value?.data && Array.isArray(data.value.data)) {
      deliveries.value = data.value.data
    } else {
      error.value = data.value?.message || 'No deliveries returned'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch deliveries'
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
    delivery_fee: undefined,
    logo: '',
    is_active: true
  }
  fileList.value = []
  editingDeliveryId.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Edit delivery function
const editDelivery = (record: Record<string, any>): void => {
  const delivery = record as Delivery
  modalMode.value = 'edit'
  modalVisible.value = true
  editingDeliveryId.value = delivery.id

  // Populate form with existing data
  formState.value = {
    name: delivery.name,
    description: delivery.description || '',
    delivery_fee: parseFloat(delivery.delivery_fee),
    logo: delivery.logo || '',
    is_active: delivery.is_active
  }

  // Update fileList for edit mode
  if (delivery.logo) {
    fileList.value = [{
      uid: '-1',
      name: 'logo.png',
      status: 'done',
      url: delivery.logo
    }]
  } else {
    fileList.value = []
  }
}

// Handle form submission
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true

    if (modalMode.value === 'add') {
      await createDelivery()
    } else {
      await updateDelivery()
    }

    modalVisible.value = false
    resetForm()
    await fetchDeliveries()

  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    confirmLoading.value = false
  }
}

// Create delivery function
const createDelivery = async () => {
  try {
    const formData = new FormData()
    formData.append('name', formState.value.name)
    formData.append('description', formState.value.description)
    formData.append('delivery_fee', String(formState.value.delivery_fee))
    formData.append('is_active', formState.value.is_active ? '1' : '0')
    if (formState.value.logo instanceof File) {
      formData.append('logo', formState.value.logo)
    }

    const { data } = await useFetchDataApi<ApiResponse>('/deliveries', {
      method: 'POST',
      body: formData,
    })

    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Delivery method created successfully')
    }
  } catch (error: any) {
    console.error('❌ Create Error:', error)
    message.error(error.message || 'Failed to create delivery method')
    throw error
  }
}

// Update delivery function
const updateDelivery = async () => {
  if (!editingDeliveryId.value) return

  try {
    const formData = new FormData()
    formData.append('_method', 'PUT')
    formData.append('name', formState.value.name)
    formData.append('description', formState.value.description)
    formData.append('delivery_fee', String(formState.value.delivery_fee))
    formData.append('is_active', formState.value.is_active ? '1' : '0')
    if (formState.value.logo instanceof File) {
      formData.append('logo', formState.value.logo)
    }

    const { data } = await useFetchDataApi<ApiResponse>(`/deliveries/${editingDeliveryId.value}`, {
      method: 'POST',
      body: formData,
    })

    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Delivery method updated successfully')
    }
  } catch (error: any) {
    console.error('❌ Update Error:', error)
    message.error(error.message || 'Failed to update delivery method')
    throw error
  }
}

// Delete delivery function
const deleteDelivery = async (deliveryId: string) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/deliveries/${deliveryId}`, {
      method: 'DELETE'
    })

    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Delivery method deleted successfully')
    }
    await fetchDeliveries()
  } catch (error: any) {
    console.error('❌ Delete Error:', error)
    message.error(error.message || 'Failed to delete delivery method')
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
  await fetchDeliveries()
})
</script>

<style scoped>
.space-x-2>*+* {
  margin-left: 0.5rem;
}

.text-gray-500 {
  color: #6b7280;
}

.text-sm {
  font-size: 0.875rem;
}
</style>
