<template>
  <div>
    <a-page-header title="Size Groups" subtitle="Manage product size groups">
      <template #extra>
        <div style="display: flex;">
          <!-- <a-button>
            <NuxtLink to="/products">
              <left-outlined /> Back to Products
            </NuxtLink>
          </a-button> -->
          <a-button type="primary" @click="showModal" style="margin-left: 0.5rem;">
            <plus-outlined /> Add Size Group
          </a-button>
        </div>
      </template>
    </a-page-header>

    <a-card>
      <a-table 
        :columns="columns" 
        :data-source="sizeGroups" 
        :loading="loading" 
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'created_at'">
            <span>{{ formatDate(record.created_at) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="space-x-2" style="display: flex;">
              <a-button type="primary" size="small" @click="editSizeGroup(record)">
                Edit
              </a-button>
              <a-popconfirm 
                title="Are you sure you want to delete this size group?" 
                ok-text="Yes"
                cancel-text="No" 
                @confirm="deleteSizeGroup(record.id)"
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

    <!-- Add/Edit Size Group Modal -->
    <a-modal 
      :title="modalMode === 'add' ? 'Add New Size Group' : 'Edit Size Group'" 
      v-model:open="modalVisible"
      :confirm-loading="confirmLoading" 
      @ok="handleSubmit" 
      @cancel="handleCancel"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item 
          label="Size Group Name" 
          name="name"
        >
          <a-input 
            v-model:value="formState.name" 
            placeholder="Enter size group name"
            @input="generateSlug"
          />
        </a-form-item>
        
        <a-form-item 
          label="Slug" 
          name="slug"
        >
          <a-input 
            v-model:value="formState.slug" 
            placeholder="Enter size group slug" 
          />
          <div class="text-gray-500 text-sm">
            Used in URLs. Will be auto-generated if left empty.
          </div>
        </a-form-item>
        
        <a-form-item 
          label="Description" 
          name="description"
        >
          <a-textarea 
            v-model:value="formState.description" 
            :rows="3"
            placeholder="Enter size group description" 
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// Types
interface SizeGroup {
  id: string
  name: string
  slug: string
  description: string
  created_at: string
  updated_at: string
}

interface SizeGroupResponse {
  status: number
  message: string
  data: SizeGroup[]
}

interface SizeGroupFormState {
  name: string
  slug: string
  description: string
}

interface ApiResponse {
  status?: number
  message: string
  data?: any
}

definePageMeta({
  layout: 'default',
})

// Reactive variables
const sizeGroups = ref<SizeGroup[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Modal state
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const confirmLoading = ref(false)
const editingSizeGroupId = ref<string | null>(null)

// Form state and reference
const formRef = ref<any>()
const formState = ref<SizeGroupFormState>({
  name: '',
  slug: '',
  description: ''
})

// Form validation rules
const formRules = {
  name: [
    { required: true, message: 'Please enter size group name' },
    { min: 2, message: 'Size group name must be at least 2 characters' }
  ],
  slug: [
    { required: true, message: 'Please enter size group slug' },
    { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }
  ],
  description: [
    { required: true, message: 'Please enter size group description' }
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
    title: 'Slug',
    dataIndex: 'slug',
    key: 'slug',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
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

// Fetch size groups
const fetchSizeGroups = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await useFetchDataApi<SizeGroupResponse>('/size-groups')
    if (data.value?.status === 200 && Array.isArray(data.value.data)) {
      sizeGroups.value = data.value.data
    } else {
      error.value = data.value?.message || 'No size groups returned'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch size groups'
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
    slug: '',
    description: ''
  }
  editingSizeGroupId.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Edit size group function
const editSizeGroup = (record: Record<string, any>): void => {
  const sizeGroup = record as SizeGroup
  modalMode.value = 'edit'
  modalVisible.value = true
  editingSizeGroupId.value = sizeGroup.id
  
  // Populate form with existing data
  formState.value = {
    name: sizeGroup.name,
    slug: sizeGroup.slug,
    description: sizeGroup.description || ''
  }
}

// Generate slug from name
const generateSlug = () => {
  if (formState.value.name && modalMode.value === 'add') {
    formState.value.slug = formState.value.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

// Handle form submission
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true
    
    if (modalMode.value === 'add') {
      await createSizeGroup()
    } else {
      await updateSizeGroup()
    }
    
    modalVisible.value = false
    resetForm()
    await fetchSizeGroups()
    
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    confirmLoading.value = false
  }
}

// Create size group function
const createSizeGroup = async () => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>('/size-groups', {
      method: 'POST',
      body: {
        name: formState.value.name,
        description: formState.value.description
      }
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Size group created successfully')
    }
  } catch (error: any) {
    console.error('❌ Create Error:', error)
    message.error(error.message || 'Failed to create size group')
    throw error
  }
}

// Update size group function
const updateSizeGroup = async () => {
  if (!editingSizeGroupId.value) return
  
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/size-groups/${editingSizeGroupId.value}`, {
      method: 'PUT',
      body: {
        name: formState.value.name,
        description: formState.value.description
      }
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Size group updated successfully')
    }
  } catch (error: any) {
    console.error('❌ Update Error:', error)
    message.error(error.message || 'Failed to update size group')
    throw error
  }
}

// Delete size group function
const deleteSizeGroup = async (sizeGroupId: string) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/size-groups/${sizeGroupId}`, {
      method: 'DELETE'
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Size group deleted successfully')
    }
    await fetchSizeGroups()
  } catch (error: any) {
    console.error('❌ Delete Error:', error)
    message.error(error.message || 'Failed to delete size group')
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
  await fetchSizeGroups()
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