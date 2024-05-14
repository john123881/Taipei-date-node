import db from '../../utils/mysql2-connect.js';
import dayjs from 'dayjs';

export const createEvent = async (
    title,
    description,
    status,
    location,
    userId,
    startDate,
    startTime,
    endDate,
    endTime
) => {
    const [results] = await db.query(
        `INSERT INTO comm_events(title ,description, status, location, user_id, start_date, start_time, end_date, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            title,
            description,
            status,
            location,
            userId,
            startDate,
            startTime,
            endDate,
            endTime,
        ]
    );

    const newEventId = results.insertId;

    const getNewEventQuery = `
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
        WHERE
            ce.comm_event_id = ?
        `;

    const [eventResults] = await db.query(getNewEventQuery, [newEventId]);

    const startDateFormat = 'YYYY[年] MM[月]DD[日]';
    const endDateFormat = 'YYYY[年] MM[月]DD[日]';

    if (eventResults.length > 0) {
        const event = eventResults[0];

        event.start_date = dayjs(event.start_date).format(startDateFormat);
        event.end_date = dayjs(event.end_date).format(endDateFormat);

        if (event.img) {
            const imageBase64 = Buffer.from(event.img).toString('base64');
            event.img = `data:image/jpeg;base64,${imageBase64}`;
        }

        return event;
    }

    return results;
};
