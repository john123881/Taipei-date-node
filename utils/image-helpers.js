/**
 * 將圖片資料 (BLOB 或 URL) 轉換為可用的圖片來源字串
 * @param {Object} photo - 包含圖片資料的物件
 * @param {Object} options - 選項
 * @param {String} options.imgKey - Blob 資料的鍵值 (預設: 'img')
 * @param {String} options.urlKey - URL 資料的鍵值 (預設: 'img_url')
 * @returns {String|null} 圖片來源字串
 */
export const transformImgSource = (photo, { imgKey = 'img', urlKey = 'img_url' } = {}) => {
    if (!photo) return null;
    
    // 優先使用 URL
    if (photo[urlKey]) {
        return photo[urlKey];
    }
    
    const blob = photo[imgKey];
    if (blob) {
        try {
            const buffer = Buffer.isBuffer(blob) 
                ? blob 
                : Buffer.from(blob);
            return `data:image/jpeg;base64,${buffer.toString('base64')}`;
        } catch (error) {
            console.error('Image transformation error:', error);
            return null;
        }
    }
    
    return null;
};
