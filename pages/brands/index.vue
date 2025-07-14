<template>
  <div>
    <a-page-header title="Brands" subtitle="Manage product brands">
      <template #extra>
        <div style="display: flex;">
          <a-button>
            <NuxtLink to="/products">
              <left-outlined /> Back to Products
            </NuxtLink>
          </a-button>
          <a-button type="primary" @click="showModal" style="margin-left: 0.5rem;">
            <plus-outlined /> Add Brand
          </a-button>
        </div>
      </template>
    </a-page-header>

    <a-card>
      <a-table 
        :columns="columns" 
        :data-source="brands" 
        :loading="loading" 
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'logo_url'">
            <a-image 
              :src="record.logo_url" 
              :width="50" 
              :height="50" 
              style="object-fit: cover; border-radius: 4px;"
              :preview="true"
            />
          </template>
          <template v-if="column.key === 'is_featured'">
            <a-tag :color="record.is_featured ? 'green' : 'default'">
              {{ record.is_featured ? 'Featured' : 'Not Featured' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'created_at'">
            <span>{{ formatDate(record.created_at) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="space-x-2" style="display: flex;">
              <a-button type="primary" size="small" @click="editBrand(record)">
                Edit
              </a-button>
              <a-popconfirm 
                title="Are you sure you want to delete this brand?" 
                ok-text="Yes"
                cancel-text="No" 
                @confirm="deleteBrand(record.id)"
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

    <!-- Add/Edit Brand Modal -->
    <a-modal 
      :title="modalMode === 'add' ? 'Add New Brand' : 'Edit Brand'" 
      v-model:open="modalVisible"
      :confirm-loading="confirmLoading" 
      @ok="handleSubmit" 
      @cancel="handleCancel"
    >
      <a-form ref="formRef" :model="formState"  layout="vertical">
        <a-form-item 
          label="Brand Name" 
          name="name"
        >
          <a-input 
            v-model:value="formState.name" 
            placeholder="Enter brand name"
            @input="generateSlug"
          />
        </a-form-item>
        
        <a-form-item 
          label="Slug" 
          name="slug"
        >
          <a-input 
            v-model:value="formState.slug" 
            placeholder="Enter brand slug" 
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
            placeholder="Enter brand description" 
          />
        </a-form-item>
        
        <a-form-item 
          label="Logo URL" 
          name="logo_url"
        >
          <a-input 
            v-model:value="formState.logo_url" 
            placeholder="Enter logo URL" 
          />
          <div class="text-gray-500 text-sm">
            Enter the full URL to the brand logo image.
          </div>
        </a-form-item>
        
        <a-form-item 
          label="Featured" 
          name="is_featured"
        >
          <a-switch 
            v-model:checked="formState.is_featured"
            checked-children="Yes"
            un-checked-children="No"
          />
          <div class="text-gray-500 text-sm">
            Featured brands appear prominently on the site.
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// Types
interface Brand {
  id: string
  name: string
  slug: string
  description: string
  logo_url: string
  is_featured: number
  created_at: string
  updated_at: string
}

interface BrandResponse {
  status: number
  message: string
  data: Brand[]
}

interface BrandFormState {
  name: string
  slug: string
  description: string
  logo_url: string
  is_featured: boolean
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
const brands = ref<Brand[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Modal state
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const confirmLoading = ref(false)
const editingBrandId = ref<string | null>(null)

// Form state and reference
const formRef = ref<any>()
const formState = ref<BrandFormState>({
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  is_featured: false
})

// Form validation rules
const formRules = {
  name: [
    { required: true, message: 'Please enter brand name' },
    { min: 2, message: 'Brand name must be at least 2 characters' }
  ],
  slug: [
    { required: true, message: 'Please enter brand slug' },
    { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }
  ],
  description: [
    { required: true, message: 'Please enter brand description' }
  ],
  logo_url: [
    { required: true, message: 'Please enter logo URL' },
    { type: 'url', message: 'Please enter a valid URL' }
  ]
}

// Table columns
const columns = [
  {
    title: 'Logo',
    key: 'logo_url',
    width: 80,
  },
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
    title: 'Featured',
    key: 'is_featured',
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

// Fetch brands
const fetchBrands = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await useFetchDataApi<BrandResponse>('/brands')
    if (data.value?.status === 200 && Array.isArray(data.value.data)) {
      brands.value = data.value.data
    } else {
      error.value = data.value?.message || 'No brands returned'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch brands'
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
    logo_url: '',
    is_featured: false
  }
  editingBrandId.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Edit brand function
const editBrand = (record: Record<string, any>): void => {
  const brand = record as Brand
  modalMode.value = 'edit'
  modalVisible.value = true
  editingBrandId.value = brand.id
  
  // Populate form with existing data
  formState.value = {
    name: brand.name,
    slug: brand.slug,
    description: brand.description || '',
    logo_url: brand.logo_url || '',
    is_featured: brand.is_featured === 1
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
      await createBrand()
    } else {
      await updateBrand()
    }
    
    modalVisible.value = false
    resetForm()
    await fetchBrands()
    
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    confirmLoading.value = false
  }
}

// Create brand function
const createBrand = async () => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>('/brands', {
      method: 'POST',
      body: {
        name: formState.value.name,
        description: formState.value.description,
        logo_url: formState.value.logo_url,
        is_featured: formState.value.is_featured ? 1 : 0
      }
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Brand created successfully')
    }
  } catch (error: any) {
    console.error('❌ Create Error:', error)
    message.error(error.message || 'Failed to create brand')
    throw error
  }
}

// Update brand function
const updateBrand = async () => {
  if (!editingBrandId.value) return
  
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/brands/${editingBrandId.value}`, {
      method: 'PUT',
      body: {
        name: formState.value.name,
        description: formState.value.description,
        logo_url: formState.value.logo_url,
        is_featured: formState.value.is_featured ? 1 : 0
      }
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Brand updated successfully')
    }
  } catch (error: any) {
    console.error('❌ Update Error:', error)
    message.error(error.message || 'Failed to update brand')
    throw error
  }
}

// Delete brand function
const deleteBrand = async (brandId: string) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/brands/${brandId}`, {
      method: 'DELETE'
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Brand deleted successfully')
    }
    await fetchBrands()
  } catch (error: any) {
    console.error('❌ Delete Error:', error)
    message.error(error.message || 'Failed to delete brand')
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
  await fetchBrands()
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