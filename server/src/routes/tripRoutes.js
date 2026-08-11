import express from 'express';
import { analyzeTripRequest } from '../controllers/tripController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzeTripRequest);

export default router;
