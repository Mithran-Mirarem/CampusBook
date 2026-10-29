import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/facilities', label: 'Facilities' },
  { to: '/book', label: 'Book a slot' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/manage-facilities', label: 'Manage facilities' }
];

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="nav-wrap container">
        <NavLink to="/" className="brand"><span className="brand-mark">C</span><span>CampusBook</span><small>RESOURCE HUB</small></NavLink>
        <nav className="main-nav" aria-label="Main navigation">
          {links.map(link => <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </nav>
      </div>
    </header>
  );
}
