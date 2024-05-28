// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

mongoose.connect('mongodb://localhost:27017/room-reservation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.json());

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
// server/index.js
const userRouter = require('./routes/user');
const roomRouter = require('./routes/room');
const reservationRouter = require('./routes/reservation');

app.use('/api/users', userRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/reservations', reservationRouter);
