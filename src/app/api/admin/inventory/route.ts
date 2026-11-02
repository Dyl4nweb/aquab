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

    const { productId, type, quantity, reason } = await req.json();

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID, Transaction Type, and Quantity are required' },
        { status: 400 }
      );
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive integer' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const previousStock = product.stock;
    let newStock = previousStock;

    if (type === 'STOCK_IN' || type === 'CONTAINER_RETURN') {
      newStock = previousStock + qty;
    } else if (type === 'STOCK_OUT') {
      if (previousStock < qty) {
        return NextResponse.json(
          { error: `Cannot stock out more than current stock (${previousStock})` },
          { status: 400 }
        );
      }
      newStock = previousStock - qty;
    } else if (type === 'ADJUSTMENT') {
      // For adjustment, quantity represents the audited physical stock
      newStock = qty;
    }

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      const txRecord = await tx.inventoryTransaction.create({
        data: {
          productId,
          type,
          quantity: type === 'ADJUSTMENT' ? (newStock - previousStock) : (type === 'STOCK_OUT' ? -qty : qty),
          previousStock,
          newStock,
          reason: reason || `Manual ${type} by ${(session.user as any)?.name || 'Admin'}`,
          performedById: (session.user as any).id,
        },
        include: {
          product: true,
          performedBy: {
            select: { name: true },
          },
        },
      });

      return { product: updatedProduct, transaction: txRecord };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Inventory transaction error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update inventory' },
      { status: 500 }
    );
  }
}

