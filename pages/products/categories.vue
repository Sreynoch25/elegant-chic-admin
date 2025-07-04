<template>
  <div>
    <a-page-header title="Product Categories" subtitle="Manage product categories">
      <template #extra>
        <div style="display: flex;">
          <a-button>
            <NuxtLink to="/products">
              <left-outlined /> Back to Products
            </NuxtLink>
          </a-button>
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
        :row-key="(record: Category) => record.id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'group'">
            <a-tag color="blue">{{ record.group.name }}</a-tag>
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
      :visible="modalVisible"
      :confirm-loading="confirmLoading" 
      @ok="handleOk" 
      @cancel="handleCancel"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="Category Name" name="name" :rules="[{ required: true, message: 'Please enter category name' }]">
          <a-input v-model:value="formState.name" placeholder="Enter category name" />
        </a-form-item>
        
        <a-form-item label="Slug" name="slug" :rules="[{ required: true, message: 'Please enter category slug' }]">
          <a-input v-model:value="formState.slug" placeholder="Enter category slug" />
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
        
        <a-form-item label="Category Group" name="category_group_id" :rules="[{ required: true, message: 'Please select a category group' }]">
          <a-select v-model:value="formState.category_group_id" placeholder="Select category group">
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


// Types
interface CategoryGroup {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  category_group_id: string
  created_at: string
  updated_at: string
  group: CategoryGroup
}

interface CategoryResponse {
  success: boolean
  message: string
  data: Category[]
}

interface CategoryFormState {
  name: string
  slug: string
  description: string
  category_group_id: string
}

definePageMeta({
  layout: 'default',
})

// Reactive variables
const categories = ref<Category[]>([])
const categoryGroups = ref<CategoryGroup[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Modal state
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const confirmLoading = ref(false)
const editingCategoryId = ref<string | null>(null)

// Form state
const formState = ref<CategoryFormState>({
  name: '',
  slug: '',
  description: '',
  category_group_id: ''
})

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
    dataIndex: 'created_at',
    key: 'created_at',
    customRender: ({ text }: { text: string }) => {
      return new Date(text).toLocaleDateString()
    }
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
      
      // Extract unique category groups
      const uniqueGroups = new Map<string, CategoryGroup>()
      data.value.data.forEach(category => {
        if (category.group) {
          uniqueGroups.set(category.group.id, category.group)
        }
      })
      categoryGroups.value = Array.from(uniqueGroups.values())
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
}

// Edit category
const editCategory = (category: Category) => {
  modalMode.value = 'edit'
  modalVisible.value = true
  editingCategoryId.value = category.id
  
  formState.value = {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    category_group_id: category.category_group_id
  }
}

// Handle form submission
const handleOk = async () => {
  try {
    confirmLoading.value = true
    
    // Auto-generate slug if empty
    if (!formState.value.slug && formState.value.name) {
      formState.value.slug = formState.value.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }
    
    const endpoint = modalMode.value === 'add' 
      ? '/categories' 
      : `/categories/${editingCategoryId.value}`
    
    const method = modalMode.value === 'add' ? 'POST' : 'PUT'
    
    const response = await $fetch<CategoryResponse>(endpoint, {
      method,
    })
    
    if (response?.success) {
      message.success(`Category ${modalMode.value === 'add' ? 'created' : 'updated'} successfully`)
      modalVisible.value = false
      resetForm()
      await fetchCategories()
    } else {
      message.error(response?.message || 'Operation failed')
    }
  } catch (err: any) {
    console.error('❌ Save Error:', err)
    message.error('Failed to save category')
  } finally {
    confirmLoading.value = false
  }
}

// Delete category
const deleteCategory = async (categoryId: string) => {
  try {
    const response = await $fetch<CategoryResponse>(`/categories/${categoryId}`, {
      method: 'DELETE'
    })
    
    if (response?.success) {
      message.success('Category deleted successfully')
      await fetchCategories()
    } else {
      message.error(response?.message || 'Delete failed')
    }
  } catch (err: any) {
    console.error('❌ Delete Error:', err)
    message.error('Failed to delete category')
  }
}

// Auto-generate slug when name changes
watch(() => formState.value.name, (newName: string) => {
  if (modalMode.value === 'add' && newName) {
    formState.value.slug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
})

// Initialize
onMounted(() => {
  fetchCategories()
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