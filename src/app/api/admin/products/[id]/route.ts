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
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.waterType !== undefined) updateData.waterType = body.waterType;
    if (body.containerType !== undefined) updateData.containerType = body.containerType;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.supportsExchange !== undefined) updateData.supportsExchange = Boolean(body.supportsExchange);
    if (body.newContainerFee !== undefined) updateData.newContainerFee = parseFloat(body.newContainerFee);
    if (body.minStockAlert !== undefined) updateData.minStockAlert = parseInt(body.minStockAlert);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

