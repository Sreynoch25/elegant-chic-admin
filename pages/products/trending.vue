<template>
  <div>
    <a-page-header title="Top Trending Items" :subtitle="`${topTrendingCount} featured items`">
      <template #extra>
        <a-button type="default" @click="refreshData" :loading="loading">
          <reload-outlined /> Refresh
        </a-button>
      </template>
    </a-page-header>

    <!-- Statistics Cards -->
    <a-row :gutter="16" style="margin-bottom: 16px;">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="Total Trending Items"
            :value="topTrendingCount"
            :prefix="'★'"
            :value-style="{ color: '#faad14' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="Total Variants"
            :value="totalVariants"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="Total Sold"
            :value="totalSold"
            :value-style="{ color: '#52c41a' }"
          />
        </a-card>
      </a-col>
      <!-- <a-col :span="6">
        <a-card>
          <a-statistic
            title="Active Discounts"
            :value="activeDiscounts"
            suffix="items"
            :value-style="{ color: '#f5222d' }"
          />
        </a-card>
      </a-col> -->
    </a-row>

    <!-- Top Trending Items Grid -->
    <a-spin :spinning="loading">
      <a-row :gutter="[16, 16]" v-if="items.length > 0">
        <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in items" :key="item.id">
          <a-card hoverable :bodyStyle="{ padding: 0 }">
            <!-- Item Image -->
            <div class="item-image-container">
              <a-image
                :src="item.variants[0]?.image || '/placeholder.jpg'"
                :alt="item.name"
                :preview="false"
                class="item-image"
              />
              <div class="trending-badge">
                <a-tag color="gold" style="margin: 0;">
                  <star-filled /> Featured
                </a-tag>
              </div>
              <div class="discount-badge" v-if="item.discount_id">
                <a-tag color="red" style="margin: 0;">
                  {{ getDiscountLabel(item) }}
                </a-tag>
              </div>
            </div>

            <!-- Item Details -->
            <div style="padding: 16px;">
              <div style="margin-bottom: 8px;">
                <a-typography-title :level="5" style="margin: 0;" :ellipsis="{ rows: 2 }">
                  {{ item.name }}
                </a-typography-title>
              </div>

              <div style="margin-bottom: 8px;">
                <a-tag color="blue" size="small">
                  <tag-outlined /> {{ item.brand?.name }}
                </a-tag>
              </div>

              <div style="margin-bottom: 12px;">
                <a-space :size="4" wrap>
                  <a-tooltip 
                    v-for="variant in item.variants.slice(0, 5)" 
                    :key="variant.id"
                    :title="`${variant.color?.name} - ${variant.size?.name}`"
                  >
                    <div 
                      class="color-swatch"
                      :style="{ backgroundColor: variant.color?.hex_code }"
                    ></div>
                  </a-tooltip>
                  <a-tag v-if="item.variants.length > 5" size="small">
                    +{{ item.variants.length - 5 }}
                  </a-tag>
                </a-space>
              </div>

              <!-- Price and Stock -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div>
                  <div style="font-size: 18px; font-weight: 600; color: #1890ff;">
                    ${{ getMinPrice(item) }}
                    <span v-if="getMaxPrice(item) !== getMinPrice(item)" style="font-size: 14px; color: #8c8c8c;">
                      - ${{ getMaxPrice(item) }}
                    </span>
                  </div>
                </div>
                <div>
                  <a-badge :count="getTotalStock(item)" :number-style="{ backgroundColor: '#52c41a' }">
                    <inbox-outlined style="font-size: 20px; color: #8c8c8c;" />
                  </a-badge>
                </div>
              </div>

              <!-- Stats -->
              <div style="display: flex; gap: 16px; margin-bottom: 12px; font-size: 12px; color: #8c8c8c;">
                <div>
                  <shopping-outlined /> Sold: {{ item.total_sold }}
                </div>
                <div>
                  <appstore-outlined /> Variants: {{ item.variants.length }}
                </div>
              </div>

              <!-- Featured Date -->
              <div style="font-size: 12px; color: #8c8c8c; margin-bottom: 12px;">
                <clock-circle-outlined /> Featured: {{ formatDate(item.featured_trending_at) }}
              </div>

              <!-- Actions -->
              <a-space style="width: 100%;" direction="vertical">
                <a-button type="primary" block @click="viewDetails(item)">
                  <eye-outlined /> View Details
                </a-button>
                <a-popconfirm 
                  title="Remove from top trending?" 
                  ok-text="Yes" 
                  cancel-text="No"
                  @confirm="removeFromTrending(item.id)"
                >
                  <a-button danger block>
                    <close-outlined /> Remove Featured
                  </a-button>
                </a-popconfirm>
              </a-space>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Empty State -->
      <a-empty 
        v-else-if="!loading"
        description="No top trending items found"
        style="margin: 60px 0;"
      >
        <a-button type="primary" @click="$router.push('/products')">
          Go to Products
        </a-button>
      </a-empty>
    </a-spin>

    <!-- Item Details Modal -->
    <a-modal
      v-model:open="detailsModalVisible"
      :title="selectedItem?.name"
      width="900px"
      :footer="null"
    >
      <div v-if="selectedItem">
        <a-descriptions bordered :column="2" style="margin-bottom: 16px;">
          <a-descriptions-item label="Brand">
            {{ selectedItem.brand?.name }}
          </a-descriptions-item>
          <a-descriptions-item label="Status">
            <a-tag color="gold">
              <star-filled /> Featured Trending
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Total Sold">
            {{ selectedItem.total_sold }}
          </a-descriptions-item>
          <a-descriptions-item label="Total Variants">
            {{ selectedItem.variants.length }}
          </a-descriptions-item>
          <a-descriptions-item label="Featured Date" :span="2">
            {{ formatDateTime(selectedItem.featured_trending_at) }}
          </a-descriptions-item>
          <a-descriptions-item label="Description" :span="2">
            {{ selectedItem.description }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider>Variants</a-divider>

        <a-table
          :columns="variantColumns"
          :data-source="selectedItem.variants"
          :pagination="false"
          row-key="id"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'image'">
              <a-image
                :src="record.image"
                :width="50"
                :height="50"
                style="object-fit: cover; border-radius: 4px;"
              />
            </template>
            <template v-if="column.key === 'color'">
              <a-space>
                <div
                  class="color-swatch"
                  :style="{ backgroundColor: record.color?.hex_code, width: '20px', height: '20px' }"
                ></div>
                {{ record.color?.name }}
              </a-space>
            </template>
            <template v-if="column.key === 'size'">
              <a-tag>{{ record.size?.name }}</a-tag>
            </template>
            <template v-if="column.key === 'price'">
              ${{ record.final_price }}
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';

definePageMeta({
  layout: 'default',
});

// Types
interface TopTrendingResponse {
  status_code: number;
  message: string;
  top_trending: number;
  data: TrendingItem[];
}

interface TrendingItem {
  id: string;
  name: string;
  description: string;
  category_id: string;
  brand_id: string;
  season_id: string;
  discount_id?: string;
  total_sold: number;
  last_sale_at: string | null;
  is_featured_new_arrival: boolean;
  is_featured_trending: boolean;
  featured_trending_at: string;
  featured_new_arrival_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    name: string;
    roles: string;
  };
  variants: Variant[];
  brand: Brand;
  discount?: Discount;
}

interface Variant {
  id: string;
  item_id: string;
  color_id: string;
  size_id: string;
  image: string;
  quantity: number;
  price: string;
  final_price: string;
  created_at: string;
  updated_at: string;
  color: Color;
  size: Size;
  item: any;
}

interface Color {
  id: string;
  name: string;
  hex_code: string;
  description: string;
}

interface Size {
  id: string;
  name: string;
  order: number;
  description: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
}

interface Discount {
  id: string;
  name: string;
  description: string;
  type: string;
  value: string;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
}

// State
const items = ref<TrendingItem[]>([]);
const loading = ref(false);
const topTrendingCount = ref(0);
const detailsModalVisible = ref(false);
const selectedItem = ref<TrendingItem | null>(null);

// Computed
const totalVariants = computed(() => {
  return items.value.reduce((sum, item) => sum + item.variants.length, 0);
});

const totalSold = computed(() => {
  return items.value.reduce((sum, item) => sum + item.total_sold, 0);
});

const activeDiscounts = computed(() => {
  return items.value.filter(item => item.discount_id).length;
});

// Table columns for variant details
const variantColumns = [
  {
    title: 'Image',
    key: 'image',
    width: 80,
  },
  {
    title: 'Color',
    key: 'color',
  },
  {
    title: 'Size',
    key: 'size',
  },
  {
    title: 'Price',
    key: 'price',
  },
  {
    title: 'Stock',
    dataIndex: 'quantity',
    key: 'quantity',
  },
];

// Methods
const fetchTopTrendingItems = async () => {
  loading.value = true;
  try {
    const { data } = await useFetchDataApi<TopTrendingResponse>('/item/top-trending');

    if (data.value?.data && Array.isArray(data.value.data)) {
      items.value = data.value.data;
      topTrendingCount.value = data.value.top_trending;
      console.log('✅ Top trending items loaded:', items.value.length);
    } else {
      message.error(data.value?.message || 'Failed to load top trending items');
    }
  } catch (error: any) {
    console.error('❌ Fetch Error:', error);
    message.error('Failed to load top trending items');
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  fetchTopTrendingItems();
};

const getMinPrice = (item: TrendingItem) => {
  const prices = item.variants.map(v => parseFloat(v.final_price));
  return Math.min(...prices).toFixed(2);
};

const getMaxPrice = (item: TrendingItem) => {
  const prices = item.variants.map(v => parseFloat(v.final_price));
  return Math.max(...prices).toFixed(2);
};

const getTotalStock = (item: TrendingItem) => {
  return item.variants.reduce((sum, v) => sum + v.quantity, 0);
};

const getDiscountLabel = (item: TrendingItem) => {
  if (!item.discount) return '';
  const discount = item.variants[0]?.item?.discount;
  if (!discount) return 'Discount';
  return discount.type === 'percent' 
    ? `-${discount.value}%` 
    : `-$${discount.value}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const viewDetails = (item: TrendingItem) => {
  selectedItem.value = item;
  detailsModalVisible.value = true;
};

interface ToggleTrendingResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    is_featured_trending: boolean;
    featured_trending_at: string | null;
  };
}

const removeFromTrending = async (itemId: string) => {
  try {
    const { data } = await useFetchDataApi<ToggleTrendingResponse>(
      `/item/${itemId}/toggle-top-trending`,
      { method: 'PATCH' }
    );

    if (data.value?.success) {
      message.success(data.value.message || 'Item removed from trending');
      await fetchTopTrendingItems();
    } else {
      message.success('Item removed from trending');
      await fetchTopTrendingItems();
    }
  } catch (error: any) {
    console.error('❌ Remove Error:', error);
    message.error('Failed to remove item from trending');
  }
};


// Initialize
onMounted(() => {
  fetchTopTrendingItems();
});
</script>

<style scoped>
.item-image-container {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-image-container:hover .item-image {
  transform: scale(1.05);
}

.trending-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
}

.discount-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-swatch:hover {
  transform: scale(1.2);
}
</style>