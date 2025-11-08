export interface User {
  id?: number;
  bannerId: string;
  name: string;
  email: string;
  roles: UserRole[];
  phone_number?: string;
  banner_id?: string;
  email_verified?: boolean;
}

export type UserRole = 'RIDER' | 'DRIVER';

export interface LoginRequest {
  banner_id: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterRequest {
  banner_id: string;
  full_name: string;
  school_email: string;
  phone_number: string;
  password: string;
  selected_role: UserRole;
}

export interface RegisterResponse {
  message: string;
  banner_id: string;
}

export interface VerificationRequest {
  banner_id: string;
  verification_code: string;
}

export interface VerificationResponse {
  message: string;
}

export interface SendVerificationResponse {
  message: string;
}

export interface AddRoleRequest {
  role: UserRole;
}

export interface AddRoleResponse {
  message: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  school_email?: string;
  phone_number?: string;
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}