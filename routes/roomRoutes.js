const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Route สำหรับ GET ห้องทั้งหมด
router.get('/', roomController.getRooms);
router.get('/:roomId', roomController.getRoomById);

router.post('/create', roomController.createRoom);

router.put('/update/:id', roomController.updateRoom);

router.delete('/delete/:id', roomController.deleteRoom);

module.exports = router;
