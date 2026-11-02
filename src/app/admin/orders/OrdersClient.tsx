'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  RefreshCw, 
  Package, 
  Phone, 
  MapPin, 
  XCircle,
  CheckCircle2,
  Calendar,
  FileText,
  Printer,
  ShieldCheck
} from 'lucide-react';
import { OfficialReceiptModal } from '@/components/OfficialReceiptModal';

interface OrdersClientProps {
  initialOrders: any[];
  riders: { id: string; name: string; phone: string | null }[];
  initialRef?: string;
  initialStatus?: string;
}

export function OrdersClient({
  initialOrders,
  riders,
  initialRef,
  initialStatus,
}: OrdersClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>(initialRef || '');
  const [activeOrder, setActiveOrder] = useState<any>(
    initialRef ? initialOrders.find((o) => o.orderNumber === initialRef) || null : null
  );

  const [loadingAction, setLoadingAction] = useState(false);
  const [actionError, setActionError] = useState('');
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [receiptOrder, setReceiptOrder] = useState<any>(null);

  // Status Filter Tabs
  const statusTabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY_FOR_DELIVERY', label: 'Ready' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (selectedStatus !== 'ALL' && o.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchRef = o.orderNumber.toLowerCase().includes(q);
        const matchName = o.customerName.toLowerCase().includes(q);
        const matchPhone = o.customerPhone.toLowerCase().includes(q);
        const matchBarangay = o.barangayName?.toLowerCase().includes(q);
        if (!matchRef && !matchName && !matchPhone && !matchBarangay) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    notes?: string,
    riderId?: string,
    cancellationReason?: string
  ) => {
    setLoadingAction(true);
    setActionError('');

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes,
          riderId,
          cancellationReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');

      // Update state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
      );
      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder({ ...activeOrder, ...data.order });
      }

      setCancelModalOpen(false);
      setCancelReason('');
    } catch (err: any) {
      setActionError(err.message || 'Error executing action');
    } finally {
      setLoadingAction(false);
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string, riderId?: string) => {
    setLoadingAction(true);
    try {
      const payload: any = {
        paymentStatus,
        notes: `GCash Payment ${paymentStatus === 'PAID' ? 'Verified & Approved' : 'Rejected'} by Admin`,
      };

      // Automatically transition order to READY_FOR_DELIVERY so it immediately enters Rider queue
      if (paymentStatus === 'PAID') {
        payload.status = 'READY_FOR_DELIVERY';
      }

      // If a rider was chosen, assign the order directly
      if (riderId) {
        payload.riderId = riderId;
        payload.status = 'ASSIGNED';
      }

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
      );
      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder({ ...activeOrder, ...data.order });
      }
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Status Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order #, Customer Name, Mobile Phone, or Barangay..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {statusTabs.map((tab) => {
            const count =
              tab.key === 'ALL'
                ? orders.length
                : orders.filter((o) => o.status === tab.key).length;

            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedStatus === tab.key
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Method & Area</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-sky-700">
                        {order.orderNumber}
                      </td>
                      <td className="p-4">
                        <strong className="text-slate-900 block">{order.customerName}</strong>
                        <span className="text-[10px] text-slate-400">{order.customerPhone}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">
                          {order.deliveryMethod === 'DELIVERY' ? order.barangayName : 'Store Pickup'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">
                          {order.deliveryAddress}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        <span className="block font-medium">{order.deliveryDate}</span>
                        <span className="text-[10px] text-slate-400">{order.deliveryTimeSlot}</span>
                      </td>
                      <td className="p-4">
                        <span className="block font-bold text-slate-800">
                          {order.paymentMethod === 'GCASH' ? 'GCash' : 'COD'}
                        </span>
                        {order.paymentMethod === 'GCASH' && order.paymentStatus === 'PENDING' ? (
                          <div className="space-y-1 mt-0.5">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                              For Approval (Ref: {order.gcashReference || 'N/A'})
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updatePaymentStatus(order.id, 'PAID');
                              }}
                              disabled={loadingAction}
                              className="block text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded shadow-sm transition-transform active:scale-95"
                            >
                              Aprubahan
                            </button>
                          </div>
                        ) : (
                          <span className={`text-[10px] font-bold ${
                            order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {order.paymentStatus} {order.paymentMethod === 'GCASH' && order.gcashReference ? `(Ref: ${order.gcashReference})` : ''}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-black text-slate-900 text-sm">
                        ₱{order.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'DELIVERED' || order.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : order.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : order.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => setReceiptOrder(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors inline-flex items-center space-x-1"
                          title="Tingnan at i-print ang opisyal na resibo"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Resibo</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveOrder(order);
                            setSelectedRiderId(order.assignments?.[0]?.riderId || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition-colors inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL / DRAWER */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fadeIn flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-lg font-black text-slate-900">
                    {activeOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Placed on {new Date(activeOrder.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setReceiptOrder(activeOrder)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resibo (Print/PNG)</span>
                </button>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {actionError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Quick Status Bar & Quick Actions */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">
                    Current Status:
                  </span>
                  <span className="text-sm font-black text-slate-900 uppercase">
                    {activeOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Status Transition Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {activeOrder.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() =>
                          updateOrderStatus(activeOrder.id, 'CONFIRMED', 'Order confirmed by Admin')
                        }
                        disabled={loadingAction}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Order</span>
                      </button>
                      <button
                        onClick={() => setCancelModalOpen(true)}
                        disabled={loadingAction}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200"
                      >
                        Reject / Cancel
                      </button>
                    </>
                  )}

                  {activeOrder.status === 'CONFIRMED' && (
                    <button
                      onClick={() =>
                        updateOrderStatus(activeOrder.id, 'PREPARING', 'Sanitizing & filling containers')
                      }
                      disabled={loadingAction}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center space-x-1"
                    >
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {activeOrder.status === 'PREPARING' && (
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          activeOrder.id,
                          'READY_FOR_DELIVERY',
                          'Gallons sealed and ready for dispatch/pickup'
                        )
                      }
                      disabled={loadingAction}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center space-x-1"
                    >
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {activeOrder.deliveryMethod === 'PICKUP' &&
                    activeOrder.status === 'READY_FOR_DELIVERY' && (
                      <button
                        onClick={() =>
                          updateOrderStatus(activeOrder.id, 'COMPLETED', 'Customer picked up at station')
                        }
                        disabled={loadingAction}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete Store Pickup</span>
                      </button>
                    )}

                  {activeOrder.status !== 'CANCELLED' && activeOrder.status !== 'COMPLETED' && (
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      disabled={loadingAction}
                      className="px-2.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* GCash Payment Verification Card (Admin & Super Admin) */}
              {activeOrder.paymentMethod === 'GCASH' && (
                <div className={`p-4 rounded-2xl border ${
                  activeOrder.paymentStatus === 'PAID'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/90 border-amber-300 text-amber-950'
                } space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold">
                      <CreditCard className={`w-4 h-4 ${activeOrder.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`} />
                      <span className="text-sm">GCash Express Payment Verification</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      activeOrder.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {activeOrder.paymentStatus === 'PAID' ? 'BAYAD NA (PAID)' : 'FOR ADMIN APPROVAL'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/80 p-3 rounded-xl border border-amber-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Customer GCash Reference No.:</span>
                      <strong className="font-mono text-sm text-sky-800 block">
                        {activeOrder.gcashReference || 'Walang Reference Number'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Halagang Dapat I-send:</span>
                      <strong className="text-sm text-slate-900 block">
                        ₱{activeOrder.totalAmount.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {activeOrder.paymentStatus !== 'PAID' ? (
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => updatePaymentStatus(activeOrder.id, 'PAID', selectedRiderId || undefined)}
                        disabled={loadingAction}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aprubahan at Ipasok sa Rider Queue</span>
                      </button>

                      <button
                        onClick={() => updatePaymentStatus(activeOrder.id, 'FAILED')}
                        disabled={loadingAction}
                        className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
                      >
                        Mali ang Reference / Tanggihan
                      </button>

                      <span className="text-[11px] text-amber-800 italic block w-full mt-1">
                        * Kusa itong lalabas agad sa Rider App kapag na-aprubahan na ang bayad.
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Na-verify at aprubado na ng Admin ang bayad. Pwede nang ipa-deliver sa rider.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Rider Assignment Box (for Home Delivery) */}
              {activeOrder.deliveryMethod === 'DELIVERY' && activeOrder.status !== 'CANCELLED' && (
                <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-sky-900">
                    <Truck className="w-4 h-4 text-sky-600" />
                    <span>Delivery Rider Assignment</span>
                  </div>

                  {/* GCash Unapproved Warning */}
                  {activeOrder.paymentMethod === 'GCASH' && activeOrder.paymentStatus !== 'PAID' && (
                    <div className="bg-amber-100/80 border border-amber-300 rounded-xl p-2.5 text-[11px] text-amber-950 flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Paalala:</strong> Hindi pa aprubado ang GCash payment (Ref: {activeOrder.gcashReference || 'N/A'}). I-apruba muna ito bago i-dispatch sa rider para maiwasan ang uncollected deliveries.
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <select
                      value={selectedRiderId}
                      onChange={(e) => setSelectedRiderId(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none"
                    >
                      <option value="">-- Select Rider to Assign --</option>
                      {riders.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.phone || 'No phone'})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        if (!selectedRiderId) return;
                        updateOrderStatus(
                          activeOrder.id,
                          'ASSIGNED',
                          `Assigned to rider`,
                          selectedRiderId
                        );
                      }}
                      disabled={!selectedRiderId || loadingAction}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold disabled:opacity-50"
                    >
                      Assign Rider
                    </button>

                    {activeOrder.status === 'ASSIGNED' && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            activeOrder.id,
                            'OUT_FOR_DELIVERY',
                            'Rider departed station'
                          )
                        }
                        disabled={loadingAction}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                      >
                        Dispatch (Out for Delivery)
                      </button>
                    )}
                  </div>

                  {activeOrder.assignments?.[0]?.rider && (
                    <div className="text-[11px] text-sky-800">
                      Currently assigned to: <strong>{activeOrder.assignments[0].rider.name}</strong> ({activeOrder.assignments[0].rider.phone})
                    </div>
                  )}
                </div>
              )}

              {/* Customer and Location Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Customer Name:</span>
                  <strong className="text-slate-900 text-sm block">{activeOrder.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Contact Number:</span>
                  <strong className="text-slate-900 text-sm block">{activeOrder.customerPhone}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block font-medium">Delivery Destination:</span>
                  <span className="text-slate-800 font-semibold">
                    {activeOrder.deliveryMethod === 'DELIVERY'
                      ? `${activeOrder.deliveryAddress} (${activeOrder.barangayName})`
                      : 'Store Pickup'}
                  </span>
                  {activeOrder.landmarkOrNotes && (
                    <p className="text-slate-500 italic mt-0.5">Instructions: {activeOrder.landmarkOrNotes}</p>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Preferred Schedule:</span>
                  <span className="text-slate-900 font-bold">{activeOrder.deliveryDate} ({activeOrder.deliveryTimeSlot})</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Payment Status:</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-bold text-slate-900">
                      {activeOrder.paymentMethod} — {activeOrder.paymentStatus}
                    </span>
                    {activeOrder.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => updatePaymentStatus(activeOrder.id, 'PAID')}
                        className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold hover:bg-emerald-700"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallon Exchange Reminder Box */}
              {activeOrder.exchangeGallonsCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Rider must collect <strong>{activeOrder.exchangeGallonsCount} empty gallon(s)</strong> from customer.
                    </span>
                  </div>
                </div>
              )}

              {/* Ordered Items Table */}
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-2">
                  Ordered Items ({activeOrder.items.length})
                </span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {activeOrder.items.map((item: any) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900 block">{item.quantity}x {item.productName}</strong>
                        <span className="text-slate-400 text-[11px]">
                          {item.waterType} • {item.capacity} {item.isExchange ? '(Refill / Empty Return)' : '(New Container)'}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">₱{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₱{activeOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-slate-900">₱{activeOrder.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Order Value</span>
                  <span className="text-sky-700 text-base">₱{activeOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Status History Timeline */}
              {activeOrder.statusHistory && (
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block mb-2">
                    Audit & Status Log
                  </span>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {activeOrder.statusHistory.map((h: any, i: number) => (
                      <div key={i} className="flex items-start justify-between text-[11px]">
                        <div>
                          <strong className="text-slate-800">{h.status}</strong>
                          <span className="text-slate-500 block">{h.notes}</span>
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
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Cancel Order</span>
            </h3>
            <p className="text-xs text-slate-500">
              Please provide a cancellation reason. This will be visible on the customer's tracking page and returned to inventory.
            </p>
            <textarea
              required
              rows={3}
              placeholder="e.g. Customer requested cancellation / Outside delivery coverage..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() =>
                  updateOrderStatus(
                    activeOrder.id,
                    'CANCELLED',
                    `Order cancelled: ${cancelReason}`,
                    undefined,
                    cancelReason
                  )
                }
                disabled={!cancelReason.trim() || loadingAction}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
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

