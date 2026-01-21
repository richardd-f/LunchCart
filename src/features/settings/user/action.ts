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
  const phone = formData.get('phone') as string;

  if (!name || name.trim() === '') {
    return { error: 'Name is required' };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
      },
    });

    revalidatePath('/settings/profile');
    return { message: 'Profile updated successfully' };
  } catch (error) {
        console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile' };
  }
}
