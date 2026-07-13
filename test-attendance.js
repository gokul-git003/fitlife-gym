const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const records = await prisma.attendance.findMany({
    include: {
      member: { include: { user: true } },
      trainer: { include: { user: true } }
    }
  });
  console.dir(records, { depth: null });
}
main().finally(() => prisma.$disconnect());
