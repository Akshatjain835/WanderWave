import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'wkbvwbiuboqnqopm532bibobbbWKAKKWBBWJF';
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
