import type {
  CreateSessionInput,
  UpdateSessionInput,
} from '@/shared/schemas/session';

export type Session = {
  id: string;
  title: string;
  bpm: number | null;
  createdAt: string;
  updatedAt: string;
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message || 'Request failed';
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  sessions: {
    list: () => request<{ sessions: Session[] }>('/api/sessions'),
    create: (input: CreateSessionInput) =>
      request<{ session: Session }>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    get: (id: string) => request<{ session: Session }>(`/api/sessions/${id}`),
    update: (id: string, input: UpdateSessionInput) =>
      request<{ session: Session }>(`/api/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    delete: (id: string) =>
      request<{ ok: true }>(`/api/sessions/${id}`, { method: 'DELETE' }),
  },
};
