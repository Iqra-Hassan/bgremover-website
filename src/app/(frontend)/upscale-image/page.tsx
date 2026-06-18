import React from 'react';
import Faqs from '../_components/faqs';
import Testimonials from '../_components/testimonials';
import HeroSection from '../_components/hero-section';
import Features from '../_components/features';
import planService from '@/server/plans/plan-service';
import UpscaleImage from '../_components/hero-section/upscale-image';

const features = [
  {
    title: 'Instantly Upscale Images',
    description:
      'Say goodbye to tedious editing. Our AI-powered tool automatically upscale images in seconds. Perfect for e-commerce, marketing, and profile pics.',
    src: '/images/upscale-image.webp',
    type: 'image',
  },
  {
    title: 'High-Quality Results, Every Time',
    description:
      'We maintain the original image quality while delivering clean, precise edges — whether it’s hair, fur, or fine details. Get professional results with zero effort. Get professional results with zero effort.',
    src: '/videos/upscale-video.mp4',
    type: 'video',
  },
];

const Page = async () => {
  const plans = await planService.getPublicPlans();

  return (
    <>
      <HeroSection
        title="Upscale Image"
        description="Upscale images in seconds with our AI-powered image upscaler. No design skills needed!"
      >
        <UpscaleImage plans={plans} />
      </HeroSection>
      <Features features={features} />
      <Testimonials />
      <Faqs />
    </>
  );
};

export default Page;
