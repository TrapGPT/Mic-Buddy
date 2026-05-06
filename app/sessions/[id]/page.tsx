import Link from 'next/link';

import { SessionDetailPanel } from '@/components/sessions/session-detail-panel';
import { getOrCreateUser } from '@/lib/auth';
import { sessionIdParamSchema } from '@/shared/schemas/session';

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getOrCreateUser();
  if (!user) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Not signed in</p>
        <Link href="/" className="mt-2 inline-block text-sm underline">
          Go home
        </Link>
      </div>
    );
  }

  const parsed = sessionIdParamSchema.safeParse(params);
  if (!parsed.success) {
    return (
      <div className="p-8">
        <p className="text-sm text-destructive">Invalid session id</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <SessionDetailPanel sessionId={parsed.data.id} />
    </div>
  );
}
