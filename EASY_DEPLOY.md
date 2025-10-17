# 🚀 超简单部署指南（5分钟完成）

> **适合不懂代码的朋友**  
> 只需要跟着步骤点击，就能让游戏上线！

---

## 📱 方案一：Railway 部署（推荐）

### 第 1 步：访问 Railway

点击这个链接：👉 **https://railway.app**

### 第 2 步：登录

1. 点击右上角 **"Login"** 按钮
2. 点击 **"Login with GitHub"**（用GitHub登录）
3. 在弹出窗口点击 **"Authorize Railway"**（授权）
4. 完成！您已经登录了

### 第 3 步：创建新项目

1. 点击 **"New Project"** 按钮（紫色的大按钮）
2. 在弹出菜单中选择 **"Deploy from GitHub repo"**
3. 在列表中找到 **"taikula"** 这个仓库
4. 点击它右边的 **"Deploy Now"** 按钮

### 第 4 步：等待部署

- 屏幕会显示部署进度
- 看到很多滚动的文字（这是在安装和构建）
- 大约等待 **3-5 分钟**
- 当看到 **"Success"** 或 **"Deployed"** 就成功了！

### 第 5 步：生成访问链接

1. 点击刚才创建的项目（紫色卡片）
2. 点击上方的 **"Settings"** 标签
3. 往下滚动找到 **"Domains"** 部分
4. 点击 **"Generate Domain"** 按钮
5. 会自动生成一个链接，像这样：
   ```
   https://taikula-production-xxxx.up.railway.app
   ```
6. **复制这个链接**（就是您的游戏地址！）

### 第 6 步：开始玩！

**游戏链接**：
```
https://your-app.railway.app/
```
复制链接，在浏览器打开，就能玩了！

**管理员后台**：
```
https://your-app.railway.app/admin
```
账号：`admin`  
密码：`admin123`

**分享页面**：
```
https://your-app.railway.app/share
```
可以生成二维码和复制链接

---

## 🎉 完成！

现在您可以：
- ✅ 自己玩游戏
- ✅ 分享给朋友
- ✅ 用管理员后台给别人充值
- ✅ 处理提现申请

---

## 📱 方案二：Render 部署（备选）

如果 Railway 不行，试试 Render：

### 第 1 步：访问 Render
👉 **https://render.com**

### 第 2 步：注册登录
1. 点击 **"Get Started"**
2. 选择 **"GitHub"** 登录
3. 授权 Render 访问

### 第 3 步：创建 Web Service
1. 点击 **"New +"** 按钮
2. 选择 **"Web Service"**
3. 点击 **"Connect account"** 连接 GitHub
4. 找到 **"taikula"** 仓库，点击 **"Connect"**

### 第 4 步：配置（重要！）
按照下面填写：

```
Name: taikula
Region: Singapore (新加坡，速度快)
Branch: main
Build Command: npm install && npm run build && npm run seed
Start Command: npm start
```

其他保持默认

### 第 5 步：创建服务
1. 点击页面底部 **"Create Web Service"** 按钮
2. 等待 **5-10 分钟**部署完成
3. 看到 **"Live"** 绿色标志就成功了！

### 第 6 步：获取链接
在页面顶部会显示您的链接：
```
https://taikula.onrender.com
```

---

## ❓ 常见问题

### Q1: Railway 说我需要信用卡？
**A**: Railway 免费版本足够用了，但需要验证信用卡（不会扣费）。如果不想绑卡，用 Render。

### Q2: 部署失败怎么办？
**A**: 
1. 检查 GitHub 仓库是否是最新的
2. 点击 "Deployments" 标签查看错误日志
3. 尝试重新部署：点击 "Redeploy"

### Q3: 访问链接打不开？
**A**: 
1. 确认部署状态是 "Success" 或 "Live"
2. 等待 1-2 分钟让服务启动
3. 刷新浏览器

### Q4: 如何修改管理员密码？
**A**: 部署成功后，联系我，我帮您修改数据库

### Q5: 数据会丢失吗？
**A**: 不会！Railway 和 Render 都会永久保存数据

### Q6: 免费的够用吗？
**A**: 
- Railway: 每月 $5 免费额度（约 500 小时）
- Render: 免费套餐够个人项目用

---

## 📞 需要帮助？

如果遇到问题：

1. **看部署日志**：
   - Railway: 点击项目 → Deployments → 最新部署 → View Logs
   - Render: 点击 Logs 标签

2. **重新部署**：
   - Railway: Deployments → 三个点 → Redeploy
   - Render: Manual Deploy → Deploy latest commit

3. **联系我**：
   - 截图错误信息
   - 告诉我在哪一步卡住了

---

## 🎁 部署成功后

### 分享给朋友
1. 访问：`https://your-app.railway.app/share`
2. 点击"复制游戏链接"
3. 发送给朋友

### 给用户充值
1. 访问：`https://your-app.railway.app/admin`
2. 登录（admin / admin123）
3. 点击"充值审核"
4. 点击"通过"按钮

### 查看数据
1. 打开管理员后台
2. 可以看到：
   - 总用户数
   - 待处理充值
   - 待处理提现
   - 流通金币

---

## 🌟 提示

- 部署一次就永久在线
- 每次推送代码到 GitHub 会自动更新
- 手机和电脑都能访问
- 可以添加自定义域名

---

**就这么简单！现在开始部署吧！** 🚀

