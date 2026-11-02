import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, displayOrder } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const category = await prisma.productCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        displayOrder: parseInt(displayOrder || 0),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}

