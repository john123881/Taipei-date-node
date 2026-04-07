/**
 * 生成現代化、美觀的 OTP 驗證信 HTML 模板
 * @param {string|number} otp - 驗證碼
 * @param {'register' | 'forget'} type - 郵件類型
 * @returns {string} HTML 字串
 */
export const getOtpEmailHtml = (otp, type = 'register') => {
    const title = type === 'register' ? '註冊要求的電子郵件驗證碼' : '重設密碼要求的電子郵件驗證碼';
    const subtitle = type === 'register' ? '你好，通知註冊所需要的驗證碼：' : '你好，通知重設密碼所需要的驗證碼：';
    const fieldName = type === 'register' ? '註冊頁面的 "ValidCode" 欄位' : '驗證碼欄位';

    const formattedOtp = otp.toString();

    return `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'PingFang TC', 'Heiti TC', 'Microsoft JhengHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background-color: #0a0a0a;
                color: #e0e0e0;
            }
            .wrapper {
                width: 100%;
                table-layout: fixed;
                background-color: #0a0a0a;
                padding: 40px 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #141414;
                border-radius: 24px;
                border: 1px solid #2a2a2a;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            }
            .header {
                padding: 40px 30px 20px;
                text-align: center;
            }
            .logo {
                font-size: 28px;
                font-weight: 800;
                color: #99FF00;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin: 0;
            }
            .logo span {
                color: #ffffff;
            }
            .content {
                padding: 20px 40px 40px;
                text-align: center;
            }
            .main-title {
                font-size: 20px;
                font-weight: 600;
                color: #ffffff;
                margin-bottom: 12px;
            }
            .subtitle {
                font-size: 15px;
                color: #a0a0a0;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .otp-container {
                background-color: #000000;
                border-radius: 16px;
                padding: 30px;
                margin: 30px 0;
                border: 1px dashed #99FF00;
            }
            .otp-code {
                font-size: 52px;
                font-weight: 900;
                color: #99FF00;
                letter-spacing: 8px;
                margin: 0;
                text-shadow: 0 0 20px rgba(153, 255, 0, 0.2);
            }
            .hint {
                font-size: 14px;
                color: #808080;
                margin-top: 30px;
                line-height: 1.6;
            }
            .footer {
                padding: 30px;
                background-color: #0d0d0d;
                text-align: center;
                border-top: 1px solid #222;
            }
            .footer-text {
                font-size: 12px;
                color: #555555;
                margin: 0;
            }
            .action-text {
                color: #99FF00;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <h1 class="logo">Taipei <span>Date</span></h1>
                </div>
                <div class="content">
                    <div class="main-title">驗證您的電子信箱</div>
                    <p class="subtitle">${subtitle}<br>請在 <span class="action-text">${fieldName}</span> 中輸入以下代碼：</p>
                    
                    <div class="otp-container">
                        <div class="otp-code">${formattedOtp}</div>
                    </div>
                    
                    <p class="hint">
                        請注意驗證碼將於寄送後 <span style="color: #fff;">30 分鐘</span> 後到期。<br>
                        如果您沒有要求此類操作，請忽略此郵件。
                    </p>
                </div>
                <div class="footer">
                    <p class="footer-text">&copy; 2026 Taipei Date 服務中心. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};
