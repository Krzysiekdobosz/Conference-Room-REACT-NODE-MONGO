// server/routes/reservation.js
const express = require('express');
const Reservation = require('../models/Reservation');
const router = express.Router();

router.post('/', async (req, res) => {
  const reservation = new Reservation(req.body);
  await reservation.save();
  res.status(201).send(reservation);
});

router.get('/:roomId', async (req, res) => {
  const reservations = await Reservation.find({ room: req.params.roomId });
  res.send(reservations);
});

module.exports = router;
