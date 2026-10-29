require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { seedFacilitiesIfEmpty } = require('./services/seedFacilities');

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Configure the project .env file first.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 12000 });
  const result = await seedFacilitiesIfEmpty();
  console.log(result.seeded ? `Seed complete: ${result.count} facilities.` : `Seed skipped: MongoDB already contains ${result.count} facilities.`);
  await mongoose.disconnect();
}
main().catch(error => { console.error(error.message); process.exit(1); });
