import aws from 'aws-sdk';
import path from 'path';

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

/**
 * 手動上傳 Buffer 到 S3
 * @param {Buffer} buffer - 檔案內容
 * @param {string} originalName - 原始檔名
 * @param {string} folder - S3 資料夾 (如 'posts')
 * @returns {Promise<string>} - 回傳 S3 URL
 */
export const uploadToS3 = async (buffer, originalName, folder = 'posts') => {
    const filename = `${folder}/${Date.now()}${path.extname(originalName)}`;
    
    const params = {
        Bucket: AWS_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: 'image/jpeg', // 預設，或根據副檔名判斷
        // ACL: 'public-read' // 根據 Bucket 設定決定是否需要此行
    };

    const result = await s3.upload(params).promise();
    return result.Location; // S3 URL
};
