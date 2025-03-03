const pool = require("../config/db");

const checkAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    // Query ตรวจสอบห้องที่ถูกจองในช่วงเวลานั้น (มีการซ้อนทับกัน)
    const result = await pool.query(
      `SELECT roomId FROM bookings 
       WHERE date = $1 
       AND (
         (start_time <= $2 AND end_time > $2) OR
         (start_time < $3 AND end_time >= $3) OR
         (start_time >= $2 AND end_time <= $3)
       )`,
      [date, startTime, endTime]
    );

    const bookedRoomIds = result.rows.map(row => row.roomid);

    // Query ห้องทั้งหมดในระบบ
    const rooms = await pool.query("SELECT id, roomName FROM rooms");

    // ตรวจสอบและ disable ห้องที่ถูกจองไปแล้ว
    const availability = rooms.rows.map(room => ({
      id: room.id,
      roomName: room.roomname,
      isAvailable: !bookedRoomIds.includes(room.id), // ห้องที่ไม่อยู่ใน bookedRoomIds ถือว่าว่าง
    }));

    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: "Error checking availability", error });
  }
};

// 1. API เพื่อตรวจสอบช่วงเวลาที่ถูกจองไปแล้วสำหรับวันที่และห้องที่ระบุ
const checkTimeSlots = async (req, res) => {
  try {
    const { date, roomId } = req.query;

    if (!date || !roomId) {
      return res.status(400).json({ message: "Date and roomId are required" });
    }

    // Query ดึงข้อมูลการจองทั้งหมดสำหรับวันและห้องที่ระบุ
    const result = await pool.query(
      `SELECT start_time, end_time FROM bookings WHERE date = $1 AND roomId = $2`,
      [date, roomId]
    );

    // รวบรวมช่วงเวลาที่ถูกจองไปแล้ว
    const bookedTimeSlots = [];
    result.rows.forEach(row => {
      const startIndex = timeSlots.indexOf(row.start_time);
      const endIndex = timeSlots.indexOf(row.end_time);
      for (let i = startIndex; i <= endIndex; i++) {
        bookedTimeSlots.push(timeSlots[i]);
      }
    });

    res.status(200).json({
      date,
      roomId,
      bookedTimeSlots: [...new Set(bookedTimeSlots)] // Remove duplicates
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking time slots", error });
  }
};

// ช่วงเวลาทั้งหมดที่สามารถจองได้
const timeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

// 2. API เพื่อตรวจสอบวันที่ในเดือนที่ห้องถูกจองเต็มทั้งหมด (สำหรับปิดการเลือกในปฏิทิน)
const checkMonthAvailability = async (req, res) => {
  try {
    const { year, month, roomId } = req.query;

    // สร้างวันที่เริ่มต้นและสิ้นสุดของเดือน
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // ดึงข้อมูลการจองทั้งหมดในเดือนที่ระบุ
    let query = `
      WITH RECURSIVE time_slots(slot_time, slot_index) AS (
        SELECT unnest($1::text[]), generate_series(1, array_length($1::text[], 1))
      ),
      bookings_slots AS (
        SELECT 
          b.date,
          COUNT(DISTINCT ts.slot_index) as booked_slots_count
        FROM 
          bookings b
          CROSS JOIN time_slots ts
        WHERE 
          b.date BETWEEN $2 AND $3
          ${roomId ? 'AND b.roomId = $4' : ''}
          AND ts.slot_time >= b.start_time 
          AND ts.slot_time <= b.end_time
        GROUP BY 
          b.date
      )
      SELECT 
        date,
        COALESCE(booked_slots_count, 0) as booked_slots_count
      FROM 
        bookings_slots
      WHERE 
        booked_slots_count >= $5
    `;

    const queryParams = roomId 
      ? [timeSlots, startDate.toISOString(), endDate.toISOString(), roomId, timeSlots.length]
      : [timeSlots, startDate.toISOString(), endDate.toISOString(), timeSlots.length];

    const result = await pool.query(query, queryParams);

    // แปลงวันที่ให้อยู่ในรูปแบบที่ต้องการ
    const fullyBookedDates = result.rows.map(row => row.date);

    res.status(200).json({
      year,
      month,
      fullyBookedDates
    });
  } catch (error) {
    console.error("Error checking month availability:", error);
    res.status(500).json({ 
      message: "Error checking month availability", 
      error: error.message 
    });
  }
};

module.exports = {
  checkAvailability,
  checkTimeSlots,
  checkMonthAvailability
};
