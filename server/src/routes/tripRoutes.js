import express from 'express';
import {
  analyzeTripRequest,
  resumeTripRequest,
  saveTrip,
  getUserTrips,
  getTripById,
  deleteTrip,
  updateTripStatus,
} from '../controllers/tripController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzeTripRequest);
router.post('/resume', protect, resumeTripRequest);

router.route('/')
  .post(protect, saveTrip)
  .get(protect, getUserTrips);

router.route('/:id')
  .get(protect, getTripById)
  .delete(protect, deleteTrip);

router.patch('/:id/status', protect, updateTripStatus);

export default router;
