<template>
  <div>
    <a-page-header title="Banners" subtitle="Manage banner promotions">
      <template #extra>
        <div style="display: flex;">
          <a-button type="primary" @click="showModal" style="margin-left: 0.5rem;">
            <plus-outlined /> Add Banner
          </a-button>
        </div>
      </template>
    </a-page-header>

    <a-card>
      <a-table 
        :columns="columns" 
        :data-source="banners" 
        :loading="loading" 
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'big_image'">
            <a-image 
              :src="record.big_image" 
              :width="50" 
              :height="50" 
              style="object-fit: cover; border-radius: 4px;"
              :preview="true"
            />
          </template>
          <template v-if="column.key === 'small_image'">
            <a-image 
              :src="record.small_image" 
              :width="50" 
              :height="50" 
              style="object-fit: cover; border-radius: 4px;"
              :preview="true"
            />
          </template>
          <template v-if="column.key === 'discount'">
            <span>{{ record.discount }}%</span>
          </template>
          <template v-if="column.key === 'created_at'">
            <span>{{ formatDate(record.created_at) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="space-x-2" style="display: flex;">
              <a-button type="primary" size="small" @click="editBanner(record)">
                Edit
              </a-button>
              <a-popconfirm 
                title="Are you sure you want to delete this banner?" 
                ok-text="Yes"
                cancel-text="No" 
                @confirm="deleteBanner(record.id)"
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

    <!-- Add/Edit Banner Modal -->
    <a-modal 
      :title="modalMode === 'add' ? 'Add New Banner' : 'Edit Banner'" 
      v-model:open="modalVisible"
      :confirm-loading="confirmLoading" 
      @ok="handleSubmit" 
      @cancel="handleCancel"
      width="600px"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item 
          label="Title" 
          name="title"
        >
          <a-input 
            v-model:value="formState.title" 
            placeholder="Enter banner title"
          />
        </a-form-item>
        
        <a-form-item 
          label="Description" 
          name="description"
        >
          <a-textarea 
            v-model:value="formState.description" 
            :rows="3"
            placeholder="Enter banner description" 
          />
        </a-form-item>

        <a-form-item 
          label="Discount (%)" 
          name="discount"
        >
          <a-input-number 
            v-model:value="formState.discount" 
            :min="0"
            :max="100"
            :precision="0"
            placeholder="Enter discount percentage"
            style="width: 100%"
            :addon-after="'%'"
          />
        </a-form-item>
        
        <a-form-item 
          label="Big Image Upload" 
          name="big_image"
        >
          <a-upload
            v-model:file-list="bigImageFileList"
            :before-upload="beforeUploadBigImage"
            :max-count="1"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            list-type="picture"
          >
            <a-button>
              <upload-outlined />
              Upload Big Image
            </a-button>
          </a-upload>
          <div class="text-gray-500 text-sm" style="margin-top: 8px;">
            Upload a big image (JPG, PNG, WEBP, max 5MB)
          </div>
        </a-form-item>

        <a-form-item 
          label="Small Image Upload" 
          name="small_image"
        >
          <a-upload
            v-model:file-list="smallImageFileList"
            :before-upload="beforeUploadSmallImage"
            :max-count="1"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            list-type="picture"
          >
            <a-button>
              <upload-outlined />
              Upload Small Image
            </a-button>
          </a-upload>
          <div class="text-gray-500 text-sm" style="margin-top: 8px;">
            Upload a small image (JPG, PNG, WEBP, max 5MB)
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
interface Banner {
  id: string
  title: string
  description: string
  discount: string
  big_image: string
  small_image: string
  created_at: string
  updated_at: string
}

interface BannerResponse {
  status_code: number
  message: string
  data: Banner[]
}

interface BannerFormState {
  title: string
  description: string
  discount: number | undefined
  big_image: File | string
  small_image: File | string
}

interface ApiResponse {
  status_code: number
  message: string
  data?: any
  banner?: Banner
}

definePageMeta({
  layout: 'default',
})

// Reactive variables
const banners = ref<Banner[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const bigImageFileList = ref<UploadFile[]>([])
const smallImageFileList = ref<UploadFile[]>([])

// Modal state
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const confirmLoading = ref(false)
const editingBannerId = ref<string | null>(null)

// Form state and reference
const formRef = ref<any>()
const formState = ref<BannerFormState>({
  title: '',
  description: '',
  discount: undefined,
  big_image: '',
  small_image: ''
})

// Form validation rules
const formRules = {
  title: [
    { required: true, message: 'Please enter banner title' },
    { min: 2, message: 'Banner title must be at least 2 characters' }
  ],
  description: [
    { required: true, message: 'Please enter description' }
  ],
  discount: [
    { required: true, message: 'Please enter discount percentage' },
    { type: 'number' as const, min: 0, max: 100, message: 'Discount must be between 0 and 100' }
  ],
  big_image: [
    {
      validator: async (_: any, value: File | string) => {
        // For add mode, require an image
        if (modalMode.value === 'add' && !value) {
          return Promise.reject('Please upload a big image');
        }
        // For edit mode, allow existing string URLs or new files
        if (modalMode.value === 'edit' && !value) {
          return Promise.reject('Please upload a big image or keep existing one');
        }
        // Validate file type if it's a new file
        if (value instanceof File) {
          const isImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(value.type);
          if (!isImage) {
            return Promise.reject('The big image must be a JPEG, PNG, JPG, or WEBP file');
          }
        }
        return Promise.resolve();
      },
    }
  ],
  small_image: [
    {
      validator: async (_: any, value: File | string) => {
        // For add mode, require an image
        if (modalMode.value === 'add' && !value) {
          return Promise.reject('Please upload a small image');
        }
        // For edit mode, allow existing string URLs or new files
        if (modalMode.value === 'edit' && !value) {
          return Promise.reject('Please upload a small image or keep existing one');
        }
        // Validate file type if it's a new file
        if (value instanceof File) {
          const isImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(value.type);
          if (!isImage) {
            return Promise.reject('The small image must be a JPEG, PNG, JPG, or WEBP file');
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
    title: 'Big Image',
    key: 'big_image',
    width: 80,
  },
  {
    title: 'Small Image',
    key: 'small_image',
    width: 80,
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Discount',
    key: 'discount',
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
const beforeUploadBigImage = (file: File) => {
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

  formState.value.big_image = file;
  return false;
}

const beforeUploadSmallImage = (file: File) => {
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

  formState.value.small_image = file;
  return false;
}

// Fetch banners
const fetchBanners = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await useFetchDataApi<BannerResponse>('/banners')
    if (data.value?.data && Array.isArray(data.value.data)) {
      banners.value = data.value.data
    } else {
      error.value = data.value?.message || 'No banners returned'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch banners'
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
    title: '',
    description: '',
    discount: undefined,
    big_image: '',
    small_image: ''
  }
  bigImageFileList.value = []
  smallImageFileList.value = []
  editingBannerId.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Edit banner function
const editBanner = (record: Record<string, any>): void => {
  const banner = record as Banner
  modalMode.value = 'edit'
  modalVisible.value = true
  editingBannerId.value = banner.id
  
  formState.value = {
    title: banner.title,
    description: banner.description || '',
    discount: parseInt(banner.discount),
    big_image: banner.big_image || '',
    small_image: banner.small_image || ''
  }
  
  bigImageFileList.value = banner.big_image ? [{
    uid: '-1',
    name: 'big-image.jpg',
    status: 'done',
    url: banner.big_image
  }] : []
  smallImageFileList.value = banner.small_image ? [{
    uid: '-2',
    name: 'small-image.jpg',
    status: 'done',
    url: banner.small_image
  }] : []
}

// Handle form submission
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true
    
    if (modalMode.value === 'add') {
      await createBanner()
    } else {
      await updateBanner()
    }
    
    modalVisible.value = false
    resetForm()
    await fetchBanners()
    
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    confirmLoading.value = false
  }
}

// Create banner function
const createBanner = async () => {
  try {
    const formData = new FormData()
    formData.append('title', formState.value.title)
    formData.append('description', formState.value.description)
    formData.append('discount', String(formState.value.discount))
    if (formState.value.big_image instanceof File) {
      formData.append('big_image', formState.value.big_image)
    }
    if (formState.value.small_image instanceof File) {
      formData.append('small_image', formState.value.small_image)
    }
    
    const { data } = await useFetchDataApi<ApiResponse>('/banners', {
      method: 'POST',
      body: formData,
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Banner created successfully')
    }
  } catch (error: any) {
    console.error('❌ Create Error:', error)
    message.error(error.message || 'Failed to create banner')
    throw error
  }
}

// Update banner function
const updateBanner = async () => {
  if (!editingBannerId.value) return
  
  try {
    const formData = new FormData()
    formData.append('_method', 'PUT')
    formData.append('title', formState.value.title)
    formData.append('description', formState.value.description)
    formData.append('discount', String(formState.value.discount))
    if (formState.value.big_image instanceof File) {
      formData.append('big_image', formState.value.big_image)
    }
    if (formState.value.small_image instanceof File) {
      formData.append('small_image', formState.value.small_image)
    }
    
    const { data } = await useFetchDataApi<ApiResponse>(`/banners/${editingBannerId.value}`, {
      method: 'POST',
      body: formData,
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Banner updated successfully')
    }
  } catch (error: any) {
    console.error('❌ Update Error:', error)
    message.error(error.message || 'Failed to update banner')
    throw error
  }
}

// Delete banner function
const deleteBanner = async (bannerId: string) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/banners/${bannerId}`, {
      method: 'DELETE'
    })
    
    if (data.value?.message) {
      message.success(data.value.message)
    } else {
      message.success('Banner deleted successfully')
    }
    await fetchBanners()
  } catch (error: any) {
    console.error('❌ Delete Error:', error)
    message.error(error.message || 'Failed to delete banner')
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
  await fetchBanners()
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