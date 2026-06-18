'use client';

import React from 'react';
import UploadBox from './upload-box';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { downloadImage } from '@/lib/utils';
import { SparklesIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import LoginForm from '@/app/(auth)/login/_components/login-form';
import PricingGrid from '../../pricing/_components/pricing-grid';
import { Plan } from '@prisma/client';
import { useRemoveBg } from './use-remove-bg';

const RemoveBg = ({ plans }: { plans: Plan[] }) => {
  const {
    setFile,
    previewImage,
    superErase,
    setSuperErase,
    handleStartOver,
    handleRemoveObject,
    isLoading,
    progress,
    resultImage,
    openLoginDialog,
    setOpenLoginDialog,
    showPricing,
    setShowPricing,
  } = useRemoveBg();

  return (
    <div className="mx-auto mt-14">
      {previewImage ? (
        <div className="bg-accent flex flex-col rounded-4xl p-2 md:h-[500px] md:flex-row">
          <div className="relative flex max-h-[500px] min-h-[300px] w-full items-center justify-center p-2 md:h-full md:max-h-full md:min-h-0 md:w-[60%] md:px-2 md:py-0">
            <img src={previewImage} alt="image" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="bg-background flex w-full flex-col items-start gap-6 rounded-[24px] p-6 md:w-[40%]">
            <h2 className="text-xl font-semibold">Remove Background</h2>
            <div className="mt-4 flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="super-erase">Super Remove</Label>
                <div className="rounded-full bg-gradient-to-r from-indigo-600 to-pink-600 px-2 py-0.5 text-xs font-semibold text-white">
                  Pro
                </div>
              </div>
              <Switch id="super-erase" checked={superErase} onCheckedChange={setSuperErase} />
            </div>

            <div className="mt-auto w-full pt-4">
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 rounded-full"
                  disabled={isLoading}
                  onClick={handleStartOver}
                >
                  Start Over
                </Button>
                {resultImage && !isLoading ? (
                  <Button
                    className="bg-success hover:bg-success/90 border-success mt-auto mb-4 flex-1 rounded-full"
                    size="lg"
                    onClick={() => downloadImage(resultImage)}
                  >
                    Download
                  </Button>
                ) : (
                  <Button
                    isLoading={isLoading}
                    size="lg"
                    disabled={!previewImage}
                    className="flex-1 rounded-full"
                    onClick={handleRemoveObject}
                  >
                    {!isLoading && <SparklesIcon />}
                    {isLoading
                      ? progress < 100
                        ? `Uploading... ${progress}%`
                        : 'Processing...'
                      : 'Erase'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <UploadBox onChange={setFile} />
      )}
      <Dialog open={openLoginDialog} onOpenChange={setOpenLoginDialog}>
        <DialogContent className="overflow-y-auto sm:max-w-md sm:p-8">
          <DialogHeader className="hidden">
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <LoginForm onSuccess={() => setOpenLoginDialog(false)} />
        </DialogContent>
      </Dialog>
      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="overflow-y-auto sm:max-w-6xl">
          <DialogHeader className="hidden">
            <DialogTitle>Pricing</DialogTitle>
          </DialogHeader>
          <PricingGrid plans={plans} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RemoveBg;
