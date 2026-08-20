import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updatePreferences,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
router.put('/profile', protect, updateProfile);

export default router;
