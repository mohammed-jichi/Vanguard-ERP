import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vanguard-erp-notification-secret-2026';

export interface AlertTokenPayload {
  employeeId: string;
  tenantId: string;
  phone?: string;
  name?: string;
  channel?: string;
  recipient?: string;
}

/**
 * Generates a signed token for WhatsApp Business verification.
 * Expires in 7 days to give employees ample time to verify their channels.
 */
export function generateAlertToken(payload: AlertTokenPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  } catch (error) {
    console.error('[Verification] Error generating alert token:', error);
    throw new Error('Failed to generate verification token');
  }
}

/**
 * Verifies and decodes a WhatsApp Business alert verification token.
 */
export function verifyAlertToken(token: string): { valid: boolean; payload?: AlertTokenPayload; error?: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    return {
      valid: true,
      payload: {
        employeeId: decoded.employeeId,
        tenantId: decoded.tenantId,
        phone: decoded.phone
      }
    };
  } catch (error: any) {
    console.error('[Verification] Token verification failed:', error.message);
    return {
      valid: false,
      error: error.message
    };
  }
}
