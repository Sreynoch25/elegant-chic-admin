<template>
  <div>
    <a-page-header title="Orders" subtitle="Manage product Orders">
      <template #extra>
        <div style="display: flex; gap: 8px;">
          <a-button @click="handleRefresh" :loading="loading">
            <template #icon><ReloadOutlined /></template>
            Refresh
          </a-button>
        </div>
      </template>
    </a-page-header>

    <!-- Enhanced Filter Section -->
    <a-card class="filter-card" style="margin-bottom: 16px;">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <!-- Search Input -->
          <a-col :xs="24" :sm="12" :md="6" :lg="6" :xl="4">
            <a-form-item label="Search" style="margin-bottom: 0;">
              <a-input
                v-model:value="filters.search"
                placeholder="Order #, Customer name, Email"
                allow-clear
                @pressEnter="handleSearch"
                @input="debouncedSearch"
              >
                <template #prefix>
                  <SearchOutlined />
                </template>
              </a-input>
            </a-form-item>
          </a-col>

          <!-- Order Status Filter -->
          <a-col :xs="24" :sm="12" :md="6" :lg="6" :xl="4">
            <a-form-item label="Order Status" style="margin-bottom: 0;">
              <a-select
                v-model:value="filters.status"
                placeholder="All Statuses"
                allow-clear
                @change="handleSearch"
              >
                <a-select-option value="pending">
                  <a-tag color="orange" size="small">Pending</a-tag>
                </a-select-option>
                <a-select-option value="accepted">
                  <a-tag color="blue" size="small">Accepted</a-tag>
                </a-select-option>
                <a-select-option value="preparing">
                  <a-tag color="cyan" size="small">Preparing</a-tag>
                </a-select-option>
                <a-select-option value="on_delivery">
                  <a-tag color="purple" size="small">On Delivery</a-tag>
                </a-select-option>
                <a-select-option value="completed">
                  <a-tag color="green" size="small">Completed</a-tag>
                </a-select-option>
                <a-select-option value="cancelled">
                  <a-tag color="red" size="small">Cancelled</a-tag>
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <!-- Payment Status Filter -->
          <a-col :xs="24" :sm="12" :md="6" :lg="6" :xl="4">
            <a-form-item label="Payment Status" style="margin-bottom: 0;">
              <a-select
                v-model:value="filters.paymentStatus"
                placeholder="All Payments"
                allow-clear
                @change="handleSearch"
              >
                <a-select-option value="pending">
                  <a-tag color="orange" size="small">Pending</a-tag>
                </a-select-option>
                <a-select-option value="completed">
                  <a-tag color="green" size="small">Completed</a-tag>
                </a-select-option>
                <a-select-option value="failed">
                  <a-tag color="red" size="small">Failed</a-tag>
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <!-- Date Range Filter -->
          <a-col :xs="24" :sm="12" :md="6" :lg="6" :xl="4">
            <a-form-item label="Date Range" style="margin-bottom: 0;">
              <a-range-picker
                v-model:value="filters.dateRange"
                style="width: 100%;"
                @change="handleSearch"
                :presets="datePresets"
              />
            </a-form-item>
          </a-col>

          <!-- Amount Range Filter -->
          <!-- <a-col :xs="24" :sm="12" :md="6" :lg="6" :xl="4">
            <a-form-item label="Amount Range" style="margin-bottom: 0;">
              <a-input-group compact>
                <a-input
                  v-model:value="filters.minAmount"
                  placeholder="Min $"
                  style="width: 50%; text-align: center;"
                  type="number"
                  @change="debouncedSearch"
                />
                <a-input
                  v-model:value="filters.maxAmount"
                  placeholder="Max $"
                  style="width: 50%; text-align: center; border-left: 0;"
                  type="number"
                  @change="debouncedSearch"
                />
              </a-input-group>
            </a-form-item>
          </a-col> -->

          <!-- Payment Method Filter -->
          <!-- <a-col :xs="24" :sm="12" :md="6" :lg="6" :xl="4">
            <a-form-item label="Payment Method" style="margin-bottom: 0;">
              <a-select
                v-model:value="filters.paymentMethod"
                placeholder="All Methods"
                allow-clear
                @change="handleSearch"
              >
                <a-select-option value="card">Credit Card</a-select-option>
                <a-select-option value="khqr">KHQR</a-select-option>
                <a-select-option value="cash">Cash on Delivery</a-select-option>
                <a-select-option value="bank_transfer">Bank Transfer</a-select-option>
              </a-select>
            </a-form-item>
          </a-col> -->
        </a-row>

        <!-- Quick Filters Row -->
        <!-- <a-row :gutter="8" style="margin-top: 16px;">
          <a-col>
            <a-space wrap>
              <a-tag
                :color="quickFilter === 'today' ? 'blue' : 'default'"
                style="cursor: pointer; user-select: none;"
                @click="applyQuickFilter('today')"
              >
                Today's Orders
              </a-tag>
              <a-tag
                :color="quickFilter === 'pending_payment' ? 'orange' : 'default'"
                style="cursor: pointer; user-select: none;"
                @click="applyQuickFilter('pending_payment')"
              >
                Pending Payment
              </a-tag>
              <a-tag
                :color="quickFilter === 'ready_to_ship' ? 'cyan' : 'default'"
                style="cursor: pointer; user-select: none;"
                @click="applyQuickFilter('ready_to_ship')"
              >
                Ready to Ship
              </a-tag>
              <a-tag
                :color="quickFilter === 'high_value' ? 'gold' : 'default'"
                style="cursor: pointer; user-select: none;"
                @click="applyQuickFilter('high_value')"
              >
                High Value ($100+)
              </a-tag>
              <a-tag
                :color="quickFilter === 'this_week' ? 'purple' : 'default'"
                style="cursor: pointer; user-select: none;"
                @click="applyQuickFilter('this_week')"
              >
                This Week
              </a-tag>
              <a-tag
                :color="quickFilter === 'need_attention' ? 'red' : 'default'"
                style="cursor: pointer; user-select: none;"
                @click="applyQuickFilter('need_attention')"
              >
                Need Attention
              </a-tag>
            </a-space>
          </a-col>
        </a-row> -->

        <!-- Action Buttons Row -->
        <a-row :gutter="8" style="margin-top: 16px;" justify="space-between">
          <a-col>
            <a-space>
              <a-button @click="handleSearch" type="primary" :loading="loading">
                <template #icon><SearchOutlined /></template>
                Search
              </a-button>
              <a-button @click="clearFilters">
                <template #icon><ClearOutlined /></template>
                Clear
              </a-button>
              <!-- <a-button @click="showExportModal = true">
                <template #icon><DownloadOutlined /></template>
                Export
              </a-button> -->
            </a-space>
          </a-col>
          <a-col>
            <a-space>
              <!-- Filter Summary -->
              <span class="filter-summary" v-if="hasActiveFilters">
                {{ activeFilterCount }} filter(s) active
              </span>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- Orders Table -->
    <a-card>
      <a-table
        :dataSource="orders"
        :columns="columns"
        :loading="loading"
        :pagination="paginationConfig"
        :scroll="{ x: 1500 }"
        row-key="id"
        @change="handleTableChange"
        size="middle"
      >
        <!-- Order Number Column -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'order_number'">
            <a-button
              type="link"
              @click="viewOrderDetails(record)"
              style="padding: 0; font-weight: 600;"
            >
              #{{ record.order_number }}
            </a-button>
          </template>

          <!-- Customer Column -->
          <template v-else-if="column.key === 'customer'">
            <div class="customer-info">
              <a-avatar
                :src="record.customer?.profile_image"
                :size="32"
                style="margin-right: 8px;"
              >
                {{ record.customer?.first_name?.[0] }}{{ record.customer?.last_name?.[0] }}
              </a-avatar>
              <div>
                <div style="font-weight: 500;">{{ record.customer?.full_name }}</div>
                <div style="font-size: 12px; color: #666;">{{ record.customer?.email }}</div>
              </div>
            </div>
          </template>

          <!-- Status Column -->
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.order_status)">
              {{ record.order_status?.toUpperCase() }}
            </a-tag>
          </template>

          <!-- Payment Status Column -->
          <template v-else-if="column.key === 'payment_status'">
            <a-tag :color="getPaymentStatusColor(record.status)">
              {{ record.status?.toUpperCase() }}
            </a-tag>
          </template>

          <!-- Total Amount Column -->
          <template v-else-if="column.key === 'total_amount'">
            <span style="font-weight: 600;">${{ record.total_amount }}</span>
          </template>

          <!-- Date Column -->
          <template v-else-if="column.key === 'placed_at'">
            {{ formatDate(record.placed_at) }}
          </template>

          <!-- Items Column -->
          <template v-else-if="column.key === 'items'">
            <div class="order-items">
              <span>{{ record.order_items?.length || 0 }} items</span>
              <a-button
                type="link"
                size="small"
                @click="showOrderItems(record)"
                style="padding: 0 4px;"
              >
                View
              </a-button>
            </div>
          </template>

          <!-- Actions Column -->
          <template v-else-if="column.key === 'actions'">
            <a-dropdown :trigger="['click']">
              <a-button type="text" style="padding: 4px;">
                <EllipsisOutlined />
              </a-button>
              <template #overlay>
                <a-menu @click="(info) => handleActionClick(info, record)">
                  <a-menu-item key="view">
                    <EyeOutlined /> View Details
                  </a-menu-item>
                  <!-- <a-menu-item key="edit">
                    <EditOutlined /> Edit Order
                  </a-menu-item> -->
                  <a-menu-divider />
                  <a-menu-item key="accept" v-if="record.order_status === 'pending'">
                    <CheckOutlined /> Accept Order
                  </a-menu-item>
                  <a-menu-item key="preparing" v-if="record.order_status === 'accepted'">
                    <ClockCircleOutlined /> Mark as Preparing
                  </a-menu-item>
                  <a-menu-item key="on_delivery" v-if="record.order_status === 'preparing'">
                    <CarOutlined /> Mark as On Delivery
                  </a-menu-item>
                  <a-menu-item key="completed" v-if="record.order_status === 'on_delivery'">
                    <CheckCircleOutlined /> Mark as Completed
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="payment_completed" v-if="record.status === 'pending'">
                    <DollarOutlined /> Mark Payment as Completed
                  </a-menu-item>
                  <a-menu-item key="payment_failed" v-if="record.status === 'pending'">
                    <ExclamationCircleOutlined /> Mark Payment as Failed
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="cancel" v-if="!['completed', 'cancelled'].includes(record.order_status)">
                    <CloseOutlined /> Cancel Order
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Order Details Modal -->
    <a-modal
      v-model:open="showDetailsModal"
      title="Order Details"
      width="900px"
      :footer="null"
    >
      <div v-if="selectedOrder">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="Order Number">
            #{{ selectedOrder.order_number }}
          </a-descriptions-item>
          <a-descriptions-item label="Status">
            <a-tag :color="getStatusColor(selectedOrder.order_status)">
              {{ selectedOrder.order_status?.toUpperCase() }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Customer">
            {{ selectedOrder.customer?.full_name }}
          </a-descriptions-item>
          <a-descriptions-item label="Email">
            {{ selectedOrder.customer?.email }}
          </a-descriptions-item>
          <a-descriptions-item label="Phone">
            {{ selectedOrder.phone }}
          </a-descriptions-item>
          <a-descriptions-item label="Payment Method">
            {{ selectedOrder.payment_method }}
          </a-descriptions-item>
          <a-descriptions-item label="Total Amount">
            ${{ selectedOrder.total_amount }}
          </a-descriptions-item>
          <a-descriptions-item label="Delivery Fee">
            ${{ selectedOrder.delivery_fee }}
          </a-descriptions-item>
          <a-descriptions-item label="Placed At">
            {{ selectedOrder.placed_at ? formatDate(selectedOrder.placed_at) : 'N/A' }}
          </a-descriptions-item>
          <a-descriptions-item label="Payment Status">
            <a-tag :color="getPaymentStatusColor(selectedOrder.status)">
              {{ selectedOrder.status?.toUpperCase() }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Shipping Address" :span="2">
            {{ selectedOrder.shipping_address || selectedOrder.address_name }}
          </a-descriptions-item>
          <a-descriptions-item label="Notes" :span="2" v-if="selectedOrder.note">
            {{ selectedOrder.note }}
          </a-descriptions-item>
          <a-descriptions-item label="Admin Notes" :span="2" v-if="selectedOrder.admin_notes">
            {{ selectedOrder.admin_notes }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider>Order Items</a-divider>
        <a-table
          :dataSource="selectedOrder.order_items || []"
          :columns="itemColumns"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'item'">
              <div class="item-info">
                <img
                  :src="record.variant?.image"
                  :alt="record.item_name"
                  style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 8px;"
                  @error="handleImageError"
                />
                <div>
                  <div style="font-weight: 500;">{{ record.item_name }}</div>
                  <div style="font-size: 12px; color: #666;">
                    {{ record.color }} - {{ record.size }}
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'price'">
              ${{ record.price }}
            </template>
            <template v-else-if="column.key === 'total'">
              ${{ record.total }}
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>

    <!-- Export Modal -->
    <a-modal
      v-model:open="showExportModal"
      title="Export Orders"
      @ok="handleExport"
      :confirmLoading="exportLoading"
    >
      <a-form layout="vertical">
        <a-form-item label="Export Format"> 
          <a-radio-group v-model:value="exportFormat">
            <a-radio value="csv">CSV</a-radio>
            <a-radio value="xlsx">Excel</a-radio>
            <a-radio value="pdf">PDF</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="Date Range">
          <a-range-picker v-model:value="exportDateRange" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Include Fields">
          <a-checkbox-group v-model:value="exportFields">
            <a-checkbox value="customer">Customer Info</a-checkbox>
            <a-checkbox value="items">Order Items</a-checkbox>
            <a-checkbox value="payment">Payment Details</a-checkbox>
            <a-checkbox value="shipping">Shipping Info</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { TableColumnsType, TableProps } from "ant-design-vue";

// TypeScript interfaces matching your API
export interface ApiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: Order[];
  meta: PaginationMeta;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  cart_id: string;
  total_amount: string;
  payment_method: string;
  placed_at: string | null;
  ordered_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  khqr_string: string;
  delivery_id: string;
  delivery_fee: string;
  shipping_address: string | null;
  admin_notes: string | null;
  payment_notes: string | null;
  address_name: string | null;
  phone: string;
  note: string | null;
  khqr_md5: string;
  status: string;
  order_status: string;
  paid_at: string | null;
  paid_amount: string | null;
  created_at: string;
  updated_at: string;
  customer: Customer;
  order_items: OrderItem[];
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_image: string;
  is_verified: boolean;
  phone_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  otp_expires_at: string | null;
  created_at: string;
  updated_at: string;
  otp_verified_for_reset: number;
  full_name: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_variant_id: string;
  item_name: string;
  size: string;
  color: string;
  quantity: number;
  price: string;
  total: string;
  created_at: string;
  updated_at: string;
  variant: ItemVariant;
}

export interface ItemVariant {
  id: string;
  item_id: string;
  color_id: string;
  size_id: string;
  image: string;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  final_price: string;
  item: Item;
  color: Color;
  size: Size;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  total_sold: number;
  last_sale_at: string | null;
  is_featured_new_arrival: boolean;
  is_featured_trending: boolean;
  featured_trending_at: string | null;
  featured_new_arrival_at: string | null;
  category_id: string;
  season_id: string;
  brand_id: string;
  discount_id: string | null;
  created_at: string;
  updated_at: string;
  discount: null;
}

export interface Color {
  id: string;
  name: string;
  hex_code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Size {
  id: string;
  name: string;
  order: number;
  description: string;
  size_group_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

definePageMeta({
  layout: "default",
});

// Reactive data
const loading = ref(false);
const error = ref<string | null>(null);
const orders = ref<Order[]>([]);
const totalOrders = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const showDetailsModal = ref(false);
const showExportModal = ref(false);
const selectedOrder = ref<Order | null>(null);
const exportLoading = ref(false);
const exportFormat = ref("csv");
const exportDateRange = ref<[Dayjs, Dayjs] | undefined>();
const exportFields = ref(["customer", "items", "payment", "shipping"]);
const quickFilter = ref<string | null>(null);

// Enhanced filters
const filters = ref({
  search: "",
  status: undefined as string | undefined,
  paymentStatus: undefined as string | undefined,
  paymentMethod: undefined as string | undefined,
  dateRange: undefined as [Dayjs, Dayjs] | undefined,
  minAmount: undefined as string | undefined,
  maxAmount: undefined as string | undefined,
});

// Date presets for the date range picker
const datePresets = [
  { label: 'Today', value: [dayjs(), dayjs()] as [Dayjs, Dayjs] },
  { label: 'Yesterday', value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] as [Dayjs, Dayjs] },
  { label: 'This Week', value: [dayjs().startOf('week'), dayjs().endOf('week')] as [Dayjs, Dayjs] },
  { label: 'Last Week', value: [dayjs().subtract(1, 'week').startOf('week'), dayjs().subtract(1, 'week').endOf('week')] as [Dayjs, Dayjs] },
  { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] as [Dayjs, Dayjs] },
  { label: 'Last Month', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] as [Dayjs, Dayjs] },
  { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] as [Dayjs, Dayjs] },
  { label: 'Last 90 Days', value: [dayjs().subtract(90, 'day'), dayjs()] as [Dayjs, Dayjs] },
];

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(
    filters.value.search ||
    filters.value.status ||
    filters.value.paymentStatus ||
    filters.value.paymentMethod ||
    filters.value.dateRange ||
    filters.value.minAmount ||
    filters.value.maxAmount
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.search) count++;
  if (filters.value.status) count++;
  if (filters.value.paymentStatus) count++;
  if (filters.value.paymentMethod) count++;
  if (filters.value.dateRange) count++;
  if (filters.value.minAmount || filters.value.maxAmount) count++;
  return count;
});

// Table columns configuration
const columns: TableColumnsType<Order> = [
  {
    title: "Order #",
    dataIndex: "order_number",
    key: "order_number",
    width: 120,
    fixed: "left",
  },
  {
    title: "Customer",
    dataIndex: "customer",
    key: "customer",
    width: 200,
  },
  {
    title: "Status",
    dataIndex: "order_status",
    key: "status",
    width: 120,
    filters: [
      { text: "Pending", value: "pending" },
      { text: "Accepted", value: "accepted" },
      { text: "Preparing", value: "preparing" },
      { text: "On Delivery", value: "on_delivery" },
      { text: "Completed", value: "completed" },
      { text: "Cancelled", value: "cancelled" },
    ],
  },
  {
    title: "Payment",
    dataIndex: "status",
    key: "status",
    width: 100,
    filters: [
      { text: "Pending", value: "pending" },
      { text: "Completed", value: "completed" },
      { text: "Failed", value: "failed" },
    ],
  },
  {
    title: "Total",
    dataIndex: "total_amount",
    key: "total_amount",
    width: 100,
    sorter: true,
  },
  {
    title: "Items",
    dataIndex: "order_items",
    key: "items",
    width: 80,
  },
  {
    title: "Date",
    dataIndex: "placed_at",
    key: "placed_at",
    width: 120,
    sorter: true,
  },
  {
    title: "Actions",
    key: "actions",
    width: 80,
    fixed: "right",
  },
];

// Item columns for order details modal
const itemColumns = [
  {
    title: "Item",
    dataIndex: "item_name",
    key: "item",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
    width: 80,
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    width: 100,
  },
  {
    title: "Total",
    dataIndex: "total",
    key: "total",
    width: 100,
  },
];

// Pagination configuration
const paginationConfig = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: totalOrders.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `${range[0]}-${range[1]} of ${total} orders`,
  pageSizeOptions: ["10", "20", "50", "100"],
}));

// Debounced search
let searchTimeout: NodeJS.Timeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
};

// Fetch orders function with enhanced filtering
const fetchOrders = async (page = 1, size = pageSize.value) => {
  loading.value = true;
  error.value = null;

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: size.toString(),
    });

    // Add all filters to params
    if (filters.value.search) {
      params.append("search", filters.value.search);
    }
    if (filters.value.status) {
      params.append("order_status", filters.value.status);
    }
    if (filters.value.paymentStatus) {
      params.append("status", filters.value.paymentStatus);
    }
    if (filters.value.paymentMethod) {
      params.append("payment_method", filters.value.paymentMethod);
    }
    if (filters.value.dateRange?.length === 2) {
      params.append("start_date", filters.value.dateRange[0].format("YYYY-MM-DD"));
      params.append("end_date", filters.value.dateRange[1].format("YYYY-MM-DD"));
    }
    if (filters.value.minAmount) {
      params.append("min_amount", filters.value.minAmount);
    }
    if (filters.value.maxAmount) {
      params.append("max_amount", filters.value.maxAmount);
    }

    const { data } = await useFetchDataApi<ApiResponse>(`/orders?${params}`);

    if (data.value?.status === "success") {
      orders.value = data.value.data;
      totalOrders.value = data.value.meta.total;
      currentPage.value = data.value.meta.current_page;
    } else {
      error.value = data.value?.message || "Failed to fetch orders";
    }
  } catch (err: any) {
    error.value = err.message || "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
};

// Helper functions
const getStatusColor = (status: string) => {
  const colors = {
    pending: "orange",
    accepted: "blue",
    preparing: "cyan",
    on_delivery: "purple",
    completed: "green",
    cancelled: "red",
  };
  return colors[status as keyof typeof colors] || "default";
};

const getPaymentStatusColor = (status: string) => {
  const colors = {
    pending: "orange",
    completed: "green",
    failed: "red",
  };
  return colors[status as keyof typeof colors] || "default";
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return dayjs(dateString).format("MMM DD, YYYY HH:mm");
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = '/placeholder-image.png'; // fallback image
};

// Event handlers
const handleRefresh = () => {
  fetchOrders();
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchOrders();
};

const clearFilters = () => {
  filters.value = {
    search: "",
    status: undefined,
    paymentStatus: undefined,
    paymentMethod: undefined,
    dateRange: undefined,
    minAmount: undefined,
    maxAmount: undefined,
  };
  quickFilter.value = null;
  currentPage.value = 1;
  fetchOrders();
};

// Quick filter functionality
const applyQuickFilter = (filterType: string) => {
  // Clear existing filters first
  clearFilters();
  quickFilter.value = filterType;

  switch (filterType) {
    case 'today':
      filters.value.dateRange = [dayjs().startOf('day'), dayjs().endOf('day')];
      break;
    case 'pending_payment':
      filters.value.paymentStatus = 'pending';
      break;
    case 'ready_to_ship':
      filters.value.status = 'preparing';
      break;
    case 'high_value':
      filters.value.minAmount = '100';
      break;
    case 'this_week':
      filters.value.dateRange = [dayjs().startOf('week'), dayjs().endOf('week')];
      break;
    case 'need_attention':
      // This could be orders that are pending for more than 24 hours
      filters.value.status = 'pending';
      filters.value.dateRange = [dayjs().subtract(30, 'day'), dayjs().subtract(1, 'day')];
      break;
  }
  
  handleSearch();
};

const handleTableChange: TableProps["onChange"] = (pagination, tableFilters, sorter) => {
  if (pagination) {
    currentPage.value = pagination.current || 1;
    pageSize.value = pagination.pageSize || 10;
  }
  fetchOrders(currentPage.value, pageSize.value);
};

const viewOrderDetails = (order: any) => {
  selectedOrder.value = order as Order;
  showDetailsModal.value = true;
};

const showOrderItems = (order: any) => {
  viewOrderDetails(order);
};

const handleActionClick = (info: { key: string | number }, order: any) => {
  const action = String(info.key);
  handleAction(action, order as Order);
};

const handleAction = async (action: string, order: Order) => {
  switch (action) {
    case "view":
      viewOrderDetails(order);
      break;
    case "edit":
      // Navigate to edit page or open edit modal
      console.log("Edit order:", order.id);
      break;
    case "accept":
      await updateOrderStatus(order.id, "accepted");
      break;
    case "preparing":
      await updateOrderStatus(order.id, "preparing");
      break;
    case "on_delivery":
      await updateOrderStatus(order.id, "on_delivery");
      break;
    case "completed":
      await updateOrderStatus(order.id, "completed");
      break;
    case "cancel":
      await updateOrderStatus(order.id, "cancelled");
      break;
    case "payment_completed":
      await updatePaymentStatus(order.id, "completed");
      break;
    case "payment_failed":
      await updatePaymentStatus(order.id, "failed");
      break;
  }
};

const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    loading.value = true;
    await useFetchDataApi(`/orders/${orderId}/order-status`, {
      method: "PUT",
      body: { 
        order_status: status
      },
    });
    await fetchOrders(currentPage.value, pageSize.value);
  } catch (error) {
    console.error("Failed to update order status:", error);
  } finally {
    loading.value = false;
  }
};

const updatePaymentStatus = async (orderId: string, status: string) => {
  try {
    loading.value = true;
    await useFetchDataApi(`/orders/${orderId}/payment-status`, {
      method: "PUT",
      body: { 
        status: status
      },
    });
    await fetchOrders(currentPage.value, pageSize.value);
  } catch (error) {
    console.error("Failed to update payment status:", error);
  } finally {
    loading.value = false;
  }
};

const handleExport = async () => {
  exportLoading.value = true;
  try {
    const params = new URLSearchParams({
      format: exportFormat.value,
      fields: exportFields.value.join(","),
    });

    if (exportDateRange.value?.length === 2) {
      params.append("start_date", exportDateRange.value[0].format("YYYY-MM-DD"));
      params.append("end_date", exportDateRange.value[1].format("YYYY-MM-DD"));
    }

    const response = await fetch(`/api/orders/export?${params}`);
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders_export_${dayjs().format("YYYY-MM-DD")}.${exportFormat.value}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showExportModal.value = false;
  } catch (error) {
    console.error("Export failed:", error);
  } finally {
    exportLoading.value = false;
  }
};

// Initialize
onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
/* Enhanced Filter Styles */
.filter-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.filter-summary {
  font-size: 12px;
  color: #666;
  background: #f0f2ff;
  padding: 2px 8px;
  border-radius: 12px;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

/* Quick filter tags hover effect */
:deep(.ant-tag) {
  transition: all 0.3s ease;
}

:deep(.ant-tag:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Input group styling for amount range */
:deep(.ant-input-group) {
  display: flex;
}

:deep(.ant-input-group .ant-input:focus) {
  border-color: #1890ff;
  z-index: 1;
}

/* Form item spacing */
:deep(.ant-form-item) {
  margin-bottom: 8px;
}

:deep(.ant-form-item-label) {
  padding-bottom: 4px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #333;
}

/* Select option styling with tags */
:deep(.ant-select-selection-item .ant-tag) {
  margin: 0;
}

/* Range picker full width */
:deep(.ant-picker) {
  width: 100%;
}

/* Button group styling */
:deep(.ant-btn-group .ant-btn:not(:first-child)) {
  margin-left: -1px;
}

/* Original styles */
.customer-info {
  display: flex;
  align-items: center;
}

.order-items {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-info {
  display: flex;
  align-items: center;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f5f5;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 600;
  background: #fafafa;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filter-card {
    margin-left: -16px;
    margin-right: -16px;
    border-left: none;
    border-right: none;
    border-radius: 0;
  }
  
  :deep(.ant-col) {
    margin-bottom: 8px;
  }
}
</style>