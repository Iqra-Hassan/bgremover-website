'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleTheme } from './toggle-theme';

const AppearanceSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of your application. You can change themes and languages here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ToggleTheme />
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
