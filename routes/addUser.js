const { createUser } = require('../models/userModel');

const main = async () => {
  try {
    await createUser('test@example.com', 'password123', 'Test User');
    console.log('User successfully added');
  } catch (error) {
    console.error('Error adding user:', error);
  }
};

main();
