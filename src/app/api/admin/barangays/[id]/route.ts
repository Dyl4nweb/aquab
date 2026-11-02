import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.deliveryFee !== undefined) updateData.deliveryFee = parseFloat(body.deliveryFee);
    if (body.estimatedDeliveryMinutes !== undefined)
      updateData.estimatedDeliveryMinutes = parseInt(body.estimatedDeliveryMinutes);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const updated = await prisma.barangay.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, barangay: updated });
  } catch (error: any) {
    console.error('Update barangay error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update barangay' },
      { status: 500 }
    );
  }
}

