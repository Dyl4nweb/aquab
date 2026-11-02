'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { executeSignOut } from '@/lib/logout';
import { 
  Droplets, 
  ShoppingCart, 
  Menu, 
  X, 
  Search, 
  Clock, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  User, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/rider');

  // If inside staff dashboards, render a simplified topbar or allow normal navbar
  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      {/* Top Notification Bar */}
      <div className="bg-sky-900 text-sky-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-sky-300" />
              <span>Serving Pangapisan, Lingayen, Pangasinan</span>
            </span>
            <span className="hidden md:flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-sky-300" />
              <span>Open Daily: 7:00 AM – 7:00 PM</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 font-medium">
              <Phone className="w-3.5 h-3.5 text-sky-300" />
              <span>Hotline: 0917-888-AQUA (2782)</span>
            </span>
            {session ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={session.user && (session.user as any).role === 'RIDER' ? '/rider' : '/admin'}
                  className="text-xs bg-sky-700 hover:bg-sky-600 px-2.5 py-0.5 rounded font-semibold text-white flex items-center space-x-1"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => executeSignOut('/login')}
                  className="text-xs bg-sky-800 hover:bg-rose-600 px-2 py-0.5 rounded font-semibold text-white flex items-center space-x-1 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs text-sky-200 hover:text-white flex items-center space-x-1 hover:underline font-medium"
              >
                <User className="w-3 h-3" />
                <span>Staff Portal</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-sky-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Droplets className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-black tracking-tight text-slate-900">Aqua</span>
                  <span className="text-2xl font-black tracking-tight text-sky-600">B</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
                  Water Station & Delivery
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={`text-sm font-semibold transition-colors ${
                  pathname === '/' ? 'text-sky-600' : 'text-slate-600 hover:text-sky-600'
                }`}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={`text-sm font-semibold transition-colors ${
                  pathname === '/products' ? 'text-sky-600' : 'text-slate-600 hover:text-sky-600'
                }`}
              >
                Water Products
              </Link>
              <Link
                href="/how-it-works"
                className={`text-sm font-semibold transition-colors ${
                  pathname === '/how-it-works' ? 'text-sky-600' : 'text-slate-600 hover:text-sky-600'
                }`}
              >
                How It Works
              </Link>
              <Link
                href="/delivery-areas"
                className={`text-sm font-semibold transition-colors ${
                  pathname === '/delivery-areas' ? 'text-sky-600' : 'text-slate-600 hover:text-sky-600'
                }`}
              >
                Delivery Areas
              </Link>
            </nav>

            {/* Right Actions: Cart & Quick CTA */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center space-x-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 px-4 py-2.5 rounded-full transition-all border border-sky-200/80 active:scale-95"
                aria-label="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-sky-600" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-sky-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] font-bold uppercase text-slate-500 leading-none">Cart</span>
                  <span className="text-xs font-black text-sky-900 leading-tight">
                    ₱{subtotal.toFixed(2)}
                  </span>
                </div>
              </button>

              <Link
                href="/products"
                className="hidden sm:inline-flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-sm shadow-sky-600/30 transition-all hover:shadow"
              >
                Order Now
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600"
            >
              Water Products & Refills
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                pathname === '/how-it-works'
                  ? 'text-sky-600 bg-sky-50'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-600'
              }`}
            >
              How It Works
            </Link>
            <Link
              href="/delivery-areas"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                pathname === '/delivery-areas'
                  ? 'text-sky-600 bg-sky-50'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-600'
              }`}
            >
              Delivery Areas & Fees
            </Link>
            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              {session ? (
                <div className="space-y-2">
                  <Link
                    href={session.user && (session.user as any).role === 'RIDER' ? '/rider' : '/admin'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    Pumunta sa Staff Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      executeSignOut('/login');
                    }}
                    className="w-full text-center text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Mag-Log Out (Sign Out)</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold text-slate-600 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Staff Portal Login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

