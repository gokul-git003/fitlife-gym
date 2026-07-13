import { Router } from 'express';
import { getClasses, updateClass, getDashboardStats, assignWorkout, getTrainerCalendar } from '../controllers/trainer.controller';

const router = Router();

router.get('/classes', getClasses);
router.put('/classes/:id', updateClass);
router.get('/dashboard', getDashboardStats);
router.post('/workouts', assignWorkout);
router.get('/:id/calendar', getTrainerCalendar);

export default router;
