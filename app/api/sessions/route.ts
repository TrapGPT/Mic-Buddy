import { NextRequest, NextResponse } from 'next/server';

import { getOrCreateUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiError } from '@/shared/schemas/error';
import { createSessionSchema } from '@/shared/schemas/session';

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json(apiError('UNAUTHORIZED', 'Not signed in'), {
      status: 401,
    });
  }

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

  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json(apiError('UNAUTHORIZED', 'Not signed in'), {
      status: 401,
    });
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

  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError('VALIDATION_ERROR', 'Invalid input', parsed.error.flatten()),
      { status: 400 }
    );
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
    },
  });

  return NextResponse.json({ session }, { status: 201 });
}
