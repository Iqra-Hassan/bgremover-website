import React from 'react';
import Faqs from './_components/faqs';
import Testimonials from './_components/testimonials';
import HeroSection from './_components/hero-section';
import Features from './_components/features';
import planService from '@/server/plans/plan-service';
import RemoveBg from './_components/hero-section/remove-bg';

const features = [
  {
    title: 'Instantly Remove Backgrounds',
    description:
      'Say goodbye to tedious editing. Our AI-powered tool automatically detects and removes backgrounds from your images in seconds. Perfect for e-commerce, marketing, and profile pics.',
    src: '/images/background-remover-image-1.webp',
    type: 'image',
  },
  {
    title: 'High-Quality Results, Every Time',
    description:
      'We maintain the original image quality while delivering clean, precise edges — whether it’s hair, fur, or fine details. Get professional results with zero effort.',
    src: '/images/background-remover-image-2.jpeg',
    type: 'image',
  },
];

const Page = async () => {
  const plans = await planService.getPublicPlans();

  return (
    <>
      <HeroSection
        title="Background Remover"
        description="Remove backgrounds from images in seconds with our AI-powered background remover. No design skills needed!"
      >
        <RemoveBg plans={plans} />
      </HeroSection>
      <Features features={features} />
      <Testimonials />
      <Faqs />
    </>
  );
};

export default Page;
