import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, formatDate } from '../api.js';
import LoadingState from '../components/LoadingState.jsx';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');

  async function refresh() {
    setError('');
    try { setBookings(await apiRequest('/bookings')); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  const visible = useMemo(() => bookings.filter(item => {
    const haystack = `${item.studentName} ${item.rollNumber} ${item.facilityName} ${item.purpose}`.toLowerCase();
    return haystack.includes(query.toLowerCase().trim()) && (!statusFilter || item.status === statusFilter);
  }), [bookings, query, statusFilter]);

  async function updateStatus(booking, status) {
    if (status === booking.status) return;
    if (!window.confirm(`Change booking ${booking._id.slice(-6)} from ${booking.status} to ${status}?`)) return;
    setSavingId(booking._id); setError('');
    try { await apiRequest(`/bookings/${booking._id}/status`, { method: 'PATCH', body: { status } }); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setSavingId(''); }
  }

  async function remove(booking) {
    if (!window.confirm(`Permanently delete the booking for ${booking.facilityName}?`)) return;
    setSavingId(booking._id); setError('');
    try { await apiRequest(`/bookings/${booking._id}`, { method: 'DELETE' }); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setSavingId(''); }
  }

  return <main className="section container">
    <div className="page-heading"><div><p className="eyebrow">RESERVATION MANAGEMENT</p><h1>Booking records.</h1><p>Review, edit, update status or delete saved booking records.</p></div><Link className="btn btn-primary" to="/book">+ New booking</Link></div>
    <div className="filter-panel"><label className="field-label">Search bookings<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Student, roll number, facility or purpose" /></label><label className="field-label">Status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="">All statuses</option>{['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'].map(value => <option key={value}>{value}</option>)}</select></label><button className="btn btn-ghost filter-clear" onClick={() => { setQuery(''); setStatusFilter(''); }}>Clear</button></div>
    {error && <div className="alert error">{error}</div>}
    {loading ? <LoadingState message="Loading booking records from MongoDB…" /> : <>
      <div className="results-line"><span>{visible.length} record(s)</span><span>Data source: MongoDB · REST API</span></div>
      {visible.length ? <div className="table-card"><div className="table-wrap"><table><thead><tr><th>Student</th><th>Facility and schedule</th><th>People / purpose</th><th>Status</th><th>Update status</th><th>Actions</th></tr></thead><tbody>{visible.map(item => <tr key={item._id}>
        <td><strong>{item.studentName}</strong><small className="table-subtext">{item.rollNumber}</small></td>
        <td><strong>{item.facilityName}</strong><small className="table-subtext">{formatDate(item.date)} · {item.startTime}–{item.endTime}</small></td>
        <td>{item.peopleCount} people<small className="table-subtext purpose-cell">{item.purpose}</small></td>
        <td><span className={`status-pill status-${item.status.toLowerCase()}`}>{item.status}</span></td>
        <td><select className="compact-select" aria-label={`Status for ${item.studentName}`} value={item.status} disabled={savingId === item._id || ['Cancelled', 'Rejected', 'Completed'].includes(item.status)} onChange={event => updateStatus(item, event.target.value)}>{['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'].map(value => <option key={value}>{value}</option>)}</select></td>
        <td><div className="table-actions">{!['Cancelled', 'Rejected', 'Completed'].includes(item.status) && <Link className="small-action" to={`/book?edit=${item._id}`}>Edit</Link>}<button className="small-action danger-text" onClick={() => remove(item)} disabled={savingId === item._id}>Delete</button></div></td>
      </tr>)}</tbody></table></div></div> : <div className="empty-state"><h3>No bookings match these filters</h3><p>Try clearing the search or create a booking.</p><Link className="btn btn-primary" to="/book">Create booking</Link></div>}
    </>}
  </main>;
}
