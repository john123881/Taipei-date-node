import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import chalk from 'chalk';
// 指定要加載的 dotenv 檔案名稱
dotenv.config({ path: 'dev.env' });

const { SMTP_TO_EMAIL, SMTP_TO_PASSWORD } = process.env;

// console.log({ SMTP_TO_EMAIL, SMTP_TO_PASSWORD });

const transporter = nodemailer.createTransport({
    host: 'stmp.gmail.com',
    port: 465,
    secure: true, // use TLS
    service: 'Gmail',
    auth: {
        user: SMTP_TO_EMAIL,
        pass: SMTP_TO_PASSWORD,
    },
});

// 驗証連線設定
transporter.verify((error, success) => {
    if (error) {
        // 發生錯誤
        console.error(
            chalk.red.bgWhite.bold(
                'ERROR - 無法連線至SMTP伺服器 Unable to connect to the SMTP server.'
            )
        );
    } else {
        // 代表成功
        console.log(
            chalk.blue.bgWhite.bold(
                'INFO - SMTP伺服器已連線 SMTP server connected.'
            )
        );
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
