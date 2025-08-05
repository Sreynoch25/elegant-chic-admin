<template>
  <div>
    <a-page-header title="Colors Management" subtitle="Manage product colors and their hex codes">
      <template #extra>
        <div style="display: flex;">
          <a-button>
            <NuxtLink to="/products">
              <left-outlined /> Back to Products
            </NuxtLink>
          </a-button>
          <a-button type="primary" @click="showModal" style="margin-left: 0.5rem;">
            <plus-outlined /> Add Color
          </a-button>
        </div>
      </template>
    </a-page-header>

    <a-card>
      <a-table 
        :columns="columns" 
        :data-source="colors" 
        :loading="loading" 
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'color_preview'">
            <div class="flex items-center gap-3">
              <div 
                class="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                :style="{ backgroundColor: record.hex_code }"
              ></div>
              <div>
                <div class="font-medium text-gray-900">{{ record.name }}</div>
                <div class="text-sm text-gray-500">{{ record.hex_code }}</div>
              </div>
            </div>
          </template>
          <template v-if="column.key === 'description'">
            <span class="text-gray-600">{{ record.description || 'No description' }}</span>
          </template>
          <template v-if="column.key === 'created_at'">
            <span>{{ formatDate(record.created_at) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="space-x-2" style="display: flex;">
              <a-button type="primary" size="small" @click="editColor(record)">
                Edit
              </a-button>
              <a-popconfirm 
                title="Are you sure you want to delete this color?" 
                ok-text="Yes"
                cancel-text="No" 
                @confirm="deleteColor(record.id)"
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

    <!-- Add/Edit Color Modal -->
    <a-modal 
      :title="modalMode === 'add' ? 'Add New Color' : 'Edit Color'" 
      v-model:open="modalVisible"
      :confirm-loading="confirmLoading" 
      @ok="handleSubmit" 
      @cancel="handleCancel"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item 
          label="Color Name" 
          name="name"
        >
          <a-input 
            v-model:value="formState.name" 
            placeholder="Enter color name"
          />
        </a-form-item>
        
        <a-form-item 
          label="Hex Code" 
          name="hex_code"
        >
          <div class="flex gap-2">
            <a-input 
              v-model:value="formState.hex_code"
              placeholder="#FFFFFF"
              class="flex-1"
              @input="validateHexCode"
            />
            <input
              type="color"
              v-model="formState.hex_code"
              class="w-12 h-8 rounded border border-gray-300 cursor-pointer"
            />
          </div>
          <div class="text-gray-500 text-sm">
            Enter a valid hex color code (e.g., #FFFFFF or #FFF)
          </div>
        </a-form-item>
        
        <a-form-item label="Description" name="description">
          <a-textarea 
            v-model:value="formState.description" 
            :rows="3"
            placeholder="Enter color description" 
          />
        </a-form-item>
        
        <!-- Color Preview -->
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Color Preview</h4>
          <div class="flex items-center gap-4">
            <div 
              class="w-20 h-20 rounded-lg border-2 border-gray-300 shadow-sm"
              :style="{ backgroundColor: formState.hex_code || '#FFFFFF' }"
            ></div>
            <div>
              <p class="font-medium text-gray-900">{{ formState.name || 'Color Name' }}</p>
              <p class="text-sm text-gray-500">{{ formState.hex_code || '#FFFFFF' }}</p>
              <p class="text-sm text-gray-600 mt-1">{{ formState.description || 'No description' }}</p>
            </div>
          </div>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import type {Color, ColorFormState, ColorResponse, ApiResponse} from "~/types/colors/color"


definePageMeta({
  layout: 'default',
})

// Reactive variables
const colors = ref<Color[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Modal state
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const confirmLoading = ref(false)
const editingColorId = ref<string | null>(null)

// Form state and reference
const formRef = ref<any>()
const formState = ref<ColorFormState>({
  name: '',
  hex_code: '#FFFFFF',
  description: ''
})

// Form validation rules
const formRules = {
  name: [
    { required: true, message: 'Please enter color name' },
    { min: 2, message: 'Color name must be at least 2 characters' }
  ],
  hex_code: [
    { required: true, message: 'Please enter hex code' },
    { pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, message: 'Please enter valid hex code' }
  ]
}

// Table columns
const columns = [
  {
    title: 'Color',
    key: 'color_preview',
    width: 200,
  },
  {
    title: 'Description',
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

// Fetch colors
const fetchColors = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await useFetchDataApi<ColorResponse>('/color')
    if (data.value?.status === 'success' && Array.isArray(data.value.data)) {
      colors.value = data.value.data
    } else {
      error.value = data.value?.message || 'No colors returned'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch colors'
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
    hex_code: '#FFFFFF',
    description: ''
  }
  editingColorId.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Edit color function with proper typing
const editColor = (record: Record<string, any>): void => {
  const color = record as Color
  modalMode.value = 'edit'
  modalVisible.value = true
  editingColorId.value = color.id
  
  // Populate form with existing data
  formState.value = {
    name: color.name,
    hex_code: color.hex_code,
    description: color.description || ''
  }
}

// Validate hex code
const validateHexCode = () => {
  const hex = formState.value.hex_code
  if (hex && !hex.startsWith('#')) {
    formState.value.hex_code = '#' + hex
  }
}

// Handle form submission
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true
    
    if (modalMode.value === 'add') {
      await createColor()
    } else {
      await updateColor()
    }
    
    modalVisible.value = false
    resetForm()
    await fetchColors()
    
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    confirmLoading.value = false
  }
}

// Create color function
const createColor = async () => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>('/color', {
      method: 'POST',
      body: {
        name: formState.value.name,
        hex_code: formState.value.hex_code,
        description: formState.value.description
      }
    })
    
    if (data.value?.status === 'success') {
      message.success(data.value.message || 'Color created successfully')
    } else {
      message.error(data.value?.message || 'Failed to create color')
      throw new Error(data.value?.message || 'Failed to create color')
    }
  } catch (error: any) {
    console.error('❌ Create Error:', error)
    message.error(error.message || 'Failed to create color')
    throw error
  }
}

// Update  function
const updateColor = async () => {
  if (!editingColorId.value) return
  
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/color/${editingColorId.value}`, {
      method: 'PUT',
      body: {
        name: formState.value.name,
        hex_code: formState.value.hex_code,
        description: formState.value.description
      }
    })
    
    if (data.value?.status === 'success') {
      message.success(data.value.message || 'Color updated successfully')
    } else {
      message.error(data.value?.message || 'Failed to update color')
      throw new Error(data.value?.message || 'Failed to update color')
    }
  } catch (error: any) {
    message.error(error.message || 'Failed to update color')
    throw error
  }
}

// delete Color function
const deleteColor = async (colorId: string) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/color/${colorId}`, {
      method: 'DELETE'
    })
    
    if (data.value?.status === 'success') {
      message.success(data.value.message || 'Color deleted successfully')
      await fetchColors()
    } else {
      message.error(data.value?.message || 'Failed to delete color')
    }
  } catch (error: any) {
    message.error(error.message || 'Failed to delete color')
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
  await fetchColors()
})
</script>

<style scoped>
.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-900 {
  color: #111827;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.w-8 {
  width: 2rem;
}

.h-8 {
  height: 2rem;
}

.w-12 {
  width: 3rem;
}

.w-20 {
  width: 5rem;
}

.h-20 {
  height: 5rem;
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.border-2 {
  border-width: 2px;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.cursor-pointer {
  cursor: pointer;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.p-4 {
  padding: 1rem;
}
</style>