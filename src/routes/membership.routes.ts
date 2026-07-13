import { Router } from 'express';
import { getPlans, createPlan, deletePlan, updatePlan, assignMembership, renewMembership } from '../controllers/membership.controller';

const router = Router();

router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

router.post('/assign', assignMembership);
router.post('/renew', renewMembership);
router.post('/upgrade', renewMembership);

export default router;
