'use client';

import { XIcon } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

type TagsInputProps = Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> & {
  value?: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
};

const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  ({ className, value = [], onChange, ...props }, ref) => {
    const [pendingDataPoint, setPendingDataPoint] = React.useState('');

    React.useEffect(() => {
      if (pendingDataPoint.includes(',')) {
        const newDataPoints = new Set([
          ...value,
          ...pendingDataPoint.split(',').map((chunk) => chunk.trim()),
        ]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint('');
      }
    }, [pendingDataPoint, onChange, value]);

    const addPendingDataPoint = () => {
      if (pendingDataPoint) {
        const newDataPoints = new Set([...value, pendingDataPoint]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint('');
      }
    };

    return (
      <div
        className={cn(
          'has-[:focus-visible]:border-ring has-[:focus-visible]:ring-ring/15 border-input bg-card flex min-h-10 w-full flex-wrap gap-2 rounded-lg border px-3 py-2 text-sm shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-50 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:outline-none',
          className,
        )}
      >
        {value.map((item) => (
          <Badge key={item} variant="secondary" className="pr-1.5">
            {item}
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 h-3 w-3"
              onClick={() => {
                onChange(value.filter((i) => i !== item));
              }}
            >
              <XIcon className="!w-3" />
            </Button>
          </Badge>
        ))}
        <input
          className="flex-1 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
          value={pendingDataPoint}
          onChange={(e) => setPendingDataPoint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addPendingDataPoint();
            } else if (e.key === 'Backspace' && pendingDataPoint.length === 0 && value.length > 0) {
              e.preventDefault();
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => addPendingDataPoint()}
          {...props}
          ref={ref}
        />
      </div>
    );
  },
);

TagsInput.displayName = 'TagsInput';

export { TagsInput };
