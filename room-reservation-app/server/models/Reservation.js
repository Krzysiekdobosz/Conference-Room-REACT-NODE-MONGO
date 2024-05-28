// server/models/Reservation.js
const mongoose = require('mongoose');
const ReservationSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
});
module.exports = mongoose.model('Reservation', ReservationSchema);
