export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string; 
  updated_at: string; 
}

export interface PermissionsResponse {
  success: boolean;
  status: number;
  message: string;
  data: Permission[];
}
