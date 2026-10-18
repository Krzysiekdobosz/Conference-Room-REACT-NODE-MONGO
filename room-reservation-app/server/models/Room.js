const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    description: { type: String, default: '', trim: true },
    amenities: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', RoomSchema);
