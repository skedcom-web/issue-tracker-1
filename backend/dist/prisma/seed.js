"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
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
    }
    else {
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
//# sourceMappingURL=seed.js.map