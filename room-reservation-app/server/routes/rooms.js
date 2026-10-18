const express = require('express');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { HttpError, asyncHandler } = require('../utils/httpError');

const router = express.Router();

const ROOM_FIELDS = ['name', 'location', 'capacity', 'description', 'amenities'];
const pick = (body) => Object.fromEntries(ROOM_FIELDS.filter((key) => key in body).map((key) => [key, body[key]]));

// GET /api/rooms?minCapacity=6&from=...&to=...
// With `from` and `to` every room gets an `available` flag for that time range.
router.get('/', asyncHandler(async (req, res) => {
  const { minCapacity, from, to } = req.query;
  const filter = minCapacity ? { capacity: { $gte: Number(minCapacity) } } : {};
  const rooms = await Room.find(filter).sort({ name: 1 }).lean();

  if (!from || !to) {
    return res.json(rooms);
  }

  const busy = await Reservation.distinct('room', {
    start: { $lt: new Date(to) },
    end: { $gt: new Date(from) },
  });
  const busyIds = new Set(busy.map(String));

  res.json(rooms.map((room) => ({ ...room, available: !busyIds.has(String(room._id)) })));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw new HttpError(404, 'Room not found');
  res.json(room);
}));

// GET /api/rooms/:id/schedule?date=2024-06-01 – reservations of one room on a given day
router.get('/:id/schedule', asyncHandler(async (req, res) => {
  const day = req.query.date ? new Date(req.query.date) : new Date();
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const reservations = await Reservation.find({
    room: req.params.id,
    start: { $lt: dayEnd },
    end: { $gt: dayStart },
  })
    .sort({ start: 1 })
    .select('title start end');

  res.json(reservations);
}));

router.post('/', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const room = await Room.create(pick(req.body));
  res.status(201).json(room);
}));

router.put('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!room) throw new HttpError(404, 'Room not found');
  res.json(room);
}));

router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) throw new HttpError(404, 'Room not found');
  await Reservation.deleteMany({ room: room._id });
  res.status(204).end();
}));

module.exports = router;
