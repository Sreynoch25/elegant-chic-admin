<template>
  <div class="permissions-admin">
    <div class="page-header">
      <h1 class="page-title">Permissions Management</h1>
      <a-button type="primary" @click="showCreateModal" :loading="loading">
        <template #icon>
          <PlusOutlined />
        </template>
        Add Permission
      </a-button>
    </div>

    <!-- Statistics Cards -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="Total Permissions" :value="totalPermissions" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="View Permissions" :value="permissions.view?.length || 0" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="Manage Permissions" :value="permissions.manage?.length || 0" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic title="Create Permissions" :value="permissions.create?.length || 0" />
        </a-card>
      </a-col>
    </a-row>

    <!-- Permissions Tables by Category -->
    <div class="permissions-content">
      <a-tabs v-model:activeKey="activeTab" type="card">
        <a-tab-pane v-for="(permList, category) in permissions" :key="category" :tab="capitalize(category)">
          <a-table
            :columns="columns"
            :data-source="permList"
            :loading="loading"
            :pagination="{ pageSize: 10 }"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <a-tag color="blue">{{ record.name }}</a-tag>
              </template>
              <template v-else-if="column.key === 'guard_name'">
                <a-badge :text="record.guard_name" color="green" />
              </template>
              <template v-else-if="column.key === 'created_at'">
                {{ formatDate(record.created_at) }}
              </template>
              <template v-else-if="column.key === 'updated_at'">
                {{ formatDate(record.updated_at) }}
              </template>
              <template v-else-if="column.key === 'actions'">
                <a-space>
                  <a-button type="primary" size="small" @click="editPermission(record)">
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
                    <a-button type="primary" danger size="small">
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
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- Create/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? 'Edit Permission' : 'Create Permission'"
      :confirm-loading="submitting"
      @ok="handleSubmit"
      @cancel="resetModal"
    >
      <a-form :model="form" layout="vertical" ref="formRef">
        <a-form-item
          label="Permission Name"
          name="name"
          :rules="[{ required: true, message: 'Please enter permission name!' }]"
        >
          <a-input v-model:value="form.name" placeholder="e.g., view products" />
        </a-form-item>
        <a-form-item label="Guard Name" name="guard_name">
          <a-select v-model:value="form.guard_name" placeholder="Select guard">
            <a-select-option value="admin">Admin</a-select-option>
            <a-select-option value="user">User</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'

interface Permission {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

interface PermissionsResponse {
  success: boolean
  message: string
  status_code: number
  data: {
    manage: Permission[]
    view: Permission[]
    create: Permission[]
    edit: Permission[]
    delete: Permission[]
    update: Permission[]
    export: Permission[]
  }
}

interface ApiResponse<T = any> {
  success: boolean
  message: string
  status_code: number
  data?: T
}

interface PermissionForm {
  name: string
  guard_name: string
}

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const activeTab = ref('view')
const formRef = ref()
const editingId = ref<number | null>(null)

const permissions = reactive<Record<string, Permission[]>>({
  manage: [],
  view: [],
  create: [],
  edit: [],
  delete: [],
  update: [],
  export: []
})

const form = reactive<PermissionForm>({
  name: '',
  guard_name: 'admin'
})

// Computed
const totalPermissions = computed(() => {
  return Object.values(permissions).reduce((total, list) => total + list.length, 0)
})

// Table columns
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Guard',
    dataIndex: 'guard_name',
    key: 'guard_name',
    width: 120
  },
  {
    title: 'Created At',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 150
  },
  {
    title: 'Updated At',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 150
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150
  }
]

// API functions
const fetchPermissions = async () => {
  loading.value = true
  try {
    const { data } = await useFetchDataApi<PermissionsResponse>('/roles/permissions/all')
    
    // Access the actual response data from the reactive ref
    const response = unref(data)
    
    if (response && response.success) {
      Object.assign(permissions, response.data)
    } else {
      message.error('Failed to fetch permissions')
    }
  } catch (error) {
    console.error('Error fetching permissions:', error)
    message.error('Error fetching permissions')
  } finally {
    loading.value = false
  }
}

const createPermission = async (formData: PermissionForm) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse<Permission>>('/permissions', {
      method: 'POST',
      body: formData
    })
    
    // Access the actual response data from the reactive ref
    const response = unref(data)
    
    if (response && response.success) {
      message.success('Permission created successfully')
      await fetchPermissions()
      return true
    } else {
      message.error(response?.message || 'Failed to create permission')
      return false
    }
  } catch (error) {
    console.error('Error creating permission:', error)
    message.error('Error creating permission')
    return false
  }
}

const updatePermission = async (id: number, formData: PermissionForm) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse<Permission>>(`/permissions/${id}`, {
      method: 'PUT',
      body: formData
    })
    
    // Access the actual response data from the reactive ref
    const response = unref(data)
    
    if (response && response.success) {
      message.success('Permission updated successfully')
      await fetchPermissions()
      return true
    } else {
      message.error(response?.message || 'Failed to update permission')
      return false
    }
  } catch (error) {
    console.error('Error updating permission:', error)
    message.error('Error updating permission')
    return false
  }
}

const deletePermission = async (id: number) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/permissions/${id}`, {
      method: 'DELETE'
    })
    
    // Access the actual response data from the reactive ref
    const response = unref(data)
    
    if (response && response.success) {
      message.success('Permission deleted successfully')
      await fetchPermissions()
    } else {
      message.error(response?.message || 'Failed to delete permission')
    }
  } catch (error) {
    console.error('Error deleting permission:', error)
    message.error('Error deleting permission')
  }
}

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Modal functions
const showCreateModal = () => {
  isEdit.value = false
  modalVisible.value = true
  resetForm()
}

const editPermission = (record: Record<string, any>) => {
  // Type guard function to check if record has all required Permission properties
  const isValidPermission = (obj: any): obj is Permission => {
    return obj && 
           typeof obj.id === 'number' &&
           typeof obj.name === 'string' &&
           typeof obj.guard_name === 'string' &&
           typeof obj.created_at === 'string' &&
           typeof obj.updated_at === 'string'
  }
  
  if (!isValidPermission(record)) {
    console.error('Invalid permission object:', record)
    message.error('Invalid permission data')
    return
  }
  
  isEdit.value = true
  editingId.value = record.id
  form.name = record.name
  form.guard_name = record.guard_name
  modalVisible.value = true
}

const resetModal = () => {
  modalVisible.value = false
  resetForm()
  editingId.value = null
  isEdit.value = false
}

const resetForm = () => {
  form.name = ''
  form.guard_name = 'admin'
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    
    let success = false
    if (isEdit.value && editingId.value) {
      success = await updatePermission(editingId.value, form)
    } else {
      success = await createPermission(form)
    }
    
    if (success) {
      resetModal()
    }
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchPermissions()
})
</script>

<style scoped>
.permissions-admin {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.permissions-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.ant-tabs-card .ant-tabs-tab) {
  border-radius: 6px 6px 0 0;
  background: #fafafa;
  border-color: #d9d9d9;
}

:deep(.ant-tabs-card .ant-tabs-tab-active) {
  background: white;
  border-bottom-color: white;
}

:deep(.ant-table-thead > tr > th) {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

:deep(.ant-btn-primary) {
  background: #1890ff;
  border-color: #1890ff;
  border-radius: 6px;
}

:deep(.ant-btn-primary:hover) {
  background: #40a9ff;
  border-color: #40a9ff;
}

:deep(.ant-modal .ant-modal-header) {
  border-radius: 6px 6px 0 0;
}

:deep(.ant-modal .ant-modal-content) {
  border-radius: 6px;
}

:deep(.ant-tag) {
  border-radius: 4px;
  font-weight: 500;
}

:deep(.ant-badge) {
  font-weight: 500;
}

:deep(.ant-statistic-title) {
  color: #8c8c8c;
  font-size: 14px;
  margin-bottom: 4px;
}

:deep(.ant-statistic-content) {
  color: #1890ff;
  font-size: 24px;
  font-weight: 600;
}
</style>