import prisma from './src/utils/db';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding database...');
  
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('admin123', salt);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password,
      role: 'admin',
      name: 'Super Admin',
    },
  });

  const trainerPassword = await bcrypt.hash('trainer123', salt);
  const trainer = await prisma.user.upsert({
    where: { username: 'trainer' },
    update: {},
    create: {
      username: 'trainer',
      password: trainerPassword,
      role: 'trainer',
      name: 'Master Trainer',
      trainerProfile: {
        create: {
          specialty: 'CrossFit',
        }
      }
    },
  });

  const memberPassword = await bcrypt.hash('member123', salt);
  const member = await prisma.user.upsert({
    where: { username: 'member' },
    update: {},
    create: {
      username: 'member',
      password: memberPassword,
      role: 'member',
      name: 'Active Member',
      memberProfile: {
        create: {}
      }
    },
  });

  console.log({ admin, trainer, member });
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
