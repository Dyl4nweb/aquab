import React from 'react';
import { prisma } from '@/lib/prisma';
import { SettingsClient } from './SettingsClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
    redirect('/admin');
  }

  const settings = await prisma.businessSetting.findFirst({
    where: { id: 'default' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Station & Business Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business operating hours, GCash payment account, municipality, and default fees
        </p>
      </div>

      <SettingsClient initialSettings={settings as any} />
    </div>
  );
}

