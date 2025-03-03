# ใช้ Node.js เวอร์ชันล่าสุด
FROM node:latest

# กำหนด working directory
WORKDIR /usr/src/app

# คัดลอก package.json และติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# คัดลอกไฟล์ทั้งหมดในโปรเจกต์
COPY . .

# เปิดพอร์ต 3001
EXPOSE 3001

# คำสั่งเริ่มต้น
CMD ["npm", "run", "dev"]
