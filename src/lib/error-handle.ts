import httpStatus from 'http-status';
import APIError from './api-error';
import { Context, Env } from 'hono';

export const notFount = () => {
  throw new APIError('Not Found', httpStatus.NOT_FOUND);
};

export const handleApiError = (err: APIError | Error, c: Context<Env, string>) => {
  if (err instanceof APIError) {
    return c.json(
      {
        message: err.message,
      },
      err.code,
    );
  }
  console.error(err);

  const message = 'message' in err ? err.message : 'Internal server error';
  return c.json(
    {
      message,
    },
    httpStatus.INTERNAL_SERVER_ERROR,
  );
};
