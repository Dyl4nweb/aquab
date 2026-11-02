import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, pin, role = 'ADMIN', phone = '' } = body;

    if (!name || !email || !pin) {
      return NextResponse.json(
        { error: 'Kailangang punan ang Pangalan, Email, at 4-Digit PIN.' },
        { status: 400 }
      );
    }

    const cleanPin = String(pin).trim();
    if (cleanPin.length < 4) {
      return NextResponse.json(
        { error: 'Dapat hindi bababa sa 4 digits ang PIN.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Check if email already exists
    const existingEmail: any[] = await prisma.$queryRawUnsafe(
      'SELECT id FROM "User" WHERE email = $1 LIMIT 1',
      cleanEmail
    );
    if (existingEmail && existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'May gumagamit na ng email na ito.' },
        { status: 400 }
      );
    }

    // Check if PIN is already taken by another user
    const existingPin: any[] = await prisma.$queryRawUnsafe(
      'SELECT id, name FROM "User" WHERE pin = $1 LIMIT 1',
      cleanPin
    );
    if (existingPin && existingPin.length > 0) {
      return NextResponse.json(
        { error: 'May gumagamit na ng PIN na ito. Pumili ng ibang PIN.' },
        { status: 400 }
      );
    }

    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'RIDER'];
    const assignedRole = validRoles.includes(role) ? role : 'ADMIN';

    // Hash default password
    const hashedPassword = await bcrypt.hash(`PinPass-${cleanPin}!`, 10);

    // Insert user into PostgreSQL
    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" (id, name, email, password, pin, role, phone, "isActive", "createdAt", "updatedAt") 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::"Role", $6, true, NOW(), NOW())`,
      name.trim(),
      cleanEmail,
      hashedPassword,
      cleanPin,
      assignedRole,
      phone ? phone.trim() : null
    );

    return NextResponse.json({
      success: true,
      message: 'Matagumpay na nagawa ang account! Maaari ka nang mag-login gamit ang iyong PIN.',
      role: assignedRole,
      pin: cleanPin,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Hindi matapos ang pagrehistro. Pakisubukang muli.' },
      { status: 500 }
    );
  }
}

