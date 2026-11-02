'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  ShoppingBag, 
  Home, 
  RefreshCw, 
  Clock, 
  Printer, 
  Download, 
  FileText,
  AlertCircle,
  Truck,
  ShieldCheck,
  Check
} from 'lucide-react';
import { OfficialReceiptModal } from '@/components/OfficialReceiptModal';

interface OrderConfirmationClientProps {
  order: any;
}

export function OrderConfirmationClient({ order }: OrderConfirmationClientProps) {
  const [receiptOpen, setReceiptOpen] = useState(false);

  const isGCash = order.paymentMethod === 'GCASH';
  const isGCashPending = isGCash && order.paymentStatus === 'PENDING';
  const isGCashApproved = isGCash && order.paymentStatus === 'PAID';

  return (
    <div className="space-y-8">
      {/* Real-time GCash Approval Toast / Status Banner */}
      {isGCashPending && (
        <div className="bg-sky-50 border-2 border-sky-300 rounded-3xl p-5 shadow-sm space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/30">
              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                  Waiting for Admin Approval
                </span>
                <span className="text-xs font-mono font-bold text-sky-950">
                  Ref: {order.gcashReference}
                </span>
              </div>
              <h3 className="font-black text-sm text-sky-950">
                Kasalukuyang bine-verify ng Admin ang inyong GCash Payment...
              </h3>
              <p className="text-xs text-sky-800 leading-relaxed">
                Natanggap na namin ang inyong order reference at GCash transaction number. Mano-manong iva-validate at a-aprubahan ito ng aming Station Admin o Super Admin bago i-dispatch ang inyong delivery sa rider.
              </p>
            </div>
          </div>
        </div>
      )}

      {isGCashApproved && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-sm space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Payment Verified
                </span>
                <span className="text-xs font-mono font-bold text-emerald-950">
                  Ref: {order.gcashReference}
                </span>
              </div>
              <h3 className="font-black text-sm text-emerald-950">
                Aprubado na ang inyong GCash Payment!
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Na-verify na ng Station Admin ang inyong payment. Handa na ang inyong order at naka-schedule na para maihatid ng ating Rider.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Success Card */}
      <div className="bg-white rounded-3xl border border-sky-100 p-8 sm:p-10 shadow-lg text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Order Successfully Placed
          </span>
          <h1 className="text-3xl font-black text-slate-900 pt-2">
            Maraming Salamat, {order.customerName}!
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Matagumpay na naipasok ang inyong order sa Aqua B Water Station.
          </p>
        </div>

        {/* Order Reference Number Box */}
        <div className="bg-sky-50 border-2 border-dashed border-sky-200 rounded-2xl p-4 max-w-sm mx-auto">
          <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider block">
            Order Reference Number
          </span>
          <span className="text-2xl font-black text-sky-950 font-mono tracking-wider block mt-0.5">
            {order.orderNumber}
          </span>
          <span className="text-[11px] text-sky-600 mt-1 block">
            I-save ang reference number na ito para ma-track ang delivery.
          </span>
        </div>

        {/* RECEIPT BUTTONS ROW */}
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => setReceiptOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-105"
          >
            <FileText className="w-4 h-4" />
            <span>Tingnan / I-print ang Resibo (PNG/Print)</span>
          </button>

          <Link
            href={`/track?ref=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customerPhone)}`}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-md shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>I-track ang Delivery</span>
          </Link>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 pt-1 border-t border-slate-100">
          <Link
            href="/products"
            className="text-xs text-slate-600 hover:text-sky-600 font-bold py-2 px-4 rounded-xl hover:bg-slate-50 transition-colors"
          >
            + Mag-order Pa ng Tubig
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-600 hover:text-sky-600 font-bold py-2 px-4 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Bumalik sa Home
          </Link>
        </div>
      </div>

      {/* Gallon Exchange Reminder */}
      {order.exchangeGallonsCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-900">
          <RefreshCw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-sm mb-0.5">Paalala sa Pagpapalit ng Galon (Refill):</strong>
            Nag-order ka ng <strong>{order.exchangeGallonsCount} Refill gallon(s)</strong>. Pakihanda po ang <strong>{order.exchangeGallonsCount} basyong galon</strong> para sa ating delivery rider pagdating.
          </div>
        </div>
      )}

      {/* Order Summary Receipt Box */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            Detalye ng Order & Breakdown
          </h2>
          <button
            onClick={() => setReceiptOpen(true)}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Opisyal na Resibo</span>
          </button>
        </div>

        {/* Customer & Delivery Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 block font-medium">Customer:</span>
            <span className="text-slate-900 font-bold">{order.customerName}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Contact Phone:</span>
            <span className="text-slate-900 font-bold">{order.customerPhone}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-400 block font-medium">Delivery Destination:</span>
            <span className="text-slate-900 font-bold">
              {order.deliveryMethod === 'DELIVERY'
                ? `${order.deliveryAddress} (${order.barangayName || order.barangay?.name || 'Lingayen'})`
                : 'Store Pickup at Aqua B Station'}
            </span>
            {order.landmarkOrNotes && (
              <p className="text-slate-500 italic mt-0.5">Landmark: {order.landmarkOrNotes}</p>
            )}
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Scheduled Date:</span>
            <span className="text-slate-900 font-bold">{order.deliveryDate} ({order.deliveryTimeSlot})</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Payment Method & Status:</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="font-bold text-slate-900">
                {order.paymentMethod === 'CASH_ON_DELIVERY'
                  ? 'Cash on Delivery (COD)'
                  : `GCash (Ref: ${order.gcashReference || 'N/A'})`}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.paymentStatus === 'PAID' ? 'PAID' : 'PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Ordered Items ({order.items?.length || 0})
          </span>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {order.items?.map((item: any) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block">{item.quantity}x {item.productName}</strong>
                  <span className="text-slate-400 text-[11px]">
                    {item.waterType} • {item.capacity} {item.isExchange ? '(Refill / Empty Returned)' : '(New Container)'}
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  ₱{item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">₱{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee</span>
            <span className="font-bold text-slate-900">₱{order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-black text-slate-900">
            <span>Total Amount:</span>
            <span className="text-sky-700 text-xl">₱{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Official Receipt Modal */}
      <OfficialReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        order={order}
      />
    </div>
  );
}

