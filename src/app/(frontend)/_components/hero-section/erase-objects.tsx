'use client';

import React from 'react';
import UploadBox from './upload-box';
import { useEraser } from './use-eraser';
import ImagePreview from './image-preview';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn, downloadImage } from '@/lib/utils';
import { BrushIcon, EraserIcon, SparklesIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import LoginForm from '@/app/(auth)/login/_components/login-form';
import PricingGrid from '../../pricing/_components/pricing-grid';
import { Plan } from '@prisma/client';

const EraseObjects = ({ plans }: { plans: Plan[] }) => {
  const {
    setFile,
    previewImage,
    tool,
    setTool,
    brushSize,
    setBrushSize,
    superErase,
    setSuperErase,
    setMask,
    handleStartOver,
    handleRemoveObject,
    mask,
    isLoading,
    progress,
    resultImage,
    openLoginDialog,
    setOpenLoginDialog,
    showPricing,
    setShowPricing,
  } = useEraser();

  return (
    <div className="mx-auto mt-14">
      {previewImage ? (
        <div className="bg-accent flex flex-col rounded-4xl p-2 md:h-[500px] md:flex-row">
          <ImagePreview
            image={previewImage}
            tool={tool}
            brushSize={brushSize}
            onChangeMask={setMask}
            isLoading={isLoading}
          />
          <div className="bg-background flex w-full flex-col items-start gap-6 rounded-[24px] p-6 md:w-[40%]">
            <h2 className="text-xl font-semibold">Remove Objects</h2>
            <div className="bg-accent flex rounded-lg p-1">
              <Button
                className={cn('h-8 w-9', {
                  '!bg-card shadow-md': tool === 'brush',
                })}
                variant="ghost"
                onClick={() => setTool('brush')}
              >
                <BrushIcon />
              </Button>
              <Button
                className={cn('h-8 w-9', {
                  '!bg-card shadow-md': tool === 'eraser',
                })}
                variant="ghost"
                onClick={() => setTool('eraser')}
              >
                <EraserIcon />
              </Button>
            </div>
            <div className="w-full">
              <Label className="mb-4">{tool === 'brush' ? 'Brush Size' : 'Eraser Size'}</Label>
              <Slider value={[brushSize]} onValueChange={(value) => setBrushSize(value[0])} />
            </div>
            <div className="mt-4 flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="super-erase">Super Erase</Label>
                <div className="rounded-full bg-gradient-to-r from-indigo-600 to-pink-600 px-2 py-0.5 text-xs font-semibold text-white">
                  Pro
                </div>
              </div>
              <Switch id="super-erase" checked={superErase} onCheckedChange={setSuperErase} />
            </div>

            <div className="mt-auto w-full pt-4">
              {resultImage && !isLoading && (
                <Button
                  className="bg-success hover:bg-success/90 border-success mt-auto mb-4 w-full rounded-full"
                  size="lg"
                  onClick={() => downloadImage(resultImage)}
                >
                  Download
                </Button>
              )}
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
                <Button
                  isLoading={isLoading}
                  size="lg"
                  disabled={!previewImage || !mask}
                  className="flex-1 rounded-full"
                  onClick={handleRemoveObject}
                >
                  {!isLoading && <SparklesIcon />}
                  {isLoading
                    ? progress < 100
                      ? `Uploading... ${progress}%`
                      : 'Processing...'
                    : 'Remove'}
                </Button>
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

export default EraseObjects;
