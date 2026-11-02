'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  QrCode, 
  DollarSign, 
  Check, 
  AlertCircle, 
  Sparkles,
  Save
} from 'lucide-react';

interface SettingsClientProps {
  initialSettings: any;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings || {});

  const [businessName, setBusinessName] = useState(settings.businessName || 'Aqua B Water Station');
  const [tagline, setTagline] = useState(settings.tagline || 'Pure, Refreshing & Reliable Drinking Water');
  const [municipality, setMunicipality] = useState(settings.municipality || 'Lingayen, Pangasinan');
  const [address, setAddress] = useState(settings.address || 'Pangapisan North, Lingayen, Pangasinan');
  const [phone, setPhone] = useState(settings.phone || '+63 917 888 2782');
  const [email, setEmail] = useState(settings.email || 'orders@aquabwater.ph');
  const [openingHour, setOpeningHour] = useState(settings.openingHour || '07:00 AM');
  const [closingHour, setClosingHour] = useState(settings.closingHour || '07:00 PM');
  const [operatingDays, setOperatingDays] = useState(settings.operatingDays || 'Monday to Sunday');
  const [gcashNumber, setGcashNumber] = useState(settings.gcashNumber || '0917-888-2782');
  const [gcashName, setGcashName] = useState(settings.gcashName || 'AQUA B WATER STATION');
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(settings.defaultDeliveryFee?.toString() || '25');
  const [containerDepositFee, setContainerDepositFee] = useState(settings.containerDepositFee?.toString() || '180');
  const [announcement, setAnnouncement] = useState(settings.announcement || '');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          tagline,
          municipality,
          address,
          phone,
          email,
          openingHour,
          closingHour,
          operatingDays,
          gcashNumber,
          gcashName,
          defaultDeliveryFee: parseFloat(defaultDeliveryFee),
          containerDepositFee: parseFloat(containerDepositFee),
          announcement,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSettings(data.settings);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 max-w-4xl">
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Business settings have been successfully updated!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Business Identity */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sky-700 font-bold border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4" />
            <span className="text-sm">Station Brand & Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Business Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Station Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Municipality</label>
              <input
                type="text"
                required
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Physical Station Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Operating Schedule & Contact */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sky-700 font-bold border-b border-slate-100 pb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Operating Schedule & Contacts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Opening Hour</label>
              <input
                type="text"
                placeholder="07:00 AM"
                value={openingHour}
                onChange={(e) => setOpeningHour(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Closing Hour</label>
              <input
                type="text"
                placeholder="07:00 PM"
                value={closingHour}
                onChange={(e) => setClosingHour(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Operating Days</label>
              <input
                type="text"
                placeholder="Monday to Sunday"
                value={operatingDays}
                onChange={(e) => setOperatingDays(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Station Phone Hotline</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Customer Support Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: GCash Express Payments */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-blue-700 font-bold border-b border-slate-100 pb-2">
            <QrCode className="w-4 h-4" />
            <span className="text-sm">GCash Express Payment Account</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <div>
              <label className="font-bold text-slate-700 block mb-1">GCash Account Name</label>
              <input
                type="text"
                required
                value={gcashName}
                onChange={(e) => setGcashName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none uppercase font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">GCash Mobile Number</label>
              <input
                type="text"
                required
                value={gcashNumber}
                onChange={(e) => setGcashNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Banner Announcement */}
        <div className="space-y-2">
          <label className="font-bold text-slate-700 block">
            Homepage Announcement Banner (Optional)
          </label>
          <textarea
            rows={2}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
            placeholder="e.g. Free delivery for 5 gallons or more! Same-day cut-off is 4:00 PM."
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center space-x-2 shadow-md shadow-sky-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

