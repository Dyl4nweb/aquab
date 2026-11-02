'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { BarangayItem, BusinessSettingItem } from '@/types';
import { 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Store, 
  Calendar, 
  Clock, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  RefreshCw, 
  Package, 
  AlertCircle,
  Info 
} from 'lucide-react';

interface CheckoutClientProps {
  barangays: BarangayItem[];
  settings: BusinessSettingItem | null;
}

export function CheckoutClient({ barangays, settings }: CheckoutClientProps) {
  const router = useRouter();
  const { 
    items, 
    subtotal, 
    totalItems, 
    totalEmptyGallonsToExchange, 
    totalNewGallonsPurchased,
    clearCart 
  } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [barangayId, setBarangayId] = useState(barangays[0]?.id || '');
  const [landmarkOrNotes, setLandmarkOrNotes] = useState('');

  // Delivery Method & Schedule
  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  
  // Default delivery date: today formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const [deliveryDate, setDeliveryDate] = useState(todayStr);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('10:00 AM - 12:00 PM');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'GCASH'>('CASH_ON_DELIVERY');
  const [gcashReference, setGcashReference] = useState('');

  // Delivery fee calculation
  const selectedBarangay = barangays.find((b) => b.id === barangayId);
  const deliveryFee = deliveryMethod === 'DELIVERY' ? (selectedBarangay?.deliveryFee || 20) : 0;
  const totalAmount = subtotal + deliveryFee;

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM',
    '05:00 PM - 07:00 PM',
  ];

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Your cart is empty</h2>
        <p className="text-sm text-slate-500">Please add water products or refills before proceeding to checkout.</p>
        <Link
          href="/products"
          className="inline-flex items-center space-x-2 bg-sky-600 text-white font-bold text-xs py-3 px-6 rounded-xl hover:bg-sky-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  // Step 1 Validation
  const validateStep1 = () => {
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name');
      return false;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setErrorMessage('Please enter a valid mobile number (e.g. 09171234567)');
      return false;
    }
    if (deliveryMethod === 'DELIVERY') {
      if (!deliveryAddress.trim()) {
        setErrorMessage('Please enter your delivery street address');
        return false;
      }
      if (!barangayId) {
        setErrorMessage('Please select your barangay in Lingayen, Pangasinan');
        return false;
      }
    }
    setErrorMessage('');
    return true;
  };

  // Step 4 Validation
  const validateStep4 = () => {
    if (paymentMethod === 'GCASH' && !gcashReference.trim()) {
      setErrorMessage('Please enter your GCash reference number');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 4 && !validateStep4()) return;
    setErrorMessage('');
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        barangayId,
        landmarkOrNotes: landmarkOrNotes.trim(),
        deliveryMethod,
        deliveryDate,
        deliveryTimeSlot,
        paymentMethod,
        gcashReference: paymentMethod === 'GCASH' ? gcashReference.trim() : null,
        items: items.map((i) => ({
          productId: i.productId,
          isExchange: i.isExchange,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      // Order created successfully!
      clearCart();
      router.push(`/order-confirmation/${data.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Customer Info' },
    { num: 2, label: 'Delivery Method' },
    { num: 3, label: 'Schedule' },
    { num: 4, label: 'Payment' },
    { num: 5, label: 'Summary' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Fast & Easy Checkout • No Account Needed
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-2">Complete Your Water Order</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Follow the simple steps below. Your order will be sent straight to our station queue.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm">
        <div className="grid grid-cols-5 gap-2">
          {steps.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div key={s.num} className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-4 ring-sky-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1.5 hidden sm:block ${
                    isCurrent ? 'text-sky-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Area (Steps 1 to 5) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm space-y-6">
          {/* STEP 1: CUSTOMER INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-sky-600" />
                  <span>Step 1: Customer Information</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  We need your contact and location details to coordinate your delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Clara Santos"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0917 123 4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              {deliveryMethod === 'DELIVERY' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Barangay in Lingayen, Pangasinan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={barangayId}
                      onChange={(e) => setBarangayId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white"
                    >
                      {barangays.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} — ₱{b.deliveryFee.toFixed(2)} delivery fee
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Complete Street Address / House / Unit No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blk 12 Lot 4, Sunflower St., Pleasant Hills Subd."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Landmark or Gate Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Blue gate across Sari-Sari store, please ring bell twice"
                      value={landmarkOrNotes}
                      onChange={(e) => setLandmarkOrNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: DELIVERY METHOD */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-sky-600" />
                  <span>Step 2: Delivery Method</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose whether you want our riders to deliver to your doorstep or if you'll pick up at the station.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('DELIVERY')}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    deliveryMethod === 'DELIVERY'
                      ? 'bg-sky-50/70 border-sky-600 ring-2 ring-sky-500/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    {deliveryMethod === 'DELIVERY' && (
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Home Doorstep Delivery</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Our rider will bring the water containers directly to your address in {selectedBarangay?.name || 'Lingayen, Pangasinan'}.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-sky-100 text-xs font-bold text-sky-800 flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>₱{deliveryFee.toFixed(2)}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('PICKUP')}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    deliveryMethod === 'PICKUP'
                      ? 'bg-sky-50/70 border-sky-600 ring-2 ring-sky-500/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                    {deliveryMethod === 'PICKUP' && (
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Store Station Pickup</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Pick up directly at Aqua B Station ({settings?.address || 'Pangapisan, Lingayen, Pangasinan'}).
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-sky-100 text-xs font-bold text-emerald-600 flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>FREE (₱0.00)</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DELIVERY SCHEDULE */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <span>Step 3: Preferred Delivery Schedule</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select your desired delivery date and time slot within station operating hours (7:00 AM – 7:00 PM).
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Preferred Delivery Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Select Delivery Time Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setDeliveryTimeSlot(slot)}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                        deliveryTimeSlot === slot
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot}</span>
                      </div>
                      {deliveryTimeSlot === slot && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-100 text-xs text-sky-900 leading-relaxed flex items-start space-x-2">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span><strong>Notice:</strong> Same-day orders placed before 4:00 PM will be fulfilled today. Our rider will contact you via SMS or phone before arriving.</span>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT METHOD */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-sky-600" />
                  <span>Step 4: Payment Method</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose Cash on Delivery (pay upon arrival) or fast GCash transfer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'bg-sky-50/70 border-sky-600 ring-2 ring-sky-500/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Banknote className="w-5 h-5" />
                    </div>
                    {paymentMethod === 'CASH_ON_DELIVERY' && (
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay our rider with exact cash upon handover of your clean water.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('GCASH')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'GCASH'
                      ? 'bg-sky-50/70 border-sky-600 ring-2 ring-sky-500/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                    {paymentMethod === 'GCASH' && (
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">GCash Express Payment</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Send to our station GCash account and enter your reference number.
                  </p>
                </button>
              </div>

              {/* GCash Instructions & Reference Input */}
              {paymentMethod === 'GCASH' && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                    {/* QR Code Preview */}
                    <div className="w-36 h-36 relative shrink-0 border border-blue-200 rounded-2xl overflow-hidden shadow-inner bg-slate-50 flex items-center justify-center">
                      <Image
                        src="/images/gcash-qr.svg"
                        alt="Aqua B GCash QR Code"
                        width={140}
                        height={140}
                        className="object-contain"
                      />
                    </div>

                    <div className="space-y-2 text-xs flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Official Station GCash QR
                      </span>
                      <h4 className="font-black text-sm text-slate-900">
                        Scan gamit ang GCash App o Mag-send Money:
                      </h4>

                      <div className="space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Account Name:</span>
                          <strong className="text-slate-900">{settings?.gcashName || 'AQUA B WATER STATION'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">GCash Mobile:</span>
                          <strong className="text-blue-600 font-mono text-sm">{settings?.gcashNumber || '0917-888-2782'}</strong>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200/60 font-bold">
                          <span className="text-slate-500">Halagang Ise-send:</span>
                          <span className="text-slate-900 text-sm">₱{totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-blue-950 block mb-1">
                      Ilagay ang GCash Reference Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Hal. 9823419082 (10-13 digits galing sa GCash receipt)"
                      value={gcashReference}
                      onChange={(e) => setGcashReference(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-mono"
                    />
                    <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl mt-2 flex items-start space-x-2 text-[11px] text-amber-900">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Paalala:</strong> Mano-manong iva-validate at a-aprubahan ng Station Admin ang iyong GCash payment bago i-dispatch sa rider para maihatid.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: ORDER SUMMARY & CONFIRMATION */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Step 5: Review & Place Order</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Please double-check your order details before placing it.
                </p>
              </div>

              {/* Review Details Table */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block font-medium">Customer:</span>
                    <strong className="text-slate-900">{customerName}</strong> ({customerPhone})
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Delivery Method:</span>
                    <strong className="text-slate-900">
                      {deliveryMethod === 'DELIVERY' ? `Home Delivery (${selectedBarangay?.name})` : 'Store Pickup'}
                    </strong>
                  </div>
                  {deliveryMethod === 'DELIVERY' && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block font-medium">Address:</span>
                      <p className="text-slate-800">{deliveryAddress}</p>
                      {landmarkOrNotes && (
                        <p className="text-slate-500 italic mt-0.5">Note: {landmarkOrNotes}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block font-medium">Schedule:</span>
                    <span className="text-slate-900 font-bold">{deliveryDate}</span> ({deliveryTimeSlot})
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Payment Method:</span>
                    <span className="text-slate-900 font-bold">
                      {paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery (COD)' : `GCash (Ref: ${gcashReference})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Empty Gallon Reminder Alert */}
              {totalEmptyGallonsToExchange > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start space-x-2.5 text-xs text-emerald-900">
                  <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">Empty Containers Checklist:</strong>
                    You have ordered <strong>{totalEmptyGallonsToExchange} Refill container(s)</strong>. Please make sure {totalEmptyGallonsToExchange} clean empty container(s) are ready for rider collection upon delivery.
                  </div>
                </div>
              )}

              {/* Items List Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                {items.map((item, idx) => {
                  const lineTotal = (item.unitPrice + item.containerFee) * item.quantity;
                  return (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{item.quantity}x {item.productName}</span>
                        <div className="text-[11px] text-slate-500">
                          {item.supportsExchange ? (item.isExchange ? 'Refill (Empty Returned)' : 'New Gallon (+deposit)') : item.capacity}
                        </div>
                      </div>
                      <span className="font-black text-slate-900">₱{lineTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <Link
                href="/cart"
                className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Cart</span>
              </Link>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-sky-600/30 transition-all hover:scale-105"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Submitting Order...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Place Order (₱{totalAmount.toFixed(2)})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Sticky Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-sky-100 p-6 shadow-sm space-y-4 sticky top-28">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Breakdown
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal ({totalItems})</span>
                <span className="font-bold text-slate-900">₱{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery Method</span>
                <span className="font-semibold text-slate-800">{deliveryMethod}</span>
              </div>

              {deliveryMethod === 'DELIVERY' && selectedBarangay && (
                <div className="flex justify-between text-slate-600">
                  <span>Barangay ({selectedBarangay.name})</span>
                  <span className="font-bold text-sky-600">₱{selectedBarangay.deliveryFee.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-sky-700 text-xl">₱{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100 space-y-1.5 text-[11px] text-sky-950">
              <div className="flex items-center space-x-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Station Guarantee</span>
              </div>
              <p>Prices and stock validated in real-time. No hidden surcharges.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

