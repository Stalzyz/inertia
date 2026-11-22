/*
 * M-Tel Networks — zero-dependency site + admin server.
 * Serves the rebuilt static pages, keeps the original .php destinations alive,
 * handles the public forms and speed/coverage logging, and powers the admin
 * panel at /admin/ with JSON-file storage and signed sessions.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const store = require('./lib/store');
const auth = require('./lib/auth');
const smtp = require('./lib/smtp');
const { defaults } = require('./lib/defaults');

const root = __dirname;
const adminDir = path.join(root, 'admin');
const port = Number(process.env.PORT || 4173);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, Object.assign({ 'Cache-Control': 'no-cache' }, headers));
  res.end(body);
}

function sendJSON(res, status, data, headers = {}) {
  send(res, status, JSON.stringify(data), Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, headers));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) { reject(new Error('Too large')); req.destroy(); }
    });
    req.on('end', () => resolve(new URLSearchParams(data)));
    req.on('error', reject);
  });
}

function readJSONBody(req, limit = 100000) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > limit) { reject(new Error('Too large')); req.destroy(); }
    });
    req.on('end', () => {
      try {
        const value = JSON.parse(data || '{}');
        if (!value || typeof value !== 'object' || Array.isArray(value)) return reject(new Error('Invalid payload'));
        resolve(value);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function captchaSVG(code) {
  const chars = code.split('').map((c, i) => {
    const x = 18 + i * 23;
    const rot = ((i * 37) % 19) - 9;
    return `<text x="${x}" y="34" transform="rotate(${rot} ${x} 30)" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#1d4ed8">${c}</text>`;
  }).join('');
  const lines = [0, 1, 2].map((i) => {
    const y = 12 + i * 12;
    return `<path d="M4 ${y} Q 60 ${y + (i % 2 ? 9 : -9)} 116 ${y}" stroke="#c7d7f5" stroke-width="1.4" fill="none"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="47" viewBox="0 0 120 47"><rect width="120" height="47" rx="7" fill="#f4f8ff"/>${lines}${chars}</svg>`;
}

function newCaptcha() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

function serveFile(res, filePath, headers = {}) {
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
    send(res, 200, data, Object.assign({ 'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream' }, headers));
  });
}

function text(value, max = 200) {
  return String(value === null || value === undefined ? '' : value).trim().slice(0, max);
}

function validEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

function metricNumber(value, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= max ? Math.round(number * 100) / 100 : 0;
}

function speedLeadPriority(metrics) {
  if (metrics.download && metrics.download < 30) return 'hot';
  if (metrics.ping >= 50 || metrics.jitter >= 20) return 'technical';
  if (metrics.download >= 100) return 'upsell';
  return 'warm';
}

function settings() {
  const stored = store.read('settings', {});
  return Object.assign({}, defaults.settings, stored, {
    smtp: Object.assign({}, defaults.settings.smtp, stored.smtp || {}, {
      notifyTypes: Object.assign({}, defaults.settings.smtp.notifyTypes, (stored.smtp || {}).notifyTypes || {})
    })
  });
}

function safeSettings() {
  const value = settings();
  return Object.assign({}, value, {
    smtp: Object.assign({}, value.smtp, {
      password: value.smtp.password ? '••••••••' : '',
      passwordSet: Boolean(value.smtp.password)
    })
  });
}

function testimonials() {
  const list = store.read('testimonials', defaults.testimonials);
  return Array.isArray(list) ? list : defaults.testimonials;
}

function packages() {
  const list = store.read('packages', defaults.packages);
  return Array.isArray(list) ? list : defaults.packages;
}

function packageInput(body, base) {
  const item = Object.assign({}, base || {});
  const set = (key, max) => { if (body[key] !== undefined) item[key] = text(body[key], max); };
  ['badge', 'name', 'description', 'currency', 'amount', 'period', 'cta', 'ribbon', 'icon'].forEach((key) => set(key, key === 'description' ? 280 : 120));
  if (body.category === 'home' || body.category === 'business') item.category = body.category;
  if (body.custom !== undefined) item.custom = Boolean(body.custom);
  if (body.featured !== undefined) item.featured = Boolean(body.featured);
  if (body.status === 'active' || body.status === 'draft') item.status = body.status;
  if (body.order !== undefined) item.order = Number(body.order) || 0;
  if (body.href !== undefined) {
    const href = text(body.href, 200);
    if (href && !/^(https?:\/\/|\/|[\w.-]+\.php)/i.test(href)) throw new Error('Use a relative or http(s) link for the button.');
    item.href = href;
  }
  if (body.features !== undefined) {
    const list = Array.isArray(body.features) ? body.features : String(body.features).split(/\r?\n/);
    item.features = list.map((value) => text(value, 160)).filter(Boolean).slice(0, 12);
  }
  return item;
}

function activity(action, detail, user) {
  store.mutate('activity', [], (list) => {
    list.unshift({ id: store.id(), at: store.now(), action, detail: text(detail, 160), by: user ? user.username : 'system' });
    return store.cap(list, 400);
  });
}

function addEnquiry(record) {
  store.mutate('enquiries', [], (list) => {
    list.unshift(Object.assign({
      id: store.id(),
      createdAt: store.now(),
      status: 'new',
      notes: []
    }, record));
  });
  notifyNewEnquiry(record);
}

function smtpConfig() {
  const s = settings().smtp;
  return {
    enabled: s.enabled,
    host: s.host,
    port: s.port,
    secure: s.secure,
    user: s.user,
    password: s.password,
    fromName: s.fromName,
    fromEmail: s.fromEmail,
    notifyEmail: s.notifyEmail,
    subjectPrefix: s.subjectPrefix,
    timeoutMs: s.timeoutMs
  };
}

function notifyNewEnquiry(record) {
  const s = settings().smtp;
  if (!s.enabled || !s.notifyEmail) return;
  if (s.notifyTypes && s.notifyTypes[record.type] === false) return;
  const labels = { contact: 'Contact Us', speedtest: 'Speed test lead', login: 'Customer login', signup: 'Sign-up' };
  const details = record.type === 'speedtest' ? [
    `Area: ${record.area || '—'}`,
    `Current provider: ${record.provider || '—'}`,
    `Priority: ${record.priority || '—'}`,
    `Result: ${record.message || '—'}`,
    ''
  ] : [];
  const lines = [
    `Type: ${labels[record.type] || record.type}`,
    `Name: ${record.name || record.username || '—'}`,
    `Email: ${record.email || '—'}`,
    `Phone: ${record.phone || '—'}`,
    `Received: ${new Date().toLocaleString('en-IN')}`,
    '',
    ...details,
    ...(record.type === 'speedtest' ? [] : [record.message || '—'])
  ];
  smtp.sendMail(smtpConfig(), {
    to: s.notifyEmail,
    subject: `New ${labels[record.type] || 'website'} enquiry`,
    text: lines.join('\n')
  }).then(() => {
    store.mutate('activity', [], (list) => {
      list.unshift({ id: store.id(), at: store.now(), action: 'email_sent', detail: `Notification for ${record.type} enquiry`, by: 'system' });
      return store.cap(list, 400);
    });
  }).catch((err) => {
    console.error('[smtp] Notification failed:', err.message);
    store.mutate('activity', [], (list) => {
      list.unshift({ id: store.id(), at: store.now(), action: 'email_failed', detail: err.message.slice(0, 160), by: 'system' });
      return store.cap(list, 400);
    });
  });
}

function adminGuard(req, res, pathname) {
  // CSV download is a plain link, so let it through; the session cookie and the
  // requireAdmin() check below still protect it. Everything else is XHR-only.
  if (pathname !== '/api/admin/export/enquiries.csv' && req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    sendJSON(res, 400, { ok: false, message: 'Invalid admin request.' });
    return false;
  }
  return true;
}

function requireAdmin(req, res) {
  const user = auth.authenticate(req);
  if (!user) {
    sendJSON(res, 401, { ok: false, message: 'Please sign in again.' });
    return null;
  }
  return user;
}

function canManageUsers(user) {
  return user && user.role === 'owner';
}

function canManageEnquiries(user) {
  return user && (user.role === 'owner' || user.role === 'admin');
}

function canManageContent(user) {
  return Boolean(user);
}

function canManageSettings(user) {
  return user && (user.role === 'owner' || user.role === 'admin');
}

function csvCell(value) {
  return `"${String(value === null || value === undefined ? '' : value).replace(/"/g, '""')}"`;
}

async function handleAdminApi(req, res, pathname, url) {
  if (!pathname.startsWith('/api/admin/')) return false;
  if (!adminGuard(req, res, pathname)) return true;

  const parts = pathname.split('/').filter(Boolean).slice(2);
  const route = parts.join('/');
  const method = req.method;

  // --- Sign in / out -----------------------------------------------------
  if (route === 'login' && method === 'POST') {
    if (!auth.loginAllowed(auth.clientIp(req))) {
      return sendJSON(res, 429, { ok: false, message: 'Too many attempts. Please try again later.' }), true;
    }
    let body;
    try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
    const user = auth.findUser(text(body.username, 40));
    if (!user || user.disabled || !auth.verifyPassword(body.password || '', user.salt, user.hash)) {
      auth.recordFailure(auth.clientIp(req));
      activity('login_failed', `Failed sign-in for ${text(body.username, 40)}`, null);
      return sendJSON(res, 401, { ok: false, message: 'Incorrect username or password.' }), true;
    }
    auth.clearFailures(auth.clientIp(req));
    store.mutate('users', [], (list) => {
      const match = list.find((u) => u.id === user.id);
      if (match) match.lastLogin = store.now();
    });
    activity('login', 'Signed in', user);
    return sendJSON(res, 200, { ok: true, user: auth.publicUser(user) }, {
      'Set-Cookie': auth.sessionCookie(req, auth.createToken(user.username))
    }), true;
  }

  if (route === 'logout' && method === 'POST') {
    const user = requireAdmin(req, res);
    if (user) activity('logout', 'Signed out', user);
    return sendJSON(res, 200, { ok: true }, { 'Set-Cookie': auth.clearCookie(req) }), true;
  }

  if (route === 'session' && method === 'GET') {
    const sessionUser = auth.authenticate(req);
    return sendJSON(res, 200, { ok: true, user: sessionUser ? auth.publicUser(sessionUser) : null }), true;
  }

  const user = requireAdmin(req, res);
  if (!user) return true;

  const denied = () => (sendJSON(res, 403, { ok: false, message: 'Your role does not allow this action.' }), true);
  if ((route === 'enquiries' || route.startsWith('enquiries/') || route === 'export/enquiries.csv') && !canManageEnquiries(user)) return denied();
  if ((route === 'results' || route.startsWith('results/')) && !canManageEnquiries(user)) return denied();
  if ((route === 'packages' || route.startsWith('packages/') || route === 'settings' || route.startsWith('email/')) && !canManageSettings(user)) return denied();

  // --- Dashboard ---------------------------------------------------------
  if (route === 'overview' && method === 'GET') {
    const enquiries = store.read('enquiries', []);
    const speeds = store.read('speedtests', []);
    const coverage = store.read('coverage', []);
    const approved = testimonials().filter((t) => t.status === 'approved').length;
    const activePackages = packages().filter((p) => p.status === 'active').length;
    const limited = !canManageEnquiries(user);
    return sendJSON(res, 200, {
      ok: true,
      stats: {
        enquiries: limited ? 0 : enquiries.length,
        newEnquiries: limited ? 0 : enquiries.filter((e) => e.status === 'new').length,
        speedTests: limited ? 0 : speeds.length,
        coverageChecks: limited ? 0 : coverage.length,
        approvedTestimonials: approved,
        activePackages,
        emailEnabled: settings().smtp.enabled
      },
      recentEnquiries: limited ? [] : enquiries.slice(0, 5),
      recentActivity: store.read('activity', []).slice(0, 6)
    }), true;
  }

  // --- Enquiries ---------------------------------------------------------
  if (route === 'enquiries' && method === 'GET') {
    const type = text(url.searchParams.get('type'), 20);
    const status = text(url.searchParams.get('status'), 20);
    const q = text(url.searchParams.get('q'), 100).toLowerCase();
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);
    let items = store.read('enquiries', []);
    if (type) items = items.filter((e) => e.type === type);
    if (status) items = items.filter((e) => e.status === status);
    if (q) items = items.filter((e) => [e.name, e.email, e.phone, e.username, e.area, e.provider, e.priority, e.message, e.metrics && e.metrics.verdict].some((v) => String(v || '').toLowerCase().includes(q)));
    return sendJSON(res, 200, { ok: true, items: items.slice(offset, offset + limit), total: items.length, limit, offset }), true;
  }

  if (route === 'export/enquiries.csv' && method === 'GET') {
    const rows = store.read('enquiries', []);
    const lines = [['ID', 'Type', 'Priority', 'Name', 'Email', 'Phone', 'Area', 'Provider', 'Message', 'Status', 'Created'].map(csvCell).join(',')];
    rows.forEach((e) => lines.push([e.id, e.type, e.priority || '', e.name, e.email, e.phone, e.area || '', e.provider || '', e.message, e.status, e.createdAt].map(csvCell).join(',')));
    return send(res, 200, `\uFEFF${lines.join('\r\n')}\r\n`, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mtel-enquiries.csv"'
    }), true;
  }

  if (parts[0] === 'enquiries' && parts.length === 2 && method === 'GET') {
    const item = store.read('enquiries', []).find((e) => e.id === parts[1]);
    if (!item) return sendJSON(res, 404, { ok: false, message: 'Enquiry not found.' }), true;
    return sendJSON(res, 200, { ok: true, item }), true;
  }

  if (parts[0] === 'enquiries' && parts.length === 2) {
    const id = parts[1];
    if (method === 'PATCH') {
      let body;
      try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
      const statuses = ['new', 'read', 'replied', 'archived'];
      if (body.status && !statuses.includes(body.status)) return sendJSON(res, 400, { ok: false, message: 'Unknown status.' }), true;
      const note = text(body.note, 500);
      store.mutate('enquiries', [], (list) => {
        const item = list.find((e) => e.id === id);
        if (!item) return;
        if (body.status) item.status = body.status;
        if (note) {
          if (!Array.isArray(item.notes)) item.notes = [];
          item.notes.push({ at: store.now(), text: note });
        }
      });
      activity('enquiry_updated', `Enquiry ${id.slice(0, 8)}${body.status ? ` → ${body.status}` : ''}`, user);
      return sendJSON(res, 200, { ok: true }), true;
    }
    if (method === 'DELETE') {
      store.mutate('enquiries', [], (list) => {
        const i = list.findIndex((e) => e.id === id);
        if (i > -1) list.splice(i, 1);
      });
      activity('enquiry_deleted', `Enquiry ${id.slice(0, 8)}`, user);
      return sendJSON(res, 200, { ok: true }), true;
    }
  }

  // --- Testimonials ------------------------------------------------------
  if (route === 'testimonials' && method === 'GET') {
    return sendJSON(res, 200, { ok: true, items: testimonials().slice().sort((a, b) => (a.order || 0) - (b.order || 0)) }), true;
  }

  if (route === 'testimonials' && method === 'POST') {
    if (!canManageContent(user)) return sendJSON(res, 403, { ok: false, message: 'Your role cannot edit content.' }), true;
    let body;
    try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
    const quote = text(body.quote, 280);
    const name = text(body.name, 60);
    if (!quote || !name) return sendJSON(res, 400, { ok: false, message: 'A quote and a name are required.' }), true;
    const record = {
      id: store.id(),
      quote,
      name,
      role: text(body.role, 60),
      initials: (text(body.initials, 3) || name.slice(0, 2)).toUpperCase(),
      note: text(body.note, 120),
      status: body.status === 'draft' ? 'draft' : 'approved',
      order: Number(body.order) || 99,
      createdAt: store.now(),
      updatedAt: store.now()
    };
    store.mutate('testimonials', defaults.testimonials, (list) => { list.push(record); });
    activity('testimonial_added', `Added testimonial for ${name}`, user);
    return sendJSON(res, 200, { ok: true, item: record }), true;
  }

  if (parts[0] === 'testimonials' && parts.length === 2) {
    const id = parts[1];
    if (method === 'PATCH') {
      let body;
      try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
      store.mutate('testimonials', defaults.testimonials, (list) => {
        const item = list.find((t) => t.id === id);
        if (!item) return;
        if (body.quote !== undefined) item.quote = text(body.quote, 280);
        if (body.name !== undefined) item.name = text(body.name, 60);
        if (body.role !== undefined) item.role = text(body.role, 60);
        if (body.initials !== undefined) item.initials = text(body.initials, 3).toUpperCase();
        if (body.note !== undefined) item.note = text(body.note, 120);
        if (body.status === 'approved' || body.status === 'draft') item.status = body.status;
        if (body.order !== undefined) item.order = Number(body.order) || 0;
        item.updatedAt = store.now();
      });
      activity('testimonial_updated', `Testimonial ${id.slice(0, 8)}`, user);
      return sendJSON(res, 200, { ok: true }), true;
    }
    if (method === 'DELETE') {
      store.mutate('testimonials', defaults.testimonials, (list) => {
        const i = list.findIndex((t) => t.id === id);
        if (i > -1) list.splice(i, 1);
      });
      activity('testimonial_deleted', `Testimonial ${id.slice(0, 8)}`, user);
      return sendJSON(res, 200, { ok: true }), true;
    }
  }

  // --- Speed test + coverage results ------------------------------------
  if (route === 'results' && method === 'GET') {
    const kind = text(url.searchParams.get('kind'), 20);
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit')) || 50));
    const payload = {
      ok: true,
      speed: kind === 'coverage' ? [] : store.read('speedtests', []).slice(0, limit),
      coverage: kind === 'speed' ? [] : store.read('coverage', []).slice(0, limit)
    };
    return sendJSON(res, 200, payload), true;
  }

  if (parts[0] === 'results' && parts.length === 3 && method === 'DELETE') {
    const kind = parts[1] === 'coverage' ? 'coverage' : parts[1] === 'speed' ? 'speedtests' : null;
    if (!kind) return sendJSON(res, 400, { ok: false, message: 'Unknown result type.' }), true;
    store.mutate(kind, [], (list) => {
      const i = list.findIndex((r) => r.id === parts[2]);
      if (i > -1) list.splice(i, 1);
    });
    activity('result_deleted', `${kind} ${parts[2].slice(0, 8)}`, user);
    return sendJSON(res, 200, { ok: true }), true;
  }

  // --- Users -------------------------------------------------------------
  if (route === 'users' && method === 'GET') {
    return sendJSON(res, 200, { ok: true, items: auth.listUsers().map(auth.publicUser) }), true;
  }

  if (route === 'users' && method === 'POST') {
    if (!canManageUsers(user)) return sendJSON(res, 403, { ok: false, message: 'Only an owner can add users.' }), true;
    let body;
    try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
    const username = text(body.username, 40);
    const password = String(body.password || '');
    const role = body.role === 'admin' || body.role === 'editor' ? body.role : 'editor';
    if (!username || password.length < 8) return sendJSON(res, 400, { ok: false, message: 'Choose a username and a password of at least 8 characters.' }), true;
    if (auth.findUser(username)) return sendJSON(res, 400, { ok: false, message: 'That username already exists.' }), true;
    const { salt, hash } = auth.hashPassword(password);
    const record = {
      id: store.id(),
      username,
      displayName: text(body.displayName, 60) || username,
      email: text(body.email, 120),
      role,
      salt,
      hash,
      disabled: false,
      createdAt: store.now(),
      lastLogin: null
    };
    store.mutate('users', [], (list) => { list.push(record); });
    activity('user_added', `Added ${username} (${role})`, user);
    return sendJSON(res, 200, { ok: true, item: auth.publicUser(record) }), true;
  }

  if (parts[0] === 'users' && parts.length === 2) {
    const id = parts[1];
    const target = auth.findById(id);
    if (!target) return sendJSON(res, 404, { ok: false, message: 'User not found.' }), true;
    if (method === 'PATCH') {
      if (!canManageUsers(user)) return sendJSON(res, 403, { ok: false, message: 'Only an owner can change users.' }), true;
      let body;
      try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
      if (target.role === 'owner' && (body.disabled === true || (body.role && body.role !== 'owner'))) {
        return sendJSON(res, 403, { ok: false, message: 'The owner account cannot be disabled or demoted.' }), true;
      }
      if (id === user.id && body.disabled === true) return sendJSON(res, 403, { ok: false, message: 'You cannot disable your own account.' }), true;
      store.mutate('users', [], (list) => {
        const item = list.find((u) => u.id === id);
        if (!item) return;
        if (typeof body.disabled === 'boolean') item.disabled = body.disabled;
        if (body.role === 'admin' || body.role === 'editor') item.role = body.role;
      });
      activity('user_updated', `Updated ${target.username}`, user);
      return sendJSON(res, 200, { ok: true }), true;
    }
    if (method === 'DELETE') {
      if (!canManageUsers(user)) return sendJSON(res, 403, { ok: false, message: 'Only an owner can remove users.' }), true;
      if (target.role === 'owner') return sendJSON(res, 403, { ok: false, message: 'The owner account cannot be removed.' }), true;
      if (id === user.id) return sendJSON(res, 403, { ok: false, message: 'You cannot remove your own account.' }), true;
      store.mutate('users', [], (list) => {
        const i = list.findIndex((u) => u.id === id);
        if (i > -1) list.splice(i, 1);
      });
      activity('user_deleted', `Removed ${target.username}`, user);
      return sendJSON(res, 200, { ok: true }), true;
    }
  }

  if (parts[0] === 'users' && parts.length === 3 && parts[2] === 'password' && method === 'POST') {
    const id = parts[1];
    if (id !== user.id && !canManageUsers(user)) return sendJSON(res, 403, { ok: false, message: 'Only an owner can change other passwords.' }), true;
    const target = auth.findById(id);
    if (!target) return sendJSON(res, 404, { ok: false, message: 'User not found.' }), true;
    let body;
    try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
    const password = String(body.password || '');
    if (password.length < 8) return sendJSON(res, 400, { ok: false, message: 'Use at least 8 characters.' }), true;
    const { salt, hash } = auth.hashPassword(password);
    store.mutate('users', [], (list) => {
      const item = list.find((u) => u.id === id);
      if (item) { item.salt = salt; item.hash = hash; }
    });
    activity('password_changed', `Password for ${target.username}`, user);
    return sendJSON(res, 200, { ok: true }), true;
  }

  // --- Packages ----------------------------------------------------------
  if (route === 'packages' && method === 'GET') {
    const items = packages().slice().sort((a, b) =>
      String(a.category).localeCompare(String(b.category)) || (a.order || 0) - (b.order || 0));
    return sendJSON(res, 200, { ok: true, items }), true;
  }

  if (route === 'packages' && method === 'POST') {
    let body;
    try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
    let record;
    try {
      record = packageInput(body, {
        id: store.id(), category: 'home', status: 'active', order: 99, icon: 'star',
        createdAt: store.now(), updatedAt: store.now()
      });
    } catch (err) { return sendJSON(res, 400, { ok: false, message: err.message }), true; }
    if (!record.name || !record.amount) return sendJSON(res, 400, { ok: false, message: 'A package name and price label are required.' }), true;
    store.mutate('packages', defaults.packages, (list) => { list.push(record); });
    activity('package_added', `Added package ${record.name}`, user);
    return sendJSON(res, 200, { ok: true, item: record }), true;
  }

  if (parts[0] === 'packages' && parts.length === 2) {
    const id = parts[1];
    if (method === 'PATCH') {
      let body;
      try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
      const existing = packages().find((p) => p.id === id);
      if (!existing) return sendJSON(res, 404, { ok: false, message: 'Package not found.' }), true;
      let updated;
      try { updated = packageInput(body, existing); } catch (err) { return sendJSON(res, 400, { ok: false, message: err.message }), true; }
      updated.id = id;
      updated.updatedAt = store.now();
      store.mutate('packages', defaults.packages, (list) => {
        const i = list.findIndex((p) => p.id === id);
        if (i > -1) list[i] = updated;
      });
      activity('package_updated', `Updated package ${updated.name}`, user);
      return sendJSON(res, 200, { ok: true, item: updated }), true;
    }
    if (method === 'DELETE') {
      store.mutate('packages', defaults.packages, (list) => {
        const i = list.findIndex((p) => p.id === id);
        if (i > -1) list.splice(i, 1);
      });
      activity('package_deleted', `Package ${id.slice(0, 8)}`, user);
      return sendJSON(res, 200, { ok: true }), true;
    }
  }

  // --- Profile -----------------------------------------------------------
  if (route === 'profile' && method === 'GET') {
    return sendJSON(res, 200, { ok: true, user: auth.publicUser(user) }), true;
  }

  if (route === 'profile' && method === 'PATCH') {
    let body;
    try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
    const displayName = text(body.displayName, 60);
    const email = text(body.email, 120);
    if (!displayName) return sendJSON(res, 400, { ok: false, message: 'Enter a display name.' }), true;
    if (email && !validEmail(email)) return sendJSON(res, 400, { ok: false, message: 'Enter a valid email address.' }), true;
    store.mutate('users', [], (list) => {
      const item = list.find((u) => u.id === user.id);
      if (item) { item.displayName = displayName; item.email = email; }
    });
    activity('profile_updated', 'Updated their profile', user);
    return sendJSON(res, 200, { ok: true, user: auth.publicUser(Object.assign({}, user, { displayName, email })) }), true;
  }

  if (route === 'profile/password' && method === 'POST') {
    let body;
    try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
    const current = String(body.currentPassword || '');
    const password = String(body.password || '');
    if (!auth.verifyPassword(current, user.salt, user.hash)) return sendJSON(res, 400, { ok: false, message: 'Your current password is incorrect.' }), true;
    if (password.length < 8) return sendJSON(res, 400, { ok: false, message: 'Use at least 8 characters for the new password.' }), true;
    const hash = auth.hashPassword(password);
    store.mutate('users', [], (list) => {
      const item = list.find((u) => u.id === user.id);
      if (item) { item.salt = hash.salt; item.hash = hash.hash; }
    });
    activity('password_changed', 'Changed their own password', user);
    return sendJSON(res, 200, { ok: true }), true;
  }

  // --- Settings ----------------------------------------------------------
  if (route === 'settings' && method === 'GET') {
    return sendJSON(res, 200, { ok: true, settings: safeSettings() }), true;
  }

  if (route === 'settings' && method === 'PUT') {
    let body;
    try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }), true; }
    const next = Object.assign({}, settings());
    ['contactEmail', 'contactPhone', 'topbarPhone', 'phoneDigits', 'gatewayName'].forEach((key) => {
      if (body[key] !== undefined) next[key] = text(body[key], 160);
    });
    if (!validEmail(next.contactEmail)) return sendJSON(res, 400, { ok: false, message: 'Enter a valid contact email.' }), true;
    if (!/^\d{8,15}$/.test(next.phoneDigits)) return sendJSON(res, 400, { ok: false, message: 'Phone digits must be 8–15 digits with no spaces.' }), true;

    const input = body.smtp && typeof body.smtp === 'object' ? body.smtp : {};
    const smtpNext = Object.assign({}, next.smtp);
    ['host', 'user', 'fromName', 'fromEmail', 'notifyEmail', 'subjectPrefix'].forEach((key) => {
      if (input[key] !== undefined) smtpNext[key] = text(input[key], 160);
    });
    ['enabled', 'secure'].forEach((key) => {
      if (input[key] !== undefined) smtpNext[key] = Boolean(input[key]);
    });
    if (input.notifyTypes && typeof input.notifyTypes === 'object') {
      ['contact', 'speedtest', 'login', 'signup'].forEach((key) => {
        if (typeof input.notifyTypes[key] === 'boolean') smtpNext.notifyTypes[key] = input.notifyTypes[key];
      });
    }
    if (input.port !== undefined) {
      const port = Number(input.port);
      if (!Number.isInteger(port) || port < 1 || port > 65535) return sendJSON(res, 400, { ok: false, message: 'SMTP port must be between 1 and 65535.' }), true;
      smtpNext.port = port;
    }
    if (input.timeoutMs !== undefined) {
      const timeoutMs = Number(input.timeoutMs);
      smtpNext.timeoutMs = Number.isFinite(timeoutMs) && timeoutMs >= 3000 && timeoutMs <= 30000 ? timeoutMs : 8000;
    }
    if (input.clearPassword === true) {
      smtpNext.password = '';
    } else if (input.password !== undefined && input.password !== '' && input.password !== '••••••••') {
      smtpNext.password = String(input.password).slice(0, 200);
    }
    if (!smtpNext.fromEmail) smtpNext.fromEmail = smtpNext.user || next.contactEmail;
    if (smtpNext.enabled) {
      if (!smtpNext.host) return sendJSON(res, 400, { ok: false, message: 'Enter the SMTP host before enabling email.' }), true;
      if (!validEmail(smtpNext.fromEmail)) return sendJSON(res, 400, { ok: false, message: 'Enter a valid SMTP from email.' }), true;
      if (!validEmail(smtpNext.notifyEmail)) return sendJSON(res, 400, { ok: false, message: 'Enter a valid notification email.' }), true;
      if (smtpNext.user && !smtpNext.password) return sendJSON(res, 400, { ok: false, message: 'Enter the SMTP password or remove the username.' }), true;
    }
    next.smtp = smtpNext;
    next.updatedAt = store.now();
    await store.write('settings', next);
    activity('settings_saved', 'Saved site and email settings', user);
    return sendJSON(res, 200, { ok: true, settings: safeSettings() }), true;
  }

  // --- Email test --------------------------------------------------------
  if (route === 'email/test' && method === 'POST') {
    let body;
    try { body = await readJSONBody(req); } catch (err) { body = {}; }
    const to = text(body.to, 120) || settings().smtp.notifyEmail;
    if (!validEmail(to)) return sendJSON(res, 400, { ok: false, message: 'Enter a valid test recipient.' }), true;
    if (!settings().smtp.host) return sendJSON(res, 400, { ok: false, message: 'Save an SMTP host first.' }), true;
    try {
      await smtp.sendMail(smtpConfig(), {
        to,
        subject: 'SMTP settings test',
        text: `This is a test message from the M-Tel Networks admin panel.\n\nSent at ${new Date().toLocaleString('en-IN')}.`
      });
      const current = settings();
      current.smtp.verifiedAt = store.now();
      await store.write('settings', current);
      activity('email_test', `Sent a test email to ${to}`, user);
      return sendJSON(res, 200, { ok: true, message: `Test email sent to ${to}.` }), true;
    } catch (err) {
      activity('email_test_failed', err.message, user);
      return sendJSON(res, 400, { ok: false, message: err.message }), true;
    }
  }

  // --- Publish (rebuild the static pages) -------------------------------
  if (route === 'publish' && method === 'POST') {
    if (user.role === 'editor') return sendJSON(res, 403, { ok: false, message: 'Your role cannot publish changes.' }), true;
    execFile(process.execPath, [path.join(root, 'src', 'build.js')], { cwd: root, timeout: 30000 }, (err, stdout, stderr) => {
      if (err) {
        activity('publish_failed', stderr || err.message, user);
        return sendJSON(res, 500, { ok: false, message: stderr || err.message });
      }
      activity('publish', 'Rebuilt public pages', user);
      sendJSON(res, 200, { ok: true, message: stdout.trim() || 'Pages rebuilt.' });
    });
    return true;
  }

  // --- Activity ----------------------------------------------------------
  if (route === 'activity' && method === 'GET') {
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 30));
    return sendJSON(res, 200, { ok: true, items: store.read('activity', []).slice(0, limit) }), true;
  }

  return sendJSON(res, 404, { ok: false, message: 'Unknown admin endpoint.' }), true;
}

auth.init();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  if (pathname === '/captcha_code_file.php') {
    const code = newCaptcha();
    return send(res, 200, captchaSVG(code), {
      'Content-Type': 'image/svg+xml',
      'Set-Cookie': `mtel_captcha=${code}; Path=/; HttpOnly; SameSite=Lax`,
      'Cache-Control': 'no-store',
    });
  }

  // Public telemetry endpoints used by the homepage widgets.
  if (req.method === 'POST' && pathname === '/api/speedtest/result') {
    let body;
    try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false }); }
    const id = store.id();
    store.mutate('speedtests', [], (list) => {
      list.unshift({
        id,
        createdAt: store.now(),
        ping: metricNumber(body.ping, 10000),
        jitter: metricNumber(body.jitter, 10000),
        download: metricNumber(body.download, 10000),
        upload: metricNumber(body.upload, 10000),
        uploadEstimated: true,
        verdict: text(body.verdict, 100),
        gateway: settings().gatewayName
      });
      return store.cap(list, 2000);
    });
    return sendJSON(res, 200, { ok: true, id });
  }

  if (req.method === 'POST' && pathname === '/api/speedtest/lead') {
    let body;
    try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false, message: 'Unable to read the request.' }); }
    if (text(body.website, 100)) return sendJSON(res, 200, { ok: true, message: 'Thanks. We will get in touch shortly.' });

    const name = text(body.name, 80);
    const phone = text(body.phone, 30);
    const email = text(body.email, 120);
    const area = text(body.area, 120);
    const provider = text(body.provider, 80);
    const digits = phone.replace(/\D/g, '');
    if (!name || !phone || !area) return sendJSON(res, 400, { ok: false, message: 'Please complete your name, mobile number and area.' });
    if (digits.length < 10 || digits.length > 15) return sendJSON(res, 400, { ok: false, message: 'Please enter a valid mobile number.' });
    if (email && !validEmail(email)) return sendJSON(res, 400, { ok: false, message: 'Please enter a valid email address.' });
    if (body.consent !== true && body.consent !== 'yes' && body.consent !== 'true') {
      return sendJSON(res, 400, { ok: false, message: 'Please confirm that we may contact you about your result.' });
    }

    const resultId = text(body.resultId, 80);
    const stored = resultId ? store.read('speedtests', []).find((item) => item.id === resultId) : null;
    const source = stored || (body.metrics && typeof body.metrics === 'object' ? body.metrics : {});
    const metrics = {
      ping: metricNumber(source.ping, 10000),
      jitter: metricNumber(source.jitter, 10000),
      download: metricNumber(source.download, 10000),
      upload: metricNumber(source.upload, 10000),
      verdict: text(source.verdict, 100)
    };
    if (!metrics.download && !metrics.ping) return sendJSON(res, 400, { ok: false, message: 'Please run the speed test again before requesting a line check.' });

    const message = `Speed test: ${metrics.download} Mbps down / ${metrics.upload} Mbps up / ${metrics.ping} ms ping. Verdict: ${metrics.verdict || 'Completed'}. Area: ${area}.${provider ? ` Current provider: ${provider}.` : ''}`;
    addEnquiry({
      type: 'speedtest',
      name,
      email,
      phone,
      area,
      provider,
      priority: speedLeadPriority(metrics),
      metrics: Object.assign({ resultId }, metrics),
      consent: true,
      message
    });
    return sendJSON(res, 200, { ok: true, message: 'Thanks. We will contact you about your speed-test result.' });
  }

  if (req.method === 'POST' && pathname === '/api/coverage/log') {
    let body;
    try { body = await readJSONBody(req); } catch (err) { return sendJSON(res, 400, { ok: false }); }
    const query = text(body.query, 120);
    if (!query) return sendJSON(res, 400, { ok: false });
    store.mutate('coverage', [], (list) => {
      list.unshift({
        id: store.id(),
        createdAt: store.now(),
        query,
        pin: text(body.pin, 60),
        area: text(body.area, 160),
        status: text(body.status, 120)
      });
      return store.cap(list, 2000);
    });
    return sendJSON(res, 200, { ok: true });
  }

  // Admin API and UI.
  if (pathname.startsWith('/api/admin/')) {
    try {
      await handleAdminApi(req, res, pathname, url);
    } catch (err) {
      console.error('[admin]', err);
      if (!res.headersSent) sendJSON(res, 500, { ok: false, message: 'Server error.' });
    }
    return;
  }

  if (pathname === '/admin') {
    return send(res, 302, '', { Location: '/admin/' });
  }
  if (pathname === '/admin/' || pathname === '/admin/index.html') {
    return serveFile(res, path.join(adminDir, 'index.html'));
  }
  if (pathname === '/admin/app.js' || pathname === '/admin/styles.css') {
    return serveFile(res, path.join(adminDir, path.basename(pathname)));
  }

  // Speed test data endpoints (kept from the original implementation).
  if (pathname === '/api/speedtest/ping') {
    return sendJSON(res, 200, { ok: true, serverTime: Date.now(), gateway: 'M-Tel Coimbatore Core-1' });
  }

  if (pathname === '/api/speedtest/download') {
    const size = Math.min(16 * 1024 * 1024, Math.max(1024 * 1024, parseInt(url.searchParams.get('size') || '4194304', 10)));
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(size),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    const chunkSize = 64 * 1024;
    const chunk = Buffer.alloc(chunkSize, 'M-TelNetworksUltraFastFiberGigabitGateway2024');
    let sent = 0;
    function writeMore() {
      let ok = true;
      while (ok && sent < size) {
        const remaining = size - sent;
        const current = remaining < chunkSize ? chunk.subarray(0, remaining) : chunk;
        sent += current.length;
        ok = res.write(current);
      }
      if (sent >= size) res.end();
      else res.once('drain', writeMore);
    }
    return writeMore();
  }

  // --- Public forms ------------------------------------------------------
  if (req.method === 'POST' && pathname === '/contact-us.php') {
    readBody(req).then((body) => {
      const name = text(body.get('name'), 80);
      const email = text(body.get('email'), 120);
      const mobile = text(body.get('mobile'), 30);
      const message = text(body.get('message'), 1000);
      const code = text(body.get('letters_code'), 20);
      if (!name || !email || !mobile || !message) return sendJSON(res, 400, { ok: false, message: 'Please complete all required fields.' });
      if (!validEmail(email)) return sendJSON(res, 400, { ok: false, message: 'Please enter a valid email address.' });
      const captcha = cookies(req).mtel_captcha;
      if (captcha && code.toUpperCase() !== captcha.toUpperCase()) {
        return sendJSON(res, 400, { ok: false, message: 'The captcha code does not match.' });
      }
      addEnquiry({ type: 'contact', name, email, phone: mobile, message });
      sendJSON(res, 200, { ok: true, message: 'Thank you. We will get in touch with you.' });
    }).catch(() => sendJSON(res, 400, { ok: false, message: 'Unable to read the form.' }));
    return;
  }

  if (req.method === 'POST' && pathname === '/customer-login.php') {
    readBody(req).then((body) => {
      const username = text(body.get('username'), 80);
      if (!username || !body.get('password')) return sendJSON(res, 400, { ok: false, message: 'Please enter your username and password.' });
      addEnquiry({ type: 'login', username, name: username, email: '', phone: '', message: 'Customer login request' });
      sendJSON(res, 200, { ok: true, message: 'Login request submitted.' });
    }).catch(() => sendJSON(res, 400, { ok: false, message: 'Unable to read the form.' }));
    return;
  }

  if (req.method === 'POST' && pathname === '/sign-up.php') {
    readBody(req).then((body) => {
      const name = text(body.get('name'), 80);
      const email = text(body.get('email'), 120);
      if (!name || !email || !body.get('password')) return sendJSON(res, 400, { ok: false, message: 'Please complete all required fields.' });
      if (!validEmail(email)) return sendJSON(res, 400, { ok: false, message: 'Please enter a valid email address.' });
      addEnquiry({ type: 'signup', name, email, phone: '', message: 'Sign-up request' });
      sendJSON(res, 200, { ok: true, message: 'Thank you. We will get in touch with you.' });
    }).catch(() => sendJSON(res, 400, { ok: false, message: 'Unable to read the form.' }));
    return;
  }

  // Original page URLs resolve to the rebuilt pages.
  const legacy = {
    '/index.php': '/index.html',
    '/about-us.php': '/about-us.html',
    '/services.php': '/services.html',
    '/contact-us.php': '/contact-us.html',
    '/clients-list.php': '/clients-list.html',
    '/privacy-policy.php': '/privacy-policy.html',
    '/cookies-policy.php': '/cookies-policy.html',
    '/data-deletion.php': '/data-deletion.html',
    '/terms-conditions.php': '/terms-conditions.html',
    '/refund-policy.php': '/refund-policy.html',
    '/customer-login.php': '/index.html',
  };
  if (Object.prototype.hasOwnProperty.call(legacy, pathname)) pathname = legacy[pathname];

  // Never expose source, runtime data or repository internals.
  const blocked = ['/data/', '/lib/', '/src/', '/.git/', '/admin/'];
  if (blocked.some((prefix) => pathname.startsWith(prefix)) || pathname === '/server.js') {
    return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
  }

  const safe = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join(root, safe);
  if (!filePath.startsWith(root)) return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain' });
  serveFile(res, filePath);
});

server.listen(port, () => {
  console.log(`M-Tel Networks running at http://localhost:${port}`);
  console.log(`Admin panel at http://localhost:${port}/admin/`);
});
