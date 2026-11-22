/*
 * M-Tel admin — tiny JSON data store.
 * Zero dependencies. Synchronous, atomic writes serialised through one queue,
 * which is plenty for a single-process site and keeps records easy to back up.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');
let queue = Promise.resolve();

function ensureDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function fileFor(name) {
  return path.join(dataDir, `${name}.json`);
}

function read(name, fallback) {
  ensureDir();
  const file = fileFor(name);
  if (!fs.existsSync(file)) return fallback;
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    return value === null || value === undefined ? fallback : value;
  } catch (err) {
    console.error(`[store] Could not parse ${name}.json:`, err.message);
    return fallback;
  }
}

function writeSync(name, value) {
  ensureDir();
  const target = fileFor(name);
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, target);
}

function write(name, value) {
  return enqueue(() => {
    writeSync(name, value);
    return value;
  });
}

function enqueue(task) {
  const result = queue.then(task, task);
  queue = result.catch(() => {});
  return result;
}

/* Every mutation reads, changes and writes inside the queue so two concurrent
 * form posts can never overwrite one another. */
function mutate(name, fallback, change) {
  return enqueue(() => {
    const value = read(name, fallback);
    const outcome = change(value);
    writeSync(name, value);
    return outcome;
  });
}

function seed(name, factory) {
  ensureDir();
  const file = fileFor(name);
  if (fs.existsSync(file)) return read(name, factory());
  const value = factory();
  writeSync(name, value);
  return value;
}

function id() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function cap(list, limit) {
  return Array.isArray(list) && list.length > limit ? list.slice(0, limit) : list;
}

module.exports = { dataDir, ensureDir, read, write, mutate, seed, id, now, cap };
