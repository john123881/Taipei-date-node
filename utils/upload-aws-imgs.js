import multer from 'multer';
import path from 'path';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';

const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    AWS_BUCKET_NAME,
} = process.env;

// 配置 AWS
aws.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
});

const s3 = new aws.S3();

//檔名設定
const exts = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

//要的檔名過濾
// const fileFilter = (req, file, callback) => {
//     exts[file.mimetype];
//     callback(null, true);
// }
const fileFilter = (req, file, callback) => {
    callback(null, !!exts[file.mimetype]);
};

//Storage 1.存取位置 2.加上檔名
// const storage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         callback(null, 'tmp/avatar/');
//     },
//     filename: (req, file, callback) => {
//         // 經授權後，req.user帶有會員的id
//         // const newFilename = req.userId
//         callback(null, Date.now() + path.extname(file.originalname));
//     },
// });

//Multer 建立 upload
// const upload = multer({ fileFilter, storage });

const upload = multer({
    fileFilter,
    storage: multerS3({
        s3: s3,
        bucket: AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, callback) {
            callback(null, Date.now() + path.extname(file.originalname));
        },
    }),
});

//export
export default upload;
