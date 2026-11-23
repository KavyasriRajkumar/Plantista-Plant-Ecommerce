import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { apiError, tokenStore } from '../services/api';

const AuthContext = createContext(null);

/**
 * Real auth backed by the Express API (/api/auth/*).
 * - `initializing` is true while a saved token is being checked, so route
 *   guards don't flash the login page for someone who is already signed in.
 * - login()/register() throw { message, errors } on failure for the forms.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(!!tokenStore.get());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) return;
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setInitializing(false));
  }, []);

  const authenticate = useCallback(async (path, payload, remember) => {
    setLoading(true);
    try {
      const { data } = await api.post(path, payload);
      tokenStore.set(data.token, remember);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw apiError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = ({ email, password, remember }) => authenticate('/auth/login', { email, password }, remember);
  const adminLogin = ({ email, password, remember }) => authenticate('/auth/admin/login', { email, password }, remember);
  const register = ({ name, email, phone, password }) => authenticate('/auth/register', { name, email, phone, password }, true);

  const updateProfile = useCallback(async (payload) => {
    try {
      const { data } = await api.put('/users/me', payload);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw apiError(err);
    }
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    toast('Signed out', { icon: '👋' });
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, loading, login, adminLogin, register, logout, updateProfile, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
