# 🔧 部署故障排查

## ❌ Vercel 部署失败的原因

**错误信息可能包含**：
- `Error: Cannot find module 'better-sqlite3'`
- `Module build failed`
- `Native module compilation failed`

**原因**：
- Vercel 是**无服务器**环境，不支持原生 Node.js 模块（如 better-sqlite3）
- SQLite 需要文件系统持久化，但 Vercel 的文件系统是临时的

---

## ✅ 推荐解决方案

### 🎯 方案一：使用 Railway（最简单，强烈推荐）

Railway 完全支持这个项目，无需修改任何代码！

#### 步骤：

1. **访问 Railway**
   - 打开：https://railway.app
   - 点击 "Login" 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 找到并选择 **"taikula"** 仓库

3. **等待自动部署**
   - Railway 会自动检测 Node.js 项目
   - 自动安装依赖
   - 自动构建和启动
   - 大约 3-5 分钟完成

4. **获取访问链接**
   - 部署完成后，点击项目
   - 点击 "Settings" → "Domains"
   - 点击 "Generate Domain" 生成公开链接
   - 例如：`https://taikula-production.up.railway.app`

5. **访问应用**
   - 用户端：`https://your-app.railway.app/`
   - 管理员后台：`https://your-app.railway.app/admin`
   - 账号：`admin` / `admin123`

**优点**：
- ✅ 完全免费（每月 $5 额度，约 500 小时运行时间）
- ✅ 支持 SQLite 数据持久化
- ✅ 无需修改任何代码
- ✅ 自动 HTTPS
- ✅ 每次 git push 自动重新部署

---

### 🎯 方案二：使用 Render

Render 也完全支持，步骤类似：

1. **访问 Render**
   - 打开：https://render.com
   - 使用 GitHub 账号登录

2. **创建 Web Service**
   - 点击 "New +" → "Web Service"
   - 选择 **"taikula"** 仓库

3. **配置**（重要！）
   ```
   Name: taikula
   Environment: Node
   Build Command: npm install && npm run build && npm run seed
   Start Command: npm start
   ```

4. **创建服务**
   - 点击 "Create Web Service"
   - 等待部署完成（5-10 分钟）

5. **获取链接**
   - 例如：`https://taikula.onrender.com`

**优点**：
- ✅ 免费套餐可用
- ✅ 数据持久化
- ✅ 稳定可靠

**注意**：免费套餐会在 15 分钟无活动后休眠，首次访问需要等待 30 秒唤醒。

---

## 🔄 如果坚持使用 Vercel

需要进行大量修改：

### 需要做的改动：
1. 移除 better-sqlite3
2. 使用 Vercel KV（Redis）或 Vercel Postgres
3. 重写所有数据库查询代码
4. 修改数据结构

**预计工作量**：2-3 小时重构代码

**不推荐**，因为：
- ❌ 需要大量代码修改
- ❌ 改变了项目架构
- ❌ 免费额度有限制
- ❌ 数据仍可能丢失

---

## 📊 平台对比

| 特性 | Railway | Render | Vercel |
|------|---------|--------|--------|
| **支持 SQLite** | ✅ 完美 | ✅ 完美 | ❌ 不支持 |
| **需要修改代码** | ❌ 不需要 | ❌ 不需要 | ✅ 需要大改 |
| **部署难度** | ⭐ 简单 | ⭐⭐ 中等 | ⭐⭐⭐⭐ 困难 |
| **数据持久化** | ✅ | ✅ | ❌ |
| **免费额度** | $5/月 | 有限 | 无限 |
| **启动速度** | 快 | 慢（休眠） | 很快 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

---

## 🚀 立即行动

### 我的推荐（按优先级）：

1. **首选：Railway** 🥇
   - 最简单
   - 完全兼容
   - 数据不会丢失
   - 👉 https://railway.app

2. **备选：Render** 🥈
   - 也很简单
   - 免费但有休眠
   - 👉 https://render.com

3. **不推荐：Vercel** 
   - 需要大量改造
   - 不适合这个项目

---

## 💡 Railway 部署常见问题

### Q: 部署失败怎么办？
A: 查看 "Deployments" 标签中的日志，常见问题：
- 确保 Node.js 版本 >= 18
- 检查环境变量是否正确

### Q: 如何查看日志？
A: 点击项目 → "Deployments" → 选择最新部署 → "View Logs"

### Q: 数据会丢失吗？
A: 不会！Railway 提供持久化存储，数据保存在 `/data` 目录

### Q: 免费额度够用吗？
A: 每月 $5 额度 = 约 500 小时，个人项目完全够用

### Q: 如何绑定自定义域名？
A: Settings → Domains → Add Custom Domain

---

## 📞 还需要帮助？

如果 Railway 部署仍然失败：
1. 截图错误信息
2. 分享部署日志
3. 告诉我具体的错误提示

我会帮您详细排查！🔍

