import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if ((session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    // Export core station data for backup
    const [
      orders,
      customers,
      products,
      categories,
      barangays,
      settings,
      inventoryTx,
    ] = await Promise.all([
      prisma.order.findMany({
        take: 500,
        orderBy: { createdAt: 'desc' },
        include: { items: true, assignments: true },
      }),
      prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.productCategory.findMany(),
      prisma.barangay.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.businessSetting.findFirst({ where: { id: 'default' } }),
      prisma.inventoryTransaction.findMany({
        take: 200,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const backupData = {
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.name,
      station: 'Aqua B - Pangapisan, Lingayen, Pangasinan',
      counts: {
        orders: orders.length,
        customers: customers.length,
        products: products.length,
        categories: categories.length,
        barangays: barangays.length,
        inventoryTransactions: inventoryTx.length,
      },
      data: {
        settings,
        barangays,
        categories,
        products,
        customers,
        orders,
        inventoryTransactions: inventoryTx,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const filename = `aquab_db_backup_${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating database export:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate database export' },
      { status: 500 }
    );
  }
}
