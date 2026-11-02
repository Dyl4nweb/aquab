'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, LogOut, ShieldCheck, MapPin, Bell } from 'lucide-react';

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
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-1 text-xs font-semibold"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

