import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

if (!secret) {
  // Don't throw at import-time in prod builds that read files without env; functions using it will throw instead.
}

export function signQrToken({ id, name, ttlSeconds = 120 }) {
  if (!secret) throw new Error('JWT_SECRET not set');
  const payload = { id, name };
  const token = jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: ttlSeconds });
  return token;
}

export function verifyQrToken(token) {
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.verify(token, secret, { algorithms: ['HS256'] });
}
