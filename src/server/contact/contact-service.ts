import { z } from 'zod';
import httpStatus from 'http-status';
import APIError from '@/lib/api-error';

import prisma from '@/lib/prisma';

import contactSchema from './contact-schema';
import mailService from '@/lib/services/mail-service';
import settingService from '../settings/setting-service';
import { ContactStatus, Prisma } from '@prisma/client';

const getContact = async (id: string) => {
  const result = await prisma.contact.findFirst({
    where: { id },
  });

  if (!result) {
    throw new APIError('Contact message not found', httpStatus.NOT_FOUND);
  }

  return result;
};

const createContact = async (body: z.infer<typeof contactSchema.createContactSchema>) => {
  await prisma.contact.create({
    data: body,
  });

  try {
    const { mail } = await settingService.getSettings(['mail']);
    if (mail?.enableMail && mail.adminEmails?.length && mail.enableContactNotifications) {
      mailService
        .sendMail({
          to: mail.adminEmails,
          subject: 'New Contact Message',
          text: `
          Name: ${body.name}\n
          Email: ${body.email}\n
          Subject: ${body.subject}\n
          Message: ${body.message}
        `,
        })
        .catch((error) => {
          console.error(error);
        });
    }
  } catch (error) {
    console.error(error);
  }
};

const updateContact = async (
  id: string,
  body: z.infer<typeof contactSchema.updateContactSchema>,
) => {
  await prisma.contact.update({
    where: { id },
    data: body,
  });
};

const deleteContact = async (ids: string[]) => {
  const result = await prisma.contact.deleteMany({
    where: { id: { in: ids } },
  });

  return result;
};

const queryContacts = async (query: z.infer<typeof contactSchema.contactQuerySchema>) => {
  const { page, limit, search, sort, order, status } = query;

  const where: Prisma.ContactWhereInput = {
    ...(search ? { subject: { contains: search, mode: 'insensitive' } } : {}),
    ...(status ? { status: { in: status.split(',') as ContactStatus[] } } : {}),
  };

  const [docs, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
    }),
    prisma.contact.count({
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
  getContact,
  createContact,
  updateContact,
  deleteContact,
  queryContacts,
};
