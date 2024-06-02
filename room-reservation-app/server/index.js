// index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const userRouter = require('./routes/user');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/room-reservation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Connection error', error);
});
const roomsRoute = require('./routes/rooms');
const reservationsRoute = require('./routes/reservations');
// Use routes
app.use('/api/users', userRouter);
// Use routes
app.use('/api/rooms', roomsRoute);
app.use('/api/reservations', reservationsRoute);



// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Serve React app
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
