# 🍹 Taipei Date — 後端 API 服務

> 為 Taipei Date 社交平台提供動力的後端引擎。  
> 從身份驗證、雲端整合到防護機制，實踐工業級後端架構設計。

🔗 **API 服務**：[taipei-date-node.onrender.com](https://taipei-date-node.onrender.com)  
🔗 **前端專案**：[taipei-date.vercel.app](https://taipei-date.vercel.app)

---

## 🏗️ 系統架構

| 層級 | 技術 | 說明 |
| :--- | :--- | :--- |
| 後端框架 | Node.js + Express.js | RESTful API，部署於 Render |
| ORM | Prisma | 強型別資料庫存取與 Schema 管理 |
| 資料庫 | MySQL | 雲端託管於 Aiven |
| 雲端儲存 | AWS S3 | 使用者圖片上傳與儲存 |
| 身份驗證 | JWT + Cookie | 多端點身分驗證 |
| 信件服務 | Nodemailer + Gmail API | OTP 驗證信寄送 |
| 資料驗證 | Zod | 環境變數與請求資料驗證 |

---

## ⚙️ 核心架構設計

### 1. 服務層徹底解耦（Service Layer）
路由層嚴禁直接撰寫資料庫查詢，所有資料存取邏輯封裝於 `services/` 目錄：
- 透過 `services/index.js` Barrel Export 統一導出，引用路徑簡潔一致
- 邏輯可重複利用於多個路由，降低維護成本
- Prisma ORM 提供強型別支援，確保 Schema 與程式碼同步

### 2. 統一 API 回應格式（Standardized Response Handler）
全站統一使用 `utils/response-handler.js` 的 `sendSuccess` 與 `sendError`：
- 前端可穩定預期 `{ success: true, results: ... }` 結構
- 錯誤自動記錄完整 Stack Trace，對外回傳友善提示，不洩漏實作細節

### 3. 非同步防護牆（catchAsync）
所有路由 Handler 必須以 `catchAsync` 包裝：
- 自動捕捉未處理的 Promise 拒絕，防止伺服器因單一請求出錯而宕機
- 錯誤統一導向全域 `error-handler.js` 中介軟體集中處理

### 4. 互動防禦機制（Action Locking）
針對收藏、按讚、刪除等高頻非同步操作實施請求鎖定：
- 在操作完成前過濾重複請求，避免資料庫衝突
- 與前端 Optimistic UI 邏輯高度配合，確保狀態一致性

---

## 📡 API 端點（部分範例）

| 模組 | Method | Endpoint | 說明 |
| :--- | :--- | :--- | :--- |
| 認證 | POST | `/api/auth/login` | 登入，回傳 JWT |
| 認證 | POST | `/api/auth/register` | 註冊，觸發 OTP 驗證信 |
| 會員 | GET | `/api/account/profile` | 取得會員資料 |
| 會員 | PUT | `/api/account/profile` | 更新資料 / S3 圖片上傳 |
| 社群 | GET | `/api/community/posts` | 取得社群貼文列表 |
| 社群 | POST | `/api/community/like` | 按讚（含 Action Lock） |
| 收藏 | POST | `/api/fav/add` | 加入收藏 |
| 酒吧 | GET | `/api/bar` | 取得酒吧列表 |
| 電影 | GET | `/api/booking/movies` | 取得電影列表 |

---

## 📂 目錄結構

```text
Taipei-date-node/
├── index.js            # 主入口（中介軟體整合）
├── routes/             # 路由層（參數接收與回應調度）
│   ├── account/        # 會員系統
│   ├── bar/            # 酒吧模組
│   ├── booking/        # 電影與訂票
│   ├── community/      # 社群貼文與互動
│   └── index.js        # 路由總站
├── services/           # 服務層（商業邏輯與 Prisma 操作）
│   └── index.js        # Barrel Export
├── prisma/             # 資料庫 Schema 與 Client
├── middlewares/        # JWT 驗證與全域攔截器
├── schemas/            # Zod 資料驗證模型
├── utils/              # 工具庫（response-handler, email, db）
└── config/             # CORS、Session 設定
```

---

## ⚙️ 環境變數

建立 `.env` 檔案：

```env
DATABASE_URL="mysql://user:pass@host:port/db?ssl-mode=REQUIRED"
JWT_SECRET="your_secret_key"
AWS_ACCESS_KEY_ID="your_aws_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret"
AWS_S3_BUCKET="your_bucket_name"
GMAIL_USER="your_email@gmail.com"
GMAIL_APP_PASSWORD="your_app_password"
```

---

## 🚀 本地啟動

```bash
git clone https://github.com/john123881/Taipei-date-node.git
npm install
npx prisma generate
npm run dev
```

---

## 👤 作者

**John** · [a123881@gmail.com](mailto:a123881@gmail.com) · [@john123881](https://github.com/john123881)