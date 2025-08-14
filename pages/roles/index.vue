<template>
  <div class="roles-management">
    <div class="page-header">
      <h1>Roles Management</h1>
      <a-button type="primary" @click="showCreateModal" :icon="h(PlusOutlined)">
        Create Role
      </a-button>
    </div>

    <!-- Roles Table -->
    <a-card>
      <a-table :columns="columns" :data-source="roles" :loading="loading" row-key="id"
        :pagination="{ pageSize: 10, showSizeChanger: true }">
        <!-- Role Name -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a-tag :color="getRoleColor(record.name)">
              {{ record.name }}
            </a-tag>
          </template>

          <!-- Permissions -->
          <template v-else-if="column.key === 'permissions'">
            <div class="permissions-display">
              <a-tag v-for="permission in record.permissions.slice(0, 3)" :key="permission" size="small">
                {{ permission }}
              </a-tag>
              <a-tag v-if="record.permissions.length > 3" size="small" color="blue">
                +{{ record.permissions.length - 3 }} more
              </a-tag>
            </div>
          </template>

          <!-- Permissions Count -->
          <template v-else-if="column.key === 'permissions_count'">
            <a-badge :count="record.permissions_count" :number-style="{ backgroundColor: '#52c41a' }" />
          </template>

          <!-- Users Count -->
          <template v-else-if="column.key === 'users_count'">
            <a-badge :count="record.users_count" />
          </template>

          <!-- Created Date -->
          <template v-else-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>

          <!-- Actions -->
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-tooltip title="Edit Role">
                <a-button type="text" :icon="h(EditOutlined)" @click="() => editRole(record)" />
              </a-tooltip>
              <a-tooltip title="Delete Role">
                <a-button type="text" danger :icon="h(DeleteOutlined)" @click="() => deleteRole(record)"
                  :disabled="record.name === 'super_admin'" />
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Create/Edit Modal -->
    <a-modal v-model:open="modalVisible" :title="isEditing ? 'Edit Role' : 'Create Role'" :confirm-loading="submitting"
      @ok="handleSubmit" @cancel="resetModal" width="800px">
      <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical" class="role-form">
        <a-form-item label="Role Name" name="name">
          <a-input v-model:value="formData.name" placeholder="Enter role name" />
        </a-form-item>

        <a-form-item label="Permissions" name="permissions">
          <div class="permissions-section">
            <a-space direction="vertical" style="width: 100%">
              <div class="permissions-actions">
                <a-button size="small" @click="selectAllPermissions">Select All</a-button>
                <a-button size="small" @click="clearAllPermissions">Clear All</a-button>
              </div>

              <a-spin :spinning="permissionsLoading">
                <div class="permissions-grid">
                  <div v-for="category in permissionCategories" :key="category.name" class="permission-category">
                    <h4>{{ category.label }}</h4>
                    <a-checkbox-group :value="categoryPermissions(category.name)"
                      @change="val => updatePermissions(category.name, val)" :options="category.permissions" />
                  </div>
                </div>
              </a-spin>
            </a-space>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType, FormInstance } from 'ant-design-vue'
import type { Role, Response, Permission, PermissionOption, PermissionCategory } from "~/types/roles/role";
import type { CheckboxValueType } from 'ant-design-vue/es/checkbox/interface';

// Reactive data
const loading = ref(false)
const permissionsLoading = ref(false)
const modalVisible = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const roles = ref<Role[]>([])
const availablePermissions = ref<Permission[]>([])
const formRef = ref<FormInstance>()

// Form data
const formData = reactive({
  id: undefined as number | undefined,
  name: '',
  permissions: [] as string[]
})

// Returns permissions in this category
const categoryPermissions = (categoryName: string) => {
  return formData.permissions.filter(p => p.startsWith(categoryName + '.'))
}

// Update permissions when a category changes
const updatePermissions = (categoryName: string, selected: CheckboxValueType[]) => {
  // Remove old permissions of this category
  formData.permissions = formData.permissions.filter(
    p => !p.startsWith(categoryName + '.')
  )

  // Add new ones, cast to string
  formData.permissions.push(...selected.map(String))
}


// Table columns
const columns: TableColumnsType = [
  {
    title: 'Role Name',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: 'Permissions',
    dataIndex: 'permissions',
    key: 'permissions',
    width: 300
  },
  {
    title: 'Permissions Count',
    dataIndex: 'permissions_count',
    key: 'permissions_count',
    width: 120,
    align: 'center'
  },
  {
    title: 'Users Count',
    dataIndex: 'users_count',
    key: 'users_count',
    width: 100,
    align: 'center'
  },
  {
    title: 'Created At',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 150
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    align: 'center'
  }
]

// Form validation rules
const rules = {
  name: [
    { required: true, message: 'Please enter role name', trigger: 'blur' as const },
    { min: 2, max: 50, message: 'Role name must be between 2-50 characters', trigger: 'blur' as const }
  ],
  permissions: [
    { required: true, message: 'Please select at least one permission', trigger: 'change' as const, type: 'array' as const, min: 1 }
  ]
}

// Computed property to dynamically build permission categories from API data
const permissionCategories = computed((): PermissionCategory[] => {
  const categories: Record<string, PermissionOption[]> = {}

  // Group permissions by category (prefix before the dot)
  availablePermissions.value.forEach(permission => {
    const [category, action] = permission.name.split('.')
    if (!categories[category]) {
      categories[category] = []
    }

    // Create a readable label for the permission
    const actionLabel = action.charAt(0).toUpperCase() + action.slice(1)
    const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1)

    categories[category].push({
      label: `${actionLabel} ${categoryLabel}`,
      value: permission.name
    })
  })

  // Convert to the expected format and sort categories
  const categoryMappings: Record<string, string> = {
    dashboard: 'Dashboard',
    banner: 'Banner Management',
    category: 'Category Management',
    customer: 'Customer Management',
    item: 'Item Management',
    order: 'Order Management',
    payment: 'Payment Management',
    promotion: 'Promotion Management',
    delivery: 'Delivery Management',
    user: 'User Management',
    role: 'Role Management',
    settings: 'Settings',
    website: 'Website Management'
  }

  return Object.entries(categories)
    .map(([categoryName, permissions]) => ({
      name: categoryName,
      label: categoryMappings[categoryName] || categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
      permissions: permissions.sort((a, b) => a.label.localeCompare(b.label))
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

// Methods
const fetchPermissions = async () => {
  permissionsLoading.value = true
  try {
    const response = await useFetchDataApi('/permissions') as { data: { value: Response<Permission[]> } }
    if (response.data.value && response.data.value.success) {
      availablePermissions.value = response.data.value.data || []
    }
  } catch (error) {
    message.error('Failed to fetch permissions')
    console.error(error)
  } finally {
    permissionsLoading.value = false
  }
}

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await useFetchDataApi('/roles') as { data: { value: Response<Role[]> } }
    if (response.data.value && response.data.value.success) {
      roles.value = response.data.value.data || []
    }
  } catch (error) {
    message.error('Failed to fetch roles')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const showCreateModal = async () => {
  isEditing.value = false
  modalVisible.value = true
  resetForm()

  // Fetch permissions when modal opens if not already loaded
  if (availablePermissions.value.length === 0) {
    await fetchPermissions()
  }
}

const editRole = async (role: Record<string, any>) => {
  const roleData = role as Role
  isEditing.value = true
  modalVisible.value = true
  formData.id = roleData.id
  formData.name = roleData.name
  formData.permissions = [...roleData.permissions]

  // Fetch permissions when modal opens if not already loaded
  if (availablePermissions.value.length === 0) {
    await fetchPermissions()
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const payload = {
      name: formData.name,
      permissions: formData.permissions
    }

    let response: any

    if (isEditing.value && formData.id) {
      // Update role
       response = await useFetchDataApi(`/roles/${formData.id}`, {
        method: 'PUT',
        body: payload
      }) 
    } else {
      // Create role
      response = await useFetchDataApi('/roles', {
        method: 'POST',
        body: payload
      }) 
    }

    if (response.data.value.success) {
      message.success(response.data.value.message || (isEditing.value ? 'Role updated successfully' : 'Role created successfully'))
      modalVisible.value = false
      await fetchRoles()
    }
  } catch (error) {
    message.error(isEditing.value ? 'Failed to update role' : 'Failed to create role')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const deleteRole = (role: any) => {
  const roleData = role as Role
  Modal.confirm({
    title: 'Delete Role',
    content: `Are you sure you want to delete the role "${roleData.name}"?`,
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: async () => {
      try {
        const response = await useFetchDataApi(`/roles/${roleData.id}`, { method: 'DELETE' }) as Response<any>
        if (response.data.value.success) {
          message.success(response.data.value.message || 'Role deleted successfully')
          await fetchRoles()
        }
      } catch (error) {
        message.error('Failed to delete role')
        console.error(error)
      }
    }
  })
}

const resetModal = () => {
  modalVisible.value = false
  resetForm()
}

const resetForm = () => {
  formData.id = undefined
  formData.name = ''
  formData.permissions = []
  formRef.value?.clearValidate()
}

const selectAllPermissions = () => {
  formData.permissions = availablePermissions.value.map(p => p.name)
}

const clearAllPermissions = () => {
  formData.permissions = []
}

const getRoleColor = (roleName: string) => {
  const colors: Record<string, string> = {
    super_admin: 'red',
    admin: 'blue',
    customer: 'green',
    viewer: 'orange'
  }
  return colors[roleName] || 'default'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
.roles-management {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.permissions-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.role-form {
  margin-top: 16px;
}

.permissions-section {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 16px;
  background-color: #fafafa;
}

.permissions-actions {
  margin-bottom: 16px;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.permission-category {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.permission-category h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 8px;
}

.permission-category :deep(.ant-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.permission-category :deep(.ant-checkbox-wrapper) {
  margin-right: 0;
}
</style>