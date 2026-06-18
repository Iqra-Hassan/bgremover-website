import { SearchIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

const SearchFilter = ({
  onChange,
  debounceTime = 500,
  className,
}: {
  onChange: (value: string) => void;
  debounceTime?: number;
  className?: string;
}) => {
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebounce(value, debounceTime);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue]);

  return (
    <div className={cn('relative flex w-full max-w-[350px] items-center', className)}>
      <SearchIcon className="text-muted-foreground/70 absolute left-3 size-4" />
      <span className="sr-only">Search</span>
      <Input
        type="search"
        placeholder="Search..."
        className="h-9 pl-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default SearchFilter;
