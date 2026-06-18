import { ListFilterIcon } from 'lucide-react';
import React from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { MultiSelect } from '../ui/multi-select';
import { Filter } from './types';

const TableFilters = ({ filters }: { filters: Filter[] }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative h-9">
          <ListFilterIcon />
          Filters
          {filters.some((filter) => filter.value.length > 0) && (
            <span className="bg-primary absolute top-0 right-0 -mt-1 -mr-1 flex h-2 w-2 items-center justify-center rounded-full text-xs text-white">
              <span className="bg-primary absolute inline-flex h-2 w-2 animate-ping rounded-full opacity-75"></span>
              <span className="bg-primary relative inline-flex h-2 w-2 rounded-full"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="space-y-4 p-5">
        <div>
          <h3 className="mb-1 text-lg font-bold">Filters</h3>
          <hr />
        </div>
        {filters.map((filter) => {
          if (filter.type === 'multi-select') {
            return (
              <div key={filter.key} className="space-y-2">
                <Label>{filter.label}</Label>
                <MultiSelect
                  value={filter.value}
                  placeholder={`Filter by ${filter.label.toLowerCase()}`}
                  onValueChange={filter.onFilter}
                  className="min-h-9 px-0"
                  options={filter.options}
                  maxCount={1}
                />
              </div>
            );
          }

          return null;
        })}
        {filters.some((filter) => filter.value.length > 0) && (
          <Button
            size="sm"
            onClick={() => {
              filters.forEach((filter) => {
                filter.onFilter([]);
              });
            }}
          >
            Clear Filters
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default TableFilters;
