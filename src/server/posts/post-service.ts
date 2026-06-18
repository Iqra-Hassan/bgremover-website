import { z } from 'zod';
import httpStatus from 'http-status';
import APIError from '@/lib/api-error';

import prisma from '@/lib/prisma';

import postSchema from './post-schema';
import { slugify } from '@/lib/utils';
import { PostStatus, Prisma } from '@prisma/client';

const getPost = async (id: string) => {
  const result = await prisma.post.findFirst({
    where: { id },
  });

  if (!result) {
    throw new APIError('Post not found', httpStatus.NOT_FOUND);
  }

  return result;
};

const getPostBySlug = async (slug: string) => {
  const result = await prisma.post.findFirst({
    where: { slug },
  });

  return result;
};

const createPost = async (body: z.infer<typeof postSchema.createPostSchema>) => {
  const slug = slugify(body.title);

  const checkSlug = await prisma.post.findFirst({
    where: { slug },
  });

  if (checkSlug) {
    throw new APIError('Post with this title already exists', httpStatus.BAD_REQUEST);
  }

  const addPost = await prisma.post.create({
    data: {
      ...body,
      slug,
    },
  });

  return addPost;
};

const updatePost = async (id: string, body: z.infer<typeof postSchema.updatePostSchema>) => {
  const slug = slugify(body.title);

  const checkSlug = await prisma.post.findFirst({
    where: { slug },
  });

  if (checkSlug && checkSlug.id !== id) {
    throw new APIError('Post with this title already exists', httpStatus.BAD_REQUEST);
  }

  const updatePost = await prisma.post.update({
    where: { id },
    data: {
      ...body,
      slug,
    },
  });

  return updatePost;
};

const deletePost = async (ids: string[]) => {
  await prisma.post.deleteMany({
    where: { id: { in: ids } },
  });
};

const queryPosts = async (query: z.infer<typeof postSchema.postQuerySchema>) => {
  const { page, limit, search, sort, order, status } = query;

  const where: Prisma.PostWhereInput = {
    ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    ...(status ? { status: { in: status.split(',') as PostStatus[] } } : {}),
  };

  const [docs, total] = await Promise.all([
    prisma.post.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
    }),
    prisma.post.count({
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
  getPost,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  queryPosts,
};
