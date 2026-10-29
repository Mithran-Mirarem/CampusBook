const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  type: { type: String, required: true, enum: ['Laboratory', 'Hall', 'Auditorium', 'Classroom', 'Sports'], index: true },
  capacity: { type: Number, required: true, min: 1, validate: Number.isInteger },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 500 }
}, { timestamps: true });

facilitySchema.index({ name: 1, location: 1 });
module.exports = mongoose.model('Facility', facilitySchema);
