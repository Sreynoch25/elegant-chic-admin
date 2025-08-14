export interface Role {
  id: number;
  name: string;
  permissions: string[];
  permissions_count: number;
  users_count: number;
  created_at: string; 
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
}
