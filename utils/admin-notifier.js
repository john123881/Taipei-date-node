import transporter from './email.js';
import logger from './logger.js';
import prisma from './prisma-client.js';

/**
 * 發送管理員通知郵件
 * @param {('REGISTER'|'LOGIN'|'GOOGLE_LOGIN')} type 通知類型
 * @param {Object} data 相關數據 (email, username, ip, timestamp, etc.)
 */
export const notifyAdmin = async (type, data) => {
    // 獲取所有具備管理員權限 (admin_permission = 1) 的電子郵件
    let adminEmails = [process.env.SMTP_TO_EMAIL]; // 預設保留一個保底郵件
    try {
        const admins = await prisma.admin_user.findMany({
            where: { admin_permission: 1 },
            select: { admin_email: true, admin_config: true }
        });
        
        if (admins.length > 0) {
            adminEmails = admins
                .filter(a => {
                    // 解析 JSON 配置，確保 user_alert 為 true 才寄信
                    const config = a.admin_config || {};
                    return config.user_alert === true;
                })
                .map(a => a.admin_email.trim());
        }
    } catch (err) {
        logger.error(`Database query for admins failed: ${err.message}`);
    }
    
    const recipientList = adminEmails.join(', ');
    
    let subject = '';
    let html = '';
    const now = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

    switch (type) {
        case 'REGISTER':
            subject = `[Taipei Date] 🔔 新使用者註冊通知`;
            html = `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4CAF50;">🎉 新成員加入！</h2>
                    <p><strong>使用者名稱：</strong> ${data.username || '未提供'}</p>
                    <p><strong>電子郵件：</strong> ${data.email}</p>
                    <p><strong>註冊時間：</strong> ${now}</p>
                    <hr style="border: none; border-top: 1px solid #eee;" />
                    <p style="color: #888; font-size: 12px;">此郵件由系統自動發送。</p>
                </div>
            `;
            break;
        case 'LOGIN':
        case 'GOOGLE_LOGIN':
            const isGoogle = type === 'GOOGLE_LOGIN';
            subject = `[Taipei Date] 🔑 使用者登入通知 (${isGoogle ? 'Google' : '一般'})`;
            html = `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2196F3;">👣 有人登入了</h2>
                    <p><strong>電子郵件：</strong> ${data.email}</p>
                    <p><strong>登入方式：</strong> ${isGoogle ? 'Google Login' : 'Password Login'}</p>
                    <p><strong>登入時間：</strong> ${now}</p>
                    <p><strong>來源 IP：</strong> ${data.ip || '未知'}</p>
                    <hr style="border: none; border-top: 1px solid #eee;" />
                    <p style="color: #888; font-size: 12px;">此郵件由系統自動發送。</p>
                </div>
            `;
            break;
        default:
            subject = `[Taipei Date] ⚠️ 系統通知`;
            html = `<p>收到一項類型為 ${type} 的通知。</p>`;
    }

    const mailOptions = {
        from: `"Taipei Date 系統管理"<${process.env.SMTP_TO_EMAIL}>`,
        to: recipientList,
        subject: subject,
        html: html,
    };

    // 使用非阻塞方式發送，不讓管理員通知影響使用者回應速度
    transporter.sendMail(mailOptions).then(() => {
        logger.info(`Admin notification sent: ${type} for ${data.email}`);
    }).catch(err => {
        logger.error(`Failed to send admin notification: ${err.message}`);
    });
};
