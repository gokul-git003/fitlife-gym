import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logAudit = async (action: string, userId: string | null, userRole: string | null, details: string) => {
  try {
    await (prisma as any).auditLog.create({
      data: {
        action,
        userId,
        userRole,
        details
      }
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};
