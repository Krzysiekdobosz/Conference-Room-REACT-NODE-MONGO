import { beforeEach, describe, expect, it } from 'vitest';
import { mockApi, resetDemo } from './mock';
import { setToken } from './token';

const tomorrowAt = (hour) => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const loginAs = async (email, password) => {
  const { token } = await mockApi.login(email, password);
  setToken(token);
};

describe('demo API', () => {
  beforeEach(() => {
    localStorage.clear();
    resetDemo();
    setToken(null);
  });

  it('logs in with a test account and rejects a wrong password', async () => {
    await expect(mockApi.login('user@example.com', 'nope')).rejects.toThrow('Invalid email or password');
    const { user } = await mockApi.login('user@example.com', 'user123');
    expect(user.role).toBe('user');
  });

  it('books a free slot and refuses an overlapping one', async () => {
    await loginAs('user@example.com', 'user123');
    const booking = { roomId: 'r1', title: 'Retro', start: tomorrowAt(14), end: tomorrowAt(15) };

    const created = await mockApi.createReservation(booking);
    expect(created.room.name).toBe('Aurora');
    await expect(mockApi.createReservation(booking)).rejects.toThrow('already booked');
  });

  it('marks rooms as unavailable for a booked range', async () => {
    const rooms = await mockApi.listRooms({ from: tomorrowAt(10), to: tomorrowAt(11) });
    expect(rooms.find((r) => r.name === 'Horizon').available).toBe(false);
    expect(rooms.find((r) => r.name === 'Aurora').available).toBe(true);
  });

  it('allows only admins to manage rooms', async () => {
    await loginAs('user@example.com', 'user123');
    await expect(mockApi.createRoom({ name: 'X', location: 'Y', capacity: 4 })).rejects.toThrow('Admin access required');

    await loginAs('admin@example.com', 'admin123');
    const room = await mockApi.createRoom({ name: 'Nova', location: 'Floor 4', capacity: 8 });
    expect(room.name).toBe('Nova');
  });
});
