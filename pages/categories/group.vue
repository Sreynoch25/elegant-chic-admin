<template>
  <div class="category-groups-management">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Category Groups</h1>
      <a-button type="primary" @click="showAddModal">
        Add Category Group
      </a-button>
    </div>

    <!-- Search and Filter -->
    <div class="!m-4">
      <a-input-search
        v-model:value="searchTerm"
        placeholder="Search category groups..."
        style="width: 300px"
        @search="handleSearch"
        allow-clear
      />
    </div>

    <!-- Simple Table -->
    <a-table
      :columns="columns"
      :data-source="filteredCategoryGroups"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <span class="font-medium">{{ record.name }}</span>
        </template>
        
        <template v-if="column.key === 'slug'">
          <a-tag color="blue">{{ record.slug }}</a-tag>
        </template>
        
        <template v-if="column.key === 'createdAt'">
          <span>{{ formatDate(record.createdAt) }}</span>
        </template>
        
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button size="small" @click="editCategoryGroup(record)">
              Edit
            </a-button>
            <a-popconfirm
              title="Are you sure you want to delete this category group?"
              ok-text="Yes"
              cancel-text="No"
              @confirm="deleteCategoryGroup(record.id)"
            >
              <a-button size="small" danger>
                Delete
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEditing ? 'Edit Category Group' : 'Add Category Group'"
      :confirm-loading="submitLoading"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item label="Name" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="Enter category group name"
            @input="generateSlug"
          />
        </a-form-item>
        
        <a-form-item label="Slug" name="slug">
          <a-input
            v-model:value="formData.slug"
            placeholder="Enter or auto-generate slug"
            addon-before="/"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// Types
interface CategoryGroup {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

interface CategoryGroupApiResponse {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

interface CategoryGroupResponse {
  success: boolean
  data: CategoryGroupApiResponse[]
  message?: string
}

interface CategoryGroupForm {
  name: string
  slug: string
}

interface ApiResponse {
  success: boolean
  data?: CategoryGroupApiResponse
  message?: string
}

// Reactive data
const loading = ref(false)
const submitLoading = ref(false)
const error = ref<string | null>(null)
const categoryGroups = ref<CategoryGroup[]>([])
const searchTerm = ref('')
const modalVisible = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<any>()

// Form data
const formData = ref<CategoryGroupForm>({
  name: '',
  slug: ''
})

// Form validation rules
const rules = {
  name: [
    { required: true, message: 'Please enter category group name' },
    { min: 2, message: 'Name must be at least 2 characters' }
  ],
  slug: [
    { required: true, message: 'Please enter slug' },
    { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }
  ]
}

// Simple table columns without sorting
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Slug',
    dataIndex: 'slug',
    key: 'slug',
    width: 150
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150
  }
]

// Pagination
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `${range[0]}-${range[1]} of ${total} items`
})

// Computed
const filteredCategoryGroups = computed(() => {
  if (!searchTerm.value) return categoryGroups.value
  
  return categoryGroups.value.filter((group: CategoryGroup) =>
    group.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    group.slug.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Helper function to transform API response to component format
const transformApiResponse = (apiData: CategoryGroupApiResponse): CategoryGroup => {
  return {
    id: apiData.id,
    name: apiData.name,
    slug: apiData.slug,
    createdAt: apiData.created_at,
    updatedAt: apiData.updated_at
  }
}

// Methods
const fetchCategoryGroups = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { data } = await useFetchDataApi<CategoryGroupResponse>('/category-groups')
    
    if (data.value?.success && Array.isArray(data.value.data)) {
      // Transform API response to component format
      categoryGroups.value = data.value.data.map(transformApiResponse)
      pagination.value.total = data.value.data.length
    } else {
      error.value = data.value?.message || 'No category groups returned'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch category groups'
    message.error(error.value)
  } finally {
    loading.value = false
  }
}

const createCategoryGroup = async (groupData: CategoryGroupForm) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>('/category-groups', {
      method: 'POST',
      body: {
        name: groupData.name,
        slug: groupData.slug
      }
    })
    
    if (data.value?.success) {
      message.success(data.value.message || 'Category group created successfully')
      await fetchCategoryGroups()
      return true
    } else {
      message.error(data.value?.message || 'Failed to create category group')
      return false
    }
  } catch (err: any) {
    console.error('❌ Create Error:', err)
    message.error('Failed to create category group')
    return false
  }
}

const updateCategoryGroup = async (id: string, groupData: CategoryGroupForm) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/category-groups/${id}`, {
      method: 'PUT',
      body: {
        name: groupData.name,
        slug: groupData.slug
      }
    })
    
    if (data.value?.success) {
      message.success(data.value.message || 'Category group updated successfully')
      await fetchCategoryGroups()
      return true
    } else {
      message.error(data.value?.message || 'Failed to update category group')
      return false
    }
  } catch (err: any) {
    console.error('❌ Update Error:', err)
    message.error('Failed to update category group')
    return false
  }
}

const deleteCategoryGroup = async (id: string) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/category-groups/${id}`, {
      method: 'DELETE'
    })
    
    if (data.value?.success) {
      message.success(data.value.message || 'Category group deleted successfully')
      await fetchCategoryGroups()
    } else {
      message.error(data.value?.message || 'Failed to delete category group')
    }
  } catch (err: any) {
    console.error('❌ Delete Error:', err)
    message.error('Failed to delete category group')
  }
}

const showAddModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    name: '',
    slug: ''
  }
  modalVisible.value = true
}

const editCategoryGroup = (record: Record<string, any>) => {
  isEditing.value = true
  editingId.value = record.id
  formData.value = {
    name: record.name,
    slug: record.slug
  }
  modalVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    
    let success = false
    
    if (isEditing.value && editingId.value) {
      success = await updateCategoryGroup(editingId.value, formData.value)
    } else {
      success = await createCategoryGroup(formData.value)
    }
    
    if (success) {
      modalVisible.value = false
      resetForm()
    }
  } catch (err) {
    console.error('Form validation failed:', err)
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    slug: ''
  }
  formRef.value?.resetFields()
}

const generateSlug = () => {
  if (formData.value.name && !isEditing.value) {
    formData.value.slug = formData.value.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

const handleSearch = (value: string) => {
  searchTerm.value = value
}

const handleTableChange = (paginationInfo: any) => {
  pagination.value = { ...pagination.value, ...paginationInfo }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  fetchCategoryGroups()
})
</script>

<style scoped>
.category-groups-management {
  padding: 20px;
}

.ant-table {
  background: white;
  border-radius: 8px;
}

.ant-tag {
  margin: 0;
}
</style>