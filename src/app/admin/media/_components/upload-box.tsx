import { CirclePlus, FileIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import CircularProgress from '@/components/ui/circular-progress';

import { cn, formatFileSize } from '@/lib/utils';

import { useUploadFiles } from './use-media';

const UploadFiles = ({
  file,
  isUploading,
  progress = 0,
  onCancel,
  isUploaded,
  error,
}: {
  file: File;
  isUploading?: boolean;
  progress?: number;
  onCancel?: () => void;
  isUploaded?: boolean;
  error?: string;
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  return (
    <div className="flex items-center gap-3 rounded-md border p-2">
      {preview ? (
        <Image
          src={preview}
          width={50}
          height={50}
          className="size-10 min-w-10 rounded-md object-cover"
          alt="Preview"
        />
      ) : (
        <div className="flex size-10 min-w-10 items-center justify-center rounded-md bg-gray-200 text-gray-500">
          <span className="text-xl">
            <FileIcon className="size-4" />
          </span>
        </div>
      )}
      <div>
        <div className="max-w-[100px] truncate font-medium sm:max-w-[200px]">{file.name}</div>
        <div className="text-xs">
          {error ? (
            <p className="text-destructive truncate">{error}</p>
          ) : (
            <p className="text-muted-foreground font-medium">{formatFileSize(file.size)}</p>
          )}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {isUploading ? (
          <CircularProgress
            value={progress}
            size={40}
            strokeWidth={3}
            labelClassName="text-[10px]"
          />
        ) : (
          <p
            className={cn('rounded-sm border border-dashed px-1 py-0.5 text-xs font-medium', {
              'border-success/40 text-success': isUploaded,
              'border-destructive/40 text-destructive': error,
            })}
          >
            {isUploaded ? 'Uploaded' : error ? 'Error' : 'In queue'}
          </p>
        )}
        <Button className="size-7" variant="ghost" onClick={onCancel}>
          <XIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
};

const UploadBox = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { files, addFiles, cancelUpload, progress, isUploading, uploadingId } = useUploadFiles();

  return (
    <div className="mt-3">
      <div
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) {
            addFiles(Array.from(e.dataTransfer.files));
            setIsDragOver(false);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={cn(
          'border-foreground/20 relative flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-4 transition',
          {
            'border-primary': isDragOver,
          },
        )}
      >
        <label
          htmlFor="file"
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2"
        >
          <CirclePlus className="text-muted-foreground size-7" />
          <span className="text-muted-foreground text-sm">
            Drag and drop or click to choose files.
          </span>
        </label>
        <input
          id="file"
          onChange={(e) => {
            if (e.target.files) {
              addFiles(Array.from(e.target.files));
            }
          }}
          type="file"
          className="hidden"
          multiple
        />
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file) => (
            <UploadFiles
              key={file.id}
              file={file.file}
              isUploading={isUploading && uploadingId === file.id}
              progress={progress}
              onCancel={() => cancelUpload(file.id)}
              isUploaded={file.isUploaded}
              error={file.error}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadBox;
