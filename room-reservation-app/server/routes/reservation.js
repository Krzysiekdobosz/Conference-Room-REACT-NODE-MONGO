// server/routes/reservation.js
const express = require('express');
const Reservation = require('../models/Reservation');
const router = express.Router();


router.use(authenticate);

router.post('/', async (req, res) => {
  const { roomId, startDate, endDate } = req.body;
  try {
    const reservation = new Reservation({ userId: req.userId, roomId, startDate, endDate });
    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error });
  }
});

router.get('/:roomId', async (req, res) => {
  const reservations = await Reservation.find({ room: req.params.roomId });
  res.send(reservations);
});

module.exports = router;
