export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  phone?: string;
  university?: string;
  studentId?: string;
  academicYear?: string;
  bio?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    tokenType: string;
    user: User;
  };
  errors: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  role?: string;
  profile?: UserProfile;
  preferences?: UserPreferences;
}

export interface UserProfile {
  phone?: string;
  university?: string;
  studentId?: string;
  academicYear?: string;
  bio?: string;
  dateOfBirth?: string;
  age?: number;
  address?: string;
  city?: string;
  country?: string;
  avatar?: string;
}

export interface UserPreferences {
  language?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    tokenType: string;
  };
  errors: string[];
}