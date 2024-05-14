import multer from "multer";
import path from 'path'


//檔名設定
const exts = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
};

//要的檔名過濾
// const fileFilter = (req, file, callback) => {
//     exts[file.mimetype];
//     callback(null, true);
// }
const fileFilter = (req, file, callback) => {
    callback(null, !!exts[file.mimetype])
}

//Storage 1.存取位置 2.加上檔名
const storage = multer.diskStorage({
    destination: (req, file, callback)=>{
        callback(null, "public/avatar/")
    },
    filename: (req, file, callback)=>{
        // 經授權後，req.user帶有會員的id
        // const newFilename = req.userId
        callback(null, Date.now() + path.extname(file.originalname))
    }
})

//Multer 建立 upload
const upload = multer({fileFilter, storage})

//export
export default upload


