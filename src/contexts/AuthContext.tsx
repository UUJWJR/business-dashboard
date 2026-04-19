import { createContext, useState, useCallback, useEffect } from 'react';

export interface User {
  username: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'dashboard-auth';
const MOCK_USERNAME = 'admin';
const MOCK_PASSWORD = 'admin123';

function loadAuthState(): AuthState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        typeof parsed.isAuthenticated === 'boolean' &&
        (parsed.user === null || (typeof parsed.user === 'object' && typeof parsed.user.username === 'string'))
      ) {
        return parsed as AuthState;
      }
    }
  } catch {
    // ignore parse errors
  }
  return { isAuthenticated: false, user: null };
}

function saveAuthState(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(loadAuthState);

  useEffect(() => {
    saveAuthState(state);
  }, [state]);

  const login = useCallback((username: string, password: string): boolean => {
    if (username === MOCK_USERNAME && password === MOCK_PASSWORD) {
      setState({ isAuthenticated: true, user: { username } });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setState({ isAuthenticated: false, user: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
