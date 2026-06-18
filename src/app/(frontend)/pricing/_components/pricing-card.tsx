import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, getCurrencySymbol } from '@/lib/utils';
import NumberFlow from '@number-flow/react';
import { Plan } from '@prisma/client';
import { CheckIcon } from 'lucide-react';
import React from 'react';
import { usePricing } from './use-pricing';
import { useRouter } from 'nextjs-toploader/app';
import { useAuth } from '@/components/auth-provider';

const PricingCard = ({ plan }: { plan: Plan }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedPlan, setSelectedPlan, checkout, isLoadingCheckout } = usePricing();

  return (
    <div
      className={cn('bg-muted flex w-full flex-col rounded-xl p-0.5', {
        'bg-primary/10': plan.isPopular,
      })}
    >
      <h3 className="flex items-center gap-2 px-5 py-3 text-lg font-medium">
        {plan.name}
        {plan.isPopular && (
          <Badge className="rounded-full bg-yellow-900 px-1 py-0.5 text-xs text-white">
            🔥 Popular
          </Badge>
        )}
      </h3>
      <div className="bg-card flex-1 rounded-[14px] p-2">
        <p className="p-3 text-sm">{plan.description}</p>
        <div className="bg-muted/30 border-border/50 mt-3 rounded-xl border p-3">
          <div className="flex flex-col items-start">
            <NumberFlow
              format={{
                style: 'decimal',
                currency: 'USD',
                trailingZeroDisplay: 'stripIfInteger',
              }}
              prefix={getCurrencySymbol('USD')}
              value={plan.price ?? 0}
              className="text-3xl leading-[1] font-semibold"
            />
          </div>
          <Button
            onClick={() => {
              if (user) {
                setSelectedPlan(plan.id);
                checkout(plan.id);
              } else {
                router.push('/login');
              }
            }}
            disabled={isLoadingCheckout}
            isLoading={selectedPlan === plan.id && isLoadingCheckout}
            variant={plan.isPopular ? 'default' : 'outline'}
            className="mt-3 w-full"
          >
            Buy Now
          </Button>
        </div>
        <div className="mt-2 flex flex-col gap-2 p-3">
          <div className="flex items-start gap-2">
            <CheckIcon className="mt-1 size-3 [&_*]:stroke-[3]" />
            <p className="text-[13px] font-medium">
              <span className="text-primary">{plan.credits}</span> credits
            </p>
          </div>
          {(plan?.features as string[] | null)?.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckIcon className="mt-1 size-3 [&_*]:stroke-[3]" />
              <p className="text-[13px] font-medium">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
