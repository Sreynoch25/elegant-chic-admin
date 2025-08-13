<template>
  <div>
    <a-page-header title="Orders" subtitle="Manage product Orders">
      <template #extra>
        <div style="display: flex; gap: 8px;">
          <a-button @click="handleRefresh" :loading="loading">
            <template #icon><ReloadOutlined /></template>
            Refresh
          </a-button>
          <a-button type="primary" @click="showExportModal = true">
            <template #icon><ExportOutlined /></template>
            Export
          </a-button>
        </div>
      </template>
    </a-page-header>

    <!-- Filters Section -->
    <a-card class="filter-card" style="margin-bottom: 16px;">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model:value="filters.search"
            placeholder="Search order number, customer name..."
            allow-clear
            @pressEnter="handleSearch"
          >
            <template #prefix><SearchOutlined /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="filters.status"
            placeholder="Order Status"
            allow-clear
            style="width: 100%"
            @change="handleSearch"
          >
            <a-select-option value="pending">Pending</a-select-option>
            <a-select-option value="confirmed">Confirmed</a-select-option>
            <a-select-option value="processing">Processing</a-select-option>
            <a-select-option value="shipped">Shipped</a-select-option>
            <a-select-option value="delivered">Delivered</a-select-option>
            <a-select-option value="cancelled">Cancelled</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="filters.paymentStatus"
            placeholder="Payment Status"
            allow-clear
            style="width: 100%"
            @change="handleSearch"
          >
            <a-select-option value="pending">Pending</a-select-option>
            <a-select-option value="paid">Paid</a-select-option>
            <a-select-option value="failed">Failed</a-select-option>
            <a-select-option value="refunded">Refunded</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-range-picker
            v-model:value="filters.dateRange"
            style="width: 100%"
            @change="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-button type="default" @click="clearFilters">Clear Filters</a-button>
        </a-col>
      </a-row>
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
                :src="record.customer.profile_image_url"
                :size="32"
                style="margin-right: 8px;"
              >
                {{ record.customer.first_name?.[0] }}{{ record.customer.last_name?.[0] }}
              </a-avatar>
              <div>
                <div style="font-weight: 500;">{{ record.customer.full_name }}</div>
                <div style="font-size: 12px; color: #666;">{{ record.customer.email }}</div>
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
            <a-tag :color="getPaymentStatusColor(record.payment_status)">
              {{ record.payment_status?.toUpperCase() }}
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
                  <a-menu-item key="confirm" v-if="record.order_status === 'pending'">
                    <CheckOutlined /> Confirm Order
                  </a-menu-item>
                  <a-menu-item key="ship" v-if="record.order_status === 'confirmed'">
                   Mark as Shipped
                  </a-menu-item>
                  <a-menu-item key="deliver" v-if="record.order_status === 'shipped'">
                    <CheckCircleOutlined /> Mark as Delivered
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="cancel" v-if="!['delivered', 'cancelled'].includes(record.order_status)">
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
          <a-descriptions-item label="Shipping Address" :span="2">
            {{ selectedOrder.shipping_address || selectedOrder.address_name }}
          </a-descriptions-item>
          <a-descriptions-item label="Notes" :span="2" v-if="selectedOrder.note">
            {{ selectedOrder.note }}
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
import type { OrdersResponse, Order } from "~/types/orders/order";
import type { TableColumnsType, TableProps } from "ant-design-vue";

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
    width: 100,
    filters: [
      { text: "Pending", value: "pending" },
      { text: "Confirmed", value: "confirmed" },
      { text: "Processing", value: "processing" },
      { text: "Shipped", value: "shipped" },
      { text: "Delivered", value: "delivered" },
      { text: "Cancelled", value: "cancelled" },
    ],
  },
  {
    title: "Payment",
    dataIndex: "payment_status",
    key: "payment_status",
    width: 100,
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

    const { data } = await useFetchDataApi<OrdersResponse>(`/orders?${params}`);

    if (data.value?.status === "success") {
      orders.value = data.value.data.data;
      totalOrders.value = data.value.data.total;
      currentPage.value = data.value.data.current_page;
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
    confirmed: "blue",
    processing: "cyan",
    shipped: "purple",
    delivered: "green",
    cancelled: "red",
  };
  return colors[status as keyof typeof colors] || "default";
};

const getPaymentStatusColor = (status: string) => {
  const colors = {
    pending: "orange",
    paid: "green",
    failed: "red",
    refunded: "volcano",
  };
  return colors[status as keyof typeof colors] || "default";
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return dayjs(dateString).format("MMM DD, YYYY HH:mm");
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
  const typedOrder = order as Order;
  handleAction(action, typedOrder);
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
    case "confirm":
      await updateOrderStatus(order.id, "confirmed");
      break;
    case "ship":
      await updateOrderStatus(order.id, "shipped");
      break;
    case "deliver":
      await updateOrderStatus(order.id, "delivered");
      break;
    case "cancel":
      await updateOrderStatus(order.id, "cancelled");
      break;
  }
};

const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    loading.value = true;
    await useFetchDataApi(`/orders/${orderId}/status`, {
      method: "PUT",
      body: { status },
    });
    await fetchOrders(currentPage.value, pageSize.value);
  } catch (error) {
    console.error("Failed to update order status:", error);
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