'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
    },
  });

  return user;
}

export type UpdateUserProfileState = {
  message?: string;
  error?: string;
};

export async function updateUserProfile(
  prevState: UpdateUserProfileState,
  formData: FormData
): Promise<UpdateUserProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const phone = (formData.get('phone') as string)?.trim() || null;

  if (!name || name.trim() === '') {
    return { error: 'Name is required' };
  }

  // Phone number validation
  if (phone) {
    const cleanedPhone = phone.replace(/[\s\-\+]/g, '');

    if (!/^\d+$/.test(cleanedPhone)) {
      return { error: 'Phone number must contain only digits (e.g., 628123456789)' };
    }

    if (!cleanedPhone.startsWith('62')) {
      return { error: 'Phone number must start with country code 62 (e.g., 628123456789)' };
    }

    // Check minimum length (country code + at least 8 digits)
    if (cleanedPhone.length < 10) {
      return { error: 'Phone number is too short' };
    }

    // Check if phone number is already used by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: cleanedPhone,
        id: { not: session.user.id }, // Exclude current user
      },
      select: { id: true },
    });

    if (existingUser) {
      return { error: 'This phone number is already registered to another account' };
    }
  }

  try {
    // Store the cleaned phone number (digits only)
    const cleanedPhone = phone ? phone.replace(/[\s\-\+]/g, '') : null;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: cleanedPhone,
      },
    });

    revalidatePath('/settings/profile');
    return { message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile' };
  }
}

