const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function testPassword() {
  const user = await prisma.user.findUnique({ where: { username: 'testuser' } });
  console.log("User found:", user.username);
  const isMatch = await bcrypt.compare('password123', user.password);
  console.log("Match with 'password123':", isMatch);
  
  // also try resetting it to test the API directly
}
testPassword().finally(() => prisma.$disconnect());
