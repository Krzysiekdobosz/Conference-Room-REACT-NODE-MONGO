// server/routes/room.js
const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

router.post('/', async (req, res) => {
  const room = new Room(req.body);
  await room.save();
  res.status(201).send(room);
});

router.get('/', async (req, res) => {
  const rooms = await Room.find();
  res.send(rooms);
});

module.exports = router;
