'use client';

import React, { useRef, useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Share2, 
  FileText,
  Truck,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

interface ReceiptItem {
  id?: string;
  productName: string;
  waterType?: string;
  capacity?: string;
  isExchange?: boolean;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ReceiptOrderData {
  orderNumber: string;
  createdAt?: string | Date;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  barangayName?: string | null;
  deliveryMethod?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  landmarkOrNotes?: string | null;
  items: ReceiptItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  gcashReference?: string | null;
  exchangeGallonsCount?: number;
  riderName?: string | null;
  assignments?: any[];
}

interface OfficialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ReceiptOrderData | null;
}

export function OfficialReceiptModal({ isOpen, onClose, order }: OfficialReceiptModalProps) {
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const assignedRider =
    order.riderName ||
    order.assignments?.[0]?.rider?.name ||
    'Aqua B Station Rider';

  const isPaid = order.paymentStatus === 'PAID';
  const isUtang =
    order.status === 'DELIVERED' && order.paymentStatus !== 'PAID';
  const isPendingGCash =
    order.paymentMethod === 'GCASH' && order.paymentStatus === 'PENDING';

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : new Date().toLocaleDateString('en-PH');

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Generate crisp PNG / JPEG using HTML5 Canvas
  const handleDownloadImage = (format: 'png' | 'jpeg' = 'png') => {
    setDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 2x Retina Resolution
      const width = 640;
      let height = 820 + (order.items.length * 36);
      if (order.exchangeGallonsCount) height += 40;

      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2);

      // Canvas Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Header Banner
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, width, 8);

      // Station Branding Header
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AQUA B WATER REFILLING STATION', width / 2, 45);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText('Pure, Safe & Alkaline Drinking Water • DOH Accredited', width / 2, 68);
      ctx.fillText('Pangapisan North, Lingayen, Pangasinan • Tel: 0917-888-2782', width / 2, 86);

      // Dashed Line
      ctx.strokeStyle = '#cbd5e1';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, 105);
      ctx.lineTo(width - 30, 105);
      ctx.stroke();
      ctx.setLineDash([]);

      // Receipt Title
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('OFFICIAL DELIVERY RECEIPT', width / 2, 130);

      // Order Reference & Date
      ctx.textAlign = 'left';
      ctx.fillStyle = '#475569';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Order Ref:`, 35, 160);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(order.orderNumber, 115, 160);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#64748b';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText(formattedDate, width - 35, 160);

      // Customer Details Box
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(30, 175, width - 60, 95);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(30, 175, width - 60, 95);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#475569';
      ctx.font = '12px system-ui, -apple-system, sans-serif';

      ctx.fillText('Customer:', 45, 198);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${order.customerName} (${order.customerPhone})`, 125, 198);

      ctx.fillStyle = '#475569';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText('Address:', 45, 220);
      ctx.fillStyle = '#0f172a';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      const addressStr = `${order.deliveryAddress}${order.barangayName ? ` (${order.barangayName})` : ''}`;
      ctx.fillText(addressStr.length > 50 ? addressStr.slice(0, 48) + '...' : addressStr, 125, 220);

      ctx.fillStyle = '#475569';
      ctx.fillText('Rider:', 45, 242);
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.fillText(assignedRider, 125, 242);

      // Table Header
      let curY = 295;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(30, curY, width - 60, 26);
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('ITEMS ORDERED', 45, curY + 17);
      ctx.textAlign = 'center';
      ctx.fillText('QTY', width - 150, curY + 17);
      ctx.textAlign = 'right';
      ctx.fillText('PRICE', width - 90, curY + 17);
      ctx.fillText('TOTAL', width - 45, curY + 17);

      curY += 32;

      // Table Items
      order.items.forEach((item) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        const typeNote = item.isExchange ? '(Refill)' : '(New Gal)';
        ctx.fillText(`${item.productName} ${typeNote}`, 45, curY);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#334155';
        ctx.fillText(`${item.quantity}x`, width - 150, curY);

        ctx.textAlign = 'right';
        ctx.fillText(`₱${item.price.toFixed(2)}`, width - 90, curY);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.fillText(`₱${item.subtotal.toFixed(2)}`, width - 45, curY);

        curY += 28;
      });

      // Divider
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(30, curY);
      ctx.lineTo(width - 30, curY);
      ctx.stroke();
      curY += 18;

      // Subtotals
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText('Subtotal:', width - 210, curY);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`₱${order.subtotal.toFixed(2)}`, width - 45, curY);
      curY += 20;

      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Delivery Fee:', width - 210, curY);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`₱${order.deliveryFee.toFixed(2)}`, width - 45, curY);
      curY += 24;

      // Grand Total Box
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(width - 240, curY - 14, 210, 36);
      ctx.strokeStyle = '#bae6fd';
      ctx.strokeRect(width - 240, curY - 14, 210, 36);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.fillText('TOTAL AMOUNT:', width - 230, curY + 10);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0c4a6e';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(`₱${order.totalAmount.toFixed(2)}`, width - 45, curY + 10);
      curY += 45;

      // Payment Method Info
      ctx.textAlign = 'left';
      ctx.fillStyle = '#475569';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      const pMethod =
        order.paymentMethod === 'GCASH'
          ? `GCash Express (Ref: ${order.gcashReference || 'N/A'})`
          : 'Cash on Delivery (COD)';
      ctx.fillText(`Payment Method: ${pMethod}`, 45, curY);
      curY += 28;

      // STAMP STATUS BOX (PAID / UTANG / PENDING)
      if (isPaid) {
        ctx.strokeStyle = '#16a34a';
        ctx.fillStyle = '#f0fdf4';
        ctx.lineWidth = 2;
        ctx.fillRect(45, curY, width - 90, 48);
        ctx.strokeRect(45, curY, width - 90, 48);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#15803d';
        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.fillText('✔ BAYAD NA / PAID IN FULL', width / 2, curY + 28);
        ctx.font = '10px system-ui, -apple-system, sans-serif';
        ctx.fillText('Opisyal na patunay ng buong bayad sa istasyon', width / 2, curY + 42);
      } else if (isUtang) {
        ctx.strokeStyle = '#d97706';
        ctx.fillStyle = '#fffbeb';
        ctx.lineWidth = 2;
        ctx.fillRect(45, curY, width - 90, 48);
        ctx.strokeRect(45, curY, width - 90, 48);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.fillText('⚠ IPINAPALISTA / UTANG (UNPAID)', width / 2, curY + 28);
        ctx.font = '10px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Naihatid nang maayos • Balanse: ₱${order.totalAmount.toFixed(2)}`, width / 2, curY + 42);
      } else if (isPendingGCash) {
        ctx.strokeStyle = '#0284c7';
        ctx.fillStyle = '#f0f9ff';
        ctx.lineWidth = 2;
        ctx.fillRect(45, curY, width - 90, 48);
        ctx.strokeRect(45, curY, width - 90, 48);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.fillText('⏳ NAGHIHINTAY NG GCASH APPROVAL', width / 2, curY + 28);
        ctx.font = '10px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Ref: ${order.gcashReference || 'N/A'} • Bine-verify ng Station Admin`, width / 2, curY + 42);
      } else {
        ctx.strokeStyle = '#64748b';
        ctx.fillStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.fillRect(45, curY, width - 90, 48);
        ctx.strokeRect(45, curY, width - 90, 48);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.fillText(`STATUS: ${order.status}`, width / 2, curY + 30);
      }
      curY += 75;

      // Exchange Gallon Reminder
      if (order.exchangeGallonsCount && order.exchangeGallonsCount > 0) {
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(45, curY - 15, width - 90, 24);
        ctx.fillStyle = '#92400e';
        ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Kasunduan: ${order.exchangeGallonsCount} Gallon Container(s) Returned/Exchanged`, width / 2, curY);
        curY += 28;
      }

      // Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText('Maraming salamat po sa inyong tiwala at pagtangkilik sa Aqua B!', width / 2, curY);
      ctx.fillText('Pangapisan North, Lingayen, Pangasinan', width / 2, curY + 16);

      // Download trigger
      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const ext = format === 'jpeg' ? 'jpg' : 'png';
      const dataUrl = canvas.toDataURL(mime, 0.95);

      const link = document.createElement('a');
      link.download = `AquaB-Resibo-${order.orderNumber}.${ext}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate receipt image:', err);
      alert('May problema sa pag-download ng larawan.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* Print-specific style to isolate receipt and hide page chrome */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #aqua-b-receipt-print-area,
          #aqua-b-receipt-print-area * {
            visibility: visible !important;
          }
          #aqua-b-receipt-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 no-print">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">Opisyal na Resibo ng Aqua B</h3>
                <span className="text-[11px] text-slate-500 font-mono">Ref: {order.orderNumber}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar (Print, Download PNG/JPG) */}
          <div className="p-3 bg-sky-50/70 border-b border-sky-100 flex flex-wrap items-center justify-between gap-2 text-xs no-print">
            <span className="text-sky-900 font-bold hidden sm:inline">
              Pumili ng aksyon:
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-initial px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm flex items-center justify-center space-x-1.5 active:scale-98"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>I-print (Print)</span>
              </button>

              <button
                onClick={() => handleDownloadImage('png')}
                disabled={downloading}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-600/30 flex items-center justify-center space-x-1.5 active:scale-98 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Ginigawa...' : 'I-save Larawan (PNG)'}</span>
              </button>
            </div>
          </div>

          {/* Scrollable Receipt Body */}
          <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100/60 flex-1">
            <div
              id="aqua-b-receipt-print-area"
              ref={receiptRef}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm max-w-md mx-auto space-y-5 text-xs text-slate-700"
            >
              {/* Station Header */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-dashed border-slate-200">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Aqua B Water Station
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Pure, Safe & Alkaline Drinking Water
                </p>
                <p className="text-[10px] text-slate-400">
                  Pangapisan North, Lingayen, Pangasinan • 0917-888-2782
                </p>
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100 uppercase tracking-wider">
                    Official Delivery Receipt
                  </span>
                </div>
              </div>

              {/* Order & Customer Metadata */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Number:</span>
                  <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Petsa / Oras:</span>
                  <span className="text-slate-800 font-medium">{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kliyente:</span>
                  <span className="font-bold text-slate-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Telepono:</span>
                  <span className="text-slate-800">{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lugar / Address:</span>
                  <span className="text-slate-800 text-right max-w-[200px] truncate">
                    {order.deliveryAddress}{order.barangayName ? ` (${order.barangayName})` : ''}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400">Rider / Delivery:</span>
                  <span className="font-bold text-sky-700">{assignedRider}</span>
                </div>
              </div>

              {/* Ordered Items Table */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-1 px-1">
                  <span>Aytem</span>
                  <div className="space-x-4">
                    <span>Dami</span>
                    <span>Halaga</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs px-1">
                      <div>
                        <strong className="text-slate-900 block font-bold">{item.productName}</strong>
                        <span className="text-slate-400 text-[10px]">
                          {item.isExchange ? 'Refill Gallon' : 'Bagong Galon'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 mr-4 font-mono">{item.quantity}x</span>
                        <span className="font-bold text-slate-900">₱{item.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Calculation */}
              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₱{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee</span>
                  <span>₱{order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900 bg-sky-50/50 p-2 rounded-xl">
                  <span>Kabuuang Halaga (Total):</span>
                  <span className="text-sky-700 text-base">₱{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Paraan ng Pagbabayad:</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {order.paymentMethod === 'GCASH'
                    ? `GCash Express Transfer (Ref: ${order.gcashReference || 'N/A'})`
                    : 'Cash on Delivery (COD)'}
                </span>
              </div>

              {/* STAMP BOX */}
              <div>
                {isPaid && (
                  <div className="border-2 border-emerald-600 bg-emerald-50 text-emerald-800 p-3 rounded-2xl text-center space-y-0.5">
                    <span className="text-xs font-black uppercase tracking-wider block flex items-center justify-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>BAYAD NA / PAID IN FULL</span>
                    </span>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      Opisyal na patunay ng buong bayad sa Aqua B Station.
                    </p>
                  </div>
                )}

                {isUtang && (
                  <div className="border-2 border-amber-500 bg-amber-50 text-amber-900 p-3 rounded-2xl text-center space-y-0.5">
                    <span className="text-xs font-black uppercase tracking-wider block flex items-center justify-center space-x-1 text-amber-700">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>IPINAPALISTA / UTANG</span>
                    </span>
                    <p className="text-[10px] text-amber-800 font-medium">
                      Naihatid nang maayos. May natitirang balanse na <strong>₱{order.totalAmount.toFixed(2)}</strong>.
                    </p>
                  </div>
                )}

                {isPendingGCash && (
                  <div className="border-2 border-sky-500 bg-sky-50 text-sky-900 p-3 rounded-2xl text-center space-y-0.5">
                    <span className="text-xs font-black uppercase tracking-wider block flex items-center justify-center space-x-1 text-sky-700">
                      <Clock className="w-4 h-4 text-sky-600" />
                      <span>NAGHIHINTAY NG GCASH APPROVAL</span>
                    </span>
                    <p className="text-[10px] text-sky-800 font-medium">
                      Ref No: <strong>{order.gcashReference}</strong>. Bina-validate pa ng Admin.
                    </p>
                  </div>
                )}
              </div>

              {/* Gallon Exchange Reminder */}
              {order.exchangeGallonsCount && order.exchangeGallonsCount > 0 && (
                <div className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-xl text-center font-medium border border-amber-200">
                  {order.exchangeGallonsCount} Gallon Container(s) Returned / Exchanged
                </div>
              )}

              {/* Thank you note */}
              <div className="text-center pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
                <p>Maraming salamat po sa inyong tiwala at pagtangkilik sa Aqua B!</p>
                <p>Pangapisan North, Lingayen, Pangasinan • Safe Water Always</p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end no-print">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
            >
              Isara (Close)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

