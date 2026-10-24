export type UserRole = 'CASHIER' | 'ADMIN';

export interface UserSession {
  role: UserRole;
  name: string;
  loginTime: string;
}

export interface PinVerifyResult {
  success: boolean;
  role?: UserRole;
  message?: string;
}
