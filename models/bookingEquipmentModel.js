const pool = require("../config/db");

const createBookingEquipment = async (bookingEquipmentData) => {
    const { bookingId, equipmentId } = bookingEquipmentData;

    const result = await pool.query(
        `INSERT INTO booking_equipments (booking_id, equipment_id)
       VALUES ($1, $2)
       RETURNING *`,
        [bookingId, equipmentId]
    );

    return result.rows[0];
};

module.exports = {
    createBookingEquipment
};