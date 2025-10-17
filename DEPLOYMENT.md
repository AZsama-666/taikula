# 🚀 部署指南

本项目支持多种部署方式，选择最适合您的平台。

## 方案一：Vercel 部署（推荐）⭐

### 特点
- ✅ 完全免费
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 自动部署（每次push自动更新）
- ✅ 零配置，最简单

### 部署步骤

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 `taikula` 仓库
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: 选择 "Other"
   - Root Directory: 保持默认（留空）
   - Build Command: `npm run build && npm run seed`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **环境变量**（可选）
   ```
   COIN_PRICE=300
   SERVER_SEED=auto
   ```

5. **点击 Deploy**
   - 等待几分钟，部署完成
   - 获得类似 `https://taikula.vercel.app` 的网址

6. **访问应用**
   - 用户端：`https://your-app.vercel.app`
   - 管理后台：`https://your-app.vercel.app/admin`

---

## 方案二：Railway 部署

### 特点
- ✅ 支持持久化数据库
- ✅ 适合生产环境
- ✅ 免费额度（每月500小时）

### 部署步骤

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用GitHub账号登录

2. **新建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `taikula` 仓库

3. **配置**
   - Railway会自动检测Node.js项目
   - 添加环境变量：
     ```
     PORT=3000
     COIN_PRICE=300
     SERVER_SEED=auto
     ```

4. **部署**
   - 自动构建和部署
   - 获得公开URL

---

## 方案三：Render 部署

### 特点
- ✅ 免费套餐
- ✅ 自动SSL证书
- ✅ 持久化存储

### 部署步骤

1. **访问 Render**
   - 打开 https://render.com
   - 使用GitHub账号登录

2. **新建 Web Service**
   - 点击 "New +" → "Web Service"
   - 连接GitHub仓库 `taikula`

3. **配置**
   ```
   Name: taikula
   Environment: Node
   Build Command: npm install && npm run build && npm run seed
   Start Command: npm start
   ```

4. **添加环境变量**
   ```
   COIN_PRICE=300
   SERVER_SEED=auto
   ```

5. **创建服务**
   - 点击 "Create Web Service"
   - 等待部署完成

---

## 方案四：本地运行

### 开发环境

```bash
cd lucky-draw-template
npm install
npm run seed
npm run dev
```

访问：http://localhost:3000

### 生产环境

```bash
npm run build
npm start
```

---

## GitHub Pages（静态展示）

⚠️ **注意**：GitHub Pages只能托管静态网站，不支持Node.js后端。

如果只需要展示界面（无实际功能），可以：

1. **启用GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source: 选择 `main` 分支
   - Folder: 选择 `/public`
   - 点击 Save

2. **访问**
   - 网址：`https://azsama-666.github.io/taikula/`
   - ⚠️ 功能受限（无后端API）

---

## 推荐配置对比

| 平台 | 免费额度 | 数据库持久化 | 自动部署 | 难度 | 推荐度 |
|------|---------|-------------|---------|------|--------|
| **Vercel** | ✅ 无限 | ⚠️ 临时 | ✅ | ⭐ 最简单 | ⭐⭐⭐⭐⭐ |
| **Railway** | ✅ 500h/月 | ✅ | ✅ | ⭐⭐ 简单 | ⭐⭐⭐⭐ |
| **Render** | ✅ 有限 | ✅ | ✅ | ⭐⭐ 简单 | ⭐⭐⭐⭐ |
| **GitHub Pages** | ✅ 无限 | ❌ | ✅ | ⭐ 最简单 | ⭐⭐ |

---

## 部署后的访问地址

部署完成后，您将获得：

- **用户端游戏界面**：`https://your-domain.com/`
- **管理员后台**：`https://your-domain.com/admin`
- **API接口**：`https://your-domain.com/v1/*`

### 默认管理员账号
- 用户名：`admin`
- 密码：`admin123`

⚠️ **安全提醒**：部署后请立即修改默认密码！

---

## 故障排除

### 问题1：部署失败
- 检查 Node.js 版本是否 >= 18
- 查看构建日志找到错误信息
- 确保所有依赖都在 `package.json` 中

### 问题2：数据库错误
- Vercel 不支持 SQLite 持久化，数据会在重启后丢失
- 建议使用 Railway 或 Render 获得持久化存储

### 问题3：API 404错误
- 检查环境变量是否正确配置
- 确认路由配置正确（vercel.json）

---

## 性能优化建议

1. **启用CDN**：大多数平台自带
2. **压缩资源**：自动开启
3. **环境变量**：设置 `NODE_ENV=production`
4. **监控**：使用平台提供的日志和监控功能

---

## 下一步

选择一个平台，按照步骤部署，几分钟内即可上线！

推荐从 **Vercel** 开始，最简单快速。🚀


