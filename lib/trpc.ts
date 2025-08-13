// lib/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { Platform } from 'react-native';
import { API, TRPC_URL } from './api';
import type { AppRouter } from '@/backend/trpc/app-router';
import { secureStorage } from '@/lib/storage';

// React Query tRPC client for useMutation, useQuery, etc.
export const trpc = createTRPCReact<AppRouter>();

// Direct tRPC client for direct calls
// Web only guard: Use relative path when API is on same host
const trpcUrl = Platform.OS === 'web' ? '/api/trpc' : TRPC_URL;

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: trpcUrl,
      async headers() {
        // attach session for protectedProcedure
        const token = await secureStorage.getItem('auth_token');
        const userData = await secureStorage.getItem('user_data');
        let userId = '';
        try { userId = userData ? JSON.parse(userData).id : ''; } catch {}
        return {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(userId ? { 'x-user-id': userId } : {}),
        };
      },
      transformer: superjson,
    }),
  ],
});

console.log('tRPC client configured with API:', API);