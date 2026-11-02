import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      name, 
      phone, 
      address, 
      barangayId, 
      barangayName, 
      notes, 
      isSuki, 
      creditLimit 
    } = body;

    const existing: any[] = await prisma.$queryRawUnsafe(
      'SELECT id FROM "Customer" WHERE id = $1 LIMIT 1',
      params.id
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Hindi natagpuan ang kliyente.' }, { status: 404 });
    }

    // Check phone uniqueness if changing
    if (phone) {
      const conflict: any[] = await prisma.$queryRawUnsafe(
        'SELECT id FROM "Customer" WHERE phone = $1 AND id != $2 AND "isActive" = true LIMIT 1',
        phone.trim(),
        params.id
      );
      if (conflict && conflict.length > 0) {
        return NextResponse.json(
          { error: 'May ibang kliyente nang gumagamit ng numerong ito.' },
          { status: 400 }
        );
      }
    }

    const updated: any[] = await prisma.$queryRawUnsafe(
      `UPDATE "Customer" 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           "barangayId" = COALESCE($4, "barangayId"),
           "barangayName" = COALESCE($5, "barangayName"),
           notes = COALESCE($6, notes),
           "isSuki" = COALESCE($7, "isSuki"),
           "creditLimit" = COALESCE($8, "creditLimit"),
           "updatedAt" = NOW()
       WHERE id = $9
       RETURNING *`,
      name ? name.trim() : null,
      phone ? phone.trim() : null,
      address !== undefined ? address.trim() : null,
      barangayId !== undefined ? barangayId : null,
      barangayName !== undefined ? barangayName : null,
      notes !== undefined ? notes.trim() : null,
      isSuki !== undefined ? Boolean(isSuki) : null,
      creditLimit !== undefined ? parseFloat(creditLimit) : null,
      params.id
    );

    return NextResponse.json({ success: true, customer: updated[0] });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Soft delete / deactivate
    await prisma.$executeRawUnsafe(
      'UPDATE "Customer" SET "isActive" = false, "updatedAt" = NOW() WHERE id = $1',
      params.id
    );

    return NextResponse.json({ success: true, message: 'Matagumpay na natanggal ang kliyente.' });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

