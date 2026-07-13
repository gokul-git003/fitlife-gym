import { Router } from 'express';
import { memberCheckIn, memberCheckOut, trainerCheckIn, trainerCheckOut, getAllAttendance } from '../controllers/attendance.controller';

const router = Router();

router.get('/', getAllAttendance);
router.post('/member/checkin', memberCheckIn);
router.post('/member/checkout', memberCheckOut);
router.post('/trainer/checkin', trainerCheckIn);
router.post('/trainer/checkout', trainerCheckOut);

export default router;
