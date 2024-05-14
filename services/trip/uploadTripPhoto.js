import db from '../../utils/mysql2-connect.js';

//原來的程式碼

// export const uploadTripPhoto = async (req, res) => {
//     const { trip_plan_id } = req.params;
//     if (!req.file) {
//         return res.status(400).json({ message: '沒有文件上傳' });
//     }
//     const filePath = req.file.path; // 獲取文件存儲的相對路徑

//     try {
//         const [results] = await db.query(
//             'UPDATE `trip_plans` SET trip_pic = ? WHERE `trip_plan_id` = ?',
//             [filePath, trip_plan_id]
//         );
//         if (results.affectedRows > 0) {
//             res.json({ message: '行程封面成功更新。' });
//         } else {
//             res.status(404).json({ message: '未找到指定 ID 的行程計劃' });
//         }
//     } catch (error) {
//         console.error('更新數據庫數據時出錯：', error);
//         res.status(500).json({ message: '更新數據庫數據時出錯' });
//     }
// };

//改寫後讓windows上傳的圖片也可以正確讀取

export const uploadTripPhoto = async (req, res) => {
    let output = {
        success: false,
        bodyData: { body: req.body, file: req.file },
        msg: '',
    };

    try {
        if (req.file) {
            const { trip_plan_id } = req.params;
            const data = { trip_pic: req.file.filename }; // 使用檔案名稱
            const filePath = `http://localhost:${process.env.WEB_PORT}/tripcover/${data.trip_pic}`; // 假設存储的路徑

            const [results] = await db.query(
                'UPDATE `trip_plans` SET trip_pic = ? WHERE `trip_plan_id` = ?',
                [filePath, trip_plan_id]
            );

            output.success = results.affectedRows > 0;
            output.msg = output.success
                ? '行程封面成功更新。'
                : '未找到指定 ID 的行程計劃';
        } else {
            output.msg = '沒有文件上傳';
        }
        res.json(output);
    } catch (error) {
        console.error('更新數據庫數據時出錯：', error);
        res.status(500).json({ success: false, msg: '更新數據庫數據時出錯' });
    }
};
