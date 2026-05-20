import { createHmac, timingSafeEqual } from 'node:crypto';

const DEFAULT_ADMIN_USERNAME = 'Owner';
const DEFAULT_ADMIN_PASSWORD = 'NikahanKitaEvid';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;

function getSecret() {
  return process.env.SESSION_SECRET || 'nikahfix-development-session-secret';
}

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function sign(value) {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function safeEqual(a = '', b = '') {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function validateAdminCredentials(username, password) {
  const expectedUsername = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function signAdminToken(username) {
  const payload = base64Url(
    JSON.stringify({
      sub: username,
      role: 'admin',
      exp: Date.now() + TOKEN_TTL_MS,
    }),
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token = '') {
  const [payload, signature] = String(token).split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (claims.role !== 'admin' || !claims.exp || claims.exp < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

export function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : '';
}

export function requireAdmin(req, res) {
  const claims = verifyAdminToken(getBearerToken(req));
  if (claims) return claims;
  res.status(401).json({ ok: false, error: 'Admin authorization required.' });
  return null;
}
