<template>
  <div class="advanced-customer-filters">
    <a-card :bordered="false" class="filter-card">
      <!-- Filter Header -->
      <div class="filter-header">
        <div class="header-left">
          <h3>
            <FilterOutlined />
            Advanced Filters
          </h3>
          <a-badge :count="activeFilterCount" :offset="[10, 0]">
            <span class="filter-subtitle">{{ activeFilterCount }} active filters</span>
          </a-badge>
        </div>
        <div class="header-actions">
          <a-space>
            <a-dropdown :trigger="['click']">
              <template #overlay>
                <a-menu @click="handleSavedFilterAction">
                  <a-menu-item key="save">
                    <SaveOutlined />
                    Save Current Filter
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item 
                    v-for="savedFilter in savedFilters" 
                    :key="savedFilter.id"
                  >
                    <BookmarkOutlined />
                    {{ savedFilter.name }}
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button type="text">
                <BookmarkOutlined />
                Saved Filters
                <DownOutlined />
              </a-button>
            </a-dropdown>
            
            <a-button 
              type="link" 
              @click="clearAllFilters"
              :disabled="!hasActiveFilters"
            >
              Clear All
            </a-button>
          </a-space>
        </div>
      </div>

      <!-- Quick Search Bar -->
      <div class="quick-search">
        <a-input-search
          v-model:value="filters.search"
          placeholder="Search customers by name, email, or phone..."
          size="large"
          @search="onQuickSearch"
          @change="onFilterChange"
          allowClear
          enter-button="Search"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input-search>
      </div>

      <!-- Main Filter Grid -->
      <a-row :gutter="[24, 16]" class="filter-grid">
        <!-- Basic Filters -->
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-group">
            <h4 class="filter-group-title">
              <UserOutlined />
              Customer Info
            </h4>
            <a-space direction="vertical" style="width: 100%" :size="8">
              <a-select
                v-model:value="filters.phoneStatus"
                placeholder="Phone Status"
                allowClear
                @change="onFilterChange"
                style="width: 100%"
              >
                <a-select-option value="has_phone">
                  <PhoneOutlined /> Has Phone
                </a-select-option>
                <a-select-option value="no_phone">
                  <PhoneFilled style="opacity: 0.3" /> No Phone
                </a-select-option>
              </a-select>

              <a-select
                v-model:value="filters.avatarStatus"
                placeholder="Profile Image"
                allowClear
                @change="onFilterChange"
                style="width: 100%"
              >
                <a-select-option value="has_avatar">
                  <UserOutlined /> Has Avatar
                </a-select-option>
                <a-select-option value="no_avatar">
                  <UserAddOutlined style="opacity: 0.3" /> No Avatar
                </a-select-option>
              </a-select>
            </a-space>
          </div>
        </a-col>

        <!-- Date Filters -->
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-group">
            <h4 class="filter-group-title">
              <CalendarOutlined />
              Date Range
            </h4>
            <a-space direction="vertical" style="width: 100%" :size="8">
              <a-select
                v-model:value="filters.quickDate"
                placeholder="Quick Date Filter"
                allowClear
                @change="onQuickDateChange"
                style="width: 100%"
              >
                <a-select-option value="today">Today</a-select-option>
                <a-select-option value="yesterday">Yesterday</a-select-option>
                <a-select-option value="last_7_days">Last 7 Days</a-select-option>
                <a-select-option value="last_30_days">Last 30 Days</a-select-option>
                <a-select-option value="last_90_days">Last 90 Days</a-select-option>
                <a-select-option value="this_month">This Month</a-select-option>
                <a-select-option value="last_month">Last Month</a-select-option>
              </a-select>

              <a-range-picker
                v-model:value="filters.createdDateRange"
                format="YYYY-MM-DD"
                placeholder="['Created From', 'Created To']"
                @change="onFilterChange"
                style="width: 100%"
              />
            </a-space>
          </div>
        </a-col>

        <!-- Sort & Display -->
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-group">
            <h4 class="filter-group-title">
              <SortAscendingOutlined />
              Sort & Display
            </h4>
            <a-space direction="vertical" style="width: 100%" :size="8">
              <a-select
                v-model:value="filters.sortBy"
                placeholder="Sort By"
                @change="onFilterChange"
                style="width: 100%"
              >
                <a-select-option value="name_asc">
                  <SortAscendingOutlined /> Name (A-Z)
                </a-select-option>
                <a-select-option value="name_desc">
                  <SortDescendingOutlined /> Name (Z-A)
                </a-select-option>
                <a-select-option value="created_at_desc">
                  <ClockCircleOutlined /> Newest First
                </a-select-option>
                <a-select-option value="created_at_asc">
                  <ClockCircleOutlined /> Oldest First
                </a-select-option>
                <a-select-option value="updated_at_desc">
                  <EditOutlined /> Recently Updated
                </a-select-option>
              </a-select>

              <a-select
                v-model:value="filters.perPage"
                @change="onFilterChange"
                style="width: 100%"
              >
                <a-select-option value="10">10 per page</a-select-option>
                <a-select-option value="25">25 per page</a-select-option>
                <a-select-option value="50">50 per page</a-select-option>
                <a-select-option value="100">100 per page</a-select-option>
              </a-select>
            </a-space>
          </div>
        </a-col>

        <!-- Advanced Filters -->
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-group">
            <h4 class="filter-group-title">
              <SettingOutlined />
              Advanced
            </h4>
            <a-space direction="vertical" style="width: 100%" :size="8">
              <a-input
                v-model:value="filters.emailDomain"
                placeholder="Email domain (e.g., gmail.com)"
                allowClear
                @change="onFilterChange"
              >
                <template #prefix>
                  <MailOutlined />
                </template>
              </a-input>

              <a-checkbox-group 
                v-model:value="filters.customerFlags" 
                @change="onFilterChange"
                style="width: 100%"
              >
                <a-space direction="vertical" style="width: 100%">
                  <a-checkbox value="has_complete_profile">Complete Profile</a-checkbox>
                  <a-checkbox value="recent_activity">Recent Activity (7d)</a-checkbox>
                </a-space>
              </a-checkbox-group>
            </a-space>
          </div>
        </a-col>
      </a-row>

      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="active-filters">
        <div class="active-filters-header">
          <h4>
            <TagOutlined />
            Active Filters ({{ activeFilterCount }})
          </h4>
          <a-button type="text" size="small" @click="clearAllFilters">
            Clear All
          </a-button>
        </div>
        
        <div class="filter-tags">
          <a-tag 
            v-if="filters.search" 
            closable 
            color="blue"
            @close="filters.search = ''; onFilterChange()"
          >
            <SearchOutlined />
            Search: "{{ filters.search }}"
          </a-tag>
          
          <a-tag 
            v-if="filters.phoneStatus" 
            closable 
            color="green"
            @close="filters.phoneStatus = null; onFilterChange()"
          >
            <PhoneOutlined />
            {{ filters.phoneStatus === 'has_phone' ? 'Has Phone' : 'No Phone' }}
          </a-tag>
          
          <a-tag 
            v-if="filters.avatarStatus" 
            closable 
            color="purple"
            @close="filters.avatarStatus = null; onFilterChange()"
          >
            <UserOutlined />
            {{ filters.avatarStatus === 'has_avatar' ? 'Has Avatar' : 'No Avatar' }}
          </a-tag>
          
          <a-tag 
            v-if="filters.quickDate" 
            closable 
            color="orange"
            @close="filters.quickDate = null; filters.createdDateRange = null; onFilterChange()"
          >
            <CalendarOutlined />
            {{ getQuickDateLabel(filters.quickDate) }}
          </a-tag>
          
          <a-tag 
            v-if="filters.createdDateRange && filters.createdDateRange.length && !filters.quickDate" 
            closable 
            color="cyan"
            @close="filters.createdDateRange = null; onFilterChange()"
          >
            <CalendarOutlined />
            Created: {{ formatDateRange(filters.createdDateRange) }}
          </a-tag>
          
          <a-tag 
            v-if="filters.emailDomain" 
            closable 
            color="geekblue"
            @close="filters.emailDomain = ''; onFilterChange()"
          >
            <MailOutlined />
            Domain: {{ filters.emailDomain }}
          </a-tag>
          
          <a-tag 
            v-for="flag in filters.customerFlags" 
            :key="flag"
            closable 
            color="magenta"
            @close="removeCustomerFlag(flag)"
          >
            <CheckCircleOutlined />
            {{ getFlagLabel(flag) }}
          </a-tag>
          
          <a-tag 
            v-if="filters.sortBy !== 'created_at_desc'" 
            closable 
            color="volcano"
            @close="filters.sortBy = 'created_at_desc'; onFilterChange()"
          >
            <SortAscendingOutlined />
            {{ getSortLabel(filters.sortBy) }}
          </a-tag>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="filter-actions">
        <a-row justify="space-between" align="middle">
          <a-col>
            <a-space>
              <a-button 
                type="primary" 
                @click="applyFilters"
                :loading="loading"
                size="large"
              >
                <FilterOutlined />
                Apply Filters
              </a-button>
              
              <a-button 
                @click="resetFilters"
                size="large"
              >
                <ClearOutlined />
                Reset All
              </a-button>
            </a-space>
          </a-col>
          
          <a-col>
            <a-space>
              <a-dropdown :trigger="['click']">
                <template #overlay>
                  <a-menu @click="handleExportAction">
                    <a-menu-item key="csv">
                      <FileTextOutlined />
                      Export as CSV
                    </a-menu-item>
                    <a-menu-item key="excel">
                      <FileExcelOutlined />
                      Export as Excel
                    </a-menu-item>
                    <a-menu-item key="pdf">
                      <FilePdfOutlined />
                      Export as PDF
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="dashed" size="large">
                  <DownloadOutlined />
                  Export
                  <DownOutlined />
                </a-button>
              </a-dropdown>
              
              <a-button 
                type="dashed" 
                @click="toggleFilterCollapse"
                size="large"
              >
                {{ isCollapsed ? 'Show More' : 'Show Less' }}
                <DownOutlined :class="{ 'rotate-180': !isCollapsed }" />
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </div>

      <!-- Save Filter Modal -->
      <a-modal
        v-model:open="saveFilterModalVisible"
        title="Save Filter"
        @ok="saveCurrentFilter"
        @cancel="cancelSaveFilter"
      >
        <a-form layout="vertical">
          <a-form-item label="Filter Name" required>
            <a-input
              v-model:value="newFilterName"
              placeholder="Enter filter name"
              maxlength="50"
              show-count
            />
          </a-form-item>
          <a-form-item label="Description">
            <a-textarea
              v-model:value="newFilterDescription"
              placeholder="Optional description"
              :rows="3"
              maxlength="200"
              show-count
            />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { 
  SearchOutlined, 
  FilterOutlined, 
  ClearOutlined, 
  DownOutlined,
  UserOutlined,
  PhoneOutlined,
  PhoneFilled,
  UserAddOutlined,
  CalendarOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ClockCircleOutlined,
  EditOutlined,
  SettingOutlined,
  MailOutlined,
  TagOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  BookmarkOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'

// Props
interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  filtersChanged: [filters: FilterState]
  applyFilters: [filters: FilterState]
  exportData: [format: string, filters: FilterState]
}>()

// Types
interface FilterState {
  search: string
  phoneStatus: string | null
  avatarStatus: string | null
  createdDateRange: [Dayjs, Dayjs] | null
  updatedDateRange: [Dayjs, Dayjs] | null
  quickDate: string | null
  sortBy: string
  perPage: string | number
  emailDomain: string
  customerFlags: string[]
}

interface SavedFilter {
  id: string
  name: string
  description: string
  filters: FilterState
  createdAt: string
}

// Reactive state
const isCollapsed = ref(false)
const saveFilterModalVisible = ref(false)
const newFilterName = ref('')
const newFilterDescription = ref('')

const filters = reactive<FilterState>({
  search: '',
  phoneStatus: null,
  avatarStatus: null,
  createdDateRange: null,
  updatedDateRange: null,
  quickDate: null,
  sortBy: 'created_at_desc',
  perPage: 10,
  emailDomain: '',
  customerFlags: []
})

const savedFilters = ref<SavedFilter[]>([
  {
    id: '1',
    name: 'Recent Customers',
    description: 'Customers created in the last 7 days',
    filters: { ...filters, quickDate: 'last_7_days' },
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Complete Profiles',
    description: 'Customers with phone and avatar',
    filters: { ...filters, phoneStatus: 'has_phone', avatarStatus: 'has_avatar' },
    createdAt: new Date().toISOString()
  }
])

// Computed
const hasActiveFilters = computed(() => {
  return filters.search !== '' ||
         filters.phoneStatus !== null ||
         filters.avatarStatus !== null ||
         filters.createdDateRange !== null ||
         filters.updatedDateRange !== null ||
         filters.quickDate !== null ||
         filters.sortBy !== 'created_at_desc' ||
         filters.perPage !== 10 ||
         filters.emailDomain !== '' ||
         filters.customerFlags.length > 0
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.search) count++
  if (filters.phoneStatus) count++
  if (filters.avatarStatus) count++
  if (filters.createdDateRange || filters.quickDate) count++
  if (filters.updatedDateRange) count++
  if (filters.sortBy !== 'created_at_desc') count++
  if (filters.emailDomain) count++
  if (filters.customerFlags.length) count += filters.customerFlags.length
  return count
})

// Methods
const onFilterChange = () => {
  emit('filtersChanged', { ...filters })
}

const onQuickSearch = () => {
  applyFilters()
}

const onQuickDateChange = (value: string | null) => {
  if (!value) {
    filters.createdDateRange = null
    return
  }

  const today = dayjs()
  let startDate: Dayjs
  let endDate: Dayjs = today

  switch (value) {
    case 'today':
      startDate = today.startOf('day')
      endDate = today.endOf('day')
      break
    case 'yesterday':
      startDate = today.subtract(1, 'day').startOf('day')
      endDate = today.subtract(1, 'day').endOf('day')
      break
    case 'last_7_days':
      startDate = today.subtract(7, 'day').startOf('day')
      break
    case 'last_30_days':
      startDate = today.subtract(30, 'day').startOf('day')
      break
    case 'last_90_days':
      startDate = today.subtract(90, 'day').startOf('day')
      break
    case 'this_month':
      startDate = today.startOf('month')
      endDate = today.endOf('month')
      break
    case 'last_month':
      startDate = today.subtract(1, 'month').startOf('month')
      endDate = today.subtract(1, 'month').endOf('month')
      break
    default:
      return
  }

  filters.createdDateRange = [startDate, endDate]
  onFilterChange()
}

const applyFilters = () => {
  emit('applyFilters', { ...filters })
  message.success('Filters applied successfully')
}

const resetFilters = () => {
  Object.assign(filters, {
    search: '',
    phoneStatus: null,
    avatarStatus: null,
    createdDateRange: null,
    updatedDateRange: null,
    quickDate: null,
    sortBy: 'created_at_desc',
    perPage: 10,
    emailDomain: '',
    customerFlags: []
  })
  onFilterChange()
  message.info('All filters reset')
}

const clearAllFilters = () => {
  resetFilters()
}

const toggleFilterCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const removeCustomerFlag = (flag: string) => {
  const index = filters.customerFlags.indexOf(flag)
  if (index > -1) {
    filters.customerFlags.splice(index, 1)
    onFilterChange()
  }
}

const handleSavedFilterAction = ({ key }: { key: string }) => {
  if (key === 'save') {
    saveFilterModalVisible.value = true
  } else {
    const savedFilter = savedFilters.value.find(f => f.id === key)
    if (savedFilter) {
      Object.assign(filters, savedFilter.filters)
      onFilterChange()
      message.success(`Applied filter: ${savedFilter.name}`)
    }
  }
}

const handleExportAction = ({ key }: { key: string }) => {
  emit('exportData', key, { ...filters })
  message.success(`Exporting data as ${key.toUpperCase()}...`)
}

const saveCurrentFilter = () => {
  if (!newFilterName.value.trim()) {
    message.error('Please enter a filter name')
    return
  }

  const newFilter: SavedFilter = {
    id: Date.now().toString(),
    name: newFilterName.value.trim(),
    description: newFilterDescription.value.trim(),
    filters: { ...filters },
    createdAt: new Date().toISOString()
  }

  savedFilters.value.push(newFilter)
  message.success(`Filter "${newFilter.name}" saved successfully`)
  
  cancelSaveFilter()
}

const cancelSaveFilter = () => {
  saveFilterModalVisible.value = false
  newFilterName.value = ''
  newFilterDescription.value = ''
}

const formatDateRange = (dateRange: [Dayjs, Dayjs] | null) => {
  if (!dateRange || !dateRange.length) return ''
  return `${dateRange[0].format('MMM DD')} - ${dateRange[1].format('MMM DD')}`
}

const getQuickDateLabel = (value: string) => {
  const labels: Record<string, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    last_7_days: 'Last 7 Days',
    last_30_days: 'Last 30 Days',
    last_90_days: 'Last 90 Days',
    this_month: 'This Month',
    last_month: 'Last Month'
  }
  return labels[value] || value
}

const getFlagLabel = (flag: string) => {
  const labels: Record<string, string> = {
    has_complete_profile: 'Complete Profile',
    recent_activity: 'Recent Activity'
  }
  return labels[flag] || flag
}

const getSortLabel = (sortBy: string) => {
  const labels: Record<string, string> = {
    name_asc: 'Name A-Z',
    name_desc: 'Name Z-A',
    created_at_asc: 'Oldest First',
    created_at_desc: 'Newest First',
    updated_at_asc: 'Least Recently Updated',
    updated_at_desc: 'Recently Updated'
  }
  return labels[sortBy] || sortBy
}

// Watchers
watch(() => filters.quickDate, (newValue) => {
  if (!newValue) {
    filters.createdDateRange = null
  }
})
</script>

<style scoped>
.advanced-customer-filters {
  margin-bottom: 24px;
}

.filter-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.header-left h3 {
  margin: 0 0 4px 0;
  color: #262626;
  font-weight: 600;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-subtitle {
  color: #8c8c8c;
  font-size: 13px;
}

.header-actions {
  flex-shrink: 0;
}

.quick-search {
  margin-bottom: 32px;
}

.filter-grid {
  margin-bottom: 24px;
}

.filter-group {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.filter-group:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-group-title {
  margin: 0 0 16px 0;
  font-weight: 600;
  font-size: 14px;
  color: #595959;
  display: flex;
  align-items: center;
  gap: 6px;
}

.active-filters {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f6f8ff 0%, #f0f5ff 100%);
  border-radius: 8px;
  border: 1px solid #e6f7ff;
}

.active-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.active-filters-header h4 {
  margin: 0;
  color: #1890ff;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

/* Custom tag styles */
:deep(.ant-tag) {
  border-radius: 16px;
  padding: 4px 12px;
  margin-bottom: 4px;
  font-weight: 500;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

:deep(.ant-tag-blue) {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: white;
}

:deep(.ant-tag-green) {
  background: linear-gradient(135deg, #52c41a, #73d13d);
  color: white;
}

:deep(.ant-tag-purple) {
  background: linear-gradient(135deg, #722ed1, #9254de);
  color: white;
}

:deep(.ant-tag-orange) {
  background: linear-gradient(135deg, #fa8c16, #ffa940);
  color: white;
}

:deep(.ant-tag-cyan) {
  background: linear-gradient(135deg, #13c2c2, #36cfc9);
  color: white;
}

:deep(.ant-tag-geekblue) {
  background: linear-gradient(135deg, #2f54eb, #597ef7);
  color: white;
}

:deep(.ant-tag-magenta) {
  background: linear-gradient(135deg, #eb2f96, #f759ab);
  color: white;
}

:deep(.ant-tag-volcano) {
  background: linear-gradient(135deg, #fa541c, #ff7a45);
  color: white;
}

/* Form styling */
:deep(.ant-select) {
  border-radius: 6px;
}

:deep(.ant-select-selector) {
  border-radius: 6px !important;
  border: 1px solid #d9d9d9 !important;
  transition: all 0.2s ease;
}

:deep(.ant-select:hover .ant-select-selector) {
  border-color: #40a9ff !important;
}

:deep(.ant-select-focused .ant-select-selector) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
}

:deep(.ant-input) {
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  transition: all 0.2s ease;
}

:deep(.ant-input:hover) {
  border-color: #40a9ff;
}

:deep(.ant-input:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

:deep(.ant-picker) {
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  transition: all 0.2s ease;
}

:deep(.ant-picker:hover) {
  border-color: #40a9ff;
}

:deep(.ant-picker-focused) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* Search input styling */
:deep(.ant-input-search .ant-input) {
  border-radius: 8px 0 0 8px;
}

:deep(.ant-input-search .ant-input-search-button) {
  border-radius: 0 8px 8px 0;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border-color: #1890ff;
  font-weight: 500;
}

:deep(.ant-input-search .ant-input-search-button:hover) {
  background: linear-gradient(135deg, #40a9ff, #69c0ff);
  border-color: #40a9ff;
}

/* Button styling */
:deep(.ant-btn) {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

:deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #40a9ff, #69c0ff);
  border-color: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
  transform: translateY(-1px);
}

:deep(.ant-btn-dashed) {
  border: 2px dashed #d9d9d9;
}

:deep(.ant-btn-dashed:hover) {
  border-color: #40a9ff;
  color: #40a9ff;
}

/* Badge styling */
:deep(.ant-badge-count) {
  background: #ff4d4f;
  box-shadow: 0 0 0 1px #fff;
}

/* Checkbox styling */
:deep(.ant-checkbox-wrapper) {
  font-size: 13px;
  color: #595959;
}

:deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background-color: #1890ff;
  border-color: #1890ff;
}

/* Modal styling */
:deep(.ant-modal-header) {
  border-radius: 8px 8px 0 0;
  background: linear-gradient(135deg, #f6f8ff, #f0f5ff);
  border-bottom: 1px solid #e6f7ff;
}

:deep(.ant-modal-title) {
  font-weight: 600;
  color: #1890ff;
}

/* Responsive design */
@media (max-width: 1200px) {
  .filter-grid .ant-col-lg-6 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (max-width: 768px) {
  .advanced-customer-filters {
    margin-bottom: 16px;
  }
  
  .filter-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-actions {
    align-self: flex-end;
  }
  
  .quick-search {
    margin-bottom: 24px;
  }
  
  .filter-grid {
    margin-bottom: 16px;
  }
  
  .filter-group {
    padding: 12px;
  }
  
  .active-filters {
    padding: 16px;
    margin-top: 16px;
  }
  
  .filter-actions {
    margin-top: 24px;
    padding-top: 16px;
  }
  
  .filter-actions .ant-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-tags {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 576px) {
  .filter-group-title {
    font-size: 13px;
    margin-bottom: 12px;
  }
  
  .filter-actions .ant-space {
    width: 100%;
    justify-content: center;
  }
  
  .filter-actions .ant-btn {
    flex: 1;
    min-width: 120px;
  }
}

/* Animation for filter application */
.filter-card {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading state animations */
.filter-actions .ant-btn-loading {
  position: relative;
  overflow: hidden;
}

.filter-actions .ant-btn-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Hover effects */
.filter-group {
  cursor: default;
  position: relative;
  overflow: hidden;
}

.filter-group::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #1890ff, transparent);
  transition: left 0.3s ease;
}

.filter-group:hover::before {
  left: 100%;
}
</style>