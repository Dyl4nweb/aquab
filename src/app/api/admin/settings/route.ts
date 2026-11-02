import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const body = await req.json();

    const updated = await prisma.businessSetting.upsert({
      where: { id: 'default' },
      update: {
        businessName: body.businessName,
        tagline: body.tagline,
        municipality: body.municipality,
        address: body.address,
        phone: body.phone,
        email: body.email,
        openingHour: body.openingHour,
        closingHour: body.closingHour,
        operatingDays: body.operatingDays,
        gcashNumber: body.gcashNumber,
        gcashName: body.gcashName,
        defaultDeliveryFee: parseFloat(body.defaultDeliveryFee || 25),
        containerDepositFee: parseFloat(body.containerDepositFee || 180),
        announcement: body.announcement || null,
      },
      create: {
        id: 'default',
        businessName: body.businessName || 'Aqua B Water Station',
        tagline: body.tagline || 'Pure, Refreshing & Reliable Drinking Water Delivery',
        municipality: body.municipality || 'Lingayen, Pangasinan',
        address: body.address || 'Pangapisan North, Lingayen, Pangasinan',
        phone: body.phone || '+63 917 888 2782',
        email: body.email || 'orders@aquabwater.ph',
        openingHour: body.openingHour || '07:00 AM',
        closingHour: body.closingHour || '07:00 PM',
        operatingDays: body.operatingDays || 'Monday to Sunday',
        gcashNumber: body.gcashNumber || '0917-888-2782',
        gcashName: body.gcashName || 'AQUA B WATER STATION',
        defaultDeliveryFee: parseFloat(body.defaultDeliveryFee || 25),
        containerDepositFee: parseFloat(body.containerDepositFee || 180),
        announcement: body.announcement || null,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}

