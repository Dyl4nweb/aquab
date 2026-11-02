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

    const body = await req.json();
    const {
      name,
      categoryId,
      waterType,
      containerType,
      capacity,
      price,
      supportsExchange,
      newContainerFee,
      stock,
      minStockAlert,
      description,
      imageUrl,
      isFeatured,
    } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: 'Name, Category, and Price are required' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        waterType: waterType || 'Purified Water',
        containerType: containerType || 'Round Gallon',
        capacity: capacity || '18.9L (5 Gallons)',
        price: parseFloat(price),
        supportsExchange: Boolean(supportsExchange),
        newContainerFee: parseFloat(newContainerFee || 0),
        stock: parseInt(stock || 0),
        minStockAlert: parseInt(minStockAlert || 10),
        description: description || null,
        imageUrl: imageUrl || '/images/products/round-gallon.png',
        isFeatured: Boolean(isFeatured),
        isActive: true,
      },
      include: { category: true },
    });

    // Record initial inventory transaction if stock > 0
    if (product.stock > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          productId: product.id,
          type: 'STOCK_IN',
          quantity: product.stock,
          previousStock: 0,
          newStock: product.stock,
          reason: 'Initial product creation intake',
          performedById: (session.user as any).id,
        },
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

