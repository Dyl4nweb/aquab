'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Search, 
  Truck, 
  Clock, 
  Store, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { BarangayItem, BusinessSettingItem } from '@/types';

interface DeliveryAreasClientProps {
  barangays: BarangayItem[];
  settings: BusinessSettingItem | null;
}

export function DeliveryAreasClient({ barangays, settings }: DeliveryAreasClientProps) {
  const [search, setSearch] = useState('');

  const filtered = barangays.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center space-x-1.5 bg-sky-100 text-sky-800 px-3.5 py-1 rounded-full text-xs font-bold border border-sky-200">
          <Truck className="w-3.5 h-3.5 text-sky-600" />
          <span>Doorstep Delivery Coverage</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Delivery Areas sa{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
            {settings?.municipality || 'Pangapisan, Lingayen, Pangasinan'}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Tingnan ang listahan ng mga suportadong barangay sa Lingayen, ang katumbas na delivery fee, at tinatayang oras ng dating ng tubig.
        </p>
      </div>

      {/* Station Pickup vs Doorstep Delivery Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Doorstep Delivery */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base">Doorstep Home Delivery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ihahatid diretso ng aming riders sa inyong gate o pinto. Mababang fee mula ₱10 depende sa barangay.
            </p>
            <span className="inline-block text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
              Mabilis: 20–35 minuto
            </span>
          </div>
        </div>

        {/* Station Pickup */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base">Station Pick-up (Walk-in)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maaari ring dumaan sa aming water station sa Pangapisan para kumuha ng refill.
            </p>
            <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Libre (₱0 Delivery Fee)
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Hanapin ang iyong barangay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Barangays Cards Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {filtered.length} Barangay{filtered.length !== 1 ? 's' : ''} Natagpuan
          </span>
          <span className="text-xs text-slate-500">
            Home Station: <strong>Pangapisan</strong>
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Walang natagpuang barangay</p>
            <p className="text-xs text-slate-400 mt-1">Subukan i-type ang unang letra ng iyong lugar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((b) => {
              const isHomeStation = b.name.toLowerCase().includes('pangapisan');
              return (
                <div
                  key={b.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isHomeStation
                      ? 'bg-sky-50/80 border-sky-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-sky-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{b.name}</h3>
                      <span className="text-[11px] text-slate-500">Lingayen, Pangasinan</span>
                    </div>
                    {isHomeStation && (
                      <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        Station Zone
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>~{b.estimatedDeliveryMinutes || 25} mins</span>
                    </span>
                    <span className="font-black text-sky-600 text-sm">
                      ₱{b.deliveryFee.toFixed(0)} fee
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Station Information Box */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-8 max-w-4xl mx-auto shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-sky-600" />
          <span>Station Location & Oras ng Operasyon</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-800 block mb-0.5">Lokasyon ng Station:</span>
            <span>{settings?.address || 'Pangapisan, Lingayen, Pangasinan'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-800 block mb-0.5">Operating Hours:</span>
            <span>Lunes hanggang Linggo (7:00 AM – 7:00 PM)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-800 block mb-0.5">Same-day Delivery Cut-off:</span>
            <span>Hanggang 4:00 PM para sa parehong araw</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-sky-600 to-cyan-600 rounded-3xl p-8 sm:p-10 text-white shadow-lg text-center max-w-4xl mx-auto space-y-5">
        <h2 className="text-2xl sm:text-3xl font-black">Nasa Lingayen Ka Ba? Mag-order Na!</h2>
        <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto">
          Mabilis na ihahatid ng aming rider ang iyong tubig sa iyong barangay.
        </p>
        <div>
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 bg-white text-sky-700 hover:bg-sky-50 font-bold text-sm px-8 py-4 rounded-full shadow-lg transition-all hover:scale-105"
          >
            <span>Pumili ng Tubig at Gallon</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

