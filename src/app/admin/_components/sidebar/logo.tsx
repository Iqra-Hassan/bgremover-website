'use client';

import { useSettings } from '@/components/settings-provider';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { cn } from '@/lib/utils';

const Logo = ({ href, className }: { href?: string; className?: string; iconOnly?: boolean }) => {
  const settings = useSettings();
  const applicationName = settings?.general?.applicationName;
  const logo = settings?.general?.logo;
  const logoDark = settings?.general?.logoDark;

  return (
    <Link
      href={href || '/'}
      className={cn('flex items-center justify-start text-xl font-semibold', className)}
    >
      {logo ? (
        <>
          <Image
            className={cn('h-8 w-auto object-contain dark:hidden')}
            src={logo}
            alt={applicationName || ''}
            unoptimized
            height={100}
            width={300}
          />
          <Image
            className={cn('hidden h-8 w-auto object-contain dark:block')}
            src={logoDark || logo}
            alt={applicationName || ''}
            unoptimized
            height={100}
            width={300}
          />
        </>
      ) : (
        <span className="block">{applicationName || 'Logo'}</span>
      )}
    </Link>
  );
};

export default Logo;
