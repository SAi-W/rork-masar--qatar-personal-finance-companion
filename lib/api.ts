import { Platform } from 'react-native';
import Constants from 'expo-constants';

const ENV_API =
  process.env.EXPO_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_RORK_API_BASE_URL; // Rork preview compatibility

function resolveDevLanHost(): string | null {
  try {
    const anyConst = Constants as unknown as Record<string, any>;
    const candidates: (string | undefined)[] = [
      anyConst?.expoConfig?.hostUri,
      anyConst?.manifest?.debuggerHost,
      anyConst?.manifest2?.extra?.expoGo?.debuggerHost,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.length > 0) {
        const host = c.split(':')[0];
        if (host && host !== 'localhost' && host !== '127.0.0.1') return host;
      }
    }
  } catch {}
  return null;
}

function resolveDefaultApiBase(): string {
  if (__DEV__) {
    if (ENV_API) return ENV_API;
    const lan = resolveDevLanHost();
    if (lan) return `http://${lan}/api`.replace(/\/api$/, ''); // we append /api later
  }
  return 'https://rork-masar-qatar-personal-finance.onrender.com';
}

export const API = resolveDefaultApiBase().replace(/\/$/, '');
console.log('API base →', API);

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

// Deals API
export const dealsAPI = {
  // Get all deals with optional filtering
  async getDeals(filters?: {
    category?: string;
    location?: string;
    search?: string;
    sortBy?: 'popular' | 'recent' | 'expiring' | 'relevance' | 'best_value' | 'trending';
    minPrice?: number;
    maxPrice?: number;
    minDiscount?: number;
    maxDiscount?: number;
    limit?: number;
    offset?: number;
    userId?: string;
  }, token?: string) {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.location) queryParams.append('location', filters.location);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters?.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters?.minDiscount !== undefined) queryParams.append('minDiscount', filters.minDiscount.toString());
      if (filters?.maxDiscount !== undefined) queryParams.append('maxDiscount', filters.maxDiscount.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.offset) queryParams.append('offset', filters.offset.toString());
      if (filters?.userId) queryParams.append('userId', filters.userId);

      const response = await fetch(`${API}/api/trpc/deals.list?input=${encodeURIComponent(JSON.stringify(Object.fromEntries(queryParams)))}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result.data;
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  },

  // Create a new deal
  async createDeal(dealData: {
    title: string;
    merchant: string;
    description: string;
    category: string;
    amount: number;
    discount: number;
    validUntil: string;
    location?: string;
    imageUrl?: string;
  }, token?: string) {
    try {
      const response = await fetch(`${API}/api/trpc/deals.create`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          input: dealData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result.data;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  },

  // Upvote/unupvote a deal
  async upvoteDeal(dealId: string, token?: string) {
    try {
      const response = await fetch(`${API}/api/trpc/deals.upvote`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          input: { dealId },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result.data;
    } catch (error) {
      console.error('Error upvoting deal:', error);
      throw error;
    }
  },

  // Get trending deals
  async getTrendingDeals(limit: number = 10, token?: string) {
    try {
      const response = await fetch(`${API}/api/trpc/deals.list?input=${encodeURIComponent(JSON.stringify({ sortBy: 'popular', limit }))}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result.data.deals;
    } catch (error) {
      console.error('Error fetching trending deals:', error);
      throw error;
    }
  },

  // Get deals by category
  async getDealsByCategory(category: string, token?: string) {
    try {
      const response = await fetch(`${API}/api/trpc/deals.list?input=${encodeURIComponent(JSON.stringify({ category }))}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result.data.deals;
    } catch (error) {
      console.error('Error fetching deals by category:', error);
      throw error;
    }
  },

  // Get deals by location
  async getDealsByLocation(location: string, token?: string) {
    try {
      const response = await fetch(`${API}/api/trpc/deals.list?input=${encodeURIComponent(JSON.stringify({ location }))}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result.data.deals;
    } catch (error) {
      console.error('Error fetching deals by location:', error);
      throw error;
    }
  },

  // Get deal statistics
  async getDealStats(token?: string) {
    try {
      const response = await fetch(`${API}/api/trpc/deals.list`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result.data.stats;
    } catch (error) {
      console.error('Error fetching deal stats:', error);
      throw error;
    }
  },
};

// Production-specific API functions for compatibility
export const productionAPI = {
  // Test the production backend connectivity
  async testConnectivity() {
    try {
      const healthResponse = await fetch(`${API}/health`);
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      
      const trpcTestResponse = await fetch(`${API}/api/trpc-test`);
      if (!trpcTestResponse.ok) {
        throw new Error(`tRPC test failed: ${trpcTestResponse.status}`);
      }
      
      return {
        success: true,
        health: await healthResponse.json(),
        trpcTest: await trpcTestResponse.json()
      };
    } catch (error) {
      console.error('Production API connectivity test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Test AI Coach with production format
  async testAICoach(message: string) {
    try {
      // Try the new format first
      const response = await fetch(`${API}/api/trpc/aiCoach.chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "0": {
            "json": {
              "message": message,
              "conversationHistory": []
            }
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('AI Coach test failed:', response.status, errorText);
        
        // Try alternative format if the first one fails
        const altResponse = await fetch(`${API}/api/trpc/aiCoach.chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            conversationHistory: []
          }),
        });

        if (!altResponse.ok) {
          throw new Error(`AI Coach failed with both formats: ${response.status}, ${altResponse.status}`);
        }

        return await altResponse.json();
      }

      return await response.json();
    } catch (error) {
      console.error('AI Coach test error:', error);
      throw error;
    }
  },

  // Test Deals with production format
  async testDeals() {
    try {
      // Try GET request first (as the error suggested)
      const getResponse = await fetch(`${API}/api/trpc/deals.list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!getResponse.ok) {
        const errorText = await getResponse.text();
        console.log('Deals GET test failed:', getResponse.status, errorText);
        
        // Try POST request with proper format
        const postResponse = await fetch(`${API}/api/trpc/deals.list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "0": {
              "json": {}
            }
          }),
        });

        if (!postResponse.ok) {
          throw new Error(`Deals failed with both methods: GET ${getResponse.status}, POST ${postResponse.status}`);
        }

        return await postResponse.json();
      }

      return await getResponse.json();
    } catch (error) {
      console.error('Deals test error:', error);
      throw error;
    }
  }
};