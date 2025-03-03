const { createBooking, getBookingsByPhone, getBookingById, getAllBookings, updateBooking, updateBookingStatus } = require("../models/bookingModel");
const { updateRoomStatus } = require("../models/roomModel");
const { createBookingEquipment } = require("../models/bookingEquipmentModel");

const addBooking = async (req, res) => {
  try {
    const bookingData = req.body;
    console.log(bookingData);
    // บันทึกการจองในตาราง bookings
    const newBooking = await createBooking(bookingData);

    // บันทึกการจองในตาราง booking_equipments
    if (bookingData.equipments.length > 0) {
      for (const equipmentId of bookingData.equipments) {
        await createBookingEquipment({
          bookingId: newBooking.id,
          equipmentId,
        });
      }
    }

    // อัปเดตสถานะห้องเป็น Occupied
    // await updateRoomStatus(bookingData.roomId, "Occupied");

    res.status(201).json({
      message: "Booking successful",
      booking: newBooking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create booking", error });
  }
};

// ค้นหาการจองด้วยเบอร์โทรศัพท์
const searchBookingsByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    
    // ตรวจสอบรูปแบบเบอร์โทรศัพท์
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        message: "Invalid phone number format. Please provide a 10-digit phone number." 
      });
    }

    const bookings = await getBookingsByPhone(phone);
    
    if (bookings.length === 0) {
      return res.status(404).json({ 
        message: "No bookings found for this phone number" 
      });
    }

    res.json({
      message: "Bookings retrieved successfully",
      bookings: bookings
    });
  } catch (error) {
    console.error('Error searching bookings:', error);
    res.status(500).json({ 
      message: "Failed to search bookings", 
      error: error.message 
    });
  }
};

// ดึงรายละเอียดการจองตาม ID
const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ 
        message: "Booking not found" 
      });
    }

    res.json({
      message: "Booking details retrieved successfully",
      booking: booking.booking
    });
  } catch (error) {
    console.error('Error getting booking details:', error);
    res.status(500).json({ 
      message: "Failed to get booking details", 
      error: error.message 
    });
  }
};

// GET /api/bookings - ดึงข้อมูลการจองทั้งหมด
const getAllBookingsController = async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

// PUT /api/bookings/:id - อัพเดทข้อมูลการจอง
const updateBookingController = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingData = req.body;
    const updatedBooking = await updateBooking(id, bookingData);
    res.json(updatedBooking);
  } catch (error) {
    if (error.message === 'Booking not found') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
};

// PATCH /api/bookings/:id/status - อัพเดทสถานะการจอง
const updateBookingStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(status);
    // ตรวจสอบว่า status ที่ส่งมาถูกต้อง
    const validStatuses = [1, 99];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Status must be one of: pending, approved, rejected, cancelled' 
      });
    }
    
    const updatedBooking = await updateBookingStatus(id, status);
    
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Error updating booking status' });
  }
};

module.exports = {
  addBooking,
  searchBookingsByPhone,
  getBookingDetails,
  getAllBookingsController,
  updateBookingController,
  updateBookingStatusController
};
