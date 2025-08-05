<template>
  <div>
    <a-page-header title="Product Categories" subtitle="Manage product categories">
      <template #extra>
        <div style="display: flex;">
          <a-button type="primary" @click="showModal" style="margin-left: 0.5rem;">
            <plus-outlined /> Add Category
          </a-button>
        </div>
      </template>
    </a-page-header>

    <a-card>
      <a-table 
        :columns="columns" 
        :data-source="categories" 
        :loading="loading" 
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'group'">
            <a-tag color="blue">{{ record.group?.name || 'No Group' }}</a-tag>
          </template>
          <template v-if="column.key === 'created_at'">
            <span>{{ formatDate(record.created_at) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="space-x-2" style="display: flex;">
              <a-button type="primary" size="small" @click="editCategory(record)">
                Edit
              </a-button>
              <a-popconfirm 
                title="Are you sure you want to delete this category?" 
                ok-text="Yes"
                cancel-text="No" 
                @confirm="deleteCategory(record.id)"
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

    <!-- Add/Edit Category Modal -->
    <a-modal 
      :title="modalMode === 'add' ? 'Add New Category' : 'Edit Category'" 
      v-model:open="modalVisible"
      :confirm-loading="confirmLoading" 
      @ok="handleSubmit" 
      @cancel="handleCancel"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item 
          label="Category Name" 
          name="name"
        >
          <a-input 
            v-model:value="formState.name" 
            placeholder="Enter category name"
            @input="generateSlug"
          />
        </a-form-item>
        
        <a-form-item 
          label="Slug" 
          name="slug"
        >
          <a-input 
            v-model:value="formState.slug" 
            placeholder="Enter category slug" 
          />
          <div class="text-gray-500 text-sm">
            Used in URLs. Will be auto-generated if left empty.
          </div>
        </a-form-item>
        
        <a-form-item label="Description" name="description">
          <a-textarea 
            v-model:value="formState.description" 
            :rows="3"
            placeholder="Enter category description" 
          />
        </a-form-item>
        
        <a-form-item 
          label="Category Group" 
          name="category_group_id"
        >
          <a-select 
            v-model:value="formState.category_group_id" 
            placeholder="Select category group"
            :loading="loadingCategoryGroups"
          >
            <a-select-option 
              v-for="group in categoryGroups" 
              :key="group.id" 
              :value="group.id"
            >
              {{ group.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import type { Category, CategoryGroup, CategoryFormState, CategoryResponse, CategoryGroupResponse, ApiResponse} from "~/types/category/category";

definePageMeta({
  layout: 'default',
})

// Reactive variables
const categories = ref<Category[]>([])
const categoryGroups = ref<CategoryGroup[]>([])
const loading = ref(false)
const loadingCategoryGroups = ref(false)
const error = ref<string | null>(null)

// Modal state
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const confirmLoading = ref(false)
const editingCategoryId = ref<string | null>(null)

// Form state and reference
const formRef = ref<any>()
const formState = ref<CategoryFormState>({
  name: '',
  slug: '',
  description: '',
  category_group_id: ''
})

// Form validation rules
const formRules = {
  name: [
    { required: true, message: 'Please enter category name' },
    { min: 2, message: 'Category name must be at least 2 characters' }
  ],
  slug: [
    { required: true, message: 'Please enter category slug' },
    { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }
  ],
  category_group_id: [
    { required: true, message: 'Please select a category group' }
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
    title: 'Group',
    key: 'group',
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

// Fetch categories
const fetchCategories = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await useFetchDataApi<CategoryResponse>('/categories')
    if (data.value?.success && Array.isArray(data.value.data)) {
      categories.value = data.value.data
    } else {
      error.value = data.value?.message || 'No categories returned'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch categories'
    message.error(error.value)
  } finally {
    loading.value = false
  }
}

// Fetch category groups for the dropdown
const fetchCategoryGroups = async () => {
  loadingCategoryGroups.value = true
  try {
    const { data } = await useFetchDataApi<CategoryGroupResponse>('/category-groups')
    if (data.value?.success && Array.isArray(data.value.data)) {
      categoryGroups.value = data.value.data
    } else {
      message.error(data.value?.message || 'Failed to fetch category groups')
    }
  } catch (err: any) {
    console.error('❌ Fetch Category Groups Error:', err)
    message.error('Failed to fetch category groups')
  } finally {
    loadingCategoryGroups.value = false
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
    category_group_id: ''
  }
  editingCategoryId.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Edit category function with proper typing
const editCategory = (record: Record<string, any>): void => {
  const category = record as Category
  modalMode.value = 'edit'
  modalVisible.value = true
  editingCategoryId.value = category.id
  
  // Populate form with existing data
  formState.value = {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    category_group_id: category.category_group_id
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
      await createCategory()
    } else {
      await updateCategory()
    }
    
    modalVisible.value = false
    resetForm()
    await fetchCategories()
    
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    confirmLoading.value = false
  }
}

// Create category function
const createCategory = async () => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>('/categories', {
      method: 'POST',
      body: {
        name: formState.value.name,
        slug: formState.value.slug,
        description: formState.value.description,
        category_group_id: formState.value.category_group_id
      }
    })
    
    if (data.value?.success) {
      message.success(data.value.message || 'Category created successfully')
    } else {
      message.error(data.value?.message || 'Failed to create category')
      throw new Error(data.value?.message || 'Failed to create category')
    }
  } catch (error: any) {
    console.error('❌ Create Error:', error)
    message.error(error.message || 'Failed to create category')
    throw error
  }
}

// Update category function
const updateCategory = async () => {
  if (!editingCategoryId.value) return
  
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/categories/${editingCategoryId.value}`, {
      method: 'PUT',
      body: {
        name: formState.value.name,
        slug: formState.value.slug,
        description: formState.value.description,
        category_group_id: formState.value.category_group_id
      }
    })
    
    if (data.value?.success) {
      message.success(data.value.message || 'Category updated successfully')
    } else {
      message.error(data.value?.message || 'Failed to update category')
      throw new Error(data.value?.message || 'Failed to update category')
    }
  } catch (error: any) {
    console.error('❌ Update Error:', error)
    message.error(error.message || 'Failed to update category')
    throw error
  }
}

// Delete category function
const deleteCategory = async (categoryId: string) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/categories/${categoryId}`, {
      method: 'DELETE'
    })
    
    if (data.value?.success) {
      message.success(data.value.message || 'Category deleted successfully')
      await fetchCategories()
    } else {
      message.error(data.value?.message || 'Failed to delete category')
    }
  } catch (error: any) {
    console.error('❌ Delete Error:', error)
    message.error(error.message || 'Failed to delete category')
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
  await Promise.all([
    fetchCategories(),
    fetchCategoryGroups()
  ])
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