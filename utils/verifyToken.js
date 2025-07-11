import jwt from 'jsonwebtoken';

export function verifyToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s/, '');
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || 'supersecret';
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}
