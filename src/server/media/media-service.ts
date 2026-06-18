import { Context, Env } from 'hono';
import { z } from 'zod';
import httpStatus from 'http-status';
import APIError from '@/lib/api-error';

import prisma from '@/lib/prisma';

import { uploadService } from '../../lib/services/upload-service';
import mediaSchema from './media-schema';
import { Prisma } from '@prisma/client';

const createMedia = async (c: Context<Env, string>) => {
  const { file } = await c.req.parseBody();
  if (!file || !(file instanceof File)) {
    throw new APIError('Invalid file', httpStatus.BAD_REQUEST);
  }

  const result = await uploadService.upload({
    fileName: file.name,
    file,
    libraryMedia: true,
  });

  return result.media;
};

const getMedia = async (id: string) => {
  const result = await prisma.media.findFirst({
    where: { id },
  });

  if (!result) {
    throw new APIError('Media not found', httpStatus.NOT_FOUND);
  }

  return result;
};

const deleteMedia = async (ids: string[]) => {
  for (const id of ids) {
    await uploadService.deleteMediaByMediaId(id);
  }
};

const queryMedia = async (query: z.infer<typeof mediaSchema.mediaQuerySchema>) => {
  const { page, limit, search, sort, order, allowTypes } = query;

  const where: Prisma.MediaWhereInput = {
    libraryMedia: true,
    ...(search ? { fileName: { contains: search, mode: 'insensitive' } } : {}),
    ...(allowTypes
      ? {
          OR: allowTypes
            .split(',')
            .map((type) => ({ mimeType: { startsWith: type, mode: 'insensitive' } })),
        }
      : {}),
  };

  const [docs, total] = await Promise.all([
    prisma.media.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
    }),
    prisma.media.count({
      where,
    }),
  ]);

  return {
    docs,
    pagination: {
      page,
      limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export default {
  createMedia,
  getMedia,
  deleteMedia,
  queryMedia,
};
