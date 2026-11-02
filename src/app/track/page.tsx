'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Phone, 
  User, 
  RefreshCw, 
  XCircle,
  HelpCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { OfficialReceiptModal } from '@/components/OfficialReceiptModal';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(initialRef);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [receiptOpen, setReceiptOpen] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim() || !customerPhone.trim()) {
      setError('Please provide both Order Reference Number and Phone Number.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, customerPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to locate order');
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef && initialPhone) {
      handleSearch();
    }
  }, [initialRef, initialPhone]);

  // Order status progression steps
  const deliveryStatusSteps = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY_FOR_DELIVERY', label: 'Ready' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'COMPLETED') return 5;
    if (status === 'ASSIGNED') return 3;
    const idx = deliveryStatusSteps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Public Order Tracking
        </span>
        <h1 className="text-3xl font-black text-slate-900">Track Your Water Delivery</h1>
        <p className="text-xs text-slate-500">
          Enter your Order Reference Number (e.g., AQB-20261031-1001) and the mobile number you used during checkout.
        </p>
      </div>

      {/* Search Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-md">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Order Reference Number
              </label>
              <div className="relative">
                <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. AQB-20261031-1001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0917 555 1234"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Locating Order...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Order</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* TRACKING RESULTS VIEW */}
      {order && (
        <div className="bg-white rounded-3xl border border-sky-100 shadow-xl overflow-hidden divide-y divide-slate-100 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-sky-600 to-cyan-600 p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200 block">
                Order Tracking Details
              </span>
              <h2 className="text-2xl font-black font-mono tracking-wider">{order.orderNumber}</h2>
              <span className="text-xs text-sky-100 mt-1 block">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col sm:items-end gap-2 text-left sm:text-right">
              <div>
                <span className="text-xs uppercase font-bold text-sky-200 block">Status:</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase mt-1 ${
                  order.status === 'DELIVERED' || order.status === 'COMPLETED'
                    ? 'bg-emerald-500 text-white'
                    : order.status === 'CANCELLED' || order.status === 'FAILED_DELIVERY'
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-sky-700'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                onClick={() => setReceiptOpen(true)}
                className="mt-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 backdrop-blur-sm border border-white/30 shadow-sm transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tingnan ang Resibo</span>
              </button>
            </div>
          </div>

          {/* GCash Pending Approval Notice */}
          {order.paymentMethod === 'GCASH' && order.paymentStatus === 'PENDING' && (
            <div className="bg-sky-50 border-b border-sky-200 p-4 text-xs text-sky-900 flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '4s' }} />
              <div>
                <strong className="block font-bold">Nakatengga sa Admin Approval ang inyong GCash Payment:</strong>
                <span>
                  GCash Reference No. <strong>{order.gcashReference}</strong>. Mano-manong iva-validate at a-aprubahan ito ng Aqua B Admin o Super Admin bago i-dispatch sa rider para maihatid.
                </span>
              </div>
            </div>
          )}

          {/* Stepper Timeline (if not cancelled) */}
          {order.status !== 'CANCELLED' && order.status !== 'FAILED_DELIVERY' ? (
            <div className="p-6 sm:p-8 bg-sky-50/40">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                Delivery Progress
              </h3>
              <div className="relative">
                <div className="grid grid-cols-6 gap-2">
                  {deliveryStatusSteps.map((step, idx) => {
                    const currentIdx = getStepIndex(order.status);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-200 text-slate-500'
                          } ${isCurrent ? 'ring-4 ring-emerald-200 scale-110' : ''}`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold mt-2 ${
                            isCurrent ? 'text-emerald-700 font-black' : isDone ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-rose-50 text-rose-800 text-xs flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <strong className="block text-sm font-bold">This order has been {order.status.toLowerCase().replace('_', ' ')}</strong>
                <span>Reason: {order.cancellationReason || 'Please contact station hotline for inquiries.'}</span>
              </div>
            </div>
          )}

          {/* Assigned Rider Contact (if assigned/out for delivery) */}
          {order.rider && (
            <div className="p-6 bg-emerald-50/60 flex items-center justify-between border-y border-emerald-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Assigned Delivery Rider
                  </span>
                  <strong className="text-slate-900 text-sm block">{order.rider.name}</strong>
                  <span className="text-xs text-slate-500">Contact: {order.rider.phone || '09191234567'}</span>
                </div>
              </div>
              {order.rider.phone && (
                <a
                  href={`tel:${order.rider.phone}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center space-x-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </a>
              )}
            </div>
          )}

          {/* Order Details & Items */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block font-medium">Customer:</span>
                <span className="font-bold text-slate-900">{order.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Delivery Destination:</span>
                <span className="font-bold text-slate-900">
                  {order.deliveryMethod === 'DELIVERY' ? `${order.deliveryAddress} (${order.barangayName})` : 'Store Pickup at Station'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Delivery Date & Window:</span>
                <span className="font-bold text-slate-900">{order.deliveryDate} ({order.deliveryTimeSlot})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Payment Status:</span>
                <span className="font-bold text-slate-900">
                  {order.paymentMethod} — {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Empty Containers Reminder */}
            {order.exchangeGallonsCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Please prepare <strong>{order.exchangeGallonsCount} empty container(s)</strong> to hand over to the delivery rider.
                </span>
              </div>
            )}

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Ordered Products
              </span>
              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden text-xs">
                {order.items.map((item: any) => (
                  <div key={item.id} className="p-3.5 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-900">{item.quantity}x {item.productName}</strong>
                      <div className="text-[11px] text-slate-500">
                        {item.waterType} • {item.capacity} {item.isExchange ? '(Refill)' : '(New Container)'}
                      </div>
                    </div>
                    <span className="font-black text-slate-900">₱{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-2 flex justify-between items-center text-sm font-black border-t border-slate-100">
              <span className="text-slate-600">Total Order Amount:</span>
              <span className="text-sky-700 text-lg">₱{order.totalAmount.toFixed(2)}</span>
            </div>

            {/* Status History Logs */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Status History Timeline
                </h4>
                <div className="space-y-3">
                  {order.statusHistory.map((h: any, i: number) => (
                    <div key={i} className="flex items-start space-x-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <span className="font-bold text-slate-800">{h.status.replace(/_/g, ' ')}</span>
                        {h.notes && <p className="text-slate-500 text-[11px]">{h.notes}</p>}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {order && (
        <OfficialReceiptModal
          isOpen={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          order={order}
        />
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}

