const express = require('express');
const Booking = require('../models/Booking');
const Facility = require('../models/Facility');
const { isValidId, escapeRegex, validateBooking } = require('../utils');

const router = express.Router();
const activeStatuses = { $nin: ['Cancelled', 'Rejected'] };

async function checkFacilityAndConflict(data, excludedBookingId = null) {
  const facility = await Facility.findById(data.facilityId);
  if (!facility) return { error: 'Facility not found.', status: 404 };
  const peopleCount = Number(data.peopleCount);
  if (peopleCount > facility.capacity) {
    return { error: `Only ${facility.capacity} people can be booked for ${facility.name}. You requested ${peopleCount}.`, status: 400 };
  }
  const query = {
    facility: facility._id,
    date: data.date,
    status: activeStatuses,
    startTime: { $lt: data.endTime },
    endTime: { $gt: data.startTime }
  };
  if (excludedBookingId) query._id = { $ne: excludedBookingId };
  const conflict = await Booking.findOne(query).lean();
  if (conflict) {
    return { error: `${facility.name} is already booked from ${conflict.startTime} to ${conflict.endTime} on ${conflict.date}. Choose another time.`, status: 409 };
  }
  return { facility };
}

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status && ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.date) filter.date = req.query.date;
    if (req.query.q) {
      const regex = new RegExp(escapeRegex(req.query.q.trim()), 'i');
      filter.$or = [{ studentName: regex }, { rollNumber: regex }, { facilityName: regex }, { purpose: regex }];
    }
    const bookings = await Booking.find(filter).sort({ date: -1, startTime: -1 }).lean();
    res.json(bookings);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid booking ID.' });
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json(booking);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const validationError = validateBooking(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    const checked = await checkFacilityAndConflict(req.body);
    if (checked.error) return res.status(checked.status).json({ message: checked.error });

    const booking = await Booking.create({
      studentName: String(req.body.studentName).trim(),
      rollNumber: String(req.body.rollNumber).trim(),
      facility: checked.facility._id,
      facilityName: checked.facility.name,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      peopleCount: Number(req.body.peopleCount),
      purpose: String(req.body.purpose).trim(),
      status: 'Pending'
    });
    res.status(201).json({ message: 'Booking created successfully.', booking });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid booking ID.' });
    const validationError = validateBooking(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (['Cancelled', 'Rejected', 'Completed'].includes(booking.status)) {
      return res.status(409).json({ message: `A ${booking.status.toLowerCase()} booking cannot be edited.` });
    }
    const checked = await checkFacilityAndConflict(req.body, booking._id);
    if (checked.error) return res.status(checked.status).json({ message: checked.error });
    Object.assign(booking, {
      studentName: String(req.body.studentName).trim(),
      rollNumber: String(req.body.rollNumber).trim(),
      facility: checked.facility._id,
      facilityName: checked.facility.name,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      peopleCount: Number(req.body.peopleCount),
      purpose: String(req.body.purpose).trim()
    });
    await booking.save();
    res.json({ message: 'Booking updated successfully.', booking });
  } catch (error) { next(error); }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid booking ID.' });
    const allowedStatuses = ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'];
    if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ message: 'Choose a valid booking status.' });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (['Cancelled', 'Rejected', 'Completed'].includes(booking.status) && req.body.status !== booking.status) {
      return res.status(409).json({ message: `A ${booking.status.toLowerCase()} booking cannot be changed.` });
    }
    booking.status = req.body.status;
    await booking.save();
    res.json({ message: 'Booking status updated.', booking });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid booking ID.' });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    await booking.deleteOne();
    res.json({ message: 'Booking deleted permanently.' });
  } catch (error) { next(error); }
});

module.exports = router;
