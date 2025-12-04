// Types for authentication
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  instagram?: string;
  university: string;
  course: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  instagram?: string;
  university: string;
  course: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}
