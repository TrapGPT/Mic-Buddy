import { getOrCreateUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

import { DashboardClient } from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) return <div className="p-8">Not signed in</div>;

  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      bpm: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Serialize dates for client
  const serialized = sessions.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <DashboardClient initialSessions={serialized} userEmail={user.email} />
  );
}
