import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { api } from '@/lib/api';

type AuthState = { token: string | null; loading: boolean };

export const [AuthProvider2, useAuth2] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({ token: null, loading: true });

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('auth_token');
      setState({ token, loading: false });
    })();
  }, []);

  const signup = async (email: string, password: string) => {
    const r = await api('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) });
    await AsyncStorage.setItem('auth_token', r.token);
    setState({ token: r.token, loading: false });
  };

  const login = async (email: string, password: string) => {
    const r = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    await AsyncStorage.setItem('auth_token', r.token);
    setState({ token: r.token, loading: false });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setState({ token: null, loading: false });
  };

  return { ...state, signup, login, logout };
});

