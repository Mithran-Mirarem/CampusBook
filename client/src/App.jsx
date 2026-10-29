import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Facilities from './pages/Facilities.jsx';
import BookingForm from './pages/BookingForm.jsx';
import Bookings from './pages/Bookings.jsx';
import ManageFacilities from './pages/ManageFacilities.jsx';

export default function App() {
  return <><Navbar /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/facilities" element={<Facilities />} />
    <Route path="/book" element={<BookingForm />} />
    <Route path="/bookings" element={<Bookings />} />
    <Route path="/manage-facilities" element={<ManageFacilities />} />
    <Route path="*" element={<main className="container section"><div className="empty-state"><h2>Page not found</h2><p>The page you requested does not exist.</p></div></main>} />
  </Routes></>;
}
