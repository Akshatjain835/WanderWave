import express from 'express';
import { analyzeTripRequest, resumeTripRequest } from '../controllers/tripController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzeTripRequest);
router.post('/resume', protect, resumeTripRequest);

export default router;
