import React from 'react';
import { prisma } from '@/lib/prisma';
import { StaffClient } from './StaffClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminStaffPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
    redirect('/admin');
  }

  const staff = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { assignments: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Staff Account Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Create, configure, and monitor Station Administrators and Delivery Riders
        </p>
      </div>

      <StaffClient initialStaff={staff as any} />
    </div>
  );
}

