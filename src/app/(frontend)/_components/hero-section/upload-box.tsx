import { Button } from '@/components/ui/button';
import { allowedImageTypes } from '@/data/constans';
import { cn } from '@/lib/utils';
import { PlusIcon } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

const UploadBox = ({ onChange }: { onChange: (file: File) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      e.target.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (allowedImageTypes.includes(file.type)) {
        onChange(file);
      } else {
        toast.error('Please upload an image');
      }
    }
  };

  return (
    <div className="mx-auto max-w-[600px]">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'border-card bg-card dark:border-input relative mx-auto flex h-[300px] w-full max-w-[600px] flex-col items-center justify-center gap-5 rounded-2xl border-2 bg-[repeating-conic-gradient(var(--accent)_0_25%,transparent_0_50%)] bg-[length:20px_20px] shadow-xl sm:h-[450px]',
          {
            'border-primary/20': isDragging,
          },
        )}
      >
        <Button asChild size="lg" className="h-12 rounded-xl px-4 font-semibold">
          <label htmlFor="file-upload">
            <div className="bg-accent/10 rounded-full p-1">
              <PlusIcon className="stroke-[3px]" />
            </div>
            Start from a photo
          </label>
        </Button>
        <input
          type="file"
          id="file-upload"
          accept={allowedImageTypes.join(',')}
          onChange={handleChange}
          className="hidden"
        />
        <p className="font-semibold">Or drop an image here</p>
      </div>
      <div className="mx-auto mt-10 flex max-w-[400px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground mt-3 text-xs">
          By uploading an image you agree to our{' '}
          <a className="text-primary font-semibold hover:underline" href="/terms-of-service">
            Terms of Service
          </a>
          . For more details on processing and your rights, check our{' '}
          <a className="text-primary font-semibold hover:underline" href="/privacy-policy">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default UploadBox;
