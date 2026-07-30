import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import { fetchApi, parseApiResponse } from "./api";
import { AuthContext } from "./AuthContextValue";
import type { AuthContextValue } from "./AuthContextValue";
import type {
  AuthStatus,
  AuthUser,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TokenPair,
} from "./types";

const ACCESS_TOKEN_KEY = "lastro.access-token";
const REFRESH_TOKEN_KEY = "lastro.refresh-token";

function loadSessionValue(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveSessionValue(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // A sessão segue válida em memória quando o navegador bloqueia o storage.
  }
}

function removeSessionValue(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // O estado em memória já foi invalidado.
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mfaToken, setMfaToken] = useState("");
  const accessTokenRef = useRef<string | null>(
    loadSessionValue(ACCESS_TOKEN_KEY),
  );
  const refreshTokenRef = useRef<string | null>(
    loadSessionValue(REFRESH_TOKEN_KEY),
  );
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const clearSession = useCallback(() => {
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    setUser(null);
    setMfaToken("");
    setStatus("anonymous");
    removeSessionValue(ACCESS_TOKEN_KEY);
    removeSessionValue(REFRESH_TOKEN_KEY);
  }, []);

  const storeSession = useCallback(
    (accessToken: string, refreshToken: string) => {
      accessTokenRef.current = accessToken;
      refreshTokenRef.current = refreshToken;
      saveSessionValue(ACCESS_TOKEN_KEY, accessToken);
      saveSessionValue(REFRESH_TOKEN_KEY, refreshToken);
    },
    [],
  );

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = refreshTokenRef.current;
    if (!refreshToken) return null;

    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = (async () => {
        try {
          const response = await fetchApi("/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          const tokens = await parseApiResponse<TokenPair>(response);
          storeSession(tokens.acessToken, tokens.refreshToken);
          return tokens.acessToken;
        } catch {
          clearSession();
          return null;
        } finally {
          refreshPromiseRef.current = null;
        }
      })();
    }

    return refreshPromiseRef.current;
  }, [clearSession, storeSession]);

  const apiRequest = useCallback(
    async function request<T>(
      path: string,
      init: RequestInit = {},
      allowRefresh = true,
    ): Promise<T> {
      const headers = new Headers(init.headers);
      const accessToken = accessTokenRef.current;

      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      const response = await fetchApi(path, {
        ...init,
        headers,
      });

      if (response.status === 401 && allowRefresh && refreshTokenRef.current) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          return request<T>(path, init, false);
        }
      }

      return parseApiResponse<T>(response);
    },
    [refreshAccessToken],
  );

  const loadCurrentUser = useCallback(async () => {
    const currentUser = await apiRequest<AuthUser>("/auth/me");
    setUser(currentUser);
    setStatus("authenticated");
  }, [apiRequest]);

  useEffect(() => {
    if (!accessTokenRef.current || !refreshTokenRef.current) {
      setStatus("anonymous");
      return;
    }

    loadCurrentUser().catch(clearSession);
  }, [clearSession, loadCurrentUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetchApi("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginResponse = await parseApiResponse<LoginResponse>(response);

      if (loginResponse.mfaRequired && loginResponse.mfaToken) {
        setMfaToken(loginResponse.mfaToken);
        return { mfaRequired: true };
      }

      if (!loginResponse.token || !loginResponse.refreshToken) {
        throw new Error("O servidor não retornou uma sessão válida.");
      }

      storeSession(loginResponse.token, loginResponse.refreshToken);
      await loadCurrentUser();
      return { mfaRequired: false };
    },
    [loadCurrentUser, storeSession],
  );

  const requestRegistration = useCallback(async (data: RegisterRequest) => {
    const response = await fetchApi("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return parseApiResponse<RegisterResponse>(response);
  }, []);

  const verifyMfa = useCallback(
    async (code: string) => {
      if (!mfaToken) {
        throw new Error("O desafio de autenticação expirou. Entre novamente.");
      }

      const response = await fetchApi("/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaToken, mfaCode: code }),
      });
      const loginResponse = await parseApiResponse<LoginResponse>(response);

      if (!loginResponse.token || !loginResponse.refreshToken) {
        throw new Error("O servidor não retornou uma sessão válida.");
      }

      storeSession(loginResponse.token, loginResponse.refreshToken);
      setMfaToken("");
      await loadCurrentUser();
    },
    [loadCurrentUser, mfaToken, storeSession],
  );

  const cancelMfa = useCallback(() => setMfaToken(""), []);

  const logout = useCallback(async () => {
    const refreshToken = refreshTokenRef.current;

    try {
      if (refreshToken && accessTokenRef.current) {
        await apiRequest<void>("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      }
    } finally {
      clearSession();
    }
  }, [apiRequest, clearSession]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      mfaRequired: Boolean(mfaToken),
      login,
      requestRegistration,
      verifyMfa,
      cancelMfa,
      logout,
      hasRole: (role) => user?.roles.includes(role) ?? false,
      hasPrivilege: (privilege) =>
        user?.privileges.includes(privilege) ?? false,
      apiRequest,
    }),
    [
      apiRequest,
      cancelMfa,
      login,
      logout,
      mfaToken,
      requestRegistration,
      status,
      user,
      verifyMfa,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
