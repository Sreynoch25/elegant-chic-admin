<template>
  <a-layout class="min-h-screen">
    <!-- Responsive Sider with mobile handling -->
    <a-layout-sider :collapsed="isMobile || collapsed" collapsible :trigger="null" :breakpoint="'lg'"
      @collapse="handleCollapse" @breakpoint="handleBreakpoint" :class="{ 'mobile-sider': isMobile && siderVisible }">
      <!-- Logo Section -->
      <div class="logo p-4 h-16 flex items-center justify-center">
        <h1 class="text-white text-xl font-bold" v-if="!collapsed || (isMobile && siderVisible)">
          Admin
        </h1>
        <h1 class="text-white text-xl font-bold" v-else>AP</h1>
      </div>

      <!-- Navigation Menu -->
      <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" theme="dark" mode="inline">
        <!-- Dashboard -->
        <a-menu-item key="dashboard">
          <template #icon><dashboard-outlined /></template>
          <NuxtLink to="/">
            <span>Dashboard</span>
          </NuxtLink>
        </a-menu-item>

        <!-- Users Management -->
        <a-sub-menu key="users">
          <template #icon><user-outlined /></template>
          <template #title>Users</template>
          <a-menu-item key="users-list">
            <NuxtLink to="/users">All Users</NuxtLink>
          </a-menu-item>
          <a-menu-item key="users-customer">
            <NuxtLink to="/users/customer">All Customers</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        <!-- Roles & Permissions -->
        <a-sub-menu key="roles">
          <template #icon><team-outlined /></template>
          <template #title>Roles</template>
          <a-menu-item key="role-list">
            <NuxtLink to="/roles">View All Roles</NuxtLink>
          </a-menu-item>
          <a-menu-item key="permission-list">
            <NuxtLink to="/roles/permission">View All Permissions</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        <!-- Delivery Management -->
        <a-menu-item key="deliveries">
          <template #icon><truck-outlined /></template>
          <NuxtLink to="/deliveries">
            <span>Deliveries</span>
          </NuxtLink>
        </a-menu-item>

        <!-- Categories Management -->
        <a-sub-menu key="categories">
          <template #icon><appstore-outlined /></template>
          <template #title>Categories</template>
          <a-menu-item key="categories-list">
            <NuxtLink to="/categories">Categories</NuxtLink>
          </a-menu-item>
          <a-menu-item key="categories-group">
            <NuxtLink to="/categories/group">Categories Group</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        <!-- Sizes Management -->
        <a-sub-menu key="sizes">
          <template #icon><pic-right-outlined /></template>
          <template #title>Sizes</template>
          <a-menu-item key="size-group">
            <NuxtLink to="/sizes/group">Size Group</NuxtLink>
          </a-menu-item>
          <a-menu-item key="sizes-list">
            <NuxtLink to="/sizes">Sizes</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        <!-- Brands Management -->
        <a-menu-item key="brands">
          <template #icon><crown-outlined /></template>
          <NuxtLink to="/brands">
            <span>Brands</span>
          </NuxtLink>
        </a-menu-item>

        <!-- Promotions -->
        <a-sub-menu key="promotions">
          <template #icon><gift-outlined /></template>
          <template #title>Promotions</template>
          <a-menu-item key="discounts">
            <NuxtLink to="/promotions/discounts">Discounts</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        <!-- Banners -->
        <a-menu-item key="banners">
          <template #icon><picture-outlined /></template>
          <NuxtLink to="/banners">
            <span>Banners</span>
          </NuxtLink>
        </a-menu-item>

        <!-- Seasons -->
        <a-menu-item key="seasons">
          <template #icon><calendar-outlined /></template>
          <NuxtLink to="/seasons">
            <span>Seasons</span>
          </NuxtLink>
        </a-menu-item>

        <!-- Colors -->
        <a-menu-item key="colors">
          <template #icon><bg-colors-outlined /></template>
          <NuxtLink to="/colors">
            <span>Colors</span>
          </NuxtLink>
        </a-menu-item>

        <!-- Products Management -->
        <a-sub-menu key="products">
          <template #icon><shopping-outlined /></template>
          <template #title>Products</template>
          <a-menu-item key="products-list">
            <NuxtLink to="/products">All Products</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        <!-- Orders Management -->
        <a-sub-menu key="orders">
          <template #icon><shopping-cart-outlined /></template>
          <template #title>Orders</template>
          <a-menu-item key="orders-list">
            <NuxtLink to="/orders">All Orders</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        <!-- Reports -->
        <a-sub-menu key="reports">
          <template #icon><bar-chart-outlined /></template>
          <template #title>Reports</template>
          <a-menu-item key="reports-inventory">
            <NuxtLink to="/reports/inventory">Inventory Report</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        {{ adminProfile }}
      </a-menu>
    </a-layout-sider>

    <!-- Mobile overlay backdrop when sidebar is open -->
    <div v-if="isMobile && siderVisible" class="fixed inset-0 bg-black bg-opacity-50 z-10"
      @click="siderVisible = false">
    </div>

    <!-- Main Layout -->
    <a-layout>
      <!-- Header -->
      <a-layout-header class="bg-white px-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <!-- Left Header Content -->
        <div class="flex items-center">
          <menu-unfold-outlined v-if="isMobile ? !siderVisible : collapsed" class="trigger text-xl mr-4 cursor-pointer"
            @click="toggleSider" />
          <menu-fold-outlined v-else class="trigger text-xl mr-4 cursor-pointer" @click="toggleSider" />
          <h1 class="text-lg font-medium md:text-xl lg:hidden">Admin Panel</h1>
        </div>

        <!-- Right Header Content -->
        <div class="flex items-center gap-4">
          <!-- Notification Dropdown -->
          <a-dropdown placement="bottomRight">
            <a-badge dot>
              <bell-outlined class="text-xl cursor-pointer" />
            </a-badge>
            <template #overlay>
              <a-menu>
                <a-menu-item key="notification-1">
                  <div class="py-1">
                    <div class="font-medium">New Order Received</div>
                    <div class="text-xs text-gray-500">5 minutes ago</div>
                  </div>
                </a-menu-item>
                <a-menu-item key="notification-2">
                  <div class="py-1">
                    <div class="font-medium">Low Stock Alert</div>
                    <div class="text-xs text-gray-500">1 hour ago</div>
                  </div>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- User Avatar Dropdown -->
          <a-dropdown>
            <a-avatar class="cursor-pointer bg-blue-500">
              <template #icon><user-outlined /></template>
            </a-avatar>

            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="showProfile">
                  <a-spin :spinning="loading" size="small">
                    Profile
                  </a-spin>
                </a-menu-item>

                <a-menu-item key="settings">
                  <NuxtLink to="/settings">Settings</NuxtLink>
                </a-menu-item>

                <a-menu-divider />

                <a-menu-item key="logout" @click="handleLogout">
                  <logout-outlined class="mr-2" />
                  {{ loginStore.isSpinning ? 'Logging out...' : 'Logout' }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- Profile Dialog -->
      <a-modal v-model:open="profileModalVisible" title="Admin Profile" :footer="null" width="500px" centered>
        <div v-if="adminProfile" class="profile-content">
          <!-- Profile Image Section -->
          <div class="profile-image-section">
            <div class="image-container">
              <a-avatar :src="profileImageUrl" :size="100" class="profile-avatar">
                {{ getAdminInitials(adminProfile) }}
              </a-avatar>
              <div class="image-overlay" @click="handleImageUpload">
                <CameraOutlined class="camera-icon" />
              </div>
            </div>
            <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onImageChange" />
          </div>

          <!-- Profile Information -->
          <a-descriptions :column="1" bordered class="profile-details">

            <a-descriptions-item label="Name">
              <div class="profile-name">
                {{ adminProfile.name }}
              </div>
            </a-descriptions-item>

            <a-descriptions-item label="Email">
              <div class="profile-email">
                <MailOutlined class="email-icon" />
                {{ adminProfile.email }}
              </div>
            </a-descriptions-item>

            <a-descriptions-item label="Role">
              <a-tag :color="getRoleColor(adminProfile.roles)" class="role-tag">
                {{ formatRole(adminProfile.roles) }}
              </a-tag>
            </a-descriptions-item>

            <a-descriptions-item label="Status">
              <a-badge :status="adminProfile.is_active ? 'success' : 'error'"
                :text="adminProfile.is_active ? 'Active' : 'Inactive'" />
            </a-descriptions-item>

            <a-descriptions-item label="Created">
              <div class="date-info">
                <CalendarOutlined class="date-icon" />
                {{ formatDate(adminProfile.created_at) }}
              </div>
            </a-descriptions-item>

            <a-descriptions-item label="Last Updated">
              <div class="date-info">
                <ClockCircleOutlined class="date-icon" />
                {{ formatDate(adminProfile.updated_at) }}
              </div>
            </a-descriptions-item>
          </a-descriptions>

          <!-- Action Buttons -->
          <div class="profile-actions">
            <a-button type="primary" @click="editProfile" :loading="updateLoading">
              <EditOutlined />
              Edit Profile
            </a-button>
            <a-button @click="refreshProfile" :loading="loading">
              <ReloadOutlined />
              Refresh
            </a-button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="loading-container">
          <a-spin size="large" />
          <p>Loading profile...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <a-result status="error" title="Failed to Load Profile" :sub-title="error">
            <template #extra>
              <a-button type="primary" @click="fetchAdminProfile">
                Try Again
              </a-button>
            </template>
          </a-result>
        </div>
      </a-modal>

      <!-- Edit Profile Modal -->
      <a-modal v-model:open="editModalVisible" title="Edit Profile" :confirm-loading="updateLoading" @ok="updateProfile"
        @cancel="cancelEdit" width="400px">
        <a-form ref="formRef" :model="editForm" :rules="formRules" layout="vertical">
          <a-form-item label="Name" name="name">
            <a-input v-model:value="editForm.name" placeholder="Enter your name" />
          </a-form-item>

          <a-form-item label="Email" name="email">
            <a-input v-model:value="editForm.email" placeholder="Enter your email" />
          </a-form-item>
        </a-form>
      </a-modal>

      <!-- Main Content -->
      <a-layout-content class="p-4 md:p-6 h-[calc(100vh-64px)] overflow-hidden">
        <div class="bg-white p-4 md:p-6 rounded-md shadow-sm h-full overflow-y-auto">
          <slot />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginStore } from '~/stores/login/loginStore';
import type { FormInstance } from 'ant-design-vue'

// Reactive state
const collapsed = ref(false)
const isMobile = ref(false)
const siderVisible = ref(false)
const openKeys = ref<string[]>([])

// Store and router instances
const route = useRoute()
const loginStore = useLoginStore()

// Menu selection logic
const selectedKeys = computed(() => {
  const path = route.path

  // Route to menu key mapping
  const routeMapping: Record<string, string> = {
    '/': 'dashboard',
    '/users': 'users-list',
    '/users/customer': 'users-customer',
    '/roles': 'role-list',
    '/roles/permission': 'permission-list',
    '/categories': 'categories-list',
    '/categories/group': 'categories-group',
    '/sizes': 'sizes-list',
    '/sizes/group': 'size-group',
    '/promotions/discounts': 'discounts',
    '/products': 'products-list',
    '/orders': 'orders-list',
    '/reports/inventory': 'reports-inventory',
    '/settings/profile': 'profile',
    '/settings': 'settings'
  }

  // Check for exact matches first
  if (routeMapping[path]) {
    return [routeMapping[path]]
  }

  // Check for path prefixes
  if (path.startsWith('/deliveries')) return ['deliveries']
  if (path.startsWith('/brands')) return ['brands']
  if (path.startsWith('/banners')) return ['banners']
  if (path.startsWith('/seasons')) return ['seasons']
  if (path.startsWith('/colors')) return ['colors']

  return []
})

// Auto-expand parent menus when child items are selected
watch(selectedKeys, (newKeys) => {
  if (newKeys.length > 0) {
    const key = newKeys[0]

    // Menu hierarchy mapping
    const menuHierarchy: Record<string, string> = {
      'categories-list': 'categories',
      'categories-group': 'categories',
      'sizes-list': 'sizes',
      'size-group': 'sizes',
      'discounts': 'promotions',
      'users-list': 'users',
      'users-customer': 'users',
      'role-list': 'roles',
      'permission-list': 'roles',
      'products-list': 'products',
      'orders-list': 'orders',
      'reports-inventory': 'reports'
    }

    const parentKey = menuHierarchy[key]
    if (parentKey && !openKeys.value.includes(parentKey)) {
      openKeys.value = [...openKeys.value, parentKey]
    }
  }
}, { immediate: true })

// Event handlers
const handleCollapse = (isCollapsed: boolean) => {
  collapsed.value = isCollapsed
}

const handleBreakpoint = (broken: boolean) => {
  isMobile.value = broken
  if (broken) {
    collapsed.value = false
    siderVisible.value = false
  }
}

const toggleSider = () => {
  if (isMobile.value) {
    siderVisible.value = !siderVisible.value
  } else {
    collapsed.value = !collapsed.value
  }
}

// Logout functionality using Pinia store
const handleLogout = async () => {
  if (loginStore.isSpinning) return // Prevent multiple logout attempts

  try {
    await loginStore.fetchLogout()
    message.success('Logged out successfully')
  } catch (error) {
    console.error('Logout error:', error)
    message.error('Failed to logout. Please try again.')
  }
}

export interface AdminProfileResponse {
  status: number
  message: string
  data: AdminProfile
}

export interface AdminProfile {
  id: number
  name: string
  email: string
  roles: string
  profile_image: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Reactive variables
const adminProfile = ref<AdminProfile | null>(null)
const loading = ref(false)
const updateLoading = ref(false)
const error = ref<string | null>(null)
const profileModalVisible = ref(false)
const editModalVisible = ref(false)
const fileInput = ref<HTMLInputElement>()
const formRef = ref<FormInstance>()

// Cache-busted image URL to prevent browser caching issues
const profileImageUrl = computed(() => {
  if (!adminProfile.value?.profile_image) return undefined
  // Add timestamp to prevent caching issues
  const timestamp = Date.now()
  const baseUrl = adminProfile.value.profile_image
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}v=${timestamp}`
})

// Edit form
const editForm = reactive({
  name: '',
  email: ''
})

const formRules = {
  name: [
    { required: true, message: 'Please input your name!' },
    { min: 2, message: 'Name must be at least 2 characters!' }
  ],
  email: [
    { required: true, message: 'Please input your email!' },
    { type: 'email' as const, message: 'Please input a valid email!' }
  ]
}

// Fetch admin profile - corrected to handle single object response
const fetchAdminProfile = async () => {
  loading.value = true
  error.value = null

  try {
    const { data } = await useFetchDataApi<AdminProfileResponse>('/profile')

    if (data.value?.status === 200 && data.value.data) {
      adminProfile.value = data.value.data
    } else {
      error.value = data.value?.message || 'Failed to fetch profile'
      message.error(error.value)
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Failed to fetch admin profile'
    message.error(error.value)
  } finally {
    loading.value = false
  }
}

// Show profile dialog
const showProfile = async () => {
  profileModalVisible.value = true
  if (!adminProfile.value) {
    await fetchAdminProfile()
  }
}

// Refresh profile
const refreshProfile = async () => {
  await fetchAdminProfile()
}

// Edit profile functions
const editProfile = () => {
  if (adminProfile.value) {
    editForm.name = adminProfile.value.name
    editForm.email = adminProfile.value.email
    editModalVisible.value = true
  }
}

const updateProfile = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validateFields()
    updateLoading.value = true

    const formData = new FormData()
    formData.append('_method', 'PUT')
    formData.append('name', editForm.name)
    formData.append('email', editForm.email)

    const { data } = await useFetchDataApi<AdminProfileResponse>('/profile', {
      method: 'POST',
      body: formData
    })
console.log("data.value?.status=================", data.value?.status, "--------", data);
    if (data.value?.data) {
      await fetchAdminProfile()
      message.success('Profile updated successfully!')
      editModalVisible.value = false
    } else {
      message.error(data.value?.message || 'Failed to update profile')
    }
  } catch (err: any) {
    console.error('❌ Update Error:', err)
    message.error('Failed to update profile')
  } finally {
    updateLoading.value = false
  }
}


const cancelEdit = () => {
  editModalVisible.value = false
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// Image upload functions
const handleImageUpload = () => {
  fileInput.value?.click()
}

const onImageChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    message.error('Please select an image file!')
    return
  }

  // Validate file size (e.g., 5MB)
  if (file.size > 5 * 1024 * 1024) {
    message.error('Image size must be less than 5MB!')
    return
  }

  try {
    updateLoading.value = true

    const formData = new FormData()
    formData.append('_method', 'PUT')
    formData.append('profile_image', file)

    const { data } = await useFetchDataApi<AdminProfileResponse>('/profile', {
      method: 'POST',
      body: formData
    })

    if (data.value?.status === 200) {
      await fetchAdminProfile()
      const updatedProfile = data.value.data
      adminProfile.value = null 
      await nextTick()
      adminProfile.value = updatedProfile

      message.success('Profile image updated successfully!')
    } else {
      message.error(data.value?.message || 'Failed to update profile image')
    }
  } catch (err: any) {
    console.error('❌ Image Upload Error:', err)
    message.error('Failed to update profile image')
  } finally {
    updateLoading.value = false
    // Clear the input
    if (target) target.value = ''
  }
}

// Utility functions
const getAdminInitials = (profile: AdminProfile) => {
  return profile.name.charAt(0).toUpperCase()
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    'super_admin': 'red',
    'admin': 'blue',
    'manager': 'green',
    'user': 'default'
  }
  return colors[role] || 'default'
}

const formatRole = (role: string) => {
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Load profile on component mount
onMounted(async () => {
  await fetchAdminProfile()
})
</script>

<style scoped>
.trigger {
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.mobile-sider {
  position: fixed !important;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 20;
}

@media (max-width: 1024px) {
  .ant-layout-sider {
    position: fixed !important;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 20;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .ant-layout-sider:not(.ant-layout-sider-collapsed) {
    transform: translateX(0);
  }
}

.admin-profile-container {
  display: inline-block;
}

.profile-content {
  padding: 8px 0;
}

.profile-image-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.image-container {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 36px;
  font-weight: bold;
  color: white;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-overlay {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #1890ff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.image-overlay:hover {
  background: #40a9ff;
  transform: scale(1.1);
}

.camera-icon {
  color: white;
  font-size: 14px;
}

.profile-details {
  margin-bottom: 24px;
}

.profile-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.profile-email {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #595959;
}

.email-icon {
  color: #1890ff;
}

.role-tag {
  font-weight: 500;
  text-transform: capitalize;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8c8c8c;
  font-size: 14px;
}

.date-icon {
  color: #bfbfbf;
}

.profile-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.loading-container p {
  margin-top: 16px;
  margin-bottom: 0;
}

.error-container {
  padding: 20px 0;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 600;
  background-color: #fafafa;
}

:deep(.ant-descriptions-item-content) {
  background-color: #fff;
}

:deep(.ant-modal-header) {
  border-radius: 8px 8px 0 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

:deep(.ant-modal-header .ant-modal-title) {
  color: white;
  font-weight: 600;
}

:deep(.ant-modal-close) {
  color: white;
}

:deep(.ant-modal-close:hover) {
  color: #f0f0f0;
}

:deep(.ant-badge-status-text) {
  font-weight: 500;
}
</style>