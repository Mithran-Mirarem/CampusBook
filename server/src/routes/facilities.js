const express = require('express');
const Facility = require('../models/Facility');
const Booking = require('../models/Booking');
const { isValidId, escapeRegex } = require('../utils');

const router = express.Router();
const allowedTypes = ['Laboratory', 'Hall', 'Auditorium', 'Classroom', 'Sports'];

function validateFacility(body) {
  const name = String(body.name || '').trim();
  const type = String(body.type || '').trim();
  const location = String(body.location || '').trim();
  const description = String(body.description || '').trim();
  const capacity = Number(body.capacity);
  if (name.length < 2 || name.length > 120) return 'Facility name must contain 2 to 120 characters.';
  if (!allowedTypes.includes(type)) return 'Select a valid facility type.';
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) return 'Capacity must be a whole number between 1 and 10000.';
  if (location.length < 2 || location.length > 120) return 'Enter a valid facility location.';
  if (description.length < 5 || description.length > 500) return 'Description must contain 5 to 500 characters.';
  return null;
}

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type && allowedTypes.includes(req.query.type)) filter.type = req.query.type;
    if (req.query.q) {
      const regex = new RegExp(escapeRegex(req.query.q.trim()), 'i');
      filter.$or = [{ name: regex }, { location: regex }, { type: regex }, { description: regex }];
    }
    const facilities = await Facility.find(filter).sort({ type: 1, name: 1 }).lean();
    res.json(facilities);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid facility ID.' });
    const facility = await Facility.findById(req.params.id).lean();
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });
    res.json(facility);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const errorMessage = validateFacility(req.body);
    if (errorMessage) return res.status(400).json({ message: errorMessage });
    const facility = await Facility.create({
      name: req.body.name.trim(), type: req.body.type, capacity: Number(req.body.capacity),
      location: req.body.location.trim(), description: req.body.description.trim()
    });
    res.status(201).json({ message: 'Facility created successfully.', facility });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid facility ID.' });
    const errorMessage = validateFacility(req.body);
    if (errorMessage) return res.status(400).json({ message: errorMessage });
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });

    const capacity = Number(req.body.capacity);
    const incompatibleBooking = await Booking.findOne({
      facility: facility._id,
      status: { $nin: ['Cancelled', 'Rejected'] },
      peopleCount: { $gt: capacity }
    }).lean();
    if (incompatibleBooking) {
      return res.status(409).json({ message: `Capacity cannot be reduced below ${incompatibleBooking.peopleCount} because an existing booking requests that many people.` });
    }

    facility.name = req.body.name.trim();
    facility.type = req.body.type;
    facility.capacity = capacity;
    facility.location = req.body.location.trim();
    facility.description = req.body.description.trim();
    await facility.save();
    await Booking.updateMany({ facility: facility._id }, { $set: { facilityName: facility.name } });
    res.json({ message: 'Facility updated successfully.', facility });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid facility ID.' });
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });
    const bookingCount = await Booking.countDocuments({ facility: facility._id });
    if (bookingCount > 0) {
      return res.status(409).json({ message: 'This facility has booking history. Cancel or remove its bookings before deleting the facility.' });
    }
    await facility.deleteOne();
    res.json({ message: 'Facility deleted successfully.' });
  } catch (error) { next(error); }
});

module.exports = router;
