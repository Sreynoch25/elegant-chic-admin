<template>
  <div>
    <a-page-header title="Sizes" subtitle="Manage individual sizes">
      <template #extra>
        <div style="display: flex;">
          <a-button>
            <NuxtLink to="/products">
              <left-outlined /> Back to Products
            </NuxtLink>
          </a-button>
          <a-button type="primary" @click="showModal" style="margin-left: 0.5rem;">
            <plus-outlined /> Add Size
          </a-button>
        </div>
      </template>
    </a-page-header>

    <a-card>
      <a-table 
        :columns="columns" 
        :data-source="sizes" 
        :loading="loading" 
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'created_at'">
            <span>{{ formatDate(record.created_at) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="space-x-2" style="display: flex;">
              <a-button type="primary" size="small" @click="editSize(record)">
                Edit
              </a-button>
              <a-popconfirm 
                title="Are you sure you want to delete this size?" 
                ok-text="Yes"
                cancel-text="No" 
                @confirm="deleteSize(record.id)"
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

    <!-- Add/Edit Size Modal -->
    <a-modal 
      :title="modalMode === 'add' ? 'Add New Size' : 'Edit Size'" 
      v-model:open="modalVisible"
      :confirm-loading="confirmLoading" 
      @ok="handleSubmit" 
      @cancel="handleCancel"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item 
          label="Size Name" 
          name="name"
        >
          <a-input 
            v-model:value="formState.name" 
            placeholder="Enter size name"
          />
        </a-form-item>
        
        <a-form-item 
          label="Description" 
          name="description"
        >
          <a-textarea 
            v-model:value="formState.description" 
            :rows="3"
            placeholder="Enter size description" 
          />
        </a-form-item>
        
        <a-form-item 
          label="Size Group ID" 
          name="size_group_id"
        >
          <a-input 
            v-model:value="formState.size_group_id" 
            placeholder="Enter size group ID"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import type {Size, SizeFormState, SizeResponse, ApiResponse} from "~/types/sizes/size"

definePageMeta({
  layout: 'default',
})

// Reactive variables
const sizes = ref<Size[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Modal state
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const confirmLoading = ref(false)
const editingSizeId = ref<string | null>(null)

// Form state and reference
const formRef = ref<any>()
const formState = ref<SizeFormState>({
  name: '',
  description: '',
  size_group_id: ''
})

// Form validation rules
const formRules = {
  name: [
    { required: true, message: 'Please enter size name' },
    { min: 1, message: 'Size name must be at least 1 character' }
  ],
  description: [
    { required: true, message: 'Please enter size description' }
  ],
  size_group_id: [
    { required: true, message: 'Please enter size group ID' }
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
    title: 'Size Group ID',
    dataIndex: 'size_group_id',
    key: 'size_group_id',
  },
  {
    title: 'Order',
    dataIndex: 'order',
    key: 'order',
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

// Fetch sizes
const fetchSizes = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await useFetchDataApi<SizeResponse>('/size')
    if (data.value?.status === 200 && Array.isArray(data.value.data)) {
      sizes.value = data.value.data
    } else {
      error.value = data.value?.message || 'No sizes returned'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch sizes'
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
    size_group_id: ''
  }
  editingSizeId.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Edit size function
const editSize = (record: Record<string, any>): void => {
  const size = record as Size
  modalMode.value = 'edit'
  modalVisible.value = true
  editingSizeId.value = size.id
  
  // Populate form with existing data
  formState.value = {
    name: size.name,
    description: size.description || '',
    size_group_id: size.size_group_id
  }
}

// Handle form submission
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true
    
    if (modalMode.value === 'add') {
      await createSize()
    } else {
      await updateSize()
    }
    
    modalVisible.value = false
    resetForm()
    await fetchSizes()
    
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    confirmLoading.value = false
  }
}

// Create size function
const createSize = async () => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>('/size', {
      method: 'POST',
      body: {
        name: formState.value.name,
        description: formState.value.description,
        size_group_id: formState.value.size_group_id
      }
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Size created successfully')
    }
  } catch (error: any) {
    console.error('❌ Create Error:', error)
    message.error(error.message || 'Failed to create size')
    throw error
  }
}

// Update size function
const updateSize = async () => {
  if (!editingSizeId.value) return
  
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/size/${editingSizeId.value}`, {
      method: 'PUT',
      body: {
        name: formState.value.name,
        description: formState.value.description,
        size_group_id: formState.value.size_group_id
      }
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Size updated successfully')
    }
  } catch (error: any) {
    console.error('❌ Update Error:', error)
    message.error(error.message || 'Failed to update size')
    throw error
  }
}

// Delete size function
const deleteSize = async (sizeId: string) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/size/${sizeId}`, {
      method: 'DELETE'
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Size deleted successfully')
    }
    await fetchSizes()
  } catch (error: any) {
    console.error('❌ Delete Error:', error)
    message.error(error.message || 'Failed to delete size')
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
  await fetchSizes()
})
</script>

<style scoped>
.space-x-2 > * + * {
  margin-left: 0.5rem;
}
</style>