'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
const items = [
  { value: 'light', label: 'Light', image: '/images/ui-light.png' },
  { value: 'dark', label: 'Dark', image: '/images/ui-dark.png' },
  { value: 'system', label: 'System', image: '/images/ui-system.png' },
];

function ToggleTheme() {
  const { setTheme: setNextTheme } = useTheme();
  const [theme, setTheme] = useState('');

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme') || 'system';
    setTheme(currentTheme);
  }, []);

  return (
    <fieldset className="max-w-[400px] space-y-4">
      <Label>Theme</Label>
      <RadioGroup
        className="flex gap-3"
        value={theme}
        onValueChange={(value) => {
          setTheme(value);
          setNextTheme(value);
        }}
      >
        {items.map((item) => (
          <label key={item.value} className="relative">
            <RadioGroupItem
              id={item.value}
              value={item.value}
              className="peer sr-only after:absolute after:inset-0"
            />
            <Image
              src={item.image}
              alt={item.label}
              width={88}
              height={70}
              className="border-input peer-[:focus-visible]:outline-ring/70 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent relative cursor-pointer overflow-hidden rounded-lg border shadow-sm shadow-black/5 outline-offset-2 transition-colors peer-data-[disabled]:cursor-not-allowed peer-data-[disabled]:opacity-50 peer-[:focus-visible]:outline-3"
            />
            <div className="mt-1 text-center text-xs font-medium">{item.label}</div>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

export { ToggleTheme };
