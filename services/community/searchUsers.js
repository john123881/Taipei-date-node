import db from '../../utils/mysql2-connect.js';

export const searchUsers = async (searchTerm) => {
    const query = `
    SELECT 
        user_id, username, email, avatar 
    FROM 
        member_user 
    WHERE 
        email LIKE CONCAT(?, "%") 
    OR 
        username LIKE CONCAT(?, "%")
    `;

    const [results] = await db.query(query, [searchTerm, searchTerm]);

    // 將 BLOB 數據轉換為 Base64 字符串
    const users = results.map((user) => {
        if (user.img) {
            const imageBase64 = Buffer.from(user.img).toString('base64');
            return {
                ...user,
                img: `data:image/jpeg;base64,${imageBase64}`,
            };
        }
        return user;
    });
    return users;
};
