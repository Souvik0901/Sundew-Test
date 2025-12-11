require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const eventsRoute = require('./routes/events');
const holdsRoute = require('./routes/holds');
const statsRoute = require('./routes/stats');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
app.use('/events', eventsRoute);
app.use('/holds', holdsRoute);
app.use('/stats', statsRoute);

// PORT
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log('Connected to DB & listening on port', PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
