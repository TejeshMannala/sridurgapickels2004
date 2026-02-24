const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/userModel');

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const email = (process.env.ADMIN_EMAIL || 'admin@pickles.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'admin';
      // Ensure admin login credentials are synced to .env values.
      existing.password = password;
      await existing.save();
      console.log(`Updated existing user as admin and reset password: ${email}`);
    } else {
      await User.create({
        name: 'Admin',
        email,
        password,
        role: 'admin'
      });
      console.log(`Created admin user: ${email}`);
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
