import { getOrCreateUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) return <div>Not signed in</div>;

  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
      <p className="text-sm text-gray-500 mt-2">
        {sessions.length} session{sessions.length === 1 ? '' : 's'}
      </p>
    </div>
  );
}
