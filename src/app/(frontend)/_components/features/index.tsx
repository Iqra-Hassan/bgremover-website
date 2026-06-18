import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type Feature = {
  title: string;
  description: string;
  src: string;
  type: string;
};

const Features = ({ features }: { features: Feature[] }) => {
  return (
    <div className="py-14 md:py-20">
      <div className="container !max-w-6xl space-y-16 md:space-y-30">
        {features.map((feature, index) => (
          <div
            className={cn(
              'flex flex-col-reverse',
              index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row',
            )}
            key={feature.title}
          >
            <div
              className={cn('flex w-full flex-col justify-center pt-10 md:w-1/2 md:pt-0 md:pr-10', {
                'md:pr-0 md:pl-10': index % 2 === 0,
              })}
            >
              <h2 className="text-xl font-semibold md:text-2xl">{feature.title}</h2>
              <p className="text-muted-foreground mt-3 text-base md:mt-6 md:text-lg">
                {feature.description}
              </p>
              <Button asChild variant="link" className="mt-4 w-fit !pl-0">
                <Link href="/">
                  Try it now
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="w-full md:w-1/2">
              {feature.type === 'video' ? (
                <video
                  src={feature.src}
                  className="w-full rounded-3xl object-contain"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={feature.src}
                  alt={feature.title}
                  width={1000}
                  height={1000}
                  className="w-full rounded-3xl object-contain"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
