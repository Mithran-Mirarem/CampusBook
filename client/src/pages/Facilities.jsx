import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api.js';
import LoadingState from '../components/LoadingState.jsx';

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/facilities').then(setFacilities).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => [...new Set(facilities.map(item => item.type))].sort(), [facilities]);
  const visible = useMemo(() => facilities.filter(item => {
    const text = `${item.name} ${item.location} ${item.type} ${item.description}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (!type || item.type === type);
  }), [facilities, query, type]);

  return <main className="section container">
    <div className="page-heading"><div><p className="eyebrow">CAMPUS DIRECTORY</p><h1>Find your next space.</h1><p>Search and filter the facilities available across campus.</p></div><Link className="btn btn-primary" to="/book">Book a facility ↗</Link></div>
    <div className="filter-panel"><label className="field-label">Search campus facilities<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Try ‘AD AI Lab’, ‘Raagam’ or ‘basketball’" /></label><label className="field-label">Facility category<select value={type} onChange={event => setType(event.target.value)}><option value="">All categories</option>{types.map(item => <option key={item}>{item}</option>)}</select></label><button className="btn btn-ghost filter-clear" onClick={() => { setQuery(''); setType(''); }}>Clear</button></div>
    {error && <div className="alert error">{error}</div>}
    {loading ? <LoadingState message="Loading facilities from MongoDB…" /> : <><div className="results-line"><span>{visible.length} of {facilities.length} facilities</span><span>Booking capacity shown on each card</span></div>
      {visible.length ? <div className="facility-grid">{visible.map(item => <article className="facility-card" key={item._id}><div className="card-topline"><span className="category-pill">{item.type}</span><span className="small-id">CAMPUS SPACE</span></div><h2>{item.name}</h2><p>{item.description}</p><div className="facility-meta"><div><small>Maximum capacity</small><strong>{item.capacity} people</strong></div><div><small>Location</small><strong>{item.location}</strong></div></div><Link className="btn btn-primary btn-full" to={`/book?facility=${item._id}`}>Book this facility <span>→</span></Link></article>)}</div> : <div className="empty-state"><h3>No facilities found</h3><p>Try another search or clear your filters.</p></div>}
    </>}
  </main>;
}
