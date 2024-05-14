import jsonwebtoken from 'jsonwebtoken';

// 存取`.env`設定檔案使用
import 'dotenv/config.js';

// 獲得加密用字串
const accessTokenSecret = process.env.JWT_SECRET;

// 中介軟體middleware，用於檢查授權(authenticate)
export default function authenticate(req, res, next) {
    const token = req.headers['authorization'];
    // console.log('MW中req.body:', req.body);
    // 檢查是否存在 token
    if (!token) {
        return res.json({
            success: false,
            status: 'error',
            error: '無授權token，請進行登入',
            success: false,
            msg: '無授權token，請進行登入',
        });
    }
    // console.log('!token')

    // 存在 token，處理token，獲得token中的data(id, email, iat)
    if (token && token.indexOf('Bearer ') === 0) {
        const token2 = token.slice(7); //去掉'Bearer '
        // res.send(token)
        try {
            //res.locals.my_jwt 比較安全
            req.my_jwt = jsonwebtoken.verify(token2, process.env.JWT_SECRET);
            // console.log('my_jwt:', req.my_jwt);
        } catch (ex) {
            console.log({ ex });
        }
    }
    next();
}
