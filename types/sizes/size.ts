export interface Size {
  id: string
  name: string
  order: number
  description: string
  size_group_id: string
  created_at: string
  updated_at: string
}

export interface SizeResponse {
  status: number
  message: string
  data: Size[]
}

export interface SizeFormState {
  name: string
  description: string
  size_group_id: string
}

export interface ApiResponse {
  status?: number
  message: string
  data?: any
}