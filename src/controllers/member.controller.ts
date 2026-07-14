import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAvailableClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        trainer: true,
        bookings: true
      },
      orderBy: { startTime: 'asc' }
    });
    const formatted = classes.map(c => ({
      ...c,
      schedule_time: c.startTime
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch available classes' });
  }
};

import { logAudit } from '../utils/audit';

export const bookClass = async (req: Request, res: Response) => {
  const { classId, memberId } = req.body;
  if (!classId || !memberId) {
    return res.status(400).json({ error: 'Class ID and Member ID required' });
  }

  try {
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: { bookings: true }
    });

    if (!targetClass) return res.status(404).json({ error: 'Class not found' });
    const status = targetClass.bookings.length >= targetClass.capacity ? 'waitlist' : 'booked';

    // Check if already booked
    const existing = await prisma.booking.findFirst({
      where: { classId, memberId }
    });
    if (existing) return res.status(400).json({ error: 'Already booked' });

    const booking = await prisma.booking.create({
      data: {
        classId,
        memberId,
        status
      },
      include: {
        member: { include: { user: true } }
      }
    });

    if (booking.member?.user) {
      await logAudit('CLASS_BOOKED', booking.member.user.id, 'member', `Member ${booking.member.user.name || booking.member.user.username} booked class ${targetClass.name}`);
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to book class' });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
      include: {
        member: { include: { user: true } },
        class: true
      }
    });
    
    if (booking.member?.user) {
      await logAudit('CLASS_CANCELLED', booking.member.user.id, 'member', `Member ${booking.member.user.name || booking.member.user.username} cancelled class ${booking.class.name}`);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

export const getBookingHistory = async (req: Request, res: Response) => {
  const { memberId } = req.query;
  try {
    const bookings = await prisma.booking.findMany({
      where: { memberId: String(memberId) },
      include: { class: { include: { trainer: { include: { user: true } } } } },
      orderBy: { class: { startTime: 'desc' } }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking history' });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const { memberId } = req.query;
  try {
    const workouts = await prisma.workout.findMany({
      where: { memberId: String(memberId) },
      orderBy: { date: 'desc' },
      take: 1,
      include: { trainer: { include: { user: true } } }
    });
    const upcomingClasses = await prisma.class.findMany({
      take: 3,
      orderBy: { startTime: 'asc' },
      include: { trainer: { include: { user: true } }, bookings: true }
    });
    res.json({
      nextWorkout: workouts[0] || null,
      upcomingClasses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch member dashboard' });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  const { memberId } = req.query;
  try {
    const payments = await prisma.payment.findMany({
      where: { memberId: String(memberId) },
      orderBy: { date: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

export const createClass = async (req: Request, res: Response) => {
  const { name, schedule_time, capacity, trainer_id } = req.body;
  try {
    const newClass = await prisma.class.create({
      data: {
        name,
        startTime: new Date(schedule_time),
        capacity: Number(capacity),
        trainerId: String(trainer_id)
      }
    });
    res.json(newClass);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create class' });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  const { member_id, amount, description } = req.body;
  try {
    const payment = await prisma.payment.create({
      data: {
        memberId: member_id,
        amount: Number(amount),
        status: 'completed',
        date: new Date()
      }
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment' });
  }
};
