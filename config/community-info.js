/**
 * Taipei Date - 社群模組常數定義
 */

// 留言狀態 (Prisma: Int)
export const COMMENT_STATUS = {
    HIDDEN: 0,
    POSTED: 1,
    FLAGGED: 2,
    DELETED: 3
};

// 活動狀態 (Prisma: String)
export const EVENT_STATUS = {
    CLOSED: '0',
    OPEN: '1',
    CANCELED: '2'
};
