import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { query, queryOne } from './db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export function formatUser(user) {
  if (!user) return null;
  const formatted = { ...user };
  delete formatted.password;
  delete formatted.remember_token;
  formatted.is_active = Boolean(user.is_active);
  if (formatted.avatar_url && !formatted.avatar_url.startsWith('http')) {
    formatted.avatar_url = BACKEND_URL
      ? `${BACKEND_URL}${formatted.avatar_url.startsWith('/') ? '' : '/'}${formatted.avatar_url}`
      : (formatted.avatar_url.startsWith('/') ? formatted.avatar_url : `/${formatted.avatar_url}`);
  }
  return formatted;
}

export function formatBookCover(coverImage) {
  if (!coverImage) {
    return 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
  }
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage;
  }
  return BACKEND_URL
    ? `${BACKEND_URL}${coverImage.startsWith('/') ? '' : '/'}${coverImage}`
    : (coverImage.startsWith('/') ? coverImage : `/${coverImage}`);
}

export function verifyPassword(plainPassword, hashedPassword) {
  if (!hashedPassword) return false;
  // Normalize Laravel $2y$ prefix for bcryptjs compatibility
  const normalizedHash = hashedPassword.replace(/^\$2y\$/, '$2a$');
  return bcrypt.compareSync(plainPassword, normalizedHash);
}

export function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, 10);
}

export async function createAuthToken(userId, ttlDays = 7) {
  const rawToken = crypto.randomBytes(24).toString('hex');
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);

  const result = await query(
    `INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, abilities, expires_at, created_at, updated_at)
     VALUES (?, ?, 'auth_token', ?, '["*"]', ?, ?, ?)`,
    ['App\\Models\\User', userId, hashed, expiresAt, now, now]
  );

  return `${result.insertId}|${rawToken}`;
}

export async function getAuthUser(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    let bearer = '';

    if (authHeader.startsWith('Bearer ')) {
      bearer = authHeader.slice(7).trim();
    } else if (request.url) {
      const { searchParams } = new URL(request.url);
      bearer = (searchParams.get('token') || '').trim();
    }

    if (!bearer) return null;

    let rawToken = bearer;
    let tokenId = null;

    if (bearer.includes('|')) {
      const parts = bearer.split('|');
      tokenId = Number(parts[0]);
      rawToken = parts[1];
    }

    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    let tokenRecord = null;
    if (tokenId) {
      tokenRecord = await queryOne(
        'SELECT * FROM personal_access_tokens WHERE id = ? AND token = ? LIMIT 1',
        [tokenId, hashed]
      );
    } else {
      tokenRecord = await queryOne(
        'SELECT * FROM personal_access_tokens WHERE token = ? LIMIT 1',
        [hashed]
      );
    }

    if (!tokenRecord) return null;

    if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
      await query('DELETE FROM personal_access_tokens WHERE id = ?', [tokenRecord.id]);
      return null;
    }

    const user = await queryOne('SELECT * FROM users WHERE id = ? LIMIT 1', [
      tokenRecord.tokenable_id,
    ]);
    if (!user || !user.is_active) return null;

    query('UPDATE personal_access_tokens SET last_used_at = ? WHERE id = ?', [
      new Date(),
      tokenRecord.id,
    ]).catch(() => {});

    user._token_id = tokenRecord.id;
    return formatUser(user);
  } catch (err) {
    console.error('Auth error:', err);
    return null;
  }
}

export async function requireAuth(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { message: 'Vui lòng đăng nhập để thực hiện thao tác này.' },
        { status: 401 }
      ),
    };
  }
  return { user, errorResponse: null };
}

export async function requireRole(request, allowedRoles = []) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse) return { user: null, errorResponse };

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { message: 'Bạn không có quyền truy cập chức năng này!' },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

export async function revokeCurrentToken(user) {
  if (user && user._token_id) {
    await query('DELETE FROM personal_access_tokens WHERE id = ?', [user._token_id]);
  }
}
