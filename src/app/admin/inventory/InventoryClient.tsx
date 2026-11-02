'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Warehouse, 
  RefreshCw, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertTriangle, 
  Check, 
  X, 
  SlidersHorizontal,
  PackageCheck,
  History
} from 'lucide-react';

interface InventoryClientProps {
  products: any[];
  initialTransactions: any[];
  exchangeStats: {
    totalFilledReleased: number;
    totalEmptyReturned: number;
    totalNewContainersSold: number;
  };
}

export function InventoryClient({
  products: initialProducts,
  initialTransactions,
  exchangeStats,
}: InventoryClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [transactions, setTransactions] = useState(initialTransactions);

  // Modal State
  const [modalType, setModalType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | null>(null);
  const [selectedProductId, setSelectedProductId] = useState(initialProducts[0]?.id || '');
  const [quantity, setQuantity] = useState('10');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openModal = (type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT', pId?: string) => {
    setModalType(type);
    if (pId) setSelectedProductId(pId);
    setQuantity('10');
    setReason(
      type === 'STOCK_IN'
        ? 'Purified water batch production refill'
        : type === 'STOCK_OUT'
        ? 'Defective spigot / damaged container discard'
        : 'Physical cycle count adjustment'
    );
    setErrorMsg('');
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          type: modalType,
          quantity: parseInt(quantity),
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update product stock in state
      setProducts((prev) =>
        prev.map((p) => (p.id === data.product.id ? data.product : p))
      );
      // Prepend transaction log
      setTransactions((prev) => [data.transaction, ...prev]);

      setModalType(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing inventory transaction');
    } finally {
      setLoading(false);
    }
  };

  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  return (
    <div className="space-y-8">
      {/* 1. Gallon Exchange Ledger KPI Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Gallon Reusable Containers Ledger
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Filled Gallons Released
              </span>
              <span className="text-2xl font-black text-slate-900 block mt-0.5">
                {exchangeStats.totalFilledReleased}
              </span>
              <span className="text-[10px] text-slate-500">Delivered to customers</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Empty Gallons Returned
              </span>
              <span className="text-2xl font-black text-emerald-700 block mt-0.5">
                {exchangeStats.totalEmptyReturned}
              </span>
              <span className="text-[10px] text-slate-500">Sanitized & recirculated</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cyan-100 shadow-sm flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
              <Warehouse className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                New Containers Sold
              </span>
              <span className="text-2xl font-black text-cyan-700 block mt-0.5">
                {exchangeStats.totalNewContainersSold}
              </span>
              <span className="text-[10px] text-slate-500">Initial container deposit fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stock Management Action Bar & Current Levels */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Current Stock Levels by Product</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lowStockCount > 0 ? (
                <span className="text-amber-600 font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>{lowStockCount} product(s) below minimum stock alert!</span>
                </span>
              ) : (
                'All inventory levels within safe threshold'
              )}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => openModal('STOCK_IN')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Stock In (Intake)</span>
            </button>
            <button
              onClick={() => openModal('STOCK_OUT')}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center space-x-1.5"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Stock Out (Loss/Discard)</span>
            </button>
            <button
              onClick={() => openModal('ADJUSTMENT')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Audit Adjustment</span>
            </button>
          </div>
        </div>

        {/* Stock Levels Table */}
        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Container Type</th>
                <th className="p-3">Exchange Eligible</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Min Alert</th>
                <th className="p-3">Stock Health</th>
                <th className="p-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const isLow = p.stock <= p.minStockAlert;
                const isCritical = p.stock <= 5;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 text-slate-600">{p.containerType}</td>
                    <td className="p-3">
                      {p.supportsExchange ? (
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Refill Eligible
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Single Purchase</span>
                      )}
                    </td>
                    <td className="p-3 font-black text-slate-900 text-sm">{p.stock} units</td>
                    <td className="p-3 text-slate-400">{p.minStockAlert} units</td>
                    <td className="p-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : isLow
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isCritical ? 'Critical Stock' : isLow ? 'Low Stock' : 'Optimal'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => openModal('STOCK_IN', p.id)}
                        className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px]"
                        title="Stock In"
                      >
                        + Intake
                      </button>
                      <button
                        onClick={() => openModal('ADJUSTMENT', p.id)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px]"
                        title="Audit Adjust"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Transaction History Log */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-800">
          <History className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-bold text-slate-900">Inventory Movement & Audit Log</h2>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Product</th>
                <th className="p-3">Type</th>
                <th className="p-3">Change</th>
                <th className="p-3">Stock Balance</th>
                <th className="p-3">Reason / Details</th>
                <th className="p-3">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 25).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="p-3 text-slate-400 text-[11px]">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 font-bold text-slate-900">{t.product?.name}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.type === 'STOCK_IN' || t.type === 'CONTAINER_RETURN'
                        ? 'bg-emerald-50 text-emerald-700'
                        : t.type === 'ORDER_FULFILLMENT'
                        ? 'bg-sky-50 text-sky-700'
                        : t.type === 'STOCK_OUT'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {t.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold">
                    <span className={t.quantity > 0 ? 'text-emerald-600' : 'text-slate-700'}>
                      {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono">
                    {t.previousStock} → <strong className="text-slate-900">{t.newStock}</strong>
                  </td>
                  <td className="p-3 text-slate-600 max-w-[200px] truncate">{t.reason || '—'}</td>
                  <td className="p-3 text-slate-500">{t.performedBy?.name || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                {modalType === 'STOCK_IN'
                  ? 'Intake / Stock In Product'
                  : modalType === 'STOCK_OUT'
                  ? 'Stock Out / Discard Product'
                  : 'Cycle Count Audit Adjustment'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleTransactionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {modalType === 'ADJUSTMENT' ? 'Audited Physical Stock Count' : 'Quantity Units'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  placeholder="e.g. Batch refilling from purification line #2..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold disabled:opacity-50"
                >
                  {loading ? 'Recording...' : 'Submit Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

