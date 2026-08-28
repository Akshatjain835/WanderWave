import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is not defined in production environment.');
    } else {
      console.warn('[SECURITY WARNING] JWT_SECRET environment variable is missing in development mode.');
      throw new Error('JWT_SECRET environment variable is missing. Set JWT_SECRET in server/.env');
    }
  }
  return secret;
};

const JWT_EXPIRES_IN = '30d';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (err) {
    return null;
  }
};
