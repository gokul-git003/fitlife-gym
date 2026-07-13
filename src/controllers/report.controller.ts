import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getFullReport = async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { member: { include: { user: true } } },
      orderBy: { date: 'desc' }
    });
    
    const memberships = await prisma.membership.findMany({
      include: { 
        member: { include: { user: true } },
        plan: true
      },
      orderBy: { startDate: 'desc' }
    });
    
    const attendance = await prisma.attendance.findMany({
      include: {
        member: { include: { user: true } },
        trainer: { include: { user: true } }
      },
      orderBy: { checkInTime: 'desc' }
    });

    // Format Data for frontend Table
    const formattedPayments = payments.map(p => ({
      ID: p.id,
      Member: p.member?.user?.name || p.member?.user?.username || 'Unknown',
      Amount: `$${p.amount}`,
      Date: new Date(p.date).toLocaleDateString(),
      Status: p.status
    }));

    const formattedMemberships = memberships.map(m => ({
      ID: m.id,
      Member: m.member?.user?.name || m.member?.user?.username || 'Unknown',
      Plan: m.plan.name,
      Start_Date: new Date(m.startDate).toLocaleDateString(),
      End_Date: new Date(m.endDate).toLocaleDateString(),
      Status: m.status
    }));

    const formattedAttendance = attendance.map(a => {
      const isMember = !!a.memberId;
      const user = isMember ? a.member?.user : a.trainer?.user;
      return {
        ID: a.id,
        Person: user?.name || user?.username || 'Unknown',
        Role: isMember ? 'Member' : 'Trainer',
        Check_In: new Date(a.checkInTime).toLocaleString(),
        Check_Out: a.checkOutTime ? new Date(a.checkOutTime).toLocaleString() : 'N/A',
        Status: a.status
      };
    });

    res.json({
      payments: formattedPayments.length > 0 ? formattedPayments : [{Message: "No data"}],
      memberships: formattedMemberships.length > 0 ? formattedMemberships : [{Message: "No data"}],
      attendance: formattedAttendance.length > 0 ? formattedAttendance : [{Message: "No data"}]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};
