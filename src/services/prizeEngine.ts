import fs from "fs";
import path from "path";
import { db } from "../db.js";
import { getActiveServerSeed, hmacRandHex, hexToUnitFloat } from "./rng.js";

type PrizeItem = {
  prize_id: string;
  tier: "S"|"A"|"B"|"C"|"D"|"E"|"F";
  weight: number;
  inventory?: number;
  max_per_user?: number | null;
};

type ProbabilityTable = {
  table_id: string;
  items: PrizeItem[];
  policies: {
    out_of_stock: "DOWNGRADE_TO_NEXT_TIER" | "REROLL" | "CONVERT_TO_POINTS";
    pity: { enable: boolean; threshold_to_C: number; once_AB_guarantee: boolean };
    happy_hour?: { enable: boolean; upgrade_E_to_C_prob: number };
  };
};

const tierOrder = ["S","A","B","C","D","E","F"];
const tierRank: Record<string, number> = Object.fromEntries(tierOrder.map((t,i)=>[t,i]));

function loadProbabilityTable(): ProbabilityTable {
  const p = path.join(process.cwd(), "config/probability_table.default.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function loadOffers() {
  const p = path.join(process.cwd(), "config/offers.default.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function nowInHappyHour(offers: any): boolean {
  const hh = offers.happy_hour;
  if (!hh || !hh.enable) return false;
  const now = new Date();
  const dow = now.getDay(); // 0 Sun ... 6 Sat
  const inDow = hh.dow.includes(dow);
  if (!inDow) return false;

  const [hs, ms] = hh.start.split(":").map((s:string)=>parseInt(s,10));
  const [he, me] = hh.end.split(":").map((s:string)=>parseInt(s,10));

  const start = new Date(now); start.setHours(hs, ms, 0, 0);
  const end = new Date(now);   end.setHours(he, me, 0, 0);
  return now >= start && now <= end;
}

function pickWeighted(items: PrizeItem[], unit: number): PrizeItem {
  const total = items.reduce((a,b)=>a + b.weight, 0);
  let x = unit * total;
  for (const it of items) {
    if (x < it.weight) return it;
    x -= it.weight;
  }
  return items[items.length-1];
}

function getInventory(prize_id: string): { total: number, used: number } | null {
  const row = db.prepare("SELECT total, used FROM prize_inventory WHERE prize_id=?").get(prize_id);
  if (!row) return null;
  return row;
}

function decInventory(prize_id: string): boolean {
  const row = db.prepare("SELECT total, used FROM prize_inventory WHERE prize_id=?").get(prize_id);
  if (!row) return false;
  if (row.total >= 0 && row.used >= row.total) return false;
  db.prepare("UPDATE prize_inventory SET used=used+1 WHERE prize_id=?").run(prize_id);
  return true;
}

function nextLowerAvailable(prize: PrizeItem): PrizeItem | null {
  const table = loadProbabilityTable();
  let idx = tierRank[prize.tier];
  while (idx < tierOrder.length - 1) {
    idx += 1;
    const candidates = table.items.filter(i => i.tier === tierOrder[idx]);
    for (const c of candidates) {
      const inv = getInventory(c.prize_id);
      if (!inv) return c; // no inventory control for infinite
      if (inv.total < 0 || inv.used < inv.total) return c;
    }
  }
  return null;
}

function creditReward(uid: number, prize_id: string, tier: string, face_value: number) {
  const meta = db.prepare("SELECT type FROM prizes WHERE prize_id=?").get(prize_id) as {type:string}|undefined;
  if (!meta) return;
  const t = meta.type;
  if (t === "coin") {
    db.prepare("UPDATE wallets SET coins=coins+? WHERE uid=?").run(1, uid);
    db.prepare("INSERT INTO wallet_tx (uid, type, amount, biz_id) VALUES (?,?,?,?)").run(uid, "reward", 1, `coin_plus_1`);
  } else if (t === "points") {
    db.prepare("UPDATE wallets SET points=points+? WHERE uid=?").run(face_value, uid);
  } else if (t === "voucher") {
    const code = Math.random().toString(36).slice(2, 10).toUpperCase();
    db.prepare("INSERT INTO vouchers (code, uid, face, status) VALUES (?,?,?, 'ACTIVE')").run(code, uid, face_value);
  }
  // physical|cosmetic: just recorded in draw_results for now (manual fulfillment/UI badge later)
}

export function drawOnce(uid: number, client_salt: string) {
  const table = loadProbabilityTable();
  const offers = loadOffers();
  const { server_seed, server_seed_hash } = (getActiveServerSeed() as any);

  // Pity logic: if miss_counter >= threshold, guarantee ≥ C
  const pity = db.prepare("SELECT miss_counter FROM pity_state WHERE uid=?").get(uid) as {miss_counter:number};
  const pityThreshold = table.policies.pity?.threshold_to_C ?? 20;
  const needPity = table.policies.pity?.enable && pity && (pity.miss_counter >= pityThreshold);

  const weights = table.items;
  let rand_hex = hmacRandHex(server_seed, client_salt);
  let unit = hexToUnitFloat(rand_hex);

  let pool = weights;
  if (needPity) {
    const minTierIdx = tierRank["C"];
    pool = weights.filter(w => tierRank[w.tier] <= minTierIdx); // S/A/B/C only
    if (pool.length === 0) pool = weights;
  }

  // pick candidate
  let candidate = pickWeighted(pool, unit);

  // inventory check
  const inv = getInventory(candidate.prize_id);
  if (inv && inv.total >= 0 && inv.used >= inv.total) {
    // OOS policy: DOWNGRADE
    if (table.policies.out_of_stock === "DOWNGRADE_TO_NEXT_TIER") {
      const lower = nextLowerAvailable(candidate);
      if (lower) candidate = lower;
    }
    // (Other policies omitted for brevity)
  }

  // happy hour: upgrade E→C with prob
  let policyTags: string[] = [];
  const isHH = nowInHappyHour(offers);
  if (isHH && table.policies.happy_hour?.enable && candidate.prize_id === "points_10") {
    const p = table.policies.happy_hour.upgrade_E_to_C_prob || 0;
    const u2 = hexToUnitFloat(rand_hex.slice(13) + rand_hex.slice(0, 13)); // derive second float
    if (u2 < p) {
      // try upgrade to voucher_200 if available
      const invC = getInventory("voucher_200");
      if (!invC || (invC.total < 0 || invC.used < invC.total)) {
        candidate = { prize_id: "voucher_200", tier: "C", weight: 0, inventory: -1 };
        policyTags.push("HAPPY_HOUR_E2C");
      } else {
        policyTags.push("HAPPY_HOUR_NO_STOCK");
      }
    }
  }

  // finalize: dec inventory if applicable
  const ok = decInventory(candidate.prize_id);
  if (!ok) {
    // if cannot dec due to stock policy, convert to points
    candidate = { prize_id: "points_10", tier: "E", weight: 0, inventory: -1 };
    policyTags.push("OOS_FALLBACK_POINTS");
  }

  const prizeMeta = db.prepare("SELECT type, face_value FROM prizes WHERE prize_id=?").get(candidate.prize_id) as {type:string, face_value:number};
  const face = prizeMeta?.face_value ?? 0;

  // credit reward
  creditReward(uid, candidate.prize_id, candidate.tier, face);

  // update pity
  const hitIsHigh = ["S","A","B","C"].includes(candidate.tier);
  if (hitIsHigh) {
    db.prepare("UPDATE pity_state SET miss_counter=0, last_hit_tier=? WHERE uid=?").run(candidate.tier, uid);
  } else {
    db.prepare("UPDATE pity_state SET miss_counter=miss_counter+1, last_hit_tier=? WHERE uid=?").run(candidate.tier, uid);
  }

  return {
    prize_id: candidate.prize_id,
    tier: candidate.tier,
    face_value: face,
    server_seed_hash,
    client_salt,
    rand_hex,
    policy_tags: policyTags
  };
}
