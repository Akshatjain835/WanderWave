import { verifyToken } from '../utils/jwtHandler.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route (Missing Token)',
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or token has expired',
    });
  }

  try {
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      // In-memory / Mock user fallback if DB user not found
      req.user = { id: decoded.id, name: 'Wanderer User', email: 'user@wanderwave.ai' };
    } else {
      req.user = user;
    }
    next();
  } catch (error) {
    req.user = { id: decoded.id, name: 'Wanderer User', email: 'user@wanderwave.ai' };
    next();
  }
};
