import { uploadService } from '../../lib/services/upload-service';
import userSchema from './user-schema';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import APIError from '@/lib/api-error';
import httpStatus from 'http-status';
import { allowedImageTypes } from '@/data/constans';
import { Prisma } from '@prisma/client';

const updateProfile = async (
  userId: string,
  body: z.infer<typeof userSchema.updateProfileSchema>,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new APIError('User not found', httpStatus.NOT_FOUND);
  }

  let avatar = null;
  if (body.image) {
    // delete old avatar
    if (user.image) {
      await uploadService.deleteMediaByUrl(user.image);
    }

    // upload new avatar
    const imageResult = await uploadService.upload({
      fileName: body.image.name,
      file: body.image,
      allowedTypes: allowedImageTypes,
    });

    avatar = imageResult.url;
  }

  // update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: body.name,
      image: avatar,
    },
  });
};

const getUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new APIError('User not found', httpStatus.NOT_FOUND);
  }

  return user;
};

const updateUser = async (userId: string, body: z.infer<typeof userSchema.updateUserSchema>) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new APIError('User not found', httpStatus.NOT_FOUND);
  }

  if (body.email && body.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new APIError('Email already in use', httpStatus.BAD_REQUEST);
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: body,
  });
};

const queryUsers = async (query: z.infer<typeof userSchema.userQuerySchema>) => {
  const { page, limit, search, sort, order } = query;

  const where: Prisma.UserWhereInput = {
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    }),
  };

  const [docs, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
    }),
    prisma.user.count({
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

const deleteUsers = async (ids: string[], userId: string) => {
  if (ids.includes(userId)) {
    throw new APIError('Cannot delete yourself', httpStatus.BAD_REQUEST);
  }

  await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });
};

const getUserCredits = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user?.credits || 0;
};

const getUserPayments = async (
  userId: string,
  query: z.infer<typeof userSchema.userPaymentsQuerySchema>,
) => {
  const { page, limit, sort, order } = query;

  const [docs, total] = await Promise.all([
    prisma.payment.findMany({
      where: {
        userId,
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
    }),
    prisma.payment.count({
      where: {
        userId,
      },
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

const queryHistory = async (
  query: z.infer<typeof userSchema.historyQuerySchema>,
  userId: string,
) => {
  const { page } = query;

  const limit = 6;

  const [docs, total] = await Promise.all([
    prisma.history.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.history.count({
      where: {
        userId,
        isDeleted: false,
      },
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

const deleteHistory = async (id: string, userId: string) => {
  try {
    const result = await prisma.history.update({
      where: {
        id,
        userId,
      },
      data: {
        isDeleted: true,
      },
    });
    await uploadService.deleteMediaByUrl(result.outputUrl);
    await uploadService.deleteMediaByUrl(result.inputUrl);
    if (result.maskUrl) {
      await uploadService.deleteMediaByUrl(result.maskUrl);
    }
  } catch {
    // ignore
  }
};

export default {
  updateProfile,
  getUser,
  updateUser,
  queryUsers,
  deleteUsers,
  getUserCredits,
  getUserPayments,
  queryHistory,
  deleteHistory,
};
