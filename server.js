/*
 * M-Tel Networks — tiny zero-dependency server.
 * Serves the rebuilt static pages, keeps the original .php destinations alive,
 * and handles the contact / login / sign-up forms and captcha endpoint.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
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

function sendJSON(res, status, data) {
  send(res, status, JSON.stringify(data), { 'Content-Type': 'application/json; charset=utf-8' });
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

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
    send(res, 200, data, { 'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === '/') pathname = '/index.html';

  if (pathname === '/captcha_code_file.php') {
    const code = newCaptcha();
    send(res, 200, captchaSVG(code), {
      'Content-Type': 'image/svg+xml',
      'Set-Cookie': `mtel_captcha=${code}; Path=/; HttpOnly; SameSite=Lax`,
      'Cache-Control': 'no-store',
    });
    return;
  }

  // --- Speed Test & Coverage API Endpoints ---
  if (pathname === '/api/speedtest/ping') {
    sendJSON(res, 200, { ok: true, serverTime: Date.now(), gateway: 'M-Tel Coimbatore Core-1' });
    return;
  }

  if (pathname === '/api/speedtest/download') {
    // Generate streaming chunks of pseudo-random network payload (approx 4MB total)
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
      if (sent >= size) {
        res.end();
      } else {
        res.once('drain', writeMore);
      }
    }
    writeMore();
    return;
  }

  if (req.method === 'POST' && pathname === '/api/speedtest/upload') {
    let received = 0;
    const startTime = Date.now();
    req.on('data', (chunk) => { received += chunk.length; });
    req.on('end', () => {
      const durationMs = Math.max(1, Date.now() - startTime);
      sendJSON(res, 200, { ok: true, bytesReceived: received, durationMs });
    });
    req.on('error', () => sendJSON(res, 500, { ok: false }));
    return;
  }

  if (req.method === 'POST' && pathname === '/contact-us.php') {
    readBody(req).then((body) => {
      const name = (body.get('name') || '').trim();
      const email = (body.get('email') || '').trim();
      const mobile = (body.get('mobile') || '').trim();
      const message = (body.get('message') || '').trim();
      const code = (body.get('letters_code') || '').trim();
      if (!name || !email || !mobile || !message) return sendJSON(res, 400, { ok: false, message: 'Please complete all required fields.' });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return sendJSON(res, 400, { ok: false, message: 'Please enter a valid email address.' });
      if (code && cookies(req).mtel_captcha && code.toUpperCase() !== cookies(req).mtel_captcha.toUpperCase()) {
        return sendJSON(res, 400, { ok: false, message: 'The captcha code does not match.' });
      }
      sendJSON(res, 200, { ok: true, message: 'Thank you. We will get in touch with you.' });
    }).catch(() => sendJSON(res, 400, { ok: false, message: 'Unable to read the form.' }));
    return;
  }

  if (req.method === 'POST' && pathname === '/customer-login.php') {
    readBody(req).then((body) => {
      const username = (body.get('username') || '').trim();
      const password = (body.get('password') || '').trim();
      if (!username || !password) return sendJSON(res, 400, { ok: false, message: 'Please enter your username and password.' });
      sendJSON(res, 200, { ok: true, message: 'Login request submitted.' });
    }).catch(() => sendJSON(res, 400, { ok: false, message: 'Unable to read the form.' }));
    return;
  }

  if (req.method === 'POST' && pathname === '/sign-up.php') {
    readBody(req).then((body) => {
      const name = (body.get('name') || '').trim();
      const email = (body.get('email') || '').trim();
      const password = (body.get('password') || '').trim();
      if (!name || !email || !password) return sendJSON(res, 400, { ok: false, message: 'Please complete all required fields.' });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return sendJSON(res, 400, { ok: false, message: 'Please enter a valid email address.' });
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

  const safe = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join(root, safe);
  if (!filePath.startsWith(root)) return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain' });
  serveFile(res, filePath);
});

server.listen(port, () => {
  console.log(`M-Tel Networks running at http://localhost:${port}`);
});
