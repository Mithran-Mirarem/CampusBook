import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest, localToday } from '../api.js';
import LoadingState from '../components/LoadingState.jsx';

const blankForm = { studentName: '', rollNumber: '', facilityId: '', date: '', startTime: '', endTime: '', peopleCount: '1', purpose: '' };

function validate(form, facilities) {
  if (Object.values(form).some(value => String(value).trim() === '')) return 'Please complete every field.';
  if (!/^[A-Za-z][A-Za-z .'-]{1,59}$/.test(form.studentName.trim())) return 'Enter a valid student name.';
  if (!/^[A-Za-z0-9-]{4,20}$/.test(form.rollNumber.trim())) return 'Enter a valid roll number.';
  if (form.date < localToday()) return 'Booking date cannot be in the past.';
  if (form.endTime <= form.startTime) return 'End time must be later than start time.';
  if (form.purpose.trim().length < 5) return 'Purpose should contain at least 5 characters.';
  const facility = facilities.find(item => item._id === form.facilityId);
  const peopleCount = Number(form.peopleCount);
  if (!facility) return 'Select a valid facility.';
  if (!Number.isInteger(peopleCount) || peopleCount < 1) return 'Enter a positive whole number of people.';
  if (peopleCount > facility.capacity) return `Only ${facility.capacity} people can be booked for ${facility.name}. You requested ${peopleCount}.`;
  return '';
}

export default function BookingForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const editId = params.get('edit');
  const preselected = params.get('facility');
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState({ ...blankForm, facilityId: preselected || '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [initialStatus, setInitialStatus] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const data = await apiRequest('/facilities');
        setFacilities(data);
        if (editId) {
          const booking = await apiRequest(`/bookings/${editId}`);
          setInitialStatus(booking.status);
          setForm({ studentName: booking.studentName, rollNumber: booking.rollNumber, facilityId: booking.facility, date: booking.date, startTime: booking.startTime, endTime: booking.endTime, peopleCount: String(booking.peopleCount), purpose: booking.purpose });
        } else if (preselected && !data.some(item => item._id === preselected)) {
          setError('The selected facility was not found. Please choose another one.');
        }
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    init();
  }, [editId, preselected]);

  const selectedFacility = useMemo(() => facilities.find(item => item._id === form.facilityId), [facilities, form.facilityId]);
  const remainingCapacity = selectedFacility && form.peopleCount ? selectedFacility.capacity - Number(form.peopleCount) : null;
  const isLocked = ['Cancelled', 'Rejected', 'Completed'].includes(initialStatus);

  function change(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    setError(''); setSuccess('');
  }

  async function submit(event) {
    event.preventDefault(); setError(''); setSuccess('');
    if (isLocked) return setError(`This booking is ${initialStatus.toLowerCase()} and can no longer be edited.`);
    const validationError = validate(form, facilities);
    if (validationError) return setError(validationError);
    setSaving(true);
    try {
      const payload = { ...form, peopleCount: Number(form.peopleCount) };
      const result = await apiRequest(editId ? `/bookings/${editId}` : '/bookings', { method: editId ? 'PUT' : 'POST', body: payload });
      setSuccess(`${result.message} Booking ID: ${result.booking._id}`);
      if (!editId) setForm({ ...blankForm, facilityId: preselected && facilities.some(item => item._id === preselected) ? preselected : '' });
      window.setTimeout(() => navigate('/bookings'), 850);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return <main className="section container narrow-page">
    <div className="page-heading page-heading-stack"><div><p className="eyebrow">{editId ? 'UPDATE RESERVATION' : 'NEW RESERVATION'}</p><h1>{editId ? 'Edit booking details.' : 'Reserve a campus space.'}</h1><p>{editId ? 'Update details and save changes to MongoDB.' : 'Choose a campus facility and submit a booking request.'}</p></div><Link className="text-link" to="/bookings">← Back to bookings</Link></div>
    {loading ? <LoadingState message="Preparing the booking form…" /> : <form className="form-card" onSubmit={submit} noValidate>
      {initialStatus && <div className="info-banner">Current booking status: <strong>{initialStatus}</strong></div>}
      <div className="form-section-title"><span>01</span><div><h2>Student information</h2><p>Identify the person responsible for this request.</p></div></div>
      <div className="form-grid"><label className="field-label">Student name<input name="studentName" value={form.studentName} onChange={change} maxLength={60} placeholder="e.g. Arun Kumar" required disabled={isLocked} /></label><label className="field-label">Roll number<input name="rollNumber" value={form.rollNumber} onChange={change} maxLength={20} placeholder="e.g. 24AD001" required disabled={isLocked} /></label></div>
      <div className="form-section-title space-top"><span>02</span><div><h2>Facility and time</h2><p>Choose a valid slot that does not conflict with an existing booking.</p></div></div>
      <div className="form-grid"><label className="field-label form-span-2">Facility<select name="facilityId" value={form.facilityId} onChange={change} required disabled={isLocked}><option value="">Select a facility</option>{facilities.map(item => <option key={item._id} value={item._id}>{item.name} — {item.location}</option>)}</select></label><label className="field-label">Date<input type="date" name="date" value={form.date} min={localToday()} onChange={change} required disabled={isLocked} /></label><label className="field-label">Number of people<input type="number" name="peopleCount" value={form.peopleCount} min="1" step="1" onChange={change} required disabled={isLocked} /></label><label className="field-label">Start time<input type="time" name="startTime" value={form.startTime} onChange={change} required disabled={isLocked} /></label><label className="field-label">End time<input type="time" name="endTime" value={form.endTime} onChange={change} required disabled={isLocked} /></label></div>
      <div className={`capacity-banner ${remainingCapacity !== null && remainingCapacity < 0 ? 'capacity-error' : remainingCapacity !== null ? 'capacity-good' : ''}`} role="status">{!selectedFacility ? 'Select a facility to see its maximum capacity.' : remainingCapacity < 0 ? `Capacity exceeded. Only ${selectedFacility.capacity} people can be booked here; you requested ${form.peopleCount}.` : `${selectedFacility.name}: maximum ${selectedFacility.capacity} people. ${remainingCapacity} capacity place(s) remain for this request.`}</div>
      <label className="field-label space-top">Purpose of booking<textarea name="purpose" value={form.purpose} onChange={change} rows="4" maxLength={250} placeholder="Explain the purpose (minimum 5 characters)" required disabled={isLocked} /></label>
      {error && <div className="alert error" role="alert">{error}</div>}{success && <div className="alert success" role="status">{success}</div>}
      <div className="form-actions"><button className="btn btn-primary" type="submit" disabled={saving || isLocked}>{saving ? 'Saving…' : editId ? 'Save changes' : 'Submit booking request'}</button><button className="btn btn-secondary" type="button" onClick={() => navigate('/bookings')}>Cancel</button></div>
      <p className="form-note">The React form validates input first. Express revalidates it, checks capacity and time conflicts, then saves the booking in MongoDB.</p>
    </form>}
  </main>;
}
