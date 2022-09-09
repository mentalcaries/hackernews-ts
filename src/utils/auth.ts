import * as jwt from 'jsonwebtoken';
export const APP_SECRET = 'GraphQL-is-aw3some';

export interface AuthTokenPayload {
  userId: number;
}

export function decodeAuthHeader(authheader: String): AuthTokenPayload {
  const token = authheader.replace('Bearer ', '');
  if (!token) {
    throw new Error('No token found');
  }
  return jwt.verify(token, APP_SECRET) as AuthTokenPayload;
}
