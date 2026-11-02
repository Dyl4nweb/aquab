'use client';

import React, { useState } from 'react';
import { executeSignOut } from '@/lib/logout';
import { 
  Truck, 
  Phone, 
  MapPin, 
  Navigation, 
  Package, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  LogOut, 
  Banknote, 
  Check, 
  X,
  AlertTriangle,
  BookOpen,
  FileText,
  Printer
} from 'lucide-react';
import { OfficialReceiptModal } from '@/components/OfficialReceiptModal';

interface RiderClientProps {
  initialAssignments: any[];
  initialAvailableOrders?: any[];
  rider: any;
}

export function RiderClient({ initialAssignments, initialAvailableOrders = [], rider }: RiderClientProps) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [availableOrders, setAvailableOrders] = useState<any[]>(initialAvailableOrders);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'AVAILABLE' | 'COMPLETED' | 'ALL'>(
    initialAvailableOrders.length > 0 && initialAssignments.length === 0 ? 'AVAILABLE' : 'ACTIVE'
  );

  // Complete Delivery Modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [cashCollected, setCashCollected] = useState('0');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Failed Delivery Modal
  const [failModalOpen, setFailModalOpen] = useState(false);
  const [failureReason, setFailureReason] = useState('');

  // Utang / Pa-lista Modal
  const [utangModalOpen, setUtangModalOpen] = useState(false);
  const [utangNotes, setUtangNotes] = useState('');

  // Official Receipt Modal
  const [receiptOrder, setReceiptOrder] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Claim/Accept an available approved order
  const claimOrder = async (orderId: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/rider/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Add newly claimed assignment to assignments and remove from availableOrders
      setAssignments((prev) => [data.assignment, ...prev]);
      setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
      setActiveTab('ACTIVE');
    } catch (err: any) {
      setErrorMsg(err.message || 'May error sa pagtanggap ng delivery.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (activeTab === 'ACTIVE') {
      return ['ASSIGNED', 'ACCEPTED', 'OUT_FOR_DELIVERY'].includes(a.status);
    }
    if (activeTab === 'COMPLETED') {
      return ['DELIVERED', 'COMPLETED'].includes(a.status);
    }
    return true;
  });

  const activeCount = assignments.filter((a) =>
    ['ASSIGNED', 'ACCEPTED', 'OUT_FOR_DELIVERY'].includes(a.status)
  ).length;

  const completedCount = assignments.filter((a) =>
    ['DELIVERED', 'COMPLETED'].includes(a.status)
  ).length;

  const updateStatus = async (
    assignmentId: string,
    newStatus: string,
    extraData?: any
  ) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/rider/deliveries/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...extraData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update state
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId
            ? { ...a, ...data.assignment, order: { ...a.order, ...data.order } }
            : a
        )
      );

      setCompleteModalOpen(false);
      setFailModalOpen(false);
      setActiveAssignment(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating delivery status');
    } finally {
      setLoading(false);
    }
  };

  const openCompleteDialog = (assignment: any) => {
    setActiveAssignment(assignment);
    const isCOD = assignment.order.paymentMethod === 'CASH_ON_DELIVERY';
    setCashCollected(isCOD ? assignment.order.totalAmount.toString() : '0');
    setDeliveryNotes(
      assignment.order.exchangeGallonsCount > 0
        ? `Collected ${assignment.order.exchangeGallonsCount} empty container(s).`
        : 'Delivered successfully.'
    );
    setErrorMsg('');
    setCompleteModalOpen(true);
  };

  const openFailDialog = (assignment: any) => {
    setActiveAssignment(assignment);
    setFailureReason('Customer did not answer phone / not at home');
    setErrorMsg('');
    setFailModalOpen(true);
  };

  const openUtangDialog = (assignment: any) => {
    setActiveAssignment(assignment);
    setUtangNotes('Walang barya / Sa susunod na order na lang magbabayad');
    setErrorMsg('');
    setUtangModalOpen(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">
      {/* Top Rider Header */}
      <header className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
              Aqua B Delivery App
            </span>
            <h1 className="text-base font-black text-white">{rider.name}</h1>
            <span className="text-[11px] text-slate-400">
              {activeCount} active task{activeCount === 1 ? '' : 's'} assigned
            </span>
          </div>
        </div>

        <button
          onClick={() => executeSignOut('/login')}
          className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-all border border-rose-500/30 flex items-center space-x-1.5 text-xs font-bold shadow-sm"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </header>

      {/* Alert Banner for New Available Orders */}
      {availableOrders.length > 0 && (
        <div
          onClick={() => setActiveTab('AVAILABLE')}
          className="cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-3xl shadow-lg shadow-emerald-600/25 flex items-center justify-between transition-transform hover:scale-[1.01] active:scale-[0.99] border border-emerald-400/40"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black text-lg animate-pulse">
              🔔
            </div>
            <div>
              <strong className="text-sm font-black block leading-tight">
                May {availableOrders.length} Bagong Order na Ready i-Deliver!
              </strong>
              <span className="text-[11px] text-emerald-100 block mt-0.5">
                Inaprubahan na ng Admin. Pindutin para tanggapin.
              </span>
            </div>
          </div>
          <span className="text-xs font-black bg-white text-emerald-800 px-3.5 py-1.5 rounded-xl shadow-sm shrink-0">
            Buksan →
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-slate-200/80 p-1.5 rounded-2xl text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('AVAILABLE')}
          className={`py-2 px-1 rounded-xl transition-all relative ${
            activeTab === 'AVAILABLE'
              ? 'bg-emerald-600 text-white shadow-sm font-black'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <span>Available ({availableOrders.length})</span>
          {availableOrders.length > 0 && activeTab !== 'AVAILABLE' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 animate-ping" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`py-2 px-1 rounded-xl transition-all ${
            activeTab === 'ACTIVE'
              ? 'bg-white text-sky-700 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`py-2 px-1 rounded-xl transition-all ${
            activeTab === 'COMPLETED'
              ? 'bg-white text-sky-700 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Done ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`py-2 px-1 rounded-xl transition-all ${
            activeTab === 'ALL'
              ? 'bg-white text-sky-700 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({assignments.length})
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Delivery Cards List */}
      <div className="space-y-4">
        {activeTab === 'AVAILABLE' ? (
          availableOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Walang Nakapilang Order</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Kapag nag-apruba si Admin ng GCash o may bagong delivery order mula sa customer, agad itong lalabas dito para matanggap mo.
              </p>
            </div>
          ) : (
            availableOrders.map((order) => {
              const isCOD = order.paymentMethod === 'CASH_ON_DELIVERY';
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border-2 border-emerald-500/40 shadow-md p-5 space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    {order.paymentStatus === 'PAID' ? 'GCash Bayad Na' : 'Ready for Delivery'}
                  </div>

                  {/* Header: Order Number & Delivery Slot */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 pr-28">
                    <div>
                      <span className="font-mono text-sm font-black text-sky-700 block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Slot: {order.deliveryTimeSlot || 'Standard Delivery'}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Call / Map Action Buttons */}
                  <div className="space-y-3">
                    <div>
                      <strong className="text-sm font-bold text-slate-900 block">
                        {order.customerName}
                      </strong>
                      <div className="flex items-start space-x-1.5 text-xs text-slate-600 mt-1">
                        <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <span>
                          {order.deliveryAddress} (<strong>{order.barangayName || order.barangay?.name || 'Lingayen'}</strong>)
                        </span>
                      </div>
                      {order.landmarkOrNotes && (
                        <p className="text-[11px] text-slate-500 italic pl-5 mt-0.5">
                          Landmark: {order.landmarkOrNotes}
                        </p>
                      )}
                    </div>

                    {/* Direct Action Buttons for Rider */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Tawagan si Customer</span>
                      </a>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${order.deliveryAddress}, ${order.barangayName || order.barangay?.name || 'Lingayen'}, Pangasinan`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Buksan sa Maps</span>
                      </a>
                    </div>
                  </div>

                  {/* Gallon Exchange Callout */}
                  {order.exchangeGallonsCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center space-x-2 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>KUKUHA NG {order.exchangeGallonsCount} EMPTY GALLON(S)</strong> mula kay customer.
                      </span>
                    </div>
                  )}

                  {/* Items Summary */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Mga Ide-deliver:
                    </span>
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-slate-800">
                        <span>
                          <strong>{item.quantity}x</strong> {item.productName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.isExchange ? 'Refill' : 'Bagong Container'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Breakdown */}
                  <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-100 font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Banknote className="w-4 h-4 text-slate-500" />
                      <span>
                        {isCOD ? (
                          <strong className="text-emerald-700">Cash on Delivery (Kukubra):</strong>
                        ) : (
                          <strong className="text-blue-700">GCash Bayad Na (Aprubado):</strong>
                        )}
                      </span>
                    </div>
                    <span className="text-base font-black text-slate-900">
                      ₱{order.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* GCash Verification Details */}
                  {order.paymentMethod === 'GCASH' && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-2.5 text-xs text-emerald-950 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px]">
                        <strong>GCash Bayad Na (Aprubado ng Admin):</strong> Ref: <strong>{order.gcashReference || 'Inaprubahan'}</strong>. Huwag nang maningil ng pera sa customer.
                      </span>
                    </div>
                  )}

                  {/* Show Receipt Button */}
                  <button
                    type="button"
                    onClick={() => setReceiptOrder(order)}
                    className="w-full py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center space-x-2 border border-sky-200 shadow-sm active:scale-98 transition-all"
                  >
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>Silipin ang Resibo / Image (PNG)</span>
                  </button>

                  {/* CLAIM & START DELIVERY BUTTON */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => claimOrder(order.id)}
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 active:scale-98 transition-all disabled:opacity-50"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{loading ? 'Kinukuha...' : '🚚 Tanggapin at Simulan ang Delivery (On My Way)'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No deliveries in this section</h3>
            <p className="text-xs text-slate-500">
              {activeTab === 'ACTIVE'
                ? "You're all caught up! New orders assigned by station admin will show here."
                : 'No delivery history found.'}
            </p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const order = assignment.order;
            const isCOD = order.paymentMethod === 'CASH_ON_DELIVERY';
            const isDone = ['DELIVERED', 'COMPLETED'].includes(assignment.status);
            const isFailed = assignment.status === 'FAILED';

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4"
              >
                {/* Header: Order Ref & Status */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-sm font-black text-sky-700 block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Slot: {order.deliveryTimeSlot}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    isDone
                      ? order.paymentStatus === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                      : isFailed
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : assignment.status === 'OUT_FOR_DELIVERY'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isDone && order.paymentStatus !== 'PAID'
                      ? 'DELIVERED (UTANG)'
                      : assignment.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Customer & Call / Map Action Buttons */}
                <div className="space-y-3">
                  <div>
                    <strong className="text-sm font-bold text-slate-900 block">
                      {order.customerName}
                    </strong>
                    <div className="flex items-start space-x-1.5 text-xs text-slate-600 mt-1">
                      <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>
                        {order.deliveryAddress} (<strong>{order.barangayName}</strong>)
                      </span>
                    </div>
                    {order.landmarkOrNotes && (
                      <p className="text-[11px] text-slate-500 italic pl-5 mt-0.5">
                        Landmark: {order.landmarkOrNotes}
                      </p>
                    )}
                  </div>

                  {/* Direct Action Buttons for Rider */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Customer</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${order.deliveryAddress}, ${order.barangayName}, Lingayen, Pangasinan`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open Maps</span>
                    </a>
                  </div>
                </div>

                {/* Gallon Exchange Callout */}
                {order.exchangeGallonsCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center space-x-2 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>COLLECT {order.exchangeGallonsCount} EMPTY GALLON(S)</strong> from customer.
                    </span>
                  </div>
                )}

                {/* Items Summary */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Containers to Unload:
                  </span>
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-slate-800">
                      <span>
                        <strong>{item.quantity}x</strong> {item.productName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.isExchange ? 'Refill' : 'New Container'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Payment Breakdown */}
                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-100 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <Banknote className="w-4 h-4 text-slate-500" />
                    <span>
                      {isCOD ? (
                        <strong className="text-emerald-700">Collect Cash (COD):</strong>
                      ) : (
                        <strong className="text-blue-700">Prepaid GCash:</strong>
                      )}
                    </span>
                  </div>
                  <span className="text-base font-black text-slate-900">
                    ₱{order.totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* GCash Payment Approval Status for Rider */}
                {order.paymentMethod === 'GCASH' && (
                  <div>
                    {order.paymentStatus === 'PENDING' ? (
                      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-950 flex items-start space-x-2">
                        <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '4s' }} />
                        <div>
                          <strong>Nakatengga sa Admin Approval:</strong>
                          <span className="block text-[11px] text-amber-900 mt-0.5">
                            GCash Ref: <strong>{order.gcashReference || 'Walang Reference'}</strong>. Bine-verify pa ng Station Admin bago i-mark as bayad.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-2.5 text-xs text-emerald-950 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px]">
                          <strong>GCash Bayad Na (Aprubado):</strong> Ref: <strong>{order.gcashReference}</strong>. Huwag nang maningil ng pera sa customer.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Show Receipt Button for Rider & Customer */}
                <button
                  type="button"
                  onClick={() => setReceiptOrder(order)}
                  className="w-full py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center space-x-2 border border-sky-200 shadow-sm active:scale-98 transition-all"
                >
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Ipakita ang Resibo / Image (PNG)</span>
                </button>

                {/* Rider Status Progression Controls */}
                {!isDone && !isFailed && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    {assignment.status === 'ASSIGNED' && (
                      <button
                        onClick={() => updateStatus(assignment.id, 'ACCEPTED')}
                        disabled={loading}
                        className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-98 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Delivery Task</span>
                      </button>
                    )}

                    {assignment.status === 'ACCEPTED' && (
                      <button
                        onClick={() => updateStatus(assignment.id, 'OUT_FOR_DELIVERY')}
                        disabled={loading}
                        className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-98 transition-all"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Start Delivery (On My Way)</span>
                      </button>
                    )}

                    {/* 3 ACTIONS: PAID, UTANG, FAILED */}
                    {assignment.status === 'OUT_FOR_DELIVERY' && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center">
                          Pumili ng Resulta ng Delivery:
                        </span>

                        <div className="grid grid-cols-3 gap-2">
                          {/* 1. PAID BUTTON */}
                          <button
                            type="button"
                            onClick={() => openCompleteDialog(assignment)}
                            disabled={loading}
                            className="py-3 px-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/30 active:scale-95 flex flex-col items-center justify-center space-y-1 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>PAID (Bayad)</span>
                          </button>

                          {/* 2. UTANG BUTTON */}
                          <button
                            type="button"
                            onClick={() => openUtangDialog(assignment)}
                            disabled={loading}
                            className="py-3 px-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/30 active:scale-95 flex flex-col items-center justify-center space-y-1 transition-all"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>UTANG (Lista)</span>
                          </button>

                          {/* 3. FAILED BUTTON */}
                          <button
                            type="button"
                            onClick={() => openFailDialog(assignment)}
                            disabled={loading}
                            className="py-3 px-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/30 active:scale-95 flex flex-col items-center justify-center space-y-1 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>FAILED</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Complete Delivery Modal */}
      {completeModalOpen && activeAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Confirm Successful Delivery</span>
              </h3>
              <button
                onClick={() => setCompleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Order <strong>{activeAssignment.order.orderNumber}</strong> for{' '}
              <strong>{activeAssignment.order.customerName}</strong>
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStatus(activeAssignment.id, 'DELIVERED', {
                  cashCollected: parseFloat(cashCollected || '0'),
                  deliveryNotes,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Cash Collected Amount (₱)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cashCollected}
                  onChange={(e) => setCashCollected(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Delivery Notes / Proof Confirmation
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  placeholder="e.g. Received by customer, 2 empty gallons collected."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Confirm Delivered'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Utang / Pa-lista Modal */}
      {utangModalOpen && activeAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>Ipa-lista ang Order (Utang)</span>
              </h3>
              <button
                onClick={() => setUtangModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl space-y-1 text-xs text-amber-900">
              <div className="flex justify-between font-bold">
                <span>Kliyente:</span>
                <span className="text-slate-900">{activeAssignment.order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Telepono:</span>
                <span className="font-mono">{activeAssignment.order.customerPhone}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1 border-t border-amber-200 text-amber-950">
                <span>Halagang Ipapa-lista:</span>
                <span>₱{activeAssignment.order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStatus(activeAssignment.id, 'DELIVERED', {
                  isUtang: true,
                  cashCollected: 0,
                  deliveryNotes: utangNotes || 'Walang barya / sa susunod magbabayad',
                });
                setUtangModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pumili ng Mabilisang Tala:
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    'Walang barya si customer / sa susunod magbabayad',
                    'Wala ang may-ari, iniwan sa kapitbahay',
                    'Suki client — pinayagan ng istasyon',
                    'GCash maya-maya raw isesend',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setUtangNotes(preset)}
                      className={`p-2 rounded-xl border text-left text-[11px] transition-all ${
                        utangNotes === preset
                          ? 'border-amber-500 bg-amber-50 font-bold text-amber-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Karagdagang Tala (Optional)
                </label>
                <textarea
                  rows={2}
                  value={utangNotes}
                  onChange={(e) => setUtangNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs"
                  placeholder="Isulat ang detalye kung kailan babayaran..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUtangModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Kanselahin
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black shadow-md shadow-amber-500/30 disabled:opacity-50 flex items-center space-x-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{loading ? 'Nire-record...' : 'I-lista bilang Utang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Failed Delivery Modal */}
      {failModalOpen && activeAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Report Failed Delivery</span>
              </h3>
              <button
                onClick={() => setFailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Why was the delivery for <strong>{activeAssignment.order.customerName}</strong>{' '}
              unsuccessful?
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStatus(activeAssignment.id, 'FAILED', {
                  failureReason,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Failure</label>
                <textarea
                  rows={3}
                  required
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  placeholder="e.g. Unreachable phone number, gate locked, no one home..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFailModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !failureReason.trim()}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-50"
                >
                  Submit Failed Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal for Rider to show / print / save */}
      {receiptOrder && (
        <OfficialReceiptModal
          isOpen={Boolean(receiptOrder)}
          onClose={() => setReceiptOrder(null)}
          order={receiptOrder}
        />
      )}
    </div>
  );
}

