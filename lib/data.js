import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";

// On Vercel (and most serverless hosts) the deployed filesystem is read-only —
// only /tmp is writable, and it doesn't persist across cold starts or between
// instances. For local dev / a host with a persistent disk (Render, Fly.io, a
// VPS), we use a normal file under the project. On Vercel, we copy the
// bundled, pre-seeded database into /tmp on first use so the demo works, but
// this is NOT durable production storage — see README's "Deploying" section
// for the real fix (a hosted SQLite-compatible or Postgres database).
const isServerless = !!process.env.VERCEL;
const bundledDbPath = path.join(process.cwd(), "data", "apex.db");
const dbPath = isServerless ? "/tmp/apex.db" : bundledDbPath;

if (isServerless) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dbPath) && fs.existsSync(bundledDbPath)) {
    fs.copyFileSync(bundledDbPath, dbPath);
  }
} else {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

const globalForDb = globalThis;

function openDb() {
  const database = new DatabaseSync(dbPath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      grade INTEGER NOT NULL,
      cert TEXT NOT NULL UNIQUE,
      price INTEGER NOT NULL,
      imageUrl TEXT,
      pal TEXT,
      tag TEXT,
      sold INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stripeSessionId TEXT NOT NULL UNIQUE,
      email TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL REFERENCES orders(id),
      cardId INTEGER NOT NULL REFERENCES cards(id),
      price INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      salt TEXT NOT NULL,
      subscribed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      userId INTEGER NOT NULL REFERENCES users(id),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      expiresAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      type TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      orderId INTEGER,
      sent INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      expiresAt TEXT NOT NULL
    );
  `);
  return database;
}

export const db = globalForDb.__apexDb || openDb();
if (process.env.NODE_ENV !== "production") globalForDb.__apexDb = db;

function row(r) {
  return r ? { ...r, sold: !!r.sold } : null;
}
function rows(rs) {
  return rs.map(row);
}

const PAGE_SIZE = 24;

export function listCards({ category, grade, sort = "newest", search = "", page = 1, includeSold = false } = {}) {
  const where = [];
  const params = [];

  if (!includeSold) where.push("sold = 0");
  if (category && category !== "all") {
    where.push("category = ?");
    params.push(category);
  }
  if (grade === "10") { where.push("grade = ?"); params.push(10); }
  else if (grade === "9") { where.push("grade >= ?"); params.push(9); }
  else if (grade === "7") { where.push("grade >= ?"); params.push(7); }
  else if (grade === "below7") { where.push("grade < ?"); params.push(7); }

  if (search) {
    where.push("(title LIKE ? OR cert LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  let orderBy = "createdAt DESC, id DESC";
  if (sort === "grade-desc") orderBy = "grade DESC, id DESC";
  else if (sort === "price-asc") orderBy = "price ASC";
  else if (sort === "price-desc") orderBy = "price DESC";

  const total = db.prepare(`SELECT COUNT(*) as c FROM cards ${whereSql}`).get(...params).c;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;

  const cards = rows(
    db
      .prepare(`SELECT * FROM cards ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
      .all(...params, PAGE_SIZE, offset)
  );

  return { cards, total, page: safePage, pageSize: PAGE_SIZE, totalPages };
}

export function getCardById(id) {
  return row(db.prepare("SELECT * FROM cards WHERE id = ?").get(id));
}

export function getAvailableCardsByIds(ids) {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  return rows(
    db.prepare(`SELECT * FROM cards WHERE id IN (${placeholders}) AND sold = 0`).all(...ids)
  );
}

export function createPendingOrder(stripeSessionIdPlaceholder, cards) {
  const insertOrder = db.prepare(
    "INSERT INTO orders (stripeSessionId, status) VALUES (?, 'pending')"
  );
  const info = insertOrder.run(stripeSessionIdPlaceholder);
  const orderId = info.lastInsertRowid;

  const insertItem = db.prepare(
    "INSERT INTO order_items (orderId, cardId, price) VALUES (?, ?, ?)"
  );
  for (const card of cards) {
    insertItem.run(orderId, card.id, card.price);
  }
  return orderId;
}

export function setOrderStripeSession(orderId, sessionId) {
  db.prepare("UPDATE orders SET stripeSessionId = ? WHERE id = ?").run(sessionId, orderId);
}

export function getOrderBySessionId(sessionId) {
  const order = db.prepare("SELECT * FROM orders WHERE stripeSessionId = ?").get(sessionId);
  if (!order) return null;
  const items = db
    .prepare(
      `SELECT order_items.id, order_items.price, cards.title, cards.id as cardId
       FROM order_items JOIN cards ON cards.id = order_items.cardId
       WHERE order_items.orderId = ?`
    )
    .all(order.id);
  return { ...order, items: items.map((i) => ({ ...i, card: { title: i.title, id: i.cardId } })) };
}

export function markOrderPaid(orderId, email) {
  const order = db.prepare("SELECT status FROM orders WHERE id = ?").get(orderId);
  if (!order || order.status === "paid") return;

  const items = db.prepare("SELECT cardId FROM order_items WHERE orderId = ?").all(orderId);

  db.exec("BEGIN");
  try {
    db.prepare("UPDATE orders SET status = 'paid', email = ? WHERE id = ?").run(email || null, orderId);
    const markSold = db.prepare("UPDATE cards SET sold = 1 WHERE id = ?");
    for (const item of items) markSold.run(item.cardId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

/* ---------------- Cards: create (admin upload) ---------------- */

export function createCard({ title, category, grade, cert, price, imageUrl }) {
  const info = db
    .prepare(
      `INSERT INTO cards (title, category, grade, cert, price, imageUrl) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(title, category, grade, cert, price, imageUrl || null);
  return getCardById(info.lastInsertRowid);
}

export function certExists(cert) {
  return !!db.prepare("SELECT 1 FROM cards WHERE cert = ?").get(cert);
}

/* ---------------- Users & sessions ---------------- */

export function createUser({ email, passwordHash, salt, subscribed }) {
  const info = db
    .prepare("INSERT INTO users (email, passwordHash, salt, subscribed) VALUES (?, ?, ?, ?)")
    .run(email.toLowerCase(), passwordHash, salt, subscribed ? 1 : 0);
  return getUserById(info.lastInsertRowid);
}

export function getUserByEmail(email) {
  const u = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  return u ? { ...u, subscribed: !!u.subscribed } : null;
}

export function getUserById(id) {
  const u = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return u ? { ...u, subscribed: !!u.subscribed } : null;
}

export function createSession(userId, token, expiresAt) {
  db.prepare("INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)").run(
    token,
    userId,
    expiresAt
  );
}

export function getSession(token) {
  const s = db
    .prepare("SELECT * FROM sessions WHERE token = ? AND expiresAt > datetime('now')")
    .get(token);
  if (!s) return null;
  return getUserById(s.userId);
}

export function deleteSession(token) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

/* ---------------- Newsletter subscribers ---------------- */

export function addSubscriber(email) {
  try {
    db.prepare("INSERT INTO subscribers (email) VALUES (?)").run(email.toLowerCase());
    return true;
  } catch (e) {
    // already subscribed — treat as success (idempotent signup)
    return false;
  }
}

export function isSubscribed(email) {
  return !!db.prepare("SELECT 1 FROM subscribers WHERE email = ?").get(email.toLowerCase());
}

/* ---------------- Notifications / email log ---------------- */

export function logNotification({ email, type, subject, body, orderId, sent }) {
  db.prepare(
    `INSERT INTO notifications (email, type, subject, body, orderId, sent) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(email, type, subject, body, orderId || null, sent ? 1 : 0);
}

/* ---------------- Admin sessions ---------------- */

export function createAdminSession(token, expiresAt) {
  db.prepare("INSERT INTO admin_sessions (token, expiresAt) VALUES (?, ?)").run(token, expiresAt);
}

export function isValidAdminSession(token) {
  if (!token) return false;
  return !!db
    .prepare("SELECT 1 FROM admin_sessions WHERE token = ? AND expiresAt > datetime('now')")
    .get(token);
}
