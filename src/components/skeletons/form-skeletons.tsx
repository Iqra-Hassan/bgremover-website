import React from 'react';

import { Skeleton } from '../ui/skeleton';

export const FormInputSkeletons = () => {
  return (
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-24 rounded-sm" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
};

export const FormTextareaSkeletons = () => {
  return (
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-24 rounded-sm" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
};
