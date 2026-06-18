import React from 'react';

import { FormInputSkeletons } from '@/components/skeletons/form-skeletons';

const SettingsLoader = () => {
  return (
    <div className="flex w-full flex-col space-y-6">
      <FormInputSkeletons />
      <hr />
      <FormInputSkeletons />
      <hr />
      <FormInputSkeletons />
      <hr />
      <FormInputSkeletons />
      <hr />
      <FormInputSkeletons />
    </div>
  );
};

export default SettingsLoader;
