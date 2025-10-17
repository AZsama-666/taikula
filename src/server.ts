import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { db, initDB } from "./db.js";
import { drawOnce } from "./services/prizeEngine.js";

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(morgan("dev"));

initDB();

function getCoinPrice() {
  const v = process.env.COIN_PRICE;
  return v ? parseInt(v, 10) : 300;
}

function requireIdem(req, res, next) {
  const key = req.header("Idempotency-Key");
  if (!key) return res.status(400).json({ error: "IDEMPOTENCY_REQUIRED" });
  (req as any).idemKey = key;
  next();
}

function idemCacheGet(key: string) {
  const row = db.prepare("SELECT response_json FROM idempotency_log WHERE key=?").get(key) as any;
  if (!row) return null;
  try { return JSON.parse(row.response_json); } catch { return null; }
}

function idemCacheSet(key: string, resp: any) {
  db.prepare("INSERT OR REPLACE INTO idempotency_log (key, response_json) VALUES (?, ?)").run(key, JSON.stringify(resp));
}

app.get("/v1/me", (req, res) => {
  const u = db.prepare("SELECT * FROM users WHERE uid=1").get();
  const w = db.prepare("SELECT coins, points FROM wallets WHERE uid=1").get();
  const seedHash = db.prepare("SELECT server_seed_hash FROM server_seeds WHERE active=1 ORDER BY id DESC LIMIT 1").get() as any;
  res.json({ user: u, wallet: w, server_seed_hash: seedHash?.server_seed_hash, coin_price: getCoinPrice() });
});

app.get("/v1/wallet", (req, res) => {
  const w = db.prepare("SELECT coins, points FROM wallets WHERE uid=1").get();
  res.json(w);
});

app.post("/v1/recharge/create", requireIdem, (req, res) => {
  const cached = idemCacheGet((req as any).idemKey);
  if (cached) return res.json(cached);

  const amount = Math.floor(Number(req.body?.amount || 0));
  if (!amount || amount <= 0) return res.status(400).json({ error: "BAD_AMOUNT" });

  const coins = Math.floor(amount / getCoinPrice());
  if (coins <= 0) return res.status(400).json({ error: "AMOUNT_TOO_SMALL", coin_price: getCoinPrice() });

  db.prepare("UPDATE wallets SET coins=coins+? WHERE uid=1").run(coins);
  db.prepare("INSERT INTO wallet_tx (uid, type, amount, biz_id) VALUES (1, 'recharge', ?, ?)").run(coins, "recharge:"+Date.now());

  const resp = { ok: true, coins_added: coins };
  idemCacheSet((req as any).idemKey, resp);
  res.json(resp);
});

app.post("/v1/draw/start", requireIdem, (req, res) => {
  const cached = idemCacheGet((req as any).idemKey);
  if (cached) return res.json(cached);

  const salt = String(req.body?.client_salt || "");
  if (!salt) return res.status(400).json({ error: "BAD_SALT" });

  const w = db.prepare("SELECT coins FROM wallets WHERE uid=1").get() as {coins:number};
  if (!w || w.coins <= 0) return res.status(400).json({ error: "WALLET_INSUFFICIENT" });

  const tx = db.transaction(() => {
    db.prepare("UPDATE wallets SET coins=coins-1 WHERE uid=1 AND coins>=1").run();
    db.prepare("INSERT INTO draw_sessions (idempotency_key, uid, coin_cost) VALUES (?, 1, 1)").run((req as any).idemKey);

    const result = drawOnce(1, salt);
    db.prepare("INSERT INTO draw_results (session_id, uid, prize_id, tier, face_value, server_seed_hash, client_salt, rand_hex, policy_tags) VALUES ((SELECT id FROM draw_sessions WHERE idempotency_key=?), 1, ?, ?, ?, ?, ?, ?, ?)")
      .run((req as any).idemKey, result.prize_id, result.tier, result.face_value, result.server_seed_hash, result.client_salt, result.rand_hex, (result.policy_tags||[]).join(","));

    db.prepare("INSERT INTO wallet_tx (uid, type, amount, biz_id) VALUES (1, 'draw', -1, ?)").run("draw:"+Date.now());

    const nw = db.prepare("SELECT coins, points FROM wallets WHERE uid=1").get();
    return { ...result, balances: nw };
  });

  try {
    const resp = tx();
    idemCacheSet((req as any).idemKey, resp);
    res.json(resp);
  } catch (e:any) {
    res.status(500).json({ error: "DRAW_FAILED", message: e?.message });
  }
});

app.get("/v1/vouchers", (req, res) => {
  const rows = db.prepare("SELECT code, face, status, created_at FROM vouchers WHERE uid=1 ORDER BY id DESC").all();
  res.json({ vouchers: rows });
});

// ============ Withdrawal API ============
app.post("/v1/withdrawal/create", requireIdem, (req, res) => {
  const cached = idemCacheGet((req as any).idemKey);
  if (cached) return res.json(cached);

  const amount = Math.floor(Number(req.body?.amount || 0));
  const accountInfo = String(req.body?.account_info || "");
  if (!amount || amount <= 0) return res.status(400).json({ error: "BAD_AMOUNT" });
  if (!accountInfo) return res.status(400).json({ error: "MISSING_ACCOUNT_INFO" });

  const coinPrice = getCoinPrice();
  const coinsNeeded = Math.ceil(amount / coinPrice);

  const w = db.prepare("SELECT coins FROM wallets WHERE uid=1").get() as {coins:number};
  if (!w || w.coins < coinsNeeded) return res.status(400).json({ error: "WALLET_INSUFFICIENT", coins_needed: coinsNeeded, coins_available: w?.coins || 0 });

  const tx = db.transaction(() => {
    db.prepare("UPDATE wallets SET coins=coins-? WHERE uid=1 AND coins>=?").run(coinsNeeded, coinsNeeded);
    db.prepare("INSERT INTO withdrawal_requests (uid, amount, coins_deducted, status, account_info) VALUES (1, ?, ?, 'PENDING', ?)").run(amount, coinsNeeded, accountInfo);
    db.prepare("INSERT INTO wallet_tx (uid, type, amount, biz_id) VALUES (1, 'withdrawal', ?, ?)").run(-coinsNeeded, "withdrawal:"+Date.now());
    return { ok: true, coins_deducted: coinsNeeded, amount };
  });

  try {
    const resp = tx();
    idemCacheSet((req as any).idemKey, resp);
    res.json(resp);
  } catch (e:any) {
    res.status(500).json({ error: "WITHDRAWAL_FAILED", message: e?.message });
  }
});

app.get("/v1/withdrawal/history", (req, res) => {
  const rows = db.prepare("SELECT id, amount, coins_deducted, status, created_at, updated_at, admin_note FROM withdrawal_requests WHERE uid=1 ORDER BY id DESC").all();
  res.json({ withdrawals: rows });
});

app.get("/v1/recharge/history", (req, res) => {
  const rows = db.prepare("SELECT id, amount, coins, status, created_at, updated_at, admin_note FROM recharge_requests WHERE uid=1 ORDER BY id DESC").all();
  res.json({ recharges: rows });
});

// ============ Admin API ============
function requireAdmin(req: any, res: any, next: any) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "UNAUTHORIZED" });
  
  // Simple token validation (in production, use JWT or session)
  const parts = token.split(":");
  if (parts.length !== 2) return res.status(401).json({ error: "INVALID_TOKEN" });
  
  const [username, password] = parts;
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const admin = db.prepare("SELECT * FROM admins WHERE username=? AND password_hash=?").get(username, passwordHash);
  
  if (!admin) return res.status(401).json({ error: "UNAUTHORIZED" });
  req.admin = admin;
  next();
}

app.post("/v1/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "MISSING_CREDENTIALS" });
  
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const admin = db.prepare("SELECT id, username, role, created_at FROM admins WHERE username=? AND password_hash=?").get(username, passwordHash);
  
  if (!admin) return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  
  // Return a simple token (in production, use JWT)
  res.json({ ok: true, admin, token: `${username}:${password}` });
});

app.get("/v1/admin/dashboard", requireAdmin, (req, res) => {
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as {count:number};
  const pendingRecharges = db.prepare("SELECT COUNT(*) as count FROM recharge_requests WHERE status='PENDING'").get() as {count:number};
  const pendingWithdrawals = db.prepare("SELECT COUNT(*) as count FROM withdrawal_requests WHERE status='PENDING'").get() as {count:number};
  const totalCoinsInCirculation = db.prepare("SELECT SUM(coins) as total FROM wallets").get() as {total:number};
  
  res.json({
    total_users: totalUsers.count,
    pending_recharges: pendingRecharges.count,
    pending_withdrawals: pendingWithdrawals.count,
    total_coins: totalCoinsInCirculation.total || 0
  });
});

app.get("/v1/admin/users", requireAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT u.uid, u.nickname, u.created_at, w.coins, w.points
    FROM users u
    LEFT JOIN wallets w ON u.uid = w.uid
    ORDER BY u.uid DESC
  `).all();
  res.json({ users });
});

app.get("/v1/admin/recharges", requireAdmin, (req, res) => {
  const recharges = db.prepare(`
    SELECT r.*, u.nickname
    FROM recharge_requests r
    LEFT JOIN users u ON r.uid = u.uid
    ORDER BY r.id DESC
  `).all();
  res.json({ recharges });
});

app.post("/v1/admin/recharge/approve", requireAdmin, (req, res) => {
  const { id, note } = req.body;
  if (!id) return res.status(400).json({ error: "MISSING_ID" });
  
  const request = db.prepare("SELECT * FROM recharge_requests WHERE id=?").get(id) as any;
  if (!request) return res.status(404).json({ error: "REQUEST_NOT_FOUND" });
  if (request.status !== "PENDING") return res.status(400).json({ error: "REQUEST_ALREADY_PROCESSED" });
  
  const tx = db.transaction(() => {
    db.prepare("UPDATE recharge_requests SET status='APPROVED', admin_id=?, admin_note=?, updated_at=datetime('now') WHERE id=?").run((req as any).admin.id, note || "", id);
    db.prepare("UPDATE wallets SET coins=coins+? WHERE uid=?").run(request.coins, request.uid);
    db.prepare("INSERT INTO wallet_tx (uid, type, amount, biz_id) VALUES (?, 'recharge', ?, ?)").run(request.uid, request.coins, `recharge_approved:${id}`);
  });
  
  try {
    tx();
    res.json({ ok: true });
  } catch (e:any) {
    res.status(500).json({ error: "APPROVAL_FAILED", message: e?.message });
  }
});

app.post("/v1/admin/recharge/reject", requireAdmin, (req, res) => {
  const { id, note } = req.body;
  if (!id) return res.status(400).json({ error: "MISSING_ID" });
  
  const request = db.prepare("SELECT * FROM recharge_requests WHERE id=?").get(id) as any;
  if (!request) return res.status(404).json({ error: "REQUEST_NOT_FOUND" });
  if (request.status !== "PENDING") return res.status(400).json({ error: "REQUEST_ALREADY_PROCESSED" });
  
  db.prepare("UPDATE recharge_requests SET status='REJECTED', admin_id=?, admin_note=?, updated_at=datetime('now') WHERE id=?").run((req as any).admin.id, note || "", id);
  res.json({ ok: true });
});

app.get("/v1/admin/withdrawals", requireAdmin, (req, res) => {
  const withdrawals = db.prepare(`
    SELECT w.*, u.nickname
    FROM withdrawal_requests w
    LEFT JOIN users u ON w.uid = u.uid
    ORDER BY w.id DESC
  `).all();
  res.json({ withdrawals });
});

app.post("/v1/admin/withdrawal/approve", requireAdmin, (req, res) => {
  const { id, note } = req.body;
  if (!id) return res.status(400).json({ error: "MISSING_ID" });
  
  const request = db.prepare("SELECT * FROM withdrawal_requests WHERE id=?").get(id) as any;
  if (!request) return res.status(404).json({ error: "REQUEST_NOT_FOUND" });
  if (request.status !== "PENDING") return res.status(400).json({ error: "REQUEST_ALREADY_PROCESSED" });
  
  db.prepare("UPDATE withdrawal_requests SET status='APPROVED', admin_id=?, admin_note=?, updated_at=datetime('now') WHERE id=?").run((req as any).admin.id, note || "", id);
  res.json({ ok: true });
});

app.post("/v1/admin/withdrawal/reject", requireAdmin, (req, res) => {
  const { id, note } = req.body;
  if (!id) return res.status(400).json({ error: "MISSING_ID" });
  
  const request = db.prepare("SELECT * FROM withdrawal_requests WHERE id=?").get(id) as any;
  if (!request) return res.status(404).json({ error: "REQUEST_NOT_FOUND" });
  if (request.status !== "PENDING") return res.status(400).json({ error: "REQUEST_ALREADY_PROCESSED" });
  
  const tx = db.transaction(() => {
    db.prepare("UPDATE withdrawal_requests SET status='REJECTED', admin_id=?, admin_note=?, updated_at=datetime('now') WHERE id=?").run((req as any).admin.id, note || "", id);
    // Refund coins
    db.prepare("UPDATE wallets SET coins=coins+? WHERE uid=?").run(request.coins_deducted, request.uid);
    db.prepare("INSERT INTO wallet_tx (uid, type, amount, biz_id) VALUES (?, 'refund', ?, ?)").run(request.uid, request.coins_deducted, `withdrawal_rejected:${id}`);
  });
  
  try {
    tx();
    res.json({ ok: true });
  } catch (e:any) {
    res.status(500).json({ error: "REJECTION_FAILED", message: e?.message });
  }
});

// Serve static files
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "admin.html"));
});

app.get("/share", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "share.html"));
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log("Lucky Draw server listening on http://localhost:"+port);
});
