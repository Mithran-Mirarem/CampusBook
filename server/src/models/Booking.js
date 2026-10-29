const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true, maxlength: 60 },
  rollNumber: { type: String, required: true, trim: true, maxlength: 20, index: true },
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
  facilityName: { type: String, required: true, trim: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/, index: true },
  startTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  endTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  peopleCount: { type: Number, required: true, min: 1, validate: Number.isInteger },
  purpose: { type: String, required: true, trim: true, maxlength: 250 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'], default: 'Pending', index: true }
}, { timestamps: true });

bookingSchema.index({ facility: 1, date: 1, startTime: 1, endTime: 1, status: 1 });
module.exports = mongoose.model('Booking', bookingSchema);
