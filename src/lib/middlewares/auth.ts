import { Context, Env, Next } from 'hono';
import httpStatus from 'http-status';
import { getSession } from '../auth';

import APIError from '../api-error';

export const isAuthenticated = async (c: Context<Env, string>, next: Next) => {
  const session = await getSession();
  if (!session) {
    throw new APIError('Unauthorized', httpStatus.UNAUTHORIZED);
  }

  c.set('user', session.user);

  return next();
};

export const optionalAuth = async (c: Context<Env, string>, next: Next) => {
  const session = await getSession();
  if (session) {
    c.set('user', session.user);
  }
  return next();
};

export const isAdmin = async (c: Context<Env, string>, next: Next) => {
  const session = await getSession();
  if (!session) {
    throw new APIError('Unauthorized', httpStatus.UNAUTHORIZED);
  }

  if (session.user.role !== 'admin') {
    throw new APIError('Forbidden', httpStatus.FORBIDDEN);
  }

  c.set('user', session.user);

  return next();
};
