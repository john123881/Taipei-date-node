# Taipei Date Node - 專案概覽

> 此文件供 AI 助手快速了解專案結構與架構。

## 基本資訊

- **專案名稱**：Taipei Date（約會平台後端）
- **框架**：Express.js (v4.19)
- **模組系統**：ES Modules (`"type": "module"`)
- **資料庫**：MySQL（透過 `mysql2/promise`）
- **認證**：JWT (`jsonwebtoken`)
- **入口檔案**：`index.js`
- **預設 Port**：`3002`
- **啟動指令**：`npm run dev`（使用 nodemon + `dev.env`）

## 環境變數

- `.env` / `dev.env`（已加入 `.gitignore`）
- 主要變數：`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `SMTP_TO_EMAIL`, `SMTP_TO_PASSWORD`, `OTP_SECRET`, AWS 相關, JAWSDB 相關

## 目錄結構

```
Taipei-date-node/
├── index.js                # 主入口（Express app, 登入/註冊/Google登入路由）
├── index-socket.js         # Socket.IO 伺服器
├── noti-socket.js          # 通知用 Socket.IO
├── package.json
├── .env / dev.env          # 環境變數（gitignored）
├── Procfile                # Heroku 部署用
├── vercel.json             # Vercel 部署設定
│
├── middlewares/
│   └── authenticate.js     # JWT 認證中介軟體
│
├── utils/
│   ├── mysql2-connect.js   # MySQL 連線池（讀取 DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME）
│   ├── email.js            # Nodemailer SMTP 設定
│   ├── otp.js              # OTP 工具
│   ├── otp_service.js      # OTP 服務（註冊/忘記密碼）
│   ├── upload-aws-imgs.js  # AWS S3 圖片上傳（multer-s3）
│   ├── upload-imgs.js      # 本地圖片上傳（multer）
│   └── upload-cover.js     # 封面圖上傳
│
├── routes/
│   ├── index.js            # 彙整所有模組 router
│   ├── apiConfig.js        # 集中管理 API 路由路徑
│   ├── account/            # 會員帳號相關（13 個路由檔案）
│   │   ├── index.js
│   │   ├── profile.js          # GET /:sid
│   │   ├── edit-profile.js     # GET|PUT /edit/:sid
│   │   ├── upload-avatar.js    # POST /try-upload/:sid
│   │   ├── change-password.js  # PUT /change-password/:sid
│   │   ├── game-record.js      # POST /game-record-upload/:sid
│   │   ├── record-point.js     # GET /record-point/:sid
│   │   ├── record-game.js      # GET /record-game/:sid
│   │   ├── collect-post.js     # GET|DELETE 收藏貼文
│   │   ├── collect-bar.js      # GET|DELETE 收藏酒吧
│   │   ├── collect-movie.js    # GET|DELETE 收藏電影
│   │   ├── collect-list.js     # GET /collect-list/:sid（Navbar 收藏）
│   │   └── add-data.js         # POST /add-data（新增假資料）
│   ├── bar/                # 酒吧相關路由
│   ├── booking/            # 訂票相關路由
│   ├── community/          # 社群相關路由
│   ├── date/               # 約會配對相關路由
│   └── trip/               # 行程規劃相關路由
│
├── services/
│   ├── index.js            # 彙整所有模組 service
│   ├── bar/                # 酒吧資料存取（26 個 service 檔案）
│   ├── booking/            # 訂票資料存取（11 個 service 檔案）
│   ├── community/          # 社群資料存取（42 個 service 檔案）
│   └── trip/               # 行程資料存取（30 個 service 檔案）
│
├── views/                  # EJS 模板
├── public/                 # 靜態資源
└── cert/                   # SSL 憑證（key.pem, cert.pem）
```

## 架構模式

### 路由層（routes/）
- 每個功能模組有自己的目錄（如 `routes/bar/`）
- 目錄內每個檔案建立獨立的 `express.Router()`
- `index.js` 匯入所有 router 並匯出為物件
- 路由路徑統一定義在 `routes/apiConfig.js`

### 服務層（services/）
- 純資料存取函數，每個檔案一個 `export const` 函數
- `index.js` 使用 `export * from` barrel export
- 被路由層引用執行 DB 查詢

### 主入口（index.js）
- 設定 Express middleware（cors, session, body-parser）
- 登入/註冊/Google登入/忘記密碼 路由直接寫在此檔中
- 掛載各模組 router 到對應路徑（`/account`, `/bar`, `/community`, `/trip`, `/date`, `/booking`）

## 主要功能模組

| 模組 | 路徑前綴 | 說明 |
|------|----------|------|
| Account | `/account` | 會員資料、編輯、密碼、遊戲紀錄、積分、收藏 |
| Bar | `/bar` | 酒吧列表、詳情、評分、訂位、收藏、搜尋 |
| Booking | `/booking` | 電影列表、訂票 |
| Community | `/community` | 貼文、活動、追蹤、留言、通知 |
| Date | `/date` | 約會配對、好友列表、訊息 |
| Trip | `/trip` | 行程規劃、行程詳情、分享 |

## 技術棧

| 類別 | 技術 |
|------|------|
| 後端框架 | Express.js 4 |
| 資料庫 | MySQL + mysql2/promise |
| 認證 | JWT + bcryptjs |
| Session | express-session + express-mysql-session |
| 檔案上傳 | multer + multer-s3（AWS S3）|
| 信件 | nodemailer |
| OTP | otpauth |
| 即時通訊 | socket.io |
| 驗證 | zod |
| 模板引擎 | EJS |
| 部署 | Heroku (Procfile) / Vercel (vercel.json) |
