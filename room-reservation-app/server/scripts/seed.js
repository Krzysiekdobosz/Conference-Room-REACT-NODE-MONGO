const mongoose = require('mongoose');
const { mongoUri } = require('../config/env');
const User = require('../models/User');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');

const rooms = [
  { name: 'Aurora', location: 'Floor 1', capacity: 6, description: 'Small room for quick team meetings.', amenities: ['TV screen', 'Whiteboard'] },
  { name: 'Horizon', location: 'Floor 2', capacity: 12, description: 'Bright room with a view, ideal for workshops.', amenities: ['Projector', 'Whiteboard', 'Video conferencing'] },
  { name: 'Summit', location: 'Floor 3', capacity: 24, description: 'Large boardroom for presentations.', amenities: ['Projector', 'Sound system', 'Video conferencing'] },
  { name: 'Focus', location: 'Floor 2', capacity: 2, description: 'Quiet booth for calls and 1:1s.', amenities: ['Monitor'] },
];

const at = (dayOffset, hour, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minutes, 0, 0);
  return date;
};

const seed = async () => {
  await mongoose.connect(mongoUri);
  await Promise.all([User.deleteMany({}), Room.deleteMany({}), Reservation.deleteMany({})]);

  const [admin, user] = await User.create([
    { name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { name: 'Anna Nowak', email: 'user@example.com', password: 'user123' },
  ]);
  const [aurora, horizon, summit] = await Room.insertMany(rooms);

  await Reservation.insertMany([
    { room: aurora._id, user: user._id, title: 'Daily stand-up', start: at(1, 9), end: at(1, 9, 30) },
    { room: horizon._id, user: user._id, title: 'Sprint planning', start: at(1, 10), end: at(1, 12) },
    { room: summit._id, user: admin._id, title: 'Quarterly review', start: at(2, 13), end: at(2, 15) },
  ]);

  console.log('Database seeded. Logins: admin@example.com / admin123, user@example.com / user123');
  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
