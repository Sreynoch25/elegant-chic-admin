
export interface Color {
  id: string
  name: string
  hex_code: string
  description: string
  created_at: string
  updated_at: string
}

export interface ColorResponse {
  status: string 
  message: string
  data: Color[]
}


export interface ColorFormState {
  name: string
  hex_code: string
  description: string
}

export interface ApiResponse {
  status: string 
  message: string
  data?: any
}