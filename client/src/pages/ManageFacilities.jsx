import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api.js';
import LoadingState from '../components/LoadingState.jsx';

const emptyFacility = { name: '', type: 'Laboratory', capacity: '30', location: '', description: '' };
const types = ['Laboratory', 'Hall', 'Auditorium', 'Classroom', 'Sports'];

export default function ManageFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState({ ...emptyFacility });
  const [editingId, setEditingId] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try { setFacilities(await apiRequest('/facilities')); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  const visible = useMemo(() => facilities.filter(item => `${item.name} ${item.location} ${item.type}`.toLowerCase().includes(query.trim().toLowerCase())), [facilities, query]);

  function change(event) { setForm(current => ({ ...current, [event.target.name]: event.target.value })); setError(''); setNotice(''); }
  function beginEdit(item) {
    setEditingId(item._id);
    setForm({ name: item.name, type: item.type, capacity: String(item.capacity), location: item.location, description: item.description });
    setError(''); setNotice('');
    document.getElementById('facility-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function resetForm() { setEditingId(''); setForm({ ...emptyFacility }); setError(''); setNotice(''); }

  async function submit(event) {
    event.preventDefault(); setError(''); setNotice('');
    if (form.name.trim().length < 2 || form.location.trim().length < 2 || form.description.trim().length < 5) return setError('Enter a name, location and a description of at least 5 characters.');
    if (!Number.isInteger(Number(form.capacity)) || Number(form.capacity) < 1) return setError('Capacity must be a positive whole number.');
    setSaving(true);
    try {
      const body = { ...form, name: form.name.trim(), location: form.location.trim(), description: form.description.trim(), capacity: Number(form.capacity) };
      const response = await apiRequest(editingId ? `/facilities/${editingId}` : '/facilities', { method: editingId ? 'PUT' : 'POST', body });
      setNotice(response.message); setEditingId(''); setForm({ ...emptyFacility }); await refresh();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.name}? A facility with booking history cannot be deleted.`)) return;
    setError(''); setNotice('');
    try { const response = await apiRequest(`/facilities/${item._id}`, { method: 'DELETE' }); setNotice(response.message); await refresh(); }
    catch (err) { setError(err.message); }
  }

  return <main className="section container">
    <div className="page-heading"><div><p className="eyebrow">ADMIN TOOLS · COURSEWORK DEMO</p><h1>Manage facilities.</h1><p>Create, update and delete facility records stored in MongoDB.</p></div><span className="count-chip">{facilities.length} facilities</span></div>
    <div className="admin-note"><strong>Demo administration page</strong><span>This local coursework app does not implement login or role-based permissions. Do not expose it publicly as-is.</span></div>
    {error && <div className="alert error">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    <section id="facility-editor" className="form-card admin-editor"><div className="form-section-title"><span>✎</span><div><h2>{editingId ? 'Edit facility' : 'Add a facility'}</h2><p>{editingId ? 'Update the facility details and save changes.' : 'Add another campus resource to the directory.'}</p></div></div>
      <form onSubmit={submit} noValidate><div className="form-grid"><label className="field-label">Facility name<input name="name" value={form.name} onChange={change} required maxLength={120} placeholder="e.g. Project Discussion Room" /></label><label className="field-label">Category<select name="type" value={form.type} onChange={change}>{types.map(type => <option key={type}>{type}</option>)}</select></label><label className="field-label">Maximum capacity<input name="capacity" type="number" min="1" step="1" value={form.capacity} onChange={change} required /></label><label className="field-label">Location<input name="location" value={form.location} onChange={change} required maxLength={120} placeholder="Building or block" /></label><label className="field-label form-span-2">Description<textarea name="description" value={form.description} onChange={change} required maxLength={500} rows="3" placeholder="Short description of this facility" /></label></div><div className="form-actions"><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save facility changes' : 'Create facility'}</button>{editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Stop editing</button>}</div></form>
    </section>
    <div className="section-heading section-heading-tight"><div><h2>Facility directory</h2><p className="section-subtitle">Edit details or remove a facility if no booking history exists.</p></div><input className="inline-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search facilities…" aria-label="Search facilities" /></div>
    {loading ? <LoadingState message="Loading facility records…" /> : <div className="manage-list">{visible.map(item => <article className="manage-row" key={item._id}><div className="manage-row-main"><span className="category-pill">{item.type}</span><h3>{item.name}</h3><p>{item.location} · Maximum {item.capacity} people</p><small>{item.description}</small></div><div className="manage-row-actions"><button className="btn btn-secondary btn-small" onClick={() => beginEdit(item)}>Edit</button><button className="btn btn-danger btn-small" onClick={() => remove(item)}>Delete</button></div></article>)}</div>}
  </main>;
}
