<template>
  <div>
    <a-page-header title="Seasons" subtitle="Manage product seasons">
      <template #extra>
        <div style="display: flex;">
          <a-button>
            <NuxtLink to="/products">
              <left-outlined /> Back to Products
            </NuxtLink>
          </a-button>
          <a-button type="primary" @click="showModal" style="margin-left: 0.5rem;">
            <plus-outlined /> Add Season
          </a-button>
        </div>
      </template>
    </a-page-header>

    <a-card>
      <a-table 
        :columns="columns" 
        :data-source="seasons" 
        :loading="loading" 
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
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
              <a-button type="primary" size="small" @click="editSeason(record)">
                Edit
              </a-button>
              <a-popconfirm 
                title="Are you sure you want to delete this season?" 
                ok-text="Yes"
                cancel-text="No" 
                @confirm="deleteSeason(record.id)"
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

    <!-- Add/Edit Season Modal -->
    <a-modal 
      :title="modalMode === 'add' ? 'Add New Season' : 'Edit Season'" 
      v-model:open="modalVisible"
      :confirm-loading="confirmLoading" 
      @ok="handleSubmit" 
      @cancel="handleCancel"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item 
          label="Season Name" 
          name="name"
        >
          <a-input 
            v-model:value="formState.name" 
            placeholder="Enter season name"
            @input="generateSlug"
          />
        </a-form-item>
        
        <a-form-item 
          label="Slug" 
          name="slug"
        >
          <a-input 
            v-model:value="formState.slug" 
            placeholder="Enter season slug" 
          />
          <div class="text-gray-500 text-sm">
            Used in URLs. Will be auto-generated if left empty.
          </div>
        </a-form-item>
        
        <a-form-item label="Description" name="description">
          <a-textarea 
            v-model:value="formState.description" 
            :rows="3"
            placeholder="Enter season description" 
          />
        </a-form-item>
        
        <a-form-item 
          label="Status" 
          name="is_active"
        >
          <a-switch 
            v-model:checked="formState.is_active"
            checked-children="Active"
            un-checked-children="Inactive"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import type {  Season, SeasonFormState, SeasonResponse, ApiResponse } from "~/types/season/season";

definePageMeta({
  layout: 'default',
})

// Reactive variables
const seasons = ref<Season[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Modal state
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const confirmLoading = ref(false)
const editingSeasonId = ref<string | null>(null)

// Form state and reference
const formRef = ref<any>()
const formState = ref<SeasonFormState>({
  name: '',
  slug: '',
  description: '',
  is_active: true
})

// Form validation rules
const formRules = {
  name: [
    { required: true, message: 'Please enter season name' },
    { min: 2, message: 'Season name must be at least 2 characters' }
  ],
  slug: [
    { required: true, message: 'Please enter season slug' },
    { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }
  ],
  description: [
    { required: true, message: 'Please enter season description' }
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

// Fetch seasons
const fetchSeasons = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await useFetchDataApi<SeasonResponse>('/seasons')
    if (data.value?.status === 200 && Array.isArray(data.value.data)) {
      seasons.value = data.value.data
    } else {
      error.value = data.value?.message || 'No seasons returned'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch seasons'
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
    description: '',
    is_active: true
  }
  editingSeasonId.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Edit season function
const editSeason = (record: Record<string, any>): void => {
  const season = record as Season
  modalMode.value = 'edit'
  modalVisible.value = true
  editingSeasonId.value = season.id
  
  // Populate form with existing data
  formState.value = {
    name: season.name,
    slug: season.slug,
    description: season.description || '',
    is_active: season.is_active
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
      await createSeason()
    } else {
      await updateSeason()
    }
    
    modalVisible.value = false
    resetForm()
    await fetchSeasons()
    
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    confirmLoading.value = false
  }
}

// Create season function
const createSeason = async () => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>('/seasons', {
      method: 'POST',
      body: {
        name: formState.value.name,
        slug: formState.value.slug,
        description: formState.value.description,
        is_active: formState.value.is_active
      }
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Season created successfully')
    }
  } catch (error: any) {
    console.error('❌ Create Error:', error)
    message.error(error.message || 'Failed to create season')
    throw error
  }
}

// Update season function
const updateSeason = async () => {
  if (!editingSeasonId.value) return
  
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/seasons/${editingSeasonId.value}`, {
      method: 'PUT',
      body: {
        name: formState.value.name,
        slug: formState.value.slug,
        description: formState.value.description,
        is_active: formState.value.is_active
      }
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Season updated successfully')
    }
  } catch (error: any) {
    console.error('❌ Update Error:', error)
    message.error(error.message || 'Failed to update season')
    throw error
  }
}

// Delete season function
const deleteSeason = async (seasonId: string) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/seasons/${seasonId}`, {
      method: 'DELETE'
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Season deleted successfully')
    }
    await fetchSeasons()
  } catch (error: any) {
    console.error('❌ Delete Error:', error)
    message.error(error.message || 'Failed to delete season')
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
  await fetchSeasons()
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