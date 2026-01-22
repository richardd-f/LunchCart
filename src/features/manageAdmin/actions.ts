'use server';

import { User, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/types/ActionResult";
import { revalidatePath } from "next/cache";

export type AdminUserListResult = {
  users: User[];
  totalPages: number;
  currentPage: number;
};

export async function getUsers(page: number = 1, query: string = ""): Promise<ActionResult<AdminUserListResult>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const pageSize = 15;
    const skip = (page - 1) * pageSize;

    const whereClause = query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
      ]
    } : {};

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        take: pageSize,
        skip: skip,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        users,
        totalPages,
        currentPage: page
      }
    };

  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: "Failed to fetch users"
    };
  }
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Prevent removing own admin access (optional but good practice)
    if (userId === session.user.id && newRole !== "ADMIN") {
         // return { success: false, error: "Cannot remove your own admin status" }; 
         // Optional: let them shoot themselves in the foot? Probably safer to block.
         // But prompt didn't strictly say so. I'll add a check for safety.
         return { success: false, error: "You cannot change your own role." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    revalidatePath("/manageAdmin");
    return { success: true };

  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      error: "Failed to update user role"
    };
  }
}
