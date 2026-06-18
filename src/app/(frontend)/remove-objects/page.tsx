import React from 'react';
import Faqs from '../_components/faqs';
import Testimonials from '../_components/testimonials';
import HeroSection from '../_components/hero-section';
import Features from '../_components/features';
import planService from '@/server/plans/plan-service';
import EraseObjects from '../_components/hero-section/erase-objects';

const features = [
  {
    title: 'Effortlessly remove unwanted objects with a single click.',
    description:
      'Eraseo uses advanced AI to automatically detect and erase distractions like people, logos, or clutter from your images. No manual masking or editing—just click and watch your image clean itself up in seconds.',
    src: '/images/background-remover-image-1.webp',
    type: 'video',
  },
  {
    title: 'Remove Unwanted Objects to Create Minimalist Masterpieces',
    description:
      'Eraseo helps you turn cluttered photos into clean, focused visuals by removing distracting elements. Highlight your subject, enhance visual appeal, and embrace simplicity with AI-powered precision—perfect for modern branding and aesthetic content.',
    src: '/images/background-remover-image-2.jpeg',
    type: 'video',
  },
  {
    title: 'Object Remover for Studio-Quality E-commerce Images',
    description:
      'Instantly remove unwanted props, shadows, or reflections from product shots to create clean, distraction-free backgrounds. Eraseo gives your product photos a professional studio look—perfect for marketplaces, catalogs, and ad creatives.',
    src: '/images/background-remover-image-3.jpeg',
    type: 'video',
  },
];

const Page = async () => {
  const plans = await planService.getPublicPlans();

  return (
    <>
      <HeroSection
        title="Remove Objects from your images"
        description="Easily remove unwanted objects, people, or text from your photos with the power of AI—no design skills or complex tools required."
      >
        <EraseObjects plans={plans} />
      </HeroSection>
      <Features features={features} />
      <Testimonials />
      <Faqs />
    </>
  );
};

export default Page;
