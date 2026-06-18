import React from 'react';
import { Media } from './use-media';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import { formatFileSize } from '@/lib/utils';
import CopyButton from '@/components/ui/copy-button';

const PreviewMediaDialog = ({
  media,
  open,
  onClose,
}: {
  media: Media | null;
  open: boolean;
  onClose: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="min-h-[300px] w-auto max-w-[calc(100vw-30px)] min-w-[350px] gap-0 overflow-hidden border-0 p-0 sm:min-w-[400px] md:max-w-[700px] lg:max-w-[1000px]"
      >
        <DialogTitle className="sr-only">Preview Media</DialogTitle>
        <div className="bg-accent flex flex-1 flex-col items-center justify-center">
          {media?.mimeType.startsWith('image/') ? (
            <img
              src={media?.url}
              alt={media?.fileName}
              className="block h-auto max-h-[calc(100svh-100px)] w-auto max-w-full object-contain"
            />
          ) : media?.mimeType.startsWith('video/') ? (
            <video
              src={media?.url}
              controls
              className="size-full max-h-[calc(100svh-100px)] object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-lg">{media?.fileName}</p>
              <p className="text-muted-foreground">{formatFileSize(media?.size || 0)}</p>
            </div>
          )}
        </div>
        <div className="flex h-[60px] items-center justify-between gap-4 rounded-br-xl rounded-bl-xl border p-4 py-3">
          <div className="flex items-center gap-2">
            <p className="max-w-[150px] truncate sm:max-w-[250px] md:max-w-[500px]">
              <a
                href={media?.url}
                className="text-accent-foreground/80 font-medium hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {media?.fileName}
              </a>
            </p>
            <CopyButton textToCopy={media?.url || ''} />
          </div>
          <Button variant="secondary" onClick={() => onClose(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewMediaDialog;
