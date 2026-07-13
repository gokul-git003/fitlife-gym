import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWorkoutsForMember = async (req: Request, res: Response) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { memberId: String(req.params.member_id) },
      orderBy: { date: 'desc' },
      include: {
        trainer: { include: { user: true } },
        exercises: true
      }
    });

    // Map to match the frontend expectations: trainer_name
    const formatted = workouts.map(w => ({
      ...w,
      trainer_name: w.trainer.user.name || w.trainer.user.username
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWorkoutsForTrainer = async (req: Request, res: Response) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { trainerId: String(req.params.trainer_id) },
      orderBy: { date: 'desc' },
      include: {
        member: { include: { user: true } },
        exercises: true
      }
    });
    const formatted = workouts.map(w => ({
      ...w,
      member_id: w.memberId,
      trainer_id: w.trainerId
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const assignWorkout = async (req: Request, res: Response) => {
  const { trainer_id, member_id, title, details, exercises } = req.body;
  try {
    const workout = await prisma.workout.create({
      data: {
        trainerId: trainer_id,
        memberId: member_id,
        title,
        details,
        exercises: {
          create: exercises ? exercises.map((ex: any) => ({
            name: ex.name,
            sets: Number(ex.sets) || 0,
            reps: Number(ex.reps) || 0
          })) : []
        }
      }
    });
    res.json({ success: true, workout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const completeExercise = async (req: Request, res: Response) => {
  const { exercise_id } = req.body;
  try {
    await prisma.workoutExercise.update({
      where: { id: exercise_id },
      data: { completed: 1 }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateWorkout = async (req: Request, res: Response) => {
  const { title, details } = req.body;
  try {
    const workout = await prisma.workout.update({
      where: { id: String(req.params.id) },
      data: { title, details }
    });
    res.json(workout);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteWorkout = async (req: Request, res: Response) => {
  try {
    await prisma.workout.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
