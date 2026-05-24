import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find or create user
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name || 'Engineer',
      image: session.user.image || '',
      xp: 0,
      completedLevels: '[]'
    },
  });

  let parsedLevels = [];
  try {
    parsedLevels = user.completedLevels ? JSON.parse(user.completedLevels) : [];
  } catch (e) {
    console.error("Failed to parse completedLevels:", e);
  }

  return NextResponse.json({
    xp: user.xp || 0,
    completedLevels: parsedLevels
  });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { xp, completedLevels } = await req.json();

  const updatedUser = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {
      xp,
      completedLevels: JSON.stringify(completedLevels)
    },
    create: {
      email: session.user.email,
      name: session.user.name || 'Engineer',
      image: session.user.image || '',
      xp,
      completedLevels: JSON.stringify(completedLevels)
    }
  });

  return NextResponse.json({ success: true });
}
