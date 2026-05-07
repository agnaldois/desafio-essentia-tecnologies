export interface AuthResponse {
  data: { token: string };
  message: string;
}

// Frontend DTOs — match RegisterDto and LoginDto in backend
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}
