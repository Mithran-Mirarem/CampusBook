const fs = require('fs');
const path = require('path');
const Facility = require('../models/Facility');

async function seedFacilitiesIfEmpty() {
  const count = await Facility.countDocuments();
  if (count > 0) return { seeded: false, count };

  const source = path.join(__dirname, '../../data/facilities.json');
  const facilities = JSON.parse(fs.readFileSync(source, 'utf8'));
  if (!Array.isArray(facilities) || facilities.length === 0) {
    throw new Error('The facility seed file is empty or invalid.');
  }

  const clean = facilities.map(({ name, type, capacity, location, description }) => ({
    name, type, capacity: Number(capacity), location, description
  }));
  await Facility.insertMany(clean, { ordered: true });
  console.log(`Seeded ${clean.length} campus facilities into MongoDB.`);
  return { seeded: true, count: clean.length };
}

module.exports = { seedFacilitiesIfEmpty };
