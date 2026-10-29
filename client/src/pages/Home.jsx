import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api.js';
import LoadingState from '../components/LoadingState.jsx';

export default function Home() {
  const [stats, setStats] = useState({ facilities: 0, bookings: 0, pending: 0, approved: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiRequest('/facilities'), apiRequest('/bookings')])
      .then(([facilities, bookings]) => setStats({
        facilities: facilities.length,
        bookings: bookings.length,
        pending: bookings.filter(item => item.status === 'Pending').length,
        approved: bookings.filter(item => item.status === 'Approved').length
      }))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return <main>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">CAMPUS RESOURCE MANAGEMENT · ASSIGNMENT 2</p>
          <h1>Book the right campus space at the <span>right time.</span></h1>
          <p className="hero-text">Discover campus labs, classrooms, halls and sports facilities. Request a slot, avoid clashes and track your booking in one place.</p>
          <div className="hero-actions"><Link className="btn btn-primary" to="/book">Create a booking <span aria-hidden="true">↗</span></Link><Link className="btn btn-secondary" to="/facilities">Explore facilities</Link></div>
          <div className="trust-row"><span className="trust-dot" /> React interface <span className="trust-separator">·</span> Express REST APIs <span className="trust-separator">·</span> MongoDB storage</div>
        </div>
        <div className="hero-panel">
          <div className="panel-top"><span className="panel-icon">✓</span><div><strong>Smarter space reservations</strong><small>Live data from your database</small></div><span className="live-pill">LIVE</span></div>
          <div className="hero-panel-content"><p>One simple workflow</p><div className="flow-step"><span>01</span><div><strong>Choose a facility</strong><small>Search by name, category or location</small></div></div><div className="flow-step"><span>02</span><div><strong>Select date and time</strong><small>Capacity and booking-conflict checks</small></div></div><div className="flow-step"><span>03</span><div><strong>Track your request</strong><small>Update, approve, cancel or remove records</small></div></div></div>
          <div className="panel-foot"><span>Protected by server-side validation</span><span>↗</span></div>
        </div>
      </div>
    </section>

    <section className="container stats-grid" aria-label="Booking summary">
      {[
        ['Campus facilities', stats.facilities, 'Across five categories'],
        ['Total bookings', stats.bookings, 'Saved in MongoDB'],
        ['Pending requests', stats.pending, 'Awaiting review'],
        ['Approved bookings', stats.approved, 'Confirmed requests']
      ].map(([label, value, hint], index) => <article className="stat-card" key={label}><span className={`stat-icon stat-icon-${index}`}>{['⌂', '▤', '◷', '✓'][index]}</span><p>{label}</p><strong>{loading ? '—' : value}</strong><small>{hint}</small></article>)}
    </section>

    {error && <div className="container"><div className="alert error"><strong>Could not load the dashboard.</strong> {error}<p>Check your <code>.env</code> MongoDB connection string, then restart the project.</p></div></div>}
    {loading && !error && <div className="container"><LoadingState message="Loading dashboard data from MongoDB…" /></div>}

    <section className="section container">
      <div className="section-heading"><div><p className="eyebrow">GET STARTED</p><h2>Everything you need to book</h2><p className="section-subtitle">A simple interface backed by reusable React components and RESTful API endpoints.</p></div><Link className="text-link" to="/facilities">View all facilities <span>→</span></Link></div>
      <div className="feature-grid">
        <article className="feature-card"><span className="feature-number">01</span><h3>Explore facilities</h3><p>Search campus spaces, filter by category and check the maximum number of people allowed.</p><Link to="/facilities">Browse facilities →</Link></article>
        <article className="feature-card"><span className="feature-number">02</span><h3>Submit a reservation</h3><p>Choose the facility, date, time, attendees and purpose. The API validates every request.</p><Link to="/book">Book a facility →</Link></article>
        <article className="feature-card"><span className="feature-number">03</span><h3>Manage records</h3><p>Search bookings, edit valid requests, update statuses, cancel and delete records.</p><Link to="/bookings">Open booking records →</Link></article>
      </div>
    </section>
  </main>;
}
