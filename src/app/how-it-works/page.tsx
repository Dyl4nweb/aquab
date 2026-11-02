import React from 'react';
import Link from 'next/link';
import { 
  Droplets, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  RefreshCw, 
  Package, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  Phone
} from 'lucide-react';

export const metadata = {
  title: 'How It Works — Aqua B Water Station',
  description: 'Learn how to order water refills and new containers without an account. Fast delivery in Pangapisan, Lingayen, Pangasinan.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Pumili ng Tubig at Lalagyan',
      desc: 'Pumili sa Purified, Alkaline, o Mineral water. Piliin kung REFILL (may isasauling basyo) o BAGONG CONTAINER (may container fee).',
      icon: Droplets,
      color: 'from-sky-500 to-cyan-500',
    },
    {
      num: '02',
      title: 'Direct Checkout (Walang Account)',
      desc: 'Diretso sa checkout nang hindi kailangan gumawa ng account o mag-login. Ilagay lang ang pangalan, numero, at address sa Lingayen.',
      icon: ShoppingCart,
      color: 'from-cyan-500 to-teal-500',
    },
    {
      num: '03',
      title: '16-Stage Sanitation & Refill',
      desc: 'Nililinis at sinasanitize ang bawat container bago punuin ng 16-stage purified o alkaline water. Selyado gamit ang heat shrink seal.',
      icon: ShieldCheck,
      color: 'from-teal-500 to-emerald-500',
    },
    {
      num: '04',
      title: 'Mabilis na Hatid sa Pinto Mo',
      desc: 'Dadalhin ng aming rider sa iyong bahay. Iabot ang basyo (kung refill) at magbayad via Cash on Delivery (COD) o GCash.',
      icon: Truck,
      color: 'from-sky-600 to-blue-600',
    },
  ];

  const faqs = [
    {
      q: 'Kailangan ba ng account para mag-order?',
      a: 'Hindi! 100% no account required. Ilagay lang ang iyong pangalan, cellphone number, at delivery address sa checkout.',
    },
    {
      q: 'Ano ang pagkakaiba ng Refill sa Bagong Container?',
      a: 'Sa Refill, ipapalit mo ang iyong malinis na basyong gallon kaya tubig lang ang babayaran mo. Sa Bagong Container, bibili ka ng bagong lalagyan (+₱180 deposit/container fee) kasama ang tubig.',
    },
    {
      q: 'Tumatanggap ba kayo ng ibang brand ng basyo para sa exchange?',
      a: 'Oo, basta standard 5-gallon round gallon o standard square container na walang basag o sira.',
    },
    {
      q: 'Paano magbayad?',
      a: 'Tumatanggap kami ng Cash on Delivery (COD) sa rider o GCash (ilagay lang ang GCash reference number sa checkout).',
    },
    {
      q: 'Gaano kabilis ang delivery sa Lingayen?',
      a: 'Kadalasan ay 20 hanggang 40 minuto depende sa iyong barangay. Same-day delivery para sa orders bago mag-4:00 PM.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center space-x-1.5 bg-sky-100 text-sky-800 px-3.5 py-1 rounded-full text-xs font-bold border border-sky-200">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span>Simple & Convenient Ordering</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Paano Gumagana ang{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
            Aqua B
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Mabilis, malinis, at maaasahang serbisyo ng malinis na inuming tubig para sa mga tahanan at negosyo sa Pangapisan at buong Lingayen, Pangasinan.
        </p>
      </div>

      {/* 4 Steps Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-sky-200 group-hover:text-sky-600 transition-colors">
                    {s.num}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center shadow-md shadow-sky-500/20`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-sky-600">
                <span>Hakbang {s.num}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Refill vs New Container Comparison */}
      <div className="bg-gradient-to-br from-sky-50 to-cyan-50/50 rounded-3xl border border-sky-200/80 p-6 sm:p-10 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
          <h2 className="text-2xl font-black text-slate-900">
            Gabay sa Gallon Refill vs Bagong Container
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Para makatipid, alamin kung anong option ang angkop sa iyong pangangailangan:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Refill Card */}
          <div className="bg-white p-6 rounded-2xl border-2 border-sky-500 shadow-md space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Gallon Refill / Exchange</h3>
                <span className="text-xs text-emerald-600 font-bold">Pinaka-matipid (Tubig lang ang bayad)</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Mayroon kang sariling basyong gallon sa bahay</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Ibibigay mo ang basyo sa rider pagka-deliver</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Libre ang container fee (₱0)</span>
              </li>
            </ul>
          </div>

          {/* New Container Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bagong Container (With Container)</h3>
                <span className="text-xs text-slate-500 font-semibold">Kapag walang basyong isasauli</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span>Wala kang bakanteng basyo o kailangan mo ng extra container</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span>Bago, food-grade, at may heat seal na container</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span>Bayad: Presyo ng Tubig + Container Deposit Fee (+₱180)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Mga Karaniwang Tanong (FAQs)</h2>
          <p className="text-xs text-slate-500">Mga kasagutan sa madalas itanong ng mga suki</p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">{f.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-gradient-to-r from-sky-600 to-cyan-600 rounded-3xl p-8 sm:p-10 text-white shadow-lg text-center max-w-4xl mx-auto space-y-5">
        <h2 className="text-2xl sm:text-3xl font-black">Handa Ka Na Bang Umorder?</h2>
        <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto">
          Pumili ng tubig, maglagay ng address, at hintayin ang delivery sa iyong pinto. Walang registration!
        </p>
        <div>
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 bg-white text-sky-700 hover:bg-sky-50 font-bold text-sm px-8 py-4 rounded-full shadow-lg transition-all hover:scale-105"
          >
            <span>Tingnan ang Mga Produkto</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

