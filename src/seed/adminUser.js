const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function seedAdminUser() {
  const count = await User.count();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash('admin123', 10);
  await User.create({ username: 'admin', passwordHash });
  console.log('[SEED] Admin user created');
}

module.exports = { seedAdminUser };
