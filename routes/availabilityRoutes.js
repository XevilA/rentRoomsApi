const express = require("express");
const { 
  checkAvailability, 
  checkTimeSlots, 
  checkMonthAvailability 
} = require("../controllers/availabilityController");
const router = express.Router();

router.post("/check", checkAvailability);
router.get("/time-slots", checkTimeSlots);
router.get("/month", checkMonthAvailability);

module.exports = router;
