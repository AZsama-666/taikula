import crypto from "crypto";
import { db } from "../db.js";

export function getActiveServerSeed() {
  const row = db.prepare("SELECT server_seed, server_seed_hash FROM server_seeds WHERE active=1 ORDER BY id DESC LIMIT 1").get();
  return row; // {server_seed, server_seed_hash}
}

export function hmacRandHex(serverSeed: string, clientSalt: string) {
  const h = crypto.createHmac("sha256", serverSeed);
  h.update(clientSalt);
  return h.digest("hex"); // 64 hex chars
}

// Convert hex to float in [0,1)
export function hexToUnitFloat(hex: string) {
  // use first 13 hex chars (~52 bits) to safely fit JS number mantissa
  const slice = hex.slice(0, 13);
  const intVal = parseInt(slice, 16);
  const max = Math.pow(16, slice.length);
  return intVal / max;
}
