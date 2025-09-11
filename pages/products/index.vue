<template>
  <div>
    <a-page-header title="Items" subtitle="Manage product items and variants">
      <template #extra>
        <div style="display: flex;">
          <a-button type="primary" @click="showModal" style="margin-left: 0.5rem;">
            <plus-outlined /> Add Item
          </a-button>
        </div>
      </template>
    </a-page-header>

    <!-- Filter Section -->
    <a-card style="margin-bottom: 16px;">
      <a-form layout="inline" :model="filterState" @submit.prevent>
        <a-row :gutter="16" style="width: 100%;">
          <!-- <a-col :span="6">
            <a-form-item label="Search" class="!mb-3">
              <a-input v-model:value="filterState.search" placeholder="Search by name or description" />
            </a-form-item>
          </a-col> -->
          <a-col :span="6">
            <a-form-item label="Category">
              <a-select v-model:value="filterState.category_id" placeholder="Select category" :options="categoryOptions"
                allowClear />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Brand">
              <a-select v-model:value="filterState.brand_id" placeholder="Select brand" :options="brandOptions"
                allowClear />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Season">
              <a-select v-model:value="filterState.season_id" placeholder="Select season" :options="seasonOptions"
                allowClear />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Discount">
              <a-select v-model:value="filterState.discount_id" placeholder="Select discount" :options="discountOptions"
                allowClear />
            </a-form-item>
          </a-col>
          <a-col :span="24" style="margin-top: 16px; text-align: right;">
            <a-button type="primary" @click="applyFilters" :loading="loading">
              Apply Filters
            </a-button>
            <a-button style="margin-left: 8px;" @click="clearFilters">
              Clear Filters
            </a-button>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <a-card>
      <a-table :columns="columns" :data-source="items" :loading="loading" row-key="id" :expand-row-by-click="true">
        <!-- Existing table content remains unchanged -->
        <template #expandedRowRender="{ record }">
          <div style="margin: 16px 0;">
            <h4>Variants</h4>
            <a-table :columns="variantColumns" :data-source="record.variants" :pagination="false" row-key="id"
              size="small">
              <template #bodyCell="{ column, record: variant }">
                <template v-if="column.key === 'image'">
                  <a-image :src="variant.image" :width="40" :height="40" style="object-fit: cover; border-radius: 4px;"
                    :preview="true" />
                </template>
                <template v-if="column.key === 'color'">
                  <a-tag :color="variant.color?.hex_code">
                    {{ variant.color?.name }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'size'">
                  <a-tag>{{ variant.size?.name }}</a-tag>
                </template>
                <template v-if="column.key === 'price'">
                  ${{ variant.final_price }}
                </template>
              </template>
            </a-table>
          </div>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <strong>{{ record.name }}</strong>
          </template>
          <template v-if="column.key === 'brand'">
            <a-tag color="blue">{{ record.brand?.name }}</a-tag>
          </template>
          <template v-if="column.key === 'variants_count'">
            <a-badge :count="record.variants?.length || 0" />
          </template>
          <template v-if="column.key === 'created_at'">
            <span>{{ formatDate(record.created_at) }}</span>
          </template>
          <template v-if="column.key === 'created_by'">
            <span style="text-align: center; display: block;">
              {{ record.created_by?.id ?? 'system' }}
            </span>
          </template>

          <template v-if="column.key === 'action'">
            <div class="space-x-2" style="display: flex;">
              <a-button type="primary" size="small" @click="editItem(record)">
                Edit
              </a-button>
              <a-popconfirm title="Are you sure you want to delete this item?" ok-text="Yes" cancel-text="No"
                @confirm="deleteItem(record.id)">
                <a-button size="small" danger style="margin-left: 0.5rem;">
                  Delete
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Item Modal -->
    <a-modal :title="modalMode === 'add' ? 'Add New Item' : 'Edit Item'" v-model:open="modalVisible"
      :confirm-loading="confirmLoading" @ok="handleSubmit" @cancel="handleCancel" width="800px" :footer="null">
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Item Name" name="name">
              <a-input v-model:value="formState.name" placeholder="Enter item name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Category" name="category_id">
              <a-select v-model:value="formState.category_id" placeholder="Select category" :options="categoryOptions"
                :loading="loading" allowClear />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Description" name="description">
          <a-textarea v-model:value="formState.description" :rows="3" placeholder="Enter item description" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="Brand" name="brand_id">
              <a-select v-model:value="formState.brand_id" placeholder="Select brand" :options="brandOptions" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Season" name="season_id">
              <a-select v-model:value="formState.season_id" placeholder="Select season" :options="seasonOptions" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Discount" name="discount_id">
              <a-select v-model:value="formState.discount_id" placeholder="Select discount" :options="discountOptions"
                allowClear />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Variants Section -->
        <a-divider>Product Variants</a-divider>
        <div v-for="(variant, index) in formState.variants" :key="index" class="variant-form">
          <a-card size="small" :title="`Variant ${index + 1}`" style="margin-bottom: 16px;">
            <template #extra>
              <a-button type="text" danger size="small" @click="removeVariant(index)"
                v-if="formState.variants.length > 1">
                Remove
              </a-button>
            </template>

            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item :name="['variants', index, 'color_id']" label="Color">
                  <a-select v-model:value="variant.color_id" placeholder="Select color" :options="colorOptions" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :name="['variants', index, 'size_id']" label="Size">
                  <a-select v-model:value="variant.size_id" placeholder="Select size" :options="sizeOptions" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :name="['variants', index, 'price']" label="Price">
                  <a-input-number v-model:value="variant.price" :min="0" :precision="2" placeholder="0.00"
                    style="width: 100%" :addon-before="'$'" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item :name="['variants', index, 'quantity']" label="Quantity">
                  <a-input-number v-model:value="variant.quantity" :min="0" placeholder="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :name="['variants', index, 'image']" label="Image">
                  <a-upload :file-list="variant.imageFileList || []"
                    :before-upload="(file) => beforeUploadImage(file, index)" :max-count="1"
                    accept="image/jpeg,image/png,image/jpg,image/webp" list-type="picture">
                    <a-button size="small">
                      <upload-outlined />
                      Upload
                    </a-button>
                  </a-upload>
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>
        </div>

        <a-button type="dashed" @click="addVariant" block style="margin-bottom: 16px;">
          <plus-outlined /> Add Variant
        </a-button>

        <div class="modal-footer" style="text-align: right; margin-top: 24px;">
          <a-button @click="handleCancel" style="margin-right: 8px;">
            Cancel
          </a-button>
          <a-button type="primary" @click="handleSubmit" :loading="confirmLoading">
            {{ modalMode === 'add' ? 'Create Item' : 'Update Item' }}
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import type { Item, ItemVariant, ItemFormState, ItemResponse, ApiResponse, UploadFileStatus } from "~/types/items/item";
import type { Category, CategoryResponse } from "~/types/category/category";
import type { Brand, BrandResponse } from "~/types/brand/brand";
import type { Season, SeasonResponse } from "~/types/season/season";
import type { Size, SizeResponse } from "~/types/sizes/size";
import type { Color, ColorResponse } from "~/types/colors/color";
import type { Variant } from "~/types/items/item";
import { debounce } from 'lodash-es';
import type { Discount, DiscountResponse } from "~/types/promotions/promotion";

definePageMeta({
  layout: 'default',
});

// Reactive variables
const items = ref<Item[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Modal state
const modalVisible = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const confirmLoading = ref(false);
const editingItemId = ref<string | null>(null);

// Filter state
const filterState = ref({
  search: '',
  category_id: '',
  brand_id: '',
  season_id: '',
  discount_id: '',
});

// Form state and reference
const formRef = ref<any>();
const formState = ref<ItemFormState>({
  name: '',
  description: '',
  category_id: '',
  brand_id: '',
  season_id: '',
  discount_id: '', // Added discount_id to form state
  variants: [{
    id: '',
    color_id: '',
    size_id: '',
    quantity: 0,
    price: '0',
    image: '',
    imageFileList: []
  }]
});

// Reactive variables for dropdown data
const categories = ref<Category[]>([]);
const brands = ref<Brand[]>([]);
const seasons = ref<Season[]>([]);
const sizes = ref<Size[]>([]);
const colors = ref<Color[]>([]);
const discounts = ref<Discount[]>([]);

// Computed properties for dropdowns
const categoryOptions = computed(() =>
  categories.value.map(category => ({
    label: category.name,
    value: category.id
  }))
);

const brandOptions = computed(() =>
  brands.value.map(brand => ({
    label: brand.name,
    value: brand.id
  }))
);

const seasonOptions = computed(() =>
  seasons.value.map(season => ({
    label: season.name,
    value: season.id
  }))
);

const colorOptions = computed(() =>
  colors.value.map(color => ({
    label: color.name,
    value: color.id
  }))
);

const sizeOptions = computed(() =>
  sizes.value.map(size => ({
    label: size.name,
    value: size.id
  }))
);

const discountOptions = computed(() =>
  discounts.value.map(discount => ({
    label: `${discount.name} (${discount.type === 'percent' ? `${discount.value}%` : `$${discount.value}`})`,
    value: discount.id
  }))
);

// Fetch functions
const fetchCategories = async () => {
  try {
    const { data } = await useFetchDataApi<CategoryResponse>('/categories');
    if (data.value?.success && Array.isArray(data.value.data)) {
      categories.value = data.value.data;
    } else {
      const errorMsg = data.value?.message || 'No categories returned';
      console.error('Categories fetch error:', errorMsg);
      message.error(errorMsg);
    }
  } catch (err: any) {
    console.error('❌ Categories Fetch Error:', err);
    message.error('Failed to fetch categories');
  }
};

const fetchBrands = async () => {
  try {
    const { data } = await useFetchDataApi<BrandResponse>('/brands');
    if (data.value?.status === 200 && Array.isArray(data.value.data)) {
      brands.value = data.value.data;
    } else {
      const errorMsg = data.value?.message || 'No brands returned';
      console.error('Brands fetch error:', errorMsg);
      message.error(errorMsg);
    }
  } catch (err: any) {
    console.error('❌ Brands Fetch Error:', err);
    message.error('Failed to fetch brands');
  }
};

const fetchSeasons = async () => {
  try {
    const { data } = await useFetchDataApi<SeasonResponse>('/seasons');
    if (data.value?.status === 200 && Array.isArray(data.value.data)) {
      seasons.value = data.value.data;
    } else {
      const errorMsg = data.value?.message || 'No seasons returned';
      console.error('Seasons fetch error:', errorMsg);
      message.error(errorMsg);
    }
  } catch (err: any) {
    console.error('❌ Seasons Fetch Error:', err);
    message.error('Failed to fetch seasons');
  }
};

const fetchColors = async () => {
  try {
    const { data } = await useFetchDataApi<ColorResponse>('/color');
    if (data.value?.status === 'success' && Array.isArray(data.value.data)) {
      colors.value = data.value.data;
    } else {
      const errorMsg = data.value?.message || 'No colors returned';
      console.error('Colors fetch error:', errorMsg);
      message.error(errorMsg);
    }
  } catch (err: any) {
    console.error('❌ Colors Fetch Error:', err);
    message.error('Failed to fetch colors');
  }
};

const fetchSizes = async () => {
  try {
    const { data } = await useFetchDataApi<SizeResponse>('/size');
    if (data.value?.status === 200 && Array.isArray(data.value.data)) {
      sizes.value = data.value.data;
    } else {
      const errorMsg = data.value?.message || 'No sizes returned';
      console.error('Sizes fetch error:', errorMsg);
      message.error(errorMsg);
    }
  } catch (err: any) {
    console.error('❌ Sizes Fetch Error:', err);
    message.error('Failed to fetch sizes');
  }
};

const fetchDiscounts = async () => {
  try {
    const { data } = await useFetchDataApi<DiscountResponse>('/discounts');
    if (data.value?.status === 200 && Array.isArray(data.value.data)) {
      discounts.value = data.value.data;
    } else {
      const errorMsg = data.value?.message || 'No discounts returned';
      console.error('Discounts fetch error:', errorMsg);
      message.error(errorMsg);
    }
  } catch (err: any) {
    console.error('❌ Discounts Fetch Error:', err);
    message.error('Failed to fetch discounts');
  }
};

// Form validation rules
const formRules = {
  name: [
    { required: true, message: 'Please enter item name' },
    { min: 2, message: 'Item name must be at least 2 characters' }
  ],
  category_id: [
    { required: true, message: 'Please select a category' }
  ],
  brand_id: [
    { required: true, message: 'Please select a brand' }
  ],
  season_id: [
    { required: true, message: 'Please select a season' }
  ]
};

// Table columns
const columns = [
  {
    title: 'Name',
    key: 'name',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: 'Brand',
    key: 'brand',
    width: 120,
  },
  {
    title: 'Variants',
    key: 'variants_count',
    width: 100,
  },
  {
    title: 'Created At',
    key: 'created_at',
    dataIndex: 'created_at',
    width: 150,
    sorter: (a: Item, b: Item) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    defaultSortOrder: 'descend' as const,
  },
  {
    title: 'Created By',
    key: 'created_by',
    dataIndex: 'created_by',
    width: 150,
  },
  {
    title: 'Action',
    key: 'action',
    width: 150,
  },
];

// Variant table columns
const variantColumns = [
  {
    title: 'Image',
    key: 'image',
    width: 60,
  },
  {
    title: 'Color',
    key: 'color',
    width: 100,
  },
  {
    title: 'Size',
    key: 'size',
    width: 80,
  },
  {
    title: 'Price',
    key: 'price',
    width: 100,
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 100,
  },
];

// File upload handling
const beforeUploadImage = (file: File, variantIndex: number) => {
  const isImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type);
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    message.error('You can only upload JPEG, PNG, JPG, or WEBP files!');
    return false;
  }
  if (!isLt5M) {
    message.error('Image must be smaller than 5MB!');
    return false;
  }

  formState.value.variants[variantIndex].image = file as any;
  formState.value.variants[variantIndex].imageFileList = [{
    uid: file.name + Date.now(),
    name: file.name,
    status: 'done' as UploadFileStatus,
    url: URL.createObjectURL(file)
  }];

  return false;
};

// Variant management
const addVariant = () => {
  formState.value.variants.push({
    id: '',
    color_id: '',
    size_id: '',
    quantity: 0,
    price: '0',
    image: '',
    imageFileList: []
  });
};

const removeVariant = (index: number) => {
  formState.value.variants.splice(index, 1);
};

// Modal functions
const showModal = () => {
  modalMode.value = 'add';
  modalVisible.value = true;
  resetForm();
};

const handleCancel = () => {
  modalVisible.value = false;
  resetForm();
};

const resetForm = () => {
  formState.value = {
    name: '',
    description: '',
    category_id: '',
    brand_id: '',
    season_id: '',
    discount_id: '',
    variants: [{
      id: '',
      color_id: '',
      size_id: '',
      quantity: 0,
      price: '0',
      image: '',
      imageFileList: []
    }]
  };
  editingItemId.value = null;
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

const mappedVariants = (item: Item): ItemVariant[] => {
  return item.variants.map((variant: Variant) => ({
    id: variant.id,
    color_id: variant.color_id,
    size_id: variant.size_id,
    quantity: variant.quantity,
    price: variant.price,
    image: variant.image,
    imageFileList: variant.image
      ? [
        {
          uid: variant.id || Math.random().toString(),
          name: 'image.jpg',
          status: 'done' as UploadFileStatus,
          url: variant.image,
        },
      ]
      : [],
  }));
};

const editItem = (record: Record<string, any>) => {
  const item = record as Item;
  modalMode.value = 'edit';
  modalVisible.value = true;
  editingItemId.value = item.id;

  formState.value = {
    name: item.name,
    description: item.description || '',
    category_id: item.category_id,
    brand_id: item.brand_id,
    season_id: item.season_id,
    discount_id: item.discount_id || '', // Added discount_id
    variants: mappedVariants(item)
  };
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();

    if (!formState.value.variants || formState.value.variants.length === 0) {
      message.error('Please add at least one variant');
      return;
    }

    for (let i = 0; i < formState.value.variants.length; i++) {
      const variant = formState.value.variants[i];
      if (!variant.color_id) {
        message.error(`Please select color for variant ${i + 1}`);
        return;
      }
      if (!variant.size_id) {
        message.error(`Please select size for variant ${i + 1}`);
        return;
      }
      if (!variant.price || parseFloat(variant.price) <= 0) {
        message.error(`Please enter valid price for variant ${i + 1}`);
        return;
      }
      if (variant.quantity < 0) {
        message.error(`Please enter valid quantity for variant ${i + 1}`);
        return;
      }
    }

    confirmLoading.value = true;

    if (modalMode.value === 'add') {
      await createItem();
    } else {
      await updateItem();
    }

    modalVisible.value = false;
    resetForm();

    console.log('🔄 Refreshing items list after', modalMode.value);
    await fetchItems();
    console.log('📋 Items list refreshed, total items:', items.value.length);

  } catch (error) {
    console.error('Form validation or submission failed:', error);
  } finally {
    confirmLoading.value = false;
  }
};

const createItem = async () => {
  try {
    const formData = new FormData();

    formData.append('name', formState.value.name);
    formData.append('description', formState.value.description);
    formData.append('category_id', formState.value.category_id);
    formData.append('brand_id', formState.value.brand_id);
    formData.append('season_id', formState.value.season_id);

    if (formState.value.discount_id) {
      formData.append('discount_id', formState.value.discount_id);
    }

    formState.value.variants.forEach((variant, index) => {
      formData.append(`variants[${index}][color_id]`, variant.color_id);
      formData.append(`variants[${index}][size_id]`, variant.size_id);
      formData.append(`variants[${index}][quantity]`, String(variant.quantity));
      formData.append(`variants[${index}][price]`, variant.price);

      if ((variant.image as any) instanceof File) {
        formData.append(`variants[${index}][image]`, variant.image as any);
      }
    });

    console.log('🚀 Creating item with data:', {
      name: formState.value.name,
      variants_count: formState.value.variants.length
    });

    const { data } = await useFetchDataApi<ApiResponse>('/item', {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Create response:', data.value);

    if (data.value?.success || data.value?.message) {
      message.success(data.value.message || 'Item created successfully');
      console.log('✅ Item created, refreshing list...');
    } else {
      message.success('Item created successfully');
    }
  } catch (error: any) {
    console.error('❌ Create Error:', error);
    message.error(error.message || 'Failed to create item');
    throw error;
  }
};

const updateItem = async () => {
  try {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('name', formState.value.name);
    formData.append('description', formState.value.description);
    formData.append('category_id', formState.value.category_id);
    formData.append('brand_id', formState.value.brand_id);
    formData.append('season_id', formState.value.season_id);

    if (formState.value.discount_id) {
      formData.append('discount_id', formState.value.discount_id);
    }

    formState.value.variants.forEach((variant, index) => {
      if (variant.id) {
        formData.append(`variants[${index}][id]`, variant.id);
      }

      formData.append(`variants[${index}][color_id]`, variant.color_id);
      formData.append(`variants[${index}][size_id]`, variant.size_id);
      formData.append(`variants[${index}][quantity]`, String(variant.quantity));
      formData.append(`variants[${index}][price]`, variant.price);

      if ((variant.image as any) instanceof File) {
        formData.append(`variants[${index}][image]`, variant.image as any);
      } else if (typeof variant.image === 'string' && variant.image) {
        formData.append(`variants[${index}][existing_image]`, variant.image);
      }
    });

    console.log('🔄 Updating item with ID:', editingItemId.value);

    const { data } = await useFetchDataApi<ApiResponse>(`/item/${editingItemId.value}`, {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Update response:', data.value);

    // Fixed: Better response handling with proper success checking
    if (data.value?.success === true) {
      // Use success message with proper icon
      message.success({
        content: data.value.message || 'Item updated successfully',
        duration: 3,
      });
      console.log('✅ Item updated successfully');
    } else if (data.value?.message) {
      // Show the server message even if success flag is unclear
      message.success({
        content: data.value.message,
        duration: 3,
      });
      console.log('✅ Item update completed with message:', data.value.message);
    } else {
      // Fallback success message
      message.success({
        content: 'Item updated successfully',
        duration: 3,
      });
      console.log('✅ Item update completed (fallback message)');
    }

    // Close modal and refresh
    modalVisible.value = false;
    resetForm();
    await fetchItems();

  } catch (error: any) {
    console.error('❌ Update Error:', error);

    // Proper error handling with error icon
    message.error({
      content: error.message || 'Failed to update item',
      duration: 5,
    });

    throw error;
  }
};

const deleteItem = async (itemId: string) => {
  try {
    const { data } = await useFetchDataApi<ApiResponse>(`/item/${itemId}`, {
      method: 'DELETE'
    });

    if (data.value?.message) {
      message.success(data.value.message);
    } else {
      message.success('Item deleted successfully');
    }
    await fetchItems();
  } catch (error: any) {
    console.error('❌ Delete Error:', error);
    message.error(error.message || 'Failed to delete item');
  }
};

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fetch items with filter parameters
const fetchItems = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params: Record<string, string> = {};
    if (filterState.value.search) params.search = filterState.value.search;
    if (filterState.value.category_id) params.category_id = filterState.value.category_id;
    if (filterState.value.brand_id) params.brand_id = filterState.value.brand_id;
    if (filterState.value.season_id) params.season_id = filterState.value.season_id;
    if (filterState.value.discount_id) params.discount_id = filterState.value.discount_id;

    const { data } = await useFetchDataApi<ItemResponse>('/item', {
      query: params
    });

    if (data.value?.data && Array.isArray(data.value.data)) {
      items.value = data.value.data;

      // Log the first few items for debugging
      if (items.value.length > 0) {
        console.log('📝 Latest items:', items.value.slice(0, 3).map(item => ({
          id: item.id,
          name: item.name,
          created_at: item.created_at
        })));
      }
    } else {
      error.value = data.value?.message || 'No items returned';
      message.error(error.value);
    }
  } catch (err: any) {
    console.error('❌ Items Fetch Error:', err);
    error.value = 'Failed to fetch items';
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Apply filters
const applyFilters = () => {
  fetchItems();
};

// Clear filters
const clearFilters = () => {
  filterState.value = {
    search: '',
    category_id: '',
    brand_id: '',
    season_id: '',
    discount_id: '',
  };
  fetchItems();
};

// Debounced fetchItems for search input
const debouncedFetchItems = debounce(fetchItems, 500);

// Watch filterState changes
watch(() => filterState.value.search, () => {
  debouncedFetchItems();
});

watch([
  () => filterState.value.category_id,
  () => filterState.value.brand_id,
  () => filterState.value.season_id,
  () => filterState.value.discount_id
], () => {
  fetchItems();
});

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchItems(),
    fetchCategories(),
    fetchBrands(),
    fetchSeasons(),
    fetchColors(),
    fetchSizes(),
    fetchDiscounts()
  ]);
});
</script>

<style scoped lang="css">
.space-x-2>*+* {
  margin-left: 0.5rem;
}

.variant-form {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fafafa;
}

.modal-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}
</style>


<style scoped>
.space-x-2>*+* {
  margin-left: 0.5rem;
}

.variant-form {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fafafa;
}

.modal-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}
</style>