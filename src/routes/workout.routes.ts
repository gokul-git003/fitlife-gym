import { Router } from 'express';
import { getWorkoutsForMember, getWorkoutsForTrainer, assignWorkout, completeExercise, updateWorkout, deleteWorkout } from '../controllers/workout.controller';

const router = Router();

router.get('/:member_id', getWorkoutsForMember);
router.get('/trainer/:trainer_id', getWorkoutsForTrainer);
router.post('/', assignWorkout);
router.post('/exercise/complete', completeExercise);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

export default router;
