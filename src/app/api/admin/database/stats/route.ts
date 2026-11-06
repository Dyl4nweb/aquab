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

    const start = Date.now();

    // 1. Fetch total database size from PostgreSQL
    const dbSizeRes: any = await prisma.$queryRaw`
      SELECT
        current_database() AS database_name,
        pg_database_size(current_database())::text AS size_bytes,
        pg_size_pretty(pg_database_size(current_database())) AS size_pretty;
    `;

    const latencyMs = Date.now() - start;

    // 2. Fetch table breakdown
    const tablesRes: any = await prisma.$queryRaw`
      SELECT
        c.relname AS table_name,
        s.n_live_tup::int AS row_count,
        pg_total_relation_size(c.oid)::text AS total_bytes,
        pg_size_pretty(pg_total_relation_size(c.oid)) AS total_pretty,
        pg_relation_size(c.oid)::text AS data_bytes,
        pg_size_pretty(pg_relation_size(c.oid)) AS data_pretty,
        (pg_total_relation_size(c.oid) - pg_relation_size(c.oid))::text AS index_bytes,
        pg_size_pretty(pg_total_relation_size(c.oid) - pg_relation_size(c.oid)) AS index_pretty
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_stat_user_tables s ON s.relid = c.oid
      WHERE n.nspname = 'public' AND c.relkind = 'r'
      ORDER BY pg_total_relation_size(c.oid) DESC;
    `;

    // 3. Active connections
    const connRes: any = await prisma.$queryRaw`
      SELECT count(*)::int AS active_connections FROM pg_stat_activity WHERE datname = current_database();
    `;

    // 4. PostgreSQL version
    const versionRes: any = await prisma.$queryRaw`
      SELECT version();
    `;

    const dbInfo = dbSizeRes[0] || {};
    const sizeBytes = Number(dbInfo.size_bytes || 0);
    const sizeMB = sizeBytes / (1024 * 1024);

    // Neon Free Tier storage limit: 1 GB (1,024 MB)
    const maxStorageMB = 1024;
    const usedPercentage = Math.min(100, Math.max(0, (sizeMB / maxStorageMB) * 100));
    const remainingMB = Math.max(0, maxStorageMB - sizeMB);

    let healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    let healthMessage = 'Ligtas at maluwag pa ang database storage. Malayo pa bago mapuno.';

    if (usedPercentage >= 85) {
      healthStatus = 'CRITICAL';
      healthMessage = 'Kritikal! Lampas 85% na ang nagamit na storage. Magbawas ng lumang logs o mag-upgrade ng Neon database plan.';
    } else if (usedPercentage >= 70) {
      healthStatus = 'WARNING';
      healthMessage = 'Babala: Mahigit 70% na ang storage. Bantayan ang database at linisin ang mga hindi kailangang audit logs.';
    }

    const formattedTables = (tablesRes || []).map((t: any) => {
      const bytes = Number(t.total_bytes || 0);
      return {
        tableName: t.table_name,
        rowCount: Number(t.row_count || 0),
        totalBytes: bytes,
        totalPretty: t.total_pretty,
        dataBytes: Number(t.data_bytes || 0),
        dataPretty: t.data_pretty,
        indexBytes: Number(t.index_bytes || 0),
        indexPretty: t.index_pretty,
        percentOfTotal: sizeBytes > 0 ? (bytes / sizeBytes) * 100 : 0,
      };
    });

    return NextResponse.json({
      success: true,
      databaseName: dbInfo.database_name || 'neondb',
      sizeBytes,
      sizeMB: Number(sizeMB.toFixed(2)),
      sizePretty: dbInfo.size_pretty || `${sizeMB.toFixed(2)} MB`,
      maxStorageMB,
      usedPercentage: Number(usedPercentage.toFixed(2)),
      remainingMB: Number(remainingMB.toFixed(2)),
      healthStatus,
      healthMessage,
      activeConnections: connRes[0]?.active_connections || 1,
      latencyMs,
      postgresVersion: versionRes[0]?.version?.split(' ')?.[0] || 'PostgreSQL 16',
      fullVersion: versionRes[0]?.version || '',
      tables: formattedTables,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching database storage stats:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve database storage stats' },
      { status: 500 }
    );
  }
}

