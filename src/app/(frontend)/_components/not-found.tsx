import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="container flex min-h-[calc(100vh-330px)] flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground mt-4 text-lg">
        Sorry, the page you are looking for does not exist.
      </p>
      <Button variant="outline" size="lg" className="mt-6" asChild>
        <Link href="/">Go to Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
