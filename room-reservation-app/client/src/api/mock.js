// In-browser implementation of the API used by the GitHub Pages demo.
// Data lives in localStorage, so every visitor gets their own sandbox.
import { getToken } from './token';
import { overlaps, startOfDay, validateRange } from '../utils/time';

const DB_KEY = 'roombook:demo-db';
const LATENCY_MS = 150;

export const DEMO_ACCOUNTS = [
  { email: 'user@example.com', password: 'user123', label: 'User' },
  { email: 'admin@example.com', password: 'admin123', label: 'Admin' },
];

const at = (dayOffset, hour, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minutes, 0, 0);
  return date.toISOString();
};

const createSeed = () => ({
  users: [
    { _id: 'u1', name: 'Anna Nowak', email: 'user@example.com', password: 'user123', role: 'user' },
    { _id: 'u2', name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { _id: 'u3', name: 'Piotr Wiśniewski', email: 'piotr@example.com', password: 'piotr123', role: 'user' },
  ],
  rooms: [
    { _id: 'r1', name: 'Aurora', location: 'Floor 1', capacity: 6, description: 'Small room for quick team meetings.', amenities: ['TV screen', 'Whiteboard'] },
    { _id: 'r2', name: 'Horizon', location: 'Floor 2', capacity: 12, description: 'Bright room with a view, ideal for workshops.', amenities: ['Projector', 'Whiteboard', 'Video conferencing'] },
    { _id: 'r3', name: 'Summit', location: 'Floor 3', capacity: 24, description: 'Large boardroom for presentations and all-hands.', amenities: ['Projector', 'Sound system', 'Video conferencing'] },
    { _id: 'r4', name: 'Focus', location: 'Floor 2', capacity: 2, description: 'Quiet booth for calls and 1:1s.', amenities: ['Monitor'] },
    { _id: 'r5', name: 'Atrium', location: 'Ground floor', capacity: 40, description: 'Open space for trainings and company events.', amenities: ['Projector', 'Sound system', 'Catering area'] },
  ],
  reservations: [
    { _id: 'b1', room: 'r1', user: 'u1', title: 'Daily stand-up', start: at(0, 9), end: at(0, 9, 30) },
    { _id: 'b2', room: 'r2', user: 'u1', title: 'Sprint planning', start: at(1, 10), end: at(1, 12) },
    { _id: 'b3', room: 'r3', user: 'u2', title: 'Quarterly review', start: at(2, 13), end: at(2, 15) },
    { _id: 'b4', room: 'r2', user: 'u3', title: 'UX workshop', start: at(0, 13), end: at(0, 16) },
    { _id: 'b5', room: 'r4', user: 'u3', title: 'Client call', start: at(1, 11), end: at(1, 11, 45) },
    { _id: 'b6', room: 'r5', user: 'u2', title: 'Onboarding training', start: at(3, 9), end: at(3, 12) },
  ],
});

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(DB_KEY));
    if (saved?.rooms) return saved;
  } catch {
    // Fall through to a fresh seed.
  }
  return createSeed();
};

let db = load();

const save = () => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // The demo still works in memory.
  }
};

export const resetDemo = () => {
  db = createSeed();
  save();
};

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), LATENCY_MS));
const fail = (message) => new Promise((_, reject) => setTimeout(() => reject(new Error(message)), LATENCY_MS));
const newId = () => Math.random().toString(36).slice(2, 10);

const publicUser = ({ _id, name, email, role }) => ({ id: _id, name, email, role });

const currentUser = () => {
  const token = getToken();
  const id = token?.startsWith('demo:') ? token.slice(5) : null;
  return db.users.find((user) => user._id === id) || null;
};

const populate = (reservation) => {
  const room = db.rooms.find((r) => r._id === reservation.room);
  const user = db.users.find((u) => u._id === reservation.user);
  return {
    ...reservation,
    room: room ? { _id: room._id, name: room.name, location: room.location } : null,
    user: user ? { _id: user._id, name: user.name, email: user.email } : null,
  };
};

const requireUser = () => {
  const user = currentUser();
  if (!user) throw new Error('Authentication required');
  return user;
};

const requireAdmin = () => {
  const user = requireUser();
  if (user.role !== 'admin') throw new Error('Admin access required');
  return user;
};

// Runs a handler and converts thrown errors into rejected promises with the same latency.
const handle = (fn) => {
  try {
    return delay(fn());
  } catch (error) {
    return fail(error.message);
  }
};

const sanitizeRoom = ({ name, location, capacity, description = '', amenities = [] }) => {
  if (!name?.trim() || !location?.trim()) throw new Error('Name and location are required');
  if (!(Number(capacity) >= 1)) throw new Error('Capacity must be at least 1');
  return { name: name.trim(), location: location.trim(), capacity: Number(capacity), description: description.trim(), amenities };
};

export const mockApi = {
  login: (email, password) =>
    handle(() => {
      const user = db.users.find((u) => u.email === String(email).toLowerCase() && u.password === password);
      if (!user) throw new Error('Invalid email or password');
      return { token: `demo:${user._id}`, user: publicUser(user) };
    }),

  register: (name, email, password) =>
    handle(() => {
      if (!name || !email || !password) throw new Error('Name, email and password are required');
      if (password.length < 6) throw new Error('Password must be at least 6 characters long');
      if (db.users.some((u) => u.email === email.toLowerCase())) throw new Error('This email is already registered');
      const user = { _id: newId(), name, email: email.toLowerCase(), password, role: 'user' };
      db.users.push(user);
      save();
      return { token: `demo:${user._id}`, user: publicUser(user) };
    }),

  me: () => handle(() => publicUser(requireUser())),

  listRooms: ({ minCapacity, from, to } = {}) =>
    handle(() => {
      const rooms = db.rooms
        .filter((room) => !minCapacity || room.capacity >= Number(minCapacity))
        .sort((a, b) => a.name.localeCompare(b.name));
      if (!from || !to) return rooms;
      return rooms.map((room) => ({
        ...room,
        available: !db.reservations.some((r) => r.room === room._id && overlaps(r, { start: from, end: to })),
      }));
    }),

  getRoom: (id) =>
    handle(() => {
      const room = db.rooms.find((r) => r._id === id);
      if (!room) throw new Error('Room not found');
      return room;
    }),

  getSchedule: (id, date) =>
    handle(() => {
      const dayStart = startOfDay(date ? new Date(date) : new Date());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      return db.reservations
        .filter((r) => r.room === id && overlaps(r, { start: dayStart, end: dayEnd }))
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .map(({ _id, title, start, end }) => ({ _id, title, start, end }));
    }),

  createRoom: (input) =>
    handle(() => {
      requireAdmin();
      const room = { _id: newId(), ...sanitizeRoom(input) };
      db.rooms.push(room);
      save();
      return room;
    }),

  updateRoom: (id, input) =>
    handle(() => {
      requireAdmin();
      const index = db.rooms.findIndex((r) => r._id === id);
      if (index === -1) throw new Error('Room not found');
      db.rooms[index] = { ...db.rooms[index], ...sanitizeRoom(input) };
      save();
      return db.rooms[index];
    }),

  deleteRoom: (id) =>
    handle(() => {
      requireAdmin();
      db.rooms = db.rooms.filter((r) => r._id !== id);
      db.reservations = db.reservations.filter((r) => r.room !== id);
      save();
      return null;
    }),

  listReservations: ({ all = false } = {}) =>
    handle(() => {
      const user = requireUser();
      return db.reservations
        .filter((r) => (all && user.role === 'admin') || r.user === user._id)
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .map(populate);
    }),

  createReservation: ({ roomId, title, start, end }) =>
    handle(() => {
      const user = requireUser();
      if (!roomId || !title?.trim()) throw new Error('Room and title are required');
      const rangeError = validateRange(new Date(start), new Date(end));
      if (rangeError) throw new Error(rangeError);
      if (!db.rooms.some((r) => r._id === roomId)) throw new Error('Room not found');
      if (db.reservations.some((r) => r.room === roomId && overlaps(r, { start, end }))) {
        throw new Error('The room is already booked in this time slot');
      }
      const reservation = {
        _id: newId(),
        room: roomId,
        user: user._id,
        title: title.trim(),
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      };
      db.reservations.push(reservation);
      save();
      return populate(reservation);
    }),

  cancelReservation: (id) =>
    handle(() => {
      const user = requireUser();
      const reservation = db.reservations.find((r) => r._id === id);
      if (!reservation) throw new Error('Reservation not found');
      if (reservation.user !== user._id && user.role !== 'admin') {
        throw new Error('You can only cancel your own reservations');
      }
      db.reservations = db.reservations.filter((r) => r._id !== id);
      save();
      return null;
    }),
};
