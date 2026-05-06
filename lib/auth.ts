import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';

export async function getOrCreateUser() {
  const { userId: clerkUserId } = auth();
  if (!clerkUserId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error('No email on Clerk user');

  return prisma.user.upsert({
    where: { clerkUserId },
    update: { email },
    create: { clerkUserId, email },
  });
}
