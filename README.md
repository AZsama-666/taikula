# 🎰 太酷啦抽奖 - 幸运抽奖小游戏

一个功能完整的抽奖系统，包含用户端游戏界面和管理员后台。

[![GitHub](https://img.shields.io/badge/GitHub-taikula-blue?logo=github)](https://github.com/AZsama-666/taikula)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🚀 一键部署（5分钟上线）

**不需要懂代码！** 只需要点几个按钮：

👉 **[查看超简单部署教程](EASY_DEPLOY.md)** 👈

### 快速部署到 Railway
1. 访问 https://railway.app
2. 用 GitHub 登录
3. 导入 `taikula` 仓库
4. 等待 5 分钟
5. 完成！🎉

## ⚠️ 重要：部署说明

**❌ 不支持 Vercel** - 由于使用 SQLite，无法在 Vercel 部署

**✅ 推荐平台**：
- **Railway**（强烈推荐）：https://railway.app
- **Render**（备选）：https://render.com

**📖 详细文档**：
- [🎯 超简单部署教程](EASY_DEPLOY.md) - **推荐先看这个！**
- [📚 完整部署指南](DEPLOYMENT.md)
- [🔧 故障排查](TROUBLESHOOTING.md)
- [📱 在线使用指南](ONLINE_USAGE.md)

---

## ✨ 功能特性

### 用户端
- 🎲 **抽奖系统** - 基于概率的公平抽奖机制
- 💰 **金币系统** - 充值、消费、提现一体化
- ⭐ **积分奖励** - 多重奖励机制
- 🎟️ **代金券** - 自动生成和管理代金券
- 📊 **历史记录** - 完整的抽奖和交易记录
- 🔐 **可验证公平性** - 使用服务器种子 + 客户端盐值生成随机数

### 管理员后台
- 📊 **仪表板** - 实时监控系统数据
- 👥 **用户管理** - 查看和管理所有用户
- 💳 **充值审核** - 审核通过/拒绝充值申请
- 💸 **提现管理** - 处理用户提现请求
- 📝 **操作记录** - 完整的管理操作日志

### 技术特性
- 🎯 **保底机制** - 20次未中高奖保底
- ⏰ **欢乐时光** - 特定时间段提升中奖率
- 🔄 **幂等性** - 防止重复提交
- 📦 **库存管理** - 奖品库存实时跟踪
- 🛡️ **安全性** - 完整的权限验证和数据保护

---

## 🚀 快速部署（推荐：Railway）

### 在线部署（3分钟上线）

1. **访问 Railway**
   - 打开：https://railway.app
   - 使用 GitHub 账号登录

2. **创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 **"taikula"** 仓库

3. **等待部署**
   - 自动检测配置
   - 自动构建和启动
   - 约 3-5 分钟完成

4. **生成域名**
   - Settings → Domains → Generate Domain
   - 获得类似 `https://taikula.up.railway.app` 的链接

5. **访问应用**
   - 用户端：`https://your-app.railway.app/`
   - 管理员后台：`https://your-app.railway.app/admin`
   - 默认账号：`admin` / `admin123`

**✅ 完成！** 您的抽奖游戏已上线！

---

## 💻 本地开发

### 安装依赖

```bash
cd lucky-draw-template
npm install
```

### 初始化数据库

```bash
npm run seed
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

### 访问界面

- **用户端游戏**: http://localhost:3000
- **管理员后台**: http://localhost:3000/admin

### 默认账户

**管理员账号**:
- 用户名: `admin`
- 密码: `admin123`

**测试用户**:
- UID: `1`
- 昵称: `DemoUser`

---

## 📁 项目结构

```
lucky-draw-template/
├── config/                      # 配置文件
│   ├── offers.default.json      # 活动配置（欢乐时光等）
│   └── probability_table.default.json  # 概率表配置
├── public/                      # 前端静态文件
│   ├── index.html              # 用户端游戏界面
│   └── admin.html              # 管理员后台界面
├── scripts/                     # 脚本文件
│   └── seed.ts                 # 数据库种子脚本
├── src/                        # 源代码
│   ├── db.ts                   # 数据库初始化
│   ├── server.ts               # Express 服务器
│   └── services/
│       ├── prizeEngine.ts      # 抽奖引擎核心逻辑
│       └── rng.ts              # 随机数生成器
├── data/                       # 数据目录（自动创建）
│   └── app.db                  # SQLite 数据库
├── package.json
├── tsconfig.json
├── DEPLOYMENT.md               # 详细部署指南
├── TROUBLESHOOTING.md          # 故障排查指南
└── README.md
```

---

## 🎮 使用说明

### 用户端操作

1. **充值金币**
   - 点击"充值"按钮
   - 输入充值金额（元）
   - 系统自动计算获得的金币数量
   - 等待管理员审核通过

2. **进行抽奖**
   - 确保有足够的金币（每次1金币）
   - 点击"抽奖一次"按钮
   - 等待抽奖结果显示
   - 奖励自动发放到账户

3. **申请提现**
   - 点击"提现"按钮
   - 输入提现金额
   - 填写收款账户信息
   - 等待管理员处理

### 管理员操作

1. **登录后台**
   - 访问 `/admin`
   - 使用管理员账号登录

2. **查看仪表板**
   - 总用户数
   - 待处理充值/提现数量
   - 流通金币总量

3. **处理充值申请**
   - 进入"充值审核"面板
   - 查看待处理的充值申请
   - 点击"通过"或"拒绝"
   - 可选填写备注信息

4. **处理提现申请**
   - 进入"提现管理"面板
   - 查看用户提交的提现请求
   - 确认账户信息后点击"通过"
   - 或点击"拒绝"并说明原因（金币会退回）

---

## 🎁 奖品配置

### 奖品等级

| 等级 | 奖品示例 | 概率权重 |
|------|----------|----------|
| S 级 | iPhone17 | 1 |
| A 级 | ¥1000代金券 | 500 |
| B 级 | ¥500代金券 | 1000 |
| C 级 | ¥200代金券 | 2000 |
| D 级 | 1金币 | 500 |
| E 级 | 10积分 | 3000 |
| F 级 | 装饰边框 | 4999 |

### 修改奖品

编辑 `config/probability_table.default.json`:

```json
{
  "items": [
    {
      "prize_id": "your_prize_id",
      "tier": "A",
      "weight": 500,
      "inventory": 100,
      "max_per_user": 1
    }
  ]
}
```

编辑 `scripts/seed.ts` 添加奖品数据，然后运行:

```bash
npm run seed
```

---

## ⚙️ 环境变量

创建 `.env` 文件配置：

```env
# 服务器端口
PORT=3000

# 数据库文件路径
SQLITE_FILE=./data/app.db

# 金币价格（分）
COIN_PRICE=300

# 服务器种子（auto 为自动生成）
SERVER_SEED=auto
```

---

## 🔧 API 接口

### 用户端 API

- `GET /v1/me` - 获取用户信息
- `GET /v1/wallet` - 获取钱包信息
- `POST /v1/recharge/create` - 创建充值
- `POST /v1/draw/start` - 开始抽奖
- `GET /v1/vouchers` - 获取代金券列表
- `POST /v1/withdrawal/create` - 申请提现
- `GET /v1/withdrawal/history` - 提现记录
- `GET /v1/recharge/history` - 充值记录

### 管理员 API

- `POST /v1/admin/login` - 管理员登录
- `GET /v1/admin/dashboard` - 仪表板数据
- `GET /v1/admin/users` - 用户列表
- `GET /v1/admin/recharges` - 充值申请列表
- `POST /v1/admin/recharge/approve` - 通过充值
- `POST /v1/admin/recharge/reject` - 拒绝充值
- `GET /v1/admin/withdrawals` - 提现申请列表
- `POST /v1/admin/withdrawal/approve` - 通过提现
- `POST /v1/admin/withdrawal/reject` - 拒绝提现

---

## 🎨 界面设计

### 字体
- 主字体: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
- 等宽字体: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)

### 配色方案

**用户端**:
- 主色调: 渐变紫色 (#667eea → #764ba2)
- 背景: 渐变背景
- 卡片: 白色半透明 + 毛玻璃效果

**管理员后台**:
- 主色调: 深灰蓝 (#2c3e50 → #34495e)
- 背景: 深色渐变
- 界面: 现代扁平化设计

---

## 📊 数据库表结构

### 核心表
- `users` - 用户表
- `wallets` - 钱包表
- `wallet_tx` - 钱包交易记录
- `draw_sessions` - 抽奖会话
- `draw_results` - 抽奖结果
- `prizes` - 奖品表
- `prize_inventory` - 奖品库存
- `vouchers` - 代金券表
- `pity_state` - 保底状态
- `server_seeds` - 服务器种子
- `idempotency_log` - 幂等性日志

### 管理员相关
- `admins` - 管理员表
- `recharge_requests` - 充值申请表
- `withdrawal_requests` - 提现申请表

---

## 🔐 安全性

1. **密码加密**: SHA-256 哈希
2. **幂等性保护**: 基于 Idempotency-Key
3. **事务保证**: SQLite 事务确保数据一致性
4. **权限验证**: 管理员接口需要 Token 验证
5. **可验证公平**: 服务器种子 + 客户端盐值

---

## 📝 开发说明

### 生产环境部署

推荐使用 Railway 或 Render，详见 [DEPLOYMENT.md](DEPLOYMENT.md)

### 安全建议

- 修改默认管理员密码
- 使用环境变量配置敏感信息
- 在生产环境启用 HTTPS
- 实施 JWT 或 Session 管理
- 添加请求频率限制
- 定期备份数据库

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📮 联系方式

- GitHub: https://github.com/AZsama-666/taikula
- 问题反馈: [Issues](https://github.com/AZsama-666/taikula/issues)

---

**祝您使用愉快！** 🎉
