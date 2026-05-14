require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminExists = await User.findOne({ role: 'ADMIN' });
    
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@anublood.com',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'ADMIN',
        hospitalName: 'Central Blood Bank',
        phone: '0112345678',
        status: 'active'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
