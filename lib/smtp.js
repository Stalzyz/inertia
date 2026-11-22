/*
 * Tiny SMTP client — zero dependencies.
 * Supports plain SMTP, STARTTLS, implicit TLS (port 465), AUTH LOGIN/PLAIN and
 * a single text recipient. Used only for admin-configured notification emails.
 */
const net = require('net');
const tls = require('tls');
const os = require('os');

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function cleanHeader(value) {
  return String(value === null || value === undefined ? '' : value).replace(/[\r\n]+/g, ' ').trim();
}

function buildMessage(config, message) {
  const from = String(config.fromEmail || config.user || '').trim();
  const to = String(message.to || config.notifyEmail || '').trim();
  if (!EMAIL.test(from)) throw new Error('A valid SMTP from email is required.');
  if (!EMAIL.test(to)) throw new Error('A valid recipient email is required.');

  const subject = `${cleanHeader(config.subjectPrefix || '[M-Tel]')} ${cleanHeader(message.subject || 'Website notification')}`.trim();
  const fromName = cleanHeader(config.fromName || 'M-Tel Networks');
  const text = String(message.text || '').replace(/\r?\n/g, '\r\n');
  return [
    `From: ${fromName} <${from}>`,
    `To: <${to}>`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    text.replace(/^\./gm, '..'),
    '',
    '.'
  ].join('\r\n');
}

function session(config) {
  const host = String(config.host || '').trim();
  const port = Number(config.port) || (config.secure ? 465 : 587);
  const timeout = Math.max(3000, Math.min(30000, Number(config.timeoutMs) || 8000));
  if (!host) throw new Error('Enter an SMTP host first.');

  let socket;
  let buffer = '';
  let waiters = [];
  let dead = false;
  let closing = false;
  let handlers = {};

  function fail(err) {
    if (dead) return;
    dead = true;
    const queue = waiters;
    waiters = [];
    queue.forEach((waiter) => waiter.reject(err));
  }

  function pushLine(line) {
    const waiter = waiters[0];
    if (!waiter) return;
    waiter.lines.push(line);
    const separator = line[3];
    if (separator === ' ' || line.length === 3) {
      waiters.shift();
      waiter.resolve({ code: Number(line.slice(0, 3)), lines: waiter.lines });
    } else if (separator !== '-') {
      waiters.shift();
      waiter.reject(new Error('Unexpected SMTP response.'));
    }
  }

  function onData(chunk) {
    buffer += chunk.toString('utf8');
    let index;
    while ((index = buffer.indexOf('\r\n')) !== -1) {
      const line = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      pushLine(line);
      if (dead) break;
    }
  }

  function onError(err) { fail(err); }
  function onClose() { if (!closing) fail(new Error('SMTP connection closed unexpectedly.')); }
  function onTimeout() { fail(new Error('SMTP connection timed out.')); }

  function detach() {
    if (!socket) return;
    socket.removeListener('data', onData);
    socket.removeListener('error', onError);
    socket.removeListener('close', onClose);
    socket.removeListener('timeout', onTimeout);
    socket.setTimeout(0);
  }

  function attach(next) {
    socket = next;
    socket.setEncoding('utf8');
    socket.setTimeout(timeout, onTimeout);
    socket.on('data', onData);
    socket.on('error', onError);
    socket.on('close', onClose);
  }

  function read() {
    if (dead) return Promise.reject(new Error('SMTP session is closed.'));
    return new Promise((resolve, reject) => {
      waiters.push({ lines: [], resolve, reject });
    });
  }

  async function send(raw, label, expected) {
    if (dead) throw new Error('SMTP session is closed.');
    socket.write(`${raw}\r\n`, 'utf8');
    const response = await read();
    if (expected && response.code !== expected) {
      throw new Error(`${label} failed (${response.code}): ${response.lines[response.lines.length - 1]}`);
    }
    return response;
  }

  async function startTls() {
    const plain = socket;
    detach();
    const secureSocket = tls.connect({ socket: plain, servername: host, rejectUnauthorized: true });
    await new Promise((resolve, reject) => {
      secureSocket.once('secureConnect', resolve);
      secureSocket.once('error', reject);
    });
    attach(secureSocket);
  }

  async function hello() {
    try {
      return await send(`EHLO ${cleanHeader(os.hostname() || 'localhost')}`, 'EHLO', 250);
    } catch (err) {
      return send(`HELO ${cleanHeader(os.hostname() || 'localhost')}`, 'HELO', 250);
    }
  }

  async function authenticate(capabilities) {
    const user = String(config.user || '').trim();
    const password = String(config.password || '');
    if (!user || !password) return;
    if (/AUTH[=\s][^\r\n]*\bPLAIN\b/i.test(capabilities)) {
      const token = Buffer.from(`\0${user}\0${password}`).toString('base64');
      await send(`AUTH PLAIN ${token}`, 'AUTH PLAIN', 235);
      return;
    }
    await send('AUTH LOGIN', 'AUTH LOGIN', 334);
    await send(Buffer.from(user).toString('base64'), 'AUTH LOGIN username', 334);
    await send(Buffer.from(password).toString('base64'), 'AUTH LOGIN password', 235);
  }

  return {
    async connect() {
      const initial = config.secure
        ? tls.connect({ host, port, servername: host, rejectUnauthorized: true })
        : net.createConnection({ host, port });
      attach(initial);
      if (config.secure) {
        await new Promise((resolve, reject) => {
          initial.once('secureConnect', resolve);
          initial.once('error', reject);
        });
      }
      const greeting = await read();
      if (greeting.code !== 220) throw new Error(`SMTP server refused the connection (${greeting.code}).`);

      let capabilities = await hello();
      const banner = capabilities.lines.join('\n');
      if (!config.secure && /^250[- ]STARTTLS\b/im.test(banner) && config.starttls !== false) {
        await send('STARTTLS', 'STARTTLS', 220);
        await startTls();
        capabilities = await hello();
      }
      await authenticate(capabilities.lines.join('\n'));
      return this;
    },

    async deliver(message) {
      const body = buildMessage(config, message);
      const from = String(config.fromEmail || config.user || '').trim();
      await send(`MAIL FROM:<${from}>`, 'MAIL FROM', 250);
      await send(`RCPT TO:<${String(message.to || config.notifyEmail || '').trim()}>`, 'RCPT TO', 250);
      await send('DATA', 'DATA', 354);
      socket.write(`${body}\r\n`, 'utf8');
      const sent = await read();
      if (sent.code !== 250) throw new Error(`Message was not accepted (${sent.code}).`);
      return true;
    },

    close() {
      closing = true;
      const target = socket;
      try { target.write('QUIT\r\n'); } catch (err) { /* ignore */ }
      // Give the server a moment to process QUIT before the socket is reclaimed.
      if (target && typeof target.destroy === 'function') {
        const timer = setTimeout(() => {
          try { target.destroy(); } catch (err) { /* ignore */ }
        }, 750);
        if (timer.unref) timer.unref();
      }
    }
  };
}

async function sendMail(config, message) {
  const client = session(config);
  try {
    await client.connect();
    await client.deliver(message);
    return { ok: true };
  } finally {
    client.close();
  }
}

module.exports = { sendMail, EMAIL };
