export const MAX_DURATION_HOURS = 12;

export const overlaps = (a, b) => new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end);

// Mirrors the server-side validation so the demo behaves like the real app.
export const validateRange = (start, end, now = new Date()) => {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Start and end must be valid dates';
  }
  if (start >= end) return 'The reservation must end after it starts';
  if (start < now) return 'Reservations cannot start in the past';
  if (end - start > MAX_DURATION_HOURS * 60 * 60 * 1000) {
    return `A reservation can last at most ${MAX_DURATION_HOURS} hours`;
  }
  return null;
};

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const toDateInput = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const toTimeInput = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

// Suggests the next full hour (one hour long) as the default booking slot.
export const nextSlot = (now = new Date()) => {
  const start = new Date(now);
  start.setHours(start.getHours() + 1, 0, 0, 0);
  if (start.getHours() < 8) start.setHours(8);
  if (start.getHours() >= 19) {
    start.setDate(start.getDate() + 1);
    start.setHours(9);
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { date: toDateInput(start), start: toTimeInput(start), end: toTimeInput(end) };
};

export const combine = (dateString, timeString) => new Date(`${dateString}T${timeString}`);

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export const formatTime = (value) => timeFormat.format(new Date(value));
export const formatDate = (value) => dateFormat.format(new Date(value));
export const formatRange = ({ start, end }) => `${formatDate(start)}, ${formatTime(start)}–${formatTime(end)}`;
