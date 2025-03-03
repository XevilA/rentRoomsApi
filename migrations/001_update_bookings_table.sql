-- Drop the timeslot column and add start_time and end_time columns
ALTER TABLE bookings DROP COLUMN IF EXISTS timeslot;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_time VARCHAR(5) NOT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_time VARCHAR(5) NOT NULL;
