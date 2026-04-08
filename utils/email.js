import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from './logger.js';

// 指定要加載的 dotenv 檔案名稱
const { SMTP_TO_EMAIL, SMTP_TO_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Port 587 需設為 false (STARTTLS)
    service: 'Gmail',
    auth: {
        user: SMTP_TO_EMAIL,
        pass: SMTP_TO_PASSWORD,
    },
});

// 驗証連線設定
transporter.verify((error, success) => {
    if (error) {
        logger.error('SMTP server connection failed', error);
    } else {
        logger.info('SMTP server connected');
    }
});

// 測試發信
// transporter
//     .sendMail({
//         to: 'a123881@gmail.com',
//         subject: 'sbuject',
//         html: '<h1>hello2</h1>',
//     })
//     .then(() => {
//         console.log('email sent');
//     })
//     .catch((ex) => console.error(ex));
export default transporter;
