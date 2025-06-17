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
      <div class="logo p-4 h-16 flex items-center justify-center">
        <h1 class="text-white text-xl font-bold" v-if="!collapsed || (isMobile && siderVisible)">Admin</h1>
        <h1 class="text-white text-xl font-bold" v-else>AP</h1>
      </div>

      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="dashboard">
          <template #icon><dashboard-outlined /></template>
          <NuxtLink to="/">
            <span>Dashboard</span>
          </NuxtLink>
        </a-menu-item>

        <!-- Users submenu -->
        <a-sub-menu key="users">
          <template #icon><user-outlined /></template>
          <template #title>Users</template>
          <a-menu-item key="users-list">
            <NuxtLink to="/users">View All Users</NuxtLink>
          </a-menu-item>
          <a-menu-item key="users-add">
            <NuxtLink to="/users/add">Add New User</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        <!-- Products submenu -->
        <a-sub-menu key="products">
          <template #icon><shopping-outlined /></template>
          <template #title>Products</template>
          <a-menu-item key="products-list">
            <NuxtLink to="/products">All Products</NuxtLink>
          </a-menu-item>
          <a-menu-item key="products-add">
            <NuxtLink to="/products/add">Add Product</NuxtLink>
          </a-menu-item>
          <a-menu-item key="products-categories">
            <NuxtLink to="/products/categories">Categories</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        <!-- Orders submenu -->
        <a-sub-menu key="orders">
          <template #icon><shopping-cart-outlined /></template>
          <template #title>Orders</template>
          <a-menu-item key="orders-list">
            <NuxtLink to="/orders">All Orders</NuxtLink>
          </a-menu-item>
          <a-menu-item key="orders-pending">
            <NuxtLink to="/orders/pending">Pending Orders</NuxtLink>
          </a-menu-item>
          <a-menu-item key="orders-complete">
            <NuxtLink to="/orders/complete">Complete Orders</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        <!-- Reports submenu -->
        <a-sub-menu key="reports">
          <template #icon><bar-chart-outlined /></template>
          <template #title>Reports</template>
          <a-menu-item key="reports-sales">
            <NuxtLink to="/reports/sales">Sales Report</NuxtLink>
          </a-menu-item>
          <a-menu-item key="reports-inventory">
            <NuxtLink to="/reports/inventory">Inventory Report</NuxtLink>
          </a-menu-item>
        </a-sub-menu>

        <!-- Settings submenu -->
        <a-sub-menu key="settings">
          <template #icon><setting-outlined /></template>
          <template #title>Settings</template>
          <a-menu-item key="settings-general">
            <NuxtLink to="/settings/general">General Settings</NuxtLink>
          </a-menu-item>
          <a-menu-item key="settings-profile">
            <NuxtLink to="/settings/profile">Profile</NuxtLink>
          </a-menu-item>
          <a-menu-item key="settings-security">
            <NuxtLink to="/settings/security">Security</NuxtLink>
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

    <a-layout>
      <a-layout-header class="bg-white px-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
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

        <div class="flex items-center gap-4">
          <!-- Notification -->
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

          <!-- User Avatar -->
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
                <a-menu-item key="logout">Logout</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="p-4 md:p-6">
        <div class="bg-white p-4 md:p-6 rounded-md shadow-sm min-h-[calc(100vh-120px)]">
          <slot />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>

// Reactive data
const collapsed = ref(false)
const isMobile = ref(false)
const siderVisible = ref(false)
const route = useRoute()

// Computed property for selected menu keys
const selectedKeys = computed(() => {
  const path = route.path
  if (path === '/') return ['dashboard']
  if (path.startsWith('/users')) return ['users-list']
  if (path.startsWith('/products')) return ['products-list']
  if (path.startsWith('/orders')) return ['orders-list']
  if (path.startsWith('/reports')) return ['reports-sales']
  if (path.startsWith('/settings')) return ['settings-general']
  return []
})

// Methods
const handleCollapse = (collapsed) => {
  collapsed.value = collapsed
}

const handleBreakpoint = (broken) => {
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

/* Ensure proper mobile responsiveness */
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