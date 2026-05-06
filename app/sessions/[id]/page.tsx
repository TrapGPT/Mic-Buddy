import { notFound, redirect } from 'next/navigation';

import type { Session } from '@/lib/api-client';
import { getOrCreateUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

import { SessionDetailClient } from './SessionDetailClient';

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const session = await prisma.session.findUnique({
    where: { id: params.id },
  });

  if (!session) notFound();
  if (session.userId !== user.id) notFound(); // hide existence from other users

  const serialized: Session = {
    id: session.id,
    title: session.title,
    bpm: session.bpm,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };

  return <SessionDetailClient session={serialized} />;
}
