'use client';

import React, { useState } from 'react';
import { 
  Database, 
  HardDrive, 
  Activity, 
  Server, 
  RefreshCw, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Layers, 
  Table as TableIcon,
  Search,
  Clock,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface TableStat {
  tableName: string;
  rowCount: number;
  totalBytes: number;
  totalPretty: string;
  dataBytes: number;
  dataPretty: string;
  indexBytes: number;
  indexPretty: string;
  percentOfTotal: number;
}

interface DatabaseStats {
  databaseName: string;
  sizeBytes: number;
  sizeMB: number;
  sizePretty: string;
  maxStorageMB: number;
  usedPercentage: number;
  remainingMB: number;
  healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  healthMessage: string;
  activeConnections: number;
  latencyMs: number;
  postgresVersion: string;
  tables: TableStat[];
  timestamp: string;
}

const TABLE_DESCRIPTIONS: Record<string, string> = {
  Order: 'Mga orders ng customer (Online delivery & Store pickup)',
  OrderItem: 'Detalye ng bawat produkto at gallon sa order',
  OrderStatusHistory: 'Timeline ng bawat pagbabago ng estado ng delivery',
  Customer: 'Talaan ng mga suki, credit balance, at mga contact',
  User: 'Mga account ng Admin, Super Admin, at Delivery Riders',
  DeliveryAssignment: 'Rider dispatch queue at delivery status history',
  Product: 'Katalogo ng tubig, galon, at accessories',
  ProductCategory: 'Kategorya ng mga paninda sa istasyon',
  InventoryTransaction: 'Audit trail ng refill, stock-in, at stock-out',
  Barangay: 'Mga barangay sa Lingayen at kani-kanilang delivery fees',
  BusinessSetting: 'Mga setting ng istasyon, GCash qr, at business hours',
  AuditLog: 'Security logs ng mga pag-login, pag-edit, at pagbura',
  Payment: 'Rekord ng bayad (Cash on Delivery & GCash)',
  Account: 'NextAuth security provider accounts',
  Session: 'Active user authentication login sessions',
};

export function DatabaseClient({ initialStats }: { initialStats: DatabaseStats | null }) {
  const [stats, setStats] = useState<DatabaseStats | null>(initialStats);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cleanupDays, setCleanupDays] = useState(30);
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch updated real-time stats
  const refreshStats = async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/admin/database/stats');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nabigong kunin ang database stats');
      setStats(data);
      setActionMsg({ type: 'success', text: 'Sariwang database telemetry na-update na!' });
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Error sa pag-refresh ng stats' });
    } finally {
      setLoading(false);
    }
  };

  // Trigger audit logs cleanup
  const handleCleanupLogs = async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/admin/database/cleanup-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysOlderThan: cleanupDays }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCleanupModalOpen(false);
      setActionMsg({ type: 'success', text: data.message });
      refreshStats();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Hindi nagtagumpay ang log cleanup.' });
    } finally {
      setLoading(false);
    }
  };

  // Download DB Backup JSON
  const handleExportBackup = () => {
    window.location.href = '/api/admin/database/export';
  };

  const totalRows = stats?.tables?.reduce((sum, t) => sum + t.rowCount, 0) || 0;
  const filteredTables = (stats?.tables || []).filter((t) =>
    t.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (TABLE_DESCRIPTIONS[t.tableName] || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert Message */}
      {actionMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border transition-all ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMsg.text}</span>
          </div>
          <button
            onClick={() => setActionMsg(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-black ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Storage Capacity Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Background glow decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center font-bold">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 block">
                  PostgreSQL Cloud Capacity ({stats?.databaseName || 'neondb'})
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Database Storage Meter
                </h2>
              </div>
            </div>

            {/* Health Status Pill */}
            <div className="flex items-center space-x-2">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase flex items-center space-x-1.5 border ${
                  stats?.healthStatus === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : stats?.healthStatus === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-ping ${
                    stats?.healthStatus === 'CRITICAL'
                      ? 'bg-rose-400'
                      : stats?.healthStatus === 'WARNING'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>
                  {stats?.healthStatus === 'CRITICAL'
                    ? '🔴 Critical (Mapupuno Na)'
                    : stats?.healthStatus === 'WARNING'
                    ? '🟡 Warning (70%+ Used)'
                    : '🟢 Healthy (Ligtas & Maluwag)'}
                </span>
              </span>
            </div>
          </div>

          {/* Storage Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nagamit na Disk Space:</span>
                <strong className="text-lg font-black text-white font-mono">
                  {stats?.sizePretty || `${stats?.sizeMB || 0} MB`}{' '}
                  <span className="text-xs text-slate-400 font-normal">
                    / {stats?.maxStorageMB ? (stats.maxStorageMB >= 1024 ? `${(stats.maxStorageMB / 1024).toFixed(0)} GB (${stats.maxStorageMB} MB)` : `${stats.maxStorageMB} MB`) : '1 GB (1,024 MB)'}
                  </span>
                </strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Percentage:</span>
                <span className="text-lg font-black text-sky-400 font-mono">
                  {stats?.usedPercentage || 0}%
                </span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-4 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  (stats?.usedPercentage || 0) >= 85
                    ? 'bg-gradient-to-r from-rose-500 to-red-600'
                    : (stats?.usedPercentage || 0) >= 70
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400'
                }`}
                style={{ width: `${Math.max(2, Math.min(100, stats?.usedPercentage || 0))}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
              <span>
                Natitirang Libreng Storage:{' '}
                <strong className="text-emerald-400">
                  {stats?.remainingMB || 500} MB available
                </strong>
              </span>
              <span>
                Engine: <strong className="text-slate-300">{stats?.postgresVersion || 'PostgreSQL 16'}</strong>
              </span>
            </div>
          </div>

          {/* Health description banner */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-slate-300 flex items-start space-x-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>{stats?.healthMessage}</span>
          </div>

          {/* Action buttons header */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-700/60">
            <button
              onClick={refreshStats}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-sky-600/30 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Nire-refresh...' : 'I-refresh ang Telemetry'}</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-1.5 border border-white/15 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-sky-300" />
              <span>I-download ang Backup Snapshot (JSON)</span>
            </button>

            <button
              onClick={() => setCleanupModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs flex items-center space-x-1.5 border border-rose-500/30 active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Maglinis ng Lumang Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Storage */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Database Size</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.sizePretty || '0 kB'}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {stats?.sizeMB ? `${stats.sizeMB} Megabytes` : 'N/A'}
          </span>
        </div>

        {/* Card 2: Active Connections */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Connections</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.activeConnections || 1}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Neon Serverless Connected
          </span>
        </div>

        {/* Card 3: Network Latency / Ping */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cloud Latency</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.latencyMs ? `${stats.latencyMs} ms` : '< 100 ms'}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Direct Cloud Response
          </span>
        </div>

        {/* Card 4: Tables and Rows */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tables & Records</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.tables?.length || 0}{' '}
            <span className="text-xs font-normal text-slate-500">tables</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {totalRows.toLocaleString()} kabuuang rows
          </span>
        </div>
      </div>

      {/* Table Breakdown Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <TableIcon className="w-4 h-4 text-sky-600" />
              <span>Table Storage & Row Counts</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detalyadong sukat ng bawat modelo, data size, at index sa loob ng PostgreSQL database.
            </p>
          </div>

          {/* Search Table */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Hanapin ang table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Pangalan ng Table</th>
                <th className="pb-3 text-right">Bilang ng Rows</th>
                <th className="pb-3 text-right">Data Size</th>
                <th className="pb-3 text-right">Index Size</th>
                <th className="pb-3 text-right">Kabuuang Sukat</th>
                <th className="pb-3 text-right pr-2">% ng Storage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTables.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Walang table na tumugma sa &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredTables.map((t) => {
                  const desc = TABLE_DESCRIPTIONS[t.tableName];
                  return (
                    <tr key={t.tableName} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="font-mono font-black text-slate-900 text-sm">
                          {t.tableName}
                        </div>
                        {desc && (
                          <span className="text-[11px] text-slate-500 block leading-tight">
                            {desc}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-700">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                          {t.rowCount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-600">
                        {t.dataPretty}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-500 text-[11px]">
                        {t.indexPretty}
                      </td>
                      <td className="py-3 text-right font-mono font-black text-sky-700">
                        {t.totalPretty}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <div className="flex items-center justify-end space-x-1.5 font-mono text-[11px] text-slate-600">
                          <span>{t.percentOfTotal.toFixed(1)}%</span>
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-500 rounded-full"
                              style={{ width: `${Math.min(100, t.percentOfTotal)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Super Admin Storage Guidance & Optimization Tips */}
      <div className="bg-sky-50/70 rounded-3xl border border-sky-200 p-6 space-y-3">
        <div className="flex items-center space-x-2 font-bold text-sky-950">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span className="text-sm">Mga Paalala at Gabay sa Database Storage (Super Admin)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-sky-900/90 pt-1">
          <div className="p-3 bg-white/80 rounded-2xl border border-sky-100 space-y-1">
            <strong className="block text-slate-900 font-bold">1. 1 GB Free Tier Storage</strong>
            <p className="text-[11px] text-slate-600">
              Kasalukuyang may 1 GB (1,024 MB) libreng storage sa Neon PostgreSQL Cloud. Sa bulto ng inyong station, aabutin ito ng daan-daang libong orders bago mapuno.
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-2xl border border-sky-100 space-y-1">
            <strong className="block text-slate-900 font-bold">2. Audit Logs Cleanup</strong>
            <p className="text-[11px] text-slate-600">
              Kung magsisimulang lumaki ang storage, gamitin ang &quot;Maglinis ng Lumang Logs&quot; button para awtomatikong tanggalin ang lumang audit history na higit 30 o 60 araw na.
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-2xl border border-sky-100 space-y-1">
            <strong className="block text-slate-900 font-bold">3. Regular Backup</strong>
            <p className="text-[11px] text-slate-600">
              Mag-download ng backup JSON snapshot buwan-buwan bago mag-bura ng anumang lumang rekord para may kopya ka palagi ng order at customer history.
            </p>
          </div>
        </div>
      </div>

      {/* Log Cleanup Confirmation Modal */}
      {cleanupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Linisin ang Lumang Audit Logs</span>
              </h3>
              <button
                onClick={() => setCleanupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Ang Audit Logs ay nagtatala ng mga aksyon sa system. Ang pagbura sa mga lumang logs ay **hindi makakaapekto sa inyong mga Orders, Customers, o Produkto**.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Piliin ang edad ng logs na buburahin:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[30, 60, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setCleanupDays(days)}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                      cleanupDays === days
                        ? 'border-sky-600 bg-sky-50 text-sky-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Higit {days} Araw
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[11px] text-amber-900 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Paalala: Hindi na maibabalik ang mga mabuburang audit logs matapos kumpirmahin.
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCleanupModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Kanselahin
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleCleanupLogs}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{loading ? 'Naglilinis...' : 'Kumpirmahin at Linisin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

