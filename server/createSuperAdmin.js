const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function createSuperAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const existing = await User.findOne({ email: 'campusnex@edu.in' });
  if (existing) {
    console.log('User already exists:', existing.email);
    process.exit(0);
  }

  const user = await User.create({
    name: 'CampusNex',
    email: 'campusnex@edu.in',
    password: 'CampusNex@123',
    role: 'superadmin',
    isActive: true,
  });

  console.log('Superadmin created:', user.email);
  process.exit(0);
}

createSuperAdmin().catch(err => { console.error(err); process.exit(1); });
