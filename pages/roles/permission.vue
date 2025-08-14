<template>
  <div class="permissions-page">
    <!-- Page Header -->
    <div class="page-header">
      <a-row justify="space-between" align="middle">
        <a-col>
          <h1 class="page-title">Permissions Management</h1>
          <p class="page-description">Manage system permissions and access control</p>
        </a-col>
        <a-col>
          <a-button 
            type="primary" 
            @click="showCreateModal = true"
            :loading="loading"
          >
            <template #icon>
              <PlusOutlined />
            </template>
            Add Permission
          </a-button>
        </a-col>
      </a-row>
    </div>

    <!-- Permissions Table -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="permissions"
        :loading="loading"
        :pagination="{
          total: permissions.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }"
        row-key="id"
      >
       <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'guard_name'">
            <a-tag :color="getGuardColor(record.guard_name)">
              {{ record.guard_name }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>
          
          <template v-if="column.key === 'updated_at'">
            {{ formatDate(record.updated_at) }}
          </template>
          
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button 
                type="text" 
                size="small"
                @click="editPermissionTyped(record)"
                :loading="actionLoading === record.id"
              >
                <template #icon>
                  <EditOutlined />
                </template>
                Edit
              </a-button>
              
              <a-popconfirm
                title="Are you sure you want to delete this permission?"
                ok-text="Yes"
                cancel-text="No"
                @confirm="deletePermission(record.id)"
              >
                <a-button 
                  type="text" 
                  danger 
                  size="small"
                  :loading="actionLoading === record.id"
                >
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                  Delete
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Create Permission Modal -->
    <a-modal
      v-model:open="showCreateModal"
      title="Create New Permission"
      :confirm-loading="modalLoading"
      @ok="handleCreatePermission"
      @cancel="resetCreateForm"
    >
      <a-form
        ref="createFormRef"
        :model="createForm"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="Permission Name" name="name">
          <a-input 
            v-model:value="createForm.name"
            placeholder="Enter permission name"
          />
        </a-form-item>
        
        <a-form-item label="Guard Name" name="guard_name">
          <a-select 
            v-model:value="createForm.guard_name"
            placeholder="Select guard name"
          >
            <a-select-option value="admin">Admin</a-select-option>
            <a-select-option value="user">User</a-select-option>
            <a-select-option value="moderator">Moderator</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Edit Permission Modal -->
    <a-modal
      v-model:open="showEditModal"
      title="Edit Permission"
      :confirm-loading="modalLoading"
      @ok="handleUpdatePermission"
      @cancel="resetEditForm"
    >
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="Permission Name" name="name">
          <a-input 
            v-model:value="editForm.name"
            placeholder="Enter permission name"
          />
        </a-form-item>
        
        <a-form-item label="Guard Name" name="guard_name">
          <a-select 
            v-model:value="editForm.guard_name"
            placeholder="Select guard name"
          >
            <a-select-option value="admin">Admin</a-select-option>
            <a-select-option value="user">User</a-select-option>
            <a-select-option value="moderator">Moderator</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import type { ColumnsType } from 'ant-design-vue/es/table'
import type { RuleObject } from 'ant-design-vue/es/form'

// Types
export interface Permission {
  id: number
  name: string
  guard_name: string
  module?: string
  created_at: string
  updated_at: string
}

export interface PermissionsResponse {
  success: boolean
  status: number
  message: string
  data: Permission[]
}

export interface CreateUpdatePermissionsResponse {
  success: boolean
  message: string
  data: Permission[]
}

export interface CreatePermissionRequest {
  name: string
  guard_name: string
}

export interface UpdatePermissionRequest {
  name: string
}

// Reactive variables
const permissions = ref<Permission[]>([])
const loading = ref(false)
const modalLoading = ref(false)
const actionLoading = ref<number | null>(null)
const error = ref<string | null>(null)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)

// Form refs
const createFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()

const editPermissionTyped = (record: Record<string, any>) => {
  editPermission(record as Permission)
}

// Form data
const createForm = ref<CreatePermissionRequest>({
  name: '',
  guard_name: ''
})

const editForm = ref<Permission>({
  id: 0,
  name: '',
  guard_name: '',
  created_at: '',
  updated_at: ''
})

// Table columns
const columns: ColumnsType<Permission> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: 'Permission Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name)
  },
  {
    title: 'Guard Name',
    dataIndex: 'guard_name',
    key: 'guard_name',
    filters: [
      { text: 'Admin', value: 'admin' },
      { text: 'User', value: 'user' },
      { text: 'Moderator', value: 'moderator' }
    ],
    onFilter: (value: string | number | boolean, record) => {
      return record.guard_name === value
    }
  },
  {
    title: 'Created At',
    dataIndex: 'created_at',
    key: 'created_at',
    sorter: (a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  },
  {
    title: 'Updated At',
    dataIndex: 'updated_at',
    key: 'updated_at',
    sorter: (a, b) => 
      new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150
  }
]


// Form validation rules
const formRules: { [k: string]: RuleObject[] } = {
  name: [
    { required: true, message: 'Please enter permission name', trigger: 'blur', type: 'string' },
    { min: 3, message: 'Permission name must be at least 3 characters', trigger: 'blur', type: 'string' }
  ],
  guard_name: [
    { required: true, message: 'Please select guard name', trigger: 'change' }
  ]
}

// Fetch permissions
const fetchPermissions = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { data } = await useFetchDataApi<PermissionsResponse>('/permissions')
    
    if (data.value?.status === 200 && Array.isArray(data.value.data)) {
      permissions.value = data.value.data
    } else {
      error.value = data.value?.message || 'Failed to fetch permissions'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch permissions'
    message.error(error.value)
  } finally {
    loading.value = false
  }
}

// Create permission
const handleCreatePermission = async () => {
  try {
    await createFormRef.value?.validate()
    modalLoading.value = true
    
    const { data } = await useFetchDataApi('/permissions', {
      method: 'POST',
      body: createForm.value
    })
    
    if (data) {
      message.success('Permission created successfully')
      showCreateModal.value = false
      resetCreateForm()
      await fetchPermissions()
    } else {
      message.error('Failed to create permission')
    }
  } catch (error: any) {
    console.error('❌ Create Error:', error)
    message.error('Failed to create permission')
  } finally {
    modalLoading.value = false
  }
}

// Edit permission
const editPermission = (record: Permission) => {
  editForm.value = { ...record }
  showEditModal.value = true
}

// Update permission
const handleUpdatePermission = async () => {
  try {
    await editFormRef.value?.validate()
    modalLoading.value = true
    
    const { data } = await useFetchDataApi(`/permissions/${editForm.value.id}`, {
      method: 'PUT',
      body: {
        name: editForm.value.name
      }
    })
    
    if (data) {
      message.success('Permission updated successfully')
      showEditModal.value = false
      resetEditForm()
      await fetchPermissions()
    } else {
      message.error('Failed to update permission')
    }
  } catch (error: any) {
    console.error('❌ Update Error:', error)
    message.error('Failed to update permission')
  } finally {
    modalLoading.value = false
  }
}

// Delete permission
const deletePermission = async (id: number) => {
  try {
    actionLoading.value = id
    
    const { data } = await useFetchDataApi(`/permissions/${id}`, {
      method: 'DELETE'
    })
    
    if (data) {
      message.success('Permission deleted successfully')
      await fetchPermissions()
    } else {
      message.error('Failed to delete permission')
    }
  } catch (error: any) {
    console.error('❌ Delete Error:', error)
    message.error('Failed to delete permission')
  } finally {
    actionLoading.value = null
  }
}

// Reset forms
const resetCreateForm = () => {
  createForm.value = {
    name: '',
    guard_name: ''
  }
  createFormRef.value?.resetFields()
}

const resetEditForm = () => {
  editForm.value = {
    id: 0,
    name: '',
    guard_name: '',
    created_at: '',
    updated_at: ''
  }
  editFormRef.value?.resetFields()
}

// Helper functions
const getGuardColor = (guardName: string): string => {
  const colors: Record<string, string> = {
    admin: 'red',
    user: 'blue',
    moderator: 'green'
  }
  return colors[guardName] || 'default'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  await fetchPermissions()
})
</script>

<style scoped>
.permissions-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.page-description {
  margin: 4px 0 0 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-btn-text) {
  padding: 4px 8px;
}

:deep(.ant-modal-body) {
  padding: 24px;
}
</style>