'use client';

import React from 'react';
import PricingCard from './pricing-card';
import { Plan } from '@prisma/client';

const PricingGrid = ({ plans }: { plans: Plan[] }) => {
  return (
    <div className="py-6 md:py-10">
      <div className="container">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
            Pricing
          </div>
          <h1 className="text-2xl font-semibold md:text-3xl">Choose your plan</h1>
        </div>
        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] justify-center gap-5 md:mt-12">
          {plans
            .sort((a, b) => a.order - b.order)
            .map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default PricingGrid;
