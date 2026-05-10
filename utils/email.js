import { Resend } from 'resend';
import logger from './logger.js';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 為了相容原本 nodemailer 的格式，我們封裝一個 transporter 物件
 */
const transporter = {
    /**
     * 發送郵件 (相容原本的參數格式)
     * @param {Object} options 
     * @param {string} options.to 收件人
     * @param {string} options.subject 主旨
     * @param {string} options.html HTML 內容
     */
    sendMail: async ({ to, subject, html }, callback) => {
        try {
            // 處理多個收件人 (原本用逗號分隔的字串)
            const recipients = typeof to === 'string' ? to.split(',').map(s => s.trim()) : to;

            const { data, error } = await resend.emails.send({
                from: 'Taipei Date <onboarding@resend.dev>',
                to: recipients,
                subject: subject,
                html: html,
            });

            if (error) {
                throw new Error(error.message);
            }

            if (callback) callback(null, data);
            return data;
        } catch (err) {
            logger.error(`Resend sendMail failed: ${err.message}`);
            if (callback) callback(err, null);
            throw err;
        }
    },

    /**
     * 相容原本的 verify 方法
     */
    verify: (callback) => {
        if (!process.env.RESEND_API_KEY) {
            const err = new Error('RESEND_API_KEY is missing');
            logger.error('Resend verification failed', err);
            if (callback) callback(err, null);
            return;
        }
        logger.info('Resend API configuration verified');
        if (callback) callback(null, true);
    }
};

// 執行初始驗證
transporter.verify();

export default transporter;
