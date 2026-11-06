'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Droplets, Phone, Mail, MapPin, Clock, ShieldCheck, Heart, Info, Banknote } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // The footer should only appear on the landing page / home page
  if (pathname !== '/') {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Droplets className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-black tracking-tight text-white">Aqua</span>
                <span className="text-2xl font-black tracking-tight text-sky-400">B</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your neighborhood water refilling station providing 100% clean, safe, and lab-tested drinking water. Fast doorstep delivery across Pangapisan, Lingayen, Pangasinan with hassle-free container exchange.
            </p>
            <div className="flex items-center space-x-2 text-xs text-sky-400 font-semibold bg-sky-950/60 p-2.5 rounded-lg border border-sky-800/60">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>DOH & Sanitation Permit Compliant</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-sky-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-sky-400 transition-colors">
                  All Water Products & Refills
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-sky-400 transition-colors">
                  How Ordering & Refills Work
                </Link>
              </li>
              <li>
                <Link href="/delivery-areas" className="hover:text-sky-400 transition-colors">
                  Covered Barangays & Fees
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-sky-400 transition-colors">
                  Staff Login (Admin / Rider)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Operating Hours */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Station Hours
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-200 block font-medium">Monday to Sunday:</span>
                  <span className="text-slate-400 text-xs">7:00 AM – 7:00 PM</span>
                </div>
              </li>
              <li className="text-xs text-slate-400 leading-relaxed bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 flex items-start space-x-2">
                <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>Same-day delivery cut-off: <strong>4:00 PM</strong>. Orders placed after 4:00 PM will be scheduled for next morning delivery.</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Station Location */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Contact & Station
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                <span className="text-slate-300 text-xs leading-relaxed">
                  Pangapisan, Lingayen, Pangasinan
                </span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-slate-300 text-xs">0917-888-AQUA / (075) 542-1234</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-slate-300 text-xs">orders@aquabwater.ph</span>
              </li>
              <li className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-lg flex items-center space-x-2">
                <Banknote className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Payment Accepted: Cash on Delivery (COD) & GCash</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Aqua B Water Station. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Clean, pure drinking water delivered to your doorstep.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

