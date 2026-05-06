import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { clerkUserId: 'user_seed_micbuddy_demo' },
    create: {
      clerkUserId: 'user_seed_micbuddy_demo',
      email: 'demo@example.com',
    },
    update: {
      email: 'demo@example.com',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
