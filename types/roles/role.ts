// Types
export interface Role {
  id: number
  name: string
  permissions: string[]
  permissions_count: number
  users_count: number
  created_at: string
}

export interface Response<T> {
  success: boolean
  data: T
  message?: string
}

export interface Permission {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

export interface PermissionOption {
  label: string
  value: string
}

export interface PermissionCategory {
  name: string
  label: string
  permissions: PermissionOption[]
}