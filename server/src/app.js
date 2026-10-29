const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const facilitiesRouter = require('./routes/facilities');
const bookingsRouter = require('./routes/bookings');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/facilities', facilitiesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api', (_req, res) => res.status(404).json({ message: 'API endpoint not found.' }));

const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res, next) => {
  res.sendFile(path.join(clientDist, 'index.html'), error => {
    if (error) next();
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body must be valid JSON.' });
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large.' });
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier or data format.' });
  res.status(500).json({ message: 'Unexpected server error. Check the terminal for details.' });
});

module.exports = app;
