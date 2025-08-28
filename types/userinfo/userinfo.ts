export interface AdminProfileResponse {
  status: number
  message: string
  data: AdminProfile
}

export interface AdminProfile {
  id: number
  name: string
  email: string
  roles: string
  profile_image: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
