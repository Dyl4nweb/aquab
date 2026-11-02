import React from 'react';
import { prisma } from '@/lib/prisma';
import { BarangaysClient } from './BarangaysClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminBarangaysPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
    redirect('/admin');
  }

  const [barangays, settings] = await Promise.all([
    prisma.barangay.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    }),
    prisma.businessSetting.findFirst({
      where: { id: 'default' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Municipality & Barangay Coverage Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage supported delivery areas, configure fee per barangay, and toggle active delivery zones
        </p>
      </div>

      <BarangaysClient
        initialBarangays={barangays as any}
        municipality={settings?.municipality || 'Lingayen, Pangasinan'}
      />
    </div>
  );
}

