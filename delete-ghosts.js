const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.attendance.deleteMany({
    where: {
      memberId: null,
      trainerId: null
    }
  });
  console.log('Deleted ghost records:', result);
}
main().finally(() => prisma.$disconnect());
