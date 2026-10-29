export async function apiRequest(path, options = {}) {
  const config = {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {})
  };
  let response;
  try {
    response = await fetch(path.startsWith('/api') ? path : `/api${path}`, config);
  } catch {
    throw new Error('Cannot reach the server. Check that Node.js and MongoDB are running.');
  }
  const contentType = response.headers.get('content-type') || '';
  const result = contentType.includes('application/json') ? await response.json() : { message: await response.text() };
  if (!response.ok) throw new Error(result.message || `Request failed (${response.status}).`);
  return result;
}

export function localToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}
