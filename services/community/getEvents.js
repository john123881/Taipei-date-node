import db from '../../utils/mysql2-connect.js';
import dayjs from 'dayjs';

export const getEvents = async (page = 1, limit = 12) => {
    const offset = (page - 1) * limit; // 計算起始位置
    const query = `
        SELECT 
            ce.*, 
            cep.photo_name, 
            cep.img,
            DATE_FORMAT(ce.start_time, '%H:%i') AS formatted_start_time,
            DATE_FORMAT(ce.end_time, '%H:%i') AS formatted_end_time
        FROM 
            comm_events AS ce
        LEFT JOIN 
            comm_events_photo AS cep 
        ON 
            ce.comm_event_id = cep.comm_event_id
        ORDER BY 
            ce.start_date ASC
        LIMIT ? OFFSET ?`;

    const [results] = await db.query(query, [limit, offset]); // 傳遞limit和offset值

    // const startDateFormat = 'YYYY[年] MM[月]DD[日] HH:mm';
    // const endDateFormat = 'MM[月]DD[日] HH:mm';

    const startDateFormat = 'YYYY[年] MM[月]DD[日]';
    const endDateFormat = 'YYYY[年] MM[月]DD[日]';

    // 將 BLOB 數據轉換為 Base64 字符串
    const formattedResults = results.map((event) => {
        // 先進行日期格式化
        const formattedEvent = {
            ...event,
            start_date: dayjs(event.start_date).format(startDateFormat),
            start_time: event.formatted_start_time,
            end_date: dayjs(event.end_date).format(endDateFormat),
            end_time: event.formatted_end_time,
        };
        // 檢查是否有圖片，並進行轉換
        if (event.img) {
            const imageBase64 = Buffer.from(event.img).toString('base64');
            formattedEvent.img = `data:image/jpeg;base64,${imageBase64}`;
        }
        return formattedEvent;
    });
    return formattedResults;
};
