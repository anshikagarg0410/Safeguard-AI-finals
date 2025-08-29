import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthAPI } from '@/lib/api';

type User = any;

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (params: { firstName: string; lastName: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth_token');
    if (stored) {
      setToken(stored);
      AuthAPI.me()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await AuthAPI.login({ email, password });
    const t = res.data.token;
    localStorage.setItem('auth_token', t);
    setToken(t);
    setUser(res.data.user);
  };

  const register = async (params: { firstName: string; lastName: string; email: string; password: string; phone?: string }) => {
    const res = await AuthAPI.register(params);
    const t = res.data.token;
    localStorage.setItem('auth_token', t);
    setToken(t);
    setUser(res.data.user);
  };

  const logout = () => {
    try { localStorage.removeItem('auth_token'); } catch {}
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


