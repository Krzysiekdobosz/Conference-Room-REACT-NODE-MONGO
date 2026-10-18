const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { timestamps: true }
);

ReservationSchema.index({ room: 1, start: 1, end: 1 });

module.exports = mongoose.model('Reservation', ReservationSchema);
