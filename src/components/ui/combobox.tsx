'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { cn } from '@/lib/utils';

export function Combobox({
  value,
  placeholder,
  onChange,
  options,
  children,
  optionsClassName,
  optionsSide,
}: {
  value?: string;
  placeholder?: string;
  onChange: (value?: string) => void;
  options: { label: string; value: string }[];
  children?: React.ReactNode;
  optionsClassName?: string;
  optionsSide?: 'start' | 'center' | 'end';
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            size="lg"
            className="w-full justify-between !bg-transparent !pr-2 font-normal active:scale-100"
          >
            <span>
              {value
                ? options.find((item) => item.value === value)?.label
                : placeholder || 'Select...'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-[var(--radix-popover-trigger-width)] p-0', optionsClassName)}
        align={optionsSide ?? 'center'}
      >
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn('h-4 w-4', value === item.value ? 'opacity-100' : 'opacity-0')}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
