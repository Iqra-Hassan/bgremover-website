'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      closeButton
      duration={3000}
      toastOptions={{
        classNames: {
          toast: '!bg-foreground !text-background !rounded-2xl !border !border-background/20',
          error: '[&_[data-icon]]:!text-red-400 dark:[&_[data-icon]]:!text-red-600',
          success: '[&_[data-icon]]:!text-green-400 dark:[&_[data-icon]]:!text-green-600',
          closeButton:
            '!right-4 !left-auto !top-1/2 !-translate-y-[50%] !transform-none !bg-accent/10 !text-background !border !border-border/30',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
