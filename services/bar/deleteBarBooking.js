import db from '../../utils/mysql2-connect.js';

export const deleteBarBooking = async (barBookingId) => {
    const query = `DELETE FROM bar_booking WHERE bar_booking_id = ?`;

    console.log('query', barBookingId);

    const [results] = await db.query(query, [barBookingId]);

    return results;
};
