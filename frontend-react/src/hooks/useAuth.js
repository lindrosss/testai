import { useCallback, useEffect, useState } from 'react';
import { api, setStoredToken, getStoredToken } from '../api/axios';
import { normalizeAuthUser } from '../utils/emailVerification.js';

/** Internal: mounted once in AuthProvider. */
export function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getStoredToken());
  const [error, setError] = useState(null);

  const getUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    const { data } = await api.get('/auth/user');
    const u = normalizeAuthUser(data.user);
    if (!u) {
      setStoredToken(null);
      setUser(null);
      return null;
    }
    setUser(u);
    return u;
  }, []);

  useEffect(() => {
    if (!getStoredToken()) {
      setLoading(false);
      return;
    }
    void getUser()
      .catch(() => {
        setUser(null);
        setStoredToken(null);
      })
      .finally(() => setLoading(false));
  }, [getUser]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setStoredToken(data.token);
      setUser(normalizeAuthUser(data.user));
      return data;
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation,
      });
      setStoredToken(data.token);
      setUser(normalizeAuthUser(data.user));
      return data;
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    setStoredToken(null);
    setUser(null);
  };

  const forgotPassword = async (email) => {
    setError(null);
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  };

  const resetPassword = async (email, password, password_confirmation, token) => {
    setError(null);
    const { data } = await api.post('/auth/reset-password', {
      email,
      password,
      password_confirmation,
      token,
    });
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put('/auth/profile', payload);
    setUser(normalizeAuthUser(data.user));
    return data;
  };

  const resendVerificationEmail = async () => {
    setError(null);
    const { data } = await api.post('/auth/resend-verification');
    return data;
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    getUser,
    updateProfile,
    resendVerificationEmail,
  };
}
