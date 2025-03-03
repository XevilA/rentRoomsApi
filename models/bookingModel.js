const pool = require("../config/db");

// ดึงข้อมูลการจองทั้งหมด
const getAllBookings = async () => {
  const query = `
      SELECT 
          b.id, 
          b.fullname, 
          b.phone, 
          b.email,
          b.date, 
          b.start_time, 
          b.end_time, 
          b.status, 
          r.id AS room_id, 
          r."roomName" AS room_name, 
          r.capacity AS room_capacity, 
          r.location AS room_floor, 
          ARRAY_AGG(DISTINCT COALESCE(e.name, '')) AS equipment_names
      FROM bookings b
      LEFT JOIN rooms r ON b.roomId = r.id
      LEFT JOIN booking_equipments be ON be.booking_id = b.id
      LEFT JOIN equipments e ON be.equipment_id = e.id AND e.name IS NOT NULL
      GROUP BY 
          b.id, 
          b.fullname, 
          b.phone, 
          b.email, 
          b.date, 
          b.start_time, 
          b.end_time, 
          b.status, 
          r.id, 
          r."roomName", 
          r.capacity, 
          r.location
      ORDER BY b.date DESC, b.start_time ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

// อัพเดทสถานะการจอง
const updateBookingStatus = async (bookingId, status) => {
  const query = `
    UPDATE bookings 
    SET status = $1, 
        approve_date = CURRENT_TIMESTAMP
    WHERE id = $2 
    RETURNING *
  `;
  
  const result = await pool.query(query, [status, bookingId]);
  return result.rows[0];
};

// ค้นหาการจองด้วยเบอร์โทรศัพท์
const getBookingsByPhone = async (phone) => {
  const query = `
    SELECT 
      b.*,
      r."roomName" as room_name,
      r.capacity as room_capacity,
      r.location as room_floor,
      b.status,
      ARRAY_AGG(DISTINCT e.name) FILTER (WHERE e.name IS NOT NULL) as equipment_names
    FROM 
      bookings b
    LEFT JOIN 
      rooms r ON b.roomId = r.id
    LEFT JOIN 
      booking_equipments be ON b.id = be.booking_id
    LEFT JOIN 
      equipments e ON be.equipment_id = e.id
    WHERE 
      b.phone = $1
    GROUP BY 
      b.id, r.id, r."roomName", r.capacity, r.location
    ORDER BY 
      b.date DESC, b.start_time DESC
  `;
  
  const result = await pool.query(query, [phone]);
  return result.rows;
};

// ดึงข้อมูลการจองตาม ID
const getBookingById = async (id) => {
  const query = `
    SELECT 
      b.*,
      r."roomName" as room_name,
      r.capacity as room_capacity,
      r.location as room_floor,
      ARRAY_AGG(DISTINCT e.name) FILTER (WHERE e.name IS NOT NULL) as equipment_names,
      ARRAY_AGG(DISTINCT e.id) FILTER (WHERE e.id IS NOT NULL) as equipment_ids
    FROM 
      bookings b
    LEFT JOIN 
      rooms r ON b.id = r.id
    LEFT JOIN 
      booking_equipments be ON b.id = be.booking_id
    LEFT JOIN 
      equipments e ON be.equipment_id = e.id
    WHERE 
      b.id = $1
    GROUP BY 
      b.id, r.id, r."roomName", r.capacity, r.location
  `;

  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    return null;
  }
  return { booking: result.rows[0] };
};

// เพิ่มการจองใหม่
const createBooking = async (bookingData) => {
  const { roomId, fullName, phone, email, date, startTime, endTime } = bookingData;

  const result = await pool.query(
    `INSERT INTO bookings (roomId, fullName, phone, email, date, start_time, end_time, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [roomId, fullName, phone, email, date, startTime, endTime, 0]
  );
  return result.rows[0];
};

// อัพเดทข้อมูลการจอง
const updateBooking = async (id, bookingData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log(bookingData);
    // อัพเดทข้อมูลการจอง
    const updateBookingQuery = `
      UPDATE bookings 
      SET 
        "roomid" = $1,
        "fullname" = $2,
        phone = $3,
        email = $4,
        date = $5,
        start_time = $6,
        end_time = $7
      WHERE id = $8
      RETURNING *
    `;
    const values = [
      bookingData.roomId,
      bookingData.fullName,
      bookingData.phone,
      bookingData.email,
      bookingData.date,
      bookingData.startTime,
      bookingData.endTime,
      id
    ];
    const result = await client.query(updateBookingQuery, values);

    // อัพเดทข้อมูลอุปกรณ์
    if (bookingData.equipments && bookingData.equipments.length > 0) {
      // ลบข้อมูลอุปกรณ์เดิม
      await client.query('DELETE FROM booking_equipments WHERE booking_id = $1', [id]);

      // เพิ่มข้อมูลอุปกรณ์ใหม่
      const insertEquipmentQuery = `
        INSERT INTO booking_equipments (booking_id, equipment_id)
        VALUES ($1, $2)
      `;
      for (const equipmentId of bookingData.equipments) {
        await client.query(insertEquipmentQuery, [id, equipmentId]);
      }
    }

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByPhone,
  updateBooking,
  updateBookingStatus
};
