import express from 'express';
const router = express.Router();
import metricas from '../routes/metricas.js';

router.use('/metricas', metricas);

export default router;