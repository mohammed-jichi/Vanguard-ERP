import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'vanguard-erp-secure-secret-key-2024';

export interface VerificationTokenPayload {
  tenantId: string;
  employeeId: string;
  name: string;
  channel: 'whatsapp' | 'email';
  recipient: string;
  exp: number;
}

export function generateVerificationToken(payload: Omit<VerificationTokenPayload, 'exp'>): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const fullPayload: VerificationTokenPayload = { ...payload, exp };
  
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
    
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): VerificationTokenPayload | null {
  try {
    const [header, body, signature] = token.split('.');
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as VerificationTokenPayload;
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
