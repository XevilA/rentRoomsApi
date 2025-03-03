const roomModel = require('../models/roomModel');

const getRooms = async (req, res) => {
  try {
    const rooms = await roomModel.getAllRooms();
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
};

const createRoom = async (req, res) => {
    try {
      const newRoom = await roomModel.createRoom(req.body);
      res.status(201).json(newRoom);
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ message: 'Error creating room' });
    }
  };
  
  const getRoomById = async (req, res) => {
    const { roomId } = req.params;  
    
    try {
      const result = await roomModel.getById(roomId);
      console.log('roomId', result);
      if (result.length === 0) {
        return res.status(404).json({ message: `Room with ID ${roomId} not found` });
      }
      res.json(result[0]);
    } catch (err) {
      console.error('Error fetching room by ID:', err);
      res.status(500).json({ message: 'Error fetching room by ID' });
    }
  };

  const updateRoom = async (req, res) => {
    try {
      const { id } = req.params; // ตรวจสอบว่า id ถูกส่งมาหรือไม่
      const roomData = req.body; // ข้อมูลที่รับจาก request
  
      // เรียก Model เพื่ออัปเดตข้อมูลห้อง
      const updatedRoom = await roomModel.updateRoom(id, roomData);
  
      if (!updatedRoom) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json(updatedRoom);
    } catch (error) {
      console.error('Error updating room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  const deleteRoom = async (req, res) => {
    try {
      await roomModel.deleteRoom(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete room' });
    }
  };

  module.exports = {
    getRooms,
    createRoom,
    getRoomById,
    updateRoom,
    deleteRoom
  };

