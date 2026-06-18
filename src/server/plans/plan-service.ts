import { z } from 'zod';
import httpStatus from 'http-status';
import APIError from '@/lib/api-error';

import prisma from '@/lib/prisma';

import planSchema from './plan-schema';
import { Prisma } from '@prisma/client';

const getPlan = async (id: string) => {
  const result = await prisma.plan.findFirst({
    where: { id },
  });

  if (!result) {
    throw new APIError('Plan not found', httpStatus.NOT_FOUND);
  }

  return result;
};

const createPlan = async (data: z.infer<typeof planSchema.createPlanSchema>) => {
  const plan = await prisma.plan.create({
    data,
  });

  return plan;
};

const updatePlan = async (id: string, data: z.infer<typeof planSchema.updatePlanSchema>) => {
  const plan = await prisma.plan.update({
    where: { id },
    data,
  });

  return plan;
};

const deletePlan = async (body: z.infer<typeof planSchema.deletePlanSchema>) => {
  const plans = await prisma.plan.deleteMany({
    where: {
      id: { in: body.ids },
    },
  });

  return plans;
};

const queryPlans = async (query: z.infer<typeof planSchema.planQuerySchema>) => {
  const { page, limit, search, sort, order } = query;

  const where: Prisma.PlanWhereInput = {
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    }),
  };

  const [docs, total] = await Promise.all([
    prisma.plan.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
    }),
    prisma.plan.count({
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

const getPublicPlans = async () => {
  const plans = await prisma.plan.findMany({
    where: {
      status: 'active',
    },
  });

  return plans;
};

export default {
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  queryPlans,
  getPublicPlans,
};
