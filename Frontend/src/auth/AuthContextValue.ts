import { createContext } from "react";
import type {
  AuthStatus,
  AuthUser,
  RegisterRequest,
  RegisterResponse,
} from "./types";

export interface LoginResult {
  mfaRequired: boolean;
}

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  mfaRequired: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  requestRegistration: (data: RegisterRequest) => Promise<RegisterResponse>;
  verifyMfa: (code: string) => Promise<void>;
  cancelMfa: () => void;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPrivilege: (privilege: string) => boolean;
  apiRequest: <T>(path: string, init?: RequestInit) => Promise<T>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
