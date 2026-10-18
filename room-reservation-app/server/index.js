const mongoose = require('mongoose');
const { mongoUri, port } = require('./config/env');
const app = require('./app');

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  });
