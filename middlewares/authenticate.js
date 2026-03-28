import jsonwebtoken from 'jsonwebtoken';

// 存取`.env`設定檔案使用
import 'dotenv/config.js';

// 獲得加密用字串
const accessTokenSecret = process.env.JWT_SECRET;

// 中介軟體middleware，用於檢查授權(authenticate)
export default function authenticate(req, res, next) {
    let token = req.cookies.token; // 優先從 Cookie 讀取
    
    // 如果 Cookie 沒資料，再從 Header 找 (向下相容)
    if (!token) {
        token = req.headers['authorization'];
    }

    if (!token) {
        return res.json({
            success: false,
            status: 'error',
            error: '無授權token，請進行登入',
            msg: '無授權token，請進行登入',
        });
    }

    if (token && token.indexOf('Bearer ') === 0) {
        token = token.slice(7); //去掉'Bearer '
    }

    try {
        req.my_jwt = jsonwebtoken.verify(token, accessTokenSecret);
    } catch (ex) {
        // ...
    }
    next();
}
