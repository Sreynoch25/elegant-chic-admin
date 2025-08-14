<template>
  <a-layout class="min-h-screen">
    <!-- Responsive Sider with mobile handling -->
    <a-layout-sider 
      :collapsed="isMobile || collapsed" 
      collapsible 
      :trigger="null" 
      :breakpoint="'lg'"
      @collapse="handleCollapse" 
      @breakpoint="handleBreakpoint" 
      :class="{ 'mobile-sider': isMobile && siderVisible }"
    >
      <!-- Logo Section -->
      <div class="logo p-4 h-16 flex items-center justify-center">
        <h1 
          class="text-white text-xl font-bold" 
          v-if="!collapsed || (isMobile && siderVisible)"
        >
          Admin
        </h1>
        <h1 class="text-white text-xl font-bold" v-else>AP</h1>
      </div>

      <!-- Navigation Menu -->
      <a-menu 
        v-model:selectedKeys="selectedKeys" 
        v-model:openKeys="openKeys" 
        theme="dark" 
        mode="inline"
      >
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
      </a-menu>
    </a-layout-sider>

    <!-- Mobile overlay backdrop when sidebar is open -->
    <div 
      v-if="isMobile && siderVisible" 
      class="fixed inset-0 bg-black bg-opacity-50 z-10"
      @click="siderVisible = false"
    ></div>

    <!-- Main Layout -->
    <a-layout>
      <!-- Header -->
      <a-layout-header class="bg-white px-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <!-- Left Header Content -->
        <div class="flex items-center">
          <menu-unfold-outlined 
            v-if="isMobile ? !siderVisible : collapsed" 
            class="trigger text-xl mr-4 cursor-pointer"
            @click="toggleSider" 
          />
          <menu-fold-outlined 
            v-else 
            class="trigger text-xl mr-4 cursor-pointer" 
            @click="toggleSider" 
          />
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
                <a-menu-item key="profile">
                  <NuxtLink to="/settings/profile">Profile</NuxtLink>
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
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginStore } from '~/stores/login/loginStore';

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
</style>