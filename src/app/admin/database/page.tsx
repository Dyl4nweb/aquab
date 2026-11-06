import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DatabaseClient } from './DatabaseClient';

export const revalidate = 0;

export default async function AdminDatabasePage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
    redirect('/admin');
  }

  let initialStats: any = null;

  try {
    const start = Date.now();
    const dbSizeRes: any = await prisma.$queryRaw`
      SELECT
        current_database() AS database_name,
        pg_database_size(current_database())::text AS size_bytes,
        pg_size_pretty(pg_database_size(current_database())) AS size_pretty;
    `;
    const latencyMs = Date.now() - start;

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

    const connRes: any = await prisma.$queryRaw`
      SELECT count(*)::int AS active_connections FROM pg_stat_activity WHERE datname = current_database();
    `;

    const versionRes: any = await prisma.$queryRaw`
      SELECT version();
    `;

    const dbInfo = dbSizeRes[0] || {};
    const sizeBytes = Number(dbInfo.size_bytes || 0);
    const sizeMB = sizeBytes / (1024 * 1024);
    const maxStorageMB = 1024; // 1 GB Neon Free Limit
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

    initialStats = {
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
      tables: formattedTables,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('Error fetching initial DB stats:', err);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-300">
            Super Admin Only
          </span>
          <span className="text-xs text-slate-400">PostgreSQL Cloud Telemetry</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">Database & Storage Monitor</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time PostgreSQL disk capacity, table row counts, live connections, at storage health monitor para sa Aqua B station.
        </p>
      </div>

      <DatabaseClient initialStats={initialStats} />
    </div>
  );
}

