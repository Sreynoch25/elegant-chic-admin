<template>
    <div class="dashboard !m-2 ">
        <!-- Page Header -->
        <div class=" m-1.5 !mb-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Fashion Store Dashboard</h1>
            <p class="text-gray-600">Welcome back! Here's your fashion store performance today.</p>
            <!-- <pre>{{ JSON.stringify(dashboardData, null, 2) }}</pre > -->
        </div>

        <!-- Stats Cards -->
        <a-row :gutter="[16, 16]" class="!mb-6">
            <a-col :xs="24" :sm="12" :lg="6" v-for="stat in stats" :key="stat.key">
                <a-card :bordered="false" class="stat-card">
                    <div class="flex items-center gap-2">
                        <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
                            <component :is="stat.icon" class="text-xl" />
                        </div>
                        <div class="ml-4 flex-1">
                            <p class="text-gray-500 text-sm mb-1">{{ stat.title }}</p>
                            <h3 class="text-2xl font-bold text-gray-800">{{ stat.value }}</h3>
                            <div class="flex items-center mt-1 gap-1">
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
                        <FashionSalesChart :period="salesPeriod" :sales-overview="salesOverview" :kpis="kpis" />
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
                                <div class="w-3 h-3 rounded-full mr-3" :style="{ backgroundColor: category.color }">
                                </div>
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
                                </div>
                            </div>
                            <div class="flex text-right">
                                <p class="font-semibold text-gray-800 !mr-1">${{ order.amount }}</p>
                                <a-tag
                                    :color="order.status === 'completed' ? 'green' : order.status === 'pending' ? 'orange' : 'blue'"
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
                                <div
                                    class="w-7 h-7 !m-3 bg-gradient-to-br from-pink-200 to-purple-200 rounded flex items-center justify-center text-pink-600">
                                    <component :is="product.icon" />
                                </div>
                                <div>
                                    <p class="font-medium text-gray-800 text-sm">{{ product.name }}</p>
                                    <p class="text-xs text-gray-500">{{ product.size }} • {{ product.color }}</p>
                                </div>
                            </div>
                            <div class="text-right  !mr-3">
                                <p class="font-semibold text-red-600">{{ product.stock }} left</p>
                                <!-- <p class="text-xs text-gray-500">Min: {{ product.minStock }}</p> -->
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

<script setup lang="ts">
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
    TagOutlined,
} from '@ant-design/icons-vue'
import type { DashboardResponse, DashboardData } from '~/types/dashboard/dashboard'

definePageMeta({
    layout: 'default',
})

const salesPeriod = ref('30d')

// Color palettes
const categoryColors = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444']
const avatarColors = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981']

// Computed properties
const kpis = computed(() => {
    return dashboardData.value?.kpis || {}
})

const salesOverview = computed(() => {
    return dashboardData.value?.sales_overview || []
})

const stats = computed(() => {
    if (!dashboardData.value?.kpis) return []

    const kpisData = dashboardData.value.kpis
    type IconKey = 'dollar-sign' | 'shopping-bag' | 'users' | 'package'
    type ColorKey = 'pink' | 'purple' | 'cyan' | 'orange'

    const iconMap: Record<IconKey, Component> = {
        'dollar-sign': DollarCircleOutlined,
        'shopping-bag': ShoppingCartOutlined,
        'users': UserOutlined,
        'package': ShoppingOutlined
    }

    const colorMap: Record<ColorKey, string> = {
        pink: '#ec4899',
        purple: '#8b5cf6',
        cyan: '#06b6d4',
        orange: '#f59e0b'
    }

    return Object.entries(kpisData).map(([key, data]) => {
        const icon = iconMap[data.icon as IconKey] || DollarCircleOutlined
        const color = colorMap[data.color as ColorKey] || '#ec4899'

        return {
            key,
            title: data.label,
            value: data.value,
            change: `${data.change}%`,
            trend: data.trend,
            icon,
            color
        }
    })
})

const topCategories = computed(() => {
  if (!dashboardData.value?.top_categories) return []

  // total revenue for percentage calculation
  const totalRevenue = dashboardData.value.top_categories.reduce(
    (sum, cat) => sum + parseFloat(cat.revenue),
    0
  )

  return dashboardData.value.top_categories.map((category, index) => {
    const revenueNum = parseFloat(category.revenue)

    return {
      id: category.id,
      name: category.name,
      sales: revenueNum.toFixed(2), // match template's category.sales
      percentage: totalRevenue
        ? ((revenueNum / totalRevenue) * 100).toFixed(2)
        : 0,
      color: categoryColors[index % categoryColors.length]
    }
  })
})


const recentOrders = computed(() => {
    if (!dashboardData.value?.recent_orders) return []

    return dashboardData.value.recent_orders.slice(0, 5).map((order, index) => ({
        id: order.id,
        customer: order.customer_name,
        amount: order.amount,
        status: order.status_label,
        statusColor: order.status_color,
        date: order.date,
        orderNumber: order.order_number.split('-').pop(),
        avatarColor: avatarColors[index % avatarColors.length]
    }))
})

const lowStockProducts = computed(() => {
    if (!dashboardData.value?.low_stock_items) return []

    return dashboardData.value.low_stock_items.slice(0, 6).map(product => ({
        id: product.id,
        name: product.item_name,
        size: product.size,
        color: product.color,
        stock: product.quantity,
        status: product.status,
        statusColor: product.status_color,
        icon: TagOutlined 
    }))
})

const quickActions = computed(() => [
    {
        key: 'view-orders',
        title: 'View Orders',
        icon: EyeOutlined,
        color: '#8b5cf6',
        link: '/orders'
    },
    {
        key: 'reports',
        title: 'Reports',
        icon: FileTextOutlined,
        color: '#f59e0b',
        link: '/reports/inventory'
    },
    {
        key: 'promotions',
        title: 'Promotions',
        icon: GiftOutlined,
        color: '#10b981',
        link: '/promotions/discounts'
    },
])

const dashboardData = ref<DashboardData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const fetchDashboard = async () => {
    loading.value = true
    error.value = null

    try {
        const { data } = await useFetchDataApi<DashboardResponse>('/dashboard/overview')

        if (data.value?.status_code === 200 && data.value.data) {
            dashboardData.value = data.value.data
        } else {
            error.value = data.value?.message || 'No dashboard data returned'
            message.error(error.value)
        }
    } catch (err: any) {
        console.error('❌ Fetch Error:', err)
        error.value = 'Failed to fetch dashboard data'
        message.error(error.value)
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchDashboard()
})

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