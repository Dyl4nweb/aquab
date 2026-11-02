'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Warehouse, 
  BarChart3, 
  MapPin, 
  Users, 
  Settings, 
  Droplets, 
  ExternalLink,
  ShieldCheck,
  LogOut,
  UserCheck
} from 'lucide-react';
import { executeSignOut } from '@/lib/logout';

export function AdminSidebar({ role, user }: { role: string; user: any }) {
  const pathname = usePathname();
  const isSuperAdmin = role === 'SUPER_ADMIN';

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Order Management', icon: ShoppingBag },
    { href: '/admin/clients', label: 'Client Orders & Balances', icon: Users },
    { href: '/admin/products', label: 'Products & Categories', icon: Package },
    { href: '/admin/inventory', label: 'Inventory & Gallons', icon: Warehouse },
    { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const superAdminItems = [
    { href: '/admin/barangays', label: 'Barangays & Fees', icon: MapPin },
    { href: '/admin/staff', label: 'Staff Management', icon: Users },
    { href: '/admin/settings', label: 'Business Settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-xl font-black text-white">Aqua</span>
              <span className="text-xl font-black text-sky-400">B</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
              {isSuperAdmin ? 'Super Admin Portal' : 'Admin Operations'}
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Operations
          </span>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <div className="space-y-1 pt-4 border-t border-slate-800">
            <div className="px-3 flex items-center space-x-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                Super Admin Controls
              </span>
            </div>
            {superAdminItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: User profile & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <span>View Customer Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Current user card */}
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">
              {user?.name || 'Staff User'}
            </span>
            <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block">
              {isSuperAdmin ? 'Super Admin' : 'Admin User'}
            </span>
          </div>

          <button
            onClick={() => executeSignOut('/login')}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all shadow-sm flex items-center justify-center shrink-0"
            title="Mag-log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Explicit Sign Out Button */}
        <button
          onClick={() => executeSignOut('/login')}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-slate-700/80 hover:border-rose-500 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Mag-Log Out (Sign Out)</span>
        </button>
      </div>
    </aside>
  );
}

