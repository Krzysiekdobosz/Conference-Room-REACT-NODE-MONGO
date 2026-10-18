const express = require('express');
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const { authenticate } = require('../middleware/auth');
const { HttpError, asyncHandler } = require('../utils/httpError');
const { validateRange } = require('../utils/reservations');

const router = express.Router();

router.use(authenticate);

// Users see their own reservations; admins can pass ?all=true to see everything.
router.get('/', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { user: req.user._id };
  const reservations = await Reservation.find(filter)
    .sort({ start: 1 })
    .populate('room', 'name location')
    .populate('user', 'name email');

  res.json(reservations);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { roomId, title } = req.body;
  const start = new Date(req.body.start);
  const end = new Date(req.body.end);

  if (!roomId || !title?.trim()) {
    throw new HttpError(400, 'Room and title are required');
  }

  const rangeError = validateRange(start, end);
  if (rangeError) throw new HttpError(400, rangeError);

  const room = await Room.findById(roomId);
  if (!room) throw new HttpError(404, 'Room not found');

  const conflict = await Reservation.exists({ room: room._id, start: { $lt: end }, end: { $gt: start } });
  if (conflict) {
    throw new HttpError(409, 'The room is already booked in this time slot');
  }

  const reservation = await Reservation.create({ room: room._id, user: req.user._id, title, start, end });
  await reservation.populate('room', 'name location');
  res.status(201).json(reservation);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new HttpError(404, 'Reservation not found');

  const isOwner = reservation.user.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new HttpError(403, 'You can only cancel your own reservations');
  }

  await reservation.deleteOne();
  res.status(204).end();
}));

module.exports = router;
