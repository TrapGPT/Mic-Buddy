import type { Session } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { getOrCreateUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiError } from '@/shared/schemas/error';
import { updateSessionSchema } from '@/shared/schemas/session';

type OwnedSessionResult =
  | { error: 'NOT_FOUND' | 'FORBIDDEN' }
  | { session: Session };

async function getOwnedSession(
  userId: string,
  sessionId: string
): Promise<OwnedSessionResult> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!session) return { error: 'NOT_FOUND' };
  if (session.userId !== userId) return { error: 'FORBIDDEN' };
  return { session };
}

function sessionIdOr400(id: string | undefined) {
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  return id;
}

/** Same 404 for missing session or wrong owner — avoid existence leaks (bonus security test). */
function ownedSessionMissingResponse() {
  return NextResponse.json(
    apiError('NOT_FOUND', 'Session not found'),
    { status: 404 }
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json(apiError('UNAUTHORIZED', 'Not signed in'), {
      status: 401,
    });
  }

  const sessionId = sessionIdOr400(params.id);
  if (!sessionId) {
    return NextResponse.json(
      apiError('VALIDATION_ERROR', 'Invalid session id'),
      { status: 400 }
    );
  }

  const result = await getOwnedSession(user.id, sessionId);
  if ('error' in result) {
    return ownedSessionMissingResponse();
  }

  return NextResponse.json({ session: result.session });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json(apiError('UNAUTHORIZED', 'Not signed in'), {
      status: 401,
    });
  }

  const sessionId = sessionIdOr400(params.id);
  if (!sessionId) {
    return NextResponse.json(
      apiError('VALIDATION_ERROR', 'Invalid session id'),
      { status: 400 }
    );
  }

  const result = await getOwnedSession(user.id, sessionId);
  if ('error' in result) {
    return ownedSessionMissingResponse();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      apiError('INVALID_JSON', 'Request body must be JSON'),
      { status: 400 }
    );
  }

  const parsed = updateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError('VALIDATION_ERROR', 'Invalid input', parsed.error.flatten()),
      { status: 400 }
    );
  }

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: parsed.data,
  });

  return NextResponse.json({ session: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json(apiError('UNAUTHORIZED', 'Not signed in'), {
      status: 401,
    });
  }

  const sessionId = sessionIdOr400(params.id);
  if (!sessionId) {
    return NextResponse.json(
      apiError('VALIDATION_ERROR', 'Invalid session id'),
      { status: 400 }
    );
  }

  const result = await getOwnedSession(user.id, sessionId);
  if ('error' in result) {
    return ownedSessionMissingResponse();
  }

  await prisma.session.delete({ where: { id: sessionId } });

  return NextResponse.json({ ok: true });
}
