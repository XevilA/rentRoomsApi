const express = require("express");
const router = express.Router();
const { validateBody } = require("../validation/bookingVal")
const { 
  addBooking, 
  searchBookingsByPhone,
  getBookingDetails,
  getAllBookingsController,
  updateBookingController,
  updateBookingStatusController
} = require("../controllers/bookingController");

// สร้างการจองใหม่
router.post("/create", validateBody, addBooking);

// ค้นหาการจองด้วยเบอร์โทรศัพท์
router.get("/search/phone/:phone", searchBookingsByPhone);

// ดึงรายละเอียดการจองตาม ID
router.get("/:id", getBookingDetails);

// ดึงข้อมูลการจองทั้งหมด
router.get("/", getAllBookingsController);

// อัพเดทข้อมูลการจอง
router.put("/:id", updateBookingController);

// อัพเดทสถานะการจอง
router.patch("/:id/status", updateBookingStatusController);

module.exports = router;
