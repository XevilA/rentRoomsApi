const pool = require("../config/db");

// ดึงข้อมูลการจองทั้งหมด
const getAllBookings = async () => {
  const query = `
    SELECT 
      b.id, b.fullname, b.phone, b.email, b.date, b.start_time, 
      b.end_time, b.status, r.id AS room_id, r."roomName" AS room_name, 
      r.capacity AS room_capacity, r.location AS room_floor, 
      ARRAY_AGG(DISTINCT e.name) FILTER (WHERE e.name IS NOT NULL) AS equipment_names
    FROM bookings b
    LEFT JOIN rooms r ON b.roomId = r.id
    LEFT JOIN booking_equipments be ON be.booking_id = b.id
    LEFT JOIN equipments e ON be.equipment_id = e.id
    GROUP BY b.id, r.id
    ORDER BY b.date DESC, b.start_time ASC;
  `;
  return (await pool.query(query)).rows;
};

// อัพเดทสถานะการจอง
const updateBookingStatus = async (bookingId, status) => {
  const query = `
    UPDATE bookings 
    SET status = $1, approve_date = CURRENT_TIMESTAMP
    WHERE id = $2 RETURNING *;
  `;
  return (await pool.query(query, [status, bookingId])).rows[0];
};

// ค้นหาการจองด้วยเบอร์โทรศัพท์
const getBookingsByPhone = async (phone) => {
  const query = `
    SELECT b.*, r."roomName" AS room_name, r.capacity, r.location, 
      ARRAY_AGG(DISTINCT e.name) FILTER (WHERE e.name IS NOT NULL) AS equipment_names
    FROM bookings b
    LEFT JOIN rooms r ON b.roomId = r.id
    LEFT JOIN booking_equipments be ON b.id = be.booking_id
    LEFT JOIN equipments e ON be.equipment_id = e.id
    WHERE b.phone = $1
    GROUP BY b.id, r.id
    ORDER BY b.date DESC, b.start_time DESC;
  `;
  return (await pool.query(query, [phone])).rows;
};

// ดึงข้อมูลการจองตาม ID
const getBookingById = async (id) => {
  const query = `
    SELECT b.*, r."roomName" AS room_name, r.capacity, r.location, 
      ARRAY_AGG(DISTINCT e.name) FILTER (WHERE e.name IS NOT NULL) AS equipment_names
    FROM bookings b
    LEFT JOIN rooms r ON b.roomid = r.id
    LEFT JOIN booking_equipments be ON b.id = be.booking_id
    LEFT JOIN equipments e ON be.equipment_id = e.id
    WHERE b.id = $1
    GROUP BY b.id, r.id;
  `;
  const result = await pool.query(query, [id]);
  return result.rows.length ? { booking: result.rows[0] } : null;
};

// เพิ่มการจองใหม่
const createBooking = async ({ roomId, fullName, phone, email, date, startTime, endTime }) => {
  const query = `
    INSERT INTO bookings (roomId, fullName, phone, email, date, start_time, end_time, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
    RETURNING *;
  `;
  return (await pool.query(query, [roomId, fullName, phone, email, date, startTime, endTime])).rows[0];
};

// อัพเดทข้อมูลการจอง
const updateBooking = async (id, bookingData) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateBookingQuery = `
      UPDATE bookings 
      SET roomId = $1, fullName = $2, phone = $3, email = $4, 
          date = $5, start_time = $6, end_time = $7
      WHERE id = $8 RETURNING *;
    `;
    const values = [
      bookingData.roomId, bookingData.fullName, bookingData.phone, bookingData.email,
      bookingData.date, bookingData.startTime, bookingData.endTime, id
    ];
    const result = await client.query(updateBookingQuery, values);

    if (bookingData.equipments?.length) {
      await client.query("DELETE FROM booking_equipments WHERE booking_id = $1", [id]);
      const insertEquipmentQuery = `
        INSERT INTO booking_equipments (booking_id, equipment_id)
        VALUES ($1, $2);
      `;
      for (const equipmentId of bookingData.equipments) {
        await client.query(insertEquipmentQuery, [id, equipmentId]);
      }
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ดึงข้อมูลการจองของสัปดาห์ปัจจุบัน
const getWeeklyBookings = async () => {
  const query = `
    SELECT * FROM bookings 
    WHERE date >= date_trunc('week', CURRENT_DATE) 
    AND date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
    ORDER BY date ASC, start_time ASC;
  `;
  return (await pool.query(query)).rows;
};

// ดึงข้อมูลการจองของเดือนปัจจุบัน
const getMonthlyBookings = async () => {
  const query = `
    SELECT * FROM bookings 
    WHERE date >= date_trunc('month', CURRENT_DATE) 
    AND date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
    ORDER BY date ASC, start_time ASC;
  `;
  return (await pool.query(query)).rows;
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByPhone,
  updateBooking,
  updateBookingStatus,
  getWeeklyBookings,
  getMonthlyBookings
};
