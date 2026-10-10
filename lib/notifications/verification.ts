import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'vanguard-erp-secret-key-fallback';

export function generateVerificationToken(payload: any): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

export function generateAlertToken(payload: { employeeId: string; tenantId: string; phone: string }): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

export function verifyAlertToken(token: string): { valid: boolean; payload?: any } {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false };
  }
}
