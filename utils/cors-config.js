export const allowedOrigins = [
    'https://taipei-date.vercel.app',
    'http://localhost:3000',
    'http://localhost:3002',
];

/**
 * 檢查來源是否被允許
 * @param {string} origin 
 * @returns {boolean}
 */
export const isOriginAllowed = (origin) => {
    return !origin || allowedOrigins.includes(origin) || origin.includes('localhost');
};
