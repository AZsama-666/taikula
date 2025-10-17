import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const dbFile = process.env.SQLITE_FILE || "./data/app.db";
const dataDir = path.dirname(dbFile);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbFile);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDB() {
  // Create tables
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid INTEGER PRIMARY KEY,
    nickname TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS wallets (
    uid INTEGER PRIMARY KEY,
    coins INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(uid) REFERENCES users(uid)
  );

  CREATE TABLE IF NOT EXISTS wallet_tx (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid INTEGER NOT NULL,
    type TEXT NOT NULL, -- recharge|draw|reward|refund
    amount INTEGER NOT NULL,
    biz_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(uid) REFERENCES users(uid)
  );

  CREATE TABLE IF NOT EXISTS server_seeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_seed TEXT NOT NULL,
    server_seed_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS draw_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idempotency_key TEXT UNIQUE,
    uid INTEGER NOT NULL,
    coin_cost INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS draw_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    uid INTEGER NOT NULL,
    prize_id TEXT NOT NULL,
    tier TEXT NOT NULL,
    face_value INTEGER NOT NULL,
    server_seed_hash TEXT NOT NULL,
    client_salt TEXT NOT NULL,
    rand_hex TEXT NOT NULL,
    policy_tags TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(session_id) REFERENCES draw_sessions(id),
    FOREIGN KEY(uid) REFERENCES users(uid)
  );

  CREATE TABLE IF NOT EXISTS prizes (
    prize_id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- physical|voucher|coin|points|cosmetic
    face_value INTEGER NOT NULL DEFAULT 0,
    meta TEXT
  );

  CREATE TABLE IF NOT EXISTS prize_inventory (
    prize_id TEXT PRIMARY KEY,
    total INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    per_user_limit INTEGER DEFAULT NULL,
    FOREIGN KEY(prize_id) REFERENCES prizes(prize_id)
  );

  CREATE TABLE IF NOT EXISTS pity_state (
    uid INTEGER PRIMARY KEY,
    miss_counter INTEGER NOT NULL DEFAULT 0,
    last_hit_tier TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(uid) REFERENCES users(uid)
  );

  CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    uid INTEGER NOT NULL,
    face INTEGER NOT NULL,
    expire_at TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE|USED|EXPIRED
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(uid) REFERENCES users(uid)
  );

  CREATE TABLE IF NOT EXISTS idempotency_log (
    key TEXT PRIMARY KEY,
    response_json TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recharge_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    coins INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING|APPROVED|REJECTED
    payment_proof TEXT,
    admin_id INTEGER,
    admin_note TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(uid) REFERENCES users(uid),
    FOREIGN KEY(admin_id) REFERENCES admins(id)
  );

  CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    coins_deducted INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING|APPROVED|REJECTED
    account_info TEXT,
    admin_id INTEGER,
    admin_note TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(uid) REFERENCES users(uid),
    FOREIGN KEY(admin_id) REFERENCES admins(id)
  );
  `);

  // Ensure default server seed
  const existingSeed = db.prepare("SELECT * FROM server_seeds WHERE active=1").get();
  if (!existingSeed) {
    let seed = process.env.SERVER_SEED;
    if (!seed || seed == "auto") {
      seed = crypto.randomBytes(32).toString("hex");
    } else {
      seed = String(seed);
    }
    let seed_hash = crypto.createHash("sha256").update(seed).digest("hex");
    db.prepare("INSERT INTO server_seeds (server_seed, server_seed_hash, active) VALUES (?, ?, 1)").run(seed, seed_hash);
  }

  // Ensure default user
  const user = db.prepare("SELECT * FROM users WHERE uid=1").get();
  if (!user) {
    db.prepare("INSERT INTO users (uid, nickname) VALUES (1, 'DemoUser')").run();
    db.prepare("INSERT INTO wallets (uid, coins, points, version) VALUES (1, 0, 0, 0)").run();
    db.prepare("INSERT INTO pity_state (uid, miss_counter, last_hit_tier) VALUES (1, 0, NULL)").run();
  }

  // Ensure default admin (username: admin, password: admin123)
  const admin = db.prepare("SELECT * FROM admins WHERE username='admin'").get();
  if (!admin) {
    const passwordHash = crypto.createHash("sha256").update("admin123").digest("hex");
    db.prepare("INSERT INTO admins (username, password_hash, role) VALUES (?, ?, 'admin')").run("admin", passwordHash);
  }
}
