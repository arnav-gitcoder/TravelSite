import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
console.log('MongoDB connected\n');

const { default: Admin } = await import('./src/models/Admin.js');

const admin = {
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  role: process.env.ADMIN_ROLE || 'admin',
};

if (!admin.name || !admin.email || !admin.password) {
  console.error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env');
  process.exit(1);
}

await Admin.deleteMany({ email: admin.email });
const createdAdmin = new Admin(admin);
await createdAdmin.save();

const found = await Admin.findOne({ email: admin.email }).select('+password');
const valid = await found.matchPassword(admin.password);

console.log(`${valid ? 'Created' : 'Failed to verify'} admin account`);
console.log(`   Email: ${admin.email}`);
console.log(`   Role:  ${admin.role}`);
console.log('');

console.log('Done. Login at http://localhost:5173/admin/login');
process.exit(0);
