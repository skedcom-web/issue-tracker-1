import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Default Admin User ─────────────────────────────────────────
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@company.com' },
  });

  if (!existingAdmin) {
    const hash = await bcrypt.hash('Admin@123', 10);
    await prisma.user.create({
      data: {
        name: 'Administrator',
        email: 'admin@company.com',
        password: hash,
        role: 'Admin',
        department: 'IT',
        mustChangePassword: false,
        active: true,
      },
    });
    console.log('✅ Default admin created: admin@company.com / Admin@123');
  } else {
    console.log('ℹ️  Admin already exists, skipping.');
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
