import { getToken } from './token';

const request = async (path, { method = 'GET', body } = {}) => {
  const token = getToken();
  const response = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return data;
};

const query = (params) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== '');
  return entries.length ? `?${new URLSearchParams(entries)}` : '';
};

export const httpApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password } }),
  me: () => request('/auth/me').then((data) => data.user),

  listRooms: (params = {}) => request(`/rooms${query(params)}`),
  getRoom: (id) => request(`/rooms/${id}`),
  getSchedule: (id, date) => request(`/rooms/${id}/schedule${query({ date })}`),
  createRoom: (room) => request('/rooms', { method: 'POST', body: room }),
  updateRoom: (id, room) => request(`/rooms/${id}`, { method: 'PUT', body: room }),
  deleteRoom: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),

  listReservations: ({ all = false } = {}) => request(`/reservations${query({ all: all || undefined })}`),
  createReservation: (reservation) => request('/reservations', { method: 'POST', body: reservation }),
  cancelReservation: (id) => request(`/reservations/${id}`, { method: 'DELETE' }),
};
