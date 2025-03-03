const express = require('express');
const cors = require('cors');
const path = require('path');
const roomRoutes = require('./routes/roomRoutes');
const equipmentRoutes = require('./routes/equipmentsRoutes');
const authRoutes = require('./routes/authRoutes');
const imageUploadRoutes = require("./routes/imageUploadRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // สำหรับรับ JSON จาก client

app.use('/api/rooms', roomRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api', authRoutes);
app.use("/api", imageUploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
