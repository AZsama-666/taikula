import { initDB, db } from './dist/src/db.js';

// 初始化数据库
console.log('正在初始化数据库...');
initDB();

// 添加种子数据
console.log('正在添加测试数据...');

const prizes = [
  { prize_id: "iphone17", type: "physical", face_value: 150000 },
  { prize_id: "voucher_1000", type: "voucher", face_value: 1000 },
  { prize_id: "voucher_500", type: "voucher", face_value: 500 },
  { prize_id: "voucher_200", type: "voucher", face_value: 200 },
  { prize_id: "coin_plus_1", type: "coin", face_value: 1 },
  { prize_id: "points_10", type: "points", face_value: 10 },
  { prize_id: "cosmetic_frame1", type: "cosmetic", face_value: 0 }
];

for (const p of prizes) {
  db.prepare("INSERT OR IGNORE INTO prizes (prize_id, type, face_value, meta) VALUES (?,?,?, NULL)").run(p.prize_id, p.type, p.face_value);
}

const inventory = [
  { prize_id: "iphone17", total: 1 },
  { prize_id: "voucher_1000", total: 50 },
  { prize_id: "voucher_500", total: 200 },
  { prize_id: "voucher_200", total: 1000 },
  { prize_id: "coin_plus_1", total: -1 },
  { prize_id: "points_10", total: -1 },
  { prize_id: "cosmetic_frame1", total: -1 }
];

for (const i of inventory) {
  db.prepare("INSERT OR IGNORE INTO prize_inventory (prize_id, total, used, per_user_limit) VALUES (?,?,0, NULL)").run(i.prize_id, i.total);
  db.prepare("UPDATE prize_inventory SET total=? WHERE prize_id=?").run(i.total, i.prize_id);
}

console.log('数据库初始化完成！');
console.log('正在启动服务器...');

// 启动服务器
import('./dist/src/server.js');

