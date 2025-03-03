const pool = require('../config/db');

// Create - เพิ่มอุปกรณ์ใหม่
const createEquipment = async (equipmentData) => {
  const { name } = equipmentData;
  const query = `
    INSERT INTO equipments (name)
    VALUES ($1)
    RETURNING *
  `;
  const values = [name];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Read - ดึงข้อมูลอุปกรณ์ทั้งหมด
const getAllEquipments = async () => {
  const result = await pool.query('SELECT * FROM equipments ORDER BY id');
  return result.rows;
};

// Read - ดึงข้อมูลอุปกรณ์ตาม ID
const getEquipmentById = async (id) => {
  const query = 'SELECT * FROM equipments WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Update - อัพเดทข้อมูลอุปกรณ์
const updateEquipment = async (id, equipmentData) => {
  const { name, description, status, quantity } = equipmentData;
  const query = `
    UPDATE equipments 
    SET name = $1
    WHERE id = $2
    RETURNING *
  `;
  const values = [name, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete - ลบข้อมูลอุปกรณ์
const deleteEquipment = async (id) => {
  const query = 'DELETE FROM equipments WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// สถิติการใช้งานอุปกรณ์
const getEquipmentUsageStats = async () => {
  const query = `
    SELECT 
      e.id, 
      e.name, 
      COUNT(be.equipment_id) as usage_count
    FROM 
      equipments e
    LEFT JOIN 
      booking_equipments be ON e.id = be.equipment_id
    GROUP BY 
      e.id, e.name
    ORDER BY 
      usage_count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  createEquipment,
  getAllEquipments,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getEquipmentUsageStats
};
