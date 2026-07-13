import { Router } from 'express';
import { getFullReport } from '../controllers/report.controller';

const router = Router();

router.get('/full', getFullReport);

export default router;
