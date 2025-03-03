const euipmentsModel = require('../models/euipmentsModel');

// GET /api/equipments - ดึงข้อมูลอุปกรณ์ทั้งหมด
const getEquipments = async (req, res) => {
  try {
    const equipments = await euipmentsModel.getAllEquipments();
    res.json(equipments);
  } catch (error) {
    console.error('Error fetching equipments:', error);
    res.status(500).json({ message: 'Error fetching equipments' });
  }
};

// GET /api/equipments/:id - ดึงข้อมูลอุปกรณ์ตาม ID
const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await euipmentsModel.getEquipmentById(id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Error fetching equipment' });
  }
};

// POST /api/equipments - เพิ่มอุปกรณ์ใหม่
const createEquipment = async (req, res) => {
  try {
    const equipmentData = req.body;
    const newEquipment = await euipmentsModel.createEquipment(equipmentData);
    res.status(201).json(newEquipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ message: 'Error creating equipment' });
  }
};

// PUT /api/equipments/:id - อัพเดทข้อมูลอุปกรณ์
const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipmentData = req.body;
    
    const updatedEquipment = await euipmentsModel.updateEquipment(id, equipmentData);
    
    if (!updatedEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json(updatedEquipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ message: 'Error updating equipment' });
  }
};

// DELETE /api/equipments/:id - ลบข้อมูลอุปกรณ์
const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEquipment = await euipmentsModel.deleteEquipment(id);
    
    if (!deletedEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ message: 'Error deleting equipment' });
  }
};

// GET /api/equipments/stats - ดึงข้อมูลสถิติการใช้งานอุปกรณ์
const getEquipmentStats = async (req, res) => {
  try {
    const stats = await euipmentsModel.getEquipmentUsageStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching equipment statistics:', error);
    res.status(500).json({ message: 'Error fetching equipment statistics' });
  }
};

module.exports = {
  getEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentStats
};
