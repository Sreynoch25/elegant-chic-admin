<template>
  <div class="dashboard !m-2 ">
    <!-- Page Header -->
    <div class=" m-1.5 !mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Fashion Store Dashboard</h1>
      <p class="text-gray-600">Welcome back! Here's your fashion store performance today.</p>
    </div>

    <!-- Stats Cards -->
    <a-row :gutter="[16, 16]" class="!mb-6">
      <a-col :xs="24" :sm="12" :lg="6" v-for="stat in stats" :key="stat.key">
        <a-card :bordered="false" class="stat-card">
          <div class="flex items-center">
            <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
              <component :is="stat.icon" class="text-xl" />
            </div>
            <div class="ml-4 flex-1">
              <p class="text-gray-500 text-sm mb-1">{{ stat.title }}</p>
              <h3 class="text-2xl font-bold text-gray-800">{{ stat.value }}</h3>
              <div class="flex items-center mt-1">
                <span :class="stat.trend === 'up' ? 'text-green-500' : 'text-red-500'" class="text-xs">
                  <arrow-up-outlined v-if="stat.trend === 'up'" />
                  <arrow-down-outlined v-else />
                  {{ stat.change }}
                </span>
                <span class="text-gray-400 text-xs ml-1">vs last month</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Charts Section -->
    <a-row :gutter="[16, 16]" class="!mb-6">
      <!-- Sales Chart -->
      <a-col :xs="24" :lg="16">
        <a-card title="Sales Overview" :bordered="false">
          <template #extra>
            <a-radio-group v-model:value="salesPeriod" size="small">
              <a-radio-button value="7d">7D</a-radio-button>
              <a-radio-button value="30d">30D</a-radio-button>
              <a-radio-button value="90d">90D</a-radio-button>
            </a-radio-group>
          </template>
          <div class="chart-container" style="height: 300px;">
            <FashionSalesChart :period="salesPeriod" />
          </div>
        </a-card>
      </a-col>

      <!-- Top Fashion Categories -->
      <a-col :xs="24" :lg="8">
        <a-card title="Top Fashion Categories" :bordered="false">
          <div class="space-y-3">
            <div v-for="category in topCategories" :key="category.name" 
                 class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-3" :style="{ backgroundColor: category.color }"></div>
                <span class="text-sm text-gray-600">{{ category.name }}</span>
              </div>
              <div class="text-right">
                <div class="font-semibold text-gray-800">${{ category.sales }}</div>
                <div class="text-xs text-gray-400">{{ category.percentage }}%</div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Recent Activity Section -->
    <a-row :gutter="[16, 16]">
      <!-- Recent Orders -->
      <a-col :xs="24" :lg="12">
        <a-card title="Recent Fashion Orders" :bordered="false">
          <template #extra>
            <NuxtLink to="/orders" class="text-pink-500 hover:text-pink-600 text-sm">View All</NuxtLink>
          </template>
          <div class="!space-y-3">
            <div v-for="order in recentOrders" :key="order.id" 
                 class="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
              <div class="flex items-center">
                <a-avatar :size="30" class="!m-3" :style="{ backgroundColor: order.avatarColor }">
                  {{ order.customer.charAt(0) }}
                </a-avatar>
                <div>
                  <p class="font-medium text-gray-800 text-sm">{{ order.customer }}</p>
                  <p class="text-xs text-gray-500">{{ order.items }} • Order #{{ order.id }}</p>
                </div>
              </div>
              <div class="flex text-right">
                <p class="font-semibold text-gray-800 !mr-1">${{ order.amount }}</p>
                <a-tag :color="order.status === 'completed' ? 'green' : order.status === 'pending' ? 'orange' : 'blue'" 
                       size="small">
                  {{ order.status }}
                </a-tag>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- Low Stock Alert -->
      <a-col :xs="24" :lg="12">
        <a-card title="Low Stock Fashion Items" :bordered="false">
          <template #extra>
            <NuxtLink to="/products" class="text-pink-500 hover:text-pink-600 text-sm">View All</NuxtLink>
          </template>
          <div class="!space-y-3">
            <div v-for="product in lowStockProducts" :key="product.id" 
                 class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div class="flex items-center">
                <div class="w-7 h-7 !m-3 bg-gradient-to-br from-pink-200 to-purple-200 rounded flex items-center justify-center text-pink-600">
                  <component :is="product.icon" />
                </div>
                <div>
                  <p class="font-medium text-gray-800 text-sm">{{ product.name }}</p>
                  <p class="text-xs text-gray-500">{{ product.size }} • {{ product.color }}</p>
                </div>
              </div>
              <div class="text-right  !mr-3">
                <p class="font-semibold text-red-600">{{ product.stock }} left</p>
                <p class="text-xs text-gray-500">Min: {{ product.minStock }}</p>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Quick Actions -->
    <div class="!mt-3">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Fashion Actions</h3>
      <a-row :gutter="[16, 16]">
        <a-col :xs="12" :sm="8" :md="6" v-for="action in quickActions" :key="action.key">
          <NuxtLink :to="action.link">
            <a-card :bordered="false" hoverable class="text-center quick-action-card">
              <div class="action-icon !mb-3" :style="{ color: action.color }">
                <component :is="action.icon" class="text-2xl" />
              </div>
              <p class="text-sm font-medium text-gray-800">{{ action.title }}</p>
            </a-card>
          </NuxtLink>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  DollarCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShoppingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  EyeOutlined,
  SettingOutlined,
  FileTextOutlined,
  GiftOutlined,
  PictureOutlined,
  CrownOutlined,
  HeartOutlined,
  TagOutlined,
  SkinOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import FashionSalesChart from '~/components/FashionSalesChart.vue'

definePageMeta({
  layout: 'default',
})

// Reactive data
const salesPeriod = ref('30d')

// Fashion-specific stats
const stats = ref([
  {
    key: 'revenue',
    title: 'Total Revenue',
    value: '$45,890',
    change: '+18.7%',
    trend: 'up',
    color: '#ec4899',
    icon: DollarCircleOutlined
  },
  {
    key: 'orders',
    title: 'Fashion Orders',
    value: '2,847',
    change: '+12.3%',
    trend: 'up',
    color: '#8b5cf6',
    icon: ShoppingCartOutlined
  },
  {
    key: 'customers',
    title: 'Style Enthusiasts',
    value: '1,245',
    change: '+25.1%',
    trend: 'up',
    color: '#06b6d4',
    icon: UserOutlined
  },
  {
    key: 'products',
    title: 'Fashion Items',
    value: '3,678',
    change: '+8.9%',
    trend: 'up',
    color: '#f59e0b',
    icon: ShoppingOutlined
  }
])

// Fashion categories
const topCategories = ref([
  { name: 'Dresses', sales: '18,945', percentage: 28, color: '#ec4899' },
  { name: 'Tops & Blouses', sales: '15,678', percentage: 23, color: '#8b5cf6' },
  { name: 'Jeans & Pants', sales: '12,234', percentage: 18, color: '#06b6d4' },
  { name: 'Shoes', sales: '9,567', percentage: 14, color: '#f59e0b' },
  { name: 'Accessories', sales: '8,123', percentage: 17, color: '#ef4444' }
])

// Fashion orders with clothing items
const recentOrders = ref([
  {
    id: 'ORD-F001',
    customer: 'Emma Watson',
    amount: '289.99',
    items: 'Floral Dress, Heels',
    status: 'completed',
    avatarColor: '#ec4899'
  },
  {
    id: 'ORD-F002',
    customer: 'Sophie Chen',
    amount: '156.50',
    items: 'Silk Blouse, Bag',
    status: 'pending',
    avatarColor: '#8b5cf6'
  },
  {
    id: 'ORD-F003',
    customer: 'Maya Johnson',
    amount: '423.75',
    items: 'Winter Coat, Boots',
    status: 'processing',
    avatarColor: '#06b6d4'
  },
  {
    id: 'ORD-F004',
    customer: 'Zara Ahmed',
    amount: '89.99',
    items: 'Denim Jacket',
    status: 'completed',
    avatarColor: '#f59e0b'
  }
])

// Fashion products with specific attributes
const lowStockProducts = ref([
  {
    id: 'PRD-F001',
    name: 'Vintage Leather Jacket',
    size: 'M',
    color: 'Black',
    stock: 3,
    minStock: 12,
    icon: SkinOutlined
  },
  {
    id: 'PRD-F002',
    name: 'Designer Handbag',
    size: 'One Size',
    color: 'Brown',
    stock: 2,
    minStock: 8,
    icon: ShoppingOutlined
  },
  {
    id: 'PRD-F003',
    name: 'Summer Maxi Dress',
    size: 'L',
    color: 'Floral',
    stock: 5,
    minStock: 15,
    icon: CrownOutlined
  },
  {
    id: 'PRD-F004',
    name: 'Statement Earrings',
    size: 'One Size',
    color: 'Gold',
    stock: 7,
    minStock: 20,
    icon: StarOutlined
  }
])

// Fashion-specific quick actions
const quickActions = ref([
  {
    key: 'add-product',
    title: 'Add Fashion Item',
    icon: PlusOutlined,
    color: '#ec4899',
    link: '/products/add'
  },
  {
    key: 'view-orders',
    title: 'View Orders',
    icon: EyeOutlined,
    color: '#8b5cf6',
    link: '/orders'
  },
  {
    key: 'collections',
    title: 'Collections',
    icon: HeartOutlined,
    color: '#06b6d4',
    link: '/collections'
  },
  {
    key: 'lookbook',
    title: 'Lookbook',
    icon: PictureOutlined,
    color: '#f59e0b',
    link: '/lookbook'
  },
  {
    key: 'size-guide',
    title: 'Size Guide',
    icon: TagOutlined,
    color: '#ef4444',
    link: '/size-guide'
  },
  {
    key: 'promotions',
    title: 'Fashion Sales',
    icon: GiftOutlined,
    color: '#10b981',
    link: '/promotions'
  },
  {
    key: 'trends',
    title: 'Trend Analysis',
    icon: StarOutlined,
    color: '#f97316',
    link: '/trends'
  },
  {
    key: 'settings',
    title: 'Store Settings',
    icon: SettingOutlined,
    color: '#6b7280',
    link: '/settings'
  }
])
</script>

<style scoped>
.stat-card {
  transition: all 0.3s;
  background: linear-gradient(135deg, #fff 0%, #fafafa 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(236, 72, 153, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chart-container {
  position: relative;
}

.quick-action-card {
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #fff 0%, #fafafa 100%);
}

.quick-action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15);
  border-color: #ec4899;
}

.action-icon {
  display: flex;
  justify-content: center;
}

/* Fashion-themed card styles */
.ant-card {
  border-radius: 12px;
  overflow: hidden;
}

.ant-card-head {
  background: linear-gradient(135deg, #fef7ff 0%, #fdf4ff 100%);
  border-bottom: 1px solid #f3e8ff;
}

.ant-card-head-title {
  font-weight: 600;
  color: #6b21a8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stat-card .stat-icon {
    width: 40px;
    height: 40px;
  }
  
  .stat-card h3 {
    font-size: 1.5rem;
  }
  
  .chart-container {
    height: 250px !important;
  }
}

@media (max-width: 576px) {
  .dashboard h1 {
    font-size: 1.5rem;
  }
  
  .quick-action-card {
    margin-bottom: 8px;
  }
  
  .action-icon {
    margin-bottom: 8px;
  }
}

/* Fashion-themed animations */
@keyframes fashionFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.ant-card {
  animation: fashionFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Gradient scrollbar */
.ant-card-body::-webkit-scrollbar {
  width: 6px;
}

.ant-card-body::-webkit-scrollbar-track {
  background: linear-gradient(135deg, #f1f1f1 0%, #e5e5e5 100%);
  border-radius: 3px;
}

.ant-card-body::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  border-radius: 3px;
}

.ant-card-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #db2777 0%, #7c3aed 100%);
}

/* Fashion color highlights */
.text-pink-500 {
  color: #ec4899 !important;
}

.text-pink-600 {
  color: #db2777 !important;
}

.hover\:text-pink-600:hover {
  color: #db2777 !important;
}
</style>