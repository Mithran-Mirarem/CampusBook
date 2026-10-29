const mongoose = require('mongoose');

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function timeToMinutes(value) {
  const [hours, minutes] = String(value).split(':').map(Number);
  return hours * 60 + minutes;
}

function validateBooking(data) {
  const required = ['studentName', 'rollNumber', 'facilityId', 'date', 'startTime', 'endTime', 'peopleCount', 'purpose'];
  for (const field of required) {
    if (data[field] === undefined || data[field] === null || String(data[field]).trim() === '') {
      return `Please provide ${field}.`;
    }
  }
  const name = String(data.studentName).trim();
  const roll = String(data.rollNumber).trim();
  const purpose = String(data.purpose).trim();
  if (!/^[A-Za-z][A-Za-z .'-]{1,59}$/.test(name)) return 'Enter a valid student name.';
  if (!/^[A-Za-z0-9-]{4,20}$/.test(roll)) return 'Enter a valid roll number.';
  if (purpose.length < 5 || purpose.length > 250) return 'Purpose must contain between 5 and 250 characters.';
  if (!mongoose.Types.ObjectId.isValid(String(data.facilityId))) return 'Select a valid facility.';
  if (!Number.isInteger(Number(data.peopleCount)) || Number(data.peopleCount) < 1) return 'Enter a valid number of people.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) return 'Enter a valid date.';
  const [year, month, day] = String(data.date).split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.getFullYear() !== year || parsedDate.getMonth() !== month - 1 || parsedDate.getDate() !== day) return 'Enter a real calendar date.';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDate < today) return 'Booking date cannot be in the past.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(data.startTime)) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(data.endTime))) return 'Enter a valid start and end time.';
  if (timeToMinutes(data.endTime) <= timeToMinutes(data.startTime)) return 'End time must be later than start time.';
  return null;
}

module.exports = { isValidId, escapeRegex, timeToMinutes, validateBooking };
