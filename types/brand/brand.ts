export interface Brand {
  id: string
  name: string
  slug: string
  description: string
  logo_url: string
  is_featured: number
  created_at: string
  updated_at: string
}

export interface BrandResponse {
  status: number
  message: string
  data: Brand[]
}

export interface BrandFormState {
  name: string
  slug: string
  description: string
  logo_url: string
  is_featured: boolean
}

export interface ApiResponse {
  status?: number
  message: string
  data?: any
}
