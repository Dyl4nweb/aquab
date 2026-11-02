import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const { name, municipality, deliveryFee, estimatedDeliveryMinutes } = await req.json();

    if (!name || deliveryFee === undefined) {
      return NextResponse.json(
        { error: 'Barangay name and delivery fee are required' },
        { status: 400 }
      );
    }

    const barangay = await prisma.barangay.create({
      data: {
        name: name.trim(),
        municipality: municipality || 'Lingayen, Pangasinan',
        deliveryFee: parseFloat(deliveryFee),
        estimatedDeliveryMinutes: parseInt(estimatedDeliveryMinutes || 45),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, barangay });
  } catch (error: any) {
    console.error('Create barangay error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create barangay' },
      { status: 500 }
    );
  }
}

