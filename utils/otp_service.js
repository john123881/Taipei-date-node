// 資料庫查詢處理函式
// import { generateToken } from '#configs/otp.js'
import { generateToken } from './otp.js';
import db from './mysql2-connect.js';

// 判斷token是否到期, true代表到期
// const hasExpired = (expTimestamp) => {
//   return Date.now() > expTimestamp
// }

// 判斷是否可以重設token, true代表可以重設
const shouldReset = (expTimestamp, exp, limit = 60) => {
    const createdTimestamp = expTimestamp - exp * 60 * 1000;
    return Date.now() - createdTimestamp > limit * 1000;
};

// exp = 是 30 分到期,  limit = 60 是 60秒內不產生新的token
const createOtpForRegister = async (email, exp = 30, limit = 60) => {
    // 檢查otp是否已經存在
    const sqlCheckOTP = 'SELECT * FROM otp WHERE email = ? ';
    const [rows1] = await db.query(sqlCheckOTP, [email]);
    // console.log('檢查otp時的rows1:', rows1[0]);
    // console.log('檢查otp時的exp:', exp);
    // console.log('檢查otp時的limit:', limit);
    // console.log('檢查otp時的exp_timestamp:', rows1[0].exp_timestamp);
    // console.log(
    //     '檢查otp時的shouldReset結果:',
    //     shouldReset(rows1[0].exp_timestamp, exp, limit)
    // );

    // 找到記錄，因為在60s(秒)內限制，所以"不能"產生新的otp token
    if (
        rows1.length !== 0 &&
        !shouldReset(rows1[0].exp_timestamp, exp, limit)
    ) {
        console.log('ERROR - 60s(秒)內要求重新產生otp');
        return {};
    }

    // 找到記錄，超過60s(秒)內限制，所以可以產生新的otp token
    if (rows1.length !== 0 && shouldReset(rows1[0].exp_timestamp, exp, limit)) {
        // 以使用者輸入的Email作為secret產生otp token
        const token = generateToken(email);

        // 到期時間 預設 exp = 30 分鐘到期
        const exp_timestamp = Date.now() + exp * 60 * 1000;

        // 修改Otp
        const sqlEditOTP = `UPDATE otp 
        SET token = '${token}' , exp_timestamp = '${exp_timestamp}' 
        WHERE email = ? `;
        const [rows2] = await db.query(sqlEditOTP, [email]);
        // console.log(
        //     '找到記錄，超過60s(秒)內限制，所以可以產生新的otp,SQL2:',
        //     sqlEditOTP
        // );
        // console.log(
        //     '找到記錄，超過60s(秒)內限制，所以可以產生新的otp,rows2:',
        //     rows2
        // );

        return {
            ...rows1[0],
            exp_timestamp,
            token,
        };
    }

    // 以下為"沒找到otp記錄"
    // 以使用者輸入的Email作為secret產生otp token
    const token = generateToken(email);

    // 到期時間 預設 exp = 30 分鐘到期
    const exp_timestamp = Date.now() + exp * 60 * 1000;

    const insertOTPQuery =
        'INSERT INTO otp (email, token, exp_timestamp) VALUES (?, ?, ?)';
    const [rows3] = await db.query(insertOTPQuery, [
        email,
        token,
        exp_timestamp,
    ]);
    // console.log('沒找到otp記錄,SQL3:', insertOTPQuery);
    // console.log('沒找到otp記錄,email:', email);
    // console.log('沒找到otp記錄,token:', token);
    // console.log('沒找到otp記錄,exp_timestamp:', exp_timestamp);
    // console.log('沒找到otp記錄,rows3:', rows3);
    // console.log('沒找到otp記錄,rows3[0]:', rows3[0]);

    return { email, token, exp_timestamp };
};

const createOtpForPassword = async (email, userId, exp = 30, limit = 60) => {
    // 檢查otp是否已經存在
    const sqlCheckOTP = 'SELECT * FROM otp WHERE email = ? ';
    const [rows1] = await db.query(sqlCheckOTP, [email]);
    // console.log('檢查otp時的rows1:', rows1);
    // console.log('檢查otp時的exp_timestamp:', rows1[0].exp_timestamp);
    // console.log(
    //     '檢查otp時的shouldReset結果:',
    //     shouldReset(rows1[0].exp_timestamp, exp, limit)
    // );

    // 找到記錄，因為在60s(秒)內限制，所以"不能"產生新的otp token
    if (
        rows1.length !== 0 &&
        !shouldReset(rows1[0].exp_timestamp, exp, limit)
    ) {
        // console.log('ERROR - 60s(秒)內要求重新產生otp');
        return {};
    }

    // 找到記錄，超過60s(秒)內限制，所以可以產生新的otp token
    if (rows1.length !== 0 && shouldReset(rows1[0].exp_timestamp, exp, limit)) {
        // 以使用者輸入的Email作為secret產生otp token
        const token = generateToken(email);

        // 到期時間 預設 exp = 30 分鐘到期
        const exp_timestamp = Date.now() + exp * 60 * 1000;

        // 修改Otp
        const sqlEditOTP = `UPDATE otp 
        SET user_id = '${userId}', token = '${token}' , exp_timestamp = '${exp_timestamp}' 
        WHERE email = ? `;
        const [rows2] = await db.query(sqlEditOTP, [email]);
        // console.log(
        //     '找到記錄，超過60s(秒)內限制，所以可以產生新的otp,SQL2:',
        //     sqlEditOTP
        // );
        // console.log(
        //     '找到記錄，超過60s(秒)內限制，所以可以產生新的otp,rows2:',
        //     rows2
        // );

        return {
            ...rows1[0],
            userId,
            exp_timestamp,
            token,
        };
    }

    // 以下為"沒找到otp記錄"
    // 以使用者輸入的Email作為secret產生otp token
    const token = generateToken(email);

    // 到期時間 預設 exp = 30 分鐘到期
    const exp_timestamp = Date.now() + exp * 60 * 1000;

    const insertOTPQuery =
        'INSERT INTO otp (user_id, email, token, exp_timestamp) VALUES (?, ?, ?, ?)';
    const [rows3] = await db.query(insertOTPQuery, [
        userId,
        email,
        token,
        exp_timestamp,
    ]);
    // console.log('沒找到otp記錄,SQL3:', insertOTPQuery);
    // console.log('沒找到otp記錄,userId:', userId);
    // console.log('沒找到otp記錄,email:', email);
    // console.log('沒找到otp記錄,token:', token);
    // console.log('沒找到otp記錄,exp_timestamp:', exp_timestamp);
    // console.log('沒找到otp記錄,rows3:', rows3);

    return { userId, email, token, exp_timestamp };
};

export { createOtpForRegister, createOtpForPassword };
