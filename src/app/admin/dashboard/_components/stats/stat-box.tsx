import { Loader } from 'lucide-react';
import React from 'react';

const StatBox = ({
  icon,
  name,
  value,
  isLoading,
}: {
  icon: React.ReactNode;
  name: string;
  value: string | number;
  isLoading?: boolean;
}) => {
  return (
    <div className="from-accent text-card-foreground rounded-3xl border bg-gradient-to-t to-transparent">
      <div className="flex flex-row items-center justify-between space-y-0 p-6">
        {isLoading ? (
          <Loader className="animate-spin" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg [&>svg]:!size-4">
          {icon}
        </div>
      </div>
      <div className="rounded-br-xl rounded-bl-xl border-t p-4">
        <h3 className="text-muted-foreground text-xs font-medium">{name}</h3>
      </div>
    </div>
  );
};

export default StatBox;
