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

    if ((session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    const { daysOlderThan = 30 } = await req.json();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(daysOlderThan));

    // Delete older audit logs
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    // Create record of cleanup in audit logs
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'DATABASE_CLEANUP',
        entityType: 'AuditLog',
        details: `Deleted ${result.count} audit log records older than ${daysOlderThan} days to optimize database storage.`,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Matagumpay na natanggal ang ${result.count} lumang audit logs (> ${daysOlderThan} araw).`,
    });
  } catch (error: any) {
    console.error('Error cleaning up audit logs:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to cleanup audit logs' },
      { status: 500 }
    );
  }
}

