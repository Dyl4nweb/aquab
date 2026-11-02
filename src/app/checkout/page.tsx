import React from 'react';
import { prisma } from '@/lib/prisma';
import { CheckoutClient } from './CheckoutClient';

export const revalidate = 0;

export default async function CheckoutPage() {
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
      <CheckoutClient 
        barangays={barangays as any} 
        settings={settings as any} 
      />
    </div>
  );
}

