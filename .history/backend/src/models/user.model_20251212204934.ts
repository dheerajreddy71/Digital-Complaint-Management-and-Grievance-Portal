import { UserRole, AvailabilityStatus } from './types';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  contact_info: string | null;
  expertise: string | null; // For staff - their specialization
  availability_status: AvailabilityStatus;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// What we return to clients (password stripped)
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  contact_info: string | null;
  expertise: string | null;
  availability_status: AvailabilityStatus;
  is_active: boolean;
  created_at: Date;
}

// Registration payload
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  contact_info?: string;
  expertise?: string; // Required for Staff role
}

// Login payload
export interface LoginDto {
  email: string;
  password: string;
}

// Token response after login
export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

// Decoded JWT payload
export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
