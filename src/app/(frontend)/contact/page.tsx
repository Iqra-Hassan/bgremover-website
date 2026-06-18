import React from 'react';
import ContactForm from './_components/contact-form';
import Faqs from '../_components/faqs';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Contact - ${settings?.general?.applicationName || ''}`,
  };
}

const ContactPage = () => {
  return (
    <>
      <div className="py-14 md:py-20">
        <div className="container !max-w-2xl">
          <div className="flex flex-col items-center gap-1 text-center md:gap-3">
            <div className="bg-primary/10 text-primary mb-2 rounded-full px-3 py-1 text-xs font-medium md:mb-0">
              Contact
            </div>
            <h1 className="text-2xl font-semibold md:text-3xl">We&apos;re here to help you</h1>
            <p className="text-muted-foreground">
              We&apos;re here to help you with any questions you have.
            </p>
          </div>
          <ContactForm />
        </div>
      </div>
      <Faqs />
    </>
  );
};

export default ContactPage;
