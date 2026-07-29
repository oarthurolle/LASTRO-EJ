export type AuthStatus = "loading" | "anonymous" | "authenticated";

export interface AuthUser {
  id: number;
  email: string;
  presentationName: string | null;
  roles: string[];
  privileges: string[];
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface RegisterRequest {
  presentationName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
  verificationRequired: boolean;
  approvalRequired: boolean;
}

export interface LoginResponse {
  token?: string;
  refreshToken?: string;
  authenticated: boolean;
  mfaRequired: boolean;
  emailVerificationRequired: boolean;
  mfaToken?: string;
  expiresInSeconds: number;
}

export interface TokenPair {
  acessToken: string;
  refreshToken: string;
}

export interface ApiErrorPayload {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  fieldViolations?: Array<{
    field: string;
    message: string;
  }>;
}
