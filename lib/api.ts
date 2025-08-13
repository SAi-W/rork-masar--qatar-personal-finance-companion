import { Platform } from 'react-native';

const ENV_API =
  process.env.EXPO_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

const base = (ENV_API ?? '').replace(/\/$/, '');
const httpsBase =
  Platform.OS === 'web' && base.startsWith('http://')
    ? base.replace('http://', 'https://')
    : base;

export const API = httpsBase;
export const TRPC_URL = `${httpsBase}/api/trpc`;

console.log('API base →', API);
console.log('TRPC URL →', TRPC_URL);

export async function api(path: string, opts?: RequestInit, token?: string) {
  const headers = {
    'content-type': 'application/json',
    ...(opts?.headers as any),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;
  const url = `${API}${path}`;
  try {
    const res = await fetch(url, { ...opts, headers, mode: 'cors', credentials: 'omit' });
    const text = await res.text();
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    try { return JSON.parse(text); } catch { return text as any; }
  } catch (e) {
    console.error('API request failed', { url, error: e });
    throw e;
  }
}

// Health check function for production API
export async function healthCheck() {
  const res = await fetch(`${API}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Expected JSON, got: ${text.slice(0,80)}…`);
  }
  const data = await res.json();
  return data;
}

// Quick connectivity test function
export async function ping() {
  try {
    const j = await healthCheck();
    console.log("API health:", j);
    return j;
  } catch (e) {
    console.warn("API unreachable:", e);
    throw e;
  }
}