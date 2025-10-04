import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Seed script to create an admin user
 * Run this script: node --loader ts-node/esm scripts/createAdmin.ts
 * Or add it as an API route and call it once
 */

async function createAdminUser() {
  try {
    await connectDB();

    const adminEmail = 'admin@studynotes.com';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'admin123', // Change this in production!
      studentId: 'ADMIN001',
      role: 'admin',
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

createAdminUser();
