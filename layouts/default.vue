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
<!-- Navigation Menu with Better Grouping -->
<a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" theme="dark" mode="inline">
  <!-- Dashboard -->
  <a-menu-item key="dashboard">
    <template #icon><dashboard-outlined /></template>
    <NuxtLink to="/">
      <span>Dashboard</span>
    </NuxtLink>
  </a-menu-item>

  <!-- User Management -->
  <a-sub-menu key="user-management">
    <template #icon><team-outlined /></template>
    <template #title>User Management</template>
    <a-menu-item key="users-all">
      <template #icon><user-outlined /></template>
      <NuxtLink to="/users">All Users</NuxtLink>
    </a-menu-item>
    <a-menu-item key="users-customer">
      <template #icon><user-outlined /></template>
      <NuxtLink to="/users/customer">Customers</NuxtLink>
    </a-menu-item>
    <a-menu-item key="roles">
      <template #icon><safety-certificate-outlined /></template>
      <NuxtLink to="/roles">Roles & Permissions</NuxtLink>
    </a-menu-item>
    <a-menu-item key="permissions">
      <template #icon><key-outlined /></template>
      <NuxtLink to="/roles/permission">Permissions</NuxtLink>
    </a-menu-item>
  </a-sub-menu>

  <!-- Catalog Management -->
  <a-sub-menu key="catalog">
    <template #icon><appstore-outlined /></template>
    <template #title>Catalog Management</template>
    
    <!-- Products -->
    <a-sub-menu key="products">
      <template #icon><shopping-outlined /></template>
      <template #title>Products</template>
      <a-menu-item key="products-list">
        <NuxtLink to="/products">All Products</NuxtLink>
      </a-menu-item>
      <a-menu-item key="products-inventory">
        <NuxtLink to="/products/inventory">Inventory</NuxtLink>
      </a-menu-item>
    </a-sub-menu>

    <!-- Categories -->
    <a-sub-menu key="categories">
      <template #icon><folder-outlined /></template>
      <template #title>Categories</template>
      <a-menu-item key="categories-list">
        <NuxtLink to="/categories">Categories</NuxtLink>
      </a-menu-item>
      <a-menu-item key="categories-group">
        <NuxtLink to="/categories/group">Category Groups</NuxtLink>
      </a-menu-item>
    </a-sub-menu>

    <!-- Product Attributes -->
    <a-sub-menu key="attributes">
      <template #icon><tags-outlined /></template>
      <template #title>Attributes</template>
      <a-menu-item key="brands">
        <template #icon><crown-outlined /></template>
        <NuxtLink to="/brands">Brands</NuxtLink>
      </a-menu-item>
      <a-menu-item key="colors">
        <template #icon><bg-colors-outlined /></template>
        <NuxtLink to="/colors">Colors</NuxtLink>
      </a-menu-item>
      <a-menu-item key="seasons">
        <template #icon><calendar-outlined /></template>
        <NuxtLink to="/seasons">Seasons</NuxtLink>
      </a-menu-item>
      <a-sub-menu key="sizes">
        <template #icon><pic-right-outlined /></template>
        <template #title>Sizes</template>
        <a-menu-item key="size-group">
          <NuxtLink to="/sizes/group">Size Groups</NuxtLink>
        </a-menu-item>
        <a-menu-item key="sizes-list">
          <NuxtLink to="/sizes">All Sizes</NuxtLink>
        </a-menu-item>
      </a-sub-menu>
    </a-sub-menu>
  </a-sub-menu>

  <!-- Sales & Orders -->
  <a-sub-menu key="sales">
    <template #icon><shopping-cart-outlined /></template>
    <template #title>Sales & Orders</template>
    <a-menu-item key="orders-all">
      <template #icon><file-text-outlined /></template>
      <NuxtLink to="/orders">All Orders</NuxtLink>
    </a-menu-item>
    <a-menu-item key="orders-pending">
      <template #icon><clock-circle-outlined /></template>
      <NuxtLink to="/orders/pending">Pending Orders</NuxtLink>
    </a-menu-item>
    <a-menu-item key="orders-completed">
      <template #icon><check-circle-outlined /></template>
      <NuxtLink to="/orders/completed">Completed Orders</NuxtLink>
    </a-menu-item>
    <a-menu-item key="deliveries">
      <template #icon><truck-outlined /></template>
      <NuxtLink to="/deliveries">Deliveries</NuxtLink>
    </a-menu-item>
  </a-sub-menu>

  <!-- Marketing -->
  <a-sub-menu key="marketing">
    <template #icon><gift-outlined /></template>
    <template #title>Marketing</template>
    <a-menu-item key="promotions">
      <template #icon><percentage-outlined /></template>
      <NuxtLink to="/promotions/discounts">Promotions & Discounts</NuxtLink>
    </a-menu-item>
    <a-menu-item key="banners">
      <template #icon><picture-outlined /></template>
      <NuxtLink to="/banners">Banners</NuxtLink>
    </a-menu-item>
    <a-menu-item key="campaigns">
      <template #icon><mail-outlined /></template>
      <NuxtLink to="/campaigns">Email Campaigns</NuxtLink>
    </a-menu-item>
  </a-sub-menu>

  <!-- Reports & Analytics -->
  <a-sub-menu key="analytics">
    <template #icon><bar-chart-outlined /></template>
    <template #title>Reports & Analytics</template>
    <a-menu-item key="reports-sales">
      <template #icon><line-chart-outlined /></template>
      <NuxtLink to="/reports/sales">Sales Reports</NuxtLink>
    </a-menu-item>
    <a-menu-item key="reports-inventory">
      <template #icon><database-outlined /></template>
      <NuxtLink to="/reports/inventory">Inventory Reports</NuxtLink>
    </a-menu-item>
    <a-menu-item key="reports-customers">
      <template #icon><user-outlined /></template>
      <NuxtLink to="/reports/customers">Customer Analytics</NuxtLink>
    </a-menu-item>
    <a-menu-item key="reports-financial">
      <template #icon><dollar-circle-outlined /></template>
      <NuxtLink to="/reports/financial">Financial Reports</NuxtLink>
    </a-menu-item>
  </a-sub-menu>

  <!-- System Settings -->
  <a-sub-menu key="settings">
    <template #icon><setting-outlined /></template>
    <template #title>Settings</template>
    <a-menu-item key="settings-general">
      <template #icon><control-outlined /></template>
      <NuxtLink to="/settings">General Settings</NuxtLink>
    </a-menu-item>
    <a-menu-item key="settings-payment">
      <template #icon><credit-card-outlined /></template>
      <NuxtLink to="/settings/payment">Payment Settings</NuxtLink>
    </a-menu-item>
    <a-menu-item key="settings-shipping">
      <template #icon><car-outlined /></template>
      <NuxtLink to="/settings/shipping">Shipping Settings</NuxtLink>
    </a-menu-item>
    <a-menu-item key="settings-notifications">
      <template #icon><notification-outlined /></template>
      <NuxtLink to="/settings/notifications">Notifications</NuxtLink>
    </a-menu-item>
  </a-sub-menu>
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
// Updated route mapping for the improved menu structure
const routeMapping: Record<string, string> = {
  '/': 'dashboard',
  
  // User Management
  '/users': 'users-all',
  '/users/customer': 'users-customer', 
  '/roles': 'roles',
  '/roles/permission': 'permissions',
  
  // Catalog Management - Products
  '/products': 'products-list',
  '/products/inventory': 'products-inventory',
  
  // Catalog Management - Categories
  '/categories': 'categories-list',
  '/categories/group': 'categories-group',
  
  // Catalog Management - Attributes
  '/brands': 'brands',
  '/colors': 'colors', 
  '/seasons': 'seasons',
  '/sizes': 'sizes-list',
  '/sizes/group': 'size-group',
  
  // Sales & Orders
  '/orders': 'orders-all',
  '/orders/pending': 'orders-pending',
  '/orders/completed': 'orders-completed', 
  '/deliveries': 'deliveries',
  
  // Marketing
  '/promotions/discounts': 'promotions',
  '/banners': 'banners',
  '/campaigns': 'campaigns',
  
  // Reports & Analytics
  '/reports/sales': 'reports-sales',
  '/reports/inventory': 'reports-inventory',
  '/reports/customers': 'reports-customers',
  '/reports/financial': 'reports-financial',
  
  // Settings
  // '/settings': 'settings-general',
  // '/settings/payment': 'settings-payment', 
  // '/settings/shipping': 'settings-shipping',
  // '/settings/notifications': 'settings-notifications'
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
  if (loginStore.isSpinning) return

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

    if (data.value?.data) {
      await fetchAdminProfile()
      const updatedProfile = data.value.data
     
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