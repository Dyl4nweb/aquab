import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { RiderClient } from './RiderClient';

export const revalidate = 0;

export default async function RiderDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  // Fetch only this rider's assignments
  const assignments = await prisma.deliveryAssignment.findMany({
    where: {
      riderId: userId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        include: {
          items: true,
          barangay: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <RiderClient 
        initialAssignments={assignments as any} 
        rider={session.user} 
      />
    </div>
  );
}

