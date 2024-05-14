import db from '../../utils/mysql2-connect.js';
import dayjs from 'dayjs';

export const createBarBooking = async (
    user_id,
    bar_id,
    bar_booking_time,
    bar_booking_people_num,
    bar_time_slot_id
) => {
    const [results] = await db.query(
        `INSERT INTO bar_booking(user_id, bar_id, bar_booking_time, bar_booking_people_num, bar_time_slot_id) VALUES (?, ?, ?, ?, ?)`,
        [
            user_id,
            bar_id,
            bar_booking_time,
            bar_booking_people_num,
            bar_time_slot_id,
        ]
    );

    return results;
};
