
export interface CategoryGroup {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  category_group_id: string
  created_at: string
  updated_at: string
  group?: CategoryGroup
}

export interface CategoryResponse {
  success: boolean
  message: string
  data: Category[]
}

export interface CategoryGroupResponse {
  success: boolean
  message: string
  data: CategoryGroup[]
}

export interface CategoryFormState {
  name: string
  slug: string
  description: string
  category_group_id: string
}

export interface ApiResponse {
  success: boolean
  message: string
  data?: any
}
