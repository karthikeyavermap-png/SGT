import {
  LoginInput,
  RegisterInput,
  UserProfile,
  TicketResponse,
  CreateTicketInput,
  UpdateTicketInput,
  CreateCommentInput,
  CommentResponse,
  TicketStats,
} from '@repo/shared';

let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

const API_BASE = '/api';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (inMemoryAccessToken) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Ensures HTTP-only refresh cookies are sent
  };

  let response = await fetch(`${API_BASE}${endpoint}`, config);

  // If 401 and not already attempting refresh, try silent token refresh
  if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.data?.accessToken) {
          setAccessToken(refreshData.data.accessToken);
          // Retry original request with new token
          headers.set('Authorization', `Bearer ${refreshData.data.accessToken}`);
          response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include',
          });
        }
      }
    } catch (refreshErr) {
      console.warn('Failed to refresh token', refreshErr);
    }
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    const errorMsg = json?.error?.message || response.statusText || 'Request failed';
    throw new Error(errorMsg);
  }

  return json.data as T;
}

// Typed API modules
export const authApi = {
  login: async (input: LoginInput) => {
    const res = await apiFetch<{ user: UserProfile; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setAccessToken(res.accessToken);
    return res;
  },
  register: async (input: RegisterInput) => {
    const res = await apiFetch<{ user: UserProfile; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setAccessToken(res.accessToken);
    return res;
  },
  refresh: async () => {
    const res = await apiFetch<{ user: UserProfile; accessToken: string }>('/auth/refresh', {
      method: 'POST',
    });
    setAccessToken(res.accessToken);
    return res;
  },
  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
    }
  },
  getMe: async () => {
    return apiFetch<UserProfile>('/auth/me');
  },
};

export const ticketsApi = {
  list: async (filters?: { status?: string; priority?: string; search?: string; assignedToMe?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.assignedToMe) params.set('assignedToMe', 'true');

    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<TicketResponse[]>(`/tickets${qs}`);
  },
  get: async (id: string) => {
    return apiFetch<TicketResponse>(`/tickets/${id}`);
  },
  create: async (input: CreateTicketInput) => {
    return apiFetch<TicketResponse>('/tickets', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update: async (id: string, input: UpdateTicketInput) => {
    return apiFetch<TicketResponse>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  addComment: async (id: string, input: CreateCommentInput) => {
    return apiFetch<CommentResponse>(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  getStats: async () => {
    return apiFetch<TicketStats>('/stats');
  },
  getAgents: async () => {
    return apiFetch<Array<{ id: string; name: string; email: string; role: string; avatarUrl?: string }>>('/agents');
  },
};

