import chalk from 'chalk';
import dayjs from 'dayjs';

const levels = {
    ERROR: chalk.red.bold,
    WARN: chalk.yellow.bold,
    INFO: chalk.blue.bold,
    DEBUG: chalk.magenta.bold,
};

const formatMessage = (level, message) => {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
    return `${chalk.gray(`[${timestamp}]`)} ${levels[level](level.padEnd(5))} | ${message}`;
};

const logger = {
    info: (message) => console.log(formatMessage('INFO', message)),
    warn: (message) => console.warn(formatMessage('WARN', message)),
    error: (message, error) => {
        console.error(formatMessage('ERROR', message));
        if (error) console.error(error);
    },
    debug: (message) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(formatMessage('DEBUG', message));
        }
    },
};

export default logger;
