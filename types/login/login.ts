export interface loginTypes {
    email : string,
    password : string
}

export type BaseResponse<T> = {
    success: boolean;
    message: string;
    status_code: string;
    token: string;
    data: T;
  };
  
  export interface LoginResponse extends BaseResponse<tokenResponse> {}
  
  export type tokenResponse = {
    status: string;
    success: any;
    token: string | null;
    errors: string;
    error: string;
  }