'use client';

import React from 'react';
import { SparklesIcon } from 'lucide-react';

const HeroSection = ({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="relative py-14 md:pt-20 md:pb-28">
      <div className="absolute -top-[30%] -left-[15%] -z-[1] aspect-square w-1/2 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 opacity-10 blur-3xl" />
      <div className="absolute -right-[15%] -bottom-[30%] -z-[1] aspect-square w-1/2 rounded-full bg-gradient-to-br from-blue-500 to-lime-500 opacity-10 blur-3xl" />
      <div className="container !max-w-5xl">
        <div className="flex flex-col items-center gap-3 text-center md:gap-4">
          <h1 className="text-3xl font-bold md:text-4xl">
            <SparklesIcon className="mr-2 inline size-8 md:size-10" /> {title}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default HeroSection;
