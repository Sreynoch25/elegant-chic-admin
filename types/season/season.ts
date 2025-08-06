export interface Season {
  id: string
  name: string
  slug: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SeasonResponse {
  status: number
  message: string
  data: Season[]
}

export interface SeasonFormState {
  name: string
  slug: string
  description: string
  is_active: boolean
}

export interface ApiResponse {
  status?: number
  message: string
  data?: any
}
