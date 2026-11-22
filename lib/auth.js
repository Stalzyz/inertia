/*
 * M-Tel admin — authentication.
 * Credentials are seeded from ADMIN_USER / ADMIN_PASSWORD on first run, stored
 * as scrypt hashes, and sessions are short-lived HMAC-signed cookies.
 */
const crypto = require('crypto');
const store = require('./store');

const COOKIE_NAME = 'mtel_admin';
const SESSION_MS = 8 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 6;
const ATTEMPT_WINDOW = 15 * 60 * 1000;
const attempts = new Map();

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  try {
    const candidate = crypto.scryptSync(String(password), salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  } catch (err) {
    return false;
  }
}

function randomPassword() {
  return crypto.randomBytes(12).toString('base64url');
}

function secret() {
  const auth = store.seed('auth', () => ({ secret: crypto.randomBytes(32).toString('hex') }));
  if (!auth.secret) {
    auth.secret = crypto.randomBytes(32).toString('hex');
    store.write('auth', auth);
  }
  return auth.secret;
}

function init() {
  secret();
  const users = store.read('users', null);
  if (users && users.length) return;

  const username = (process.env.ADMIN_USER || 'admin').trim().slice(0, 40) || 'admin';
  const generated = !process.env.ADMIN_PASSWORD;
  const password = generated ? randomPassword() : process.env.ADMIN_PASSWORD;
  const { salt, hash } = hashPassword(password);
  store.write('users', [{
    id: store.id(),
    username,
    displayName: username,
    email: (process.env.ADMIN_EMAIL || 'md@mtelnetworks.com').trim(),
    role: 'owner',
    salt,
    hash,
    disabled: false,
    createdAt: store.now(),
    lastLogin: null
  }]);

  if (generated) {
    console.log('\n  M-Tel admin account created (no ADMIN_PASSWORD was set).');
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
    console.log('  Save this password — it is shown once. Set ADMIN_USER /');
    console.log('  ADMIN_PASSWORD before the next run, or change it in Users.\n');
  }
}

function listUsers() {
  return store.read('users', []);
}

function findUser(username) {
  const needle = String(username || '').toLowerCase();
  return listUsers().find((u) => u.username.toLowerCase() === needle) || null;
}

function findById(id) {
  return listUsers().find((u) => u.id === id) || null;
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName || user.username,
    email: user.email || '',
    role: user.role,
    disabled: Boolean(user.disabled),
    createdAt: user.createdAt || null,
    lastLogin: user.lastLogin || null
  };
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

function createToken(username) {
  const encoded = Buffer.from(username).toString('base64url');
  const expiry = String(Date.now() + SESSION_MS);
  const payload = `${encoded}.${expiry}`;
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encoded, expiry, signature] = parts;
  const payload = `${encoded}.${expiry}`;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (!/^\d+$/.test(expiry) || Number(expiry) < Date.now()) return null;
  try {
    return Buffer.from(encoded, 'base64url').toString('utf8');
  } catch (err) {
    return null;
  }
}

function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function secure(req) {
  return process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
}

function sessionCookie(req, token) {
  const flags = [`${COOKIE_NAME}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${Math.floor(SESSION_MS / 1000)}`];
  if (secure(req)) flags.push('Secure');
  return flags.join('; ');
}

function clearCookie(req) {
  const flags = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure(req)) flags.push('Secure');
  return flags.join('; ');
}

function authenticate(req) {
  const username = readToken(cookies(req)[COOKIE_NAME]);
  if (!username) return null;
  const user = findUser(username);
  if (!user || user.disabled) return null;
  return user;
}

function loginAllowed(ip) {
  const key = String(ip || 'unknown');
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < Date.now()) {
    attempts.set(key, { count: 0, resetAt: Date.now() + ATTEMPT_WINDOW });
    return true;
  }
  return entry.count < MAX_ATTEMPTS;
}

function recordFailure(ip) {
  const key = String(ip || 'unknown');
  const entry = attempts.get(key) || { count: 0, resetAt: Date.now() + ATTEMPT_WINDOW };
  entry.count += 1;
  attempts.set(key, entry);
}

function clearFailures(ip) {
  attempts.delete(String(ip || 'unknown'));
}

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
}

module.exports = {
  COOKIE_NAME,
  init,
  hashPassword,
  verifyPassword,
  randomPassword,
  listUsers,
  findUser,
  findById,
  publicUser,
  createToken,
  sessionCookie,
  clearCookie,
  authenticate,
  loginAllowed,
  recordFailure,
  clearFailures,
  clientIp
};
