export const SCHEMA_SQL = `
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
`;
