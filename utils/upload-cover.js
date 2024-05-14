import multer from 'multer';
import path from 'path';

// 設定文件儲存
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/tripcover/');
    },
    filename: (req, file, callback) => {
        // 使用日期時間戳和原始文件擴展名生成新的文件名
        callback(null, Date.now() + path.extname(file.originalname));
    },
});

// 文件過濾器，只允許特定的圖片類型
//檔名設定
const exts = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

const fileFilter = (req, file, callback) => {
    callback(null, !!exts[file.mimetype]);
};

// 配置 multer
const coverUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

export default coverUpload;
