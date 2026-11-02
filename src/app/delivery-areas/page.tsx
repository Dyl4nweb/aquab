import React from 'react';
import { prisma } from '@/lib/prisma';
import { DeliveryAreasClient } from './DeliveryAreasClient';

export const revalidate = 0;

export const metadata = {
  title: 'Delivery Areas & Coverage — Aqua B Water Station',
  description: 'View supported barangays and delivery fees across Pangapisan, Lingayen, Pangasinan.',
};

export default async function DeliveryAreasPage() {
  const [barangays, settings] = await Promise.all([
    prisma.barangay.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.businessSetting.findFirst({
      where: { id: 'default' },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <DeliveryAreasClient 
        barangays={barangays as any} 
        settings={settings as any} 
      />
    </div>
  );
}

