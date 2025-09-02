<template>
  <div class="admin-users-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <UserOutlined />
          Admin Users Management
        </h1>
        <p class="page-description">Manage admin users, roles, and permissions</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" size="large" @click="showCreateModal" :icon="h(PlusOutlined)">
          Add New User
        </a-button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <a-card class="stat-card">
        <a-statistic title="Total Users" :value="users.length" :value-style="{ color: '#3f8600' }"
          :prefix="h(TeamOutlined)" />
      </a-card>
      <a-card class="stat-card">
        <a-statistic title="Active Users" :value="activeUsersCount"
          :value-style="{ color: '#1890ff' }" :prefix="h(CheckCircleOutlined)" />
      </a-card>
      <a-card class="stat-card">
        <a-statistic title="Super Admins" :value="users.filter(u => u.role === 'super_admin').length"
          :value-style="{ color: '#722ed1' }" :prefix="h(CrownOutlined)" />
      </a-card>
      <a-card class="stat-card">
        <a-statistic title="Admins" :value="users.filter(u => u.role === 'admin').length"
          :value-style="{ color: '#fa8c16' }" :prefix="h(SafetyOutlined)" />
      </a-card>
    </div>

    <!-- Users Table -->
    <a-card class="table-card">
      <template #title>
        <span class="table-title">
          <DatabaseOutlined />
          Users List
        </span>
      </template>

      <template #extra>
        <div class="table-actions">
          <a-input-search v-model:value="searchText" placeholder="Search users..." style="width: 300px"
            :suffix-icon="h(SearchOutlined)" @search="onSearch" />
          <a-button @click="refreshData" :icon="h(ReloadOutlined)">
            Refresh
          </a-button>
          <!-- Debug Button -->
          <a-button @click="debugUserData" type="dashed" :icon="h(SafetyOutlined)">
            Debug Data
          </a-button>
        </div>
      </template>

      <a-table :columns="columns" :data-source="filteredUsers" :loading="loading" :pagination="pagination" row-key="id"
        class="users-table" :scroll="{ x: 1200 }">
        <!-- Profile Image Column -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'profile_image'">
            <a-avatar :size="40" :src="record.profile_image" :icon="record.profile_image ? undefined : h(UserOutlined)"
              class="user-avatar" />
          </template>

          <!-- Role Badge Column -->
          <template v-else-if="column.key === 'role'">
            <a-tag :color="getRoleColor(record.role)" class="role-tag">
              <template #icon>
                <component :is="getRoleIcon(record.role)" />
              </template>
              {{ formatRole(record.role) }}
            </a-tag>
          </template>

          <!-- Status Column with Toggle Switch - FIXED VERSION -->
          <template v-else-if="column.key === 'is_active'">
            <div class="status-switch-container">
              <a-switch 
                :checked="normalizeBoolean(record.is_active)" 
                checked-children="Active" 
                un-checked-children="Inactive"
                @change="(checked) => toggleUserStatus(record.id)" 
                :loading="record.toggling || false"
                class="status-switch"
              />
            </div>
          </template>

          <!-- Created At Column -->
          <template v-else-if="column.key === 'created_at'">
            <div class="date-column">
              <CalendarOutlined />
              {{ formatDate(record.created_at) }}
            </div>
          </template>

          <!-- Actions Column -->
          <template v-else-if="column.key === 'actions'">
            <div class="action-buttons">
              <a-tooltip title="Edit User">
                <a-button type="text" size="small" :icon="h(EditOutlined)" @click="showEditModal(record)"
                  class="action-btn edit-btn" />
              </a-tooltip>
              <a-tooltip title="Delete User">
                <a-popconfirm title="Are you sure you want to delete this user?" ok-text="Yes" cancel-text="No"
                  @confirm="deleteUser(record.id)" placement="topRight">
                  <a-button type="text" size="small" danger :icon="h(DeleteOutlined)" class="action-btn delete-btn" />
                </a-popconfirm>
              </a-tooltip>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Create/Edit Modal -->
    <a-modal v-model:open="modalVisible" :title="modalMode === 'create' ? 'Create New User' : 'Edit User'" width="600px"
      :confirm-loading="submitting" @ok="handleSubmit" @cancel="handleCancel" class="user-modal">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical" class="user-form">
        <div class="form-grid">
          <a-form-item label="Full Name" name="name" class="form-item">
            <a-input v-model:value="formData.name" placeholder="Enter full name" :prefix="h(UserOutlined)"
              size="large" />
          </a-form-item>

          <a-form-item label="Email Address" name="email" class="form-item">
            <a-input v-model:value="formData.email" placeholder="Enter email address" :prefix="h(MailOutlined)"
              size="large" />
          </a-form-item>
        </div>

        <div class="form-grid">
          <a-form-item label="Role" name="role" class="form-item">
            <a-select v-model:value="formData.role" placeholder="Select user role" size="large" :options="roleOptions">
              <template #suffixIcon>
                <SafetyOutlined />
              </template>
            </a-select>
          </a-form-item>

          <!-- FIXED STATUS FORM ITEM -->
          <a-form-item label="Status" name="is_active" class="form-item">
            <div class="status-form-control">
              <a-switch 
                v-model:checked="formData.is_active" 
                checked-children="Active" 
                un-checked-children="Inactive"
                size="default"
                class="form-status-switch"
              />
              <span class="status-label">
                {{ formData.is_active ? 'Active' : 'Inactive' }}
              </span>
              <!-- Debug info (remove in production) -->
              <small class="debug-info">
                Form Value: {{ formData.is_active }} ({{ typeof formData.is_active }})
              </small>
            </div>
          </a-form-item>
        </div>

        <a-form-item v-if="modalMode === 'create'" label="Password" name="password" class="form-item">
          <a-input-password v-model:value="formData.password" placeholder="Enter password" :prefix="h(LockOutlined)"
            size="large" />
        </a-form-item>

        <a-form-item v-if="modalMode === 'create'" label="Confirm Password" name="password_confirmation"
          class="form-item">
          <a-input-password v-model:value="formData.password_confirmation" placeholder="Confirm password"
            :prefix="h(LockOutlined)" size="large" />
        </a-form-item>

        <a-form-item label="Profile Image" name="profile_image" class="form-item">
          <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" :custom-request="handleUpload"
            list-type="picture-card" class="profile-upload" :max-count="1" accept="image/*">
            <div v-if="fileList.length < 1">
              <PlusOutlined />
              <div style="margin-top: 8px">Upload</div>
            </div>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { message } from 'ant-design-vue'
import type { UploadFile, TableColumnProps, FormInstance } from 'ant-design-vue'
import type { Role, Response } from "~/types/roles/role";

import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StopOutlined,
  CrownOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  MailOutlined,
  LockOutlined
} from '@ant-design/icons-vue'

definePageMeta({
  layout: "default"
})

// Types
interface User {
  id: number
  name: string
  email: string
  role: string
  profile_image: string | null
  is_active: boolean  // Ensure this is always boolean
  created_at: string
  updated_at?: string
  toggling?: boolean  // Add for loading state
}

interface ApiResponse<T> {
  success: boolean
  message: string
  status_code: number
  data: T
}

interface FormData {
  id: number | null
  name: string
  email: string
  role: string
  password: string
  password_confirmation: string
  profile_image: string | null
  is_active: boolean  // Ensure this is always boolean
}

// Reactive data
const users = ref<User[]>([])
const loading = ref(false)
const submitting = ref(false)
const modalVisible = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const searchText = ref('')
const formRef = ref<FormInstance>()
const fileList = ref<UploadFile[]>([])

// Form data with proper boolean initialization
const formData = reactive<FormData>({
  id: null,
  name: '',
  email: '',
  role: '',
  password: '',
  password_confirmation: '',
  profile_image: null,
  is_active: true  // Default to true (boolean)
})

// UTILITY FUNCTIONS FOR BOOLEAN NORMALIZATION
const normalizeBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true'
  return false
}

const normalizeBooleanForAPI = (value: boolean): number | boolean => {
  // Change this based on what your API expects:
  return value ? 1 : 0  // If API expects numbers
  // return value          // If API expects booleans
}

// Enhanced computed statistics
const activeUsersCount = computed(() => {
  return users.value.filter(u => normalizeBoolean(u.is_active)).length
})

const filteredUsers = computed(() => {
  if (!searchText.value) return users.value
  return users.value.filter(user =>
    user.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.value.toLowerCase()) ||
    user.role.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// FIXED FETCH USERS WITH DATA NORMALIZATION
const fetchUsers = async () => {
  loading.value = true
  try {
    const { data } = await useFetchDataApi('/admin-users', {
      method: 'GET'
    })
    if (data.value?.success) {
      // Normalize all user data, especially is_active
      users.value = (data.value.data as any[]).map(user => ({
        ...user,
        is_active: normalizeBoolean(user.is_active), // Convert to boolean
        toggling: false // Add loading state for individual switches
      }))
      console.log('Normalized users data:', users.value.map(u => ({ 
        id: u.id, 
        name: u.name, 
        is_active: u.is_active, 
        type: typeof u.is_active 
      })))
    }
  } catch (error) {
    message.error('Failed to fetch users')
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

// FIXED TOGGLE FUNCTION WITH PROPER HANDLING
const toggleUserStatus = async (id: number, newStatus?: boolean) => {
  const user = users.value.find(u => u.id === id)
  if (!user) {
    console.error('User not found:', id)
    return
  }

  console.log('Toggling user status:', {
    userId: id,
    currentStatus: user.is_active,
    newStatus: newStatus,
    userObject: user
  })

  // Set loading state for this specific user
  user.toggling = true
  const originalStatus = user.is_active

  try {
    // If newStatus is provided (from switch change), use it. Otherwise toggle current status
    const targetStatus = newStatus !== undefined ? newStatus : !originalStatus
    
    const { data } = await useFetchDataApi(`/admin-users/${id}/toggle-status`, {
      method: 'PATCH',
      body: {
        is_active: normalizeBooleanForAPI(targetStatus)
      }
    })

    console.log('API Response:', data.value)

    if (data.value?.success) {
      // Update the user's status
      user.is_active = targetStatus
      message.success(data.value.message || `User ${targetStatus ? 'activated' : 'deactivated'} successfully`)
    } else {
      // Revert the change if API failed
      user.is_active = originalStatus
      message.error(data.value?.message || 'Failed to toggle status')
    }
  } catch (error) {
    // Revert the change on error
    user.is_active = originalStatus
    console.error('Error toggling user status:', error)
    message.error('Failed to toggle status')
  } finally {
    user.toggling = false
  }
}

// FIXED FORM SUBMISSION
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const endpoint = modalMode.value === 'create'
      ? '/admin-users'
      : `/admin-users/${formData.id}`

    const method = modalMode.value === 'create' ? 'POST' : 'PUT'

    const payload: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      is_active: normalizeBooleanForAPI(formData.is_active), // Normalize for API
      profile_image: formData.profile_image
    }

    if (modalMode.value === 'create') {
      payload.password = formData.password
      payload.password_confirmation = formData.password_confirmation
    }

    console.log('Submitting payload:', {
      ...payload,
      is_active: `${payload.is_active} (${typeof payload.is_active})`,
      profile_image: payload.profile_image ? 'Has image data' : null
    })

    const { data } = await useFetchDataApi(endpoint, {
      method,
      body: payload
    })

    if (data.value?.success) {
      message.success(data.value.message)
      modalVisible.value = false
      await fetchUsers() // Refresh and normalize data
    } else {
      message.error(data.value?.message || 'Operation failed')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    message.error('Operation failed')
  } finally {
    submitting.value = false
  }
}

// FIXED EDIT MODAL FUNCTION
const showEditModal = (user: Record<string, any>) => {
  console.log('Editing user:', user)
  
  modalMode.value = 'edit'
  
  // Normalize the data when loading into form
  formData.id = user.id as number
  formData.name = user.name as string
  formData.email = user.email as string
  formData.role = user.role as string
  formData.is_active = normalizeBoolean(user.is_active) // Normalize to boolean
  formData.profile_image = user.profile_image as string | null
  formData.password = ''
  formData.password_confirmation = ''
  
  console.log('Form data after loading:', {
    is_active: formData.is_active,
    type: typeof formData.is_active
  })
  
  if (user.profile_image) {
    fileList.value = [{
      uid: '-1',
      name: 'profile.jpg',
      status: 'done',
      url: user.profile_image
    } as UploadFile]
  } else {
    fileList.value = []
  }
  
  modalVisible.value = true
}

// FIXED TABLE COLUMNS
const columns: TableColumnProps[] = [
  {
    title: 'Avatar',
    dataIndex: 'profile_image',
    key: 'profile_image',
    width: 80,
    align: 'center' as const
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a: any, b: any) => (a.name || '').localeCompare(b.name || '')
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: (a: any, b: any) => (a.email || '').localeCompare(b.email || '')
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    filters: [
      { text: 'Super Admin', value: 'super_admin' },
      { text: 'Admin', value: 'admin' },
      { text: 'No Role', value: 'no_role' }
    ],
    onFilter: (value: string | number | boolean, record: any) => record.role === value
  },
  {
    title: 'Status',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 150,
    filters: [
      { text: 'Active', value: true },
      { text: 'Inactive', value: false }
    ],
    onFilter: (value: string | number | boolean, record: any) => {
      return normalizeBoolean(record.is_active) === Boolean(value)
    }
  },
  {
    title: 'Created At',
    dataIndex: 'created_at',
    key: 'created_at',
    sorter: (a: any, b: any) => {
      if (!a.created_at || !b.created_at) return 0
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    align: 'center' as const
  }
]

// Form validation rules with proper boolean handling
const formRules = computed(() => ({
  name: [
    { required: true, message: 'Please enter full name', type: 'string' as const },
    { min: 2, max: 50, message: 'Name must be between 2 and 50 characters', type: 'string' as const }
  ],
  email: [
    { required: true, message: 'Please enter email address', type: 'email' as const },
    { type: 'email' as const, message: 'Please enter a valid email address' }
  ],
  role: [
    { required: true, message: 'Please select a role', type: 'string' as const }
  ],
  password: [
    { required: modalMode.value === 'create', message: 'Please enter password', type: 'string' as const },
    { min: 6, message: 'Password must be at least 6 characters', type: 'string' as const }
  ],
  password_confirmation: [
    {
      required: modalMode.value === 'create' && !!formData.password,
      message: 'Please confirm password',
      type: 'string' as const
    },
    {
      validator: (_: any, value: string) => {
        if (modalMode.value === 'create' && formData.password && value !== formData.password) {
          return Promise.reject(new Error('Passwords do not match'))
        }
        return Promise.resolve()
      },
      type: 'string' as const
    }
  ],
  is_active: [
    { required: true, message: 'Please set user status', type: 'boolean' as const }
  ]
}))

// Pagination
const pagination = computed(() => ({
  current: 1,
  pageSize: 10,
  total: filteredUsers.value.length,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} of ${total} items`
}))

const roles = ref<Role[]>([])

const roleOptions = computed(() => {
  return roles.value.map(role => ({
    label: role.name,
    value: role.name
  }))
})

// DEBUGGING FUNCTION
const debugUserData = () => {
  console.log('=== USER DATA DEBUG ===')
  console.log('Total users:', users.value.length)
  console.log('Form data is_active:', formData.is_active, typeof formData.is_active)
  
  users.value.forEach((user, index) => {
    console.log(`User ${index + 1}:`, {
      id: user.id,
      name: user.name,
      is_active: user.is_active,
      type: typeof user.is_active,
      normalized: normalizeBoolean(user.is_active)
    })
  })
  
  console.log('Active users count:', activeUsersCount.value)
  message.info('Check console for debug information')
}

// Rest of your methods remain the same...
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

const showCreateModal = () => {
  modalMode.value = 'create'
  resetForm()
  modalVisible.value = true
}

const deleteUser = async (id: number) => {
  try {
    const { data } = await useFetchDataApi(`/admin-users/${id}`, {
      method: 'DELETE'
    })

    if (data.value?.success) {
      message.success(data.value.message)
      await fetchUsers()
    } else {
      message.error('Delete failed')
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    message.error('Delete failed')
  }
}

const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

const resetForm = () => {
  formData.id = null
  formData.name = ''
  formData.email = ''
  formData.role = ''
  formData.password = ''
  formData.password_confirmation = ''
  formData.profile_image = null
  formData.is_active = true  // Reset to boolean true
  fileList.value = []
  formRef.value?.resetFields()
}

const onSearch = (value: string) => {
  searchText.value = value
}

const refreshData = async () => {
  await fetchUsers()
  message.success('Data refreshed')
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('You can only upload image files!')
    return false
  }

  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('Image must be smaller than 2MB!')
    return false
  }

  return false
}

const handleUpload = (options: any) => {
  const { file, onSuccess, onError } = options

  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      formData.profile_image = result

      fileList.value = [{
        uid: file.uid || '-1',
        name: file.name || 'image.jpg',
        status: 'done',
        url: result
      } as UploadFile]

      onSuccess?.(result)
    }
    reader.onerror = (error) => {
      console.error('File reader error:', error)
      onError?.(new Error('Failed to read file'))
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Upload error:', error)
    onError?.(error)
  }
}

const formatRole = (role: string) => {
  if (role === 'no_role') return 'No Role'
  return role.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const getRoleColor = (role: string): string => {
  const colors = {
    super_admin: 'purple',
    admin: 'blue',
    no_role: 'default'
  }
  return colors[role as keyof typeof colors] || 'default'
}

const getRoleIcon = (role: string) => {
  const icons = {
    super_admin: CrownOutlined,
    admin: SafetyOutlined,
    no_role: UserOutlined
  }
  return icons[role as keyof typeof icons] || UserOutlined
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

// Declare the API function
declare function useFetchDataApi(url: string, options?: any): Promise<{
  data: Ref<ApiResponse<any> | null>
}>

onMounted(async () => {
  await fetchUsers()
  await fetchRoles()
})
</script>

<style scoped>
.admin-users-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-content h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-description {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.table-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.table-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.users-table {
  margin-top: 16px;
}

/* FIXED SWITCH STYLES */
.status-switch-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.status-switch {
  margin: 0;
}

.status-switch.ant-switch-loading {
  opacity: 0.7;
}

.debug-info {
  color: #999;
  font-size: 10px;
  font-family: monospace;
}

.user-avatar {
  border: 2px solid #f0f0f0;
}

.role-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.date-column {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #e6f7ff;
  border-color: #40a9ff;
  color: #1890ff;
}

.delete-btn:hover {
  background: #fff2f0;
  border-color: #ff7875;
  color: #ff4d4f;
}

.user-modal .ant-modal-content {
  border-radius: 12px;
}

.user-form {
  padding-top: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-item {
  margin-bottom: 24px;
}

/* FIXED FORM STATUS STYLES */
.status-form-control {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.form-status-switch {
  flex-shrink: 0;
}

.status-label {
  font-weight: 500;
  color: #1890ff;
}

.status-label:has(+ .debug-info) {
  margin-right: 8px;
}

.profile-upload {
  display: flex;
  justify-content: center;
}

.profile-upload .ant-upload-select {
  width: 120px !important;
  height: 120px !important;
  border-radius: 8px;
}

/* Switch Loading State */
.ant-switch-loading .ant-switch-handle::before {
  animation: ant-switch-loading 1s infinite linear;
}

@keyframes ant-switch-loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .admin-users-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .table-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .status-form-control {
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-content h1 {
    font-size: 24px;
  }

  .status-switch-container {
    align-items: flex-start;
  }
}
</style>