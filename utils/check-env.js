import { envSchema } from '../schemas/env.js';
import logger from './logger.js';
import chalk from 'chalk';

/**
 * 檢查環境變數是否齊全
 */
export const checkEnv = () => {
    try {
        // 驗證 process.env
        envSchema.parse(process.env);
        logger.info(chalk.green('✅ 環境變數驗證通過'));
    } catch (error) {
        logger.error(chalk.red('❌ 環境變數驗證失敗，請檢查 .env / dev.env 檔案：'));
        
        // 格式化並列出所有錯誤
        error.errors.forEach((err) => {
            const field = err.path.join('.');
            logger.error(`   - ${chalk.yellow(field)}: ${err.message}`);
        });

        // 強制停止程序，防止在不穩定的情況下運行
        process.exit(1);
    }
};
