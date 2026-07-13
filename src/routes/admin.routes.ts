import { Router } from 'express';
import { getDashboardStats, getAdvancedStats, getMembers, getTrainers, createMember, deleteMember, updateMember, createTrainer, deleteTrainer, updateTrainer, getCalendarClasses, getSettings, updateSettings, getAuditLogs } from '../controllers/admin.controller';

const router = Router();

// In a real app, protect these with auth & role checking middleware
router.get('/dashboard', getDashboardStats);
router.get('/dashboard/advanced', getAdvancedStats);
router.get('/calendar', getCalendarClasses);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/audit', getAuditLogs);

router.get('/members', getMembers);
router.post('/members', createMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);

router.get('/trainers', getTrainers);
router.post('/trainers', createTrainer);
router.put('/trainers/:id', updateTrainer);
router.delete('/trainers/:id', deleteTrainer);

export default router;
