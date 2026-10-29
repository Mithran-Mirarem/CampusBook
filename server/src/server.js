require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env')
});



// This network's default DNS resolver refuses Node.js SRV lookups, even though
// ordinary nslookup succeeds. Use public resolvers before Mongoose parses the
// mongodb+srv:// URI. Override with DNS_SERVERS in .env if your network requires
// different resolvers (comma-separated IP addresses).
const dns = require('node:dns');
const dnsServers = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map(server => server.trim())
  .filter(Boolean);
dns.setServers(dnsServers);

const mongoose = require('mongoose');
const app = require('./app');
const { seedFacilitiesIfEmpty } = require('./services/seedFacilities');

const PORT = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;

async function start() {
  if (!mongoUri || !mongoUri.trim()) {
    throw new Error('MONGODB_URI is missing. Copy .env.example to .env and add your MongoDB Atlas or local MongoDB connection string.');
  }
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 12000 });
  console.log('MongoDB connected.');
  await seedFacilitiesIfEmpty();
  app.listen(PORT, () => console.log(`CampusBook Assignment 2 API running at http://localhost:${PORT}`));
}

start().catch(error => {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
