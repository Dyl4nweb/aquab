'use client';

import React from 'react';
import Link from 'next/link';
import { User, LogOut, ShieldCheck, MapPin, Bell } from 'lucide-react';
import { executeSignOut } from '@/lib/logout';

export function AdminTopNav({ user }: { user: any }) {
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
      <div className="flex items-center space-x-2">
        <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          <span>Pangapisan, Lingayen Station</span>
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* User Profile Info */}
        <div className="flex items-center space-x-2 text-right">
          <div className="hidden sm:block">
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              {user?.name || 'Staff User'}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 block">
              {user?.email}
            </span>
          </div>
          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
            isSuperAdmin
              ? 'bg-purple-100 text-purple-700 border border-purple-200'
              : 'bg-sky-100 text-sky-700 border border-sky-200'
          }`}>
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={() => executeSignOut('/login')}
          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 transition-colors flex items-center space-x-1.5 text-xs font-bold shadow-sm"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}

