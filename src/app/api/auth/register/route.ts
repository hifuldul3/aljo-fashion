import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, adminCode } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if email already registered
    const existingEmail = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in instead.' },
        { status: 400 }
      );
    }

    // 2. Check if phone already registered (if phone is provided)
    if (phone && phone.trim()) {
      const normalizedPhone = phone.trim();
      const existingPhone = await prisma.user.findFirst({
        where: { phone: normalizedPhone },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists. Please sign in or use a different phone number.' },
          { status: 400 }
        );
      }
    }

    // Determine account role (Default: CUSTOMER, if valid Admin Key provided -> ADMIN)
    let assignedRole = 'CUSTOMER';
    if (adminCode && (adminCode.trim().toUpperCase() === 'ALJO-OWNER-2026' || adminCode.trim() === 'admin123')) {
      assignedRole = 'ADMIN';
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        role: assignedRole,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });

    response.cookies.set('aljo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal registration error' }, { status: 500 });
  }
}
