import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { HomeProductSection } from '@/components/HomeProductSection';
import { 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Phone, 
  MapPin, 
  ArrowRight, 
  CreditCard,
  Clock,
  Sparkles
} from 'lucide-react';

export const revalidate = 0;

async function getHomeData() {
  const [products, categories, barangays, settings] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ isFeatured: 'desc' }, { stock: 'desc' }],
    }),
    prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.barangay.findMany({
      where: { isActive: true },
      orderBy: { deliveryFee: 'asc' },
    }),
    prisma.businessSetting.findFirst({
      where: { id: 'default' },
    }),
  ]);

  return { products, categories, barangays, settings };
}

export default async function HomePage() {
  const { products, categories, barangays, settings } = await getHomeData();

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION (MINIMAL & DIRECT) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/80 via-white to-slate-50/50 pt-10 pb-14 border-b border-sky-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <span className="inline-flex items-center space-x-1.5 bg-sky-100/80 text-sky-800 px-3.5 py-1 rounded-full text-xs font-bold border border-sky-200">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>100% Pure & Lab-Tested Water</span>
              </span>

              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Fresh Drinking Water in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                  {settings?.municipality || 'Lingayen, Pangasinan'}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto lg:mx-0">
                Gallon refill o bagong container delivery sa inyong pintuan. Walang registration na kailangan.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#products-section"
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Pumili ng Tubig</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  href="/how-it-works"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-sm flex items-center justify-center space-x-1.5 transition-all"
                >
                  <span>Paano Umorder</span>
                </Link>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3 text-xs text-slate-600 font-semibold">
                <span className="flex items-center space-x-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Doorstep Delivery</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center space-x-1">
                  <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                  <span>Gallon Exchange</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center space-x-1">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-600" />
                  <span>COD & GCash</span>
                </span>
              </div>
            </div>

            {/* Right Gallon Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 bg-gradient-to-tr from-sky-400/15 to-cyan-300/25 p-6 rounded-3xl border border-sky-100 shadow-xl flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src="/images/products/round-gallon.jpg"
                    alt="Aqua B Gallon"
                    fill
                    className="object-contain drop-shadow-lg"
                    priority
                  />
                </div>

                <div className="absolute -bottom-3 bg-white/95 backdrop-blur border border-sky-100 px-4 py-1.5 rounded-xl shadow-md flex items-center space-x-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-800">Station Open: {settings?.openingHour || '7:00 AM'} - {settings?.closingHour || '7:00 PM'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR PRODUCTS SECTION */}
      <HomeProductSection products={products as any} />

      {/* 3. HOW IT WORKS (CLEAN 3-STEP STRIP) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-sky-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8 border-b border-sky-900 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Paano Umorder</h2>
              <p className="text-xs text-sky-300 mt-0.5">3 simpleng hakbang para magka-tubig sa bahay o pwesto</p>
            </div>
            <Link 
              href="/how-it-works" 
              className="text-xs font-bold text-sky-400 hover:text-white flex items-center space-x-1"
            >
              <span>Tingnan ang buong gabay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4 bg-sky-900/40 p-4 rounded-2xl border border-sky-800/50">
              <span className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center shrink-0 text-sm">
                1
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Piliin ang Tubig</h3>
                <p className="text-xs text-sky-200 mt-1">Refill kung may basyo, o New Gallon kung kailangan ng bagong lalagyan.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-sky-900/40 p-4 rounded-2xl border border-sky-800/50">
              <span className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center shrink-0 text-sm">
                2
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Ilagay ang Address</h3>
                <p className="text-xs text-sky-200 mt-1">Walang account na kailangan. Ilagay lamang ang pangalan at Lingayen barangay.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-sky-900/40 p-4 rounded-2xl border border-sky-800/50">
              <span className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center shrink-0 text-sm">
                3
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Ihatid at Magbayad</h3>
                <p className="text-xs text-sky-200 mt-1">Ibibigay ng rider ang tubig sa pintuan. Magbayad via Cash (COD) o GCash.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COVERAGE BARANGAYS PREVIEW (MINIMAL) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-1.5 text-sky-600 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Pangapisan Station Coverage</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Naghahatid sa mga Barangay ng Lingayen
            </h2>
            <p className="text-xs text-slate-500">
              Libreng pickup sa istasyon (₱0) o mabilis na delivery sa inyong barangay.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/delivery-areas"
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 text-center flex items-center justify-center space-x-1.5 transition-colors"
            >
              <span>I-check ang Delivery Fee ng Barangay Mo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. QUICK CONTACT / CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-black">Kailangan ng Tubig Ngayon?</h3>
            <p className="text-xs text-sky-100">Bukas araw-araw mula {settings?.openingHour || '7:00 AM'} hanggang {settings?.closingHour || '7:00 PM'}.</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#products-section"
              className="bg-white text-sky-700 hover:bg-sky-50 font-black text-xs py-3 px-5 rounded-xl shadow transition-all"
            >
              Order Online
            </a>
            {settings?.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="bg-sky-700/70 hover:bg-sky-700 text-white font-bold text-xs py-3 px-4 rounded-xl border border-white/20 flex items-center space-x-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{settings.phone}</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
