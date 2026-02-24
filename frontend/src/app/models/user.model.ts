export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  university?: string;
  studentId?: string;
  academicYear?: string;
  bio?: string;
  role: 'STUDENT' | 'ADMIN';
  isVerified: boolean;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  profile?: UserProfile;
  preferences?: UserPreferences;
}

export interface UserProfile {
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  age?: number;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}