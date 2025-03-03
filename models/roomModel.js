const pool = require('../config/db');

const getAllRooms = async () => {
  const result = await pool.query('SELECT * FROM rooms');
  return result.rows;
};

const getById = async (roomId) => {
  const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
  return result.rows;
};

const createRoom = async (room) => {
  const { roomName, imageUrl, status, capacity, location, description } = room;
  const result = await pool.query(
    'INSERT INTO rooms ("roomName", "imageUrl", "status", "capacity", "location", "description") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [roomName, imageUrl, status, capacity, location, description]
  );
  
  return result.rows[0];
};
  
const updateRoom = async (roomId, { roomName, imageUrl, status, capacity, location, description }) => {
  const result = await pool.query(
    `UPDATE rooms 
     SET "roomName" = $1, "imageUrl" = $2, "status" = $3, "capacity" = $4, "location" = $5, "description" = $6 
     WHERE id = $7 
     RETURNING *`,
    [roomName, imageUrl, status, capacity, location, description, roomId]
  );
  
  return result.rows[0];
};

const deleteRoom = async (roomId) => {
  await pool.query(`DELETE FROM rooms WHERE id = $1`, [roomId]);
};

const updateRoomStatus = async (roomId, status) => {
  await pool.query(
    `UPDATE rooms SET status = $1 WHERE id = $2`,
    [status, roomId]
  );
};


module.exports = {
   getAllRooms,
   createRoom,
   getById,
   updateRoom,
   deleteRoom,
   updateRoomStatus
};

