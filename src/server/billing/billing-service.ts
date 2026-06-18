import { z } from 'zod';

import billingSchema from './billing-schema';
import paymentService from '@/lib/services/payment-service';
import { Context, Env } from 'hono';

import prisma from '@/lib/prisma';
import { BillingProvider } from '@/data/constans';
import APIError from '@/lib/api-error';
import { PaymentStatus, Prisma } from '@prisma/client';

const createCheckout = async (
  body: z.infer<typeof billingSchema.createCheckoutSchema>,
  userId: string,
) => {
  const { planId } = body;

  const plan = await prisma.plan.findFirst({
    where: { id: planId },
  });

  if (!plan) {
    throw new APIError('Plan not found');
  }

  const checkout = await paymentService.createCheckout({
    plan,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    userId,
  });

  return checkout;
};

const handleWebhook = async (c: Context<Env, string>, provider: BillingProvider) => {
  const result = await paymentService.handleWebhook(c, provider);

  return result;
};

const getPayments = async (query: z.infer<typeof billingSchema.paymentsQuerySchema>) => {
  const { page, limit, sort, order, status } = query;

  const where: Prisma.PaymentWhereInput = {
    ...(status ? { status: { in: status.split(',') as PaymentStatus[] } } : {}),
  };

  const [docs, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        user: true,
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
    }),
    prisma.payment.count({
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
  createCheckout,
  handleWebhook,
  getPayments,
};
