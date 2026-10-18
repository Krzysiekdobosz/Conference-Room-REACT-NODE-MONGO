const MAX_DURATION_HOURS = 12;

const overlaps = (a, b) => a.start < b.end && b.start < a.end;

// Returns an error message for an invalid time range, or null when it is fine.
const validateRange = (start, end, now = new Date()) => {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Start and end must be valid dates';
  }
  if (start >= end) {
    return 'The reservation must end after it starts';
  }
  if (start < now) {
    return 'Reservations cannot start in the past';
  }
  if (end - start > MAX_DURATION_HOURS * 60 * 60 * 1000) {
    return `A reservation can last at most ${MAX_DURATION_HOURS} hours`;
  }
  return null;
};

module.exports = { overlaps, validateRange, MAX_DURATION_HOURS };
