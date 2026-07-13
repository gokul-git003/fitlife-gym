import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getClasses = async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.query;
    const whereClause = trainerId ? { trainerId: String(trainerId) } : {};
    
    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
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
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, schedule_time, capacity } = req.body;
    
    const updated = await prisma.class.update({
      where: { id },
      data: {
        name,
        startTime: new Date(schedule_time),
        capacity: Number(capacity)
      }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update class' });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const todayClasses = await prisma.class.findMany({
      take: 3,
      orderBy: { startTime: 'asc' },
      include: { bookings: true }
    });
    
    const members = await prisma.user.findMany({
      where: { role: 'member' },
      select: { id: true, name: true }
    });
    
    res.json({
      todayClasses,
      members
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trainer dashboard' });
  }
};

export const assignWorkout = async (req: Request, res: Response) => {
  const { memberId, trainerId, title, details } = req.body;
  if (!memberId || !trainerId || !title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const workout = await prisma.workout.create({
      data: {
        title,
        details,
        memberId,
        trainerId
      }
    });
    res.json(workout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assign workout' });
  }
};

export const getTrainerCalendar = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id as string;
    // Get the trainer profile first
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId }
    });
    
    if (!trainerProfile) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const classes = await prisma.class.findMany({
      where: { trainerId: trainerProfile.id },
      include: { bookings: true }
    });
    
    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch calendar classes' });
  }
};
