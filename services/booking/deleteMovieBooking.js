import db from '../../utils/mysql2-connect.js';

export const deleteMovieBooking = async (bookingId) => {
    const query = `DELETE FROM booking_system WHERE booking_id = ?`;

    const [results] = await db.query(query, [bookingId]);

    return results;
};
