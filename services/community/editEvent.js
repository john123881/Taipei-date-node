import db from '../../utils/mysql2-connect.js';
import dayjs from 'dayjs';

export const editEvent = async (
    title,
    description,
    location,
    startDate,
    startTime,
    endDate,
    endTime,
    eventId
) => {
    // 轉換日期格式
    // const formattedStartDate = dayjs(startDate, 'YYYY[年] MM[月]DD[日]').format(
    //     'YYYY-MM-DD'
    // );
    // const formattedEndDate = dayjs(endDate, 'MM[月]DD[日]').format(
    //     'YYYY-MM-DD'
    // );

    const query = `
        UPDATE 
            comm_events
        SET
            title = ?,
            description = ?,
            location = ?,
            start_date = ?,
            start_time = ?,
            end_date = ?,
            end_time = ?,
            updated_at = NOW()
        WHERE 
            comm_event_id = ?
        `;
    const [results] = await db.query(query, [
        title,
        description,
        location,
        startDate,
        startTime,
        endDate,
        endTime,
        eventId,
    ]);

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

    const [eventResults] = await db.query(getNewEventQuery, [eventId]);

    const startDateFormat = 'YYYY[年] MM[月]DD[日]';
    const endDateFormat = 'YYYY[年] MM[月]DD[日]';

    if (eventResults.length > 0) {
        const event = eventResults[0];

        event.start_date = dayjs(event.start_date).format(startDateFormat);
        event.start_time = event.formatted_start_time;
        event.end_date = dayjs(event.end_date).format(endDateFormat);
        event.end_time = event.formatted_end_time;

        if (event.img) {
            const imageBase64 = Buffer.from(event.img).toString('base64');
            event.img = `data:image/jpeg;base64,${imageBase64}`;
        }

        return event;
    }

    return results;
};
