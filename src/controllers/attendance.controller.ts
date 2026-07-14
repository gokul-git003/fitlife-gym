import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { logAudit } from '../utils/audit';

export const memberCheckIn = async (req: Request, res: Response) => {
  const member_id = req.body.member_id || req.body.memberId;
  try {
    const attendance = await prisma.attendance.create({
      data: { memberId: member_id, status: 'checked_in' },
      include: { member: { include: { user: true } } }
    });
    if (attendance.member?.user) {
      await logAudit('MEMBER_CHECKIN', attendance.member.user.id, 'member', `Member ${attendance.member.user.name || attendance.member.user.username} checked in`);
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const memberCheckOut = async (req: Request, res: Response) => {
  const member_id = req.body.member_id || req.body.memberId;
  try {
    const attendance = await prisma.attendance.findFirst({
      where: { memberId: member_id, status: 'checked_in' },
      orderBy: { checkInTime: 'desc' },
      include: { member: { include: { user: true } } }
    });
    if (!attendance) return res.status(404).json({ error: 'Not checked in' });
    
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: { status: 'checked_out', checkOutTime: new Date() }
    });
    
    if (attendance.member?.user) {
      await logAudit('MEMBER_CHECKOUT', attendance.member.user.id, 'member', `Member ${attendance.member.user.name || attendance.member.user.username} checked out`);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const trainerCheckIn = async (req: Request, res: Response) => {
  const trainer_id = req.body.trainer_id || req.body.trainerId;
  try {
    const attendance = await prisma.attendance.create({
      data: { trainerId: trainer_id, status: 'checked_in' },
      include: { trainer: { include: { user: true } } }
    });
    if (attendance.trainer?.user) {
      await logAudit('TRAINER_CHECKIN', attendance.trainer.user.id, 'trainer', `Trainer ${attendance.trainer.user.name || attendance.trainer.user.username} checked in`);
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const trainerCheckOut = async (req: Request, res: Response) => {
  const trainer_id = req.body.trainer_id || req.body.trainerId;
  try {
    const attendance = await prisma.attendance.findFirst({
      where: { trainerId: trainer_id, status: 'checked_in' },
      orderBy: { checkInTime: 'desc' },
      include: { trainer: { include: { user: true } } }
    });
    if (!attendance) return res.status(404).json({ error: 'Not checked in' });
    
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: { status: 'checked_out', checkOutTime: new Date() }
    });
    
    if (attendance.trainer?.user) {
      await logAudit('TRAINER_CHECKOUT', attendance.trainer.user.id, 'trainer', `Trainer ${attendance.trainer.user.name || attendance.trainer.user.username} checked out`);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const records = await prisma.attendance.findMany({
      orderBy: { checkInTime: 'desc' },
      include: {
        member: { include: { user: true } },
        trainer: { include: { user: true } }
      }
    });
    
    // Map to frontend expected format
    const formatted = records.map(r => ({
      ...r,
      name: r.member?.user.name || r.member?.user.username || r.trainer?.user.name || r.trainer?.user.username || 'Unknown',
      role: r.memberId ? 'member' : 'trainer',
      check_in_time: r.checkInTime,
      check_out_time: r.checkOutTime
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
