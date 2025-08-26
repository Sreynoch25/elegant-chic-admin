import  { type Dayjs } from 'dayjs'

export interface Discount {
  id: string
  name: string
  description: string
  type: 'percent' | 'fixed'
  value: string
  is_active: boolean
  starts_at: string
  expires_at: string
  created_at: string
  updated_at: string
  items?: any[]
}

export interface DiscountResponse {
  status: number
  message: string
  data: Discount[]
}

export interface DiscountFormState {
  name: string
  description: string
  type: 'percent' | 'fixed'
  value: number | undefined
  starts_at: Dayjs | undefined
  expires_at: Dayjs | undefined
  is_active: boolean
}

export interface ApiResponse {
  status?: number
  message: string
  data?: any
  discount?: Discount
}