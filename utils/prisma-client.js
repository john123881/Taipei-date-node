import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    // 可以在這裡加入 log 設定，方便除錯
    // log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
