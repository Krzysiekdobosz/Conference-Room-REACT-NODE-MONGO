const test = require('node:test');
const assert = require('node:assert');
const { overlaps, validateRange } = require('../utils/reservations');

const now = new Date('2030-01-01T08:00:00Z');
const d = (time) => new Date(`2030-01-01T${time}:00Z`);

test('detects overlapping time ranges', () => {
  assert.ok(overlaps({ start: d('09:00'), end: d('10:00') }, { start: d('09:30'), end: d('11:00') }));
  assert.ok(!overlaps({ start: d('09:00'), end: d('10:00') }, { start: d('10:00'), end: d('11:00') }));
});

test('accepts a valid range', () => {
  assert.strictEqual(validateRange(d('09:00'), d('10:00'), now), null);
});

test('rejects ranges that end before they start', () => {
  assert.match(validateRange(d('10:00'), d('09:00'), now), /end after/);
});

test('rejects ranges in the past', () => {
  assert.match(validateRange(d('07:00'), d('07:30'), now), /past/);
});

test('rejects ranges longer than the limit', () => {
  assert.match(validateRange(d('09:00'), new Date('2030-01-02T09:00:00Z'), now), /at most/);
});
