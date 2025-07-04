<template>
  <div>
    <a-page-header title="Products" subtitle="Manage your product inventory">
      <template #extra>
        <div class="space-x-2">
          <a-button>
            <NuxtLink to="/products/categories">
              <folder-outlined /> Categories
            </NuxtLink>
          </a-button>
          <a-button type="primary">
            <NuxtLink to="/products/add">
              <plus-outlined /> Add Product
            </NuxtLink>
          </a-button>
        </div>
      </template>
    </a-page-header>

    <a-card>
      <div class="mb-4 flex justify-between items-center flex-wrap">
        <a-input-search
          placeholder="Search products"
          style="width: 300px"
          v-model:value="searchQuery"
          @search="onSearch"
        />

        <div class="!space-x-2">
          <a-select
            v-model:value="filterCategory"
            style="width: 200px"
            placeholder="Filter by category"
            allow-clear
          >
            <a-select-option
              v-for="category in categories"
              :key="category.slug"
              :value="category.slug"
            >
              {{ category.name }}
            </a-select-option>
          </a-select>

          <a-select
            v-model:value="filterStatus"
            style="width: 150px"
            placeholder="Filter by status"
            allow-clear
          >
            <a-select-option value="in-stock">In Stock</a-select-option>
            <a-select-option value="low-stock">Low Stock</a-select-option>
            <a-select-option value="out-of-stock">Out of Stock</a-select-option>
          </a-select>
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="isSpinning"
        :row-key="(record) => record.id"
        :expand-row-by-click="true"
      >
        <template #expandedRowRender="{ record }">
          <div class="p-4 bg-gray-50">
            <h4 class="mb-3 font-semibold">Product Variants</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="variant in record.variants"
                :key="variant.id"
                class="bg-white p-3 rounded border"
              >
                <div class="flex items-center space-x-3">
                  <img
                    :src="variant.image"
                    :alt="`${record.name} - ${variant.color.name} ${variant.size.name}`"
                    class="w-16 h-16 object-cover rounded"
                  />
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                      <span
                        class="w-4 h-4 rounded-full border"
                        :style="{ backgroundColor: variant.color.hex_code }"
                      ></span>
                      <span class="font-medium">{{ variant.color.name }}</span>
                      <span class="text-gray-500">{{ variant.size.name }}</span>
                    </div>
                    <div class="text-sm text-gray-600">
                      <div>Stock: {{ variant.quantity }}</div>
                      <div class="flex items-center space-x-2">
                        <span class="text-gray-400 line-through">
                          ${{ variant.price }}
                        </span>
                        <span class="font-semibold text-green-600">
                          ${{ variant.final_price.toFixed(2) }}
                        </span>
                      </div>
                      <div v-if="variant.discount" class="text-xs text-blue-600">
                        {{ variant.discount.name }} (-{{ variant.discount.value }}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="flex items-center space-x-3">
              <img
                :src="getMainImage(record)"
                :alt="record.name"
                class="w-12 h-12 object-cover rounded"
              />
              <div>
                <div class="font-medium">{{ record.name }}</div>
                <div class="text-sm text-gray-500">{{ record.brand?.name }}</div>
              </div>
            </div>
          </template>

          <template v-if="column.key === 'variants'">
            <div class="flex flex-wrap gap-1">
              <a-tag
                v-for="variant in record.variants.slice(0, 3)"
                :key="variant.id"
                size="small"
              >
                {{ variant.color.name }} {{ variant.size.name }}
              </a-tag>
              <a-tag v-if="record.variants.length > 3" size="small" color="blue">
                +{{ record.variants.length - 3 }} more
              </a-tag>
            </div>
          </template>

          <template v-if="column.key === 'price'">
            <div>
              <div class="font-semibold">
                ${{ getMinPrice(record).toFixed(2) }} - ${{ getMaxPrice(record).toFixed(2) }}
              </div>
              <div class="text-sm text-gray-500">
                {{ record.variants.length }} variants
              </div>
            </div>
          </template>

          <template v-if="column.key === 'stock'">
            <div>
              <div class="font-semibold">{{ getTotalStock(record) }}</div>
              <a-tag :color="getStockStatusColor(getTotalStock(record))" size="small">
                {{ getStockStatus(getTotalStock(record)) }}
              </a-tag>
            </div>
          </template>

          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(getStockStatus(getTotalStock(record)))">
              {{ getStockStatus(getTotalStock(record)) }}
            </a-tag>
          </template>

          <template v-if="column.key === 'action'">
            <div class="space-x-2">
              <a-button type="primary" size="small" @click="editProduct(record.id)">
                Edit
              </a-button>
              <a-popconfirm
                title="Are you sure you want to delete this product?"
                ok-text="Yes"
                cancel-text="No"
                @confirm="deleteProduct(record.id)"
              >
                <a-button danger size="small">Delete</a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
// Interfaces
interface Color {
  name: string
  hex_code: string
}

interface Size {
  name: string
  order: number
  description: string
}

interface Discount {
  name: string
  value: string | number
}

interface Variant {
  id: string
  image: string
  quantity: number
  price: string
  final_price: number
  color: Color
  size: Size
  discount: Discount | null
}

interface Brand {
  name: string
}

interface Item {
  id: string
  name: string
  description: string
  variants: Variant[]
  brand: Brand
}

interface ItemResponse {
  success: boolean
  message?: string
  data: Item[]
}

// Refs
const items = ref<Item[]>([])
const isSpinning = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const error = ref<string | null>(null)

const categories = ref([
  { name: 'T-Shirts', slug: 't-shirts' },
  { name: 'Jeans', slug: 'jeans' },
  { name: 'Shoes', slug: 'shoes' }
])

// Fetch logic using your custom helper
const fetchItems = async () => {
  isSpinning.value = true
  error.value = null
  try {
    const { data } = await useFetchDataApi<ItemResponse>('/item')
    if (data.value?.success && Array.isArray(data.value.data)) {
      items.value = data.value.data
    } else {
      error.value = data.value?.message || 'No items returned'
    }
  } catch (err: any) {
    console.error('❌ Fetch Error:', err)
    error.value = 'Fetch error'
  } finally {
    isSpinning.value = false
  }
}

// Table columns
const columns = [
  {
    title: 'Product',
    dataIndex: 'name',
    key: 'name',
    width: 300,
  },
  {
    title: 'Variants',
    dataIndex: 'variants',
    key: 'variants',
    width: 200,
  },
  {
    title: 'Price Range',
    dataIndex: 'price',
    key: 'price',
    width: 150,
  },
  {
    title: 'Stock',
    dataIndex: 'stock',
    key: 'stock',
    width: 120,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
  },
  {
    title: 'Action',
    key: 'action',
    width: 150,
  },
]

// Use the original items array as table data
const tableData = computed(() => items.value)

// Helper functions to compute values on-demand
const getMinPrice = (product: any): number => {
  const prices = product.variants.map((v: any) => parseFloat(v.final_price.toString()))
  return Math.min(...prices)
}

const getMaxPrice = (product: any): number => {
  const prices = product.variants.map((v: any) => parseFloat(v.final_price.toString()))
  return Math.max(...prices)
}

const getTotalStock = (product: any): number => {
  return product.variants.reduce((sum: number, v: any) => sum + v.quantity, 0)
}

const getMainImage = (product: any): string => {
  return product.variants[0]?.image || ''
}

// Stock utilities
const getStockStatus = (stock: number): string => {
  if (stock === 0) return 'out-of-stock'
  if (stock < 10) return 'low-stock'
  return 'in-stock'
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'in-stock': return 'green'
    case 'low-stock': return 'orange'
    case 'out-of-stock': return 'red'
    default: return 'default'
  }
}

const getStockStatusColor = (stock: number): string => {
  if (stock === 0) return 'red'
  if (stock < 10) return 'orange'
  return 'green'
}

// Event Handlers
const onSearch = (value: string) => {
  console.log('Search:', value)
}

const editProduct = (productId: string) => {
  console.log('Edit product:', productId)
  // Navigate to edit page or open modal
}

const deleteProduct = (productId: string) => {
  console.log('Delete product:', productId)
}

// On mount
onMounted(() => {
  fetchItems()
})
</script>

<style scoped>
.space-x-2 > * + * {
  margin-left: 0.5rem;
}
.space-x-3 > * + * {
  margin-left: 0.75rem;
}
.grid {
  display: grid;
}
.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}
@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.gap-1 {
  gap: 0.25rem;
}
.gap-4 {
  gap: 1rem;
}
</style>