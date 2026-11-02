import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM "Customer" WHERE "isActive" = true ORDER BY "createdAt" DESC'
    );

    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      name, 
      phone, 
      address = '', 
      barangayId = null, 
      barangayName = '', 
      notes = '', 
      isSuki = false, 
      creditLimit = 1000 
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Pangalan at Telepono (Phone number) ay kinakailangan.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();

    // Check if phone already exists
    const existing: any[] = await prisma.$queryRawUnsafe(
      'SELECT id, name FROM "Customer" WHERE phone = $1 AND "isActive" = true LIMIT 1',
      cleanPhone
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: `May nakarehistro nang kliyente gamit ang numerong ito (${existing[0].name}).` },
        { status: 400 }
      );
    }

    // Insert new customer
    const inserted: any[] = await prisma.$queryRawUnsafe(
      `INSERT INTO "Customer" (id, name, phone, address, "barangayId", "barangayName", notes, "isSuki", "currentBalance", "creditLimit", "isActive", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 0, $8, true, NOW(), NOW())
       RETURNING *`,
      name.trim(),
      cleanPhone,
      address.trim(),
      barangayId,
      barangayName,
      notes.trim(),
      Boolean(isSuki),
      parseFloat(creditLimit) || 1000
    );

    return NextResponse.json({ success: true, customer: inserted[0] });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

