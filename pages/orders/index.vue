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
                  <a-menu-item key="edit">
                    <EditOutlined /> Edit Order
                  </a-menu-item>
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

// Filters
const filters = ref({
  search: "",
  status: undefined as string | undefined,
  paymentStatus: undefined as string | undefined,
  dateRange: undefined as [Dayjs, Dayjs] | undefined,
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
    key: "payment_status",
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

// Fetch orders function
const fetchOrders = async (page = 1, size = pageSize.value) => {
  loading.value = true;
  error.value = null;

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: size.toString(),
    });

    // Add filters to params
    if (filters.value.search) {
      params.append("search", filters.value.search);
    }
    if (filters.value.status) {
      params.append("status", filters.value.status);
    }
    if (filters.value.paymentStatus) {
      params.append("payment_status", filters.value.paymentStatus);
    }
    if (filters.value.dateRange?.length === 2) {
      params.append("start_date", filters.value.dateRange[0].format("YYYY-MM-DD"));
      params.append("end_date", filters.value.dateRange[1].format("YYYY-MM-DD"));
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
    dateRange: undefined,
  };
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
.filter-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

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
</style>