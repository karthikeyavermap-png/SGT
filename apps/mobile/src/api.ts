import { Platform } from 'react-native';
import { tokenStorage } from './storage';
import {
  LoginInput,
  UserProfile,
  TicketResponse,
  CreateTicketInput,
  UpdateTicketInput,
  CreateCommentInput,
  CommentResponse,
  TicketStats,
} from '@repo/shared';

// For Android emulator 10.0.2.2, for iOS simulator or web localhost:4000
const DEV_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';

export const API_BASE = DEV_API_URL;

const ACCESS_TOKEN_KEY = 'pulsedesk_access_token';
const REFRESH_TOKEN_KEY = 'pulsedesk_refresh_token';

let cachedAccessToken: string | null = null;

export async function getStoredTokens() {
  const [access, refresh] = await Promise.all([
    tokenStorage.getItem(ACCESS_TOKEN_KEY),
    tokenStorage.getItem(REFRESH_TOKEN_KEY),
  ]);
  cachedAccessToken = access;
  return { accessToken: access, refreshToken: refresh };
}

export async function setStoredTokens(accessToken: string, refreshToken?: string) {
  cachedAccessToken = accessToken;
  await tokenStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await tokenStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function clearStoredTokens() {
  cachedAccessToken = null;
  await Promise.all([
    tokenStorage.removeItem(ACCESS_TOKEN_KEY),
    tokenStorage.removeItem(REFRESH_TOKEN_KEY),
  ]);
}

export async function mobileApiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (!cachedAccessToken) {
    cachedAccessToken = await tokenStorage.getItem(ACCESS_TOKEN_KEY);
  }

  if (cachedAccessToken) {
    headers.set('Authorization', `Bearer ${cachedAccessToken}`);
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Attempt silent refresh on 401
  if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
    const refreshToken = await tokenStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.data?.accessToken) {
            await setStoredTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
            headers.set('Authorization', `Bearer ${refreshData.data.accessToken}`);
            response = await fetch(`${API_BASE}${endpoint}`, {
              ...options,
              headers,
            });
          }
        }
      } catch (e) {
        console.warn('Mobile token refresh failed', e);
      }
    }
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    const errorMsg = json?.error?.message || response.statusText || 'Request failed';
    throw new Error(errorMsg);
  }

  return json.data as T;
}

export const mobileAuthApi = {
  login: async (input: LoginInput) => {
    const res = await mobileApiFetch<{
      user: UserProfile;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    await setStoredTokens(res.accessToken, res.refreshToken);
    return res;
  },
  logout: async () => {
    const refreshToken = await tokenStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      if (refreshToken) {
        await mobileApiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } finally {
      await clearStoredTokens();
    }
  },
  getMe: async () => {
    return mobileApiFetch<UserProfile>('/auth/me');
  },
};

export const mobileTicketsApi = {
  list: async (filters?: { status?: string; priority?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.search) params.set('search', filters.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    return mobileApiFetch<TicketResponse[]>(`/tickets${qs}`);
  },
  get: async (id: string) => {
    return mobileApiFetch<TicketResponse>(`/tickets/${id}`);
  },
  create: async (input: CreateTicketInput) => {
    return mobileApiFetch<TicketResponse>('/tickets', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update: async (id: string, input: UpdateTicketInput) => {
    return mobileApiFetch<TicketResponse>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  addComment: async (id: string, input: CreateCommentInput) => {
    return mobileApiFetch<CommentResponse>(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  getStats: async () => {
    return mobileApiFetch<TicketStats>('/stats');
  },
};

